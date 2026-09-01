# NHGRI source snapshot

The repository preserves a complete snapshot retrieved from the National Human Genome Research Institute Genome Statute and Legislation Database. These entries appear in the combined Policy Records directory.

## Source and scope

- Source: [NHGRI Genome Statute and Legislation Database](https://www.genome.gov/about-genomics/policy-issues/Genome-Statute-Legislation-Database)
- Source-page date: February 8, 2024
- Snapshot retrieval date: recorded in `data/imported/nhgri/manifest.json`
- Imported rows: 1,175
- Jurisdictions: all 50 states and the District of Columbia
- NHGRI stated coverage: state statutes and bills introduced during 2002-2024 state legislative sessions
- NHGRI stated exclusions: federal statutes and bills, regulations, and state genetic-counselor licensing laws

NHGRI describes the database as reviewed monthly, but the visible source-page date is February 8, 2024. The interface identifies NHGRI as the source and displays both the source-page date and snapshot retrieval timestamp so users can evaluate freshness.

## Preserved fields

Each imported record retains the NHGRI state, primary-link label, primary URL, topic labels, bill status, and summary. Whitespace introduced by the HTML layout is normalized. The wording within each field is otherwise retained.

The importer adds a deterministic ID, source row number, conservatively inferred year, local topic mappings, source-page URL, and verification status. The original NHGRI topic labels always remain available. A local topic mapping supports discovery only. It does not assert that the source topic and project topic are legally equivalent.

## Provenance and known source conditions

The manifest records SHA-256 checksums for the retrieved HTML and normalized record file. It also records 620 primary links that use HTTP, 27 duplicated URL groups affecting 75 rows, and two exact duplicate groups affecting four rows. Duplicates are preserved because the import is a source snapshot. Deterministic IDs include an occurrence suffix when two source rows have the same complete field set.

Source links are not rewritten or silently repaired. A stale or unavailable source link remains evidence of what the NHGRI database recorded at snapshot time.

NHGRI states that its website information is generally public domain unless otherwise indicated and requests acknowledgment. Public pages use the attribution “Courtesy: National Human Genome Research Institute.” See the [NHGRI copyright policy](https://www.genome.gov/about-nhgri/Policies-Guidance/Copyright).

## Refresh process

Run the explicit network import only when intentionally refreshing the checked-in snapshot:

```bash
npm run import:nhgri
npm run validate:data
npm run export:data
```

The ordinary build does not fetch NHGRI. It validates and exports the checked-in snapshot so that builds remain deterministic and do not depend on an external website.

Before accepting a refreshed snapshot, review the record count, source-page date, declared topics and statuses, duplicate metrics, and checksums in the manifest. The provenance remains attached to each imported record even though the public directory combines all records.
