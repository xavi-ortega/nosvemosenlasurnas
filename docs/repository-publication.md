# Repository publication checklist

The local scaffold is ready to open. Publishing remains a separate explicit action under GATE-04; this document does not create a remote.

Before opening public contributions, provide the actual repository owner/URL, named maintainers and review capacity, a verified security/conduct contact, final licence choice and funding/operator disclosures. Update project-metadata.json, composer/package repository URLs and CITATION.cff only with verified values. Add CODEOWNERS with actual GitHub handles and require the intended reviewers. Do not commit a fabricated address, badge, owner or funding link.

The current machine's Git identity may be a work address. Choose the identity you want in public commit history (a verified GitHub noreply address is an option) before the initial commit. No commit was created automatically.

Create the chosen GitHub repository only when authorized, add its verified remote, commit and push the scaffold. Then:

1. Confirm all CI jobs run successfully on the actual host.
2. Protect main with required successful checks and pull-request review; restrict bypasses and require actual code owners when configured.
3. Enable private vulnerability reporting and dependency/security alerts available to the repository.
4. Confirm fork pull requests work without repository secrets or elevated permissions.
5. Set a truthful description/topics and metadata. The preferred domain is unverified; do not advertise a working public site.
6. Review tracked source/licence inventories and the generated plans for publication. Historical output reports describe earlier local checks, not current production proof.

No deploy workflow, hosting credentials, paid tool licence, custom domain or anonymous metric service has been configured. Code publication approval does not activate scoring or metrics.
