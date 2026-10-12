import { bankForConstituency, balanced, followups, match, parseBank } from './matching.ts';
import type { Answer, Answers, Bank, Priorities, Question } from './matching.ts';
import { documentedBlock, documentedMatch } from './documented-affinity.ts';

function freeze<T>(value: T): T {
    if (value !== null && typeof value === 'object') {
        for (const item of Object.values(value)) freeze(item);
        Object.freeze(value);
    }
    return value;
}

export class Questionnaire {
    readonly bank: Bank;
    readonly releaseHash: string;
    readonly cohort: string[];
    readonly priorities: Priorities;
    constituency: string;
    readonly answers: Answers = {};
    readonly presented: string[] = [];
    private queue: Question[];
    private cursor = 0;
    revealed = false;

    constructor(bank: Bank, releaseHash: string, constituency: string = 'all', priorities: Priorities = {}) {
        const parsed = parseBank(structuredClone(bank));
        const documented = bank.engineVersion === 'documented-affinity-v2';
        if (documented && constituency !== 'all') throw new Error('All candidacies are included.');
        this.bank = freeze(documented ? parsed : bankForConstituency(parsed, constituency));
        this.releaseHash = releaseHash;
        this.constituency = constituency;
        if (constituency !== 'all' && !bank.election.constituencies.some(c => c.id === constituency)) throw new Error('Invalid constituency.');
        this.cohort = bank.candidacies.filter(c => constituency === 'all' || c.constituencyIds.includes(constituency)).map(c => c.id);
        this.priorities = { ...priorities };
        if (documented) documentedMatch(this.bank, {}, this.priorities); else match(this.bank, {}, this.priorities, this.cohort);
        this.queue = documented ? this.bank.starterQuestionIds!.map(id => this.bank.questions.find(q => q.id === id)!) : balanced(this.bank);
    }

    current(): Question | undefined {
        const q = this.queue[this.cursor];
        if (q && !this.presented.includes(q.id)) this.presented.push(q.id);
        return q;
    }

    progress(): { current: number; total: number } {
        return { current: Math.min(this.cursor + 1, this.queue.length), total: this.queue.length };
    }

    canGoBack(): boolean {
        return this.cursor > 0;
    }

    previous(): boolean {
        if (!this.canGoBack()) return false;
        this.cursor--;
        this.revealed = false;
        return true;
    }

    answer(value: Answer): void {
        const q = this.current();
        if (!q || ![-2, -1, 0, 1, 2, 'unsure', 'skip'].includes(value)) throw new Error('Invalid answer transition.');
        this.answers[q.id] = value;
        this.revealed = false;
        this.cursor++;
    }

    edit(id: string, value: Answer): void {
        if (!this.presented.includes(id) || ![-2, -1, 0, 1, 2, 'unsure', 'skip'].includes(value)) throw new Error('Invalid edit transition.');
        this.answers[id] = value;
        this.revealed = false;
    }

    extend(): boolean {
        if (this.current()) throw new Error('Checkpoint required.');
        if (this.bank.engineVersion === 'documented-affinity-v2') {
            const next = this.extension();
            this.revealed = false;
            if (next.length !== 10) return false;
            this.queue.push(...next); return true;
        }
        const remaining = Math.max(0, 30 - this.queue.length);
        const next = remaining === 0 ? [] : followups(this.bank, this.answers, this.presented, this.priorities, this.cohort, Math.min(5, remaining));
        this.revealed = false;
        if (next.length !== 5) return false;
        this.queue.push(...next);
        return true;
    }

    extension(): Question[] {
        if (this.current() || this.queue.length >= Math.min(80, this.bank.questions.length)) return [];
        return documentedBlock(this.bank, this.queue.map(q => q.id), this.answers);
    }

    finish() {
        this.revealed = true;
        return this.bank.engineVersion === 'documented-affinity-v2' ? documentedMatch(this.bank, this.answers, this.priorities) : match(this.bank, this.answers, this.priorities, this.cohort);
    }

    export() {
        if (!this.revealed) throw new Error('Explicit finish required before export.');
        return { constituency: this.constituency, releaseHash: this.releaseHash, engineVersion: this.bank.engineVersion, electionId: this.bank.election.id, answers: { ...this.answers }, priorities: { ...this.priorities }, cohort: [...this.cohort], results: this.bank.engineVersion === 'documented-affinity-v2' ? documentedMatch(this.bank, this.answers, this.priorities) : match(this.bank, this.answers, this.priorities, this.cohort) };
    }

    reset(): void {
        for (const key of Object.keys(this.answers)) delete this.answers[key];
        for (const key of Object.keys(this.priorities)) delete this.priorities[key];
        this.cohort.splice(0);
        this.constituency = "all";
        this.presented.splice(0);
        this.queue = [];
        this.cursor = 0;
        this.revealed = false;
    }
}
