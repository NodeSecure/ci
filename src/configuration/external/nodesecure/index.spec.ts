// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";
import fs from "node:fs/promises";

// Internal Dependencies
import { IgnorePatterns, IgnoreWarningsPatterns } from "./ignore-file.js";
import { getIgnoreFile } from "./index.js";

describe("getIgnoreFile", () => {
  const kDefaultIgnoreFileContent = IgnorePatterns.default();

  it("should return empty object if file doen't exist", async() => {
    const result = await getIgnoreFile();

    assert.deepEqual(result, kDefaultIgnoreFileContent);
  });

  it("should return empty object if file format is invalid", async(ctx) => {
    const invalidIgnoreFile = { foo: "bar" };
    ctx.mock.method(fs, "readFile", () => Promise.resolve(JSON.stringify(invalidIgnoreFile)));

    const result = await getIgnoreFile();

    assert.deepEqual(result, kDefaultIgnoreFileContent);
  });

  it("should return the ignore file if it's valid", async(ctx) => {
    const validIgnoreFile = {
      warnings: {
        "unsafe-regex": ["negotiator"]
      }
    };
    ctx.mock.method(fs, "readFile", () => Promise.resolve(JSON.stringify(validIgnoreFile)));

    const result = await getIgnoreFile();

    assert.ok(result instanceof IgnorePatterns);
    assert.notDeepEqual(result, {});
  });

  it("should return an IgnorePatterns warnings property", async(ctx) => {
    const validIgnoreFile = {
      warnings: {
        "unsafe-regex": ["negotiator"]
      }
    };
    ctx.mock.method(fs, "readFile", () => Promise.resolve(JSON.stringify(validIgnoreFile)));

    const { warnings } = await getIgnoreFile();

    assert.ok(warnings instanceof IgnoreWarningsPatterns);
  });

  it("should return an helper to check if a warning exist for a given pkg", async(ctx) => {
    const validIgnoreFile = {
      warnings: {
        "unsafe-regex": ["negotiator"]
      }
    };
    ctx.mock.method(fs, "readFile", () => Promise.resolve(JSON.stringify(validIgnoreFile)));

    const result = await getIgnoreFile();

    assert.equal(result.warnings.has("unsafe-regex", "negotiator"), true);
    assert.equal(result.warnings.has("unsafe-regex", "express"), false);
  });
});
