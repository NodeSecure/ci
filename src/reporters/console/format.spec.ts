import { expect } from "chai";

import { pluralize } from "./format.js";

describe("When pluralizing a string", () => {
  it("should pluralize by default", () => {
    expect(pluralize("warning")).equals("warnings");
    expect(pluralize("value")).equals("values");
    expect(pluralize("vulnerability")).equals("vulnerabilities");
  });

  it("should only pluralize based on the provided length", () => {
    expect(pluralize("warning", 1)).equals("warning");
    expect(pluralize("warning", 2)).equals("warnings");
  });
});
