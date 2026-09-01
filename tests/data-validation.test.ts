import { describe, expect, it } from "vitest";

import { validateRecords } from "../scripts/validate-data.mjs";

describe("legal record data", () => {
  it("passes schema and controlled-vocabulary validation", async () => {
    const result = await validateRecords();

    expect(result.errors).toEqual([]);
    expect(result.count).toBeGreaterThanOrEqual(5);
    expect(result.nhgriCount).toBe(1175);
  });
});
