// Third-party Dependencies
import { expect } from "chai";
import mock from "mock-fs";

// Internal Dependencies
import { IgnorePatterns } from "./ignore-file";

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
    const validIgnoreFile = { warnings: {} };
    createFakeIgnoreFile(JSON.stringify(validIgnoreFile));

    const result = await getIgnoreFile();

    expect(result).to.be.deep.equal(validIgnoreFile);
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
