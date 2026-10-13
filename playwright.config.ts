import { defineConfig, devices } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const iterationBytes = readFileSync('outputs/quiz-2023-second-iteration-bank.json');
const iterationHash = createHash('sha256').update(iterationBytes).digest('hex');
const iterationEvidenceDirectory = resolve('.tools/playwright/iteration-evidence', iterationHash);
const iterationPointer = Buffer.from(JSON.stringify({ sha256: iterationHash, kind: 'historical', withdrawn: [], history: [] }) + '\n');
mkdirSync(iterationEvidenceDirectory, { recursive: true });
for (const [filename, bytes] of [[iterationHash + '.json', iterationBytes], ['current.json', iterationPointer]] as const) {
    const path = resolve(iterationEvidenceDirectory, filename);
    if (existsSync(path)) {
        if (!readFileSync(path).equals(bytes)) throw new Error('The isolated browser evidence fixture has unexpected bytes.');
    } else {
        writeFileSync(path, bytes, { flag: 'wx' });
    }
}

export default defineConfig({
    testDir: './tests/Browser',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:8765',
        trace: 'off',
        screenshot: 'off',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    ],
    webServer: [
        {
            command: 'scripts/php artisan serve --host=127.0.0.1 --port=8765 --no-reload --no-interaction',
            url: 'http://127.0.0.1:8765',
            reuseExistingServer: false,
            env: { APP_ENV: 'testing', APP_DEBUG: 'false', CACHE_STORE: 'array', SESSION_DRIVER: 'array' },
            timeout: 30_000,
        },
        {
            command: 'scripts/php artisan serve --host=127.0.0.1 --port=8768 --no-reload --no-interaction',
            url: 'http://127.0.0.1:8768',
            reuseExistingServer: false,
            env: { APP_ENV: 'testing', APP_DEBUG: 'false', CACHE_STORE: 'array', SESSION_DRIVER: 'array', EVIDENCE_DIRECTORY: iterationEvidenceDirectory },
            timeout: 30_000,
        },
    ],
});
