# Policy record data model

The canonical record format is YAML validated against `schemas/legal-record.schema.json`. Presentation pages load those records at build time. CSV, JSON, and changelog files are generated outputs and should not be edited by hand.

## Core identity and provenance

- `id`: Stable, lowercase record identifier.
- `jurisdiction`, `jurisdiction_code`, `jurisdiction_type`: Geographic and governmental scope.
- `record_type`: Statute, legislation, regulation, guidance, policy, court decision, or agency action.
- `identifier`: Human-readable legal or policy identifier.
- `record_version`: Version of the project record, not the source law.
- `last_reviewed`: Date a human reviewer last checked the record.
- `verification_status`: Primary-source verified, review in progress, or mock.

## Status and dates

`status` uses the shared NHGRI vocabulary: `approved`, `died`, `enacted`, `passed-house`, `passed-senate`, `statute`, `pending`, or `introduced`. Record type remains separate from status. Optional dates describe introduction, passage, signature, and effect. A missing effective date is not silently inferred from a publication or signature date.

## Interpretation layers

- `summary`: Compact factual overview.
- `legal_effects`: More specific description of what the text requires, permits, restricts, or establishes.
- `plain_language`: Accessible interpretation for a general audience.
- `advocacy_context`: Optional, explicitly identified advocacy interpretation.
- `limitations`: Definitions, exceptions, coverage boundaries, or unresolved questions.

## Sources and history

Verified records require at least one HTTPS primary-source URL, publisher, and access date. The `history` array records substantive source events and project record changes. Future fields may store archived URLs, source checksums, reviewers, committee actions, votes, and amendment histories.
