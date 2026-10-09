<?php

namespace Tests\Feature;

use App\FeedbackCatalog;
use App\FeedbackEstimator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class FeedbackReportTest extends TestCase
{
    public function test_known_counts_use_constrained_mle_and_simultaneous_wilson_intervals(): void
    {
        $estimator = new FeedbackEstimator;
        $report = $estimator->estimate([3000, 3000, 4000]);

        $this->assertSame('published', $report['status']);
        $this->assertEqualsWithDelta(0.5163953413738652, $report['estimate'][2], 1e-12);
        $this->assertEqualsWithDelta(0.4843570370454211, $report['intervals'][2][0], 1e-6);
        $this->assertEqualsWithDelta(0.5487482115798171, $report['intervals'][2][1], 1e-6);
        $this->assertEqualsWithDelta(2.39397979981851, $report['z'], 1e-5);
        $boundary = $estimator->estimate([1000, 4500, 4500]);
        $this->assertSame(0.0, $boundary['estimate'][0]);
        $this->assertLessThan(0, $boundary['inverse'][0]);
        $this->assertEqualsWithDelta(0.5, $boundary['estimate'][1], 1e-12);
        $this->assertSame('protocol_incompatible', $boundary['status']);
        $this->assertSame('insufficient_contributions', $estimator->estimate([100, 100, 100])['status']);
        $this->assertSame('uncertainty_too_wide', $estimator->estimate([200, 200, 200])['status']);
        $this->assertGreaterThan($report['z'], $estimator->estimate([3000, 3000, 4000], 2)['z']);
    }

    public function test_closed_snapshots_suppress_missing_topics_and_cannot_be_rewritten(): void
    {
        $directory = sys_get_temp_dir().'/feedback-report-'.bin2hex(random_bytes(8));
        mkdir($directory, 0700, true);
        $this->app->useStoragePath($directory.'/storage');
        config(['database.connections.metrics.database' => ':memory:']);
        (require database_path('migrations/2026_10_09_142259_create_feedback_counters.php'))->up();
        $this->travelTo(Carbon::parse('2026-10-09T12:00:00Z'));
        $survey = app(FeedbackCatalog::class)->survey();
        foreach ([3000, 3000, 4000] as $category => $count) {
            DB::connection('metrics')->table('feedback_counters')->insert(['week_start' => '2026-09-28', 'metric_id' => 'policy_agreement', 'survey_version' => $survey['version'], 'proposition_id' => $survey['propositions'][0]['id'], 'protocol_version' => FeedbackCatalog::Protocol, 'category' => $category, 'count' => $count]);
        }
        try {
            $this->artisan('feedback:report', ['week' => '2026-10-05', '--output' => $directory])->assertExitCode(1);
            $this->artisan('feedback:report', ['week' => '2026-09-29', '--output' => $directory])->assertExitCode(1);
            $this->artisan('feedback:report', ['week' => '2026-09-28', '--output' => $directory])->assertSuccessful();
            $bytes = file_get_contents($directory.'/2026-09-28.json');
            $snapshot = json_decode($bytes, true, flags: JSON_THROW_ON_ERROR);
            $this->assertSame('insufficient_contributions', $snapshot['metrics'][0]['status']);
            $this->assertArrayNotHasKey('contributions', $snapshot['metrics'][0]);
            $this->assertSame('published', $snapshot['metrics'][1]['status']);
            $this->assertContains('incomplete_coverage', array_column($snapshot['topics'], 'status'));
            $this->assertArrayNotHasKey('inverse', $snapshot['metrics'][1]);
            $this->assertFileExists($directory.'/storage/app/private/feedback-diagnostics/2026-09-28.json');
            $this->artisan('feedback:report', ['week' => '2026-09-28', '--output' => $directory])->assertSuccessful();
            DB::connection('metrics')->table('feedback_counters')->increment('count', 100);
            $this->artisan('feedback:report', ['week' => '2026-09-28', '--output' => $directory])->assertExitCode(1);
            $this->assertSame($bytes, file_get_contents($directory.'/2026-09-28.json'));
        } finally {
            File::deleteDirectory($directory);
        }
    }
}
