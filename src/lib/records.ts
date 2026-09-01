import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

import { parse } from "yaml";

export interface Source {
  title: string;
  url: string;
  publisher: string;
  accessed_date: string;
}

export interface RecordHistory {
  date: string;
  event: string;
  source?: string;
}

export interface RelatedRecord {
  record_id: string;
  relationship: string;
}

export interface LegalRecord {
  id: string;
  jurisdiction: string;
  jurisdiction_code: string;
  jurisdiction_type: "federal" | "state" | "district" | "territory";
  record_type: string;
  title: string;
  subtitle?: string;
  identifier: string;
  bill_number?: string;
  session?: string | number;
  statute_citation?: string;
  regulatory_citation?: string;
  status: string;
  introduced_date?: string | null;
  passed_date?: string | null;
  signed_date?: string | null;
  effective_date?: string | null;
  last_action_date?: string | null;
  last_reviewed: string;
  record_version: string;
  verification_status: "verified-primary" | "review-in-progress" | "mock";
  topics: string[];
  summary: string;
  legal_effects: string;
  plain_language: string;
  advocacy_context?: string;
  limitations?: string;
  primary_sources: Source[];
  secondary_sources?: Source[];
  related_records?: RelatedRecord[];
  history: RecordHistory[];
  source_path: string;
}

export interface Jurisdiction {
  name: string;
  code: string;
  type: "state" | "district" | "territory";
  slug: string;
  prototype: boolean;
}

export interface Topic {
  slug: string;
  name: string;
}

export interface Status {
  slug: "approved" | "died" | "enacted" | "passed-house" | "passed-senate" | "statute" | "pending" | "introduced";
  name: string;
}

export interface NhgriSourceRecord {
  id: string;
  source_dataset: string;
  jurisdiction: string;
  source_record_label: string;
  primary_url: string;
  source_topics: string[];
  source_status: string;
  base_status: Status["slug"];
  source_summary: string;
  mapped_topics: string[];
  inferred_year: number | null;
  verification_status: "reviewed-nhgri";
  source_page: string;
  source_row_number: number;
}

export interface NhgriManifest {
  dataset: string;
  source_page: string;
  source_query: string;
  source_page_last_updated: string;
  snapshot_fetched_at: string;
  stated_coverage: string;
  stated_exclusions: string[];
  attribution: string;
  record_count: number;
  jurisdiction_count: number;
  declared_topics: string[];
  observed_topics: string[];
  declared_statuses: string[];
  observed_statuses: string[];
  http_primary_link_count: number;
  records_sha256: string;
}

async function findYamlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return findYamlFiles(path);
      }
      return [".yaml", ".yml"].includes(extname(entry.name)) ? [path] : [];
    }),
  );
  return paths.flat().sort();
}

export async function getRecords(): Promise<LegalRecord[]> {
  const files = await findYamlFiles("data");
  const records = await Promise.all(
    files.map(async (file) => ({
      ...parse(await readFile(file, "utf8")),
      source_path: file,
    })),
  );
  return records.sort((left, right) =>
    right.last_reviewed.localeCompare(left.last_reviewed)
      || left.title.localeCompare(right.title),
  );
}

export async function getJurisdictions(): Promise<Jurisdiction[]> {
  return JSON.parse(await readFile("data/jurisdictions.json", "utf8"));
}

export async function getTopics(): Promise<Topic[]> {
  return JSON.parse(await readFile("data/topics.json", "utf8"));
}

export async function getStatuses(): Promise<Status[]> {
  return JSON.parse(await readFile("data/statuses.json", "utf8"));
}

export async function getRecord(id: string): Promise<LegalRecord | undefined> {
  return (await getRecords()).find((record) => record.id === id);
}

export async function getNhgriRecords(): Promise<NhgriSourceRecord[]> {
  return JSON.parse(
    await readFile("data/imported/nhgri/records.json", "utf8"),
  );
}

export async function getNhgriManifest(): Promise<NhgriManifest> {
  return JSON.parse(
    await readFile("data/imported/nhgri/manifest.json", "utf8"),
  );
}
