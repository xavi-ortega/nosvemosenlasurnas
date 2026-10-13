import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import type { Bank } from '../../resources/js/matching.ts';

const bytes = readFileSync('outputs/quiz-2023-second-iteration-bank.json');
const bank = JSON.parse(bytes.toString()) as Bank;
const sha = createHash('sha256').update(bytes).digest('hex');
const name = (id: string) => bank.programmeProfiles!.find(profile => profile.candidacyId === id)!.name;
const question = (id: string) => bank.questions.find(proposal => proposal.id === id)!;
const comparison = (page: Page, id: string) => page.locator('.comparison-proposal[data-question-id="' + id + '"]:visible');
const panel = (page: Page, kind: string) => page.locator('dialog[data-panel-kind="' + kind + '"]:visible');
const slot = (page: Page, index: number) => page.locator('.programme-slot[data-slot-index="' + index + '"]');
const resultRow = (page: Page, id: string) => page.locator('.affinity-row[data-profile-id="' + id + '-p1"]');
const proposalSearch = (page: Page) => page.getByRole('searchbox', { name: 'Buscar una propuesta o un tema', exact: true });
test.use({ baseURL: process.env.ITERATION_REAL_URL ?? 'http://127.0.0.1:8768' });
test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
    if (!process.env.ITERATION_REAL_URL) await page.route('**/api/bank', route => route.fulfill({ body: bytes, contentType: 'application/json', headers: { 'X-Evidence-Sha256': sha } }));
});

async function chooseProgramme(page: Page, index: number, id: string) {
    const labels = ['Elegir primer programa', 'Elegir segundo programa', 'Añadir tercero'];
    await page.getByRole('button', { name: labels[index], exact: true }).click();
    await panel(page, 'picker').getByRole('button', { name: name(id), exact: true }).click();
    await expect(panel(page, 'picker')).toHaveCount(0);
    await expect(slot(page, index)).toContainText(name(id));
}
async function selectProgrammes(page: Page, ids: string[]) {
    for (const [index, id] of ids.entries()) await chooseProgramme(page, index, id);
    await page.getByRole('button', { name: 'Comparar programas', exact: true }).click();
    await expect(page.locator('.comparison-proposal')).toHaveCount(6);
}
async function completeStarter(page: Page, answers: Record<string, string> = {}, defaultAnswer = 'Muy de acuerdo') {
    await page.goto('/questionnaire');
    await page.getByRole('button', { name: 'Empezar el test', exact: true }).click();
    for (let index = 0; index < 20; index++) {
        const id = (await page.locator('.quiz-card').getAttribute('data-question-id'))!;
        await page.locator('.quiz-card').getByRole('radio', { name: answers[id] ?? (id === 'rent-price-cap' && defaultAnswer === 'Muy de acuerdo' ? 'Muy en desacuerdo' : defaultAnswer), exact: true }).click();
        await expect(page.locator('.quiz-card[data-question-id="' + id + '"]')).toHaveCount(0);
    }
    await page.getByRole('button', { name: 'Ver mi resultado', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Tus resultados', exact: true })).toBeVisible();
}
async function findResult(page: Page, id: string) {
    await page.locator('.result-search input').fill(name(id));
    await expect(resultRow(page, id)).toBeVisible();
    return resultRow(page, id);
}
async function sourceAction(row: Locator) {
    return row.getByRole('button', { name: /Ver fuente/ }).first();
}
async function proposalIds(page: Page) {
    return page.locator('.comparison-proposal').evaluateAll(rows => rows.map(row => (row as HTMLElement).dataset.questionId));
}
async function currentResultValues(page: Page) {
    return page.locator('.affinity-row').evaluateAll(rows => rows.map(row => ({ id: (row as HTMLElement).dataset.profileId, value: row.querySelector('.affinity-value')?.textContent })));
}
async function expectMemoryOnly(page: Page) {
    expect(await page.evaluate(async () => ({ search: location.search, hash: location.hash, history: history.state, local: Object.keys(localStorage), session: Object.keys(sessionStorage), databases: await indexedDB.databases() }))).toEqual({ search: '', hash: '', history: null, local: [], session: [], databases: [] });
}

// These regressions exercise the owner-approved v2 flows; the retired topic browser,
// comparison transfer and single-answer review no longer describe public behavior.
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
    for (const path of ['/comparison', '/method']) {
        await page.goto(path);
        const heading = await page.locator('#app h2:visible').first().textContent();
        await page.evaluate(alias => history.replaceState(null, '', alias), path);
        await page.locator('.site-footer').getByRole('link', { name: 'Privacidad', exact: true }).click();
        await expect(page.locator('#app').getByRole('heading', { name: 'Tus respuestas se quedan contigo', exact: true })).toBeVisible();

        await page.goBack();

        await expect(page).toHaveURL(new RegExp(path + '$'));
        await expect(page.locator('#app h2:visible').first()).toHaveText(heading!);
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

test('A03 A04 A08: slots choose one formation at a time, defer the third and require explicit comparison', async ({ page }) => {
    await page.goto('/comparison');
    await expect(page.getByRole('button', { name: 'Comparar programas', exact: true }).and(page.locator(':enabled'))).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Añadir tercero', exact: true })).toHaveCount(0);
    await expect(page.locator('.comparison-proposal')).toHaveCount(0);
    await chooseProgramme(page, 0, 'boe-2023-001');
    await expect(page.getByRole('button', { name: 'Añadir tercero', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Comparar programas', exact: true }).and(page.locator(':enabled'))).toHaveCount(0);
    await page.getByRole('button', { name: 'Elegir segundo programa', exact: true }).click();
    const picker = panel(page, 'picker');
    const search = picker.getByRole('searchbox', { name: 'Buscar una formación', exact: true });
    await expect(picker.locator('[data-profile-id]')).toHaveCount(59);
    const collator = new Intl.Collator('es');
    const alphabeticalProfiles = [...bank.programmeProfiles!].sort((first, second) => collator.compare(first.name, second.name));
    expect(await picker.locator('[data-profile-id]').evaluateAll(rows => rows.map(row => (row as HTMLElement).dataset.profileId))).toEqual(alphabeticalProfiles.map(profile => profile.id));
    await expect(picker.locator('[data-profile-id="boe-2023-001-p1"]')).toContainText('Ya elegido');
    await expect(picker.locator('[data-profile-id="boe-2023-001-p1"]').getByRole('button')).toHaveCount(0);
    await search.fill('fuerza civica');
    await expect(search).toBeFocused();
    await picker.getByRole('button', { name: name('boe-2023-059'), exact: true }).click();
    await expect(slot(page, 1)).toContainText(name('boe-2023-059'));
    await expect(page.getByRole('button', { name: 'Añadir tercero', exact: true })).toBeEnabled();
    await expect(page.locator('.comparison-proposal')).toHaveCount(0);
    await chooseProgramme(page, 2, 'boe-2023-005');
    await expect(page.getByRole('button', { name: 'Añadir tercero', exact: true })).toHaveCount(0);
    await expect(page.locator('.programme-slot')).toHaveCount(3);

    await page.getByRole('button', { name: 'Comparar programas', exact: true }).click();

    await expect(page.locator('.comparison-proposal')).toHaveCount(6);
    await expect(comparison(page, 'rent-price-cap')).toContainText('No hemos encontrado su programa común de 2023');
    await page.getByRole('button', { name: 'Cambiar: ' + name('boe-2023-005'), exact: true }).click();
    await panel(page, 'picker').getByRole('button', { name: 'Quitar: ' + name('boe-2023-005'), exact: true }).click();
    await expect(comparison(page, 'rent-price-cap').locator('.comparison-cell')).toHaveCount(2);
    await page.getByRole('button', { name: 'Cambiar: ' + name('boe-2023-001'), exact: true }).click();
    await expect(panel(page, 'picker').getByRole('button', { name: /^Quitar:/ })).toHaveCount(0);
    await page.keyboard.press('Escape');
});

test('A04 A08: closing a replacement cancels its query while a confirmed choice changes only its slot', async ({ page }) => {
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-001', 'boe-2023-004']);
    await proposalSearch(page).fill('alquiler');
    const proposal = comparison(page, 'rent-price-cap');
    await proposal.getByRole('button', { name: 'Mostrar citas', exact: true }).click();
    const before = await proposal.textContent();
    const opener = page.getByRole('button', { name: 'Cambiar: ' + name('boe-2023-001'), exact: true });
    for (const close of ['button', 'escape']) {
        await opener.click();
        const picker = panel(page, 'picker');
        await expect(picker.getByRole('heading', { name: 'Cambiar: ' + name('boe-2023-001'), exact: true })).toBeVisible();
        await expect(picker.locator('[data-profile-id="boe-2023-001-p1"]')).toContainText('Actual');
        const lastFormation = picker.locator('[data-profile-id]').last(); await lastFormation.scrollIntoViewIfNeeded();
        await expect(lastFormation).toBeInViewport();
        const search = picker.getByRole('searchbox', { name: 'Buscar una formación', exact: true });
        await expect(search).toBeInViewport({ ratio: 1 });
        await search.click(); await search.fill('PSOE');
        await expect(search).toBeFocused();
        if (close === 'button') await picker.getByRole('button', { name: 'Cerrar', exact: true }).click();
        else await page.keyboard.press('Escape');
        await expect(opener).toBeFocused(); await expect(proposal).toHaveText(before!);
        await expect(proposalSearch(page)).toHaveValue('alquiler');
    }
    await opener.click();
    await expect(panel(page, 'picker').getByRole('searchbox')).toHaveValue('');

    await panel(page, 'picker').getByRole('button', { name: name('boe-2023-002'), exact: true }).click();

    await expect(slot(page, 0)).toContainText(name('boe-2023-002'));
    await expect(slot(page, 1)).toContainText(name('boe-2023-004'));
    await expect(proposalSearch(page)).toHaveValue('alquiler');
    await expect(proposal.getByRole('button', { name: 'Ocultar citas', exact: true })).toHaveAttribute('aria-expanded', 'true');
    await expect(proposal.locator('.comparison-cell')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Cambiar: ' + name('boe-2023-002'), exact: true })).toBeFocused();
});

test('A05 A07 A31: presentation keeps dental and mortgage conditions and treats unavailable programmes separately', async ({ page }) => {
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-002', 'boe-2023-004', 'boe-2023-005']);
    await proposalSearch(page).fill(question('public-dental-care').text);
    const dental = comparison(page, 'public-dental-care');
    await expect(dental).toContainText('75 años');
    await expect(dental).toContainText('No hemos encontrado su programa común de 2023');
    await proposalSearch(page).fill(question('public-young-home-mortgage-guarantees').text);
    const mortgage = comparison(page, 'public-young-home-mortgage-guarantees');
    await expect(mortgage).toContainText('20 %'); await expect(mortgage).toContainText('35 años'); await expect(mortgage).toContainText('primera vivienda habitual');
    await proposalSearch(page).fill(question('rent-price-cap').text);
    const rent = comparison(page, 'rent-price-cap');
    await expect(rent.locator('[data-profile-id="boe-2023-002-p1"] .stance')).toHaveText('No podemos confirmar su postura sobre esta propuesta.');
    await expect(rent.locator('[data-profile-id="boe-2023-004-p1"] .stance')).toHaveText('Apoyo a la propuesta');
});

test('A13 A31: two unavailable programmes never become a documented agreement or opposition', async ({ page }) => {
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-005', 'boe-2023-015']);
    const proposal = comparison(page, 'rent-price-cap');
    await expect(proposal.locator('.comparison-cell')).toHaveCount(2);
    for (const stance of await proposal.locator('.stance').all()) await expect(stance).not.toContainText(/Apoyo a la propuesta|Rechazo a la propuesta/);
    for (const cell of await proposal.locator('.comparison-cell').all()) await expect(cell).toContainText(/No hemos encontrado|Sin postura documentada|No podemos confirmar/);
    await expect(proposal.getByRole('button', { name: /Ver fuente/ })).toHaveCount(0);
});

test('A09 A32: category search appends six without duplicates and clearing restores the unfiltered loaded count', async ({ page }) => {
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-001', 'boe-2023-004']);
    expect(await proposalIds(page)).toEqual(bank.questions.slice(0, 6).map(item => item.id));
    await page.getByRole('button', { name: 'Mostrar 6 más', exact: true }).click();
    const firstTwelve = bank.questions.slice(0, 12).map(item => item.id);
    expect(await proposalIds(page)).toEqual(firstTwelve);
    const search = proposalSearch(page); await search.fill('  INSTITUCIONES   ');
    await expect(search).toBeFocused();
    const institutions = bank.questions.filter(item => item.topicId === 'institutions').map(item => item.id);
    expect(await proposalIds(page)).toEqual(institutions.slice(0, 6));
    await page.getByRole('button', { name: 'Mostrar 6 más', exact: true }).click();
    expect(await proposalIds(page)).toEqual(institutions.slice(0, 12));
    await page.getByRole('button', { name: 'Mostrar 6 más', exact: true }).click();
    expect(await proposalIds(page)).toEqual(institutions);
    await expect(comparison(page, 'single-national-congress-constituency')).toBeVisible();

    await page.getByRole('button', { name: 'Borrar búsqueda', exact: true }).click();

    await expect(search).toHaveValue(''); await expect(search).toBeFocused();
    expect(await proposalIds(page)).toEqual(firstTwelve);
    await search.fill('  EDUCACION   ');
    expect(await proposalIds(page)).toEqual(bank.questions.filter(item => item.topicId === 'education').slice(0, 6).map(item => item.id));
    await search.fill('instituciones tramites');
    await expect(comparison(page, 'keep-in-person-public-services')).toBeVisible();
    await expect(comparison(page, 'rent-price-cap')).toHaveCount(0);

    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
    const expectedMatches = (query: string) => {
        const terms = normalize(query).trim().split(/\s+/);
        return bank.questions.filter(item => {
            const topic = bank.topics.find(topic => topic.id === item.topicId)!.name;
            const searchable = normalize([item.text, item.help ?? '', topic].join(' '));
            return terms.every(term => searchable.includes(term));
        }).map(item => item.id);
    };
    const inputNode = (await search.elementHandle())!;
    for (const query of ['Sanidad', 'salud', 'dental', 'sanidad dental']) {
        await search.fill(query);
        await expect(search).toHaveValue(query); await expect(search).toBeFocused();
        expect(await proposalIds(page)).toEqual(expectedMatches(query).slice(0, 6));
        expect(await inputNode.evaluate(node => node.isConnected && node === document.activeElement)).toBe(true);
    }

    await search.dispatchEvent('compositionstart', { data: '' });
    for (const value of ['sanidad d', 'sanidad dental']) {
        await search.evaluate((node, value) => {
            (node as HTMLInputElement).value = value;
            node.dispatchEvent(new InputEvent('input', { bubbles: true, data: value, inputType: 'insertCompositionText', isComposing: true }));
        }, value);
        await expect(search).toHaveValue(value); await expect(search).toBeFocused();
        expect(await inputNode.evaluate(node => node.isConnected && node === document.activeElement)).toBe(true);
    }
    await search.dispatchEvent('compositionend', { data: 'sanidad dental' });
    await search.dispatchEvent('input', { data: 'sanidad dental', inputType: 'insertText', isComposing: false });
    await expect(search).toHaveValue('sanidad dental'); await expect(search).toBeFocused();
    expect(await proposalIds(page)).toEqual(expectedMatches('sanidad dental').slice(0, 6));
    expect(await inputNode.evaluate(node => node.isConnected && node === document.activeElement)).toBe(true);
    await inputNode.dispose();
});

test('A09 A32: search recovery and source return preserve programmes without traffic or persistent state', async ({ page, context }) => {
    const requests: { url: string; method: string; body: string | null }[] = [];
    page.on('request', request => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-001', 'boe-2023-004']);
    const search = proposalSearch(page); await search.fill('zzzz-no-existent-workspace-proposal');
    await expect(page.locator('#app')).toContainText('No encontramos propuestas con esas palabras.');
    await expect(page.locator('.comparison-proposal')).toHaveCount(0);
    await page.getByRole('button', { name: 'Borrar búsqueda', exact: true }).click();
    await expect(search).toHaveValue(''); await expect(search).toBeFocused();
    await search.fill('PSICOTERAPIA');
    const match = comparison(page, 'public-psychotherapy-care');
    await expect(page.locator('.comparison-proposal')).toHaveCount(1);
    expect(await match.locator('.comparison-cell').evaluateAll(cells => cells.map(cell => (cell as HTMLElement).dataset.profileId))).toEqual(['boe-2023-001-p1', 'boe-2023-004-p1']);
    const opener = match.getByRole('button', { name: 'Ver fuente: ' + name('boe-2023-004'), exact: true });
    await opener.click(); await expect(panel(page, 'source').locator('blockquote').first()).toBeVisible();
    await panel(page, 'source').getByRole('button', { name: 'Cerrar', exact: true }).click();
    await expect(search).toHaveValue('PSICOTERAPIA'); await expect(opener).toBeFocused();
    await expect(page.locator('.own-answer, .affinity-row')).toHaveCount(0);
    expect(requests.filter(request => request.method !== 'GET' || request.body !== null)).toEqual([]);
    expect(requests.filter(request => /PSICOTERAPIA|no-existent-workspace-proposal|questionId=|profileId=|search=|selected=/i.test(request.url))).toEqual([]);
    expect(await context.cookies()).toEqual([]); await expectMemoryOnly(page);
});

test('A06 A10: two or three programmes have one proposal and stance per formation on desktop and mobile', async ({ page }) => {
    for (const ids of [['boe-2023-001', 'boe-2023-004'], ['boe-2023-001', 'boe-2023-003', 'boe-2023-004']]) {
        for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
            await page.setViewportSize(viewport); await page.goto('/comparison'); await selectProgrammes(page, ids);
            await expect(proposalSearch(page)).toBeVisible();
            await expect(page.getByRole('combobox')).toHaveCount(0);
            const nuclear = comparison(page, 'extend-existing-nuclear');
            expect(await nuclear.evaluate(node => node.tagName)).toBe('ARTICLE');
            await expect(nuclear.locator('.comparison-cell')).toHaveCount(ids.length);
            await expect(nuclear.locator('.stance')).toHaveCount(ids.length);
            await expect(nuclear.locator('.rationale')).toHaveCount(ids.length);
            for (const id of ids) await expect(nuclear.getByRole('heading', { name: name(id), exact: true })).toHaveCount(1);
            const cells = await nuclear.locator('.comparison-cell').evaluateAll(nodes => nodes.map(node => { const box = node.getBoundingClientRect(); return { x: box.x, y: box.y }; }));
            for (let index = 1; index < cells.length; index++) {
                if (viewport.width > 1000) { expect(cells[index].y).toBeCloseTo(cells[0].y, 0); expect(cells[index].x).toBeGreaterThan(cells[index - 1].x); }
                else { expect(cells[index].x).toBeCloseTo(cells[0].x, 0); expect(cells[index].y).toBeGreaterThan(cells[index - 1].y); }
            }
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
    }
});

test('A05 A11: keyboard quote expansion preserves all exact literals, alignment and unknown positions through source return', async ({ page }) => {
    const ids = ['boe-2023-001', 'boe-2023-002', 'boe-2023-004'];
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/comparison'); await selectProgrammes(page, ids);
    const proposal = comparison(page, 'rent-price-cap');
    const summaries = await proposal.locator('.rationale').allTextContents();
    const reveal = proposal.getByRole('button', { name: 'Mostrar citas', exact: true });
    await expect(reveal).toHaveAttribute('aria-expanded', 'false');
    await reveal.focus(); await page.keyboard.press('Enter');
    const hide = proposal.getByRole('button', { name: 'Ocultar citas', exact: true });
    await expect(hide).toBeFocused(); await expect(hide).toHaveAttribute('aria-expanded', 'true');
    await expect(proposal.locator('.comparison-quotes:visible')).toHaveCount(3);
    expect((await hide.getAttribute('aria-controls'))!.split(' ')).toEqual(await proposal.locator('.comparison-quotes').evaluateAll(quotes => quotes.map(quote => quote.id)));
    for (const id of ids) await expect(proposal.locator('.comparison-cell[data-profile-id="' + id + '-p1"] .comparison-quotes blockquote')).toHaveText(bank.positions[id]['rent-price-cap'].citations.map(citation => citation.quote));
    const starts = await proposal.locator('.comparison-quotes').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
    for (const start of starts) expect(start).toBeCloseTo(starts[0], 0);
    const opener = proposal.getByRole('button', { name: 'Ver fuente: ' + name('boe-2023-004'), exact: true });
    await opener.click();
    await expect(panel(page, 'source').locator('.literal-source blockquote')).toHaveText(bank.positions['boe-2023-004']['rent-price-cap'].citations.map(citation => citation.quote));
    await page.setViewportSize({ width: 390, height: 844 });
    await panel(page, 'source').getByRole('button', { name: 'Cerrar', exact: true }).click();
    await expect(opener).toBeFocused(); await expect(hide).toHaveAttribute('aria-expanded', 'true');
    await expect(proposal.locator('.rationale')).toHaveText(summaries);
    await hide.focus(); await page.keyboard.press('Space');
    await expect(reveal).toBeFocused(); await expect(reveal).toHaveAttribute('aria-expanded', 'false');
    await expect(proposal.locator('.comparison-quotes:visible')).toHaveCount(0);
});

test('A11: the source modal presents the exact quote first and closes without expanding inline quotes', async ({ page }) => {
    const citation = bank.positions['boe-2023-004']['rent-price-cap'].citations[0];
    for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(viewport); await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-001', 'boe-2023-004']);
        const proposal = comparison(page, 'rent-price-cap');
        const opener = proposal.getByRole('button', { name: 'Ver fuente: ' + name('boe-2023-004'), exact: true });
        await opener.click();
        const source = panel(page, 'source'); const quote = source.locator('.literal-source blockquote').first();
        await expect(quote).toHaveText(citation.quote); await expect(quote).toBeInViewport({ ratio: 0.9 });
        await expect(source.getByText('Leer el contexto original', { exact: true })).toHaveCount(0);
        await expect(source.locator('.source-interpretation')).toHaveCount(0);
        await expect(source.getByRole('link').first()).toHaveAttribute('rel', 'noopener noreferrer');
        await page.keyboard.press('Escape');
        await expect(opener).toBeFocused();
        await expect(proposal.getByRole('button', { name: 'Mostrar citas', exact: true })).toHaveAttribute('aria-expanded', 'false');
    }
});

test('A11 A24: modal focus is contained, background geometry stays fixed and only a complete backdrop click cancels', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-001', 'boe-2023-004']);
    const opener = await sourceAction(comparison(page, 'rent-price-cap')); await opener.scrollIntoViewIfNeeded();
    const before = await page.locator('#app').boundingBox(); const scroll = await page.evaluate(() => scrollY); const address = page.url();
    await opener.click(); const source = panel(page, 'source');
    await expect(page.getByRole('dialog')).toHaveCount(1); expect(page.url()).toBe(address);
    const after = await page.locator('#app').boundingBox(); expect(after!.x).toBeCloseTo(before!.x, 0); expect(after!.width).toBeCloseTo(before!.width, 0);
    for (let index = 0; index < 12; index++) { await page.keyboard.press('Tab'); expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true); }
    const box = (await source.boundingBox())!;
    expect(box.x).toBeGreaterThan(8);
    await page.mouse.move(box.x + 30, box.y + 70); await page.mouse.down(); await page.mouse.move(box.x - 5, box.y + 70); await page.mouse.up();
    await expect(source).toBeVisible();

    await page.mouse.click(box.x - 5, box.y + 70);

    await expect(source).toHaveCount(0); await expect(opener).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBeCloseTo(scroll, 0);
    await expectMemoryOnly(page);
});

test('A11: multi-citation and longest literal quotes remain complete with natural height', async ({ page }) => {
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-002', 'boe-2023-004']);
    for (const [id, candidacyId] of [['birth-leave-at-least-six-months', 'boe-2023-002'], ['primary-care-doctors-work-until-seventy-two', 'boe-2023-004']]) {
        await proposalSearch(page).fill(question(id).text);
        const proposal = comparison(page, id); await proposal.getByRole('button', { name: 'Mostrar citas', exact: true }).click();
        const quotes = proposal.locator('.comparison-cell[data-profile-id="' + candidacyId + '-p1"] blockquote');
        await expect(quotes).toHaveText(bank.positions[candidacyId][id].citations.map(citation => citation.quote));
        expect(await quotes.evaluateAll(nodes => nodes.every(node => node.scrollHeight <= node.clientHeight + 1))).toBe(true);
        await proposal.getByRole('button', { name: 'Ver fuente: ' + name(candidacyId), exact: true }).click();
        await expect(panel(page, 'source').locator('.literal-source blockquote')).toHaveText(bank.positions[candidacyId][id].citations.map(citation => citation.quote));
        await panel(page, 'source').getByRole('button', { name: 'Cerrar', exact: true }).click();
    }
});

test('A29: deliberate finish shows all 59 cards with one detail action and no selection transfer', async ({ page }) => {
    await completeStarter(page);
    await expect(page.locator('.affinity-row')).toHaveCount(59);
    for (const row of await page.locator('.affinity-row').all()) {
        await expect(row.getByRole('button')).toHaveCount(1);
        await expect(row.getByRole('button', { name: /^Detalle:/ })).toHaveCount(1);
    }
    await expect(page.locator('#app').getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Comparar|Ver todas|Revisar esta respuesta/ })).toHaveCount(0);
    const before = await currentResultValues(page);
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
    await expect(page.getByRole('button', { name: 'Elegir primer programa', exact: true })).toBeVisible();
    await expect(page.locator('.own-answer, .affinity-row')).toHaveCount(0);
    await page.goBack();
    expect(await currentResultValues(page)).toEqual(before);
});

test('A30 A34: result tabs partition numeric answers and keep source return inside one panel', async ({ page }) => {
    await completeStarter(page, { 'phase-out-prescription-copay': 'Prefiero no responder', 'birth-leave-at-least-six-months': 'No lo tengo claro' });
    const row = await findResult(page, 'boe-2023-004'); const opener = row.getByRole('button', { name: 'Detalle: ' + name('boe-2023-004'), exact: true });
    await opener.click(); const detail = panel(page, 'result');
    await expect(detail.getByRole('tab')).toHaveCount(3);
    await expect(detail.locator('[data-topic-id]')).toHaveCount(10);
    await detail.getByRole('tab', { name: /^Coincides/ }).focus(); await page.keyboard.press('End');
    await expect(detail.getByRole('tab', { name: /^Sin datos/ })).toBeFocused();
    await expect(detail.getByRole('tab', { name: /^Sin datos/ })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home'); await expect(detail.getByRole('tab', { name: /^Coincides/ })).toBeFocused();
    const observed: string[] = [];
    for (const tabName of [/^Coincides/, /^Difieres/, /^Sin datos/]) {
        const tab = detail.getByRole('tab', { name: tabName }); await tab.click(); await expect(tab).toHaveAttribute('aria-selected', 'true');
        const ids = await detail.getByRole('tabpanel').locator('.result-example').evaluateAll(nodes => nodes.map(node => (node as HTMLElement).dataset.questionId!));
        const count = Number((await tab.textContent())!.match(/\d+/)![0]); expect(ids).toHaveLength(count); observed.push(...ids);
    }
    expect([...observed].sort()).toEqual(bank.starterQuestionIds!.filter(id => !['phase-out-prescription-copay', 'birth-leave-at-least-six-months'].includes(id)).sort());
    expect(new Set(observed).size).toBe(18);
    await detail.getByRole('tab', { name: /^Difieres/ }).click();
    const rent = detail.locator('.result-example[data-question-id="rent-price-cap"]'); await expect(rent).toBeVisible();
    const sourceOpener = rent.getByRole('button', { name: /Ver fuente/ }); await sourceOpener.scrollIntoViewIfNeeded();
    const detailScroll = await detail.locator('.panel-body').evaluate(node => node.scrollTop);
    await sourceOpener.click();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(panel(page, 'source').locator('blockquote').first()).toHaveText(bank.positions['boe-2023-004']['rent-price-cap'].citations[0].quote);
    await panel(page, 'source').getByRole('button', { name: 'Volver al detalle', exact: true }).click();
    await expect(detail.getByRole('tab', { name: /^Difieres/ })).toHaveAttribute('aria-selected', 'true'); await expect(sourceOpener).toBeFocused();
    expect(await detail.locator('.panel-body').evaluate(node => node.scrollTop)).toBeCloseTo(detailScroll, 0);
    await sourceOpener.click(); await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0); await expect(opener).toBeFocused();
    await expect(page.locator('.result-search input')).toHaveValue(name('boe-2023-004'));
});

test('A18 A30: result topic bars and tabs remain readable at 320 CSS pixels with 200 percent text', async ({ page }, info) => {
    await completeStarter(page);
    await (await findResult(page, 'boe-2023-004')).getByRole('button', { name: 'Detalle: ' + name('boe-2023-004'), exact: true }).click();
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('32px');
    const detail = panel(page, 'result'); const body = detail.locator('.panel-body');
    const tracks = detail.locator('.topic-count-track');
    await expect(tracks).toHaveCount(10);
    for (const [index, track] of (await tracks.all()).entries()) {
        await track.scrollIntoViewIfNeeded();
        expect((await track.boundingBox())!.width).toBeGreaterThan(0);
        await expect(track).toBeInViewport({ ratio: 1 });
        if (process.env.ITERATION_CAPTURE && [0, 4, 9].includes(index)) {
            const directory = 'outputs/ui-ux-cleanup-previews/flow-redesign-application/second-iteration';
            mkdirSync(directory, { recursive: true });
            await page.screenshot({ path: directory + '/' + info.project.name + '-result-text-200-320csspx-topic-' + (index + 1) + '.png' });
        }
    }
    expect(await body.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    for (const tab of await detail.getByRole('tab').all()) {
        await tab.focus();
        await expect(tab).toBeFocused(); await expect(tab).toBeInViewport({ ratio: 1 });
        const bounds = (await tab.boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
        await page.keyboard.press('Enter'); await expect(tab).toHaveAttribute('aria-selected', 'true');
        expect(await body.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
    await detail.getByRole('tab').first().focus(); await page.keyboard.press('ArrowDown');
    await expect(detail.getByRole('tab').nth(1)).toBeFocused();
    await expect(detail.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowUp');
    await expect(detail.getByRole('tab').first()).toBeFocused();
    await expect(detail.getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Escape'); await expect(detail).toHaveCount(0);
});

test('A30 A31: skipped and unsure answers create no personal bars and missing programmes stay unscored', async ({ page }) => {
    await completeStarter(page, { 'rent-price-cap': 'Prefiero no responder' }, 'No lo tengo claro');
    await expect(page.locator('.affinity-row')).toHaveCount(59);
    const row = await findResult(page, 'boe-2023-005');
    await expect(row).not.toContainText(/\d+\s*%/);
    await row.getByRole('button', { name: 'Detalle: ' + name('boe-2023-005'), exact: true }).click();
    const detail = panel(page, 'result');
    await expect(detail.locator('[data-topic-id]')).toHaveCount(10);
    await expect(detail).toContainText('Sin respuesta tuya');
    for (const tab of await detail.getByRole('tab').all()) { await expect(tab).toContainText('0'); await tab.click(); await expect(detail.locator('.result-example:visible')).toHaveCount(0); }
    await expect(detail).not.toContainText(/\d+\s*%/);
});

test('A35: continuing invalidates personal panels and results until another deliberate finish', async ({ page }) => {
    await completeStarter(page);
    await (await findResult(page, 'boe-2023-004')).getByRole('button', { name: 'Detalle: ' + name('boe-2023-004'), exact: true }).click();
    await panel(page, 'result').getByRole('button', { name: 'Cerrar', exact: true }).click();
    await page.getByRole('button', { name: 'Seguir contestando', exact: true }).click();
    await expect(page.locator('.quiz-card')).toBeVisible();
    await expect(page.locator('.affinity-row, .own-answer, .result-example, dialog[data-panel-kind="result"]')).toHaveCount(0);
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
    await expect(page.locator('.own-answer, .affinity-row')).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: 'Mostrar mis respuestas', exact: true })).toHaveCount(0);
    await page.goBack();
    await expect(page.locator('.quiz-card')).toBeVisible();
    await expect(page.locator('.affinity-row, .result-example')).toHaveCount(0);
});

test('A20 A33 A36: the native teaching switch and calculation panel leave a selected quiz answer unchanged', async ({ page }) => {
    await page.goto('/questionnaire'); await page.getByRole('button', { name: 'Empezar el test', exact: true }).click();
    const id = await page.locator('.quiz-card').getAttribute('data-question-id');
    await page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true }).focus(); await page.keyboard.press('ArrowRight');
    const meaning = page.locator('.quiz-card .question-help summary'); await meaning.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.quiz-card .question-help')).toHaveAttribute('open', '');
    await page.keyboard.press('Enter'); await expect(meaning).toBeFocused();
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Cómo funciona', exact: true }).click();
    const information = page.getByRole('switch', { name: 'Añadir información al ejemplo', exact: true });
    expect(await information.evaluate(node => node.tagName)).toBe('INPUT');
    await expect(information).not.toBeChecked();
    const example = page.locator('[data-method-example]:visible');
    await expect(example.locator('[data-example-overlap]')).toHaveText('40 %');
    await expect(example.locator('[data-example-coverage]')).toHaveText('40 %');
    const height = (await example.boundingBox())!.height;
    await information.focus(); await page.keyboard.press('Space');
    await expect(information).toBeChecked(); await expect(information).toBeFocused();
    await expect(example.locator('[data-example-overlap]')).toHaveText('40 %'); await expect(example.locator('[data-example-coverage]')).toHaveText('80 %');
    expect((await example.boundingBox())!.height).toBeCloseTo(height, 0);
    const calculation = page.getByRole('button', { name: 'Detalle del cálculo', exact: true }); await calculation.click();
    await expect(panel(page, 'calculation')).toBeVisible(); await page.keyboard.press('Escape'); await expect(calculation).toBeFocused();
    await expect(information).toBeChecked();
    await page.locator('[data-return-context]:visible').click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', id!);
    await expect(page.getByRole('radio', { name: 'En desacuerdo', exact: true })).toBeChecked();
});

for (const failure of ['unavailable', 'invalid-hash'] as const) {
    for (const path of ['/method', '/how-it-works']) {
        test('A19 A22: method calculation remains available after ' + failure + ' at ' + path, async ({ page, context }) => {
            await page.route('**/api/bank', route => route.fulfill(failure === 'unavailable'
                ? { status: 503 }
                : { body: '{}', contentType: 'application/json', headers: { 'X-Evidence-Sha256': '0'.repeat(64) } }));
            await page.goto(path);
            const information = page.getByRole('switch', { name: 'Añadir información al ejemplo', exact: true });
            await expect(information).toBeVisible();
            const example = page.locator('#app [data-method-example]');
            await expect(example.locator('[data-example-coverage]')).toHaveText('40 %');
            await information.focus(); await page.keyboard.press('Space');
            await expect(information).toBeChecked(); await expect(information).toBeFocused();
            await expect(example.locator('[data-example-overlap]')).toHaveText('40 %');
            await expect(example.locator('[data-example-coverage]')).toHaveText('80 %');
            await expect(page.locator('#app .calculation-content:visible')).toHaveCount(0);
            const calculation = page.getByRole('button', { name: 'Detalle del cálculo', exact: true });
            await calculation.click();
            await expect(panel(page, 'calculation')).toContainText('1 − |respuesta − postura| / 4');
            await expect(panel(page, 'calculation')).toContainText('Empiezas con 20 preguntas de diez temas.');
            await page.keyboard.press('Escape');
            await expect(page.getByRole('dialog')).toHaveCount(0); await expect(calculation).toBeFocused();
            await expect(page.locator('.quiz-card, .affinity-row, .own-answer')).toHaveCount(0);
            expect(await context.cookies()).toEqual([]); await expectMemoryOnly(page);
        });
    }
}

test('A25: readable download is explicit, cancellable and remains local', async ({ page, context }) => {
    const requests: { url: string; method: string; body: string | null }[] = [];
    page.on('request', request => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
    await completeStarter(page); let downloads = 0; page.on('download', () => downloads++);
    const opener = page.getByRole('button', { name: 'Descargar resultados', exact: true }); await opener.click();
    await expect(page.getByRole('dialog')).toContainText('respuestas políticas');
    await page.keyboard.press('Escape'); await expect(opener).toBeFocused(); expect(downloads).toBe(0);
    await opener.click(); const downloading = page.waitForEvent('download');
    await page.getByRole('dialog').getByRole('button', { name: 'Descargar archivo legible', exact: true }).click();
    const download = await downloading; const text = readFileSync((await download.path())!, 'utf8');
    expect(text).toContain('Coincidencia confirmada'); expect(text).toContain('Información disponible'); expect(text).toContain(question('rent-price-cap').text); expect(text).toContain('Muy en desacuerdo');
    await expect(opener).toBeFocused(); expect(downloads).toBe(1);
    expect(requests.filter(request => request.method !== 'GET' || request.body !== null)).toEqual([]);
    expect(requests.filter(request => /answers=|questionId=|profileId=|search=|finish=|selected=/.test(request.url))).toEqual([]);
    expect(await context.cookies()).toEqual([]); await expectMemoryOnly(page);
});

test('A04 A37: source factsheets are read-only and retain comparison choices and directory search', async ({ page }) => {
    await page.goto('/comparison'); await selectProgrammes(page, ['boe-2023-001', 'boe-2023-004']);
    await proposalSearch(page).fill('alquiler');
    await page.getByRole('link', { name: 'Fuentes', exact: true }).click();
    await expect(page.locator('.directory-row')).toHaveCount(59);
    const search = page.getByRole('searchbox', { name: 'Buscar una formación', exact: true }); await search.fill('PSC');
    const psc = page.locator('.directory-row[data-profile-id="boe-2023-005-p1"]');
    await expect(psc).toContainText('No hemos encontrado su programa común de 2023');
    const opener = psc.getByRole('button', { name: /Ver (?:ficha y )?documentos/ }); await opener.click();
    await expect(panel(page, 'factsheet')).toContainText('2023');
    await expect(panel(page, 'factsheet').getByRole('link')).toHaveCount(0);
    await expect(panel(page, 'factsheet').getByRole('button', { name: /Añadir|Comparar/ })).toHaveCount(0);
    await panel(page, 'factsheet').getByRole('button', { name: 'Cerrar', exact: true }).click();
    await expect(search).toHaveValue('PSC'); await expect(opener).toBeFocused();
    await search.fill('Fuerza Civica');
    await page.locator('.directory-row[data-profile-id="boe-2023-059-p1"]').getByRole('button', { name: /Ver (?:ficha y )?documentos/ }).click();
    await expect(panel(page, 'factsheet').getByRole('link').first()).toHaveAttribute('rel', 'noopener noreferrer');
    await panel(page, 'factsheet').getByRole('button', { name: 'Cerrar', exact: true }).click();
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
    await expect(slot(page, 0)).toContainText(name('boe-2023-001')); await expect(slot(page, 1)).toContainText(name('boe-2023-004'));
    await expect(proposalSearch(page)).toHaveValue('alquiler');
});

test('A02 A24: browser Back closes the panel and navigates the section without adding a modal history entry', async ({ page }) => {
    await page.goto('/method');
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
    await page.getByRole('button', { name: 'Elegir primer programa', exact: true }).click();
    await expect(panel(page, 'picker')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/method$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('switch', { name: 'Añadir información al ejemplo', exact: true })).toBeVisible();
});

test('A19 A24: reduced motion cancels panel animation without losing close or focus behavior', async ({ page }) => {
    await page.goto('/comparison');
    const opener = page.getByRole('button', { name: 'Elegir primer programa', exact: true }); await opener.click();
    await expect(panel(page, 'picker')).toBeVisible();
    expect(await panel(page, 'picker').evaluate(node => node.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(false);
    await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await opener.click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(panel(page, 'picker')).toBeVisible();
    await expect.poll(() => panel(page, 'picker').evaluate(node => node.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(false);
    await page.keyboard.press('Escape'); await expect(panel(page, 'picker')).toHaveCount(0); await expect(opener).toBeFocused();
});
