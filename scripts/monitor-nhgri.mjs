import { readFile } from "node:fs/promises";

import {
  fetchNhgriSnapshot,
  hasNhgriSnapshotChanged,
  writeNhgriSnapshot,
} from "./import-nhgri.mjs";

const MANIFEST_PATH = "data/imported/nhgri/manifest.json";

async function main() {
  const currentManifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const candidateSnapshot = await fetchNhgriSnapshot();

  if (!hasNhgriSnapshotChanged(currentManifest, candidateSnapshot.manifest)) {
    const htmlChanged =
      currentManifest.source_html_sha256 !==
      candidateSnapshot.manifest.source_html_sha256;
    const detail = htmlChanged
      ? " The source HTML changed, but its structured policy records did not."
      : "";
    console.log(`No structured NHGRI data changes detected.${detail}`);
    return;
  }

  await writeNhgriSnapshot(candidateSnapshot);
  console.log(
    `Prepared ${candidateSnapshot.manifest.record_count} changed NHGRI rows for human review.`,
  );
}

await main();
