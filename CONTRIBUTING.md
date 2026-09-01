# Contributing policy records

Contributions should improve the source record without overstating what the source establishes.

## Add or update a record

1. Locate the primary government source.
2. Create or update one YAML record under the appropriate jurisdiction directory.
3. Identify the record type and legal status precisely.
4. Write the factual `summary` and `legal_effects` fields from the primary text.
5. Write `plain_language` separately and identify any advocacy interpretation.
6. Assign only terms listed in `data/topics.json`.
7. Record the source access date and record review date.
8. Add a dated history entry describing the change.
9. Run validation, tests, and the production build.
10. Submit a pull request for human source and summary review.

## Required local checks

```bash
npm run validate:data
npm test
npm run lint
npm run build
```

Do not automatically publish a candidate change or rewrite a legal summary from automated monitoring output. Automation may identify sources for review. A person must verify the source, status, scope, and summary before publication.

## Writing rules

- Describe what the cited source says.
- Distinguish statutes, legislation, regulations, guidance, policies, agency actions, and court decisions.
- Use “No specific law identified” for an incomplete dataset finding.
- Do not use “No law exists” unless a defensible research method supports that conclusion.
- Separate factual legal description, plain-language interpretation, and advocacy context.
- Document scope limitations, exceptions, and uncertainty.
- Do not cite a secondary summary as a substitute for available primary legal text.
