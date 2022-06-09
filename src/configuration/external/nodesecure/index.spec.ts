// Third-party Dependencies
import { expect } from "chai";  

// Internal Dependencies
import { getIgnoreFile } from "./index";

describe('getIgnoreFile', () => {
  it("should return empty object if file doen't exist", async () => {
    const readFileWillThrow = () => { throw new Error("boom") };

    const result = await getIgnoreFile({ readFile: readFileWillThrow });

    expect(result).to.be.empty;
  });

  it("should return empty object if file format is invalid", async () => {
    const invalidIgnoreFile = JSON.stringify({ foo: "bar" });

    const result = await getIgnoreFile({ readFile: () => invalidIgnoreFile });

    expect(result).to.be.empty;
  });

  it("should return the ignore file if it's valid", async () => {
    const validIgnoreFile = { warnings: {} };

    const result = await getIgnoreFile({ readFile: () => JSON.stringify(validIgnoreFile) });

    expect(result).to.be.deep.equal(validIgnoreFile);
  });
})
