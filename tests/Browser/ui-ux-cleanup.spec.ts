import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Bank } from '../../resources/js/matching.ts';

const bytes = readFileSync('outputs/quiz-2023-second-iteration-bank.json');
const bank = JSON.parse(bytes.toString()) as Bank;
const sha = createHash('sha256').update(bytes).digest('hex');
const name = (id: string) => bank.programmeProfiles!.find(profile => profile.candidacyId === id)!.name;
const question = (id: string) => bank.questions.find(proposal => proposal.id === id)!;
const comparison = (page: Page, id: string) => page.locator('.comparison-proposal[data-question-id="' + id + '"]:visible');
const reader = (page: Page) => page.locator('.programme-reader:visible');
const resultRow = (page: Page, id: string) => page.locator('.affinity-row[data-profile-id="' + id + '-p1"]');
if (process.env.ITERATION_REAL_URL) test.use({ baseURL: process.env.ITERATION_REAL_URL });
test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
    if (!process.env.ITERATION_REAL_URL) await page.route('**/api/bank', route => route.fulfill({ body: bytes, contentType: 'application/json', headers: { 'X-Evidence-Sha256': sha } }));
});

async function selectProgrammes(page: Page, ids: string[]) {
    for (const id of ids) await page.getByRole('checkbox', { name: name(id), exact: true }).check();
    await page.getByRole('button', { name: 'Comparar ' + ids.length + ' programas', exact: true }).click();
}
async function completeStarter(page: Page, answers: Record<string, string> = {}) {
    await page.goto('/questionnaire');
    await page.getByRole('button', { name: 'Empezar el test', exact: true }).click();
    for (let index = 0; index < 20; index++) {
        const id = (await page.locator('.quiz-card').getAttribute('data-question-id'))!;
        await page.locator('.quiz-card').getByRole('radio', { name: answers[id] ?? (id === 'rent-price-cap' ? 'Muy en desacuerdo' : 'Muy de acuerdo'), exact: true }).click();
        await expect(page.locator('.quiz-card[data-question-id="' + id + '"]')).toHaveCount(0);
    }
    await page.getByRole('button', { name: 'Ver mi resultado', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Tus coincidencias con los programas de 2023', exact: true })).toBeVisible();
}
async function findResult(page: Page, id: string) {
    await page.locator('.result-search input').fill(name(id));
    await expect(resultRow(page, id)).toBeVisible();
    return resultRow(page, id);
}
async function currentResultValues(page: Page) {
    return page.locator('.affinity-row').evaluateAll(rows => rows.map(row => ({ id: (row as HTMLElement).dataset.profileId, value: row.querySelector('.affinity-value')?.textContent })));
}
async function expectInteractiveFocus(page: Page) {
    await expect.poll(() => page.evaluate(() => document.activeElement?.matches('a[href],button,input,select,textarea,summary'))).toBe(true);
}
async function sourceAction(row: Locator) {
    return row.getByRole('button', { name: /Ver fuente/ }).first();
}

test('A01: the home offers test and programme tasks above the fold on mobile and MacBook', async ({ page }) => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 720 }]) {
        await page.setViewportSize(viewport);
        if (process.env.ITERATION_REAL_URL) await page.goto('/');
        else { await page.goto('/questionnaire'); await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Inicio', exact: true }).click(); }
        await expect(page.getByRole('button', { name: 'Empezar el test', exact: true })).toBeInViewport();
        await expect(page.getByRole('button', { name: 'Comparar programas', exact: true })).toBeInViewport();
        await expect(page.locator('#app')).toContainText('2023');
        await expect(page.locator('#app')).toContainText('recargar');
        await expect(page.locator('#app input:checked')).toHaveCount(0);
    }
});

test('A02: browser history restores programme and method aliases after opening privacy', async ({ page }) => {
    for (const [path, heading] of [['/comparison', '¿Qué programas quieres comparar?'], ['/method', 'Cómo funciona']]) {
        await page.goto('/comparison');
        await expect(page.getByRole('button', { name: 'Comparar 0 programas', exact: true })).toBeDisabled();
        if (path === '/method') await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Cómo funciona', exact: true }).click();
        await expect(page.locator('#app').getByRole('heading', { name: heading, exact: true })).toBeVisible();
        await page.evaluate(alias => history.replaceState(null, '', alias), path);
        await page.locator('.site-footer').getByRole('link', { name: 'Privacidad', exact: true }).click();
        await expect(page.locator('#app').getByRole('heading', { name: 'Tus respuestas se quedan contigo', exact: true })).toBeVisible();

        await page.goBack();

        await expect(page).toHaveURL(new RegExp(path + '$'));
        await expect(page.locator('#app').getByRole('heading', { name: heading, exact: true })).toBeVisible();
        await page.goForward();
        await expect(page.locator('#app').getByRole('heading', { name: 'Tus respuestas se quedan contigo', exact: true })).toBeVisible();
    }
});

test('A02 A21: practical notices return to the live question without revealing or changing an answer', async ({ page }) => {
    await page.goto('/questionnaire'); await page.getByRole('button', { name: 'Empezar el test', exact: true }).click();
    await page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true }).focus(); await page.keyboard.press('ArrowRight');
    const id = await page.locator('.quiz-card').getAttribute('data-question-id');
    for (const label of ['Ayuda', 'Privacidad', 'Accesibilidad']) {
        const opener = page.getByRole('link', { name: label, exact: true }).first(); await opener.click();
        const back = page.locator('[data-return-context]:visible'); await expect(back).toBeVisible(); await back.click();
        await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', id!);
        await expect(page.getByRole('radio', { name: 'En desacuerdo', exact: true })).toBeChecked();
        await expect(page.locator('.affinity-row, .own-answer')).toHaveCount(0);
        await expect(opener).toBeFocused();
    }
});

test('A03 A04 A08: searching minor formations keeps native selection and cancelling replacement restores the workspace', async ({ page }) => {
    await page.goto('/comparison');
    await expect(page.getByRole('checkbox')).toHaveCount(59);
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0);
    await page.getByRole('checkbox', { name: name('boe-2023-001'), exact: true }).check();
    const search = page.getByRole('searchbox', { name: 'Buscar una formación', exact: true });
    await search.fill('fuerza civica');
    await expect(search).toBeFocused();
    await page.getByRole('checkbox', { name: name('boe-2023-059'), exact: true }).check();
    await search.fill('');
    await expect(page.getByRole('checkbox', { name: name('boe-2023-001'), exact: true })).toBeChecked();
    await page.getByRole('checkbox', { name: name('boe-2023-005'), exact: true }).check();
    const fourth = page.getByRole('checkbox', { name: name('boe-2023-004'), exact: true });
    if (await fourth.isEnabled()) await fourth.click();
    await expect(fourth).not.toBeChecked();
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(3);
    await expect(page.locator('#app')).toContainText('Quita una');
    await page.getByRole('button', { name: 'Comparar 3 programas', exact: true }).click();
    await page.getByRole('combobox', { name: 'Tema', exact: true }).selectOption('housing');
    await expect(comparison(page, 'rent-price-cap')).toContainText('No hemos encontrado su programa común de 2023');
    const snapshot = await comparison(page, 'rent-price-cap').textContent();
    await page.getByRole('button', { name: 'Cambiar programas', exact: true }).click();
    await page.getByRole('checkbox', { name: name('boe-2023-005'), exact: true }).uncheck();
    await page.getByRole('checkbox', { name: name('boe-2023-004'), exact: true }).check();
    await page.getByRole('button', { name: 'Volver sin cambiar', exact: true }).click();
    await expect(comparison(page, 'rent-price-cap')).toHaveText(snapshot!);
    await expect(page.getByRole('button', { name: 'Cambiar programas', exact: true })).toBeFocused();
});

test('A05 A07 A31: qualified values count as differences and missing information remains an independent view', async ({ page }) => {
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-002', 'boe-2023-004', 'boe-2023-005']);
    await page.getByRole('combobox', { name: 'Tema', exact: true }).selectOption('health');
    await page.getByRole('combobox', { name: 'Mostrar', exact: true }).selectOption({ label: 'Posturas distintas' });
    await expect(comparison(page, 'public-dental-care')).toBeVisible();
    await expect(comparison(page, 'public-dental-care')).toContainText('75 años');
    await expect(comparison(page, 'public-dental-care')).toContainText('No hemos encontrado su programa común de 2023');
    await page.getByRole('combobox', { name: 'Mostrar', exact: true }).selectOption({ label: 'Información que falta' });
    await expect(comparison(page, 'public-dental-care')).toBeVisible();
    await page.getByRole('combobox', { name: 'Tema', exact: true }).selectOption('housing');
    await expect(comparison(page, 'rent-price-cap')).toContainText(/Sin postura documentada|No podemos confirmar/);
    await expect(comparison(page, 'rent-price-cap')).toContainText('Apoyo');
    await page.getByRole('combobox', { name: 'Mostrar', exact: true }).selectOption({ label: 'Todas las propuestas' });
    const mortgage = comparison(page, 'public-young-home-mortgage-guarantees');
    await expect(mortgage).toContainText('20 %'); await expect(mortgage).toContainText('35 años'); await expect(mortgage).toContainText('primera vivienda habitual');
});

test('A13 A31: two unknown programmes never become an agreement or a documented difference', async ({ page }) => {
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-005', 'boe-2023-015']);
    await page.getByRole('combobox', { name: 'Mostrar', exact: true }).selectOption({ label: 'Posturas distintas' });
    await expect(page.locator('.comparison-proposal:visible')).toHaveCount(0);
    await expect(page.locator('#app')).toContainText('Puede faltar información');
    await page.getByRole('button', { name: 'Ver todas las propuestas', exact: true }).click();
    await expect(page.locator('.comparison-proposal:visible')).not.toHaveCount(0);
    await page.getByRole('combobox', { name: 'Mostrar', exact: true }).selectOption({ label: 'Información que falta' });
    await expect(page.locator('.comparison-proposal:visible')).not.toHaveCount(0);
});

test('A09 A11: six-proposal pages and source return keep topic, filter and semantic focus after resize', async ({ page }) => {
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-001', 'boe-2023-004']);
    await page.getByRole('combobox', { name: 'Tema', exact: true }).selectOption('institutions');
    await expect(page.locator('.comparison-proposal:visible')).toHaveCount(6);
    await expect(page.locator('#app')).toContainText('1–6 de 15');
    await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
    await expect(page.locator('#app')).toContainText('7–12 de 15');
    const row = page.locator('.comparison-proposal:visible').filter({ has: page.getByRole('button', { name: /Ver fuente/ }) }).first();
    const id = (await row.getAttribute('data-question-id'))!;
    const opener = await sourceAction(row); const identity = await opener.getAttribute('data-reader-origin'); await opener.click();
    await expect(reader(page).locator('blockquote').first()).toBeVisible();
    await reader(page).getByText('Leer el contexto original', { exact: true }).first().click();
    await page.setViewportSize({ width: 390, height: 844 });
    await reader(page).getByRole('button', { name: 'Volver a la comparación', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Tema', exact: true })).toHaveValue('institutions');
    await expect(page.locator('#app')).toContainText('7–12 de 15');
    await expect(comparison(page, id)).toBeVisible();
    await expectInteractiveFocus(page);
    await expect(page.locator('[data-reader-origin="' + identity + '"]:visible')).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('A32: local proposal search has no-hit recovery and returns to its exact query and proposal opener', async ({ page, context }) => {
    const requests: string[] = []; page.on('request', request => requests.push(request.url()));
    await page.goto('/programmes'); await page.getByRole('button', { name: 'Buscar una propuesta', exact: true }).click();
    const search = page.getByRole('searchbox', { name: 'Buscar una propuesta', exact: true });
    await search.fill('zzzz-no-existent-proposal');
    await expect(page.locator('#app')).toContainText('No encontramos');
    await page.getByRole('button', { name: 'Borrar búsqueda', exact: true }).click(); await expect(search).toHaveValue('');
    await search.fill('PSICOTERAPIA');
    const opener = page.getByRole('button', { name: question('public-psychotherapy-care').text, exact: true });
    await opener.click(); await expect(page.locator('.position-row')).toHaveCount(6); await expect(page.locator('#app')).toContainText('59 formaciones');
    await page.getByRole('button', { name: 'Volver a la búsqueda', exact: true }).click();
    await expect(search).toHaveValue('PSICOTERAPIA'); await expect(opener).toBeFocused();
    const privateState = await page.evaluate(async () => ({ search: location.search, hash: location.hash, history: history.state, local: Object.keys(localStorage), session: Object.keys(sessionStorage), databases: await indexedDB.databases() }));
    expect(privateState).toEqual({ search: '', hash: '', history: null, local: [], session: [], databases: [] });
    expect(await context.cookies()).toEqual([]);
    expect(requests.some(url => /PSICOTERAPIA|no-existent-proposal/i.test(url))).toBe(false);
});

test('A29: explicitly chosen results enter the shared comparator and return with identical result context', async ({ page }) => {
    await completeStarter(page);
    await (await findResult(page, 'boe-2023-001')).getByRole('checkbox').check();
    await (await findResult(page, 'boe-2023-004')).getByRole('checkbox').check();
    const before = await currentResultValues(page);
    const compare = page.getByRole('button', { name: 'Comparar programas', exact: true }); await compare.scrollIntoViewIfNeeded();
    const scroll = await page.evaluate(() => window.scrollY); await compare.click();
    await expect(page.getByRole('checkbox', { name: 'Mostrar mis respuestas', exact: true })).not.toBeChecked();
    await expect(page.locator('.own-answer')).toHaveCount(0);
    await expect(comparison(page, 'rent-price-cap').getByRole('button', { name: 'Ver fuente: ' + name('boe-2023-004'), exact: true })).toBeVisible();
    await (await sourceAction(comparison(page, 'rent-price-cap'))).click();
    await reader(page).getByRole('button', { name: 'Volver a la comparación', exact: true }).click();
    await page.getByRole('button', { name: 'Volver a mis resultados', exact: true }).click();
    await expect(page.locator('.result-search input')).toHaveValue(name('boe-2023-004'));
    expect(await currentResultValues(page)).toEqual(before);
    await expect(resultRow(page, 'boe-2023-004').getByRole('checkbox')).toBeChecked();
    await expect(compare).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(scroll, 0);
});

test('A30: an explicitly requested own-answer line distinguishes unsure, skipped and unasked proposals', async ({ page }) => {
    await completeStarter(page, { 'rent-price-cap': 'No lo tengo claro', 'phase-out-prescription-copay': 'Prefiero no responder' });
    await (await findResult(page, 'boe-2023-001')).getByRole('checkbox').check();
    await (await findResult(page, 'boe-2023-004')).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Comparar con mis respuestas', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Mostrar mis respuestas', exact: true })).toBeChecked();
    await expect(comparison(page, 'rent-price-cap').locator('.own-answer')).toHaveText('Tu respuesta: No lo tengo claro');
    await page.getByRole('combobox', { name: 'Tema', exact: true }).selectOption('health');
    await expect(comparison(page, 'phase-out-prescription-copay').locator('.own-answer')).toHaveText('Tu respuesta: Prefiero no responder');
    await page.getByRole('combobox', { name: 'Tema', exact: true }).selectOption('energy');
    await expect(comparison(page, 'available-repair-parts').locator('.own-answer')).toHaveText('Tu respuesta: Esta pregunta no ha aparecido en tu test.');
    await page.getByRole('checkbox', { name: 'Mostrar mis respuestas', exact: true }).uncheck();
    await expect(page.locator('.own-answer')).toHaveCount(0);
});

test('A30: hiding own answers remains effective when returning to the original proposal after changing comparison topic', async ({ page }) => {
    await completeStarter(page);
    await (await findResult(page, 'boe-2023-001')).getByRole('checkbox').check();
    await (await findResult(page, 'boe-2023-004')).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Comparar con mis respuestas', exact: true }).click();
    await page.getByRole('button', { name: 'Explorar por tema', exact: true }).click();
    await page.getByRole('button', { name: 'Vivienda', exact: true }).click();
    const originalQuestion = question('rent-price-cap');
    await page.getByRole('button', { name: originalQuestion.text, exact: true }).click();
    await expect(page.locator('.own-answer')).toHaveText('Tu respuesta: Muy en desacuerdo');
    await page.getByRole('button', { name: 'Comparar 2 programas', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Mostrar mis respuestas', exact: true }).uncheck();
    await page.getByRole('combobox', { name: 'Tema', exact: true }).selectOption('health');
    await expect(page.locator('.own-answer')).toHaveCount(0);

    await page.getByRole('button', { name: 'Volver a las posturas', exact: true }).click();

    await expect(page.locator('#app').getByRole('heading', { name: originalQuestion.text, exact: true })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Mostrar mis respuestas', exact: true })).not.toBeChecked();
    await expect(page.locator('.own-answer')).toHaveCount(0);
    await page.getByRole('button', { name: 'Comparar 2 programas', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Tema', exact: true })).toHaveValue('housing');
    await expect(comparison(page, originalQuestion.id)).toBeVisible();
    await expect(page.locator('.own-answer')).toHaveCount(0);
});

test('A34: switching result explanation category and reading its source returns to the original result opener', async ({ page }) => {
    await completeStarter(page);
    const row = await findResult(page, 'boe-2023-004');
    const opener = row.getByRole('button', { name: 'En qué coincides', exact: true });
    await opener.click();
    await reader(page).getByRole('button', { name: 'En qué difieres', exact: true }).click();
    await reader(page).locator('.result-example[data-question-id="rent-price-cap"]').getByRole('button', { name: /Ver fuente/ }).click();
    await expect(reader(page).locator('blockquote').first()).toBeVisible();
    await reader(page).getByRole('button', { name: 'Volver a las posiciones', exact: true }).click();
    await expect(reader(page).getByRole('heading', { name: 'En qué difieres', exact: true })).toBeVisible();

    await reader(page).getByRole('button', { name: 'Volver a resultados', exact: true }).click();

    await expect(reader(page)).toHaveCount(0);
    await expect(row).toBeVisible();
    await expect(opener).toBeFocused();
    await expect(page.locator('.result-search input')).toHaveValue(name('boe-2023-004'));
});

test('A35: reviewing one cited answer keeps the question set and requires a new deliberate result', async ({ page }) => {
    await completeStarter(page);
    await (await findResult(page, 'boe-2023-004')).getByRole('button', { name: 'En qué difieres', exact: true }).click();
    await reader(page).locator('.result-example[data-question-id="rent-price-cap"]').getByRole('button', { name: 'Revisar esta respuesta', exact: true }).click();
    await expect(page.locator('#app [data-question-id]')).toHaveCount(1);
    await expect(page.locator('#app [data-question-id]')).toHaveAttribute('data-question-id', 'rent-price-cap');
    await expect(page.locator('#app')).not.toContainText('Sumar');
    await expect(page.locator('.affinity-row, .own-answer, .programme-reader:visible')).toHaveCount(0);
    await page.getByRole('radio', { name: 'Muy de acuerdo', exact: true }).check();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
    await expect(page.getByRole('checkbox', { name: 'Mostrar mis respuestas', exact: true })).toHaveCount(0);
    await page.goBack();
    await expect(page.getByRole('radio', { name: 'Muy de acuerdo', exact: true })).toBeChecked();
    await expect(page.locator('.affinity-row, .own-answer')).toHaveCount(0);
    await page.getByRole('button', { name: 'Volver a ver mi resultado', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Tus coincidencias con los programas de 2023', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Descargar mis resultados', exact: true }).click();
    const pendingDownload = page.waitForEvent('download');
    await page.getByRole('dialog').getByRole('button', { name: 'Descargar datos completos (JSON)', exact: true }).click();
    const path = await (await pendingDownload).path();
    const exported = JSON.parse(readFileSync(path!, 'utf8')) as { answers: Record<string, number>; answerDetails: { questionId: string }[] };
    expect(exported.answerDetails.map(answer => answer.questionId)).toEqual(bank.starterQuestionIds);
    expect(exported.answers).toEqual(Object.fromEntries(bank.starterQuestionIds!.map(id => [id, 2])));
});

test('A20 A33 A36: keyboard explanations show equal totals with different agreements without changing a selected answer', async ({ page }) => {
    await page.goto('/questionnaire'); await page.getByRole('button', { name: 'Empezar el test', exact: true }).click();
    const id = await page.locator('.quiz-card').getAttribute('data-question-id');
    await page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true }).focus(); await page.keyboard.press('ArrowRight');
    const meaning = page.locator('.quiz-card .question-help summary');
    await meaning.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.quiz-card .question-help')).toHaveAttribute('open', '');
    await expect(page.locator('.quiz-card')).not.toContainText('Sumar');
    await page.keyboard.press('Enter'); await expect(meaning).toBeFocused();
    await expect(page.getByRole('radio', { name: 'En desacuerdo', exact: true })).toBeChecked();
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Cómo funciona', exact: true }).click();
    const equal = page.getByRole('button', { name: 'Mismo total, distintas coincidencias', exact: true });
    await equal.focus(); await page.keyboard.press('Enter');
    await expect(equal).toBeFocused();
    await expect(page.locator('.method-example')).toContainText('40 % de coincidencia y 80 % de información');
    expect(await page.locator('.example-table tbody tr').allTextContents()).toEqual(['1CoincideDifiere', '2CoincideDifiere', '3DifiereCoincide', '4DifiereCoincide', '5Sin informaciónSin información']);
    await page.locator('[data-return-context]:visible').click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', id!);
    await expect(page.getByRole('radio', { name: 'En desacuerdo', exact: true })).toBeChecked();
});

test('A25: readable download is explicit, cancellable and stays local alongside searches and comparison choices', async ({ page, context }) => {
    const requests: { url: string; method: string; body: string | null }[] = [];
    page.on('request', request => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
    await completeStarter(page);
    let downloads = 0; page.on('download', () => downloads++);
    const opener = page.getByRole('button', { name: 'Descargar mis resultados', exact: true }); await opener.click();
    await expect(page.getByRole('dialog')).toContainText('respuestas políticas');
    await page.keyboard.press('Escape'); await expect(opener).toBeFocused(); expect(downloads).toBe(0);
    await opener.click();
    const downloading = page.waitForEvent('download');
    await page.getByRole('dialog').getByRole('button', { name: 'Descargar archivo legible', exact: true }).click();
    const download = await downloading; const text = readFileSync((await download.path())!, 'utf8');
    expect(text).toContain('Coincidencia confirmada'); expect(text).toContain('Información disponible'); expect(text).toContain(question('rent-price-cap').text); expect(text).toContain('Muy en desacuerdo');
    await expect(opener).toBeFocused(); expect(downloads).toBe(1);
    expect(requests.filter(request => request.method !== 'GET' || request.body !== null)).toEqual([]);
    expect(requests.filter(request => /answers=|questionId=|profileId=|search=|finish=|selected=/.test(request.url))).toEqual([]);
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(async () => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), databases: await indexedDB.databases(), history: history.state }))).toEqual({ local: [], session: [], databases: [], history: null });
});

test('A12: topic exploration transfers the exact late-page proposal and returns to its formation search', async ({ page }) => {
    await page.goto('/programmes');
    await page.getByRole('button', { name: 'Explorar por tema', exact: true }).click();
    await page.getByRole('button', { name: 'Instituciones', exact: true }).click();
    const id = 'single-national-congress-constituency';
    const proposalSearch = page.getByRole('searchbox', { name: 'Buscar una propuesta', exact: true }); await proposalSearch.fill(question(id).text);
    const proposalOpener = page.getByRole('button', { name: question(id).text, exact: true }); await proposalOpener.click();
    const positionSearch = page.getByRole('searchbox', { name: 'Buscar una formación', exact: true });
    for (const formation of ['boe-2023-005', 'boe-2023-004']) {
        await positionSearch.fill(name(formation));
        await page.locator('.position-row[data-profile-id="' + formation + '-p1"]').getByRole('button', { name: 'Añadir a la comparación', exact: true }).click();
    }
    const compare = page.getByRole('button', { name: 'Comparar 2 programas', exact: true }); await compare.click();
    await expect(comparison(page, id)).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Tema', exact: true })).toHaveValue('institutions');
    await expect(page.locator('#app')).toContainText('13–15 de 15');
    await page.getByRole('button', { name: 'Volver a las posturas', exact: true }).click();
    await expect(positionSearch).toHaveValue(name('boe-2023-004')); await expect(compare).toBeFocused();
    await page.getByRole('button', { name: 'Volver a propuestas', exact: true }).click();
    await expect(proposalSearch).toHaveValue(question(id).text); await expect(proposalOpener).toBeFocused();
});

test('A04 A37: additions from a factsheet refresh cached choices and remain cancellable in a replacement draft', async ({ page }) => {
    for (const removeExisting of [false, true]) {
        await page.goto('/comparison');
        await selectProgrammes(page, ['boe-2023-001', 'boe-2023-004']);
        await page.getByRole('link', { name: 'Fuentes', exact: true }).click();
        await page.getByRole('searchbox', { name: 'Buscar una formación', exact: true }).fill('PSC');
        await page.getByRole('button', { name: 'Ver ficha y documentos', exact: true }).click();
        await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
        await page.getByRole('button', { name: 'Cambiar programas', exact: true }).click();
        if (removeExisting) await page.getByRole('checkbox', { name: name('boe-2023-004'), exact: true }).uncheck();
        await page.getByRole('link', { name: 'Fuentes', exact: true }).click();
        if (removeExisting) await page.getByRole('button', { name: 'Ver ficha y documentos', exact: true }).click();
        await reader(page).getByRole('button', { name: 'Añadir a la comparación', exact: true }).click();
        await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
        await expect(page.getByRole('checkbox', { name: name('boe-2023-005'), exact: true })).toBeChecked();
        await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(removeExisting ? 2 : 3);
        await expect(page.getByRole('checkbox', { name: name('boe-2023-004'), exact: true })).toBeChecked({ checked: !removeExisting });
        await page.getByRole('button', { name: 'Volver sin cambiar', exact: true }).click();
        await page.getByRole('button', { name: 'Cambiar programas', exact: true }).click();
        await expect(page.getByRole('checkbox', { name: name('boe-2023-004'), exact: true })).toBeChecked();
        await expect(page.getByRole('checkbox', { name: name('boe-2023-005'), exact: true })).not.toBeChecked();
        await page.getByRole('link', { name: 'Fuentes', exact: true }).click();
        await expect(page.getByRole('searchbox', { name: 'Buscar una formación', exact: true })).toHaveValue('PSC');
        await page.getByRole('button', { name: 'Ver ficha y documentos', exact: true }).click();
        await expect(reader(page).getByRole('button', { name: 'Añadir a la comparación', exact: true })).toBeEnabled();
    }
});

test('A37: searchable factsheets keep PSC missing, add explicitly and return to the same source query', async ({ page }) => {
    await page.goto('/comparison');
    await expect(page.getByRole('checkbox')).toHaveCount(59);
    await page.getByRole('link', { name: 'Fuentes', exact: true }).click();
    await expect(page.locator('.directory-row')).toHaveCount(59);
    const search = page.getByRole('searchbox', { name: 'Buscar una formación', exact: true });
    await search.fill('PSC');
    const psc = page.locator('.directory-row[data-profile-id="boe-2023-005-p1"]');
    await expect(psc).toContainText('No hemos encontrado su programa común de 2023');
    const opener = psc.getByRole('button', { name: 'Ver ficha y documentos', exact: true }); await opener.click();
    await expect(reader(page)).toContainText('Programa de las generales de 2023');
    await expect(reader(page).getByRole('link')).toHaveCount(0);
    await reader(page).getByRole('button', { name: 'Añadir a la comparación', exact: true }).click();
    await expect(reader(page).getByRole('button', { name: 'Añadido a la comparación', exact: true })).toBeDisabled();
    await reader(page).getByRole('button', { name: 'Volver a fuentes', exact: true }).click();
    await expect(search).toHaveValue('PSC'); await expect(opener).toBeFocused();
    await search.fill('Fuerza Civica');
    await page.locator('.directory-row[data-profile-id="boe-2023-059-p1"]').getByRole('button', { name: 'Ver ficha y documentos', exact: true }).click();
    await expect(reader(page).getByRole('link').first()).toHaveAttribute('rel', 'noopener noreferrer');
    await reader(page).getByRole('button', { name: 'Añadir a la comparación', exact: true }).click();
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
    await expect(page.getByRole('checkbox', { name: name('boe-2023-005'), exact: true })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: name('boe-2023-059'), exact: true })).toBeChecked();
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(2);
    await page.getByRole('button', { name: 'Comparar 2 programas', exact: true }).click();
    await expect(comparison(page, 'rent-price-cap')).toContainText('No hemos encontrado su programa común de 2023');
});
