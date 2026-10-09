<?php

namespace Tests\Feature;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
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
}
