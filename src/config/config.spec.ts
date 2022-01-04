import { expect } from "chai";

import { DEFAULT_RUNTIME_CONFIGURATION } from "./nodesecurerc";
import { standardizeConfig } from "./standardize.js";

describe("Runtime Configuration adapter", () => {
  describe("When providing complete configuration options", () => {
    it("should standardize config options", () => {
      const externalOptions = {
        directory: process.cwd(),
        strategy: "NPM_AUDIT",
        vulnerability: "all",
        warnings: "error",
        reporters: "console"
      };

      expect(standardizeConfig(externalOptions)).to.deep.equal(
        DEFAULT_RUNTIME_CONFIGURATION
      );
    });
  });
});
