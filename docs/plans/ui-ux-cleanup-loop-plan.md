# Whole-site UI and UX cleanup: understandable journeys for everyday visitors

ui-ux-cleanup-2023-v1.0.0 · planned_application_stage

A full-site next-stage plan, grounded in actual route/rendering defects. Task-led navigation, short plain Spanish, useful didactic interaction, parallel programme comparison, interpretable results, practical help and reliable source/return flows. Includes a real-data comparison prototype; application work is separately planned and no new bank/source/score semantics are authorized by this UI stage.

Application implementation started: false. Complete: false. Public launch and collection remain unapproved/disabled.

Baseline: outputs/ui-ux-cleanup-baseline.json. Prototype: outputs/programme-comparison-prototype.html. Source bank SHA-256: 7e0f255fed82d06fc6d3dfc0c884adeee1742d127446fc7bdb5195fc720c015b.

## Product outcome and precedence

The owner rejected the comparison design and then widened the request to every public surface: navigation, language, spacing, interaction, comprehension and everyday usefulness. This is the active next-stage loop, following the completed local second iteration. It does not reopen completed Q/R acceptance or claim that previous functional checks established good design.

The product should let a person who does not know political terminology answer three questions from the screen itself: **What can I do here? What does this mean? What can I do next or how do I return?** “For the whole family” means readable, respectful and operable across experience, vision, dexterity and device differences. It does not mean cartoons, competition between opinions, infantilized language or a promise of suitability proved by a study.

The quiz is the reference for focused interaction: one clear task, feedback after an action, a visible next step and a reliable return. Preserve its accepted answer order, brief selected-state animation, automatic advance, Back placement, reduced motion, 20 + 10 progression and deliberate result reveal. Extend that care to the rest of the site.

Only common programmes for the 23 July 2023 Congress election remain eligible: 59 formations, 35 documents covering 33 formations and 26 without a confirmed common programme. Keep all formations accessible, exactly one entry each. This stage changes presentation and journeys, not bank positions, source scope, weights, ranking or arithmetic. Optional metrics, languages, 2026 evidence and public launch remain outside this stage.

## Observed defects and their product consequences

| ID | Observation | Consequence | Required response |
| --- | --- | --- | --- |
| D01 | Comparison entry at y=1008 on 1512×850 and y=1667 on 390×844 | The useful action is invisible on entry | Choose programmes immediately; both main tasks are visible without scrolling |
| D02 | 80 proposals appear at once; mobile document about 42,870px | A person cannot orient themselves or compare a topic | One topic at a time, six proposals per page with counts and topic navigation |
| D03 | Selection is 59 plain checkboxes without search | Finding a smaller formation requires reading a long list | Alphabetical native checkbox list, search, availability and selected summary |
| D04 | Repeated programme/remove/source buttons dominate mobile rows | Reading one formation obscures the other two | Compact same-proposal overview with all selected positions, followed by explanations |
| D05 | Comparison inherits selection scroll | The destination appears partway through a page | Explicit transition scroll policy; entry starts at comparison controls |
| D06 | /how-it-works has nine paragraphs, up to 65 words; adjacent blocks run together | Explanation requires prior understanding of the calculation | Short first layer, concrete interactive example, optional precise technical layer |
| D07 | /method, linked in the footer, still describes the previous threshold and 10-question algorithm | Two accessible pages contradict the active product | One current explanation; old route aliases lead to it and old algorithm documentation remains historical |
| D08 | A source-interpretation disclaimer precedes the main task on every app page | The site opens with an abstract warning rather than orientation | Essential limits next to their meaning; detailed reliability note in source/method reading |
| D09 | Home repeats “Inicio”, a large slogan and another explanation; comparison is only in navigation | Extra hierarchy consumes the first screen | One useful headline, short explanation, start action and visible programme alternative |
| D10 | Results render 59 formation rows and specialist “Afinidad documentada / Cobertura documentada” labels | A bar is hard to interpret and detail is several clicks away | Plain labels, examples of matches/differences/missing information and searchable complete results |
| D11 | Source reading leads through programme → topic → proposal | Verifying one result can require unnecessary navigation | Open the relevant explanation directly from the result; one further source action |
| D12 | “Fuentes” opens the programme catalogue rather than a source-specific destination | Navigation promises one task and delivers another | Give sources a useful directory or clearly named contextual route, without duplicate landing pages |
| D13 | Privacy/accessibility are dense static paragraphs with a home-only return | Reassurance interrupts the original task | Short practical answers and an explicit return to the preserved origin |
| D14 | Deferred feedback/insights routes remain reachable with sparse unavailable states | The navigation may imply functionality that is not active | Keep them out of primary journeys; direct routes explain unavailability and offer useful exits |
| D15 | Historical strings describe ten-plus-five questions and the old comparison cohort | A stale key can become public again during refactoring | Audit reachable strings, remove stale public references coherently while preserving historical evidence |

Evidence is in outputs/ui-ux-cleanup-baseline.json and the ignored baseline screenshots. These are observed local defects. They do not establish what every visitor thinks. Small-screen and keyboard verification must be repeated on each completed application slice.

## Task perspectives and comprehension gates

Use the following perspectives as walkthrough constraints, not fictional research findings:

- A person with little political knowledge wants to start without choosing parties, understand a percentage, and check one everyday proposal.
- A person who already knows two formations wants to compare them directly, change a selection and verify a source without doing a test.
- A person who cares about one issue wants to start with that topic, discover positions across all formations and keep missing information visible.
- A person reading slowly or using enlarged text needs one task at a time, short sentences, generous line height and stable controls.
- A person using touch, keyboard or assistive technology needs equivalent actions, visible location, labelled controls and reliable focus/return.
- A person entering through a saved old link needs a truthful current destination, not a contradictory explanation or a blank/dead page.

For every screen complete a five-question review using only visible content: **where am I, what is the main task, what do the labels mean, what changed after my action, how can I undo or return?** Missing answers are defects, even when axe and functional tests pass. Record the actual text/action that provides each answer.

For each percentage/example, record an everyday paraphrase and the mathematically precise interpretation. They must agree. A reader must be able to explain that missing information is not opposition, 0% confirmed overlap is not “opposes every opinion”, and equal displayed percentages may be rounded. Preserve access to the 2023 date without repeating a long election warning on every row.

A practical agent walkthrough and optional informal owner feedback are sufficient to iterate locally; no recruited panel, certification or formal approval quorum is introduced. This does not justify claiming proven family-wide usability.

## Information architecture, routes and persistent orientation

```text
Inicio
  Hacer el test → preguntas → decisión de terminar → resultado
  Comparar programas → selección → tema → propuesta → fuente
  Explorar un tema → propuestas → posturas → fuente

Resultado → qué coincide / qué difiere / qué falta
          → propuesta con tu respuesta → fuente → mismo resultado
          → revisar respuesta → volver a confirmar resultado

Cómo funciona → explicación breve → ejemplo → detalle opcional
Ayuda → resolver una duda concreta → volver al recorrido
Fuentes → buscar una formación → documento / información ausente
Pie → privacidad / accesibilidad / información del proyecto
```

Keep the primary header small: **Inicio / Hacer el test / Programas / Cómo funciona**. Mark the current section. Within Programas show two routes immediately: **Comparar programas / Explorar un tema**. Do not require a hover-only mega-menu, a hamburger at widths where ordinary links fit, or an introductory page whose only purpose is another click.

Use the existing routes as the starting point. `/questionnaire` remains the test, `/programmes` the programme entry, `/how-it-works` the current explanation. `/method` must resolve to the same current explanation; `/comparison` enters comparison selection; `/sources` must have the promised useful source journey or become an explicitly labelled alias. Decide exact alias/redirect behavior during U004 after route and session tests; use named Laravel routes and preserve public bookmarks.

The content hierarchy is **section → topic → proposal → source**, with a visible local return naming its destination. Avoid putting a technical “method” page beside “how it works” as if they were separate concepts. No 2026 menu entry until that edition has a usable evidence-backed destination.

Public section/topic/proposal identifiers may use non-personalized navigation only after privacy tests prove no selected formation, answer, result or completion data is added. Default implementation keeps detailed state in memory; do not introduce personalized URLs or history state. Browser Back navigates public sections consistently; visible Back restores local detail context. Hard reload starts a new private session and public direct links work without one.

Keep active quiz answers when visiting another section within the same document and show **Volver a mi test**. Do not imply that a hard reload or following an external source will preserve private answers. External documents open in a new tab with clear Spanish naming and no opener/referrer leakage.

## Plain-language system for every public surface

Audit active `lang/es` messages, Blade text, TypeScript-generated labels, errors, source summaries, export notices and downloaded labels. Distinguish active UI from historical records and untouched original source quotations. The quiz question bank is already authored; this stage preserves its meaning and IDs.

Use three layers. **Task layer:** headline, one or two short sentences and the action. **Meaning layer:** a nearby example or “Qué significa” disclosure. **Proof layer:** original quote, exact context, source location and technical detail. Never require proof-layer vocabulary to complete a task. Essential conditions, missing information and privacy consequences cannot be hidden merely to make the page attractive.

| Current wording | Proposed first-layer wording | Meaning that must remain available |
| --- | --- | --- |
| Afinidad documentada | Coincidencia confirmada | Overlap on the same weighted answered proposals; not probability of vote |
| Cobertura documentada | Información disponible | Weighted share of answered proposals with a documented position; not a raw programme-completeness count |
| Respuestas numéricas | Respuestas en las que has elegido una opinión | Unsure/skip are not converted to neutral |
| Candidatura / perfil | Formación; official party name where needed | Exactly one official formation entry, eligible only for 23J Congress |
| Circunscripción | Dónde se presentó | Exact constituency list remains accessible; not eligibility personalized from a location |
| Resumen interpretativo | Cómo entendemos esta propuesta | Authored interpretation, not a verbatim quote |
| Sin coincidencia computable | No podemos comparar esta propuesta | Ambiguous/conflicting/absent reasons stay distinguishable in detail |
| Presupuesto de cada tema | Cada tema cuenta lo mismo al principio | Family/topic weights and optional importance remain mathematically exact in the technical layer |
| Denominador / familias / pesos | Detalle del cálculo | Keep these in the optional method explanation, not the main CTA or result summary |
| Ver propuesta y fuente | Ver qué coincide / Ver la fuente | One action must name its actual destination |
| Sin programa común del 23J localizado | No hemos encontrado su programa de 2023 | Only the common general-election programme was searched; never substitute a regional programme |
| Ámbito / locators / SHA-256 | Origen del documento | Hashes and exact text locators stay in a verification disclosure |

“Información disponible” needs a nearby plain definition: **“De lo que has respondido, esto es lo que podemos comparar con su programa.”** Its percentage is weighted, so never rewrite it as “has answered X of Y questions” without a separately calculated actual count. “Coincidencia confirmada” needs: **“Coincidencias que hemos podido comprobar. La información que falta no suma coincidencia.”** The technical method stays one disclosure away.

Use sentence case, concrete verbs, familiar Spanish and the same label for the same action. A primary button should normally be 2–5 words. Aim for 12–20 words per explanatory sentence and 35 words in the initial paragraph; these are editing guides, not rules that remove qualifications or alter original quotations. Avoid unexplained acronyms, nominalizations, unnecessary passive voice, double negatives, technical status banners and “click aquí”. Define a necessary unfamiliar term at first use with a neutral short example.

A copy change passes only after: (1) preserving the exact product/evidence contract; (2) checking the full screen, not an isolated string; (3) reading it aloud in the actual layout; (4) demonstrating a next step; (5) checking Spanish accessibility names, errors and local exports. Do not replace a short technical word with a longer vague sentence. Do not predict the effects of policies or frame one position as smarter/kinder/right.

Prepare a per-screen copy inventory with key, current wording, proposed wording, purpose, required meaning, disclosure level, route and validation outcome. Resolve stale current-route copy before cosmetic polishing. Preserve proper names and verbatim quotes exactly. Future paraphrase edits to political rationales need the electoral-evidence workflow and a separate bank revision; the prototype packages existing authored rationales unchanged.

The copy ledger also covers every displayed political rationale, not just menus and tooltips. During U005 directly author a plain-language presentation summary against the existing rationale and exact citation context. Store it as a separately labelled fixed public UI copy layer keyed by existing formation/proposal IDs, linked to this bank hash; keep the bank value, conditions, complete rationale and original citations unchanged. Reuse a truthful generic missing-information message only when it preserves the specific reason. Show quantities, exceptions and qualified conditions that affect meaning in the first layer; the complete interpretation remains accessible. No automatic political summary generator or new position inference is authorized. If an actual source interpretation must change, use a deliberate evidence revision rather than smuggling it into a copy edit.


## Didactic interaction rather than an encyclopedia

Every interactive element must help a concrete task. Add interaction where it reduces confusion, not for entertainment or to maximize clicks. Reuse the quiz's focused stage and immediate feedback as principles without turning opinion into a right/wrong game.

- Home presents two useful choices and explains the 2023 edition in one line. No preliminary party chooser for the quiz.
- Programme selection shows what has changed after a checkbox click, the remaining slots and the direct compare action. Search is a local tool, not another page.
- Comparison shows one proposal axis and selected programmes together. Topic change keeps the programmes; replacing a programme keeps the topic and active proposal when possible.
- Each result explains **tu respuesta / lo que propone / por qué coincide o difiere / lo que falta** in separate visible pieces. A person can move to another example and back without redoing a test.
- “Cómo funciona” offers an optional miniature example with three states: information agrees, information differs, information is missing. Use unnamed illustrative tiles, clearly labelled **“Ejemplo para entender el cálculo”**, five decisions of equal weight, and deterministic reference arithmetic. Do not show simulated political programmes or fictional party scores. The example has buttons **Ver una coincidencia / Ver una diferencia / Ver qué pasa si falta información** and a textual equivalent; no drag gesture is required.
- Topic browsing asks **“¿Qué tema te interesa?”** then **“¿Qué propuesta quieres consultar?”**. Each item explains the next destination. It must not unload 59 programme essays at the top level.
- Sources begin with the everyday explanation and an original quote. **Leer el contexto original** opens the full passage only when requested. No raw hash or methodological warning dominates that first view.
- Help is a task list: **No entiendo mi porcentaje / Quiero comparar dos programas / Quiero cambiar una respuesta / Qué ocurre si falta un programa / Qué se guarda de mí**. Each answer ends with a useful internal return/action.
- Missing/loading/error states say what happened and offer an action. They do not strand a person with an unhelpful technical sentence.

Progressive disclosure must not hide a qualification that changes a party's meaning, a missing-programme status, a pending percentage or download privacy implications. A disclosure is optional supporting detail, not a way to bury inconvenient evidence.

## Screen contract: home, navigation and current explanation

**Home.** Proposed headline: **“Descubre qué propuestas coinciden contigo”**. Intro: **“Responde preguntas sobre temas cotidianos o compara los programas por tu cuenta.”** Edition: **“Programas de las generales de 2023.”** Primary: **Empezar el test**. Secondary: **Comparar programas**. Nearby reassurance: **“Gratis y sin cuenta. Tus respuestas se quedan en esta página.”** Short loss notice remains visible before starting: **“Al recargar se borran.”** If a session exists, replace start with **Volver a mi test** and retain state. No oversized repeated “Inicio” block.

On 1280×720 and 390×844 the main task and programme alternative must appear without scrolling after loading. The page must not claim a completion time without measurement. No current-election wording or party recommendation.

**Navigation.** Header uses native links with active section names and generous hit areas. At narrow widths use a compact two-row navigation if it fits; otherwise a real labelled Menu button with expanded state, focusable links and close/escape behavior. Prefer the simpler existing visible-link pattern. Do not obscure content with a tall fixed header.

**How it works.** First visible content: **“Comparamos tus respuestas con lo que dicen los programas de 2023.”** Three short points: **“Usamos las mismas reglas para todas las formaciones.” / “Si falta información, no cuenta como coincidencia.” / “El resultado ayuda a explorar propuestas; tú decides tu voto.”** Then the optional example, **De dónde salen las preguntas**, **Qué ocurre si falta información**, **Ver el cálculo completo**, **Consultar las fuentes**. Detailed editorial CIS ordering and migration-bank gaps belong in the relevant source/method explanation, not comparison entry.

`/method` and `/how-it-works` must tell the same current story. The old threshold/common-cohort method remains in historical engineering records and never appears as active visitor help. Verify this by following every header/footer/direct legacy link, not just searching source files.

## Screen contract: selection and comparison

The included standalone prototype makes this journey reviewable with the complete existing 59-formation/80-proposal bank. It is a design prototype, not a replacement application or final copy migration.

**Selection.** Start at **“¿Qué programas quieres comparar?”** with **“Elige dos o tres formaciones y mira qué proponen sobre vivienda, salud, empleo y otros temas.”** No preselected major party. Search accepts full names and official abbreviations without a remote query. Keep all 59 alphabetically; do not promote only parties with seats. A native checkbox label includes the exact official name and simple programme availability. At three selected, explain **“Ya tienes tres. Quita una para elegir otra.”** Keep checked controls usable; disable or reject additional choices with an announced reason. Selected summary offers remove controls and **Comparar 2/3 programas**, disabled below two. Search does not clear selection; clearing it restores all 59.

**Comparison.** Desktop uses a native table with proposal row headers and 2–3 programme columns. Formation names are stated in the header rather than in every cell. Every cell shows support/opposition/intermediate/unknown and its authored rationale. Qualified +1/−1 retains the qualification visibly. Unknowns must not have a red rejection icon or a zero stance.

On mobile, each proposal has a compact same-proposal overview with all selected formations and stance labels visible together. Full explanations follow in labelled blocks; source actions remain directly available. No swipe-only programme carousel, horizontal scrolling as the normal route, or collapse hiding every other party. Some scrolling remains necessary to read full conditions; it is bounded to one topic and one page rather than 80 questions.

Wide theme rail becomes a native topic select when width cannot support a rail plus three readable columns. A topic contains its actual authored count: education 7, employment 8, energy 10, health 10, housing 4, institutions 15, pensions 2, rights 14, taxes 7, transport 3. Page six proposals at a time without inventing/padding content. Show **Propuestas X–Y de Z**, Previous and Next; selected programmes survive page/topic changes.

Default shows all proposals, including gaps. Optional **“Con posturas a favor y en contra”** means at least one authored positive and one authored negative cell among the selected formations, not inferred political disagreement from missing evidence. Empty state: **“No hay posturas a favor y en contra documentadas para esta selección y este tema.”** Add **“Puede faltar información.”** and **Ver todas las propuestas**. Do not label equal numeric values as identical whole programmes.

Changing programmes uses a reversible selection draft. **Volver sin cambiar** discards the draft. Confirming preserves topic, filter and active proposal/page if still meaningful; announce when a filter leaves no proposals. No accidental one-programme comparison after removing a selection. Place a clear **Añadir otro programa** path instead.

## Screen contract: topic exploration, sources and reading

**Topic-first.** Entry gives ten named topic choices, then a searchable list of actual proposals in that topic. A proposal opens grouped positions across all 59 formations: **A favor / Postura intermedia / En contra / No podemos confirmar su postura** with counts and alphabetical members. A short initial overview gives the groups and counts; people can jump to a group with ordinary links or filter/search locally. Missing evidence is included by default and recoverable after any filter. Add a formation to the same comparison selection without losing the active proposal; once two are selected **Comparar estos programas** lands on that proposal in the topic, not at a random earlier page.

**Reading.** One source action opens the selected formation and proposal with its interpretation and exact original citation. Prefer a dedicated full-width reading view for the comparison journey, including desktop: it preserves comfortable comparison columns rather than squeezing three programmes beside a side panel. Keep the current nonmodal result reader only when its content-width budget remains adequate; otherwise use the same full-width surface. Do not introduce stacked dialogs or two simultaneous readers. The prototype demonstrates full-width source reading at every size.

Source view names the proposal, formation, 2023 edition and location. It shows **Cómo entendemos esta propuesta**, the authored rationale, the quote, optional **Leer el contexto original**, and **Abrir programa oficial (otra pestaña)**. If the official URL is unavailable, label the preserved copy honestly. Some originals are not Spanish: keep exact originals with an explicitly labelled authored Spanish explanation, never relabel a translation as a quotation.

Multiple citations remain accessible and numbered; contradictory or qualified evidence cannot be reduced to one favourable snippet. Hash/offset/provenance detail is under **Origen del documento**. A missing programme offers **Volver a la comparación** and a clear missing-source explanation without a disabled “Ver fuente” masquerading as available evidence.

Return restores selected formations, topic, filter, page, search, active proposal, scroll position and the invoking control. On resize choose the corresponding visible mobile/desktop opener by semantic identity, not a stale DOM reference. If the origin disappeared, return to its nearest valid interactive control and explain the change. Never focus headings, paragraphs, main, row containers or live status text.

## Screen contract: understandable and useful results

Keep the accepted horizontal bars, common denominator and every formation. Improve the first view around interpretation rather than an 59-row scroll task.

1. Headline **“Tus coincidencias con los programas de 2023”** and a short explanation of what the percentage includes. Keep the 2023 label and deliberate finish boundary.
2. A readable first group of results with exact official names, **Coincidencia confirmada**, separate **Información disponible**, and source availability. Search and **Ver todas las 59 formaciones** expose the full ordered result set; state **Mostrando X de 59**. Paging/filtering does not change scores, weights or ranking. Unknown programmes remain in the full set with an explicit label, not quietly removed.
3. For a chosen result show three clearly named routes: **En qué coincides / En qué difieres / Qué no sabemos**. Each shows a concrete authored proposal, your answer, the programme's position and the reason for the relationship. Preserve qualifiers and display disagreements independently of the overall result.
4. One action opens that proposal's explanation; **Ver la fuente** is then one action. Do not force result → entire programme → topic → proposal before reading the cited example.
5. **Revisar mis respuestas** returns to the chosen topic/question. Editing invalidates the revealed personalized view until another deliberate finish; never display stale percentages or automatic reveal.
6. **Descargar mis resultados** states that the file contains personal political answers and remains on the device. Prepare a readable Spanish local export using current existing dependencies; retain the existing complete JSON export as a technical option if useful. This is a format/presentation task, not permission to transmit an export or change its content semantics.

When a topic lacks an opinion response use **“Falta una respuesta en algunos temas para calcular el total.”** List useful named actions **Responder una pregunta de [tema]**. Offer to inspect available proposals without fabricating a global percentage. “No lo tengo claro” is a valid choice, not a failing grade. No trophy, winner, confetti, voting instruction, default expanded political profile or probability language.

A 0% row with no available programme must say that we could not confirm overlap because information is missing; it must not say “no coincides”. Use neutral visual treatment and preserve the same numeric contract. Equal rounded percentages keep the exact ordering and explain ties only where relevant.

## Screen contract: help, privacy, accessibility and old links

Help should answer a task, not describe implementation. Reuse native disclosures with a concise answer and one useful destination. Keep help reachable from the relevant view without clearing quiz/comparison state.

Privacy first layer: **“Tus respuestas no se envían al servidor. Se borran al recargar o cerrar esta página.”** Then separate practical answers: **Qué se guarda / Qué pasa al descargar / Qué pasa al abrir un programa / Qué datos técnicos puede ver el alojamiento**. Preserve the truthful network/hosting limitation and the fact that a public launch has not been approved; do not claim guaranteed anonymity. Do not display deferred randomized-response formulas as the first privacy paragraph when collection is disabled. Its full future protocol stays preserved separately; any visitor notice must truthfully say collection is off.

Accessibility gives concrete usage guidance: keyboard, text enlargement, motion preference, sources without doing the test and how to recover from an unavailable link. Do not confuse practical support with certification. Link back to the origin from inside the running app; a direct server-rendered visit still has useful Home/Test/Programmes navigation and content when JavaScript is unavailable.

A source directory allows formation search, exact common-programme links, availability and optional provenance. It is distinct from comparing programme positions. Links labelled **Fuentes** must reach this useful task rather than a silently duplicated programme catalogue.

For /feedback and /insights keep collection disabled, remove primary prompts and provide a short honest direct-route state: **“Las valoraciones no están disponibles en esta edición.” / “Puedes hacer el test o consultar programas.”** Preserve protocol/code/history rather than delete it. Error pages 404/419/429/500/503 provide short Spanish messages and a useful return/retry, never exception strings or raw translation keys. Re-check developer/local setup messages separately; they must not leak into public copy.

## Visual system, spacing and content-driven breakpoints

Use the existing Avenir Next → Segoe UI → Arial fallback without a font dependency. The prototype's civic palette is cool and neutral: ink #192e34, muted #52666e, action #185b64, background #f4f7f8, paper #ffffff, structural border #d4dfe2. The memorable element is the comparison itself: one shared proposal axis, equal programme treatment. No decorative card wall, party-coloured responses, gradients, giant disclaimers or uniformly heavy buttons.

| Token | Proposed rule | Verification |
| --- | --- | --- |
| Root | 1rem = user browser default; 1.0625 multiplier only on ≥100rem wide comfortable desktops | Never shrink root based on viewport or override browser font settings |
| Body | 1rem, line-height 1.55–1.65; supporting labels ≥0.875rem | Political conditions and action names stay readable, not fine print |
| Main heading | clamp(1.8rem, 1.3rem + 2vw, 3rem), low-height desktop cap about 2.25rem | Avoid clipped MacBook first-screen actions |
| Subheading | clamp(1.45rem, 1.1rem + 1vw, 2rem) | Clear hierarchy without repeated display headings |
| Text width | 55–72ch for prose; comparison cells ≥14rem desired at three columns | Preserve readable parallel columns; switch layout before squeezing |
| Spacing | 0.25/0.5/0.75/1/1.5/2/3rem scale | Separate explanation blocks; consistent group and section gaps |
| Controls | min 2.75rem target, ≥0.5rem separation where adjacent | Borders never hug buttons; container padding ≥1rem narrow, 1.5rem wide |
| Layout | Max 88rem, outer gutters 1rem narrow / 2rem wide | No huge empty margins that starve table columns |
| Focus | High contrast visible outline with offset | Only links, buttons, native inputs, selects and disclosure summaries |

At ≤40rem simplify masthead and use 1rem gutters; at ≤60rem use mobile proposal sections and stack selection summary before the list; at ≤75rem replace the topic rail with a native select; at ≥100rem modestly expand typography. Low-height desktops ≤46rem reduce heading/outer spacing, not body text. These are starting content-fit thresholds, tested at 320, 390, 768, 1024, 1280 and 1512 CSS pixels and 200/400% zoom. Two selected columns can retain a table when their width budget fits; choose breakpoints from actual content, not device names.

Prefer intrinsic minmax/grid/flex, clamp with rem limits, logical properties, container queries where supported by the installed toolchain, and native controls. Do not use viewport-only type, fixed text heights, overflow hidden that truncates meaning, or JavaScript resizing for font sizes. Test longer official names, three selected formations, qualified rationale, original non-Spanish text and long quotes.

Motion responds to an action: short 120–180ms opacity or contained transform without horizontal overflow, preserve stable controls and cancel on new navigation. Respect reduced motion. Preserve the accepted quiz transition rather than redesign it gratuitously. Loading placeholders reserve the actual screen geometry and never show a focusable fake control or a prominent technical loading banner.

## Layout sketches and criticism before implementation

```text
Home                         Comparison selection
[brand] [small navigation]   [brand] [small navigation]
One useful heading           Which programmes?
Two short lines              Short explanation
[Start test] [Programmes]     [Search................] [Selected 2/3]
2023 / privacy reassurance   [ ] exact formation     [remove]
                             [ ] programme status    [Compare]

Wide comparison
[title + selected programmes]               [Change programmes]
[topic rail]  Topic                         [filter]
              Proposal | Programme A | Programme B | Programme C
              question | stance      | stance      | stance
                       | conditions  | conditions  | conditions
                       | source      | source      | source
              [Previous] Proposals X–Y of Z [Next]

Narrow comparison
[compact header]
[title / selected] [Change]
[Topic select] [Filter]
Proposal in ordinary language
A stance | B stance | C stance  (all visible together)
[source] | [source] | [source]
A: full explanation / conditions
B: full explanation / conditions
C: full explanation / conditions
[Previous] X–Y of Z [Next]

Source reading
[Back to named origin]
formation / proposal / 2023
interpretation      exact quotation + page
conditions          [Read original context]
                    [Open original / preserved copy]
                    [Provenance details]

Result
Useful headline + short percentage explanation
[Search formation] [See all 59]
formation | confirmed overlap | information available
[Matches] [Differences] [Missing information]
proposal: your answer / programme / explanation / source
[Review responses] [Download] [Return]
```

Initial critique: putting source reading beside a three-column table recreates the cramped layout; use full-width source reading for comparison. Repeating full formation names and full-width buttons in every mobile block obscures comparison; a small shared overview precedes complete explanations. Compressing all text to make 80 proposals fit would hide meaning; bound the task instead. A decorative lesson/card on every page would recreate an encyclopedia; add the smallest contextual example that resolves confusion.

Second critique of the first prototype: horizontal stage translation briefly created mobile overflow, and the narrow header consumed too much of the first screen. Remove that translation, shorten prototype chrome and show all three stance labels together before the long explanations. Record subsequent actual inspection rather than call these choices validated in advance.

## State, return, keyboard and privacy contract

Keep all private state in memory only: quiz answers/priorities/progress/reveal, selected formations, search, comparison topic/filter/page, source origin, scroll and opener identity. The fixed public bank and ordinary static assets are the only data needed for this stage. Do not send personalized analytics, persist localStorage/sessionStorage/IndexedDB, add cookies or hide selections in URLs/history state.

| Transition | Retain | Reset | Focus / viewport |
| --- | --- | --- | --- |
| Home → test | Current live session if present | Only a deliberately confirmed new test | Start/resume or first answer; one question visible |
| Search formation | Selected IDs and source availability | Search results only | Keep caret; announce result count politely |
| Confirm comparison | Selection, previous topic and active proposal where valid | Only invalid page/filter context, with explanation | Comparison's first real control; scroll to intended proposal when entering from it |
| Topic change | Selected IDs, explicit filter | Page to zero; active proposal replaced | Keep topic control; announce proposal count |
| Next proposal page | Selected IDs, topic, filter | Row subset only | Stable pagination/filter control, not text heading |
| Edit selection | Draft, original selection and workspace snapshot | Search may start clear | Search input; explicit cancel available |
| Cancel selection | Restore original selection and workspace | Discard draft | Change-programmes control; restore exact scroll |
| Source open | All origin context plus semantic opener | Previous reader, never accumulate panels | Reader Back button with proposal description |
| Source return / resize | Same proposal/formation identity, selection and scroll | None unless origin is no longer valid | Corresponding visible opener, nearest real control fallback |
| Result → proposal/source | Revealed result and result-list search/page | Nothing political | Detail Back/source controls; no focus on prose |
| Edit quiz answer | Session answers and question identity | Invalidate revealed result / personal overlays | Native answer control; result requires deliberate finish again |
| Help/privacy → return | Original screen state while same document lives | No reset | Invoking help/privacy link or next valid control |
| Hard reload / close | Public bank only | All private session state | Clear new-entry view; no secret recovery state |

Use native table, fieldset/legend, radio/checkbox semantics and links for destinations. Do not turn static cells into an ARIA grid or make text blocks tabbable. Disclosures have real summaries, buttons have specific names and disabled actions have visible reasons. Search redraws never steal focus or reset the caret. Tab order matches reading order at every breakpoint.

No sticky header/footer may obscure focus. Selection summaries may be sticky only if height fits the viewport and the next controls remain reachable. Original-source opening is user-driven, names the new tab and preserves the app. Personal overlays stay opt-in and only available after deliberate finish; opening public programmes never reveals results automatically.

## Empty, loading, error and undo states

| State | First-layer Spanish copy | Recovery / retained context |
| --- | --- | --- |
| Bank loading | Screen-shaped skeleton, polite hidden status only | Reserve headings, controls and first content rows; no layout jump |
| Bank failed | No hemos podido abrir los programas. | Volver a intentar; useful server-rendered help remains reachable |
| No search result | No encontramos una formación con ese nombre. | Borrar búsqueda; selected programmes unchanged |
| One selected | Elige un programa más para comparar. | Selection/search remain usable; compare stays disabled |
| Three selected | Ya tienes tres. Quita una para elegir otra. | Checked/remove controls stay usable; no disappearing selection |
| No common programme | No hemos encontrado su programa de 2023. | Visible formation, honest detail, no substituted evidence |
| Unknown position | No podemos confirmar su postura sobre esta propuesta. | Preserve authored reason and any useful contextual citations |
| Conflicting position | El programa no permite atribuir una postura clara. | Explain the actual conflict in detail; do not score it as neutral |
| Filter empty | No hay propuestas con estas condiciones. | Ver todas; state what the filter does and why evidence may be absent |
| Official source unavailable | El enlace oficial ya no está disponible. | Clearly labelled preserved copy if one exists; exact quote remains readable |
| Percentage pending | Falta una respuesta en algunos temas para calcular el total. | Named review actions; inspect available proposals without invented total |
| Release check failed | No hemos podido comprobar esta edición. | Reintentar; live answers kept only in this page |
| Release withdrawn | Esta edición se ha retirado. | Explain why results unavailable, clear/reload action, public current entry |
| Delete answers | ¿Borrar tus respuestas? | Real labelled dialog; keep/cancel primary; Escape returns to opener |
| Download | El archivo contiene tus respuestas y se guarda en tu dispositivo. | Explicit download/cancel; no automatic download |
| Deferred metrics | Las valoraciones no están disponibles en esta edición. | Test/programmes exits; no collection attempts |
| Unsupported private resume | Al recargar se han borrado las respuestas. | Fresh entry; no promise of recovery or background persistence |

Intentional user disclosures may increase document height; this is different from unexpected loading layout shift. Skeleton dimensions follow each new layout rather than old strings. Retry states must not duplicate listeners, selected formations or quiz answers. Test 503, missing source and keyboard-only cancel alongside successful states.

## Loop engineering: bounded build, inspect, critique, repeat

Each implementation task uses this loop and records evidence; a task cannot be completed merely because code exists or automated assertions are green.

1. **Observe the exact starting state.** Reproduce the defect with the real 2023 bank, named viewport, route and interaction. Save a bounded screenshot and state description, not a speculative design diagnosis.
2. **Write the task contract.** Define visitor goal, starting state, visible meaning, primary/secondary actions, retained state, return path, unknown/error states and privacy boundary. Check the relevant screen/flow/copy entries in this plan.
3. **Sketch and challenge.** Compare at least the proposed layout with the simplest alternative. Identify how a novice completes the task and whether important text is hidden, too dense, repetitive or mislabeled. Revise before application code.
4. **Build a vertical slice.** Finish entry → useful content → explanation/source → return on wide and narrow layouts. Reuse existing Laravel/Blade/Tailwind/TypeScript components and dependencies; apply relevant skills and installed-version docs. Do not implement only the beautiful entry while leaving its destination as a text dump.
5. **Check correctness first.** Real authored conditions, all formations, current score contract, alias consistency, no personal network/storage and meaningful functional tests. Any false implication is a blocking defect even if the layout is attractive.
6. **Inspect actual rendering.** At minimum 1280×720 MacBook-sized, 1512×850 wide, 390×844 mobile and 320×568 narrow; also 1024×320 low-height, 200/400% zoom, reduced motion, keyboard and relevant pending/error state. Review screenshots with real long names/qualifications. Do not infer good UX merely from no overflow.
7. **Perform the five-question comprehension review.** Complete the task without referring to source code, this plan or hidden developer explanations. Record which visible phrase explains each meaning and which control gives the next/return step. If it requires jargon, unexplained counts or a hidden action, reopen the design.
8. **Critique and refine.** Record defect, severity, visible evidence, proposed correction and its outcome. Re-run only affected checks/screens after changing it. Never weaken a check to mark a design accepted.
9. **Close the slice.** Document before/after, actual commands/screenshots, limitations and checked bank hash in the execution journal. Synchronize task status, generated human plans and the existing managed planning view. Run the exact staged-tree gate before any commit.

Use a defect ledger with IDs, screen/flow, severity (P0 misleading/correctness/privacy, P1 blocked task/unreadable, P2 avoidable friction, P3 cosmetic), reproduction, proposed change and verified outcome. P0/P1 block slice acceptance; P2 needs an explicit resolution or justified deferral. Do not let a superficial polish task close an inaccessible route.

This plan creates no scheduler, recruited study, parallel agents, branch, worktree, dependency purchase or external publication. Continue independent eligible tasks when one source/host/optional issue is blocked. Work on main; do not rewrite history, reset source evidence or push.

## Acceptance matrix and evidence required to finish the stage

| ID | Practical walkthrough | Required result |
| --- | --- | --- |
| A01 | First visit on 390×844 and 1280×720 | Start/test and programmes choice visible without scrolling; edition and loss notice understandable |
| A02 | Existing test → programmes → help → test | Live answers preserved within document; resume obvious; no result reveal |
| A03 | Search an official minor-party name/abbreviation and clear search | All 59 available; selection and input caret preserved |
| A04 | Select two, add a third, attempt fourth, remove and replace | Visible feedback, no lost selection, no accidental one-programme workspace |
| A05 | Choose PP, PSOE and Sumar on rent cap | PP/PSOE remain unknown, Sumar supports; unknown is not opposition |
| A06 | Compare nuclear life extension PP/VOX/Sumar | Authored positive/negative values appear under the same proposal; conditions remain readable |
| A07 | Compare public dental care and mortgage guarantees | Qualified PSOE positions visibly retain actual conditions; no blanket equivalence |
| A08 | Select PSC with no confirmed common programme | One PSC entry, no inheritance of PSOE positions; missing programme visible |
| A09 | Change topic and next/previous page in a 15-proposal topic | Exact counts, six/page, selection intact, intended scroll and native controls |
| A10 | Narrow comparison with three programmes | All three stance labels together before explanation; no swipe/hidden party requirement or horizontal overflow |
| A11 | Open quote, expand original context, return; resize while reading | Same semantic proposal/opener, page/filter/selection and scroll retained; no heading/text focus |
| A12 | Start by topic, open proposal, search positions, add two programmes | Reach same comparison proposal without losing topic/search context |
| A13 | Filter opposed stances where none are documented | Honest empty state and one action to all; unknown does not imply agreement |
| A14 | Finish test deliberately and explain a bar | Correct current score, separate weighted evidence coverage, no vote probability/winner claim |
| A15 | Find a formation beyond initial results and a 0% missing programme | Full 59 reachable with count/search; missing evidence not framed as total disagreement |
| A16 | Result → difference → source → same result | At most two local disclosure/navigation actions to the quote; same ordered list and focus restored |
| A17 | Unsure/skip leave a topic without an opinion | Pending total with concrete review action, no invented neutral response |
| A18 | Edit a response after seeing results | Old personalized views invalidated, result requires deliberate finish again |
| A19 | Follow /method, /how-it-works and all footer/header aliases | Same active explanation; no ten-plus-five/cohort-threshold contradiction |
| A20 | Method miniature examples by keyboard | Correct deterministic unnamed example, clear missing-information effect and text equivalent |
| A21 | Help/privacy/accessibility from a task and via direct URL | Practical short first layer, exact detail accessible, useful return, no session corruption |
| A22 | Source unavailable, bank 503, release-check failure and withdrawn edition | Spanish actionable states, no raw exception/key; local answers retained only as specified |
| A23 | Loading and layout screenshots under throttled delivery | Screen-shaped skeletons; reserved controls/content; no giant loading banner or unexpected jump |
| A24 | Keyboard, reduced motion, 320px, 200/400% and 1024×320 | All controls reachable/named, visible focus never obscured, readable conditions, no clipping |
| A25 | Record traffic/storage across quiz/results/comparison/help/download | Fixed public bank; no personalized bodies/URLs/history or browser persistence; download explicit |
| A26 | Legacy feedback/insights/404 routes | Truthful unavailable/direct-link recovery; metrics remain disabled |
| A27 | Copy review of every reachable active message and exported labels | No unexplained engineering jargon/stale algorithm text; exact source quotes/names retained |
| A28 | Local developer setup and compiled snapshot | Existing composer dev workflow and build preview still work; no owner-server changes required |

Collect baseline/after screenshots, actual action sequences, a source-bank hash, copy inventory, route alias results, practical keyboard/zoom notes and meaningful tests. Existing automated browser/PHP/engine/tooling/security checks remain mandatory at commit. Add tests for newly changed navigation/state/arithmetic boundaries; pure typography/copy changes need visual review rather than mirrored implementation tests.

The internal quality target is no unexpected layout shift in the loaded above-the-fold task, with CLS ≤0.1 as a performance target when measurements become available; this document does not claim measured production Core Web Vitals. Measure actual bank parse/loading and interaction response on the local build; do not assert performance from an empty mock or install dependencies merely to obtain a score.

Stage completion requires U004–U016 application evidence, no open P0/P1 defects and a coherent local review packet. Prototype checks only complete U003. Local completion never approves public launch, hosting/log privacy, collection or present-day electoral evidence.

## Implementation map, decisions and completion packet

Map each bounded task to the existing application before editing. Read path-matching project rules and relevant frontend/accessibility/Laravel/testing skills. Do not replace the application scaffold to obtain a cleaner visual result.

| Area | Existing files to inspect/reuse | Change boundary |
| --- | --- | --- |
| Routing and aliases | routes/web.php, resources/views/components/layout.blade.php | Current destination meaning, named routes, SSR/direct links; no new session persistence |
| Shared entry and loading | resources/views/public/app.blade.php, components/loading-skeleton.blade.php | One useful heading, task-shaped skeleton and no generic disclaimer block |
| All app journeys | resources/js/iteration-app.ts, focus.ts | Extend coherent section/local-view state and semantic return; split reusable view pieces only within existing structure when justified |
| Visual foundations | resources/css/app.css | Shared rem type/spacing, intrinsic width budgets and existing Tailwind toolchain; no dependency change |
| Public copy | lang/es/iteration.php, public.php, site.php, errors.php | Active semantic keys and meaning ledger; exact quotations/proper names unchanged |
| Static help and errors | resources/views/public/information.blade.php, resources/views/errors/message.blade.php | Useful first layer, full accurate detail, useful direct-route recovery |
| Results/calculation | resources/js/iteration-app.ts and current matching/questionnaire modules | Presentation/example arithmetic only; existing bank weights/values/selection remain unchanged |
| Verification | tests/Browser/second-iteration.spec.ts and relevant existing public/feature/tooling tests | Reuse established fixtures; add only distinct state/navigation regression value |
| Planning parity | outputs/render-development-plan.py, work/verify-development-plan.py, existing managed planning view | Honest U-task evidence; completed Q/R records preserved |

Resolve these implementation decisions in the stated slice, with actual content-fit evidence: alias redirect versus same-document route entry (U004), plain labels and weighted-coverage definition (U005/U012), table width threshold for two versus three programmes (U006/U009), cancellation draft and context restoration (U008), result reader full-width fallback (U011), readable local export with installed tools (U012), and practical help as a preserved local view versus direct server page (U013). No decision is a reason to seek a new blueprint or approval for ordinary local work.

The comparison prototype's source contents are deliberately unchanged; its compact packaging deduplicates complete exact citations without truncating them. It covers selection, comparison, topic browsing and source/return, not home/results/privacy redesign. The low-height 1024×320 observation requires ordinary scrolling for the entry action; all controls remain reachable. Do not claim every viewport fits a full task on one screen.

U015's packet must include a route list, every active screen/state and copy key reviewed, completed A01-A28 outcomes, defect ledger, desktop/mobile/zoom/keyboard screenshots, no-personalized-traffic/storage trace, exact bank hash and affected test commands. U016 supplies the local preview, main commit, rollback using preserved history and explicit remaining host/launch limitations. No completed status is inferred from scheduled time, a generated checklist or this prototype alone. Meaningful commands/artifacts go into work/execution-journal.jsonl.


## Connected navigation and return graphs

### F01 Enter, test and resume

Start: home. Walkthrough: home → quiz → selection → quiz → result → home.

- **home**: Choose a useful task. “Empezar el test” → quiz (retain existing live session); “Comparar programas” → selection (retain quiz session); “Cómo funciona” → method (retain origin)

- **quiz**: Answer one proposal. “Ver mi resultado” → result (retain deliberate finish only); “Programas” → selection (retain answers and progress); “Inicio” → home (retain answers and progress)

- **result**: Interpret a result. “Revisar respuestas” → quiz (retain invalidate old result); “Inicio” → home (retain revealed session)

- **selection**: Compare without answering. “Volver a mi test” → quiz (retain answers and progress); “Inicio” → home (retain selection)

- **method**: Understand before acting. “Volver al inicio” → home (retain origin)

### F02 Compare, verify and return

Start: selection. Walkthrough: selection → workspace → source → workspace → edit → workspace → selection.

- **selection**: Choose two/three formations. “Comparar programas” → workspace (retain selected formations/topic); “Explorar por tema” → topics (retain selection)

- **workspace**: Read one topic. “Ver fuente” → source (retain topic/filter/page/scroll/opener); “Cambiar programas” → edit (retain workspace snapshot); “Elegir programas” → selection (retain selection)

- **source**: Verify exact quote. “Volver a la comparación” → workspace (retain exact semantic origin)

- **edit**: Replace a formation. “Comparar programas” → workspace (retain topic/filter/proposal); “Volver sin cambiar” → workspace (retain original selection/snapshot)

- **topics**: Choose a topic. “Volver a elegir programas” → selection (retain selection)

### F03 Explore a topic and compare relevant formations

Start: topics. Walkthrough: topics → proposals → positions → source → positions → workspace → positions → proposals → topics.

- **topics**: Choose an issue. “Elegir tema” → proposals (retain selection)

- **proposals**: Choose one authored proposal. “Consultar posturas” → positions (retain topic/proposal/search); “Volver a temas” → topics (retain selection)

- **positions**: Explore all formations. “Ver fuente” → source (retain proposal/search/group/scroll); “Comparar estos programas” → workspace (retain chosen proposal/selection); “Volver a propuestas” → proposals (retain topic/search)

- **source**: Read exact supporting context. “Volver a las posturas” → positions (retain same opener and scroll)

- **workspace**: Compare chosen formations on that proposal. “Volver a explorar el tema” → positions (retain same proposal)

### F04 Understand a result and revise an answer

Start: result. Walkthrough: result → examples → source → examples → result → review → checkpoint → result.

- **result**: Read confirmed overlap and missing information. “Ver en qué difieres” → examples (retain result search/page/selection); “Revisar respuestas” → review (retain session); “Cómo funciona” → method (retain result origin)

- **examples**: Read your answer versus a programme. “Ver fuente” → source (retain result/proposal/relation); “Volver a resultados” → result (retain same result row)

- **source**: Verify the claim. “Volver a la propuesta” → examples (retain same example)

- **review**: Edit one response. “Volver al punto de decisión” → checkpoint (retain edited answers; old reveal invalidated)

- **checkpoint**: Choose whether to finish. “Ver mi resultado” → result (retain new deliberate reveal); “Revisar respuestas” → review (retain session)

- **method**: Understand the calculation. “Volver a mi resultado” → result (retain revealed origin)

### F05 Get help without losing a task

Start: task. Walkthrough: task → help → task → privacy → task → accessibility → task.

- **task**: Continue quiz/comparison/reading. “Ayuda” → help (retain exact private origin); “Privacidad” → privacy (retain exact private origin); “Accesibilidad” → accessibility (retain exact private origin)

- **help**: Resolve one practical doubt. “Volver” → task (retain same origin/opener)

- **privacy**: Understand what is stored. “Volver” → task (retain same origin/opener)

- **accessibility**: Find an accessible way to act. “Volver” → task (retain same origin/opener)

### F06 Find a programme or recover from a missing source

Start: directory. Walkthrough: directory → missing → directory → source → directory.

- **directory**: Search all common programmes. “Abrir documento” → source (retain formation/search); “Ver programa no disponible” → missing (retain formation/search)

- **source**: Read original or preserved source. “Volver a fuentes” → directory (retain search/formation)

- **missing**: Understand absence honestly. “Volver a fuentes” → directory (retain search/formation)

### F07 Retry a failure without losing private progress

Start: task. Walkthrough: task → check → failed → check → task.

- **task**: Use the ready edition. “Error de carga” → error (retain existing live context); “Comprobar edición” → check (retain answers)

- **error**: Recover bank delivery. “Volver a intentar” → task (retain same session where valid)

- **check**: Check before deliberate result reveal. “No se pudo comprobar” → failed (retain answers/checkpoint); “Edición retirada” → withdrawn (retain no result displayed); “Continuar” → task (retain accepted state)

- **failed**: Retry explicit finish check. “Volver a intentar” → check (retain same live answers); “Seguir revisando” → task (retain answers)

- **withdrawn**: Understand why results unavailable. “Abrir edición disponible” → task (retain clear stale private session explicitly)

## Bounded implementation tasks

### U001 Audit every reachable public surface and reproduce actual defects

Status: completed. Size: medium. Dependencies: none.

Deliverables:

- Real-bank route/copy/geometry baseline; defects D01-D15; source hash and limits

Accept when:

- Observed facts distinguished from design inference; legacy contradictions included

Verify:

- Actual browser visits and screenshot inspection at real local runtime

Actual evidence: outputs/ui-ux-cleanup-baseline.json, .tools/comparison-redesign/site-audit.json, .tools/comparison-redesign/baseline.json.

### U002 Specify the full site journeys, language layers and acceptance gates

Status: completed. Size: large. Dependencies: U001.

Deliverables:

- Current information architecture, all screen contracts, F01-F07 flows, state matrix, plain-copy decisions, A01-A28 walkthroughs

Accept when:

- Every main destination has useful content, return, failure and privacy rules; quiz contracts preserved

Verify:

- Plan graph/reachability checks; full canonical/human/managed-view synchronization

Actual evidence: outputs/ui-ux-cleanup-loop-plan.json.

### U003 Build and critique a real-data comparison prototype

Status: completed. Size: medium. Dependencies: U002.

Deliverables:

- Selection/search, topic comparison, topic-first entry, source and return at wide/narrow sizes

Accept when:

- All 59/80 and unchanged positions/citations; inspected real screenshots; prototype limitations explicit

Verify:

- Browser paths, keyboard/focus/reflow/axe and exact bank parity

Actual evidence: outputs/programme-comparison-prototype.html, outputs/ui-ux-cleanup-prototype-verification.json, outputs/programme-comparison-prototype-1512.png, outputs/programme-comparison-prototype-390.png.

### U004 Unify current navigation, aliases and public route meaning

Status: planned. Size: medium. Dependencies: U002.

Deliverables:

- Named route map; header/footer/section state; current method and useful source directory destination

Accept when:

- D07/D12/D14/D15 resolved; F01/F05 accessible; no session or personalized URL leakage

Verify:

- A02/A19/A21/A26; existing route/browser/session tests

### U005 Rewrite active public copy with a per-screen meaning ledger

Status: planned. Size: large. Dependencies: U002.

Deliverables:

- All active Spanish copy inventory; concise task/meaning/proof layers; consistent names and exports
- Directly authored plain UI summaries for displayed programme rationales, with unchanged numeric values, visible conditions and access to the full existing interpretation/citations.

Accept when:

- Meaning preserved; no unreachable stale explanation accidentally exposed; originals exact

Verify:

- A27 plus reading actual screens aloud and recorded five-question reviews
- Check every display summary against its existing authored rationale and source context; explicit bank-hash/ID linkage and no dropped qualification.

### U006 Apply shared typography, spacing and responsive component rules

Status: planned. Size: medium. Dependencies: U002.

Deliverables:

- CSS tokens; responsive layout budgets; consistent action hierarchy/targets/disclosures/skeleton geometry

Accept when:

- MacBook, mobile, long names and zoom readable; no prose focus or border crowding

Verify:

- A23/A24 visual and keyboard checks; existing assets/lint/type checks

### U007 Finish home, resume and didactic current-method journeys

Status: planned. Size: medium. Dependencies: U004, U005, U006.

Deliverables:

- Task-led first screen; resume; unnamed interactive method example and exact optional calculation

Accept when:

- Main choices above fold; F01; example explains missing information without invented party evidence

Verify:

- A01/A02/A19/A20; exact reference arithmetic if demonstration logic changes

### U008 Finish programme selection and reversible replacement

Status: planned. Size: medium. Dependencies: U004, U005, U006, U003.

Deliverables:

- Alphabetical local search, 2/3 slots, disabled reasons, missing programme labels, edit draft and cancel

Accept when:

- All 59 formations; no preselection; search preserves selected IDs; return restores workspace

Verify:

- A03/A04/A08; browser state-transition regressions

### U009 Finish bounded parallel comparison on wide and narrow screens

Status: planned. Size: large. Dependencies: U008.

Deliverables:

- One topic, exact counts, six/page, desktop semantic table, mobile parallel overview with full conditions, honest filters

Accept when:

- D01-D05 resolved; same proposal compared; no inferred unknown agreement; no text truncation

Verify:

- A05-A10/A13/A24; real-bank screenshots and source semantics

### U010 Finish topic-first exploration and transfer to comparison

Status: planned. Size: medium. Dependencies: U008, U009.

Deliverables:

- Topic → proposal → grouped/searched positions → same-proposal comparison

Accept when:

- All formations/groups reachable; selection transfer retains active proposal and source return

Verify:

- A12/A13; F03 actual connected walkthrough

### U011 Finish contextual source reading and robust return

Status: planned. Size: medium. Dependencies: U009, U010.

Deliverables:

- Full-width comparison reader; coherent result reader width policy; exact quotes/context/links/provenance

Accept when:

- One reader; missing/official-unavailable honest; restore semantic origin through resize

Verify:

- A07/A11/A16/A22; keyboard/resize/long-quote regressions

### U012 Make results understandable, navigable and directly verifiable

Status: planned. Size: large. Dependencies: U004, U005, U006, U011.

Deliverables:

- Plain overlap/coverage presentation; complete searchable 59 results; matches/differences/missing examples; explicit local export

Accept when:

- Identical arithmetic/order/weights; zero missing programme not opposition; no old/stale reveal

Verify:

- A14-A18/A25; existing engine + affected browser/export tests

### U013 Finish task-based help, source directory and truthful notices

Status: planned. Size: medium. Dependencies: U004, U005, U006, U011.

Deliverables:

- Short practical help/privacy/accessibility; directory; direct alias/unavailable/error recovery

Accept when:

- Return to origin works; no new metric collection; exact technical detail stays accessible

Verify:

- A19/A21/A22/A26/A27; server-rendered/direct-link/no-JS checks

### U014 Reconcile loading, error, undo and cross-section states

Status: planned. Size: medium. Dependencies: U007, U009, U010, U012, U013.

Deliverables:

- Stable skeletons; retry/pending/withdrawn states; safe delete/download; consistent keyboard/reduced-motion feedback

Accept when:

- All state-matrix rules and useful failure exits pass; no raw keys/exceptions or lost session

Verify:

- A02/A17/A18/A22-A26; delayed bank/release tests

### U015 Perform the full family-access and comprehension critique loop

Status: planned. Size: large. Dependencies: U014.

Deliverables:

- A01-A28 actual application evidence, active-copy ledger, screenshots, defect ledger, privacy trace

Accept when:

- No P0/P1; five questions answerable from every screen; any P2 deferral justified with a useful task path

Verify:

- Relevant browser/PHP/engine checks; all required clean staged-tree checks; no synthetic usability claim

### U016 Prepare a coherent local review and rollback packet

Status: planned. Size: small. Dependencies: U015.

Deliverables:

- Before/after results, active plan statuses, real command evidence, bank hash, preserved history, local preview and limitations

Accept when:

- All implementation evidence exists; no unchanged task called newly implemented; publication remains unapproved

Verify:

- npm run docs:build/check:plans; exact staged-tree gate before commit; compiled and dev local preview

## Primary design references

These inform the design constraints, not a claim of proven usability.

- [W3C APG: native table semantics](https://www.w3.org/WAI/ARIA/apg/patterns/table/): Use native static table cells and real interactive controls; prose never becomes a tab stop.
- [GOV.UK: checkboxes](https://design-system.service.gov.uk/components/checkboxes/): Multiple choice with fieldset/legend, concise hint and no preselection.
- [GOV.UK: tables](https://design-system.service.gov.uk/components/table/): Use semantic row/column relationships for comparable information.
- [WCAG 2.2: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): Design content fit and narrow reading instead of shrinking all text.
- [WCAG 2.2: Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html): Sticky controls and navigation must not hide keyboard focus.
