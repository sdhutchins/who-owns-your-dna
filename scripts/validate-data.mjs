import { createHash } from "node:crypto";
import process from "node:process";
import { pathToFileURL } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

import { loadJson, loadRecords } from "./lib/data.mjs";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value) {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }
  const parsedDate = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsedDate.valueOf())
    && parsedDate.toISOString().startsWith(value);
}

export async function validateRecords() {
  const [
    schema,
    nhgriSchema,
    jurisdictions,
    topics,
    statuses,
    loadedRecords,
    nhgriRecords,
    nhgriManifest,
  ] = await Promise.all([
    loadJson("schemas/legal-record.schema.json"),
    loadJson("schemas/nhgri-source-record.schema.json"),
    loadJson("data/jurisdictions.json"),
    loadJson("data/topics.json"),
    loadJson("data/statuses.json"),
    loadRecords(),
    loadJson("data/imported/nhgri/records.json"),
    loadJson("data/imported/nhgri/manifest.json"),
  ]);

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addFormat("date", isCalendarDate);
  ajv.addFormat("uri", (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  });
  const validateSchema = ajv.compile(schema);
  const validateNhgriSchema = ajv.compile(nhgriSchema);
  const validJurisdictionCodes = new Set([
    "US",
    ...jurisdictions.map((jurisdiction) => jurisdiction.code),
  ]);
  const validTopics = new Set(topics.map((topic) => topic.slug));
  const validStatuses = new Set(statuses.map((status) => status.slug));
  const recordIds = new Set();
  const errors = [];
  const warnings = [];

  for (const { file, record } of loadedRecords) {
    if (!validateSchema(record)) {
      for (const error of validateSchema.errors ?? []) {
        errors.push(`${file}${error.instancePath}: ${error.message}`);
      }
    }

    if (recordIds.has(record.id)) {
      errors.push(`${file}: duplicate record id "${record.id}"`);
    }
    recordIds.add(record.id);

    if (!validJurisdictionCodes.has(record.jurisdiction_code)) {
      errors.push(
        `${file}: unknown jurisdiction code "${record.jurisdiction_code}"`,
      );
    }

    for (const topic of record.topics ?? []) {
      if (!validTopics.has(topic)) {
        errors.push(`${file}: unknown topic "${topic}"`);
      }
    }

    if (!validStatuses.has(record.status)) {
      errors.push(`${file}: unknown base status "${record.status}"`);
    }

    if (
      record.verification_status === "verified-primary"
      && (record.primary_sources?.length ?? 0) === 0
    ) {
      errors.push(`${file}: verified records require a primary source`);
    }

    if (
      ["enacted", "statute"].includes(record.status)
      && !record.effective_date
    ) {
      warnings.push(`${file}: effective date is not recorded`);
    }
  }

  for (const { file, record } of loadedRecords) {
    const relatedRecordIds = new Set();
    for (const relationship of record.related_records ?? []) {
      if (relationship.record_id === record.id) {
        errors.push(`${file}: related record cannot reference itself`);
      }
      if (!recordIds.has(relationship.record_id)) {
        errors.push(
          `${file}: unknown related record "${relationship.record_id}"`,
        );
      }
      if (relatedRecordIds.has(relationship.record_id)) {
        errors.push(
          `${file}: duplicate related record "${relationship.record_id}"`,
        );
      }
      relatedRecordIds.add(relationship.record_id);
    }
  }

  const sourceRecordIds = new Set();
  for (const [index, record] of nhgriRecords.entries()) {
    const recordLocation = `data/imported/nhgri/records.json[${index}]`;
    if (!validateNhgriSchema(record)) {
      for (const error of validateNhgriSchema.errors ?? []) {
        errors.push(`${recordLocation}${error.instancePath}: ${error.message}`);
      }
    }

    if (sourceRecordIds.has(record.id)) {
      errors.push(`${recordLocation}: duplicate source-record id "${record.id}"`);
    }
    sourceRecordIds.add(record.id);

    if (record.source_row_number !== index + 1) {
      errors.push(`${recordLocation}: source_row_number does not match array order`);
    }

    if (!jurisdictions.some((jurisdiction) => jurisdiction.name === record.jurisdiction)) {
      errors.push(`${recordLocation}: unknown jurisdiction "${record.jurisdiction}"`);
    }

    for (const topic of record.mapped_topics ?? []) {
      if (!validTopics.has(topic)) {
        errors.push(`${recordLocation}: unknown mapped topic "${topic}"`);
      }
    }


    if (!validStatuses.has(record.base_status)) {
      errors.push(`${recordLocation}: unknown base status "${record.base_status}"`);
    }
  }

  if (nhgriManifest.record_count !== nhgriRecords.length) {
    errors.push("data/imported/nhgri/manifest.json: record_count does not match records.json");
  }

  const serializedNhgriRecords = `${JSON.stringify(nhgriRecords, null, 2)}\n`;
  const recordsChecksum = createHash("sha256")
    .update(serializedNhgriRecords)
    .digest("hex");
  if (nhgriManifest.records_sha256 !== recordsChecksum) {
    errors.push("data/imported/nhgri/manifest.json: records_sha256 does not match records.json");
  }

  warnings.push(
    `NHGRI source layer contains ${nhgriManifest.http_primary_link_count} source links using HTTP`,
  );
  warnings.push(
    `NHGRI source layer contains ${nhgriManifest.exact_duplicates.record_count} records in exact duplicate groups`,
  );

  return {
    count: loadedRecords.length,
    nhgriCount: nhgriRecords.length,
    errors,
    warnings,
  };
}

async function main() {
  const result = await validateRecords();
  for (const warning of result.warnings) {
    console.warn(`WARNING: ${warning}`);
  }
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(`ERROR: ${error}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(
    `Validated ${result.count} canonical legal records and ${result.nhgriCount} NHGRI source records.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
