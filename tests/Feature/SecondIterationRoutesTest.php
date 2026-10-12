<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class SecondIterationRoutesTest extends TestCase
{
    public function test_second_iteration_routes_and_bank_are_stateless_and_local_only(): void
    {
        $directory = sys_get_temp_dir().'/iteration-routes-'.bin2hex(random_bytes(8));
        mkdir($directory, 0700);
        $bytes = (string) file_get_contents(base_path('outputs/quiz-2023-second-iteration-bank.json'));
        $sha = hash('sha256', $bytes);
        file_put_contents($directory.'/'.$sha.'.json', $bytes);
        file_put_contents($directory.'/current.json', json_encode(['sha256' => $sha, 'kind' => 'historical', 'withdrawn' => [], 'history' => []]));
        config(['evidence.directory' => $directory, 'session.driver' => 'database']);

        try {
            foreach (['/', '/questionnaire', '/programmes', '/how-it-works'] as $path) {
                $this->get($path)->assertOk()->assertHeaderMissing('Set-Cookie')
                    ->assertSee('Cuestionario 2023')->assertSee('Programas 2023')->assertSee('Cómo funciona');
            }
            $this->getJson('/api/bank')->assertOk()->assertHeader('X-Evidence-Sha256', $sha)
                ->assertHeaderMissing('Set-Cookie')->assertJsonPath('engineVersion', 'documented-affinity-v2')
                ->assertJsonCount(63, 'programmeProfiles')->assertJsonCount(20, 'starterQuestionIds');
            $this->app->detectEnvironment(fn (): string => 'production');
            $this->getJson('/api/bank')->assertServiceUnavailable()->assertHeaderMissing('Set-Cookie');
        } finally {
            File::deleteDirectory($directory);
        }
    }
}
