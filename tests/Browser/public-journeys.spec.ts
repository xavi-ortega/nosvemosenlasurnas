import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

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
    await expect(page.locator('#app')).toContainText('No hay otro bloque de cinco');
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
    await expect(page.locator('#app')).toContainText('Pregunta 2 de 10');
});


test('ordered labels store strong rent disagreement and explain it separately from a high total', async ({ page }) => {
    await start(page);
    const expectedLabels = ['Muy en desacuerdo', 'En desacuerdo', 'Ni de acuerdo ni en desacuerdo', 'De acuerdo', 'Muy de acuerdo', 'No lo tengo claro', 'Prefiero no responder'];
    const radios = page.getByRole('radio');
    await expect(page.locator('.quiz-card .choice span')).toHaveText(expectedLabels);
    expect(await radios.evaluateAll(inputs => inputs.map(input => (input as HTMLInputElement).value))).toEqual(['-2', '-1', '0', '1', '2', 'unsure', 'skip']);
    for (let i = 0; i < 10; i++) {
        const isRent = await page.getByRole('heading', { name: 'Limitar los alquileres en zonas de alta demanda.', exact: true }).count() > 0;
        await page.getByRole('radio', { name: isRent ? 'Muy en desacuerdo' : 'Muy de acuerdo', exact: true }).check();
        await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    }
    await hidden(page);
    await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
    const party = page.locator('.result').filter({ has: page.getByRole('heading', { name: 'Candidatura ficticia Alba', exact: true }) });
    await expect(party.locator('.result-number')).toContainText('60 %');
    await party.getByText('Coincidencias y diferencias citadas', { exact: true }).click();
    const rent = party.locator('[data-question-id="housing-2"]');
    await expect(rent).toContainText('Tu respuesta: Muy en desacuerdo');
    await expect(rent).toContainText('Posición interpretada del programa: Muy de acuerdo');
    await expect(rent.locator('.relationship')).toContainText('está en desacuerdo');
    await expect(rent).toContainText('Coincidencia solo en esta propuesta: 0 %');
    page.once('dialog', dialog => void dialog.accept());
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar mis resultados' }).click();
    const exported = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
    expect(exported.answers['housing-2']).toBe(-2);
    expect(exported.answerDetails.find((item: { questionId: string }) => item.questionId === 'housing-2').answerLabel).toBe('Muy en desacuerdo');
});


test('quiz entry keeps priorities optional and back preserves answers across blocks', async ({ page }, testInfo) => {
    const api: string[] = [];
    page.on('request', request => { if (request.url().includes('/api/')) api.push(new URL(request.url()).pathname); });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Comparar programas', exact: true })).toHaveCount(0);
    await expect(page.getByText('Congreso · 23 de julio de 2023')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Valoraciones agregadas', exact: true })).toHaveCount(0);
    await page.locator('.start-link').click();
    await expect(page.locator('.priorities')).not.toHaveAttribute('open');
    await expect(page.getByLabel('Vivienda', { exact: true })).not.toBeVisible();
    await page.getByLabel('Ámbito de comparación').selectOption('north');
    await page.getByRole('button', { name: 'Empezar las diez preguntas' }).click();
    const first = await page.locator('.quiz-card').getAttribute('data-question-id');
    await page.screenshot({ path: testInfo.outputPath('question.png'), fullPage: true });
    await expect(page.getByRole('button', { name: 'Volver', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Elige una opción');
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', first!);
    await answer(page, 1);
    await page.getByRole('button', { name: 'Volver', exact: true }).click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', first!);
    await expect(page.getByRole('radio', { name: 'Muy de acuerdo', exact: true })).toBeChecked();
    await page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true }).check();
    await page.screenshot({ path: testInfo.outputPath('selected.png'), fullPage: true });
    await page.getByRole('button', { name: 'Continuar', exact: true }).dblclick();
    await expect(page.locator('.progress')).toContainText('Pregunta 2 de 10');
    await expect(page.locator('.question-title')).toBeFocused();
    await answer(page, 9);
    await page.screenshot({ path: testInfo.outputPath('checkpoint.png'), fullPage: true });
    await page.getByRole('button', { name: 'Responder cinco más' }).click();
    const eleventh = await page.locator('.quiz-card').getAttribute('data-question-id');
    await expect(page.locator('.progress')).toContainText('Pregunta 11 de 15');
    await page.getByRole('button', { name: 'Volver', exact: true }).click();
    await expect(page.locator('.progress')).toContainText('Pregunta 10 de 15');
    await expect(page.getByRole('radio', { name: 'Muy de acuerdo', exact: true })).toBeChecked();
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', eleventh!);
    await answer(page, 5); await hidden(page);
    expect(api).toEqual(['/api/bank']);
    await page.getByRole('button', { name: 'Terminar y ver resultados' }).click();
    page.once('dialog', dialog => void dialog.accept());
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar mis resultados' }).click();
    const exported = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
    expect(exported.answers[first!]).toBe(-2);
    expect(exported.answerDetails).toHaveLength(15);
    expect(new Set(exported.answerDetails.map((item: { questionId: string }) => item.questionId)).size).toBe(15);
});

test('authored help opens locally and reduced motion removes stage animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/api/bank', async route => {
        const response = await route.fetch();
        const bank = await response.json();
        for (const question of bank.questions) question.help = 'Ayuda ficticia de prueba, sin nombres de candidaturas.';
        const body = JSON.stringify(bank);
        await route.fulfill({ response, body, headers: { ...response.headers(), 'x-evidence-sha256': createHash('sha256').update(body).digest('hex') } });
    });
    await start(page);
    await page.getByText('¿Qué significa esta propuesta?', { exact: true }).click();
    await expect(page.getByText('Ayuda ficticia de prueba, sin nombres de candidaturas.')).toBeVisible();
    await hidden(page);
    expect(await page.locator('.quiz-stage').evaluate(stage => getComputedStyle(stage).animationName)).toBe('none');
    await expect(page.getByRole('radio')).toHaveCount(7);
});


test('question and selected controls stay accessible at 320px and four-times zoom', async ({ page }) => {
    await start(page);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.getByRole('radio', { name: 'Ni de acuerdo ni en desacuerdo', exact: true }).check();
    for (const { width, zoom } of [{ width: 320, zoom: 1 }, { width: 1280, zoom: 2 }, { width: 1280, zoom: 4 }]) {
        await page.setViewportSize({ width, height: 800 });
        await page.evaluate(value => { document.documentElement.style.zoom = String(value); }, zoom);
        const reflow = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: [...document.querySelectorAll<HTMLElement>('body *')].filter(item => item.getBoundingClientRect().right > innerWidth + 1).map(item => ({ tag: item.tagName, className: item.className, right: item.getBoundingClientRect().right })).slice(0, 8) }));
        expect(reflow.scrollWidth, JSON.stringify({ viewportWidth: width, zoom, ...reflow })).toBeLessThanOrEqual(reflow.width);
        const radios = page.getByRole('radio');
        expect(await radios.evaluateAll(inputs => inputs.every(input => input.closest('label')!.getBoundingClientRect().height >= 44))).toBe(true);
    }
    await page.evaluate(() => { document.documentElement.style.zoom = '1'; });
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    await page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'En desacuerdo', exact: true })).toBeChecked();
    await hidden(page);
});
