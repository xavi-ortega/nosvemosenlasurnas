import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync } from 'node:fs';

test.use({ reducedMotion: 'reduce' });
if (process.env.ITERATION_REAL_URL) test.use({ baseURL: process.env.ITERATION_REAL_URL });

for (const path of ['/', '/questionnaire', '/programmes', '/how-it-works', '/insights']) {
    test(`delayed ${path} uses an inert skeleton and keeps the page geometry`, async ({ page }, info) => {
        let release!: () => void;
        const pending = new Promise<void>(resolve => { release = resolve; });
        await page.route(path === '/insights' ? '**/api/feedback-report' : '**/api/bank', async route => { await pending; await route.continue(); });
        await page.addInitScript(() => {
            const state = window as typeof window & { loadingShifts: number[] }; state.loadingShifts = [];
            new PerformanceObserver(list => {
                for (const entry of list.getEntries()) {
                    const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
                    if (!shift.hadRecentInput) state.loadingShifts.push(shift.value);
                }
            }).observe({ type: 'layout-shift', buffered: true });
        });
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        const app = page.locator('#app');
        if (path === '/' && !await app.count()) {
            await expect(page.getByRole('heading', { name: 'Tu voto merece contexto.', exact: true })).toBeVisible();
            await expect(page.locator('.loading-skeleton')).toHaveCount(0); release(); return;
        }
        await expect(app).toHaveAttribute('aria-busy', 'true');
        await expect(app.locator('.skeleton-content')).toHaveAttribute('inert', '');
        await expect(app.getByRole('button')).toHaveCount(0);
        await expect(app.getByRole('status')).toHaveCSS('position', 'absolute');
        expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
        const before = await app.boundingBox(); const footer = await page.locator('.site-footer').boundingBox();
        if (process.env.LOADING_CAPTURE) {
            mkdirSync('.tools', { recursive: true });
            await page.screenshot({ path: `.tools/loading-${info.project.name}-${path.slice(1) || 'home'}.png`, animations: 'disabled' });
        }
        release();
        await expect(app).not.toHaveAttribute('aria-busy', 'true');
        await expect(app.locator('.loading-skeleton')).toHaveCount(0);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const after = await app.boundingBox(); const finalFooter = await page.locator('.site-footer').boundingBox();
        expect(after!.y).toBeCloseTo(before!.y, 0);
        expect(finalFooter!.y).toBeGreaterThanOrEqual(footer!.y - 1);
        expect(await page.evaluate(() => (window as typeof window & { loadingShifts: number[] }).loadingShifts.reduce((sum, value) => sum + value, 0))).toBeLessThan(0.001);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
}

test('a failed bank replaces the skeleton with usable recovery without collapsing the page', async ({ page }) => {
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/api/bank', async route => { await pending; await route.fulfill({ status: 503 }); });
    await page.goto('/questionnaire', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app')).toHaveAttribute('aria-busy', 'true');
    const footer = await page.locator('.site-footer').boundingBox();
    release();
    const retry = page.getByRole('button', { name: 'Volver a cargar', exact: true });
    await expect(retry).toBeEnabled(); await retry.focus(); await expect(retry).toBeFocused();
    await expect(page.locator('#app .loading-skeleton')).toHaveCount(0);
    expect((await page.locator('.site-footer').boundingBox())!.y).toBeCloseTo(footer!.y, 0);
});

test('source history reserves its own space while the rest of the sources stay available', async ({ page }) => {
    const pointer = JSON.parse(readFileSync('resources/evidence/current.json', 'utf8')) as { sha256: string };
    const bytes = readFileSync(`resources/evidence/${pointer.sha256}.json`);
    await page.route('**/api/bank', route => route.fulfill({ body: bytes, contentType: 'application/json', headers: { 'X-Evidence-Sha256': pointer.sha256 } }));
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/api/release-history', async route => { await pending; await route.fulfill({ status: 503 }); });
    await page.goto('/sources');
    const history = page.getByRole('heading', { name: 'Historial de cambios y retiradas', exact: true }).locator('..');
    await expect(history.locator('.loading-skeleton')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Candidatura ficticia Alba', exact: true })).toBeVisible();
    const before = await history.boundingBox();
    release();
    await expect(history).toContainText('No hemos podido cargar el historial');
    await expect(history.locator('.loading-skeleton')).toHaveCount(0);
    expect((await history.boundingBox())!.height).toBeCloseTo(before!.height, 0);
});
