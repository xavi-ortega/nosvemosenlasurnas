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
    await expect(page.getByRole('heading', { name: 'Tus coincidencias con los programas de 2023', exact: true })).toBeVisible();
}
async function screenshot(page: Page, name: string, project: string) {
    if (!process.env.ITERATION_CAPTURE) return;
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
    mkdirSync('outputs/quiz-2023-second-iteration-previews', { recursive: true });
    await page.screenshot({ path: 'outputs/quiz-2023-second-iteration-previews/' + project + '-' + name + '.png', fullPage: false, animations: 'disabled' });
}
const programmeRow = (page: Page, id: string) => page.locator('.affinity-row[data-profile-id="' + id + '"]');
const reader = (page: Page) => page.locator('.programme-reader:not([hidden])');
async function openPublicProposal(page: Page, id: string) {
    await page.getByRole('button', { name: 'Buscar una propuesta', exact: true }).click();
    const text = bank.questions.find(q => q.id === id)!.text;
    await page.getByRole('searchbox', { name: 'Buscar una propuesta', exact: true }).fill(text);
    await page.getByRole('button', { name: text, exact: true }).click();
}
async function showAllResults(page: Page) {
    await page.getByRole('button', { name: 'Ver todas las 59 formaciones', exact: true }).click();
    await expect(page.locator('.affinity-row')).toHaveCount(59);
}
async function downloadTechnicalResults(page: Page) {
    await page.getByRole('button', { name: 'Descargar mis resultados', exact: true }).click();
    const download = page.waitForEvent('download');
    await page.getByRole('dialog').getByRole('button', { name: 'Descargar datos completos (JSON)', exact: true }).click();
    return (await download).path();
}


type MotionSample = { time: number; id: string; checked: string | null; x: number; opacity: number; overflow: boolean; moving: boolean };
type MotionWindow = typeof window & { quizMotionSamples: { active: boolean; samples: MotionSample[] } };
async function observeQuestionMotion(page: Page, trigger: () => Promise<unknown>): Promise<MotionSample[]> {
    await page.evaluate(() => {
        const state = { active: true, samples: [] as MotionSample[] }; (window as MotionWindow).quizMotionSamples = state;
        const sample = () => {
            if (!state.active) return;
            const stage = document.querySelector<HTMLElement>('.quiz-card');
            if (stage) {
                const style = getComputedStyle(stage);
                state.samples.push({ time: performance.now(), id: stage.dataset.questionId!, checked: stage.querySelector<HTMLInputElement>('input:checked')?.value ?? null, x: style.transform === 'none' ? 0 : new DOMMatrixReadOnly(style.transform).m41, opacity: Number(style.opacity), overflow: document.documentElement.scrollWidth > innerWidth, moving: stage.getAnimations({ subtree: true }).some(animation => animation.playState === 'running') });
            }
            requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
    });
    await trigger();
    await expect(page.locator('.quiz-card input[type=radio]').first()).toBeEnabled();
    return page.evaluate(() => { const state = (window as MotionWindow).quizMotionSamples; state.active = false; return state.samples; });
}

test('confirmed answers remain visibly selected before forward motion and Back reverses the direction', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await start(page);
    const first = bank.starterQuestionIds![0]; const second = bank.starterQuestionIds![1];

    const forward = await observeQuestionMotion(page, () => page.getByRole('radio', { name: 'Muy de acuerdo', exact: true }).click());
    const confirmation = forward.filter(sample => sample.id === first && sample.checked === '2' && Math.abs(sample.x) < .1 && sample.opacity > .99);
    expect(confirmation.length).toBeGreaterThan(2);
    expect(confirmation.at(-1)!.time - confirmation[0].time).toBeGreaterThanOrEqual(60);
    expect(forward.some(sample => sample.id === first && sample.x < -.5)).toBe(true);
    expect(forward.some(sample => sample.id === second && sample.x > .5)).toBe(true);
    expect(forward.some(sample => sample.overflow)).toBe(false);
    await expect(page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true })).toBeFocused();

    const back = await observeQuestionMotion(page, () => page.getByRole('button', { name: 'Atrás', exact: true }).click());
    expect(back.some(sample => sample.id === second && sample.x > .5)).toBe(true);
    expect(back.some(sample => sample.id === first && sample.x < -.5)).toBe(true);
    expect(back.some(sample => sample.overflow)).toBe(false);
    await expect(page.getByRole('radio', { name: 'Muy de acuerdo', exact: true })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Muy de acuerdo', exact: true })).toBeFocused();
});

test('reduced motion preserves visible confirmation and automatic advancement without animated movement', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); await start(page);
    const first = bank.starterQuestionIds![0]; const second = bank.starterQuestionIds![1];

    const samples = await observeQuestionMotion(page, () => page.getByRole('radio', { name: 'No lo tengo claro', exact: true }).click());
    expect(samples.filter(sample => sample.id === first && sample.checked === 'unsure').length).toBeGreaterThan(2);
    expect(samples.some(sample => sample.x !== 0 || sample.moving)).toBe(false);
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', second);
    await expect(page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true })).toBeFocused();
});

test('quiz, reader and skip navigation focus only interactive controls', async ({ page }) => {
    await page.addInitScript(() => {
        const state = window as typeof window & { textFocusTargets: string[] }; state.textFocusTargets = [];
        document.addEventListener('focusin', event => {
            const target = event.target;
            if (target instanceof HTMLElement && !target.matches('a[href], button, input, select, textarea, summary')) state.textFocusTargets.push(target.tagName);
        });
    });
    await page.goto('/questionnaire');
    const startControl = page.getByRole('button', { name: 'Empezar el test', exact: true });
    await expect(startControl).toBeFocused();
    const skip = page.getByRole('link', { name: 'Saltar al contenido', exact: true });
    await skip.focus(); await page.keyboard.press('Enter'); await expect(startControl).toBeFocused();
    await page.keyboard.press('Enter');
    const negative = page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true });
    await expect(negative).toBeFocused();
    await expect(page.locator('.quiz-card fieldset')).toHaveAccessibleName(bank.questions.find(q => q.id === bank.starterQuestionIds![0])!.text);
    await page.keyboard.press('Space');
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', bank.starterQuestionIds![1]);
    await expect(negative).toBeFocused();
    await page.getByRole('button', { name: 'Atrás', exact: true }).click();
    await expect(negative).toBeChecked(); await expect(negative).toBeFocused();

    const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
    await navigation.locator('a[href$="/programmes"]').click();
    await openPublicProposal(page, 'rent-price-cap');
    const opener = page.locator('.position-row').first().getByRole('button', { name: /Ver fuente|Ver explicación/ }); await opener.click();
    await expect(reader(page).getByRole('button', { name: 'Volver a las posturas', exact: true })).toBeFocused();
    await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
    await navigation.getByRole('link', { name: 'Cómo funciona', exact: true }).click();
    await skip.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('[data-return-context]:visible')).toBeFocused();
    expect(await page.evaluate(() => (window as typeof window & { textFocusTargets: string[] }).textFocusTargets)).toEqual([]);
});

test('deferred entry focus respects the skip link selected before the next frame', async ({ page }) => {
    await page.addInitScript(() => {
        const state = window as typeof window & { deferredEntryFrames: FrameRequestCallback[] };
        state.deferredEntryFrames = [];
        window.requestAnimationFrame = callback => { state.deferredEntryFrames.push(callback); return state.deferredEntryFrames.length; };
    });
    await page.goto('/questionnaire');
    const startControl = page.getByRole('button', { name: 'Empezar el test', exact: true });
    await expect(startControl).toBeFocused();
    const skip = page.getByRole('link', { name: 'Saltar al contenido', exact: true });
    await skip.focus();
    await page.evaluate(() => {
        const state = window as typeof window & { deferredEntryFrames: FrameRequestCallback[] };
        state.deferredEntryFrames.splice(0).forEach(callback => callback(performance.now()));
    });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(startControl).toBeFocused();
    await expect(page.locator('.quiz-card')).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.locator('.quiz-card')).toBeVisible();
});

test('navigation and reset cancel pending advancement without losing a selected answer or restoring cleared state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); await start(page); await page.clock.install();
    const first = bank.starterQuestionIds![0];

    await page.evaluate(() => {
        document.querySelector<HTMLInputElement>('.quiz-card input[value="2"]')!.click();
        [...document.querySelectorAll<HTMLAnchorElement>('.site-header a')].find(link => new URL(link.href).pathname === '/')!.click();
    });
    await page.clock.fastForward(1000);
    await page.getByRole('button', { name: 'Volver a mi test', exact: true }).click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', first);
    await expect(page.getByRole('radio', { name: 'Muy de acuerdo', exact: true })).toBeChecked();

    await page.evaluate(() => {
        document.querySelector<HTMLInputElement>('.quiz-card input[value="1"]')!.click();
        document.querySelector<HTMLButtonElement>('.quiz-reset button')!.click();
    });
    await page.clock.fastForward(1000);
    await expect(page.getByRole('button', { name: 'Seguir con mis respuestas' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', first);
    await expect(page.getByRole('radio', { name: 'De acuerdo', exact: true })).toBeChecked();

    await page.evaluate(() => {
        document.querySelector<HTMLInputElement>('.quiz-card input[value="-2"]')!.click();
        document.querySelector<HTMLButtonElement>('.quiz-reset button')!.click();
    });
    await page.getByRole('dialog').getByRole('button', { name: 'Borrar respuestas', exact: true }).click();
    await page.clock.fastForward(1000);
    await expect(page.getByRole('button', { name: 'Empezar el test', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Empezar el test', exact: true }).click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', first);
    await expect(page.locator('.quiz-card input:checked')).toHaveCount(0);
});

test('reset dialog is centered and contained on desktop, small screens and text zoom', async ({ page }) => {
    await start(page);
    const opener = page.getByRole('button', { name: 'Borrar respuestas', exact: true });
    await opener.click(); const dialog = page.getByRole('dialog');

    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 700 }, { width: 320, height: 480 }, { width: 1024, height: 320 }]) {
        await page.setViewportSize(viewport);
        const box = (await dialog.boundingBox())!;
        expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(2);
        expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThanOrEqual(2);
        expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.width).toBeLessThanOrEqual(viewport.width); expect(box.height).toBeLessThanOrEqual(viewport.height);
        expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const zoom of ['200%', '400%']) {
        await page.evaluate(value => { document.documentElement.style.zoom = value; }, zoom);
        const box = (await dialog.boundingBox())!;
        expect(Math.abs(box.x + box.width / 2 - 720)).toBeLessThanOrEqual(2);
        expect(Math.abs(box.y + box.height / 2 - 500)).toBeLessThanOrEqual(2);
        expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.width).toBeLessThanOrEqual(1440); expect(box.height).toBeLessThanOrEqual(1000);
        expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
        await dialog.getByRole('button', { name: 'Borrar respuestas', exact: true }).scrollIntoViewIfNeeded();
        await expect(dialog.getByRole('button', { name: 'Borrar respuestas', exact: true })).toBeInViewport();
    }
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
    await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
});

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
    await expect(page.getByRole('radio', { name: 'Muy en desacuerdo', exact: true })).toBeFocused();
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
    await expect(page.getByRole('radio', { name: 'Muy de acuerdo', exact: true })).toBeEnabled();
    await page.getByRole('radio', { name: 'Muy de acuerdo', exact: true }).focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', second);
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Inicio', exact: true }).click();
    await page.getByRole('button', { name: 'Volver a mi test', exact: true }).click();
    await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', second);
});

test('UX01 UX05: rent disagreement reaches its exact quote in two actions with one accessible reader', async ({ page }, info) => {
    await start(page); await answer(page, 20);
    await expect(page.locator('#app')).not.toContainText('Sumar');
    await expect(page.locator('#app')).toContainText('Tu mayor coincidencia');
    await finish(page); await expect(page.locator('.affinity-row')).toHaveCount(6);
    await expect(page.locator('.affinity-row blockquote')).toHaveCount(0);
    await screenshot(page, 'results', info.project.name);
    await showAllResults(page);
    const p = bank.programmeProfiles!.find(p => p.candidacyId === 'boe-2023-004')!;
    const opener = programmeRow(page, p.id).getByRole('button', { name: 'En qué difieres', exact: true }); await opener.focus(); await page.keyboard.press('Enter');
    await expect(reader(page).getByRole('button', { name: 'Volver a resultados', exact: true })).toBeFocused();
    await expect(page.locator('[aria-modal="true"], [inert]')).toHaveCount(0);
    const rent = reader(page).locator('.result-example[data-question-id="rent-price-cap"]');
    await rent.getByRole('button', { name: /Ver fuente/ }).click();
    await expect(reader(page)).toContainText('Muy en desacuerdo');
    await expect(reader(page)).toContainText('Tu respuesta está en desacuerdo con la posición citada en esta propuesta.');
    await expect(reader(page).getByRole('link', { name: /Fuente oficial/ }).first()).toBeVisible();
    const quote = bank.positions[p.candidacyId]['rent-price-cap'].citations[0].quote;
    await expect(reader(page).locator('blockquote').first()).toHaveText(quote);
    await screenshot(page, 'rent-reader', info.project.name);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    if (info.project.name === 'chromium') {
        await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Inicio', exact: true }).focus(); await page.keyboard.press('Escape'); await expect(reader(page)).toBeVisible();
    }
    await reader(page).getByRole('button', { name: 'Cerrar detalle' }).focus(); await page.keyboard.press('Escape');
    await expect(opener).toBeFocused(); await expect(page.locator('.programme-reader')).toBeHidden();
});

test('UX02: closing an example from a low result row restores exact origin focus and scroll', async ({ page }) => {
    await start(page); await answer(page, 20); await finish(page); await showAllResults(page);
    const row = page.locator('.affinity-row').last(); const button = row.getByRole('button', { name: 'Qué no sabemos', exact: true }); await button.scrollIntoViewIfNeeded();
    const scroll = await page.evaluate(() => window.scrollY); await button.click();
    await reader(page).locator('.result-example').first().getByRole('button', { name: /Ver fuente|Ver explicación/ }).click();
    await reader(page).getByRole('button', { name: 'Cerrar detalle' }).click();
    await expect(button).toBeFocused(); await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(scroll, 0);
});

test('UX03 UX09: public proposal search keeps all positions, missing sources and search recovery reachable', async ({ page }, info) => {
    await page.goto('/programmes'); await openPublicProposal(page, 'rent-price-cap');
    await expect(page.locator('.position-row')).toHaveCount(6);
    const missing = bank.programmeProfiles!.find(p => !bank.documents.some(d => d.candidacyId === p.candidacyId))!;
    await page.getByRole('searchbox', { name: 'Buscar una formación', exact: true }).fill(missing.name);
    await page.locator('.position-row[data-profile-id="' + missing.id + '"]').getByRole('button', { name: /Ver explicación/ }).click();
    await expect(reader(page)).toContainText('No hemos encontrado su programa común de 2023'); await expect(reader(page).getByRole('link')).toHaveCount(0);
    await reader(page).getByRole('button', { name: 'Cerrar detalle' }).click();
    const sourceException = bank.programmeProfiles!.find(p => p.candidacyId === 'boe-2023-002')!;
    await page.getByRole('searchbox', { name: 'Buscar una formación', exact: true }).fill(sourceException.name);
    await page.locator('.position-row[data-profile-id="' + sourceException.id + '"]').getByRole('button', { name: /Ver fuente/ }).click();
    await expect(reader(page)).toContainText('Fuente oficial no localizada o no verificable');
    await expect(reader(page).getByRole('link', { name: /Copia conservada/ }).first()).toHaveAttribute('rel', 'noopener noreferrer');
    await screenshot(page, 'source-exception', info.project.name);
    await reader(page).getByRole('button', { name: 'Cerrar detalle' }).click();
    await page.getByRole('button', { name: 'Volver a la búsqueda', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Buscar una propuesta', exact: true }).fill('no-existent-proposal'); await expect(page.locator('#app')).toContainText('No encontramos propuestas');
    await page.getByRole('button', { name: 'Borrar búsqueda', exact: true }).click(); await expect(page.getByRole('searchbox', { name: 'Buscar una propuesta', exact: true })).toHaveValue('');
});

test('UX04: two or three common programmes keep their national position, source return and reversible removal', async ({ page }, info) => {
    await page.goto('/programmes');
    for (const id of ['boe-2023-002', 'boe-2023-003', 'boe-2023-004']) await page.getByRole('checkbox', { name: bank.programmeProfiles!.find(p => p.candidacyId === id)!.name, exact: true }).check();
    const fourth = page.getByRole('checkbox', { name: bank.programmeProfiles![5].name, exact: true });
    if (await fourth.isEnabled()) await fourth.click();
    await expect(fourth).not.toBeChecked(); await expect(page.locator('#app')).toContainText('Ya tienes tres');
    await page.getByRole('button', { name: 'Comparar 3 programas', exact: true }).click();
    const housing = page.locator('.comparison-proposal[data-question-id="retain-public-housing-ownership"]:visible');
    await expect(housing).toContainText('Apoyo'); await expect(housing).not.toContainText('Posiciones contradictorias');
    const opener = housing.getByRole('button', { name: 'Ver fuente: Sumar (SUMAR)', exact: true }); await opener.click();
    await expect(reader(page)).toContainText('Sumar (SUMAR)');
    await expect(reader(page).locator('blockquote').first()).toHaveText(bank.positions['boe-2023-004']['retain-public-housing-ownership'].citations[0].quote);
    await expect(reader(page)).toContainText('viviendas públicas'); await reader(page).getByRole('button', { name: 'Cerrar detalle' }).click(); await expect(opener).toBeFocused();
    await screenshot(page, 'focused-comparison', info.project.name);
    await page.getByRole('button', { name: 'Cambiar programas', exact: true }).click();
    await page.getByRole('checkbox', { name: bank.programmeProfiles!.find(p => p.candidacyId === 'boe-2023-003')!.name, exact: true }).uncheck();
    await page.getByRole('button', { name: 'Comparar 2 programas', exact: true }).click();
    await expect(housing.getByRole('button', { name: /Ver fuente|Ver explicación/ })).toHaveCount(2);
    await expect(page.locator('[aria-modal="true"]')).toHaveCount(0);
});

test('UX06: open long original context survives 320px, zoom-equivalent reflow and low height', async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/programmes'); await openPublicProposal(page, 'rent-price-cap');
    await page.getByRole('searchbox', { name: 'Buscar una formación', exact: true }).fill('Sumar (SUMAR)');
    await page.locator('.position-row[data-profile-id="boe-2023-004-p1"]').getByRole('button', { name: /Ver fuente/ }).click();
    const disclosure = reader(page).locator('.literal-source details').first(); await disclosure.locator('summary').click();
    for (const width of [720, 360, 320, 1440]) {
        await page.setViewportSize({ width, height: width === 1440 ? 420 : 900 });
        await expect(disclosure).toHaveAttribute('open', ''); await expect(reader(page)).toContainText('texto original');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(reader(page).getByRole('button', { name: 'Cerrar detalle' })).toBeVisible();
        await screenshot(page, 'reader-' + width, info.project.name);
    }
    await page.setViewportSize({ width: 1440, height: 1000 }); await expect(disclosure).toHaveAttribute('open', '');
    for (const zoom of ['200%', '400%']) {
        await page.evaluate(value => { document.documentElement.style.zoom = value; }, zoom);
        await expect(disclosure).toHaveAttribute('open', '');
        await expect(disclosure.locator('summary')).toBeFocused(); await expect(disclosure.locator('summary')).toBeInViewport();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.locator('.reading-origin')).toBeHidden(); await screenshot(page, 'zoom-' + zoom.slice(0, -1), info.project.name);
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
    const path = await downloadTechnicalResults(page);
    const data = JSON.parse(readFileSync(path!, 'utf8')) as { engineVersion: string; answerDetails: { answerLabel: string }[]; results: { rows: { id: string; affinity: number; coverage: number }[] }; labels: { coverage: string } };
    expect(data.engineVersion).toBe('documented-affinity-v2'); expect(data.labels.coverage).toBe('Información disponible'); expect(data.answerDetails).toHaveLength(total);
    expect(data.results.rows).toHaveLength(59);
    const evidence = JSON.parse(readFileSync(path!, 'utf8')) as Bank & { programmes: { candidacyId: string }[] };
    expect(evidence.programmePolicy).toBe('common-election-programme-v1');
    expect(evidence.constituencyPositions).toBeUndefined();
    expect(new Set(evidence.programmes.map(p => p.candidacyId)).size).toBe(59);
    expect(evidence.documents.every(d => d.programmeRole === 'common_election_programme')).toBe(true);
    expect(evidence.documents.some(d => d.id === 'compromis-sumar' || d.id.includes('childhood-obesity'))).toBe(false);
    await showAllResults(page);
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
    await expect(page.locator('.affinity-row')).toHaveCount(6);
    const file = await downloadTechnicalResults(page); const result = JSON.parse(readFileSync(file!, 'utf8'));
    expect(result.priorities).toEqual({ housing: 2 }); expect(result.results.denominator).toBe(11);
});

test('intentional official-source navigation sends no referrer or personal state', async ({ page, context }) => {
    await page.goto('/programmes');
    await openPublicProposal(page, 'rent-price-cap');
    await page.getByRole('searchbox', { name: 'Buscar una formación', exact: true }).fill('Sumar (SUMAR)');
    await page.locator('.position-row[data-profile-id="boe-2023-004-p1"]').getByRole('button', { name: /Ver fuente/ }).click();
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
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
    await expect(page.getByRole('checkbox', { name: 'Mostrar mis respuestas' })).toHaveCount(0);
    await openPublicProposal(page, bank.questions[0].id); await expect(page.locator('.proposal-relation')).toHaveCount(0);
    await page.goBack(); await expect(page.locator('.quiz-card')).toHaveAttribute('data-question-id', question!);
    await page.goForward(); await expect(page.locator('.position-row')).toHaveCount(6);
    const state = await page.evaluate(async () => ({ history: history.state, local: Object.keys(localStorage), session: Object.keys(sessionStorage), databases: await indexedDB.databases(), url: location.pathname + location.search + location.hash }));
    expect(state).toEqual({ history: null, local: [], session: [], databases: [], url: '/programmes' });
    expect(await context.cookies()).toEqual([]);
    expect(requests.filter(r => {
        const url = new URL(r.url);
        const publicDevelopmentModule = ['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname === '/resources/js/documented-affinity.ts' && (url.search === '' || /^\?t=\d+$/.test(url.search));
        return r.body || r.method !== 'GET' || (!publicDevelopmentModule && /answers|affinity|progress|questionId|profileId|importance|finish=/.test(r.url));
    })).toEqual([]);
    expect(requests.filter(r => new URL(r.url).pathname === '/api/bank')).toHaveLength(1);
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/questionnaire"]').click();
    await page.reload(); await expect(page.getByRole('button', { name: 'Empezar el test', exact: true })).toBeVisible();
});

test('UX08: skipped topic has no maximum, review restores it, rapid extension adds exactly ten and edit hides results', async ({ page }, info) => {
    await start(page); await answer(page, 20, true);
    await expect(page.locator('#app')).toContainText('Falta una respuesta en algunos temas'); await expect(page.locator('#app')).not.toContainText('Tu mayor coincidencia');
    await screenshot(page, 'pending-checkpoint', info.project.name);
    await page.getByRole('button', { name: 'Responder una pregunta de Pensiones' }).click();
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
    await finish(page); await expect(page.locator('.affinity-row')).toHaveCount(6);
});

test('loading, invalid bank, withdrawn session, overlay opt-in and cancel/reset states remain honest', async ({ page }) => {
    await start(page); await answer(page, 20);
    await page.route('**/api/release-state', route => route.fulfill({ json: { sha256: sha, withdrawn: [sha] } }));
    await page.getByRole('button', { name: 'Ver mi resultado' }).click(); await expect(page.locator('#app')).toContainText('se ha retirado'); await expect(page.locator('.affinity-row')).toHaveCount(0); await expect(page.locator('#app')).not.toContainText('Tu mayor coincidencia');
    await page.unroute('**/api/release-state'); await start(page); await answer(page, 20); await finish(page);
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/programmes"]').click();
    await page.getByRole('checkbox', { name: bank.programmeProfiles![0].name, exact: true }).check();
    await page.getByRole('checkbox', { name: bank.programmeProfiles![3].name, exact: true }).check();
    await page.getByRole('button', { name: 'Comparar 2 programas', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Mostrar mis respuestas' })).not.toBeChecked();
    await page.getByRole('checkbox', { name: 'Mostrar mis respuestas' }).check();
    await expect(page.locator('.comparison-proposal:visible .own-answer').first()).toBeVisible();
    await page.getByRole('checkbox', { name: 'Mostrar mis respuestas' }).uncheck(); await expect(page.locator('.own-answer')).toHaveCount(0);
    await page.getByRole('navigation', { name: 'Navegación principal' }).locator('a[href$="/questionnaire"]').click();
    await page.getByRole('button', { name: 'Borrar respuestas', exact: true }).click(); await expect(page.getByRole('button', { name: 'Seguir con mis respuestas' })).toBeFocused(); await page.keyboard.press('Escape'); await expect(page.locator('.affinity-row')).toHaveCount(6);
    await page.getByRole('button', { name: 'Borrar respuestas', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Borrar respuestas', exact: true }).click(); await expect(page.getByRole('button', { name: 'Empezar el test', exact: true })).toBeVisible();
    await page.route('**/api/bank', route => route.fulfill({ body: '{}', headers: { 'X-Evidence-Sha256': 'bad' } })); await page.reload(); await expect(page.locator('#app')).toContainText(/No hemos podido (cargar|abrir)/);
});
