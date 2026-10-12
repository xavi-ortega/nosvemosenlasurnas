import { focusControl } from './focus.ts';

export function reserveLoadingSpace(target: HTMLElement): void {
    const style = getComputedStyle(target);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const height = target.getBoundingClientRect().height - (style.boxSizing === 'border-box' ? 0 : padding);
    target.style.minHeight = Math.max(0, height) + 'px';
}

export function startLoading(target: HTMLElement, label: string): () => void {
    reserveLoadingSpace(target);
    const focused = target.contains(document.activeElement) ? document.activeElement as HTMLElement : null;
    const original = [...target.childNodes];
    const skeleton = document.createElement('section'); skeleton.className = 'loading-skeleton';
    const status = document.createElement('p'); status.className = 'sr-only'; status.setAttribute('role', 'status'); status.textContent = label;
    const content = document.createElement('div'); content.className = 'skeleton-content'; content.setAttribute('aria-hidden', 'true'); content.inert = true;
    for (const node of original) content.append(node.cloneNode(true));
    for (const node of content.querySelectorAll('[id]')) node.removeAttribute('id');
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    const texts: Text[] = []; while (walker.nextNode()) if (walker.currentNode.textContent?.trim()) texts.push(walker.currentNode as Text);
    for (const text of texts) { const placeholder = document.createElement('span'); placeholder.className = 'skeleton-text'; text.replaceWith(placeholder); placeholder.append(text); }
    skeleton.append(status, content); target.replaceChildren(skeleton); target.setAttribute('aria-busy', 'true');
    return () => {
        if (skeleton.parentElement === target) {
            target.replaceChildren(...original);
            if (focused) requestAnimationFrame(() => { if (focused.isConnected && target.contains(focused)) focusControl(focused); });
        }
        target.removeAttribute('aria-busy');
    };
}
