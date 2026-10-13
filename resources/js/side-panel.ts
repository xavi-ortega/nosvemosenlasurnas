import { focusControl } from './focus.ts';

export type PanelKind = 'picker' | 'source' | 'result' | 'factsheet' | 'calculation';
type PanelView = { title: string; nodes: HTMLElement[]; kind: PanelKind; focus?: HTMLElement };

export function createSidePanel(t: (key: string) => string, fallback: () => HTMLElement | null) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let dialog: HTMLDialogElement | null = null;
    let body: HTMLElement | null = null;
    let heading: HTMLElement | null = null;
    let back: HTMLButtonElement | null = null;
    let closeButton: HTMLButtonElement | null = null;
    let opener: HTMLElement | null = null;
    let scroll = 0;
    let previousOverflow = '';
    let previousPadding = '';
    let personal = false;
    let closing = false;
    let motion: Animation | null = null;
    let current: PanelView | null = null;
    const stack: { view: PanelView; scroll: number; opener: HTMLElement }[] = [];
    const animate = (frames: Keyframe[], duration: number) => {
        motion?.cancel(); motion = null;
        if (dialog && !reduced.matches) {
            motion = dialog.animate(frames, { duration, easing: 'cubic-bezier(.22,1,.36,1)' });
            return motion.finished.catch(() => {});
        }
        return Promise.resolve();
    };
    const teardown = (restore: boolean) => {
        if (!dialog) return;
        motion?.cancel(); motion = null;
        dialog.close(); dialog.replaceChildren(); dialog.remove(); dialog = null; body = null; heading = null; back = null; closeButton = null; personal = false;
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPadding;
        stack.splice(0); current = null; closing = false;
        if (restore) {
            window.scrollTo(0, scroll);
            if (!focusControl(opener)) focusControl(fallback());
        }
        opener = null;
    };
    const close = (immediate = false, restore = true) => {
        if (immediate || reduced.matches) { teardown(restore); return; }
        if (!dialog || closing) return;
        closing = true; const active = dialog;
        dialog.dataset.closing = 'true';
        void animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(20px)' }], 160).then(() => { if (active === dialog && closing) teardown(restore); });
    };
    const display = (view: PanelView) => {
        if (!dialog || !body || !heading || !back) return;
        current = view; heading.textContent = view.title; dialog.dataset.panelKind = view.kind;
        back.hidden = stack.length === 0; body.replaceChildren(...view.nodes); body.scrollTop = 0;
        if (reduced.matches) body.getAnimations().forEach(animation => animation.cancel());
        else { body.getAnimations().forEach(animation => animation.cancel()); body.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 140 }); }
        if (!focusControl(view.focus ?? null)) focusControl(closeButton);
    };
    const open = (view: PanelView, origin: HTMLElement, isPersonal = false) => {
        close(true, false); personal = isPersonal; opener = origin; scroll = window.scrollY;
        previousOverflow = document.body.style.overflow; previousPadding = document.body.style.paddingRight;
        const gutter = window.innerWidth - document.documentElement.clientWidth;
        if (gutter > 0) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + gutter}px`;
        document.body.style.overflow = 'hidden';
        dialog = document.createElement('dialog'); dialog.className = 'side-panel'; dialog.setAttribute('aria-labelledby', 'panel-title');
        const header = document.createElement('header'); header.className = 'panel-header';
        heading = document.createElement('h2'); heading.id = 'panel-title';
        back = document.createElement('button'); back.type = 'button'; back.className = 'text-action panel-back'; back.textContent = t('flow_back_detail');
        back.addEventListener('click', () => { const previous = stack.pop(); if (!previous) return; display(previous.view); body!.scrollTop = previous.scroll; focusControl(previous.opener); });
        closeButton = document.createElement('button'); closeButton.type = 'button'; closeButton.className = 'panel-close'; closeButton.textContent = '×'; closeButton.setAttribute('aria-label', t('flow_close'));
        closeButton.addEventListener('click', () => close()); header.append(back, heading, closeButton);
        body = document.createElement('div'); body.className = 'panel-body'; dialog.append(header, body);
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
        dialog.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
            if (event.key !== 'Tab' || !dialog) return;
            const controls = [...dialog.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, summary, [tabindex="0"]')].filter(control => !control.matches(':disabled') && control.tabIndex >= 0 && control.getClientRects().length > 0);
            const first = controls[0]; const last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); focusControl(last ?? null); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); focusControl(first ?? null); }
        }, true);
        let backdropStart = false;
        const outside = (event: PointerEvent | MouseEvent) => { const rect = dialog!.getBoundingClientRect(); return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom; };
        dialog.addEventListener('pointerdown', event => { backdropStart = outside(event); });
        dialog.addEventListener('click', event => { if (backdropStart && outside(event)) close(); backdropStart = false; });
        document.body.append(dialog); dialog.showModal(); display(view);
        void animate([{ opacity: .25, transform: 'translateX(24px)' }, { opacity: 1, transform: 'translateX(0)' }], 220);
    };
    reduced.addEventListener('change', () => { if (closing) teardown(true); else { motion?.cancel(); motion = null; body?.getAnimations().forEach(animation => animation.cancel()); } });
    return {
        open,
        push(view: PanelView, origin: HTMLElement) {
            if (!current || !body || closing) return;
            stack.push({ view: current, scroll: body.scrollTop, opener: origin }); display(view);
        },
        close,
        invalidatePersonal() { if (personal) close(true, false); },
    };
}
