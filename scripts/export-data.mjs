import { mkdir, writeFile } from "node:fs/promises";

import { loadJson, loadRecords } from "./lib/data.mjs";

const EXPORT_DIRECTORY = "public/data";
const CSV_FIELDS = [
  "id",
  "jurisdiction",
  "jurisdiction_code",
  "jurisdiction_type",
  "record_type",
  "title",
  "identifier",
  "status",
  "introduced_date",
  "signed_date",
  "effective_date",
  "last_action_date",
  "last_reviewed",
  "record_version",
  "verification_status",
  "topics",
  "summary",
];
const NHGRI_CSV_FIELDS = [
  "id",
  "jurisdiction",
  "source_record_label",
  "primary_url",
  "source_topics",
  "source_status",
  "base_status",
  "source_summary",
  "mapped_topics",
  "inferred_year",
  "verification_status",
  "source_page",
  "source_row_number",
];

function escapeCsv(value) {
  const normalizedValue = Array.isArray(value)
    ? value.join("|")
    : String(value ?? "");
  return `"${normalizedValue.replaceAll('"', '""')}"`;
}

const loadedRecords = await loadRecords();
const records = loadedRecords
  .map(({ record }) => record)
  .sort((left, right) => left.id.localeCompare(right.id));

await mkdir(EXPORT_DIRECTORY, { recursive: true });
await writeFile(
  `${EXPORT_DIRECTORY}/records.json`,
  `${JSON.stringify(records, null, 2)}\n`,
);

const csvRows = [
  CSV_FIELDS.map(escapeCsv).join(","),
  ...records.map((record) =>
    CSV_FIELDS.map((field) => escapeCsv(record[field])).join(","),
  ),
];
await writeFile(`${EXPORT_DIRECTORY}/records.csv`, `${csvRows.join("\n")}\n`);

const [nhgriRecords, nhgriManifest] = await Promise.all([
  loadJson("data/imported/nhgri/records.json"),
  loadJson("data/imported/nhgri/manifest.json"),
]);
await writeFile(
  `${EXPORT_DIRECTORY}/nhgri-source-records.json`,
  `${JSON.stringify(nhgriRecords, null, 2)}\n`,
);
await writeFile(
  `${EXPORT_DIRECTORY}/nhgri-source-manifest.json`,
  `${JSON.stringify(nhgriManifest, null, 2)}\n`,
);
const nhgriCsvRows = [
  NHGRI_CSV_FIELDS.map(escapeCsv).join(","),
  ...nhgriRecords.map((record) =>
    NHGRI_CSV_FIELDS.map((field) => escapeCsv(record[field])).join(","),
  ),
];
await writeFile(
  `${EXPORT_DIRECTORY}/nhgri-source-records.csv`,
  `${nhgriCsvRows.join("\n")}\n`,
);

console.log(
  `Exported ${records.length} canonical records and ${nhgriRecords.length} NHGRI source records.`,
);
