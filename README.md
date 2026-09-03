# Who Owns Your DNA?

[![Validate and Build](https://github.com/sdhutchins/who-owns-your-dna/actions/workflows/validate.yml/badge.svg)](https://github.com/sdhutchins/who-owns-your-dna/actions/workflows/validate.yml)
[![Deploy to GitHub Pages](https://github.com/sdhutchins/who-owns-your-dna/actions/workflows/pages.yml/badge.svg)](https://github.com/sdhutchins/who-owns-your-dna/actions/workflows/pages.yml)

Who Owns Your DNA? is a searchable public reference for U.S. genetics and
genomics law and policy. The [website](https://whoownsyourdna.org/) connects
policy records with primary sources and downloadable data.

The site provides informational summaries. It does not provide legal advice.

## Table of Contents

- [Project Background](#project-background)
- [Data and Provenance](#data-and-provenance)
- [Install & Setup](#install--setup)
- [Usage](#usage)
- [Validation](#validation)
- [Refresh the NHGRI Snapshot](#refresh-the-nhgri-snapshot)
- [Snapshot Monitoring and Releases](#snapshot-monitoring-and-releases)
- [Repository Structure](#repository-structure)
- [Contributing](#contributing)
- [Citation](#citation)
- [Deployment](#deployment)

## Project Background

The project makes U.S. genetics and genomics policy records easier to search by
jurisdiction, topic, status, and year. Its static architecture keeps the public
site reproducible while connecting each summary to its source and review
history.

Factual legal descriptions, plain-language interpretations, and advocacy
context are stored as separate content layers. Coverage gaps are reported as
"No specific law identified" unless the research method supports a broader
conclusion. See the [research and review method](docs/research-method.md) for the
project's source and correction practices.

## Data and Provenance

Project-authored records are maintained as YAML files under `data/federal/` and
`data/states/`. Their structure, provenance fields, interpretation layers, and
status rules are documented in the [policy record data
model](docs/data-model.md).

The repository also includes a checked-in snapshot of 1,175 rows retrieved
from the NHGRI Genome Statute and Legislation Database. Imported records retain
NHGRI's original wording, source attribution, and snapshot retrieval timestamp.
The ordinary build uses this local snapshot and does not depend on the NHGRI
website.

Generated data products are available in `public/data/` as CSV and JSON files.
The production build regenerates these exports and the project changelog from
the checked-in source records.

## Install & Setup

### Requirements

- Node.js 22 or later
- npm 10 or later

Install the locked dependencies:

```bash
npm ci
```

## Usage

Start the Astro development server:

```bash
npm run dev
```

Astro prints the local URL after the server starts.

Build the production site:

```bash
npm run build
```

The build validates the records, regenerates the CSV, JSON, and changelog
files, type-checks the Astro project, and writes the static site to `dist/`.

## Validation

Run the focused project checks:

```bash
npm run validate:data
npm test
npm run lint
npm run check
```

The data validator checks project-authored YAML records and records retrieved
from NHGRI. It enforces the shared NHGRI status vocabulary and fails when:

- Required fields are missing.
- Dates are malformed.
- Jurisdiction codes, topics, or statuses are unknown.
- Record identifiers are duplicated.
- A verified record lacks a primary source.

Missing effective dates generate warnings because some authoritative sources
do not provide one unambiguous date.

## Refresh the NHGRI Snapshot

Refresh the snapshot only when intentionally reviewing a new retrieval:

```bash
npm run import:nhgri
npm run validate:data
npm run export:data
```

Before accepting a refresh, review the changed manifest, record count,
source-page date, duplicate metrics, and checksums. The [NHGRI source snapshot
documentation](docs/nhgri-source-import.md) describes the provenance, refresh
process, and known source conditions.

## Snapshot Monitoring and Releases

The `Monitor NHGRI source snapshot` workflow checks the source every Monday and
can also be run manually. It compares normalized policy records, the visible
source-page date, and the declared topic and status vocabularies. Retrieval-time
or cosmetic HTML changes do not create a data update.

When structured data changes, the workflow validates and builds the candidate
snapshot, then opens or updates a draft pull request. A person must review the
source and differences before merging. The repository setting that allows
GitHub Actions to create pull requests must be enabled for this step.

The manual `Publish reviewed data snapshot` workflow packages the project and
NHGRI CSV and JSON exports, provenance manifest, changelog, and SHA-256 checksum
file as a tagged GitHub Release. It will not publish until the repository has a
license. Snapshot versions use `YYYY-MM-DD` or `YYYY-MM-DD.N`.

## Repository Structure

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
docs/                 Data model, research method, and import documentation
```

## Contributing

Contributions should improve the source record without overstating what the
source establishes. Read the [contribution guidelines](CONTRIBUTING.md) before
adding or updating a policy record.

Contributors who do not edit code can use the repository forms to [suggest a
policy source](https://github.com/sdhutchins/who-owns-your-dna/issues/new?template=01-policy-source.yml),
[correct a record](https://github.com/sdhutchins/who-owns-your-dna/issues/new?template=02-record-correction.yml),
or [report a broken link](https://github.com/sdhutchins/who-owns-your-dna/issues/new?template=03-broken-link.yml).

All candidate records and automated monitoring results require human review of
the source, legal status, scope, and summary before publication.

## Citation

Please cite this resource when using its data or project-authored summaries in
research, reporting, analysis, or other published work. Identify the dataset
version or access date whenever possible. The website provides [suggested
citation formats](https://whoownsyourdna.org/cite/).


## Deployment

The GitHub Pages workflow builds and deploys the static site to
[whoownsyourdna.org](https://whoownsyourdna.org/) after a push to `main`.
