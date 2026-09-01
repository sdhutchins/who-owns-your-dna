import { mkdir, writeFile } from "node:fs/promises";

import { loadRecords } from "./lib/data.mjs";

const loadedRecords = await loadRecords();
const changes = loadedRecords
  .flatMap(({ record }) =>
    record.history.map((change) => ({
      ...change,
      record_id: record.id,
      record_title: record.title,
      jurisdiction: record.jurisdiction,
    })),
  )
  .sort((left, right) => right.date.localeCompare(left.date));

await mkdir("public/data", { recursive: true });
await writeFile(
  "public/data/changes.json",
  `${JSON.stringify(changes, null, 2)}\n`,
);

console.log(`Generated ${changes.length} changelog entries.`);
