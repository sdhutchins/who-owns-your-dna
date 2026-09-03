import { describe, expect, it } from "vitest";

import { hasNhgriSnapshotChanged } from "../scripts/import-nhgri.mjs";

const currentManifest = {
  records_sha256: "records-a",
  source_html_sha256: "html-a",
  source_page_last_updated: "2024-02-08",
  snapshot_fetched_at: "2026-09-01T00:00:00.000Z",
  declared_topics: ["Privacy"],
  declared_statuses: ["Enacted"],
};

describe("NHGRI snapshot monitoring", () => {
  it("ignores retrieval time and cosmetic HTML changes", () => {
    const candidateManifest = {
      ...currentManifest,
      source_html_sha256: "html-b",
      snapshot_fetched_at: "2026-09-08T00:00:00.000Z",
    };

    expect(
      hasNhgriSnapshotChanged(currentManifest, candidateManifest),
    ).toBe(false);
  });

  it("detects changes to normalized source records", () => {
    const candidateManifest = {
      ...currentManifest,
      records_sha256: "records-b",
    };

    expect(
      hasNhgriSnapshotChanged(currentManifest, candidateManifest),
    ).toBe(true);
  });

  it("detects changes to source vocabularies", () => {
    const candidateManifest = {
      ...currentManifest,
      declared_topics: ["Privacy", "Research"],
    };

    expect(
      hasNhgriSnapshotChanged(currentManifest, candidateManifest),
    ).toBe(true);
  });
});
