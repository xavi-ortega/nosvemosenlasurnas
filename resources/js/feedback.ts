export type Category = 0 | 1 | 2;
export type Metric = 'result_fit' | 'policy_agreement';
export const protocolVersion = 'three_category_randomized_response_v1';
export const truthfulProbability = Math.exp(1) / (Math.exp(1) + 2);
export const otherProbability = 1 / (Math.exp(1) + 2);
export interface Proposition { id: string; topicId: string; topicName: string; text: string }
export interface FeedbackConfig { enabled: boolean; protocolVersion: string; survey: { version: string; kind: string; propositions: Proposition[] } }
export type Report = { metricId: Metric; protocolVersion: string; category: Category; surveyVersion?: string; propositionId?: string };

export function randomUnit(): number {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
}
export function randomize(category: Category, random = randomUnit): Category {
    const value = random();
    if (!(value >= 0 && value < 1)) throw new Error('Invalid random source.');
    if (value < truthfulProbability) return category;
    return ((category + (value < truthfulProbability + otherProbability ? 1 : 2)) % 3) as Category;
}
export class Feedback {
    private attempted = new Set<Metric>();
    readonly proposition: Proposition;
    readonly config: FeedbackConfig;
    private random: () => number;
    constructor(config: FeedbackConfig, random = randomUnit) {
        this.config = config; this.random = random;
        const value = random();
        if (!(value >= 0 && value < 1) || config.survey.propositions.length === 0 || config.protocolVersion !== protocolVersion) throw new Error('Invalid survey.');
        this.proposition = config.survey.propositions[Math.floor(value * config.survey.propositions.length)];
    }
    hasAttempted(metric: Metric): boolean { return this.attempted.has(metric); }
    prepare(metric: Metric, category: Category, consent: boolean): Report | null {
        if (!consent || !this.config.enabled || this.hasAttempted(metric) || this.attempted.size >= 2) return null;
        this.attempted.add(metric);
        const report: Report = { metricId: metric, protocolVersion, category: randomize(category, this.random) };
        if (metric === 'policy_agreement') Object.assign(report, { surveyVersion: this.config.survey.version, propositionId: this.proposition.id });
        return report;
    }
}

export function renderFeedback(target: HTMLElement, feedback: Feedback, t: (key: string) => string, allowFit = false): void {
    const element = <K extends keyof HTMLElementTagNameMap>(tag: K, text = ''): HTMLElementTagNameMap[K] => { const item = document.createElement(tag); item.textContent = text; return item; };
    const section = element('section'); section.className = 'source-card'; section.append(element('h3', t('feedback_title')), element('p', t('feedback_description')));
    target.append(section);
    if (!feedback.config.enabled) { section.append(element('p', t('collection_disabled'))); return; }
    section.append(element('p', t('feedback_notice')));
    if (feedback.config.survey.kind !== 'current') section.append(element('p', t('development')));
    const metrics: Metric[] = allowFit ? ['result_fit', 'policy_agreement'] : ['policy_agreement'];
    for (const metric of metrics) {
        const card = element('section'); section.append(card);
        if (feedback.hasAttempted(metric)) { card.append(element('p', t('feedback_attempted'))); continue; }
        card.append(element('h4', t(metric === 'result_fit' ? 'fit_question' : 'policy_question')));
        if (metric === 'policy_agreement') card.append(element('p', feedback.proposition.text));
        const choices = element('fieldset'); choices.append(element('legend', t('feedback_choose')));
        const labels = metric === 'result_fit' ? ['fit_negative', 'fit_unsure', 'fit_positive'] : ['policy_negative', 'policy_unsure', 'policy_positive'];
        labels.forEach((key, category) => {
            const label = element('label'); label.className = 'choice'; const control = element('input'); control.type = 'radio'; control.name = `feedback-${metric}`; control.value = String(category); label.append(control, document.createTextNode(t(key))); choices.append(label);
        });
        const consentLabel = element('label'); consentLabel.className = 'choice'; const consent = element('input'); consent.type = 'checkbox'; consentLabel.append(consent, document.createTextNode(t('feedback_consent')));
        const send = element('button', t('feedback_send')); send.type = 'button';
        const refuse = element('button', t('feedback_refuse')); refuse.type = 'button';
        const status = element('p'); status.setAttribute('role', 'status');
        const showStatus = (key: string) => { const message = element('p', t(key)); message.setAttribute('role', 'status'); message.tabIndex = -1; card.replaceChildren(message); message.focus(); };
        card.append(choices, consentLabel, send, refuse, status);
        refuse.addEventListener('click', () => showStatus('feedback_refused'));
        send.addEventListener('click', () => {
            const selected = choices.querySelector<HTMLInputElement>('input:checked');
            if (!selected || !consent.checked) { status.textContent = t('feedback_missing'); return; }
            let report: Report | null;
            try { report = feedback.prepare(metric, Number(selected.value) as Category, consent.checked); } catch { showStatus('feedback_failed'); return; }
            if (!report) return;
            showStatus('feedback_sending');
            const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 3000);
            void fetch('/api/feedback', { method: 'POST', body: JSON.stringify(report), headers: { 'Content-Type': 'application/json', 'X-Feedback-Protocol': protocolVersion }, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: controller.signal }).then(response => {
                showStatus(response.status === 202 ? 'feedback_sent' : 'feedback_failed');
            }).catch(() => showStatus('feedback_failed')).finally(() => clearTimeout(timer));
        });
    }
}
