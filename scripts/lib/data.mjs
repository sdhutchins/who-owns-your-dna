import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

import { parse } from "yaml";

const RECORD_EXTENSIONS = new Set([".yaml", ".yml"]);

async function findRecordFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return findRecordFiles(path);
      }
      return RECORD_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
    }),
  );

  return paths.flat().sort();
}

export async function loadRecords(recordsDirectory = "data") {
  const files = await findRecordFiles(recordsDirectory);
  const records = await Promise.all(
    files.map(async (file) => ({
      file,
      record: parse(await readFile(file, "utf8")),
    })),
  );

  return records;
}

export async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
