# Who Owns Your DNA?

Who Owns Your DNA? is a searchable public reference for U.S. genetics and genomics law and policy. The static website connects policy records with primary sources and downloadable data.

The site provides informational summaries. It does not provide legal advice.

## Requirements

- Node.js 22 or later
- npm 10 or later

## Local setup

```bash
npm ci
npm run dev
```

Astro prints the local URL after the development server starts.

## Validation and tests

```bash
npm run validate:data
npm test
npm run lint
npm run check
```

The data validator checks project-authored YAML records and records retrieved from NHGRI. It also enforces the shared NHGRI status vocabulary. Validation fails when required fields are missing, dates are malformed, jurisdiction codes, topic values, or statuses are unknown, record identifiers are duplicated, or a verified record lacks a primary source. Missing effective dates generate warnings because some authoritative sources do not provide one unambiguous date.

## NHGRI source snapshot

The repository includes all 1,175 rows retrieved from the NHGRI Genome Statute and Legislation Database. They appear in the combined Policy Records directory. Each imported record identifies NHGRI as its source and displays the snapshot retrieval timestamp. The source data remains separately structured so its original wording and provenance are preserved. The ordinary build uses the checked-in snapshot and does not depend on the NHGRI website.

To intentionally refresh the snapshot:

```bash
npm run import:nhgri
npm run validate:data
npm run export:data
```

Review the changed manifest, record count, source-page date, duplicate metrics, and checksums before accepting a refresh. See `docs/nhgri-source-import.md` for provenance and known source conditions.

## Citation

Please cite this resource when using its data or project-authored summaries in research, reporting, analysis, or other published work. Identify the dataset version or access date whenever possible. See the [citation guidance](https://whoownsyourdna.org/cite/) for suggested formats.

## Production build

```bash
npm run build
```

The build validates the YAML records, regenerates CSV, JSON, and changelog files, type-checks the Astro project, and writes the static site to `dist/`.

## Repository structure

```text
data/                 Canonical records, vocabularies, and imported source snapshot
schemas/              Separate JSON Schemas for canonical and source records
scripts/              Validation, export, and changelog generators
src/components/       Reusable interface components
src/layouts/          Shared page structure
src/pages/            Static routes and generated record pages
src/styles/           Global reference-site styling
tests/                Focused data-validation tests
public/data/          Reproducible CSV, JSON, and changelog outputs
docs/                 Contributor and data-model documentation
```

## Deployment

The GitHub Pages workflow builds and deploys the static site to [whoownsyourdna.org](https://whoownsyourdna.org/) after a push to `main`. In the GitHub repository settings, select GitHub Actions as the Pages source. Pull requests run the separate validation workflow without deploying.

The repository is configured for `sdhutchins/who-owns-your-dna`. No license or DOI is asserted in this prototype. Add those values only after the project has selected them.
