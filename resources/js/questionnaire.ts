import { balanced, followups, match, parseBank } from './matching.ts';
import type { Answer, Answers, Bank, Priorities, Question } from './matching.ts';

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
    readonly answers: Answers = {};
    readonly presented: string[] = [];
    private queue: Question[];
    private cursor = 0;
    revealed = false;

    constructor(bank: Bank, releaseHash: string, constituency: string = 'all', priorities: Priorities = {}) {
        this.bank = freeze(parseBank(structuredClone(bank)));
        this.releaseHash = releaseHash;
        if (constituency !== 'all' && !bank.election.constituencies.some(c => c.id === constituency)) throw new Error('Invalid constituency.');
        this.cohort = bank.candidacies.filter(c => constituency === 'all' || c.constituencyIds.includes(constituency)).map(c => c.id);
        this.priorities = { ...priorities };
        match(this.bank, {}, this.priorities, this.cohort);
        this.queue = balanced(this.bank);
    }

    current(): Question | undefined {
        const q = this.queue[this.cursor];
        if (q && !this.presented.includes(q.id)) this.presented.push(q.id);
        return q;
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
        this.queue = followups(this.bank, this.answers, this.presented, this.priorities, this.cohort);
        this.cursor = 0;
        this.revealed = false;
        return this.queue.length > 0;
    }

    finish() {
        this.revealed = true;
        return match(this.bank, this.answers, this.priorities, this.cohort);
    }

    export() {
        if (!this.revealed) throw new Error('Explicit finish required before export.');
        return { releaseHash: this.releaseHash, engineVersion: this.bank.engineVersion, electionId: this.bank.election.id, answers: { ...this.answers }, priorities: { ...this.priorities }, cohort: [...this.cohort], results: match(this.bank, this.answers, this.priorities, this.cohort) };
    }

    reset(): void {
        for (const key of Object.keys(this.answers)) delete this.answers[key];
        for (const key of Object.keys(this.priorities)) delete this.priorities[key];
        this.cohort.splice(0);
        this.presented.splice(0);
        this.queue = [];
        this.cursor = 0;
        this.revealed = false;
    }
}
