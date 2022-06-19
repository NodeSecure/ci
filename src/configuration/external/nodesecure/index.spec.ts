// Third-party Dependencies
import { expect } from "chai";  
import mock from "mock-fs";

// Internal Dependencies
import { getIgnoreFile, kIgnoreFilePath } from "./index";

describe('getIgnoreFile', () => {
  it("should return empty object if file doen't exist", async () => {
    const result = await getIgnoreFile();

    expect(result).to.be.empty;
  });

  it("should return empty object if file format is invalid", async () => {
    const invalidIgnoreFile = { foo: "bar" };
    createFakeIgnoreFile(JSON.stringify(invalidIgnoreFile));

    const result = await getIgnoreFile();

    expect(result).to.be.empty;
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

function createFakeIgnoreFile(fileContent: string) {
  mock({
    [kIgnoreFilePath]: Buffer.from(fileContent)
  }, {} as any);
}

