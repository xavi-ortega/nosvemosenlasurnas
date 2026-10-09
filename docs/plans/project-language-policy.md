# Project language policy

## 9. Language and inclusive interface

Spanish is the complete initial UI; translations are optional content work.

- Original code, file/route/schema/API/translation keys, reason codes, comments, tests and developer docs are English. Product copy, errors, accessibility labels, privacy/help, insights and exports are Spanish. Use existing lang/es catalogs and APP_LOCALE/APP_FALLBACK_LOCALE=es.
- Reuse the existing small dictionary/key/placeholder checks; do not build more translation bureaucracy or spend cycles translating unused admin screens. No admin surface is in scope. Missing keys must have a safe Spanish fallback rather than an exception string.
- Catalan, Basque and Galician are optional later packs, not a core dependency. Use the same IDs/scales/rubrics, complete the enabled public surface and test meaning/score parity. AI can draft translations; no mandated human certification or reviewer service. If a translation is uncertain, keep that pack disabled and disclose its status.
- Original official quotations/proper names remain exact, including their original language. Any translated paraphrase is separately labelled and the original remains reachable. Do not score a different meaning across locales.
- Use the modern UI foundations already prepared where useful: clear hierarchy, readable text, restrained motion, fast feedback, mobile comparison cards, no party-dominant visual bias. Native controls, visible focus, keyboard flow, screen-reader labels, contrast, reduced motion, zoom/reflow and generous targets are acceptance checks.
- Automated browser/axe checks plus a short reproducible keyboard/mobile checklist are enough for this project workflow; no recruited mixed-age research programme or named assistive-device panel is a launch prerequisite. Do not claim universal accessibility certification from automated tests.
