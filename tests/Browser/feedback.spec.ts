import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function enable(page: Page, path = 'feedback') {
    await page.route(`**/${path}`, async route => {
        const response = await route.fetch();
        await route.fulfill({ response, body: (await response.text()).replace('"enabled":false', '"enabled":true') });
    });
}
async function finish(page: Page) {
    await page.goto('/questionnaire');
    await page.getByLabel('Ámbito de comparación').selectOption('north');
    await page.getByRole('button', { name: 'Empezar las diez preguntas' }).click();
    for (let i = 0; i < 10; i++) {
        await page.getByRole('radio', { name: 'Muy de acuerdo', exact: true }).check();
        await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
}

test('disabled collection and refusal never post; feedback failure leaves the core available', async ({ page }) => {
    const posts: string[] = []; page.on('request', r => { if (r.method() === 'POST') posts.push(r.url()); });
    await page.goto('/feedback'); await expect(page.locator('#app')).toContainText('La recogida de valoraciones está desactivada');
    await expect(page.getByRole('button', { name: 'Enviar categoría aleatorizada' })).toHaveCount(0);
    await enable(page); await page.reload();
    await page.getByRole('button', { name: 'Enviar categoría aleatorizada' }).click();
    await expect(page.locator('#app')).toContainText('Elige una valoración y marca');
    await page.getByRole('button', { name: 'No participar' }).click();
    await expect(page.locator('#app')).toContainText('No has enviado ninguna valoración');
    expect(posts).toEqual([]);
    await page.getByRole('link', { name: 'Comparar programas', exact: true }).click();
    await expect(page.getByRole('table')).toBeVisible();
});

test('opt-in sends at most two bounded randomized reports without quiz fields, identifiers or retries', async ({ page, context }) => {
    await enable(page, 'questionnaire');
    const payloads: Record<string, unknown>[] = [];
    await page.route('**/api/feedback', async route => {
        payloads.push(route.request().postDataJSON());
        await route.fulfill({ status: payloads.length === 1 ? 202 : 503, json: { accepted: payloads.length === 1 } });
    });
    await finish(page);
    expect(payloads).toEqual([]);
    const fit = page.getByRole('heading', { name: '¿Las coincidencias mostradas encajan con tu valoración del resultado?' }).locator('..');
    await fit.getByRole('radio', { name: 'Sí, encajan', exact: true }).check();
    await fit.getByRole('button', { name: 'Enviar categoría aleatorizada' }).click();
    expect(payloads).toEqual([]);
    await fit.getByRole('checkbox').check(); await fit.getByRole('button', { name: 'Enviar categoría aleatorizada' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Categoría recibida' })).toBeVisible();
    const policy = page.getByRole('heading', { name: '¿Estás de acuerdo con esta propuesta pública elegida al azar?' }).locator('..');
    await policy.getByRole('radio', { name: 'De acuerdo', exact: true }).check();
    await policy.getByRole('checkbox').check(); await policy.getByRole('button', { name: 'Enviar categoría aleatorizada' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'No se ha podido confirmar el envío' })).toBeVisible();
    expect(payloads).toHaveLength(2);
    expect(Object.keys(payloads[0]).sort()).toEqual(['category', 'metricId', 'protocolVersion']);
    expect(Object.keys(payloads[1]).sort()).toEqual(['category', 'metricId', 'propositionId', 'protocolVersion', 'surveyVersion']);
    expect([0, 1, 2]).toContain(payloads[0].category); expect([0, 1, 2]).toContain(payloads[1].category);
    expect(JSON.stringify(payloads)).not.toContain('Alba'); expect(JSON.stringify(payloads)).not.toContain('north');
    await page.getByRole('button', { name: 'Revisar respuestas', exact: true }).click();
    await page.getByRole('button', { name: 'Volver al punto de decisión' }).click();
    await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
    await expect(page.getByRole('button', { name: 'Enviar categoría aleatorizada' })).toHaveCount(0);
    expect(payloads).toHaveLength(2);
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('independent public survey supports accessible mobile native consent and choices', async ({ page }) => {
    await enable(page); await page.goto('/feedback');
    await expect(page.getByRole('radio')).toHaveCount(3);
    await expect(page.getByRole('checkbox')).toHaveCount(1);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('radio', { name: 'De acuerdo', exact: true }).focus(); await page.keyboard.press('Space');
    await expect(page.getByRole('radio', { name: 'De acuerdo', exact: true })).toBeChecked();
});


test('static aggregate reports keep Spanish suppression and uncertainty visible', async ({ page, context }) => {
    await page.route('**/api/feedback-report', route => route.fulfill({ json: { notice: 'Aportaciones voluntarias, no personas únicas.', week: '2026-09-28', metrics: [{ id: 'housing-1', text: 'Aumentar la vivienda pública.', status: 'published', contributions: 10000, estimate: [0.2, 0.3, 0.5], intervals: [[0.17, 0.23], [0.27, 0.33], [0.47, 0.53]] }, { id: 'health-1', text: 'Reforzar la sanidad.', status: 'insufficient_contributions' }], topics: [{ topicId: 'housing', topicName: 'Vivienda', propositions: 2, coveredPropositions: 1, status: 'incomplete_coverage' }] } }));
    await page.goto('/insights');
    await expect(page.locator('#app')).toContainText('10.000');
    await expect(page.locator('#app')).toContainText('Intervalo de incertidumbre');
    await expect(page.locator('#app')).toContainText('Tema: Vivienda');
    await expect(page.locator('#app')).toContainText('Estimación no publicada');
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    expect(await context.cookies()).toEqual([]);
});
