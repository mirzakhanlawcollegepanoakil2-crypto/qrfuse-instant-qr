import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { collectPages } from "./pagination";

describe("public content pagination", () => {
  test("includes records beyond the first 1000 without duplicates", async () => {
    const rows = Array.from({ length: 1251 }, (_, i) => i);
    const result = await collectPages(async (from, to) => rows.slice(from, to + 1));
    assert.deepEqual(result, rows);
  });

  test("rejects a later-page failure instead of returning partial content", async () => {
    await assert.rejects(collectPages(async (from) => {
      if (from > 0) throw new Error("Content unavailable");
      return Array.from({ length: 500 }, (_, i) => i);
    }), /Content unavailable/);
  });
});