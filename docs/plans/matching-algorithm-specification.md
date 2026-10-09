# Lean matching specification

## 5. Small transparent matching engine

The runtime is deterministic arithmetic, with no ML.

- Use numeric agreement scale -2,-1,0,1,2. Unsure/skip have no numeric value. For answer a and cited position p, similarity = 1 - abs(a-p)/4. Party overlap = 100 * sum(w * similarity)/sum(w) for the disclosed scored set. Scores are independent and do not sum to 100.
- Weights are release-defined topic and question-family budgets, with optional explicit user topic priorities (0,1,2) kept locally. Divide each family budget across its declared question items; do not let a long topic or repeated variants gain accidental weight. Freeze the bank and weight definition for a session.
- For a ranking or highest-overlap checkpoint, use the same answered propositions and weights for every candidacy in the disclosed comparison cohort. The default cohort includes all applicable supplied candidacies. A deliberately selected narrower cohort is prominently labelled; other candidacies remain visible.
- Initial conservative display threshold: eight numeric answers, four topics, and at least 60% of answered positive weight shared across the cohort. Missing sources stay visible. If the threshold fails, show cited comparisons and separately labelled partial overlaps/coverage without ordering or declaring a winner. These are engineering heuristics, not statistically calibrated confidence.
- Display overlap, response/evidence coverage and question count separately. A 60% overlap says that the observed weighted answers align by that index; it does not mean 60% probability that the person prefers that party. More answers can lower the index.
- Keep the existing v1 reference as a historical arithmetic oracle. Implement the final browser engine against the simpler explicit weight contract and pin its version. Test exact examples, unknown/zero weights, ties, common-denominator fairness, permutation invariance and locale invariance. No elaborate completion bounds or robust-leader certification is required.

## 7. Private quiz boundary

The server distributes public content; it does not receive a visitor profile.

- Serve the same complete public election bank for everyone. Filter constituency/candidacies, calculate scores and choose questions in the browser. Do not fetch party/question-specific data in response to answers or private selection.
- No quiz session API, cookies, localStorage, default IndexedDB, answer persistence, URL/hash encoding, telemetry, replay, advertising scripts, crash payloads or support dumps containing answers, priorities, scope, scores or next-question IDs.
- A local download is deliberate, clearly explains its political contents and stays on the device. Restart clears memory. Shared links may reference only public sources/topics with no personal selections or result.
- Network operators still process connection metadata; privacy copy says so. Configure app, reverse proxy, host error reporting and backups consistently. No claim that local matching makes all HTTP traffic anonymous.
- Metrics are a separate voluntary flow described below. They never reuse or upload the full quiz vector and never include party affinity or voting intention.
