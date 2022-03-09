import { expect } from "chai";

import * as RC from "../nodesecurerc.js";

import {
  ExternalRuntimeConfiguration,
  standardizeConfig
} from "./standardize.js";

describe("CLI configuration to Runtime configuration adapter", () => {
  describe("When providing a complete configuration with valid options", () => {
    it("should standardize config options", () => {
      const cwd = process.cwd();

      const externalOptions = {
        directory: "src",
        strategy: "npm",
        vulnerabilities: "all",
        warnings: "",
        reporters: "console, html"
      };

      const finalConfig = {
        rootDir: `${cwd}/src`,
        strategy: "NPM_AUDIT",
        reporters: ["console", "html"],
        vulnerabilitySeverity: "all",
        warnings: "error"
      };

      expect(
        standardizeConfig(externalOptions as ExternalRuntimeConfiguration)
      ).to.deep.equal(finalConfig);
    });
  });

  describe("When providing a partial configuration with invalid options", () => {
    // eslint-disable-next-line id-length
    const partialOrInvalidConfigThatShouldFallbackToDefaultRC = [
      {},
      undefined,
      null,
      {
        directory: undefined,
        strategy: undefined,
        vulnerabilities: undefined,
        warnings: undefined,
        reporters: null
      },
      {
        directory: "/Users/NonExistingDirectory/XYZ",
        strategy: "",
        vulnerabilities: "",
        warnings: "",
        reporters: ""
      },
      {
        directory: "../NonExistingDirectory",
        strategy: "snyk",
        vulnerabilities: "unknown",
        warnings: "all",
        reporters: "json, console"
      },
      {
        directory: "../NonExistingDirectory",
        strategy: "snyk",
        vulnerabilities: "unknown",
        warnings: "all",
        reporters: ["invalidReporter1", "invalidReporter2", "console"]
      }
    ];

    it("should only keep valid options from partial config to allow correct merging with default RC", () => {
      partialOrInvalidConfigThatShouldFallbackToDefaultRC.forEach(
        // eslint-disable-next-line max-nested-callbacks
        (partialConfig) => {
          expect(
            standardizeConfig(partialConfig as ExternalRuntimeConfiguration)
          ).to.deep.equal(RC.DEFAULT_RUNTIME_CONFIGURATION);
        }
      );
    });
  });
});
