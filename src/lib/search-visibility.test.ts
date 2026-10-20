import { test } from "node:test";
import assert from "node:assert/strict";
import { isPrivateSearchPath } from "./search-visibility";

test("private account pages and redirect links stay out of search", () => {
  for (const path of ["/admin", "/auth", "/dashboard", "/dashboard/", "/r/example"]) {
    assert.equal(isPrivateSearchPath(path), true);
  }
});

test("public generators and articles remain crawlable", () => {
  for (const path of ["/", "/contact-qr-code-generator", "/email-qr-code-generator", "/blog/guide"]) {
    assert.equal(isPrivateSearchPath(path), false);
  }
});