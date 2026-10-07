import { readFile, writeFile } from 'node:fs/promises';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const check = process.argv.includes('--check');
const converter = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
converter.use(gfm);
converter.keep(['sub', 'sup']);
converter.addRule('section-anchors', {
    filter: 'section',
    replacement: (content, node) => '\n\n<a id="' + node.getAttribute('id') + '"></a>\n\n' + content + '\n\n',
});
converter.addRule('navigation', {
    filter: 'nav',
    replacement: (_content, node) => '\n\n## Contents\n\n' + Array.from(node.querySelectorAll('a')).map(link => '- [' + link.textContent + '](' + link.getAttribute('href') + ')').join('\n') + '\n\n',
});
const mappings = {
    'electoral-app-development-plan.html': 'development-plan.md',
    'matching-algorithm-specification.html': 'matching-algorithm-specification.md',
    'adaptive-questionnaire-specification.html': 'adaptive-questionnaire-specification.md',
    'project-language-policy.html': 'project-language-policy.md',
    'approval-gate-01.html': 'approval-gate-01.md',
};
for (const [source, target] of Object.entries(mappings)) {
    const html = await readFile('outputs/' + source, 'utf8');
    const body = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    if (!body) throw new Error('No document body: ' + source);
    let markdown = converter.turndown(body);
    for (const [original, converted] of Object.entries(mappings)) {
        markdown = markdown.replaceAll('](' + original, '](' + converted);
    }
    markdown = markdown.replaceAll('](../docs/', '](../')
        .replaceAll('](matching-engine.mjs)', '](../../outputs/matching-engine.mjs)')
        .replaceAll('](electoral-app-development-plan.json)', '](../../outputs/electoral-app-development-plan.json)')
        .replaceAll('](render-development-plan.py)', '](../../outputs/render-development-plan.py)')
        .replaceAll('](bootstrap-report.html)', '](../../outputs/bootstrap-report.html)');
    markdown = markdown.replace(/^[ \t]+$/gm, '').trimEnd();
    const result = '<!-- Generated from outputs/' + source + '; run npm run docs:build. -->\n\n' + markdown + '\n';
    const destination = 'docs/plans/' + target;
    if (check) {
        if (await readFile(destination, 'utf8') !== result) throw new Error('Stale Markdown plan: ' + destination);
    } else {
        await writeFile(destination, result);
    }
}
const plan = JSON.parse(await readFile('outputs/electoral-app-development-plan.json', 'utf8'));
let work = '<!-- Generated from the canonical plan; run npm run docs:build. -->\n\n# Atomic work items\n\n';
for (const item of plan.executionPlan.workItems) {
    work += '## ' + item.id + ': ' + item.title + '\n\n';
    for (const [key, label] of [['status', 'Status'], ['macroTaskId', 'Macro task'], ['ownerRole', 'Owner role'], ['requirementIds', 'Requirements'], ['capabilities', 'Capabilities'], ['locale', 'Locale'], ['dependsOn', 'Prerequisites'], ['requiredGateIds', 'Gates']]) {
        const value = item[key];
        work += '**' + label + ':** ' + (Array.isArray(value) ? value.join(', ') || 'None' : value) + '\n\n';
    }
    if (item.conditionalDependencies) work += '**Conditional prerequisites:** ' + JSON.stringify(item.conditionalDependencies) + '\n\n';
    for (const [key, label] of [['deliverables', 'Deliverables'], ['acceptanceCriteria', 'Acceptance'], ['verification', 'Verification'], ['completionEvidence', 'Evidence']]) {
        work += '### ' + label + '\n\n' + (item[key].length ? item[key].map(value => '- ' + value).join('\n') : 'Pending.') + '\n\n';
    }
    work += '**Failure behavior:** ' + item.failureBehaviour + '\n\n';
    if (item.completionApprovalBindings?.length) work += '**Retained approval bindings:** ' + JSON.stringify(item.completionApprovalBindings) + '\n\n';
}
work = work.trimEnd() + '\n';
const workPath = 'docs/plans/work-items.md';
if (check) {
    if (await readFile(workPath, 'utf8') !== work) throw new Error('Stale atomic work-item Markdown');
} else {
    await writeFile(workPath, work);
}
console.log('Markdown plans '  + (check ? 'match their sources.' : 'generated.'));
