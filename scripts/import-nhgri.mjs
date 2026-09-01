import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

import { load } from "cheerio";

const SOURCE_URL =
  "https://www.genome.gov/about-genomics/policy-issues/Genome-Statute-Legislation-Database?items_per_page=All";
const SOURCE_PAGE_URL =
  "https://www.genome.gov/about-genomics/policy-issues/Genome-Statute-Legislation-Database";
const OUTPUT_DIRECTORY = "data/imported/nhgri";
const SOURCE_STATUS_MAP = new Map([
  ["Approved", "approved"],
  ["Died", "died"],
  ["Enacted", "enacted"],
  ["Passed House", "passed-house"],
  ["Passed Senate", "passed-senate"],
  ["Statute", "statute"],
  ["Pending", "pending"],
  ["Introduced", "introduced"],
]);

// Only high-confidence conceptual matches are mapped. The original NHGRI topic
// is always retained, including when no local topic is equivalent.
const TOPIC_MAP = new Map([
  ["AI and Genomic Data", ["ai-and-genomics"]],
  ["Consumer Personal Data Privacy", ["genetic-privacy"]],
  [
    "Genetic data storage/privacy/sharing (industry)",
    ["genetic-privacy", "data-sharing"],
  ],
  [
    "Genetic data storage/privacy/sharing (medicine)",
    ["genetic-privacy", "data-sharing"],
  ],
  ["Coverage and reimbursement", ["health-insurance"]],
  ["Employment Nondiscrimination", ["employment", "genetic-discrimination"]],
  ["Genetic Data & Law Enforcement", ["law-enforcement"]],
  ["Genetic discrimination", ["genetic-discrimination"]],
  ["Health Insurance Coverage", ["health-insurance"]],
  [
    "Health Insurance Nondiscrimination",
    ["health-insurance", "genetic-discrimination"],
  ],
  ["Neonatal sequencing", ["newborn-screening"]],
  ["Privacy", ["genetic-privacy"]],
  ["Research", ["research"]],
  ["Use of Residual Newborn Screening Specimens", ["newborn-screening"]],
]);

function normalizeText(value) {
  return value.replaceAll("\u00a0", " ").replace(/\s+/g, " ").trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function countDuplicates(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const duplicateCounts = [...counts.values()].filter((count) => count > 1);
  return {
    group_count: duplicateCounts.length,
    record_count: duplicateCounts.reduce((total, count) => total + count, 0),
    max_multiplicity: Math.max(0, ...duplicateCounts),
  };
}

function inferYear(label) {
  const match = label.match(/\b(20(?:0[2-9]|1\d|2[0-4]))\b/);
  return match ? Number(match[1]) : null;
}

function mapTopics(sourceTopics) {
  return [...new Set(sourceTopics.flatMap((topic) => TOPIC_MAP.get(topic) ?? []))]
    .sort();
}

function parseSourcePage(html) {
  const $ = load(html);
  const duplicateOccurrences = new Map();
  const records = [];

  $("table.cols-5 tbody tr").each((index, row) => {
    const cells = $(row).find("td");
    if (cells.length !== 5) {
      throw new Error(`Expected five cells in source row ${index + 1}.`);
    }

    const primaryLink = $(cells[1]).find("a").first();
    const sourceRecordLabel = normalizeText(primaryLink.text());
    const primaryUrl = primaryLink.attr("href");
    const sourceTopics = normalizeText($(cells[2]).text())
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);

    if (!sourceRecordLabel || !primaryUrl) {
      throw new Error(`Source row ${index + 1} is missing its primary link.`);
    }

    const sourceFields = {
      jurisdiction: normalizeText($(cells[0]).text()),
      source_record_label: sourceRecordLabel,
      primary_url: new URL(primaryUrl, SOURCE_PAGE_URL).href,
      source_topics: sourceTopics,
      source_status: normalizeText($(cells[3]).text()),
      source_summary: normalizeText($(cells[4]).text()),
    };
    const baseStatus = SOURCE_STATUS_MAP.get(sourceFields.source_status);
    if (!baseStatus) {
      throw new Error(
        `Source row ${index + 1} has an unknown status: ${sourceFields.source_status}.`,
      );
    }
    const fingerprint = sha256(JSON.stringify(sourceFields));
    const occurrence = (duplicateOccurrences.get(fingerprint) ?? 0) + 1;
    duplicateOccurrences.set(fingerprint, occurrence);

    records.push({
      id: `nhgri-${fingerprint.slice(0, 20)}${occurrence > 1 ? `-${occurrence}` : ""}`,
      source_dataset: "NHGRI Genome Statute and Legislation Database",
      ...sourceFields,
      base_status: baseStatus,
      mapped_topics: mapTopics(sourceTopics),
      inferred_year: inferYear(sourceRecordLabel),
      verification_status: "reviewed-nhgri",
      source_page: SOURCE_PAGE_URL,
      source_row_number: index + 1,
    });
  });

  if (records.length === 0) {
    throw new Error("No NHGRI source rows were found. The page structure may have changed.");
  }

  const lastUpdatedText = normalizeText($(".last-updated").text());
  const lastUpdatedMatch = lastUpdatedText.match(/([A-Z][a-z]+ \d{1,2}, \d{4})/);
  if (!lastUpdatedMatch) {
    throw new Error("Could not determine the NHGRI page's last-updated date.");
  }
  const sourcePageLastUpdated = new Date(`${lastUpdatedMatch[1]} UTC`)
    .toISOString()
    .slice(0, 10);

  const declaredTopics = $("#edit-field-topic-value option")
    .map((_index, option) => normalizeText($(option).text()))
    .get();
  const declaredStatuses = $("#edit-field-bill-status-value option")
    .map((_index, option) => normalizeText($(option).text()))
    .get();

  return { records, sourcePageLastUpdated, declaredTopics, declaredStatuses };
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: { "user-agent": "WhoOwnsYourDNA-source-import/0.1" },
  });
  if (!response.ok) {
    throw new Error(`NHGRI request failed with HTTP ${response.status}.`);
  }

  const html = await response.text();
  const { records, sourcePageLastUpdated, declaredTopics, declaredStatuses } =
    parseSourcePage(html);
  const recordsJson = `${JSON.stringify(records, null, 2)}\n`;
  const exactKeys = records.map((record) =>
    JSON.stringify([
      record.jurisdiction,
      record.source_record_label,
      record.primary_url,
      record.source_topics,
      record.source_status,
      record.source_summary,
    ]),
  );

  const manifest = {
    dataset: "NHGRI Genome Statute and Legislation Database",
    source_page: SOURCE_PAGE_URL,
    source_query: SOURCE_URL,
    source_page_last_updated: sourcePageLastUpdated,
    snapshot_fetched_at: new Date().toISOString(),
    stated_coverage: "State statutes and bills introduced during 2002-2024 U.S. state legislative sessions.",
    stated_exclusions: [
      "Federal statutes and bills",
      "Regulations",
      "State laws related to genetic counseling",
    ],
    attribution: "Courtesy: National Human Genome Research Institute",
    record_count: records.length,
    jurisdiction_count: new Set(records.map((record) => record.jurisdiction)).size,
    declared_topics: declaredTopics,
    observed_topics: [...new Set(records.flatMap((record) => record.source_topics))].sort(),
    declared_statuses: declaredStatuses,
    observed_statuses: [...new Set(records.map((record) => record.source_status))].sort(),
    http_primary_link_count: records.filter((record) =>
      record.primary_url.startsWith("http://"),
    ).length,
    duplicate_urls: countDuplicates(records.map((record) => record.primary_url)),
    duplicate_labels: countDuplicates(
      records.map((record) => record.source_record_label),
    ),
    duplicate_state_label_url_keys: countDuplicates(
      records.map((record) =>
        JSON.stringify([
          record.jurisdiction,
          record.source_record_label,
          record.primary_url,
        ]),
      ),
    ),
    exact_duplicates: countDuplicates(exactKeys),
    source_html_sha256: sha256(html),
    records_sha256: sha256(recordsJson),
  };

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  await Promise.all([
    writeFile(`${OUTPUT_DIRECTORY}/records.json`, recordsJson),
    writeFile(
      `${OUTPUT_DIRECTORY}/manifest.json`,
      `${JSON.stringify(manifest, null, 2)}\n`,
    ),
  ]);

  console.log(
    `Imported ${records.length} NHGRI rows from a page last updated ${sourcePageLastUpdated}.`,
  );
}

await main();
