// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Third-party Dependencies
import mock from "mock-fs";

// Internal Dependencies
import { IgnorePatterns, IgnoreWarningsPatterns } from "./ignore-file.js";

import { getIgnoreFile, kIgnoreFilePath } from "./index.js";

describe("getIgnoreFile", () => {
  const kDefaultIgnoreFileContent = IgnorePatterns.default();

  it("should return empty object if file doen't exist", async() => {
    const result = await getIgnoreFile();

    assert.deepEqual(result, kDefaultIgnoreFileContent);
  });

  it("should return empty object if file format is invalid", async() => {
    const invalidIgnoreFile = { foo: "bar" };
    createFakeIgnoreFile(JSON.stringify(invalidIgnoreFile));

    const result = await getIgnoreFile();

    assert.deepEqual(result, kDefaultIgnoreFileContent);
    mock.restore();
  });

  it("should return the ignore file if it's valid", async() => {
    const validIgnoreFile = {
      warnings: {
        "unsafe-regex": ["negotiator"]
      }
    };
    createFakeIgnoreFile(JSON.stringify(validIgnoreFile));

    const result = await getIgnoreFile();

    assert.ok(result instanceof IgnorePatterns);
    assert.notDeepEqual(result, {});
    mock.restore();
  });

  it("should return an IgnorePatterns warnings property", async() => {
    const validIgnoreFile = {
      warnings: {
        "unsafe-regex": ["negotiator"]
      }
    };
    createFakeIgnoreFile(JSON.stringify(validIgnoreFile));

    const { warnings } = await getIgnoreFile();

    assert.ok(warnings instanceof IgnoreWarningsPatterns);
    mock.restore();
  });

  it("should return an helper to check if a warning exist for a given pkg", async() => {
    const validIgnoreFile = {
      warnings: {
        "unsafe-regex": ["negotiator"]
      }
    };
    createFakeIgnoreFile(JSON.stringify(validIgnoreFile));

    const result = await getIgnoreFile();

    assert.equal(result.warnings.has("unsafe-regex", "negotiator"), true);
    assert.equal(result.warnings.has("unsafe-regex", "express"), false);
    mock.restore();
  });
});

/**
 *  HELPERS
 */

function createFakeIgnoreFile(fileContent: string): void {
  mock(
    {
      [kIgnoreFilePath]: Buffer.from(fileContent)
    },
    {} as any
  );
}
