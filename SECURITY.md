# Security policy

The initial scaffold is under development. No public production release is currently supported.

Never include secrets or political questionnaire data in a public issue, pull request, workflow artifact or support report. Use a minimal synthetic reproduction. Do not test third-party services or a public deployment without authorization.

Before repository publication, the owner must enable GitHub private vulnerability reporting and record a verified private security contact in project-metadata.json. Once enabled, report through the repository's Security tab using "Report a vulnerability". Until then, use only a verified private channel supplied by the maintainer; this scaffold does not invent a contact address.

Report the affected version/commit, attack prerequisites, impact and a synthetic reproduction privately. Maintainers should acknowledge and agree a disclosure timeline with the reporter; no response-time promise has been established without named operator capacity.

Dependency audits, secret scanning and static analysis are configured. They do not prove production security. Actual questionnaire traffic/storage/log review, ingestion isolation, admin authorization, production runtime and restore/rollback verification remain release work. Laravel Boost must stay development-only.
