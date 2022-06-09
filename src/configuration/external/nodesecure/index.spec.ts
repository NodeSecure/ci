// Third-party Dependencies
import { expect } from "chai";
import mock from "mock-fs";

// Internal Dependencies
import { IgnorePatterns, IgnoreWarningsPatterns } from "./ignore-file";

import { getIgnoreFile, kIgnoreFilePath } from "./index";

describe("getIgnoreFile", () => {
  const kDefaultIgnoreFileContent = IgnorePatterns.default();

  it("should return empty object if file doen't exist", async () => {
    const result = await getIgnoreFile();

    expect(result).deep.equal(kDefaultIgnoreFileContent);
  });

  it("should return empty object if file format is invalid", async () => {
    const invalidIgnoreFile = { foo: "bar" };
    createFakeIgnoreFile(JSON.stringify(invalidIgnoreFile));

    const result = await getIgnoreFile();

    expect(result).deep.equal(kDefaultIgnoreFileContent);
    mock.restore();
  });

  it("should return the ignore file if it's valid", async () => {
    const validIgnoreFile = {
      warnings: {
        "unsafe-regex": ["negotiator"]
      }
    };
    createFakeIgnoreFile(JSON.stringify(validIgnoreFile));

    const result = await getIgnoreFile();

    expect(result).to.be.an.instanceof(IgnorePatterns);
    expect(result).not.to.deep.equal({});
    mock.restore();
  });

  it("should return an IgnorePatterns warnings property", async () => {
    const validIgnoreFile = {
      warnings: {
        "unsafe-regex": ["negotiator"]
      }
    };
    createFakeIgnoreFile(JSON.stringify(validIgnoreFile));

    const { warnings } = await getIgnoreFile();

    expect(warnings).to.be.an.instanceof(IgnoreWarningsPatterns);
    mock.restore();
  });

  it("should return an helper to check if a warning exist for a given pkg", async () => {
    const validIgnoreFile = {
      warnings: {
        "unsafe-regex": ["negotiator"]
      }
    };
    createFakeIgnoreFile(JSON.stringify(validIgnoreFile));

    const result = await getIgnoreFile();

    expect(result.warnings.has("unsafe-regex", "negotiator")).to.equal(true);
    expect(result.warnings.has("unsafe-regex", "express")).to.equal(false);
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
