# Second iteration local review

Version: `quiz-2023-iteration-2-v1.1.0`. R001–R008 are completed with local acceptance evidence. The full clean staged-tree gate passed PHP, frontend, integrity and security checks. Final record updates are checked again before the unsigned local commit, with the mandatory hook retained.

## Open the local application

The prepared development runtime is `.tools/iteration-2-runtime`. Open [the questionnaire](http://127.0.0.1:8767/questionnaire), [Programas 2023](http://127.0.0.1:8767/programmes), or [Cómo funciona](http://127.0.0.1:8767/how-it-works).

If the local server has stopped, run this from the repository root:

```sh
scripts/php .tools/iteration-2-runtime/artisan serve --host=127.0.0.1 --port=8767 --no-reload --no-interaction
```

The runtime uses the real second bank with metrics disabled. The repository's public release pointer and the first iteration runtime are preserved. Do not activate this development bank in production: `releaseEligible` remains false.

## Review the questionnaire

1. Start twenty questions. Each of ten topics appears twice with distinct decision families. Optional importance uses positive weights only.
2. At the checkpoint, choose **Ver mi resultado** or **Responder 10 más**. The anonymous maximum can rise or fall. A skipped whole topic leaves the global percentage pending.
3. Finish deliberately to see all 59 candidacies as 63 territorial programme profiles. Bars share a 0–100 scale; affinity and documented coverage are separate.
4. Open a programme, then **Vivienda**, the rental-price proposal, and **Ver cita literal y contexto**. Read the proposal-specific relationship separately from the overall percentage.
5. Return or close the reader. It restores the invoking control and scroll. On desktop the origin stays usable; narrow or low-height layouts use a full reading view.
6. Review an answer. Previous results disappear until another deliberate finish. Local export includes Spanish labels and all 63 profile scores. Refresh starts a new session.

## Review public programmes

1. Open **Programas 2023** without answering the quiz. Featured proposals state the editorial date and the September 2026 research basis; the evidence stays from 23 July 2023.
2. Explore a featured proposal or the complete topic index. Each proposal accounts for every profile, including unknown and conflicting positions.
3. Choose two or three programmes inline to read their summaries together, grouped by proposal. Mobile stacks the programmes within each proposal.
4. Open one source and return to the comparison. This selection changes reading only. Personal answer overlays require finishing and explicit activation.

## Verification evidence

- 22 unique Chromium desktop/mobile cases passed against the prepared runtime serving the real bank. UX01–UX10 cover clicks, keyboard, reader focus/return, sources, comparison, skip/edit/extension/exhaustion, refresh and privacy. The first run's two priority-locator failures passed after correcting the test locator; this is recorded as a targeted repeat.
- The rent-reader axe audit found zero violations. Long-source state survived 320/360/720px reflow, low height and 200/400% CSS zoom. Native browser toolbar zoom was unavailable and has no separate certification claim.
- No private data entered URLs, `history.state`, cookies, browser storage or requests. One fixed public bank is fetched per session. A real official-link click produced a popup with no referrer and no opener; the test intercepted the publisher request to inspect it.
- 38 engine tests passed, including the independent five-decision 40% affinity / 40% coverage case and arithmetic across all 63 actual territorial profiles and 550 ballot scopes.
- Fresh source compilation matched all original questions, documents, positions and scoped positions. Metadata packaging does not generate questions or political positions.
- Authenticated local restore reproduced nine files exactly, activated the historical engine and second engine, and rejected reactivation after withdrawal. Original source bytes and active release pointers were preserved.
- The full clean staged-tree gate passed 86 browser cases, 38 PHP tests with 345 assertions, 38 engine tests and 52 Python tooling tests, together with dependency audits, analysis, formatting, asset bounds, plan/source/skill integrity, actionlint and history/staged gitleaks. The two historical navigation regressions found in the first gate were corrected without weakening their existing tests.

Machine-readable evidence is in `outputs/quiz-2023-second-iteration-review-packet.json`, `outputs/quiz-2023-second-iteration-verification.json`, `outputs/quiz-2023-second-iteration-browser-acceptance.json`, `outputs/quiz-2023-second-iteration-content-decisions.json`, `outputs/quiz-2023-second-iteration-source-links.json` and `outputs/quiz-2023-second-iteration-recovery.json`. Screenshots are in `outputs/quiz-2023-second-iteration-previews/`.

## Remaining boundaries

21 candidacies have no located programme. They remain visible with zero documented contribution, without invented neutral positions. Four candidacies retain distinct territorial profiles rather than choosing a favourable variant.

Of 45 citation documents, 31 have verified official links and 14 have explicit official-unavailable exceptions with preserved provenance. Bounded live signatures and retained source hashes do not certify universal availability or every current remote byte. The migration question gap remains explicit; no unrelated substitute was added.

Host, domain, production privacy/log flow and **PUBLIC-LAUNCH** remain pending. There has been no publication, deployment, purchase, push or metrics activation.
