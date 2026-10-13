# UI flow redesign: independent comparison, contextual evidence and visual results

ui-ux-cleanup-2023-v2.0.0 · planned_application_stage

Deep planning revision following renewed owner rejection. The next stage replaces capped selection and full-page readers with programme slots and contextual modal panels, separates test results from public comparison, unifies proposal/category search, simplifies exact citations, shows all 59 results with three-tab visual detail, and rewrites Cómo funciona. N001–N012 and revised F01–F08/A01–A38 are planned, not implemented or accepted. Prior U evidence is historical. The 59 formations, 80 questions, weights, calculation and private quiz remain preserved.

Application implementation started: false. Complete: false. Public launch and collection remain unapproved/disabled.

Baseline: outputs/ui-ux-flow-redesign-baseline.json. Prototype: outputs/programme-comparison-prototype.html. Source bank SHA-256: 7e0f255fed82d06fc6d3dfc0c884adeee1742d127446fc7bdb5195fc720c015b.

## Active revision, authority and definition of done

This is the planning-first owner revision after commit `000d96c`, version **ui-ux-cleanup-2023-v2.0.0**. The owner explicitly requested a deep plan before implementation. No application implementation or acceptance of this revision is claimed. The earlier U001–U016 work, its F01–F08/A01–A38 evidence and the original prototype are historical baselines. They remain in Git and the existing reports. Passing them does not accept the new journeys or establish owner satisfaction.

The latest owner decisions supersede the earlier requirements for topic browsing, comparison filters, result-to-comparison transfer, personal overlays in public comparison, direct answer editing from results, full-page readers and citation disclosures. This document replaces those active requirements; it does not change the electoral content or arithmetic. N001–N012 below are the new implementation sequence. All are planned. The planning artifact is the deliverable of this turn, not a substitute for implementing that later sequence.

The audience is a person with no political or statistical expertise who wants either to answer the test or read two/three programmes. Design around those two independent tasks. Keep a clear next action and a dependable return; do not introduce an account, tour, configuration wizard, metrics consent or extra explanatory layer merely to repair a confusing control.

Preserve the accepted direct quiz start, ordered native radios, brief checked confirmation before automatic advance, reverse Back transition, keyboard confirmation, reduced motion, 20 initial questions and existing optional blocks of 10, priorities and deliberate finish. Keep all 59 formations, 80 authored questions, 35 documents, 209 numeric positions, exact citations, values, budgets, weights, ordering and calculation. The existing bank hash is the release invariant. Missing or conflicting information is never opposition. Metrics stay disabled and every answer, query, selection, progress state, panel history and result stays in memory.

Implementation completion requires every new N task and revised A case to have fresh evidence from the real application, inspected captures, corrected defects and all mandatory checks. Maintain the five-question critique: where am I, what can I do, what does it mean, what changed, how do I return? No new human-review panel, formal owner approval, dependencies, branches, worktrees, push or deployment is needed or authorized.

## Reproduced baseline and implications

Read `outputs/ui-ux-flow-redesign-baseline.json`. On the unchanged real local app at `000d96c`, isolated Chromium inspection produced eight captures at 1280×720 and 390×844; all eight were visually inspected. Scripted opinions are test inputs, not the owner's political preferences.

- After choosing PP, PSOE and Sumar, 56 checkbox options are disabled. The selection summary's viewport top was −2205.25px after scrolling to the third choice, so the explanation and next action were offscreen. A larger warning alone would preserve this structural failure.
- Opening the comparison tools moved the first proposal down 48px at 1280px. The main search is hidden in that disclosure. The code indexes question text/help but not the topic name.
- Source reading hides the comparison and opens a long replacement surface. A one-line PP quotation is surrounded by three expandable proof/interpretation areas, repeated explanatory text and duplicate source controls.
- The current result displays six of 59 formations, with 48 controls in the app DOM for that initial result, several actions per formation and large vertical gaps. The page mixes explaining a result with selecting programmes and revising answers.
- The method capture has a text-led introduction, four example controls that wrap vertically on mobile, separate explanatory sections and three further disclosures. The example still requires reading paragraphs before understanding the percentage.
- The first question presents an unavailable Back button. Its placement can remain stable without showing an unusable control.
- Content stress cases found in the fixed bank include a 73-character formation name, a 4,452-character citation and positions with three citations. Compact layouts cannot depend on every quote or name being short.

No horizontal overflow or page errors were observed in this bounded reproduction. That does not refute the reported UX problems and is not acceptance of the redesign. The 48px measurement is interaction geometry, not a production CLS score. No new design has yet been rendered or verified.

## Owner feedback translated into concrete decisions

| Owner decision | Planned product behavior | Explicit removal / boundary |
| --- | --- | --- |
| Expansion controls look poor and move everything | Keep essential controls visible; move long secondary reading into one overlay panel; only optional inline quotations expand | No hidden search, no nested proof accordions, no universal conversion of every sentence into a panel |
| Simplify citations | Quote, compact formation/proposal context and directly linked page/line with external-link icon | Remove the four specified context/origin/full-interpretation/disclaimer items from public reading; retain their evidence data |
| Ver fuente should retain context | Modal side panel with backdrop; underlying layout and scroll stay fixed | No replacement page or shrinking the comparison to make room |
| Three programmes are confusing | Two required programme slots plus one optional third; edit one slot with the same picker panel | No fourth slot, no 56 disabled options, no full-page Cambiar programas flow |
| Comparison should have one search | Always-visible Buscar una propuesta o un tema, also matching category | Remove Tema selector, Mostrar selector, Ver temas, tools disclosure and all topic-exploration branches |
| Keep citations in comparison, align them | One deliberate Mostrar citas control per proposal, aligned shared quote row, complete exact text | No independently staggered quote starts, truncated quotations, duplicated mobile representation or nested scroll boxes |
| Test and comparison are separate | Results explain the test; Programas compares public evidence | Remove result checkboxes, transfers, comparison actions, own-answer overlays and cross-origin personal state |
| Results should show all formations compactly | All 59 in one responsive grid, one Detalle action each; local name search remains optional | No previous/next, six-row slice, Ver todas, result review/delete actions or expandable programme browser |
| Detail should be visual | One panel with three tabs and a count chart by topic | No radar, ideology map, winner badge, vote prediction or second matching formula |
| Remove Revisar esta respuesta | Read-only result and citation detail; one next-test action | Preserve internal quiz/checkpoint review, missing-topic recovery and priority editing where still reachable |
| Keep at most download and continue/restart | One Descargar resultados action and one context-sensitive test action | No result action menu hiding the removed actions |
| Smooth and subtle movement | Shared motion tokens for panels, tab changes, optional quotes, slot replacement and loading | No cascade of 59 animated cards, bouncing controls or motion delays while typing |
| Redesign Cómo funciona entirely | Short three-step explanation and one visual five-decision example; exact detail in a panel | Remove the current four-button textual example and long sequence of introductory paragraphs |
| Apply feedback elsewhere; remove dead code | Audit all public routes, loading/no-JS templates, help, privacy, accessibility, directory and catalog consumers | No unreachable old modes or stale tests kept alive only to make the old suite pass |

The old B02/B04/B05 borrowed patterns are explicitly retired. B03 retains semantic distinctions but loses its filters. B01 becomes the single comparison search; independent topic-first browsing is removed. B06 becomes a compact explanation and visual example; B07/B08 retain plain meaning/private calculation; B09 becomes a read-only source factsheet; B10 retains measured reading budgets, except that results deliberately show all 59. The seven-site research remains historical UX context, not authority over this owner revision.

## Information architecture and screen ownership

```text
Inicio ── Hacer el test ── pregunta / checkpoint ── terminar ── Resultados (59)
   │                                                           │ Detalle
   │                                                           ▼
   │                                                    Panel: 3 pestañas
   │                                                           │ Ver fuente
   │                                                           ▼
   │                                                    Mismo panel: cita
   │
   └── Comparar programas ── 2 puestos + tercero opcional ── Comparativa
                                  │ Elegir / Cambiar              │ búsqueda + citas
                                  ▼                              ▼
                          Panel: una formación             Panel: fuente

Cómo funciona ── ejemplo visual ── Panel: detalle del cálculo
Fuentes ── buscar formación ── Panel: ficha / documentos
Ayuda / Privacidad / Accesibilidad ── respuestas cortas + regreso al recorrido
```

Keep the existing top-level routes and aliases. `/programmes` and `/comparison` enter the same independent comparison state; `/how-it-works` and `/method` have one current explanation. `/sources` stays a read-only directory of all 59 formations, with the original documents and truthful absence states. No new private routes, panel URLs, query parameters or endpoints. Browser history entries contain only public section paths and null state.

Remove `topics`, `proposals`, standalone `search`, `positions` and `formation` browsing modes. Their discovery function is now the category-aware search in the comparison after choosing programmes. Source factsheets lose add-to-comparison and programme-topic-browser shortcuts; the global Programas navigation is sufficient. Keep all document/scope facts, not unused transfer machinery. This deliberately gives up looking at all 59 positions for one proposal in a separate journey; that is part of the requested simplification, not an accidental broken link.

The header remains four clear destinations (Inicio, Cuestionario 2023, Programas 2023, Cómo funciona). No extra comparison tab inside results. Moving to Programas through the global header never selects a formation from the test and never renders an answer there. Returning to an unfinished test preserves its memory session and never reveals results. Home exposes the two main tasks and the 2023 edition with one short memory notice; avoid repeated headlines and generic promotional cards.

Panel open/close does not push history. Browser Back changes the public section normally and closes any panel; an uncommitted picker query is discarded. Panel Close/Escape/backdrop are the contextual return. Do not hijack Back, create invisible history entries, or store personal identifiers in history.state. Re-entering a section restores its in-memory reading state if the session is still valid; reload/pagehide clears all private state as before.

## Programme slots: choose, compare and replace without a dead end

**Chosen approach:** explicit slots, not a capped checkbox catalogue. Entry headline: “Compara programas de 2023”. Supporting sentence: “Elige dos programas. Puedes añadir un tercero.” Show two equally prominent empty slots. Introduce the optional third action after the first two are filled; the introductory sentence already explains that it is optional. The primary action becomes available when two are filled. Before then, show “Elige un programa más” in the reserved action area; do not render “Comparar 0 programas” as a large disabled button.

| State | Visible interface | Action and result |
| --- | --- | --- |
| 0 selected | Elegir primer programa / Elegir segundo programa; optional-third hint in the introduction | Any required slot opens the same picker addressed to that slot; the optional add action appears after two selections, in its reserved area without moving the required slots |
| 1 selected | Chosen full name, remaining required slot and short next-step text | Choose the second; selected names are never hidden by search |
| 2 selected | Two names; optional third; Comparar 2 programas | Explicit Compare opens the workspace; the third is never required or auto-selected |
| 3 selected | Three names; Comparar 3 programas | Every named slot is editable; there is no affordance suggesting a fourth can be added |
| Workspace with 2 | Two editable named slots, Añadir tercero, search and proposals | Add or replace through the same picker without leaving the workspace |
| Workspace with 3 | Three editable named slots and no add control | Open the slot to replace; the rest of the comparison remains visible behind the panel |

**Picker:** title “Elegir programa” or “Cambiar [name]”; visible indication of the slot and other chosen names; local search “Buscar una formación”; all 59 names in alphabetical order; programme availability as a short secondary line. Use native buttons for a single explicit choice, with full accessible names. Names selected in another slot stay listed as non-actionable text “Ya elegido”, not as unexplained disabled checkboxes. The current name has “Actual”. Choosing a different row atomically commits only that slot and closes the panel. No extra apply step is needed for a single choice. Escape, Close and backdrop cancel the picker without changing any programme.

The picker holds only its target slot and query as a draft; it never mutates `selected` until a choice is made. No silent oldest-selection replacement, duplicates or temporary fourth selection. Before first comparison any slot can be cleared. In an established comparison, Quitar is available only when three exist, keeping the other two in their relative order. With two, changing either is replacement, not deletion to an invalid workspace. Removal is a plainly labelled secondary action inside the picker, not a nested × inside another button.

Confirming a replacement preserves proposal search, loaded proposal count, expanded quote IDs and the same proposal anchor. Only that formation's column changes. Focus returns to the edited slot. Announce once “Ahora comparas [names]”; no toast stack. With unequal new text heights, keep the anchor and animate the affected area, not the whole page. Cancelling keeps the exact underlying DOM and scroll. Leaving/reloading follows the memory policy.

Desktop slots sit in one row; narrow layouts wrap full names without ellipsis. The picker list scrolls internally while its search and Close remain reachable. At 320px/low height, avoid a large sticky header or footer covering choices. No initial 59-checkbox wall, persistent side summary or multi-screen edit wizard.

**Alternatives critiqued:** retaining capped checkboxes plus an explanatory message leaves the fourth-choice dead end; automatic replacement risks changing the wrong programme; a separate edit page repeats the current context loss. Slots require five structural actions to compare two (open/select twice, Compare), or seven for three, excluding typing a query and scrolling to a choice. These are not maximum interaction counts across all 59 formations. Accept that explicit cost only if the sketch shows the next choice and compare action clearly at every step. A single replacement costs two actions; cancellation costs one. No approval checkpoint is added.

## One proposal search and aligned comparison reading

Workspace hierarchy: title; editable programme slots; **one always-visible search**; count; proposals. Remove Ver temas, Cambiar programas as a page-navigation button, topic selects, Mostrar, personal-answer controls and expandable toolbars. A small text action “Cómo leerlo” may open short comparison help in the shared panel, not expand the toolbar.

Search label: “Buscar una propuesta o un tema”. Placeholder: “Por ejemplo, alquiler o sanidad”. Index exactly the 80 question texts, their existing help and their category names. Fold case/diacritics, trim and collapse whitespace; each space-delimited term must occur in that combined text, so “sanidad dental” works. No fuzzy inference, party-affinity order, new editorial keywords, remote suggestions or URL/storage writes. Empty query includes all 80 in the existing fixed public question order. Do not retain housing or another invisible topic filter. Show the category on every proposal, including an empty query; the category is a label, not a second filter control.

Use six proposals initially and **Mostrar 6 más** to append the next six, keeping the current proposals and focus. There is no automatic infinite scroll or previous/next pager. At the end show “80 propuestas” without a disabled Next control. Searching resets only the search result window, never selection or open matching citations. Clearing a query restores the previous unfiltered loaded count; remain at the search, without a surprise jump to an old offscreen position. Counts say “6 de 80 propuestas” or “4 propuestas para «alquiler»”. No-hit state: “No encontramos propuestas con esas palabras” plus Borrar búsqueda. Debounce only the live count announcement (~180ms); render promptly and preserve input/caret/IME composition.

Each article has category, the complete authored proposition, then equal-width programme columns. Use content rows shared across columns: name, documented stance, authored presentation summary, source action and (when requested) quotation area. Align quote starts after the tallest summary; align source actions deliberately, not through arbitrary fixed heights. Unknown statements with contextual citations remain unknown even if a quote exists. No red/green party ranking, largest-party-first ordering, shrinking small parties or hiding missing programmes.

**Mostrar citas is retained per proposal.** It reveals all available exact quotations for the chosen programmes together. The control stays in the proposal heading with an explicit expanded state; it does not jump below the new content. The quote region has one measured height transition; neighbouring columns begin at the same vertical boundary. Quotes retain punctuation, language, line breaks, multiplicity and conditions. Under each quote, the page/line or section/line is the source link. A missing quote has a short aligned “No hay una cita para esta propuesta” state rather than an empty coloured block. At narrow widths each programme is one complete name → stance → summary → citation unit. Use one semantic representation; no duplicated mini overview.

A deliberate quote expansion necessarily moves later content. The requirement is a stable clicked heading/viewport anchor and a controlled transition, not a false promise of zero height change. Panel opening must move none of the base page. Do not clamp text, add inner scrolling to each quote or reserve thousands of blank pixels just to equalize short/long sources. Long exact quotations can make the optional expanded area long; that is an explicit remaining design cost. Test the 4,452-character and three-citation cases before accepting the layout. Aligned full citations may leave natural empty space below a shorter neighbouring quote. Do not require both complete aligned quotations and zero whitespace. The default summary reading stays compact, and Ver fuente remains available without expansion.

## One accessible overlay panel, including nested source reading

Implement one reusable, scoped native `dialog.showModal()` panel controller. Source, result detail, programme picker, source factsheet and optional calculation help use this controller with distinct content. It is a modal overlay with backdrop; the page remains visually recognizable, does not resize and is inert while open. Existing small restart/download dialogs remain scoped separately; do not turn the global `dialog` CSS rule into a side panel. Only one modal is active at a time.

Desktop starting width 36rem (max 42rem for result detail if the sketch needs it), at most calc(100vw − 2rem). The panel is anchored to the right, with an opaque reading surface and a restrained dark backdrop (roughly 25–30%, no blur). Above 768px leave a recognizable part of the original page. On narrow screens use the full viewport width and dynamic viewport height: legibility takes priority over a decorative sliver of background. It remains the same overlay and returns to the retained page. Respect safe-area insets. Header and Close remain reachable; scroll the panel body, not the background. On 1024×320 and zoom avoid sticky controls consuming the reading viewport.

Open with focus on the visible Close button (or picker search when the action clearly means choosing). Give the dialog a short visible title via aria-labelledby; do not attach the entire quote/chart prose to aria-describedby. Tab/Shift+Tab remain in the dialog; hidden tab/source views are inert and absent from tab order. Escape and the labelled Close close the entire overlay. A backdrop click closes only when pointer-down and pointer-up both started/ended on the backdrop, avoiding accidental dismissal after selecting quote text. Support keyboard without requiring dragging/swiping. Source and informational panels close immediately after their exit transition; the picker cancels its uncommitted query.

On close, restore the exact semantic opener and reading anchor without scrolling the page to its top. If resize removed that opener, locate by proposal+formation or result formation ID; fallback to the nearest meaningful control, never body or a hidden node. Keep background width stable when locking scroll (scrollbar gutter or measured equivalent), and restore it on every close/error/navigation/pagehide path. Handle rapid reopen/close, reduced-motion changes, stale animation callbacks and withdrawn releases without orphaned backdrops or locked scroll.

**Result detail → source:** push one in-memory internal view onto this controller, not a nested dialog. The same outer panel keeps its dimensions; a short “Volver al detalle” control replaces the header's empty back slot. Save formation ID, active tab, topic chart selection if any, panel body scroll and opener. That Back restores the detail/tab at its previous scroll. Close/Escape/backdrop closes the whole panel to the result grid. The top-level panel has only Close, never a disabled Back. Public source panels have no redundant Back plus Close. Switching tabs is not added to panel history. No arbitrary stack of programme → topic → proposal.

No panel contents or personal identifiers go in a route, history state, storage or request. Personal panels require the current `session.revealed` and personal revision. Continue, edit, reset, withdrawal or pagehide closes and invalidates all personal content before another render. Public comparison/source panels never receive a session/answer argument. Browser Back closes the overlay and performs normal section navigation; it is not a hidden per-panel history system.

These are product choices informed by [W3C modal dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and [the native dialog contract](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog). They need actual keyboard/browser verification; an attribute alone does not prove correct behavior.

## Short citation surface, exact underlying evidence

Source-panel order: concise title “Fuente”; full formation name and 2023 edition; complete proposal as compact context; exact blockquote; **“Página 23, línea 981 ↗”** directly underneath/as caption link. If more than one citation exists, render each in order with its own locator. Use “Texto original” as a small label when distinction is needed, not a repeated disclaimer. An optional short “Resumen” line may repeat the already authored conditional summary only when needed to understand why the position is unscored. Do not add another essay under every quotation.

Remove “Leer el contexto original”, “Origen del documento”, “Leer la interpretación completa” and “La explicación es nuestra interpretación en español. La cita conserva el idioma del documento.” from citation reading. Keep `citation.context`, `rationale`, exact offsets, hashes, provenance, source notebook and exported bank evidence intact. Removing proof-layer controls is a presentation change, not permission to drop conditions from the displayed summary or invent a shorter quote. Label summaries “Resumen” and quotations “Texto original”; optional translations remain deferred.

The locator link uses the existing verified document URL, official when available, otherwise preserved. If an exact PDF page mapping is established by the existing source metadata, append the PDF page fragment; do not confuse printed page and file page or invent a line/HTML anchor. A locator label does not promise the browser can scroll to an extraction line. For HTML, show the existing section/line and link to the real document; never fabricate a page. External icon is decorative to assistive technology; the link's accessible name includes the source and “abre otra pestaña”. Use target=_blank, noopener/noreferrer and no-referrer. Opening a source must not navigate away from the in-memory test.

If a different preserved copy exists, one quiet “Copia conservada” link may remain as recovery, without a second block of source buttons. If official URL is absent, state “Copia conservada” in the locator's label and show the known unavailability once. Do not probe external URLs automatically or imply a link was just rechecked. A missing programme/quote has no fake locator: explain the actual reason and give Close. A citation supporting an unknown rationale never converts unknown to opposition or neutrality.

The source directory uses the same concise factsheet/panel and links, with exact availability and constituency facts, but no comparison or topical-browser transfer. Technical provenance remains available in preserved source artifacts/exports; do not build another admin-style metadata panel.

## All formations, compact results and one detail action

Initial result view: a short title “Tus resultados”, edition/answered-question context, a one-sentence description of confirmed overlap, optional formation search, then **all 59** entries. No pagination, hidden tail, lazy omission or Ver todas button. Search may narrow only after typing, with a visible count and clear action. Maintain the exact order returned by documentedMatch (unrounded score, existing name/ID tie order); DOM order and visual row-major order must match. Do not use masonry, rank numbers, winner badges or promote major parties.

Each compact result unit has full formation name, exact formatted confirmed-overlap percentage, a quiet 0–100 bar with a fixed common scale, weighted information-available value and one “Detalle” button whose accessible name identifies the formation. Place all buttons on a common baseline within a grid row. Avoid duplicated full-width cards with oversized padding, every row's explanation or three large actions. Prefer 3 columns at 1280px, 4 at a capped large-screen width, 2 on a roomy tablet and 1 where two would compromise name/label legibility. Never force two tiny cards into 320/390px just to satisfy side-by-side wording. Preserve all long names without ellipsis and no party-colour encoding.

The compact bar shows confirmed overlap only; its unfilled portion must not be labelled disagreement. Weighted coverage is separate. When there is no comparable programme evidence, retain the unchanged numeric result where defined, but place “Sin posturas comparables” beside it; never headline “No coincides”. With a missing topic opinion, global percentage and coverage remain null/“—”, and entries follow the existing unranked fallback. All 59 are still present. A brief top notice explains what remains unanswered; do not force an opinion to get a result.

Top-level result actions: **Descargar resultados** and exactly one next-test CTA. If missing topics remain, “Seguir contestando” first invalidates the result and enters the existing checkpoint, which offers the pending topics without naming formations. The visitor chooses a topic there and may also finish again without expressing an opinion; no opinion is mandatory; otherwise, if an existing block of ten is available, it extends using the existing engine; otherwise “Volver a hacer el test” invokes a concise safe restart confirmation. Returning to questions immediately removes personalized panels/DOM/caches and sets revealed=false. At the next checkpoint the visitor must finish deliberately again. Do not auto-refresh named results while editing. Keep the accepted checkpoint review/priority tools and quiz reset reachable; only the specified result actions disappear.

Download remains deliberate and local. Keep the existing readable TXT and technical JSON choices in the existing small dialog, including its honest contents notice. Do not add a cloud share link, publish button or new export format. The technical export schema/evidence and arithmetic are preserved.

**Detail panel:** header with formation and current overlap/coverage; one topic chart; three tabs: “Coincides”, “Difieres”, “Sin datos claros”, each with its response count. The first tab is the deterministic initial view, even if empty; do not choose a tab based on a flattering outcome. When reopening the same formation in the same result revision, retain the last tab/scroll. Each row shows category, complete proposal, the visitor's answer, documented position, concise qualified summary and Ver fuente. No Revisar esta respuesta, programme browser or compare action. Explicitly distinguish “Coincidencia exacta” from “Posición cercana”, and retain the current different/opposed labels in the difference rows.

Use accessible tabs with one tab stop, arrow/Home/End navigation, labelled panels and selected state. Since all data is already local, activation can follow focus without asynchronous delay. At narrow width, labels may wrap; no horizontal page overflow or hidden fourth option. Empty tab text should say that no answered proposal is in that group, not invite changing answers for a better score. [W3C tabs guidance](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) informs keyboard behavior; the visual layout is our design decision.

## Topic chart semantics: counts, not a second score

**One principal chart in the result detail:** “Tus respuestas por tema”. Ten fixed topic rows, with compact horizontal segments/marks and an axis in **respuestas**, not percentages. Each numeric answer contributes one count. Use the same axis maximum across all ten rows and all formation panels in that result session (the largest numeric-answer count in any topic). Show integer tick labels from zero to that maximum. Do not stretch each row independently to 100%, sort topics by affinity, use a radar, average topic scores or infer ideology. Every row has readable counts as a text equivalent, e.g. “Vivienda: 0 coincidencias, 1 diferencia, 1 sin datos claros”.

The three groups share exactly one domain: questions with a numeric answer in the current revealed session. Define it from the existing answered question IDs; skip/unsure/unasked never become party unknowns. For a valid documented position, reuse `relationship(answer, value)` unchanged: `same` and `close` enter Coincides; `different` and `opposed` enter Difieres. Unknown, conflicting or null positions enter Sin datos claros. Totals across the three tabs equal numericCount, and each topic row sums to that topic's numeric-answer count. A topic without a numeric opinion says “Sin respuesta tuya”; show no pretend party gap or zero agreement. If all 20 initial answers are skip/unsure, the axis maximum is zero: render ten such text rows and zero-count tabs, with no bars, division, artificial axis or global percentage. Report skip/unsure only in that short neutral own-response note, outside the three category totals.

Keep `same` and `close` visually/textually distinguishable within Coincides; a nearby +1/+2 remains a partial match with its original conditions. Opposite signs, including −1/+1, belong to differences even though their numerical similarity is 50%. Unknown/ambiguous/conflicting labels remain specific in the row. Neutral 0 is numeric; unsure is not neutral. Do not label all null information merely as an unlocated programme when a document exists.

Chart legend: “Coincides o te acercas”, “Difieres”, “Sin datos claros”; use a restrained teal, muted ochre and neutral patterned mark respectively, with text/counts so meaning does not depend on colour. Empty counts are not hidden. Provide a semantic table/list equivalent with the same numbers; the graphic itself can be aria-hidden to avoid duplicate announcements. No hover-only tooltips or per-mark tab stops. For version one, chart rows are explanatory, not additional filters; tab rows carry source actions.

The main percentage and coverage use `documentedMatch` and `answerWeights` unchanged. For topic t, budget B_t and priority P_t, question weights split B_t × P_t equally between answered numeric families and then questions in each family. D = sum_t(B_t × P_t); similarity = 1 − abs(answer − position)/4. Affinity = 100 × sum_known(w × similarity)/D; coverage = 100 × sum_known(w)/D when every topic has a numeric opinion, otherwise both global percentages remain null. Unknown contributes zero numerator and retains its weight; it is not an opposing value.

A brief caption resolves the two measures: “El gráfico cuenta respuestas. El porcentaje también tiene en cuenta cuánto se parecen y el peso de cada tema.” Do not reproduce formula language in every result card.

**Numerical acceptance fixtures:**

- +2/+2 gives same and 100% question similarity; +2/+1 gives close and 75%; −1/+1 is opposed despite 50%; 0/+1 is close; 0/+2 is different. These verify the actual function, not an invented similarity threshold.
- Five equally weighted synthetic decisions with two exact matches and three unknowns give 40% affinity and 40% coverage; counts are 2/0/3. The method labels this simplified example explicitly; the real bank is never changed to five equal decisions.
- Four known decisions (two exact, two fully opposed) plus one unknown give 40% affinity and 80% coverage, counts 2/2/1. Changing which two match can leave that same total; no best-party claim follows.
- Two same-topic answers +2/+2 and +2/+1 count as two matches, although the weighted similarity within that equal-weight topic is 87.5%. This is why the rejected alternative, a bar labelled 12.5% differences, would contradict the tabs.
- A same-family pair plus one other family must still use the existing family split for the score while the chart counts three answers. Changing a topic priority affects the percentage, not the count chart. Verify counts and export values separately.
- Real rent-cap case: opposing the proposition differs from Sumar, while PP/PSOE remain unknown; PSC has its own missing programme, without PSOE inheritance. Dental/mortgage/nuclear qualification cases must retain their authored wording.

Do not call counts a confidence, coverage percentage, policy completeness or probability. No new charting dependency is needed; semantic HTML/CSS or a small SVG with the textual equivalent is enough.

## Cómo funciona: complete replacement, concise first layer

The new page should answer what is compared, how missing evidence affects the number, and when the result appears without a wall of text. Use one content column with a modest visual example beside the explanation on wide screens, stacked on narrow screens. No four-button explanation toolbar, card grid of caveats or default triangle disclosures.

**Proposed Spanish first-layer copy and order (subject to rendered copy critique):**

1. H1 “Cómo funciona”. Lead: “Comparamos tus respuestas con los programas de las generales de 2023.”
2. A short three-step sequence, meaningful because it is a real sequence: “Responde” — “Empieza con 20 preguntas. Puedes saltar las que no tengas claras.” “Elige cuándo terminar” — “Después puedes ver el resultado o responder un bloque de 10 más.” “Mira las coincidencias” — “Consulta qué se parece a tu respuesta y qué fuente lo respalda.”
3. H2 “Qué significa el porcentaje”. A five-mark example already visible: two matching marks and three unknown marks; large enough labels “40 % de coincidencia” and “40 % de información disponible”. Caption: “Ejemplo con cinco decisiones de igual peso.” One native switch “Añadir información al ejemplo” changes the other three to two differences and one unknown, producing the same 40% overlap but 80% information. Result geometry stays fixed. Text equivalent updates with the marks; no real formation, political position or user answer is involved. The exact 40/80 pair is a teaching model, not a claim that real questions have equal weights.
4. One central sentence: “Si falta información, no suma coincidencia. Tampoco significa que la formación esté en contra.” A short interpretation note: “Dos resultados iguales pueden coincidir contigo en propuestas distintas.”
5. One compact provenance/privacy line: “Usamos los programas comunes del 23J de 2023. Tus respuestas se calculan aquí y se borran al recargar o cerrar esta pestaña.” Link Fuentes as a public directory; no repeated global warning.
6. One optional “Detalle del cálculo” action opens the shared panel with exact scale, weights/families, priorities, missing evidence, incomplete topics, rounding/ties and authored 20+10 order. Ordering research and migration gap remain available in that same secondary reading; they do not precede the primary explanation. One test CTA, or “Volver a mi test” when a session exists.

Aim for roughly 180 words in the first reading layer, excluding the external source directory and exact-calculation panel. This is an editing target, not permission to discard a necessary limitation. The initial visual example must be visible without opening a disclosure. On narrow screens the switch and both values fit without four stacked buttons. No animated counting from zero or decorative progress race.

No-JavaScript/server-rendered fallback uses the same compact copy, an already visible static 40/40 example and exact text further down with an ordinary anchor. Hide nonfunctional example controls rather than showing disabled buttons. The app version of optional detail uses the panel. `/method` remains an alias to the same content. Error/loading states must not revive the obsolete ten-plus-five or comparison-cohort explanation.

## Visual direction, typography and motion system

**Direction:** a clear public reading tool. The memorable content is the parallel proposal and the topic-response graphic. The rest stays quiet. Retain the existing locally available Avenir Next / Segoe UI / Arial family, with deliberate weights: 400 reading text, 500–600 names/actions, 600 page headings. Avoid the current heavy headline treatment on every proposal. No font download/dependency changes, party colours, promotional gradients, giant numbers, decorative illustrations or shadows on every block.

Base palette: paper #ffffff; ground #f4f7f8; ink #192e34; secondary text #52666e; action/confirmed relationship #185b64; difference-series #85642b. Neutral lines/patterns derive from the existing #d4dfe2 border token; verify actual contrast, including graph boundaries and focus, in context. An ochre difference denotes a difference, not a bad answer. Preserve a distinct visible focus ring and check forced colours.

Type targets: body 1rem–1.0625rem, 1.5–1.6 line height; controls >=1rem where possible; metadata >=.875rem; non-home page title 1.75–2rem; proposal title 1.125–1.375rem. Use rem units and natural wrapping. Reading measure about 55–68 characters where space permits; panel text must not be squeezed to keep backdrop visible. Spacing scale 4/8/12/16/24/32/48px expressed in rem, compact within a task and generous between proposals. Controls minimum 44×44 CSS px without inflating every text link into a filled button. Thin borders indicate actual grouping; avoid a blue-tinted slab above every proposal or identical padded cards for every paragraph.

Responsive budgets: compare columns only when each has about 18rem of readable width; otherwise stack programme units. Grid reflows by available content width, not device labels. Maximum main content about 90rem for four compact result columns; 2/3 programme comparison never stretches prose across the whole ultrawide screen. At 200% text and 400% zoom, controls wrap and headers may cease being sticky. No fixed text height, ellipsis or horizontal page scroll. Mobile has one readable result per row when needed, not a two-column miniature dashboard.

| Interaction | Default motion | Reduced motion / interruption |
| --- | --- | --- |
| Panel open/close | 220ms enter, 160ms exit, restrained 16–24px horizontal motion plus opacity; backdrop 160ms; ease cubic-bezier(.22,1,.36,1) | Immediate state change, no slide/scroll animation; retain focus/feedback |
| Panel internal source/back and tabs | 120–160ms contained opacity change, stable shell; no scrolling the underlying page | Immediate; keep active tab and target focus |
| Inline quotations | 180–220ms measured container-height transition; heading/opener anchored; content fades within region | Immediate expand/collapse; same anchor; no clipping after completion |
| Programme replacement | 140–180ms contained change in the affected column/slot; no whole-page entrance | Immediate, one polite status message |
| Search and all-result grid | No per-keystroke card animation; stable input and count; optional <=120ms whole-result fade after settled input | Immediate; no focus movement or delayed keyboard action |
| Loading/retry | Reserve structural geometry; subtle opacity change; avoid skeleton shimmer when reduced | Static shape, readable busy state |
| Quiz | Existing checked confirmation and forward/reverse motion preserved | Existing accepted behavior retained |

Do not use transition:all, guess a huge max-height, queue animations on repeated clicks, animate all 59 cards, stagger every source paragraph or use scrollIntoView smooth on every update. Use cancellation-safe final states, preserve hit targets during transition, and resolve close even when animationend is skipped. Opening information must never move the base page. A smooth expansion still changes layout: measure its visual anchor and inspect frames, not only a final screenshot.

[web.dev's CLS definition](https://web.dev/articles/cls) excludes some shifts close to user input; therefore a low CLS alone does not establish a comfortable interaction. Record raw element displacement, unexpected shifts during load, panel background geometry and actual short motion clips/frames separately. Preserve the existing loading regression threshold of total recorded shifts <0.001 in tests/Browser/loading.spec.ts; never relax it to the general CLS reference of 0.1. Also require no unexpected loaded-view movement, panel base-page anchor <=1 CSS px movement and quote opener <=2 CSS px. These are future acceptance targets, not measured results or production Core Web Vitals claims.

## Concrete wide and narrow sketches, with critique

```text
Comparison entry (wide)
Compara programas de 2023
Elige dos programas. Puedes añadir un tercero.
[ Elegir primer programa ] [ Elegir segundo programa ] [ Añadir tercero ]
                             Elige dos programas para comparar

Comparison (wide)
Compara programas de 2023
[ Partido A  editar ] [ Partido B  editar ] [ Añadir tercero ]
Buscar una propuesta o un tema  [ alquiler                         × ]
4 propuestas
Vivienda
El Estado debería poner un precio máximo al alquiler...  [Mostrar citas]
Partido A                         Partido B
Sin postura documentada           Apoyo a la propuesta
Resumen con sus condiciones       Resumen con sus condiciones
Ver fuente                        Ver fuente
---------------- aligned optional quotation row -------------------
“Cita exacta...”                   “Cita exacta...”
Página 23, línea 981 ↗             Página 30, línea 1102 ↗
```

```text
Results (wide; all 59 continue in ordinary document flow)
Tus resultados                         [Descargar] [Seguir contestando]
20 respuestas · Programas de 2023
Coincidencias que hemos podido comprobar...    [Cómo se calcula]
Buscar una formación [                                      ]
Name A              Name B              Name C
37,5 %              30 %                28,8 %
[fixed-scale bar]   [fixed-scale bar]   [fixed-scale bar]
Información 75 %    Información 35 %    Información 35 %
Detalle             Detalle            Detalle
...
```

```text
Result + panel (wide)
Result grid remains in place    │ Sumar (SUMAR)                   [×]
under dimmed backdrop          │ Coincidencia 37,5 % · Información 75 %
                               │ Tus respuestas por tema
                               │                 0    1    2 respuestas
                               │ Vivienda        [diferencia][sin datos]
                               │ Trabajo         [coincide ][coincide ]
                               │ ...all topics, same count scale...
                               │ Coincides(7) Difieres(8) Sin datos(5)
                               │ Full proposal
                               │ Tu respuesta / postura / resumen
                               │ Ver fuente
```

Illustrative names/counts/percentages above show layout, not a proposed changed real result. In implementation use internally consistent real fixtures; do not copy these arbitrary counts into acceptance evidence.

```text
Source panel (narrow)
Fuente                              [×]
Partido Popular (PP)
Programa de 2023
Propuesta completa, readable wrap

“Eliminaremos el impuesto a las grandes fortunas”
Página 23, línea 981 ↗
```

```text
Comparison (narrow)
Programmes slots, full names
[Buscar propuesta o tema          ]
Vivienda
Complete proposition       Mostrar citas
Partido A
Postura · complete conditional summary
Ver fuente
[optional complete quote + locator]
Partido B
Postura · complete conditional summary
Ver fuente
[optional complete quote + locator]
```

Critique: the result grid is justified by the explicit side-by-side request, but a wall of generic decorated cards would still fail. Use compact open units with quiet separators, common value alignment and a single action. Comparison should feel like reading two programmes, not an administration table. Slots are concrete and explain the maximum structurally, but add two picker-opening actions at entry; render and critique that cost before implementation acceptance. A panel is suited to secondary evidence, not every primary page. On mobile it necessarily covers the page; preserve return rather than force narrow text. Inline full quotations retain a real height cost; avoid solving that through hidden evidence. Animation must clarify state, not disguise a poor information structure.

## Apply the same decisions across public surfaces

- **Quiz:** omit the first-question disabled Back; reserve its navigation slot so progress/title placement does not jump on question two. Render a real Back button only when previous() is available. Apply the same absence rule to exhausted Next/More controls where appropriate, with a brief truthful end state. Do not change answer order, checked confirmation, auto advance or reverse motion. Move short optional question help to a compact anchored information panel using the shared controller if inline expansion would push answer targets; it contains only existing neutral help, no party evidence, and closes to the same selected radio. Keep checkpoint priorities/review/recovery reachable.
- **Help:** replace the wall of triangle disclosures with short question headings and already visible concise answers. Link directly to the actual action/route. Remove instructions promising result comparison, topic browsing or one-answer editing from results. Long exact calculation opens the one method panel. Do not add a separate panel for every two-sentence answer.
- **Privacy/accessibility:** short visible sections for memory, explicit download, external documents and inactive metrics. Keep truthful host/log limitations accessible; do not claim anonymity. Accessibility explains panel Close/Escape/focus and reduced motion. Direct links work without a session; contextual entry offers one return naming the origin. No bare disabled Back when no origin exists.
- **Sources:** retain the searchable all-59 directory and exact availability; factsheet in shared panel, source links concise and public. Remove add-to-comparison, Ver sus propuestas and programme-topic flows. Include source hashes/provenance in retained developer artifacts/export data without restoring the rejected public citation accordion.
- **Home/header/footer:** two distinct main tasks, resume when applicable, active navigation, no new topic entry or compare-from-result shortcuts. Preserve links/aliases and footer privacy/help/accessibility. Top-level task navigation remains a page, not a modal maze.
- **Loading/errors:** server skeletons match slots/search/grid geometry; no retired controls flash before mounting. Spanish errors retain retry and useful exit. Retry preserves in-memory answers until a verified withdrawal requires reset; source link failure never clears the test. No-JS shows static explanation and source access, not dead controls. Direct legacy feedback/insights routes remain truthful and metrics stay off.
- **Export:** keep existing local formats and source context; remove stale instructions about retired result controls. Do not trim evidence from the technical export to make the UI simpler.

For every active translation key, classify keep/rewrite/remove by actual consumer, including dynamic lookups, Blade/no-JS, export and legacy non-released fixture application. Do not remove a key just because a literal rg hit is absent. Extend the existing copy ledger with the changed active strings and an explicit retired-consumer map; preserve earlier audit evidence as history.

## State transitions, recovery and privacy

Keep state small and owned by the surface: quiz/session; public comparison slots + query + loaded count + quote IDs + anchor; directory query; modal mode + opener + internal return frame; result search + per-formation detail tab/scroll scoped to a revealed revision. Avoid snapshots of arbitrary old DOM as a cross-section navigation model. Retaining the live underlying DOM while a panel opens is preferable to reconstructing and attempting to restore every node.

| Trigger | State preserved | State invalidated / recovery |
| --- | --- | --- |
| Open/close source | Selection, query, result order, quote state, page scroll | Only overlay reading state ends; opener focus restored |
| Result tab → source → internal Back | Formation, tab, chart, body scroll | Source child frame discarded; never duplicate dialog |
| Open/cancel slot picker | Exact confirmed selection and workspace | Picker query/target cleared; no comparison rerender |
| Choose replacement | Query, loaded proposal count, anchor, other slots | Only targeted formation cell changes; optional cite contents recomputed |
| Search / clear | Selection and in-memory open matching citation IDs | Result window resets; prior unfiltered count returns on clear; focus stays input |
| Continue from result | Existing answers/priorities and accepted extension rules | All revealed personal detail and caches invalidated before question view |
| Restart cancelled | Entire current result and scroll | Confirmation closes only |
| Restart confirmed | Public comparison and directory may remain independent | Old quiz answers/priorities/result cleared; fresh quiz starts; deliberate finish required |
| Browser section navigation | Current valid memory session and section state | Close panel, cancel picker draft and animations; no extra history entries |
| Release check fails | Answers and pending deliberate finish | Do not reveal; retry is explicit and double-click safe |
| Release withdrawn | Public truthful withdrawal view | Close personal panels and suppress withdrawn results, per existing release contract |
| pagehide/reload/bfcache restore | Only public fixed bank/release policy | Purge private state and stale modal DOM; no restoration from browser storage |

Every normal/empty/loading/error/pending/exhausted state needs a usable exit. Picker no-hit: clear search, no loss of prior programmes. Comparison no-hit: clear only query. Empty result tab: readable absence, tabs/Close remain usable. Unknown with a contextual quote: show it and explain lack of scored stance. Missing source: no fake link, keep Close. Network failure during final release check: answers survive and the same explicit finish can be retried. No auto-search or source-panel request; automatic application requests use the same fixed public bank/release endpoints and unpersonalized payloads. Their count and timing may differ because every deliberate finish/retry checks the release. A user-requested external document navigation is allowed, with no personal payload or referrer.

Test cancellation races: open/close/open same panel, tab switching while closing, press Escape twice, resize with long source, section navigation during opening, restart/continue during a queued callback, source external-tab return and bfcache. Assert no stale personalized DOM, scroll lock, backdrop, hidden tab focus, duplicate listeners or cached personal frame.

## Implementation and dead-code retirement map

Baseline line references apply to `000d96c` and will move. Inspect callers before deleting shared functions; remove whole unused branches, not just hide controls.

| File / baseline area | Retire | Replace / retain |
| --- | --- | --- |
| resources/js/iteration-app.ts:40–78 | resultSelected/resultOrigin/resultPage/allResults, personal public overlay, publicTopic as filter, topic/position/search/formation modes, workspaceFilter/tools state and old return snapshots | Small public comparison state, single modal controller, result presentation state scoped to revision |
| iteration-app.ts:322–436 | readingLayout full-page stack, programmeReader, reviewOne caller chain, resultExamples page replacement | Modal source/detail renderers; reuse relationship()/summaryText()/profilePosition semantics |
| iteration-app.ts:437–478 | resultToComparison, selection chips/checks, result pagination, three actions, review/delete/all buttons | All-59 grid, one detail button, exactly three tabs, download and one next-test action |
| iteration-app.ts:505–676 | full-page startSelection/cancel navigation, publicSnapshot/restorePublic/openPublicQuestion, overlayControl, filters and independent topic/proposal/positions/formation flow | Slot picker, local combined search, appending six public proposals, aligned inline quotes |
| iteration-app.ts:678–707 | Directory add/transfer/topic-browser actions, full-reader ResizeObserver, obsolete reset/pagehide state | Read-only factsheet panel, safe common teardown and semantic return |
| iteration-app.ts:153 | Four-mode paragraph-based method example | Single stable five-mark example and one native switch |
| iteration-app.ts:170/195/253–300 | Only result entry points to delete/review and unavailable control rendering | Preserve resetDialog, pending recovery, quiz review/importance editing, finish/release checks and accepted motion |
| resources/css/app.css | .result-selection/.result-choice, comparison-tools/filter/topic layouts, full-reader/has-reader hiding and duplicate old overrides | Scoped panel/tabs/chart/slot/grid/quote/motion tokens; no global dialog conversion |
| resources/views/public/app.blade.php:49–99 | Retired themes/toolbars/reader skeleton markup | Same new loading geometry; useful static fallback and original source availability |
| resources/views/public/information-content.blade.php | Current method template and disclosure walls | Concise visible answers, static method fallback, optional detail panel entry |
| lang/es/ui.php, cleanup.php, iteration.php, public.php | Keys proven unused after retirement, stale flow instructions | New semantic English keys with complete Spanish labels/error/a11y/exports |
| resources/js/app.ts, routes/web.php | Only consumers proven unreachable | Keep synthetic/legacy engine path where still covered, top routes/aliases/API/release/privacy boundaries |
| resources/js/documented-affinity.ts, matching.ts, questionnaire.ts, programme-summaries.ts | No scoring/editorial rewrite | Unchanged engine/weights/59/80 and authored summaries; new pure presentation adapter may reuse public outputs |

Replace obsolete UI tests instead of preserving removed behavior: A29 result transfer, A35 direct response review, A12 topic exploration, A13/A31 filters, old six-result expectations and old UX01/UX04 nonmodal/no-inert assertions. Every invariant they also covered (privacy, unknowns, qualifiers, source return, all formations) needs a named replacement case below. Keep distinct tests of quiz confirmation/back/reduced motion, priorities, incomplete topics, export, release failure/withdrawal and arithmetic. Do not delete unrelated tests or weaken mandatory CI.

Search for dynamic translation prefixes and every old mode/class/function after implementation. Run compiler/lint plus real routes to distinguish unused code from retained fixture/public fallback consumers. Remove dead animation listeners, detached reader stacks, unreferenced CSS and obsolete selectors/helpers within the same slices. The final cleanup task is a reachability audit, not a license to defer all cleanup to the end or delete historical evidence, source notebooks, fixtures or documents.

## Execution sequence and real design loop

N001–N012 are separate bounded, dependency-ordered implementation blocks. Each block follows **reproduce → define user task → sketch two viable treatments and critique → implement entry-to-return path → verify behavior → inspect real captures and motion → correct → record evidence**. The layouts above are starting designs, not app acceptance. No block is completed by a prototype or by automated tests alone.

Use real bank examples at every sketch and implementation step. For a changed screen record the five comprehension answers with actual visible labels. Capture both complete viewport and full page where useful, not only isolated beautiful components. Include the data/time/hash, viewport, exact actions, observation, defect, correction and recapture in the existing execution journal and revision-specific application evidence. Do not repeat earlier owner-satisfaction claims. User rejection remains an input, not something a test can overrule.

Per-slice checks: affected behavior regressions, type/lint/build when applicable, real keyboard path, mobile/wide/text enlargement and motion inspection for changed surfaces. Final checks: revised A01–A38 and F01–F08, bank/score/export parity, privacy trace, Spanish copy, no-JS/routes/errors, all required browser/PHP/engine/tooling/security checks. Runtime fallback/template behavior is part of the UI, not a separate afterthought.

Mandatory acceptance viewport matrix: 320×568, 390×844, 768×1024, 1280×720 MacBook, 1512×850, 1920×1080 (capped content) and 1024×320; real 200% text enlargement and 400% browser zoom/reflow, not merely a smaller screenshot. Check motion on and reduced, keyboard-only and forced colours. Chromium plus installed WebKit/Firefox where available; unavailable browsers are reported, not invented or installed as a hidden dependency change. Record actual elapsed interaction measurements on the local build and throttled loading; no production performance claim.

Before every local commit: synchronize the JSON/human/managed plans with `npm run docs:build` and `npm run check:plans`; preserve/install the local hook; stage only the intended tree; run `python3 scripts/check-staged.py` for that exact index; no skipped/failed required checks, bypass or control weakening. Preserve main, files/history and running owner servers; no dependencies, push, deployment or scheduler.

Final implementation packet must identify baseline and implementation commits, fresh screenshots/motion evidence, actual commands and hashes, remaining honest limits and local preview. This planning turn only records reproduction, decisions, dependencies and planned acceptance. N tasks remain planned until their own application evidence exists.

Write the future revision acceptance to `outputs/ui-ux-flow-redesign-application-verification.json`. Keep `outputs/ui-ux-cleanup-application-verification.json` unchanged as historical evidence. The future path is a planned deliverable, not a file asserted to exist now.

## Revised A01–A38 acceptance matrix (all pending)

These are the **v2.0** meanings of the existing IDs. They do not inherit passes from v1.1. The previous matrix remains available at commit 000d96c and in its verification report. Every case below requires fresh evidence from the actual application.

| ID | Practical walkthrough | Required result |
| --- | --- | --- |
| A01 | Home and direct quiz entry | The two main tasks and 2023 context are clear. Direct quiz entry is unchanged. Back is absent when unavailable on the first question, while navigation geometry remains stable. |
| A02 | Separate journeys and session return | Quiz → header Programas → help → quiz preserves answers without transferring selection, personal answers or result data to comparison. |
| A03 | Programme slot lookup | All 59 formation names are available in alphabetical order. Search handles minor formations, accents and long names. A formation selected in another slot is identified; none is duplicated or hidden. |
| A04 | Zero, one, two or three selections, and replacement | Visible slots explain the next action and that the third slot is optional. Initial comparison requires an explicit action with valid selections. There is no fourth slot or unusable disabled-list state. Replacement changes only the chosen slot. |
| A05 | Real-bank rent-cap semantics | PP and PSOE remain unknown; Sumar supports the proposal. Exact contextual citations do not create invented opposition or scored positions. |
| A06 | Nuclear proposal | PP, VOX and Sumar retain their conditions and original values through search, grid reflow and panel reading. |
| A07 | Dental and mortgage qualifications | Preserve PSOE's gradual expansion and dental condition for people over 75, and its 20% guarantee, under-35 limit and first habitual home condition. Preserve PP's 95% condition. Positions scored +1 and +2 are not presented as identical policies. |
| A08 | PSC and missing programmes | PSC has exactly one entry, inherits no PSOE positions, remains selectable in public slots and appears among all 59 results. Missing information never means opposition. |
| A09 | Search and append across all 80 proposals | An empty query starts across all 80 proposals. Each action appends six more without replacing earlier content. Search, category matching, counts and clearing follow the restoration contract. No hidden filter or pager remains. |
| A10 | Inline quotation alignment and narrow representation | In two or three columns, quotation starts and action rows align. Narrow layouts use one unit per formation. Summaries and citations remain complete, without duplicated DOM content or clipped conditions. |
| A11 | Source panel and contextual return | The base page moves no more than 1 px. The close button, Escape and backdrop restore the semantic opener and anchor. The original locator is an external link. Resizing and long sources preserve return context. Exercise entry with inline quotes both closed and open; closing the panel never opens previously closed quotes. |
| A12 | Replacement of the retired topic journey | No Ver temas action, topic selector, standalone proposal, positions or formation browser, or orphaned entry remains. Category-aware comparison search and the source directory remain useful. |
| A13 | No results, unknown positions and missing quotations | Clearing the query works. Programmes with only unknown positions still display proposals without fabricated agreement. Contextual citations and absent quotations remain distinct. |
| A14 | Score and ordering parity | Exact documentedMatch output, weights, ordering and exported values match the baseline across varied fixtures. There is no new matching formula, winner claim or probability claim. |
| A15 | All 59 compact entries | The initial DOM and visible document contain 59 unique formations. There is no six-row slice, Next, Previous or Ver todas control. The responsive grid keeps long names readable. |
| A16 | Result → detail → source → return | Each formation has one Detalle action leading to three tabs and a topic chart. The relevant quotation is reachable in two actions, excluding tab selection and scrolling. Internal Back restores the tab and scroll position; Close returns to the grid. |
| A17 | Incomplete answers, skipping and uncertainty | The global percentage remains null. Charts and tabs count numeric answers only. A topic without the user's opinion is distinguished from an unknown programme position. Recovery uses the single next-test action, leading to the existing checkpoint. An all-skip/unsure session shows ten “Sin respuesta tuya” rows, zero-count tabs and no chart bars or division by zero. |
| A18 | Continue and restart | Continuing invalidates personal state and uses the existing extension or recovery flow. Restart supports safe cancellation and confirmation. Results require a new deliberate finish. Results contain no direct review or delete action. |
| A19 | Method aliases and static fallback | Both routes present the same concise current explanation, the 20 + 10 progression and exact calculation. Retired ten-plus-five and cohort contracts are absent. The no-JavaScript fallback has no disabled controls. |
| A20 | Visual method example | Five marks and one switch demonstrate an exact, anonymous change from 40/40 to 40/80. Geometry stays fixed, keyboard use and a textual equivalent are available, and the example does not mutate quiz state. |
| A21 | Help, privacy and accessibility | Short answers are visible, flow language is current, and contextual return or a useful direct link is available. Statements about memory, external navigation, logs and disabled metrics remain truthful. |
| A22 | Failure and recovery | Missing or unavailable official sources, a bank 503 response, release-check failure and withdrawal have Spanish recovery states. There are no fabricated links, raw translation keys, leaked results or stale results. |
| A23 | Loading and layout stability | Skeletons match the new controls and never flash retired controls. Retain the existing loading shift threshold <0.001 and measure anchor geometry; do not infer reading comfort from CLS alone. Opening a source leaves the base page unchanged. |
| A24 | Accessibility and motion matrix | Cover every specified viewport, 200% text, 400% zoom, keyboard use, forced colours and reduced motion. Targets are at least 44 px. Nothing clips or obscures focus, and actual transition frames are inspected. |
| A25 | Traffic, storage and privacy | Automatic app requests use fixed public bank and release endpoints with no personal payload. Counts and timing may vary with deliberate finish/retry. External source navigation occurs only on explicit link activation, without personal data or referrer. Queries, answers, selections, chart IDs and panel IDs never enter traffic, URLs, history or storage. Export is deliberately local, and pagehide purges private state. |
| A26 | Legacy unavailable and error routes | Feedback, insights and 404 pages provide useful Spanish exits. Metrics remain disabled. There is no new publication, collection or dependency. |
| A27 | Copy, quotations and exports | Audit the active catalogue for changed and retired consumers. Preserve the original quotation language and essential conditions, label summaries, and remove obsolete actions from help and exports. |
| A28 | Local build and runtimes | The installed development workflow and build preview work. Preserve the owner's processes and hot marker. Mandatory checks pass without workarounds or weakened assertions. |
| A29 | Retirement of comparison from results | No result-to-comparison button, checkbox, transfer or selection cache remains. Global Programas navigation carries no private state. Replace the old test with a test of this absence. |
| A30 | Reveal boundary on every surface | Personal panel, chart and tab content appears only after a deliberate finish of the current session. Public comparison never displays personal data. Continuing, resetting, withdrawal and BFCache restoration cannot revive stale views. |
| A31 | Chart arithmetic and relationship groups | Preserve the exact same/close and different/opposed groups. −1 versus +1 is opposed despite 50% similarity; +1 versus +2 is close. Unknown positions remain distinct. Totals based on numeric answers reconcile with the tabs. |
| A32 | Unified proposal and category search | Test Sanidad; salud and dental through actual help text where present; sanidad dental; accents, spaces, IME input, no results and clearing. All 80 proposals retain their fixed order. State stays in memory and focus does not jump. |
| A33 | Counts and weighted percentages | With duplicate-family and priority fixtures, chart counts remain accurate while existing percentage weights apply. The same two matches may produce 87.5% topic overlap. Do not label a residual similarity fraction as disagreement. |
| A34 | Equal, close and zero outcomes | Rounded ties and ordering remain unchanged. Clearly label zero overlap when evidence is absent. Detail explains different sets of agreements without invented confidence or ranking recommendations. |
| A35 | Retired result editing and retained quiz recovery | Results have no Revisar esta respuesta, review or delete actions. Checkpoint review, priorities, pending-topic recovery and Back still work. Editing invalidates results and requires another deliberate finish. |
| A36 | Panel lifecycle and tabs | Verify focus containment, manual closing, the backdrop drag guard, rapid toggling, tab keyboard behaviour, empty tabs, resizing and section Back. No orphaned overlay or scroll lock remains. Visiting help does not change the selected radio. |
| A37 | Source factsheets | All 59 formations retain availability, scope and document information. Missing programmes are described honestly. There is no add, compare or topic-browser action. External references are concise, and search and focus are restored. |
| A38 | End-to-end visual critique | Complete eight connected flows, review screenshots and animation frames, answer the five comprehension questions for each state, and audit dead code. No P0/P1 defect remains open, and no known core UX failure is hidden as P2. Historical evidence is not new acceptance. |

For every case, record its status, applicable N tasks, exact sequence and viewport, assertions, relevant screenshot or motion evidence, observed defects and corrections. A retained arithmetic test can substantiate arithmetic, but cannot complete acceptance of a changed source panel or result layout. Visual review must include missing and long content, not only major parties and short citations.

Disposition of the previous A cases: retain and rerun A01–A08, A14, A19 and A21–A28 against the new surfaces. Replace A09–A13, A15–A18, A20 and A29–A38 as specified above. A29 and A35 now test the absence of explicitly retired actions alongside the retained privacy and recovery invariants. Source-return tests replace the former full-page and no-inert requirements with the modal contract. This is an owner-authorized behaviour change, not weaker verification.

## Connected navigation and return graphs

### F01 Start and preserve the accepted test

Start: home. Walkthrough: home → quiz → help → quiz → home.

- **home**: Choose a main task. “Empezar el test” → quiz (retain accepted session rules)

- **quiz**: Answer without named results. “Ayuda” → help (retain answer/progress/native selected state); “Inicio” → home (retain in-memory test)

- **help**: Understand the existing question. “Cerrar” → quiz (retain radio and opener)

### F02 Select two/three and replace one in place

Start: selection. Walkthrough: selection → picker → selection → selection → picker → selection.

- **selection**: Use the programme slots on the same comparison surface, before or after proposals are shown. “Elegir o cambiar un programa” → picker (retain confirmed slots and any existing comparison query, quotes and anchor); “Comparar 2 o 3 programas” → selection (retain selected IDs; reveals the proposal body on this same surface); available when initial entry, two or three slots filled

- **picker**: Choose or replace exactly one slot without leaving the underlying surface. “Elegir esta formación” → selection (retain other slots; updates only the target; existing comparison stays visible after closing); “Cerrar / Escape / fondo” → selection (retain unchanged selection, query, quotes and reading anchor)

### F03 Search, inline quotes and source return

Start: workspace. Walkthrough: workspace → search → quotes → source → quotes → workspace.

- **workspace**: Browse fixed public proposals. “Buscar una propuesta o un tema” → search (retain selection and unfiltered loaded count); “Ver fuente” → source (retain exact current quote expansion state, query, selection and opener)

- **search**: Read query results and category. “Mostrar citas” → quotes (retain query/count); “Borrar búsqueda” → workspace (retain selection; unfiltered loaded count); “Ver fuente” → source (retain exact current quote expansion state, query, selection and opener)

- **quotes**: Read complete aligned originals. “Ver fuente” → source (retain query/expanded IDs/anchor); “Ocultar citas” → search (retain selection/query); “Borrar búsqueda” → workspace (retain selection)

- **source**: Read a source in the overlay. “Cerrar” → workspace (retain exact entry state, source opener and scroll; no implicit inline-quote expansion); available when opened from workspace; “Cerrar” → search (retain exact entry state, source opener and scroll; no implicit inline-quote expansion); available when opened from search; “Cerrar” → quotes (retain exact entry state, source opener and scroll; no implicit inline-quote expansion); available when opened from quotes

### F04 All results and contextual detail

Start: results. Walkthrough: results → detail → differences → source → differences → results.

- **results**: See all 59 after explicit finish. “Detalle” → detail (retain unrounded order/search/grid anchor)

- **detail**: Read count chart and matches tab. “Difieres” → differences (retain same formation/outer panel); “Sin datos claros” → unknowns (retain same formation/outer panel); “Cerrar” → results (retain grid/focus); “Ver fuente” → source (retain current tab and body scroll); available when the proposal has an existing contextual citation

- **differences**: Read numeric answered differences. “Ver fuente” → source (retain tab and panel scroll); “Coincides” → detail (retain formation/chart); “Cerrar” → results (retain grid/focus)

- **unknowns**: Read missing or conflicting positions. “Coincides” → detail (retain formation/chart); “Cerrar” → results (retain grid/focus); “Ver fuente” → source (retain current tab and body scroll); available when the proposal has an existing contextual citation

- **source**: Read exact evidence in the same panel. “Volver al detalle” → detail (retain previous tab/opener/body scroll); available when opened from detail; “Volver al detalle” → differences (retain previous tab/opener/body scroll); available when opened from differences; “Volver al detalle” → unknowns (retain previous tab/opener/body scroll); available when opened from unknowns; “Cerrar” → results (retain result grid anchor)

### F05 Understand the calculation with one example

Start: method. Walkthrough: method → example → calculation → example → method.

- **method**: Understand the three steps. “Añadir información al ejemplo” → example (retain anonymous teaching model only)

- **example**: See 40/40 and 40/80 semantics. “Detalle del cálculo” → calculation (retain fixed example geometry/control); “Volver al ejemplo inicial” → method (retain no test mutation)

- **calculation**: Read exact technical rules. “Cerrar” → example (retain method example state/focus)

### F06 Source directory and public notices

Start: directory. Walkthrough: directory → factsheet → directory → notice → directory.

- **directory**: Find any of 59 formations. “Ver documentos” → factsheet (retain directory query/anchor); “Privacidad” → notice (retain directory return origin)

- **factsheet**: See 2023 availability and originals. “Cerrar” → directory (retain opener/search/scroll)

- **notice**: Read a concise public notice. “Volver a Fuentes” → directory (retain directory state)

### F07 Failure, explicit retry and useful exits

Start: quiz. Walkthrough: quiz → pending → failure → pending → results → quiz.

- **quiz**: Answer or recover pending topics. “Terminar” → pending (retain answers; deliberate finish intent)

- **pending**: Check public release without uploading responses. “Error de conexión” → failure (retain answers; no reveal); “Comprobación válida” → results (retain current release and deliberate finish)

- **failure**: Understand failure and recover. “Reintentar” → pending (retain same answers and release); “Volver al test” → quiz (retain unrevealed session)

- **results**: Read valid result. “Seguir contestando” → quiz (retain answers/priorities; revealed state invalidated)

### F08 Leave results deliberately, without comparison transfer

Start: results. Walkthrough: results → export → results → restart → results → continuation → results.

- **results**: Choose only download or the next test step. “Descargar resultados” → export (retain current result); “Volver a hacer el test” → restart (retain current result until confirmed); available when no extension/recovery; “Seguir contestando” → continuation (retain answers/priorities, never named results while answering); available when extension/recovery exists

- **export**: Choose a deliberate local download. “Descargar / Cancelar” → results (retain result/reveal; no upload)

- **restart**: Confirm a fresh quiz. “Cancelar” → results (retain all current data); “Empezar de nuevo” → continuation (retain public comparison only; old quiz cleared)

- **continuation**: Answer privately again. “Terminar deliberadamente” → results (retain only newly valid current result)

## Active implementation tasks

### N001 Validate sketches and build the shared modal and motion foundation

Status: planned. Size: large. Dependencies: none.

Deliverables:

- Render wide and narrow sketches using real data for programme slots, comparison, sources, results and the method explanation. Critique each connected slice before coding it.
- Implement a scoped native panel controller with scroll and focus restoration, an internal source view, and motion that can be safely cancelled. Retain the small reset and download dialogs.

Accept when:

- The panel preserves the base page geometry and closes through its close button, Escape or the backdrop. Only one modal is open, and no personal data enters routes or persisted state.
- Long content, narrow and low-height viewports, reduced motion, and rapid closing and reopening work with actual sources.

Verify:

- A11/A23/A24/A36; inspect actual captures and animation frames, and run the affected browser, type and build checks.

### N002 Replace capped programme selection with explicit slots

Status: planned. Size: medium. Dependencies: N001.

Deliverables:

- Provide two required slots and an optional third slot, using one native choice picker with local search across all 59 formations.
- Require an explicit initial Compare action. Support immediate replacement of a single slot, safe cancellation and removal, and restoration of a stable workspace anchor.

Accept when:

- There is no fourth slot, duplicate formation or unexplained disabled list. Minor formations and formations with missing programmes remain selectable.
- Selection states with zero, one, two or three programmes, replacement and cancellation are accessible without a detour to a full-page editing view.

Verify:

- A03/A04/A08/A11/A24; critique sketches of the initial path requiring five actions.

### N003 Consolidate public browsing into one comparison search

Status: planned. Size: medium. Dependencies: N002.

Deliverables:

- Provide an always-visible query that searches proposal text, help and category names, with visible category labels, accurate counts, a no-results state and an action that appends six more proposals.
- Retire the topic selector, Mostrar filter, positions browser, formation browser, standalone search branches and personal-answer overlay in public comparison.

Accept when:

- All 80 proposals remain reachable in a fixed order, without hidden topic or affinity filtering. Preserve the caret and keep the query and related state in memory only.
- Removed flows leave no orphaned controls in the directory, header, help or fallback views.

Verify:

- A02/A09/A12/A13/A29/A30/A32; verify that the source bank remains unchanged.

### N004 Align comparison citations and simplify source reading

Status: planned. Size: large. Dependencies: N001, N003.

Deliverables:

- Use shared comparison rows, optional inline quotations that preserve the exact source text, and natural reflow on narrow screens.
- Provide a source panel that leads with the quotation, direct external links labelled with the page and line, and truthful alternative-source and missing-source states. Remove the requested disclosures.

Accept when:

- Preserve the conditions in real programme summaries. Public reading never shows personal answers, and closing a source restores the same anchor.
- The longest sources and cases with multiple citations remain complete and readable. The quotation opener stays stable during animation.

Verify:

- A05/A06/A07/A10/A11/A13/A22/A24/A27; inspect screenshots and motion using real quotations.

### N005 Create the result presentation adapter and topic-count chart

Status: planned. Size: medium. Dependencies: N001.

Deliverables:

- Derive group counts for numeric answers using the existing relationship and profilePosition functions, without changing scoring.
- Provide one chart grouped by topic, with a count axis, legend and textual equivalent. Distinguish exact and close matches, and distinguish topics where the user has not given a numeric answer.

Accept when:

- Counts reconcile across tabs, topics and numericCount. Existing weights, ordering and exported values remain unchanged.
- Do not label the residual similarity fraction as disagreement or count a topic the user has not answered as missing programme information.

Verify:

- A14/A17/A31/A33/A34; use meaningful fixtures for the pure presentation adapter and run the unchanged engine suite.

### N006 Present all 59 results in a compact grid with a three-tab detail panel

Status: planned. Size: large. Dependencies: N004, N005.

Deliverables:

- Provide a responsive grid containing all 59 formations, optional name search, one Detalle action per formation, and the shared panel with its chart and three tabs.
- Open sources within the same panel. An internal Back action restores the exact tab and scroll position. Retire comparison from results, the programme browser and result pagination.

Accept when:

- Render all formations initially with the same order, overlap percentages and coverage. Do not declare a winner or represent missing information as opposition.
- Each entry has only one detail action. There is no transfer from results to comparison, personal-answer overlay or single-answer review action.

Verify:

- A14/A15/A16/A17/A24/A29/A30/A31/A34/A36.

### N007 Simplify result actions and preserve quiz recovery

Status: planned. Size: medium. Dependencies: N006.

Deliverables:

- Provide Download and one context-sensitive Continue or Restart action. Retain local export formats and safe confirmation.
- Omit Back when it is unavailable while preserving the navigation geometry. Keep the accepted quiz motion, checkpoint review, priorities and recovery behaviour.

Accept when:

- Continuing, editing or resetting invalidates personal caches before showing questions. A new deliberate finish is required before revealing results again.
- Results have no Revisar, Borrar or Ver todas actions. Recovery within the quiz remains reachable.

Verify:

- A01/A17/A18/A25/A30/A35; retain the existing quiz keyboard, motion, release and export tests.

### N008 Replace Cómo funciona with a concise visual explanation

Status: planned. Size: medium. Dependencies: N001, N005.

Deliverables:

- Provide three steps, a five-mark example that changes from 40/40 to 40/80 using one switch, and a panel with the exact calculation.
- Keep equivalent Spanish content in the server-rendered and no-JavaScript fallbacks and the method alias. Remove the previous four-mode example and disclosures.

Accept when:

- The first layer lets an everyday reader explain the difference between missing information and opposition, and when results become visible.
- Introduce no new political example or scoring contract. Keep every exact condition available.

Verify:

- A19/A20/A23/A24/A27/A33; critique the actual desktop and mobile copy.

### N009 Reconcile shared notices, the source directory and loading states

Status: planned. Size: medium. Dependencies: N003, N004, N007, N008.

Deliverables:

- Provide read-only source factsheets for all 59 formations and concise help, privacy and accessibility content, without language describing retired flows.
- Update skeletons, aliases, no-JavaScript views, errors, retry and withdrawal states, and contextual returns. Retired controls must never flash during loading.

Accept when:

- Public copy describes the actual flows accurately. Notices about memory and collection remain truthful.
- Direct routes remain useful without a session or JavaScript. A source failure does not clear the quiz.

Verify:

- A02/A21/A22/A23/A25/A26/A27/A37.

### N010 Complete the dead-code and consumer retirement audit

Status: planned. Size: medium. Dependencies: N009.

Deliverables:

- Delete unreachable modes and obsolete snapshot, reader, filter and result state, along with their unused CSS, translation keys, listeners and test helpers.
- Replace obsolete behaviour assertions with the new contracts while preserving independent invariants. Update the copy ledger.

Accept when:

- Every retired symbol and label has no active consumer. Document the reachable callers of retained shared helpers.
- Preserve sources, history and fixtures. Do not add dependencies or weaken mandatory checks.

Verify:

- A12/A27/A28/A29/A35/A38; search references and run lint, type checks and affected tests.

### N011 Complete the real-application visual and accessibility review

Status: planned. Size: large. Dependencies: N010.

Deliverables:

- Record fresh, versioned F01–F08 and A01–A38 walkthroughs, actual screenshot and animation-frame reviews across the required matrix, a privacy trace, and hash and parity results.
- Correct the UX and behaviour issues found, then repeat the affected loops. Do not automatically claim owner acceptance.

Accept when:

- All revised cases are accepted with evidence, with no open P0/P1 defects or known failures in a core flow.
- Answer all five comprehension questions using visible screen content. Test long and missing data, motion and reduced motion, and contextual return.

Verify:

- All A cases; run the required browser, PHP, engine, tooling, asset and security checks.

### N012 Synchronize final plans and prepare verified local commits

Status: planned. Size: small. Dependencies: N011.

Deliverables:

- Update active statuses, the local review packet, the managed plan, command evidence and limitations. Leave the application working locally.
- Stage the exact intended tree, install or preserve the hook, and run the mandatory check-staged gate before creating local commits on main.

Accept when:

- Keep the canonical, human-readable and managed plans synchronized, and preserve the bank hash. Do not mark unfinished tasks complete; report actual remaining limitations.
- Do not push, deploy, create branches or worktrees, change dependencies or collect metrics.

Verify:

- Run npm run docs:build and npm run check:plans. Run python3 scripts/check-staged.py before every commit.

## Historical task evidence

These completed records describe the earlier implementation. Their deliverables are not active requirements and their checks do not accept the new revision.

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

- Current information architecture, all screen contracts, F01-F08 flows, state matrix, plain-copy decisions, A01-A38 walkthroughs
- B01-B10 reference decisions, F08 transfer, F03 search, navigation budgets and A29-A38.

Accept when:

- Every main destination has useful content, return, failure and privacy rules; quiz contracts preserved

Verify:

- Plan graph/reachability checks; full canonical/human/managed-view synchronization

Actual evidence: outputs/ui-ux-cleanup-loop-plan.json, outputs/ui-ux-cleanup-reference-research.json.

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

Status: completed. Size: medium. Dependencies: U002.

Deliverables:

- Named route map; header/footer/section state; current method and useful source directory destination
- Proposal-search and factsheet route meaning; result/comparison return map.

Accept when:

- D07/D12/D14/D15 resolved; F01/F05 accessible; no session or personalized URL leakage

Verify:

- A02/A19/A21/A26; existing route/browser/session tests
- B01/B02/B09 routes/state without private history or URLs.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, outputs/ui-ux-cleanup-server-verification.json, work/execution-journal.jsonl.

### U005 Rewrite active public copy with a per-screen meaning ledger

Status: completed. Size: large. Dependencies: U002.

Deliverables:

- All active Spanish copy inventory; concise task/meaning/proof layers; consistent names and exports
- Directly authored plain UI summaries for displayed programme rationales, with unchanged numeric values, visible conditions and access to the full existing interpretation/citations.
- Contextual term/result help and precise differences/gaps filter language.

Accept when:

- Meaning preserved; no unreachable stale explanation accidentally exposed; originals exact

Verify:

- A27 plus reading actual screens aloud and recorded five-question reviews
- Check every display summary against its existing authored rationale and source context; explicit bank-hash/ID linkage and no dropped qualification.
- B03/B06/B07 meanings, qualifiers and equal-code caveat in actual screens.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, outputs/ui-ux-cleanup-copy-ledger.json, work/execution-journal.jsonl.

### U006 Apply shared typography, spacing and responsive component rules

Status: completed. Size: medium. Dependencies: U002.

Deliverables:

- CSS tokens; responsive layout budgets; consistent action hierarchy/targets/disclosures/skeleton geometry
- Responsive result selection, proposal search and own-answer line.

Accept when:

- MacBook, mobile, long names and zoom readable; no prose focus or border crowding

Verify:

- A23/A24 visual and keyboard checks; existing assets/lint/type checks
- B10 real long names and zoom; no crowded sticky chrome or narrow prose columns.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, work/execution-journal.jsonl.

### U007 Finish home, resume and didactic current-method journeys

Status: completed. Size: medium. Dependencies: U004, U005, U006.

Deliverables:

- Task-led first screen; resume; unnamed interactive method example and exact optional calculation
- Unnamed equal-total/different-agreement example.

Accept when:

- Main choices above fold; F01; example explains missing information without invented party evidence

Verify:

- A01/A02/A19/A20; exact reference arithmetic if demonstration logic changes
- A33 simplified exact 40/80 arithmetic; no real-party/weight implication or quiz mutation.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, outputs/ui-ux-cleanup-server-verification.json, work/execution-journal.jsonl.

### U008 Finish programme selection and reversible replacement

Status: completed. Size: medium. Dependencies: U004, U005, U006, U003.

Deliverables:

- Alphabetical local search, 2/3 slots, disabled reasons, missing programme labels, edit draft and cancel
- Reuse bounded selection when entered from a result or formation factsheet.

Accept when:

- All 59 formations; no preselection; search preserves selected IDs; return restores workspace

Verify:

- A03/A04/A08; browser state-transition regressions

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, work/execution-journal.jsonl.

### U009 Finish bounded parallel comparison on wide and narrow screens

Status: completed. Size: large. Dependencies: U008.

Deliverables:

- One topic or explicit all-topic search, exact counts and six/page; single semantic proposal article with equal programme columns and narrow reflow; honest filters and optional inline original quotations.
- B02-B04 shared result transfer, different-values/gaps views and own-answer line.

Accept when:

- D01-D05 resolved; same proposal compared; no inferred unknown agreement; no text truncation

Verify:

- A05-A10/A13/A24; real-bank screenshots and source semantics
- A29-A31; sketch/exercise additions before app acceptance; unchanged score/positions.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, outputs/ui-ux-cleanup-copy-ledger.json, work/execution-journal.jsonl.

### U010 Finish topic-first exploration and transfer to comparison

Status: completed. Size: medium. Dependencies: U008, U009.

Deliverables:

- Topic → proposal → grouped/searched positions → same-proposal comparison
- All-80 proposal search with count/page/no-hit/return and transfer.

Accept when:

- All formations/groups reachable; selection transfer retains active proposal and source return

Verify:

- A12/A13; F03 actual connected walkthrough
- A32 memory-only query; all unscored formations still reachable.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, work/execution-journal.jsonl.

### U011 Finish contextual source reading and robust return

Status: completed. Size: medium. Dependencies: U009, U010.

Deliverables:

- Full-width quote-first source reader, exact quote/context/links/provenance and semantic return; inline quote expansion retained on cancelled selection replacement.
- Comparison source return preserving result and workspace origins.

Accept when:

- One reader; missing/official-unavailable honest; restore semantic origin through resize

Verify:

- A07/A11/A16/A22; keyboard/resize/long-quote regressions
- A29/A30/A35; resize/deferred callbacks cannot revive stale personal views.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, outputs/ui-ux-cleanup-copy-ledger.json, work/execution-journal.jsonl.

### U012 Make results understandable, navigable and directly verifiable

Status: completed. Size: large. Dependencies: U004, U005, U006, U011.

Deliverables:

- Plain overlap/coverage presentation; complete searchable 59 results; matches/differences/missing examples; explicit local export
- Native result comparison choices, close-result help and one-answer review.

Accept when:

- Identical arithmetic/order/weights; zero missing programme not opposition; no old/stale reveal

Verify:

- A14-A18/A25; existing engine + affected browser/export tests
- A29/A30/A34/A35; current explicit finish, question set, weights/order preserved.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, outputs/ui-ux-cleanup-copy-ledger.json, work/execution-journal.jsonl.

### U013 Finish task-based help, source directory and truthful notices

Status: completed. Size: medium. Dependencies: U004, U005, U006, U011.

Deliverables:

- Short practical help/privacy/accessibility; directory; direct alias/unavailable/error recovery
- Compact 2023 factsheets and neutral contextual terms.

Accept when:

- Return to origin works; no new metric collection; exact technical detail stays accessible

Verify:

- A19/A21/A22/A26/A27; server-rendered/direct-link/no-JS checks
- A36/A37; all 59, original scope and useful direct/return actions.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, outputs/ui-ux-cleanup-server-verification.json, work/execution-journal.jsonl.

### U014 Reconcile loading, error, undo and cross-section states

Status: completed. Size: medium. Dependencies: U007, U009, U010, U012, U013.

Deliverables:

- Stable skeletons; retry/pending/withdrawn states; safe delete/download; consistent keyboard/reduced-motion feedback
- Integrate search/comparison/overlay/revision state invalidation.

Accept when:

- All state-matrix rules and useful failure exits pass; no raw keys/exceptions or lost session

Verify:

- A02/A17/A18/A22-A26; delayed bank/release tests
- A30/A32/A35/A36 under pending/error; no hidden private persistence.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, outputs/ui-ux-cleanup-server-verification.json, work/execution-journal.jsonl.

### U015 Perform the full family-access and comprehension critique loop

Status: completed. Size: large. Dependencies: U014.

Deliverables:

- A01-A38 actual application evidence, active-copy ledger, screenshots, defect ledger, privacy trace
- B01-B10 adaptation critique, actual task budgets and A29-A38 application evidence.

Accept when:

- No P0/P1; five questions answerable from every screen; any P2 deferral justified with a useful task path

Verify:

- Relevant browser/PHP/engine checks; all required clean staged-tree checks; no synthetic usability claim
- Observation/documentation/inference distinguished; no reference popularity or old prototype as new acceptance.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, outputs/ui-ux-cleanup-copy-ledger.json, outputs/ui-ux-cleanup-server-verification.json, work/execution-journal.jsonl.

### U016 Prepare a coherent local review and rollback packet

Status: completed. Size: small. Dependencies: U015.

Deliverables:

- Before/after results, active plan statuses, real command evidence, bank hash, preserved history, local preview and limitations
- Reference-review hash/version and honest added-flow acceptance packet.

Accept when:

- All implementation evidence exists; no unchanged task called newly implemented; publication remains unapproved

Verify:

- npm run docs:build/check:plans; exact staged-tree gate before commit; compiled and dev local preview
- Research/canonical/human/managed parity; bank and completed history preserved.

Actual evidence: outputs/ui-ux-cleanup-application-verification.json, work/execution-journal.jsonl.

## Primary design references

These inform the design constraints, not a claim of proven usability.

- [W3C APG modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): Inform contained focus, Close/Escape, background inertness and restoration; current owner chooses overlay surface.
- [W3C APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): Keyboard/selection semantics for the local three-tab result detail.
- [MDN native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog): Use showModal and scoped backdrop; avoid assuming newer convenience APIs or support.
- [web.dev CLS](https://web.dev/articles/cls): Separate unexpected layout-shift measurement from user-triggered geometry and motion critique.
