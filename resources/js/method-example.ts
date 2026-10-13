import { createSidePanel } from './side-panel.ts';

type Translate = (key: string) => string;
const mountedExamples = new WeakSet<HTMLElement>();
const mountedCalculations = new WeakSet<HTMLButtonElement>();

export function mountMethodExample(host: HTMLElement, t: Translate): void {
    if (mountedExamples.has(host)) return;
    const control = host.querySelector<HTMLInputElement>('[data-method-switch]');
    if (!control) return;
    mountedExamples.add(host);
    const update = () => {
        const added = control.checked;
        for (const mark of host.querySelectorAll<HTMLElement>('[data-method-mark]')) {
            const index = Number(mark.dataset.methodMark);
            const state = index < 2 ? 'same' : added && index < 4 ? 'different' : 'unknown';
            mark.dataset.state = state;
            mark.textContent = state === 'same' ? '=' : state === 'different' ? '≠' : '?';
        }
        for (const [state, count] of Object.entries({ same: 2, different: added ? 2 : 0, unknown: added ? 1 : 3 })) {
            const label = host.querySelector<HTMLElement>('[data-example-count="' + state + '"]');
            if (label) label.textContent = t('cleanup_method_example_' + state).replace(':count', String(count));
        }
        const coverage = host.querySelector<HTMLElement>('[data-example-coverage]');
        if (coverage) coverage.textContent = added ? '80 %' : '40 %';
        const description = host.querySelector<HTMLElement>('[data-example-description]');
        if (description) description.textContent = t(added ? 'cleanup_method_example_added' : 'cleanup_method_example_initial');
    };
    const label = host.querySelector<HTMLElement>('[data-method-control]');
    if (label) label.hidden = false;
    control.addEventListener('change', update);
    update();
}

export function mountMethodInformation(host: HTMLElement, t: Translate, panel?: ReturnType<typeof createSidePanel>): void {
    mountMethodExample(host.querySelector<HTMLElement>('[data-method-example]') ?? host, t);
    const calculation = host.querySelector<HTMLButtonElement>('[data-open-calculation]');
    const template = host.querySelector<HTMLTemplateElement>('template[data-calculation-content]');
    if (!calculation || !template || mountedCalculations.has(calculation)) return;
    mountedCalculations.add(calculation);
    const controller = panel ?? createSidePanel(t, () => calculation);
    if (!panel) {
        const close = () => controller.close(true, false);
        window.addEventListener('pagehide', close);
        window.addEventListener('popstate', close);
    }
    calculation.hidden = false;
    calculation.addEventListener('click', () => {
        const content = document.createElement('div');
        content.append(template.content.cloneNode(true));
        controller.open({ title: t('cleanup_method_exact_title'), nodes: [content], kind: 'calculation' }, calculation);
    });
}
