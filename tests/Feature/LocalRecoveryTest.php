<?php

namespace Tests\Feature;

use Symfony\Component\Process\Process;
use Tests\TestCase;

class LocalRecoveryTest extends TestCase
{
    public function test_local_backup_restore_and_runtime_candidate_preserve_privacy_and_existing_data(): void
    {
        $process = new Process(['python3', base_path('tests/Fixtures/recovery_contract.py')], base_path());
        $process->setTimeout(45);
        $process->run();

        $this->assertSame(0, $process->getExitCode(), $process->getErrorOutput());
    }
}
