# Contributing policy records

Contributions should improve the source record without overstating what the source establishes. Every candidate record and correction receives human review before publication.

## Contribute without editing code

Use a structured GitHub form to:

- [Suggest a policy source](https://github.com/sdhutchins/who-owns-your-dna/issues/new?template=01-policy-source.yml)
- [Correct an existing record](https://github.com/sdhutchins/who-owns-your-dna/issues/new?template=02-record-correction.yml)
- [Report a broken link](https://github.com/sdhutchins/who-owns-your-dna/issues/new?template=03-broken-link.yml)

Include an official government source whenever one is available. Do not include personal, confidential, or protected information.

## Add or update a record through a pull request

1. Read the [data model](docs/data-model.md) and [content style guide](docs/content-style-guide.md).
2. Locate the primary government source.
3. Fork the repository and create a focused branch.
4. Copy the [example record](docs/examples/legal-record.example.yaml) into the appropriate jurisdiction directory.
5. Replace every example value and remove fields that do not apply.
6. Identify the record type and legal status precisely.
7. Write the factual `summary` and `legal_effects` fields from the primary text.
8. Write `plain_language` separately and identify any advocacy interpretation.
9. Assign only terms listed in `data/topics.json`.
10. Record the source access date and record review date.
11. Add a dated history entry describing the change.
12. Run the required checks and submit a pull request.

GitHub Actions runs the same validation on pull requests. A passing check confirms that the record is structurally valid. It does not replace human source, legal-status, scope, or summary review.

## Required local checks

```bash
npm ci
npm run validate:data
npm test
npm run lint
npm run check
npm run build
```

## Writing rules

- Describe what the cited source says.
- Distinguish statutes, legislation, regulations, guidance, policies, agency actions, and court decisions.
- Use “No specific law identified” for an incomplete dataset finding.
- Do not use “No law exists” unless a defensible research method supports that conclusion.
- Separate factual legal description, plain-language interpretation, and advocacy context.
- Document scope limitations, exceptions, and uncertainty.
- Do not cite a secondary summary as a substitute for available primary legal text.
- Do not automatically publish a candidate change or rewrite a legal summary from monitoring output.

## Review expectations

Reviewers compare the proposed language with the primary source and confirm the actor, action, subject, status, dates, and limitations. Substantive corrections receive a record-history entry and version change. Archived source wording remains separate from project-authored language.
