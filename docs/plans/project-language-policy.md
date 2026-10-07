<!-- Generated from outputs/project-language-policy.html; run npm run docs:build. -->

# Required project language policy

Spanish default · Reviewed regional interfaces · English code · 7 October 2026

Project-wide requirement: Spanish is the complete default interface; Catalan, Basque and Galician interfaces remain in scope with fluent review before activation. All original code and developer documentation are English. Translations and source evidence are content data.

Persistent instructions are saved in root AGENTS.md and .cursor/rules/project-language.mdc. Production CI/lint/browser checks and reviewed translations are required implementation work. These English planning documents are developer artifacts, not the product website.

[Development plan · section 17](development-plan.md#language-policy) · [Matching presentation boundary](matching-algorithm-specification.md#implementation)

<a id="language-policy"></a>



## Policy, integration and release requirements

Project-wide requirement: Spanish is the complete default interface; Catalan, Basque and Galician interfaces remain in scope with fluent review before activation. All original code and developer documentation are English. Translations and source evidence are content data.

-   Spanish is the default for every public and editorial/admin screen: navigation, forms, questions, answer labels, result explanations, citations, errors, empty states, consent/privacy pages, help, accessibility labels, metadata, charts, exports and user-facing notifications. Enabled regional interfaces cover the same product surfaces. Developer planning documents and repository contributor docs remain English.
-   English applies to original variables, functions, classes, types, namespaces, files/directories, route names and slugs, commands, database tables/columns, enum/status values, JSON/API keys, translation keys, comments, docblocks, test descriptions, internal logs and developer documentation. Preserve established external identifiers and official proper names rather than inventing translations.
-   Use English semantic keys with translated values, for example results.insufficient\_evidence → No hay suficiente evidencia para calcular un resultado. Spanish baseline copy lives in lang/es/\*.php; approved regional catalogs use ca, gl and eu. Browser code consumes the same reviewed dictionary through a public build or safe serialization. Longer questions, summaries and editorial explanations live in reviewed localized content, outside scoring logic.
-   Configure APP\_LOCALE=es and APP\_FALLBACK\_LOCALE=es. Users may explicitly select an enabled reviewed locale from es, ca, gl and eu. Root HTML language and display formatting follow the selected locale. Keep the Eloquent/code pluralizer in English. English UI is outside the agreed scope, and browser language preferences must not select an unsupported English interface.
-   The Spanish fallback is a runtime safeguard, not permission to publish unfinished regional interfaces. An enabled locale must have complete approved UI/question translations. Detect missing keys before release; unexpected missing strings receive approved Spanish fallback copy with a language indication, never a raw key or English message. Notify operators through internal English diagnostics without recording political answers.
-   Translate framework and package validation, pagination, authentication and error screens as well as custom UI. Never present an exception message, stack trace, raw status, translation key or machine reason code directly to users. HTTP/API payloads use English stable codes; localized presentation adapters supply visible meaning.
-   The reference matching module is developer-facing and includes English diagnostic reason strings. When integrating it into the website, expose stable English reason codes and map them to reviewed localized catalogs; do not render current strings directly. Changing language must preserve answers by stable question ID, all weights, scoring, evidence coverage and comparison gates.
-   Keep programme quotations exact. Translations are separately reviewed, explicitly labelled fields, with the original accessible and its source language marked. Official party/person names and original excerpts retain their original language. Do not silently rewrite source material or treat translated wording as a verbatim quotation. User-facing summaries and explanations follow the chosen approved interface language.
-   AI may draft translations of public UI copy and programme material. A fluent reviewer must approve each target language, with particular care for Basque and politically or legally nuanced wording. Check against the original and preserve conditions, exceptions, negation, quantified commitments and modal strength. Do not send private questionnaire answers/results to translators or AI services.
-   Maintain a shared glossary for policy terms, answer scales, unknown evidence and methodological explanations. A question keeps one stable ID and one published scoring rubric across languages. A translation that changes the proposition must be corrected; semantic question changes require editorial review and a versioned release, never a hidden locale-specific scoring change.
-   CI language gate 1: use template/AST-aware checks for raw visible text and user-facing attributes outside approved content/catalogs. Maintain a reviewed allowlist for proper names and source excerpts. English developer diagnostics and symbolic enum values are permitted; do not use a blanket regex banning string literals.
-   CI language gate 2: collect static translation-key references and require nonempty reviewed entries for every enabled locale. Dynamic keys require explicit enumerated mappings. Validate placeholders/plural variants and detect duplicate or unresolved keys; exercise error paths. Regional locale activation also requires reviewed question/content coverage. Do not require an English UI catalog.
-   CI language gate 3: browser checks verify HTML language and representative reviewed copy for questionnaire, results, comparisons, source details, privacy, admin, errors, empty states and exports in every enabled locale. Include keyboard/screen-reader text and formatting. The same synthetic answer IDs must yield identical scores across languages. Keep political inputs out of requests, URLs, logs and analytics.
-   English code review is mandatory. Naming/casing lint and known disallowed identifiers assist but cannot prove a natural language. Review user copy separately for fluency, neutral wording, comprehension and consistency. Spanish is the launch baseline; activate regional interfaces only as fluent review is complete, with no automatic approval based on machine translation.
-   Persistent instructions live in root AGENTS.md and an alwaysApply rule at .cursor/rules/project-language.mdc. Transfer them into the future application repository. They are active in this workspace; production lint/CI/browser language checks and actual translations are specified backlog work because the Laravel application has not been built.

[Laravel · localization, translation catalogs and locale/fallback configuration](https://laravel.com/framework/docs/13.x/localization)

<a id="examples"></a>



## Concrete implementation examples

English keys and identifiers surround translated content values. UI renders approved copy in the chosen supported language, never the raw machine code.

// lang/es/results.php
return \[
    'insufficient\_evidence' => 'No hay suficiente evidencia para calcular un resultado.',
    'insufficient\_shared\_evidence' => 'No hay suficiente evidencia común para ordenar las candidaturas.',
    'skip' => 'Saltar',
\];

// Blade view: English key, value in the selected reviewed interface language.
{{ \_\_('results.insufficient\_evidence') }}

// Machine data uses English identifiers and codes.
{ "reasonCode": "insufficient\_shared\_evidence", "sourceLanguage": "es" }

// Optional catalogs: lang/ca/results.php, lang/gl/results.php, lang/eu/results.php.
// All use the same English keys. Activate after fluent review and coverage checks.

Delivery requirement REQ-08 is tracked in the [acceptance matrix](development-plan.md#acceptance-contract) and [canonical structured plan](../../outputs/electoral-app-development-plan.json). Every activated regional locale requires complete review for enabled surfaces. Questionnaire translations and score invariance are mandatory before questionnaire activation in that locale. Spanish and a cited explorer can launch independently when their applicable core gates pass.

<a id="review"></a>



## Required review checklist

-   Spanish baseline is complete; every activated regional interface has complete fluent-reviewed UI/question coverage.
-   Every translation key exists for enabled locales; dynamic keys have an explicit allowed map.
-   No English UI, raw exception, machine code or unresolved key appears on normal or error paths.
-   Original identifiers, schema/API keys, comments, tests and developer documentation are English.
-   Exact source quotations remain available; translations are separately labelled and reviewed.
-   Shared policy glossary, answer-scale meanings, question IDs, evidence and scores remain consistent across locales.
-   Language gates enter application CI before launch; browser checks cover supported-language edge states.
-   Presentation changes preserve deterministic scoring and keep political answers/results local.
