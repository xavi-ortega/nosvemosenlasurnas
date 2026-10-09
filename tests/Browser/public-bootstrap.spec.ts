import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ locale: 'en-US', reducedMotion: 'reduce' });

for (const path of ['/', '/missing-page']) {
    test(`Spanish ${path} is accessible and loads only same-origin resources`, async ({ page, context, baseURL }) => {
        const externalRequests: string[] = [];
        page.on('request', request => {
            if (new URL(request.url()).origin !== new URL(baseURL!).origin) {
                externalRequests.push(request.url());
            }
        });
        const response = await page.goto(path);
        expect(response?.status()).toBe(path === '/' ? 200 : 404);
        expect(response?.headers()['content-language']).toBe('es');
        expect(response?.headers()['set-cookie']).toBeUndefined();
        await expect(page.locator('html')).toHaveAttribute('lang', 'es');
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
            path === '/' ? 'Tu voto merece contexto.' : 'No encontramos esta página.',
        );
        const accessibility = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(accessibility.violations).toEqual([]);
        expect(await context.cookies()).toEqual([]);
        expect(await page.evaluate(() => ({
            local: localStorage.length,
            session: sessionStorage.length,
        }))).toEqual({ local: 0, session: 0 });
        expect(externalRequests).toEqual([]);
        await expect(page.locator('body')).toBeVisible();
    });
}

test('error recovery works with a keyboard', async ({ page }) => {
    await page.goto('/missing-page');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Volver al inicio' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu voto merece contexto.');
});
