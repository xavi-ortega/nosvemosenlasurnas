<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class FeedbackConcurrencyTest extends TestCase
{
    public function test_four_writers_preserve_all_aggregate_updates_with_bounded_sqlite_waiting(): void
    {
        $database = tempnam(sys_get_temp_dir(), 'feedback-concurrency-');
        config(['database.connections.metrics.database' => $database]);
        (require database_path('migrations/2026_10_09_142259_create_feedback_counters.php'))->up();
        $this->assertSame('wal', DB::connection('metrics')->selectOne('PRAGMA journal_mode')->journal_mode);
        $processes = [];
        try {
            for ($i = 0; $i < 4; $i++) {
                $process = new Process([base_path('scripts/php'), base_path('tests/Fixtures/counter-writer.php')], base_path(), ['METRICS_DATABASE' => $database, 'DB_DATABASE' => ':memory:']);
                $process->setTimeout(15);
                $process->start();
                $processes[] = $process;
            }
            foreach ($processes as $process) {
                $process->wait();
                $this->assertSame(0, $process->getExitCode(), $process->getErrorOutput());
            }
            $this->assertSame(40, DB::connection('metrics')->table('feedback_counters')->sum('count'));
            $this->assertSame(40, DB::connection('metrics')->table('feedback_control')->value('week_count'));
            $this->assertSame(3, DB::connection('metrics')->table('feedback_counters')->count());
        } finally {
            foreach ($processes as $process) {
                $process->stop();
            }
            DB::purge('metrics');
            foreach ([$database, $database.'-wal', $database.'-shm'] as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }
    }
}
