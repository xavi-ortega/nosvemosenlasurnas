import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { Bank } from '../../resources/js/matching.ts';

const bytes = readFileSync('outputs/quiz-2023-second-iteration-bank.json');
const bank = JSON.parse(bytes.toString()) as Bank;
const sha = createHash('sha256').update(bytes).digest('hex');
const realUrl = process.env.ITERATION_REAL_URL;
if (realUrl) test.use({ baseURL: realUrl });

test.beforeEach(async ({ page }) => {
    if (!realUrl) await page.route('**/api/bank', route => route.fulfill({ body: bytes, contentType: 'application/json', headers: { 'X-Evidence-Sha256': sha } }));
});
async function start(page: Page) {
    await page.goto('/questionnaire');
    await page.getByRole('button', { name: 'Empezar el test', exact: true }).click();
}
async function answer(page: Page, count: number, skipPensions = false) {
    for (let i = 0; i < count; i++) {
        const id = await page.locator('.quiz-card').getAttribute('data-question-id');
        const q = bank.questions.find(q => q.id === id)!;
        await page.locator('.quiz-card[data-question-id="' + id + '"]').getByRole('radio', { name: skipPensions && q.topicId === 'pensions' ? 'Prefiero no responder' : id === 'rent-price-cap' ? 'Muy en desacuerdo' : 'Muy de acuerdo', exact: true }).click();
        await expect(page.locator('.quiz-card[data-question-id="' + id + '"]')).toHaveCount(0);
    }
}
async function finish(page: Page) {
    await page.getByRole('button', { name: 'Ver mi resultado', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Tu resultado 2023', exact: true })).toBeVisible();
}
async function screenshot(page: Page, name: string, project: string) {
    if (!process.env.ITERATION_CAPTURE) return;
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
    mkdirSync('outputs/quiz-2023-second-iteration-previews', { recursive: true });
    await page.screenshot({ path: 'outputs/quiz-2023-second-iteration-previews/' + project + '-' + name + '.png', fullPage: false, animations: 'disabled' });
}
const programmeRow = (page: Page, id: string) => page.locator('.affinity-row[data-profile-id="' + id + '"]');
const reader = (page: Page) => page.locator('.programme-reader:not([hidden])');

test('simple entry has one start action, no selection form and one choice advances exactly once', async ({ page }, info) => {
    await page.goto('/questionnaire');
    await expect(page.getByRole('button', { name: 'Empezar el test', exact: true })).toBeVisible();
    await expect(page.locator('#app select, #app input')).toHaveCount(0);
    await expect(page.locator('#app')).toContainText('Responde 20 preguntas sobre temas cotidianos');
    await screenshot(page, 'simple-start', info.project.name);
    await page.getByRole('button', { name: 'Empezar el test', exact: true }).click();
    const first = bank.starterQuestionIds![0]; const second = bank.starterQuestionIds![1];
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', first);
    await expect(page.getByRole('button', { name: 'Continuar', exact: true })).toHaveCount(0);
    const choice = page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true });
    await choice.scrollIntoViewIfNeeded(); const box = (await choice.boundingBox())!;
    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', second);
    await expect(page.locator('.quiz-card h2')).toBeFocused();
    await expect(page.locator('.quiz-navigation').getByRole('button', { name: 'Atrás', exact: true })).toBeVisible();
    const back = (await page.getByRole('button', { name: 'Atrás', exact: true }).boundingBox())!;
    const answers = (await page.locator('.answers').boundingBox())!;
    expect(back.y + back.height).toBeLessThan(answers.y);
    await screenshot(page, 'automatic-answer', info.project.name);
    await page.getByRole('button', { name: 'Atrás', exact: true }).click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', first);
    await expect(page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true })).toBeChecked();
    await page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true }).click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', second);
});

test('keyboard choice waits for confirmation and homepage starts directly without losing a live test', async ({ page }) => {
    await page.goto('/questionnaire');
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Inicio', exact: true }).click();
    await page.getByRole('button', { name: 'Empezar el test', exact: true }).click();
    const first = bank.starterQuestionIds![0]; const second = bank.starterQuestionIds![1];
    const choice = page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true }); await choice.focus();
    await page.keyboard.press('ArrowRight'); await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', first);
    await page.keyboard.press('Space'); await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', second);
    await page.getByRole('button', { name: 'Atrás', exact: true }).click();
    await expect(page.getByRole('radio', { name: 'En desacuerdo', exact: true })).toBeChecked();
    await page.getByRole('radio', { name: 'Muy de acuerdo', exact: true }).focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', second);
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Inicio', exact: true }).click();
    await page.getByRole('button', { name: 'Volver a mi test', exact: true }).click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', second);
});

test('UX01 UX05: rent disagreement uses four actions, accessible single reader and exact quote', async ({ page }, info) => {
    await start(page); await answer(page, 20);
    await expect(page.locator('#app')).not.toContainText('Sumar');
    await expect(page.locator('#app')).toContainText('Tu mayor coincidencia');
    await finish(page);
    await expect(page.locator('.affinity-row')).toHaveCount(63);
    await expect(page.locator('.affinity-row details, .affinity-row blockquote')).toHaveCount(0);
    await screenshot(page, 'results', info.project.name);
    const p = bank.programmeProfiles!.find(p => p.candidacyId === 'boe-2023-004' && p.constituencyIds.includes('madrid'))!;
    const opener = programmeRow(page, p.id).getByRole('button'); await opener.focus(); await page.keyboard.press('Enter');
    await expect(reader(page).getByRole('heading', { name: p.name, exact: true })).toBeFocused();
    await expect(page.locator('[aria-modal="true"], [inert]')).toHaveCount(0);
    await reader(page).getByRole('button', { name: 'Vivienda', exact: true }).click();
    const rent = reader(page).locator('[data-question-id="rent-price-cap"]');
    await rent.getByRole('button', { name: 'Ver propuesta y fuente' }).click();
    await expect(reader(page)).toContainText('Muy en desacuerdo');
    await expect(reader(page)).toContainText('Tu respuesta está en desacuerdo con la posición citada en esta propuesta.');
    await expect(reader(page).getByRole('link', { name: /Fuente oficial/ }).first()).toBeVisible();
    await reader(page).getByText('Ver cita literal y contexto', { exact: true }).first().click();
    const quote = bank.positions[p.candidacyId]['rent-price-cap'].citations[0].quote;
    await expect(reader(page).locator('blockquote').first()).toHaveText(quote);
    await screenshot(page, 'rent-reader', info.project.name);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(audit.violations).toEqual([]);
    if (info.project.name === 'chromium') {
        await opener.focus(); await page.keyboard.press('Escape'); await expect(reader(page)).toBeVisible();
    }
    await reader(page).getByRole('button', { name: 'Cerrar detalle' }).focus(); await page.keyboard.press('Escape');
    await expect(opener).toBeFocused(); await expect(page.locator('.programme-reader')).toBeHidden();
});

test('UX02: closing a low result row restores exact origin focus and scroll', async ({ page }) => {
    await start(page); await answer(page, 20); await finish(page);
    const row = page.locator('.affinity-row').last(); const button = row.getByRole('button'); await button.scrollIntoViewIfNeeded();
    const scroll = await page.evaluate(() => window.scrollY); await button.click();
    await reader(page).getByRole('button', { name: 'Vivienda', exact: true }).click();
    await reader(page).getByRole('button', { name: 'Ver propuesta y fuente' }).first().click();
    await reader(page).getByRole('button', { name: 'Cerrar detalle' }).click();
    await expect(button).toBeFocused(); await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(scroll, 0);
});

test('UX03 UX09: public featured shortcut, all positions, source exceptions and search recovery', async ({ page }, info) => {
    await page.goto('/programmes');
    const featured = page.getByRole('button', { name: bank.questions.find(q => q.id === 'rent-price-cap')!.text, exact: true });
    await featured.click();
    await expect(page.locator('.position-row')).toHaveCount(63);
    const missing = bank.programmeProfiles!.find(p => !bank.documents.some(d => d.candidacyId === p.candidacyId))!;
    await page.locator('.position-row[data-profile-id="' + missing.id + '"]').getByRole('button').click();
    await expect(reader(page)).toContainText('Sin programa localizado'); await expect(reader(page).getByRole('link')).toHaveCount(0);
    await reader(page).getByRole('button', { name: 'Cerrar detalle' }).click();
    const sourceException = bank.programmeProfiles!.find(p => p.candidacyId === 'boe-2023-002')!;
    await page.locator('.position-row[data-profile-id="' + sourceException.id + '"]').getByRole('button').click();
    await expect(reader(page)).toContainText('Fuente oficial no localizada o no verificable');
    await expect(reader(page).getByRole('link', { name: /Copia conservada/ }).first()).toHaveAttribute('rel', 'noopener noreferrer');
    await screenshot(page, 'source-exception', info.project.name);
    await reader(page).getByRole('button', { name: 'Cerrar detalle' }).click();
    await page.getByRole('button', { name: 'Volver a Programas 2023', exact: true }).click(); await expect(featured).toBeFocused();
    await page.getByRole('button', { name: 'Transporte', exact: true }).click();
    await page.getByLabel('Buscar una propuesta').fill('no-existent-proposal'); await expect(page.locator('#app')).toContainText('No encontramos propuestas');
    await page.getByRole('button', { name: 'Quitar filtros' }).click(); await expect(page.getByLabel('Buscar una propuesta')).toHaveValue('');
});

test('UX04: two/three inline programmes, territorial conflict, source return and remove', async ({ page }, info) => {
    await page.goto('/programmes'); await page.getByRole('button', { name: 'Elegir programas para leer juntos' }).click();
    const ids = ['boe-2023-002', 'boe-2023-003', 'boe-2023-004'];
    for (const id of ids) { const p = bank.programmeProfiles!.find(p => p.candidacyId === id && (id !== 'boe-2023-004' || p.constituencyIds.includes('valencia')))!; await page.getByRole('checkbox', { name: p.name, exact: true }).check(); }
    const fourth = page.getByRole('checkbox', { name: bank.programmeProfiles![5].name, exact: true }); await fourth.click(); await expect(fourth).not.toBeChecked();
    await expect(page.getByRole('status')).toContainText('como máximo tres');
    await page.getByRole('button', { name: 'Leer la comparación' }).click();
    const housing = page.locator('.comparison-proposal[data-question-id="retain-public-housing-ownership"]');
    await expect(housing.locator('.comparison-summaries > section')).toHaveCount(3);
    await expect(housing).toContainText('Posiciones contradictorias');
    const opener = housing.getByRole('button', { name: 'Ver propuesta y fuente' }).last(); await opener.click();
    await expect(reader(page)).toContainText('Comunitat Valenciana'); await reader(page).getByRole('button', { name: 'Cerrar detalle' }).click(); await expect(opener).toBeFocused();
    await screenshot(page, 'focused-comparison', info.project.name);
    await page.getByRole('button', { name: /^Quitar programa/ }).first().click();
    await expect(page.locator('.comparison-proposal').first().locator('.comparison-summaries > section')).toHaveCount(2);
    await expect(page.locator('[aria-modal="true"]')).toHaveCount(0);
});

test('UX06: open long original context survives 320px, zoom-equivalent reflow and low height', async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/programmes');
    await page.getByRole('button', { name: bank.questions.find(q => q.id === 'rent-price-cap')!.text, exact: true }).click();
    await page.locator('.position-row[data-profile-id="boe-2023-004-p1"]').getByRole('button').click();
    const disclosure = reader(page).locator('details.literal-source').first(); await disclosure.locator('summary').click();
    for (const width of [720, 360, 320, 1440]) {
        await page.setViewportSize({ width, height: width === 1440 ? 420 : 900 });
        await expect(disclosure).toHaveAttribute('open', ''); await expect(reader(page)).toContainText('Cita literal original');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(reader(page).getByRole('button', { name: 'Cerrar detalle' })).toBeVisible();
        await screenshot(page, 'reader-' + width, info.project.name);
    }
    await page.setViewportSize({ width: 1440, height: 1000 }); await expect(disclosure).toHaveAttribute('open', '');
    for (const zoom of ['200%', '400%']) {
        await page.evaluate(value => { document.documentElement.style.zoom = value; }, zoom);
        await expect(disclosure).toHaveAttribute('open', '');
        await expect(disclosure.locator('summary')).toBeFocused();
        await expect(disclosure.locator('summary')).toBeInViewport();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.locator('.reading-origin')).toBeHidden();
        await screenshot(page, 'zoom-' + zoom.slice(0, -1), info.project.name);
    }
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
});

test('local Spanish export agrees with all result bars and full useful-block exhaustion never auto-reveals', async ({ page }) => {
    test.setTimeout(60_000);
    await start(page); await answer(page, 20);
    await expect(page.getByRole('button', { name: 'Ver mi resultado', exact: true })).toBeEnabled();
    let total = 20;
    while (await page.getByRole('button', { name: 'Responder 10 más', exact: true }).isEnabled()) {
        await page.getByRole('button', { name: 'Responder 10 más', exact: true }).click(); total += 10;
        await expect(page.locator('.quiz-card')).toContainText(String(total - 9) + ' de ' + total);
        await answer(page, 10);
        await expect(page.getByRole('button', { name: 'Ver mi resultado', exact: true })).toBeEnabled();
        await expect(page.locator('.affinity-row')).toHaveCount(0);
        if (total > 80) throw new Error('Question limit exceeded.');
    }
    await expect(page.locator('#app')).toContainText('No queda un bloque completo');
    await page.route('**/api/release-state', route => route.fulfill({ status: 503 }));
    await page.getByRole('button', { name: 'Ver mi resultado', exact: true }).click();
    await expect(page.locator('#app')).toContainText('No hemos podido comprobar');
    await expect(page.getByRole('button', { name: 'Responder 10 más', exact: true })).toBeDisabled();
    await page.unroute('**/api/release-state');
    await finish(page);
    page.once('dialog', dialog => dialog.accept());
    const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Descargar mis resultados' }).click();
    const download = await downloaded; const path = await download.path();
    const data = JSON.parse(readFileSync(path!, 'utf8')) as { engineVersion: string; answerDetails: { answerLabel: string }[]; results: { rows: { id: string; affinity: number; coverage: number }[] }; labels: { coverage: string } };
    expect(data.engineVersion).toBe('documented-affinity-v2'); expect(data.labels.coverage).toBe('Cobertura documentada'); expect(data.answerDetails).toHaveLength(total);
    expect(data.results.rows).toHaveLength(63);
    for (const row of data.results.rows) {
        const value = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(row.affinity) + ' %';
        await expect(programmeRow(page, row.id).locator('.affinity-value')).toHaveText(value);
    }
});

test('optional positive importance keeps all twenty starter decisions and applies the same denominator', async ({ page }) => {
    await start(page); await answer(page, 20);
    await page.getByRole('button', { name: 'Revisar respuestas', exact: true }).click();
    await page.getByText('Importancia de los temas (opcional)', { exact: true }).click();
    const housingImportance = page.getByRole('combobox', { name: 'Vivienda', exact: true });
    await housingImportance.selectOption('2');
    expect(await housingImportance.locator('option').allTextContents()).toEqual(['Normal', 'Me importa especialmente']);
    await page.getByRole('button', { name: 'Volver al punto de decisión', exact: true }).click(); await finish(page);
    await expect(page.locator('.affinity-row')).toHaveCount(63);
    page.once('dialog', dialog => dialog.accept());
    const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Descargar mis resultados' }).click();
    const file = await (await downloaded).path(); const result = JSON.parse(readFileSync(file!, 'utf8'));
    expect(result.priorities).toEqual({ housing: 2 }); expect(result.results.denominator).toBe(11);
});

test('intentional official-source navigation sends no referrer or personal state', async ({ page, context }) => {
    await page.goto('/programmes');
    await page.getByRole('button', { name: bank.questions.find(q => q.id === 'rent-price-cap')!.text, exact: true }).click();
    await page.locator('.position-row[data-profile-id="boe-2023-004-p1"]').getByRole('button').click();
    const source = reader(page).getByRole('link', { name: /Fuente oficial/ }).first();
    const officialUrl = await source.getAttribute('href');
    expect(officialUrl).toBeTruthy();
    const request = new Promise<{ headers: Record<string, string>; url: string; method: string; body: string | null }>(resolve => {
        void context.route(officialUrl!, async route => {
            const sent = route.request();
            resolve({ headers: await sent.allHeaders(), url: sent.url(), method: sent.method(), body: sent.postData() });
            await route.fulfill({ contentType: 'text/plain', body: 'Publisher navigation captured for the privacy test.' });
        });
    });
    const popup = page.waitForEvent('popup'); await source.click();
    const external = await popup; const sent = await request;
    expect(sent.url).toBe(officialUrl); expect(sent.method).toBe('GET'); expect(sent.body).toBeNull();
    expect(sent.headers.referer).toBeUndefined();
    expect(await external.evaluate(() => window.opener)).toBeNull();
    await external.close();
    await expect(reader(page)).toBeVisible();
});

test('UX07 UX10: generic menu/back preserves only live memory and private data never enters navigation or storage', async ({ page, context }) => {
    const requests: { url: string; method: string; body: string | null }[] = [];
    page.on('request', request => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
    await start(page); await answer(page, 3);
    const question = await page.locator('.quiz-card').getAttribute('data-question-id');
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Programas 2023', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Mostrar mis respuestas' })).toHaveCount(0);
    await page.getByRole('button', { name: bank.questions[0].text, exact: true }).click(); await expect(page.locator('.proposal-relation')).toHaveCount(0);
    await page.goBack(); await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', question!);
    await page.goForward(); await expect(page.locator('.position-row')).toHaveCount(63);
    const state = await page.evaluate(async () => ({ history: history.state, local: Object.keys(localStorage), session: Object.keys(sessionStorage), databases: await indexedDB.databases(), url: location.pathname + location.search + location.hash }));
    expect(state).toEqual({ history: null, local: [], session: [], databases: [], url: '/programmes' });
    expect(await context.cookies()).toEqual([]);
    expect(requests.filter(r => {
        const url = new URL(r.url);
        const publicDevelopmentModule = ['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname === '/resources/js/documented-affinity.ts' && !url.search;
        return r.body || r.method !== 'GET' || (!publicDevelopmentModule && /answers|affinity|progress|questionId|profileId|importance|finish=/.test(r.url));
    })).toEqual([]);
    expect(requests.filter(r => new URL(r.url).pathname === '/api/bank')).toHaveLength(1);
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Cuestionario 2023', exact: true }).click();
    await page.reload(); await expect(page.getByRole('button', { name: 'Empezar el test', exact: true })).toBeVisible();
});

test('UX08: skipped topic has no maximum, review restores it, rapid extension adds exactly ten and edit hides results', async ({ page }, info) => {
    await start(page); await answer(page, 20, true);
    await expect(page.locator('#app')).toContainText('El porcentaje global está pendiente'); await expect(page.locator('#app')).not.toContainText('Tu mayor coincidencia');
    await screenshot(page, 'pending-checkpoint', info.project.name);
    await page.getByRole('button', { name: 'Revisar este tema: Pensiones' }).click();
    await page.locator('[data-question-id="pensions-cost-of-living"]').getByRole('radio', { name: 'Muy de acuerdo', exact: true }).check();
    await page.getByRole('button', { name: 'Volver al punto de decisión' }).click();
    await expect(page.locator('#app')).toContainText('Tu mayor coincidencia');
    await page.getByRole('button', { name: 'Responder 10 más' }).dblclick(); await expect(page.locator('.quiz-card')).toContainText('21 de 30');
    await answer(page, 10); await finish(page);
    await page.getByRole('button', { name: 'Revisar respuestas' }).click();
    await expect(page.locator('.affinity-row')).toHaveCount(0); await expect(page.locator('#app')).not.toContainText('Sumar');
    await page.locator('[data-question-id="rent-price-cap"]').getByRole('radio', { name: 'Muy de acuerdo', exact: true }).check();
    await page.getByRole('button', { name: 'Volver al punto de decisión' }).click(); await finish(page);
});

test('delayed result checks keep checkpoint space and restore answers and controls after failure', async ({ page }) => {
    await start(page); await answer(page, 20);
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/api/release-state', async route => { await pending; await route.fulfill({ status: 503 }); });
    const before = await page.locator('#app > section').boundingBox();
    await page.getByRole('button', { name: 'Ver mi resultado', exact: true }).click();
    await expect(page.locator('#app .loading-skeleton')).toBeVisible();
    await expect(page.locator('#app .skeleton-content')).toHaveAttribute('inert', '');
    expect((await page.locator('#app > section').boundingBox())!.height).toBeCloseTo(before!.height, 0);
    await expect(page.locator('.affinity-row')).toHaveCount(0);
    release();
    await expect(page.getByRole('alert')).toContainText('No hemos podido comprobar');
    await expect(page.locator('#app .loading-skeleton')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Ver mi resultado', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Ver mi resultado', exact: true })).toBeFocused();
    await page.unroute('**/api/release-state');
    await finish(page); await expect(page.locator('.affinity-row')).toHaveCount(63);
});

test('loading, invalid bank, withdrawn session, overlay opt-in and cancel/reset states remain honest', async ({ page }) => {
    await start(page); await answer(page, 20);
    await page.route('**/api/release-state', route => route.fulfill({ json: { sha256: sha, withdrawn: [sha] } }));
    await page.getByRole('button', { name: 'Ver mi resultado' }).click(); await expect(page.locator('#app')).toContainText('se ha retirado'); await expect(page.locator('.affinity-row')).toHaveCount(0); await expect(page.locator('#app')).not.toContainText('Tu mayor coincidencia');
    await page.unroute('**/api/release-state'); await start(page); await answer(page, 20); await finish(page);
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Programas 2023', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Mostrar mis respuestas' })).not.toBeChecked();
    await page.getByRole('checkbox', { name: 'Mostrar mis respuestas' }).check();
    await page.getByRole('button', { name: bank.questions[0].text, exact: true }).click(); await expect(page.locator('.proposal-relation').first()).toBeVisible();
    await page.getByRole('checkbox', { name: 'Mostrar mis respuestas' }).uncheck(); await expect(page.locator('.proposal-relation')).toHaveCount(0);
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Cuestionario 2023', exact: true }).click();
    await page.getByRole('button', { name: 'Borrar respuestas', exact: true }).click(); await expect(page.getByRole('button', { name: 'Seguir con mis respuestas' })).toBeFocused(); await page.keyboard.press('Escape'); await expect(page.locator('.affinity-row')).toHaveCount(63);
    await page.getByRole('button', { name: 'Borrar respuestas', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Borrar respuestas', exact: true }).click(); await expect(page.getByRole('button', { name: 'Empezar el test', exact: true })).toBeVisible();
    await page.route('**/api/bank', route => route.fulfill({ body: '{}', headers: { 'X-Evidence-Sha256': 'bad' } })); await page.reload(); await expect(page.locator('#app')).toContainText('No hemos podido cargar');
});
