const interactiveSelector = 'a[href], button, input:not([type="hidden"]), select, textarea, summary';

export function focusControl(control: HTMLElement | null): boolean {
    if (!control?.matches(interactiveSelector) || control.matches(':disabled') || control.closest('[inert]') || !control.getClientRects().length) return false;
    control.focus({ preventScroll: true });
    return document.activeElement === control;
}

export function focusFirstControl(target: ParentNode | null, preferred: string[] = []): boolean {
    if (!target) return false;
    for (const selector of [...preferred, interactiveSelector]) {
        for (const control of target.querySelectorAll<HTMLElement>(selector)) {
            if (focusControl(control)) return true;
        }
    }
    return false;
}
