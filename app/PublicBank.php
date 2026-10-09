<?php

namespace App;

use RuntimeException;

class PublicBank
{
    /** @return array{sha256: string, kind: string, withdrawn: list<string>, history: list<array<string, mixed>>} */
    public function state(): array
    {
        $path = resource_path('evidence/current.json');
        if (! is_file($path)) {
            throw new RuntimeException('Public evidence unavailable.');
        }
        $state = json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        if (! is_array($state) || ! preg_match('/\A[a-f0-9]{64}\z/', $state['sha256'] ?? '') || ! in_array($state['kind'] ?? null, ['current', 'synthetic', 'historical'], true) || ! is_array($state['withdrawn'] ?? null) || ! is_array($state['history'] ?? null)) {
            throw new RuntimeException('Invalid evidence pointer.');
        }
        if ($state['kind'] !== 'current' && ! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Current evidence unavailable.');
        }

        return $state;
    }

    public function bytes(): string
    {
        $state = $this->state();
        if (in_array($state['sha256'], $state['withdrawn'], true)) {
            throw new RuntimeException('Evidence release withdrawn.');
        }
        $path = resource_path('evidence/'.$state['sha256'].'.json');
        $bytes = is_file($path) ? file_get_contents($path) : false;
        if (! is_string($bytes) || strlen($bytes) > 5 * 1024 * 1024 || ! hash_equals($state['sha256'], hash('sha256', $bytes))) {
            throw new RuntimeException('Evidence integrity failure.');
        }
        $bank = json_decode($bytes, true, flags: JSON_THROW_ON_ERROR);
        if (! is_array($bank) || ($bank['schemaVersion'] ?? null) !== 1 || ($bank['engineVersion'] ?? null) !== 'lean-fixed-budgets-v1' || ($bank['kind'] ?? null) !== $state['kind']) {
            throw new RuntimeException('Evidence version mismatch.');
        }

        return $bytes;
    }
}
