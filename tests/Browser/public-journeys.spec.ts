import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function start(page: Page, north = true) {
    await page.goto('/questionnaire');
    await expect(page.getByRole('button', { name: 'Empezar las diez preguntas' })).toBeVisible();
    if (north) await page.getByLabel('Ámbito de comparación').selectOption('north');
    await page.getByRole('button', { name: 'Empezar las diez preguntas' }).click();
}
async function answer(page: Page, count: number) {
    for (let i = 0; i < count; i++) {
        await page.getByRole('radio', { name: 'Muy de acuerdo', exact: true }).check();
        await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    }
}
async function hidden(page: Page) {
    await expect(page.locator('#app')).not.toContainText('Candidatura ficticia');
    await expect(page.getByRole('button', { name: 'Descargar mis resultados' })).toHaveCount(0);
    expect(await page.title()).not.toContain('Alba');
}

for (const path of ['/comparison', '/questionnaire', '/sources', '/privacy', '/method', '/accessibility']) {
    test(`Spanish ${path} supports reflow and accessible native controls`, async ({ page, context }) => {
        await page.goto(path);
        if (['/comparison', '/sources'].includes(path)) await expect(page.locator('#app')).toContainText('Candidatura ficticia Alba');
        if (path === '/questionnaire') await expect(page.getByRole('button', { name: 'Empezar las diez preguntas' })).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', 'es');
        expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(await context.cookies()).toEqual([]);
    });
}

test('ten-plus-five, exhaustion and deliberate finish preserve private request/DOM boundaries', async ({ page, context }) => {
    const requests: { url: string; method: string; body: string | null }[] = [];
    page.on('request', request => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
    await start(page); await hidden(page); await answer(page, 10); await hidden(page);
    await expect(page.locator('#app')).toContainText('Preguntas presentadas: 10');
    await page.getByRole('button', { name: 'Responder cinco más' }).click(); await answer(page, 5); await hidden(page);
    await expect(page.locator('#app')).toContainText('Preguntas presentadas: 15');
    await page.getByRole('button', { name: 'Responder cinco más' }).click(); await answer(page, 5);
    await page.getByRole('button', { name: 'Responder cinco más' }).click(); await hidden(page);
    await expect(page.locator('#app')).toContainText('Has llegado al final');
    await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
    await expect(page.getByRole('heading', { name: 'Tus coincidencias, con contexto' })).toBeVisible();
    await expect(page.locator('#app')).toContainText('Candidatura ficticia Alba');
    expect(requests.filter(r => r.method !== 'GET')).toEqual([]);
    expect(requests.filter(r => r.url.includes('/api/')).map(r => new URL(r.url).pathname)).toEqual(['/api/bank', '/api/release-state']);
    expect(requests.every(r => r.body === null && new URL(r.url).search === '')).toBe(true);
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('missing evidence yields partial comparisons without ranking; edits conceal results again', async ({ page }) => {
    await start(page, false); await answer(page, 10); await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
    await expect(page.locator('#app')).toContainText('Comparaciones parciales, sin clasificación');
    await expect(page.locator('#app')).toContainText('Candidatura ficticia sin programa');
    await page.getByRole('button', { name: 'Revisar respuestas', exact: true }).click(); await hidden(page);
    await page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true }).first().check();
    await page.getByRole('button', { name: 'Volver al punto de decisión' }).click(); await hidden(page);
    await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
    await expect(page.getByRole('heading', { name: 'Tus coincidencias, con contexto' })).toBeVisible();
});

test('local export is deliberate; reset, reload and leaving clear answers', async ({ page }) => {
    await start(page); await answer(page, 10); await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
    page.once('dialog', dialog => { expect(dialog.message()).toContain('respuestas políticas'); void dialog.accept(); });
    const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Descargar mis resultados' }).click();
    const exported = await download; expect(exported.suggestedFilename()).toBe('policy-overlap.json');
    const content = JSON.parse(await readFile((await exported.path())!, 'utf8'));
    expect(content.answerDetails).toHaveLength(10);
    expect(content.answerDetails[0].answerLabel).toBe('Muy de acuerdo');
    expect(content.candidacyDetails[0].name).toBe('Candidatura ficticia Alba');
    await page.getByRole('button', { name: 'Borrar respuestas y empezar de nuevo' }).click();
    await expect(page.getByRole('button', { name: 'Empezar las diez preguntas' })).toBeVisible(); await hidden(page);
    await page.getByRole('button', { name: 'Empezar las diez preguntas' }).click(); await answer(page, 1); await page.reload();
    await expect(page.getByRole('button', { name: 'Empezar las diez preguntas' })).toBeVisible();
    await page.getByRole('button', { name: 'Empezar las diez preguntas' }).click(); await answer(page, 1);
    await page.getByRole('link', { name: 'Privacidad', exact: true }).click(); await page.goBack();
    await expect(page.getByRole('button', { name: 'Empezar las diez preguntas' })).toBeVisible();
});

test('comparison filters locally and exposes exact context and evidence gaps', async ({ page }) => {
    const api: string[] = []; page.on('request', r => { if (r.url().includes('/api/')) api.push(r.url()); });
    await page.goto('/comparison'); await expect(page.getByRole('table')).toBeVisible();
    await page.getByLabel('Buscar una propuesta').fill('vivienda');
    await expect(page.getByRole('rowheader').first()).toContainText('vivienda');
    await page.getByLabel('Candidatura ficticia sin programa', { exact: true }).check();
    await expect(page.locator('#app')).toContainText('Sin evidencia suficiente');
    await page.getByText('Leer cita y contexto', { exact: true }).first().click();
    await expect(page.locator('blockquote').first()).toContainText('Aumentar la vivienda pública en alquiler.');
    expect(api.length).toBe(1);
});

test('corrupt bank hash fails closed with Spanish recovery and no questions', async ({ page }) => {
    await page.route('**/api/bank', route => route.fulfill({ status: 200, body: '{}', headers: { 'X-Evidence-Sha256': 'a'.repeat(64) } }));
    await page.goto('/questionnaire'); await expect(page.locator('#app')).toContainText('No hemos podido cargar esta edición');
    await expect(page.getByRole('radio')).toHaveCount(0);
});

test('withdrawal and release-state outage keep results concealed', async ({ page }) => {
    await start(page); await answer(page, 10);
    await page.route('**/api/release-state', async route => {
        const bank = await page.request.get('/api/bank');
        await route.fulfill({ json: { sha256: bank.headers()['x-evidence-sha256'], withdrawn: [bank.headers()['x-evidence-sha256']] } });
    });
    await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
    await expect(page.locator('#app')).toContainText('Esta edición se ha retirado'); await hidden(page);
    await page.unroute('**/api/release-state'); await page.route('**/api/release-state', route => route.fulfill({ status: 503, body: '{}' }));
    await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
    await expect(page.locator('#app')).toContainText('No hemos podido comprobar el estado'); await hidden(page);
});

test('quiz works through native keyboard answer controls', async ({ page }) => {
    await start(page); await page.getByRole('radio', { name: 'Muy de acuerdo', exact: true }).focus(); await page.keyboard.press('Space');
    await page.getByRole('button', { name: 'Continuar', exact: true }).focus(); await page.keyboard.press('Enter');
    await expect(page.locator('#app')).toContainText('Preguntas presentadas: 2');
});
