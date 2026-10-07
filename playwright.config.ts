import { defineConfig, devices } from '@playwright/test';

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
    webServer: {
        command: 'scripts/php artisan serve --host=127.0.0.1 --port=8765 --no-reload --no-interaction',
        url: 'http://127.0.0.1:8765',
        reuseExistingServer: false,
        env: { APP_ENV: 'testing', APP_DEBUG: 'false', CACHE_STORE: 'array', SESSION_DRIVER: 'array' },
        timeout: 30_000,
    },
});
