<?php

namespace Tests\Feature;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ReleaseApplicabilityTest extends TestCase
{
    public function test_expired_current_release_is_withheld_and_invalidates_a_pinned_session(): void
    {
        $directory = sys_get_temp_dir().'/release-applicability-'.bin2hex(random_bytes(8));
        mkdir($directory, 0700);
        config(['evidence.directory' => $directory.'/evidence']);
        mkdir($directory.'/evidence', 0700);
        $this->travelTo(Carbon::parse('2026-10-09T12:00:00Z'));
        $sha = str_repeat('a', 64);
        file_put_contents($directory.'/evidence/current.json', json_encode(['sha256' => $sha, 'kind' => 'current', 'validUntil' => '2026-10-08', 'withdrawn' => [], 'history' => []]));
        try {
            $this->get('/api/bank')->assertServiceUnavailable()->assertHeaderMissing('Set-Cookie');
            $this->getJson('/api/release-state')->assertOk()->assertJsonPath('withdrawn.0', $sha)->assertHeaderMissing('Set-Cookie');
            $this->getJson('/api/release-history?answers=private-fixture')->assertBadRequest()->assertDontSee('private-fixture');
        } finally {
            File::deleteDirectory($directory);
        }
    }

    public function test_finished_historical_2023_bank_is_hash_bound_and_stateless_in_production(): void
    {
        [$directory, $sha] = $this->historicalFixture(['releaseEligible' => true, 'draft' => false]);
        $this->app->detectEnvironment(fn (): string => 'production');
        config(['session.driver' => 'database']);

        try {
            $response = $this->getJson('/api/bank');
            $response->assertOk()->assertHeader('X-Evidence-Sha256', $sha)->assertHeader('Content-Language', 'es')
                ->assertHeaderMissing('Set-Cookie')->assertJsonPath('kind', 'historical')
                ->assertJsonPath('election.date', '2023-07-23');
            $this->assertSame($sha, hash('sha256', $response->getContent()));
            $this->get('/')->assertSee(__('public.historical'))->assertSee('2023-07-23');
        } finally {
            File::deleteDirectory($directory);
        }
    }

    /** @param array<string, mixed> $flags */
    #[DataProvider('unfinishedHistoricalFlags')]
    public function test_unfinished_historical_bank_state_and_history_return_503_in_production(array $flags): void
    {
        [$directory] = $this->historicalFixture($flags);
        $this->app->detectEnvironment(fn (): string => 'production');

        try {
            foreach (['/api/bank', '/api/release-state', '/api/release-history'] as $endpoint) {
                $this->getJson($endpoint)->assertServiceUnavailable()
                    ->assertExactJson(['error' => ['code' => 'unavailable']])->assertHeaderMissing('Set-Cookie');
            }
        } finally {
            File::deleteDirectory($directory);
        }
    }

    /** @return array<string, array{array<string, mixed>}> */
    public static function unfinishedHistoricalFlags(): array
    {
        return [
            'missing eligibility' => [['draft' => false]],
            'false eligibility' => [['releaseEligible' => false, 'draft' => false]],
            'numeric eligibility' => [['releaseEligible' => 1, 'draft' => false]],
            'missing draft status' => [['releaseEligible' => true]],
            'draft still true' => [['releaseEligible' => true, 'draft' => true]],
            'numeric draft status' => [['releaseEligible' => true, 'draft' => 0]],
        ];
    }

    public function test_historical_readiness_cannot_be_forged_by_changing_hash_bound_bytes(): void
    {
        [$directory, $sha] = $this->historicalFixture(['releaseEligible' => false, 'draft' => true]);
        $this->app->detectEnvironment(fn (): string => 'production');
        $path = $directory.'/'.$sha.'.json';
        $bank = json_decode((string) file_get_contents($path), true);
        $bank['releaseEligible'] = true;
        $bank['draft'] = false;
        file_put_contents($path, json_encode($bank));

        try {
            $this->getJson('/api/release-state')->assertServiceUnavailable()
                ->assertExactJson(['error' => ['code' => 'unavailable']]);
        } finally {
            File::deleteDirectory($directory);
        }
    }

    public function test_historical_release_history_only_expires_current_evidence(): void
    {
        $oldHistorical = str_repeat('b', 64);
        $oldCurrent = str_repeat('c', 64);
        $legacyCurrent = str_repeat('d', 64);
        [$directory, $sha] = $this->historicalFixture(['releaseEligible' => true, 'draft' => false], [
            'validUntil' => '2023-07-23',
            'history' => [
                ['sha256' => $oldHistorical, 'kind' => 'historical', 'validUntil' => '2023-07-23'],
                ['sha256' => $oldCurrent, 'kind' => 'current', 'validUntil' => '2026-10-08'],
                ['sha256' => $legacyCurrent, 'validUntil' => '2026-10-08'],
            ],
        ]);
        $this->app->detectEnvironment(fn (): string => 'production');
        $this->travelTo(Carbon::parse('2026-10-09T12:00:00Z'));

        try {
            $this->getJson('/api/release-state')->assertOk()
                ->assertExactJson(['sha256' => $sha, 'withdrawn' => [$oldCurrent, $legacyCurrent]]);
            $this->getJson('/api/bank')->assertOk();
        } finally {
            File::deleteDirectory($directory);
        }
    }

    public function test_explicit_historical_withdrawal_blocks_the_bank_and_invalidates_pinned_sessions(): void
    {
        [$directory, $sha] = $this->historicalFixture(['releaseEligible' => true, 'draft' => false]);
        $pointer = $directory.'/current.json';
        $state = json_decode((string) file_get_contents($pointer), true);
        $state['withdrawn'] = [$sha];
        file_put_contents($pointer, json_encode($state));
        $this->app->detectEnvironment(fn (): string => 'production');

        try {
            $this->getJson('/api/bank')->assertServiceUnavailable()
                ->assertExactJson(['error' => ['code' => 'unavailable']]);
            $this->getJson('/api/release-state')->assertOk()
                ->assertExactJson(['sha256' => $sha, 'withdrawn' => [$sha]]);
        } finally {
            File::deleteDirectory($directory);
        }
    }

    /**
     * @param  array<string, mixed>  $flags
     * @param  array<string, mixed>  $stateChanges
     * @return array{string, string}
     */
    private function historicalFixture(array $flags, array $stateChanges = []): array
    {
        $directory = sys_get_temp_dir().'/historical-release-'.bin2hex(random_bytes(8));
        mkdir($directory, 0700);
        $pointer = json_decode((string) file_get_contents(resource_path('evidence/current.json')), true);
        $bank = json_decode((string) file_get_contents(resource_path('evidence/'.$pointer['sha256'].'.json')), true);
        unset($bank['releaseEligible'], $bank['draft']);
        $bank = [...$bank, ...$flags, 'kind' => 'historical', 'asOf' => '2023-07-23'];
        $bank['election']['date'] = '2023-07-23';
        $bytes = json_encode($bank, JSON_THROW_ON_ERROR);
        $sha = hash('sha256', $bytes);
        file_put_contents($directory.'/'.$sha.'.json', $bytes);
        file_put_contents($directory.'/current.json', json_encode([
            'sha256' => $sha, 'kind' => 'historical', 'withdrawn' => [], 'history' => [], ...$stateChanges,
        ], JSON_THROW_ON_ERROR));
        config(['evidence.directory' => $directory]);

        return [$directory, $sha];
    }
}
