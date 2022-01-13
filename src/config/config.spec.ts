import { expect } from "chai";

import { DEFAULT_RUNTIME_CONFIGURATION } from "../nodesecurerc.js";

import { ConfigOptions, standardizeConfig } from "./standardize.js";

describe("CLI configuration to Runtime configuration adapter", () => {
  describe("When providing complete CLI configuration options", () => {
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

      expect(standardizeConfig(externalOptions as ConfigOptions)).to.deep.equal(
        finalConfig
      );
    });
  });

  describe("When providing partial CLI configuration options", () => {
    // eslint-disable-next-line id-length
    const partialOrInvalidConfigThatShouldFallbackToDefaultRC = [
      {
        directory: "/Users/NonExistingDirectory/XYZ",
        strategy: "",
        vulnerabilities: "",
        warnings: "",
        reporters: "console html"
      },
      {
        directory: "../NonExistingDirectory",
        strategy: "snyk",
        vulnerabilities: "unknown",
        warnings: "all",
        reporters: "json, console, console"
      },
      {
        directory: "../NonExistingDirectory",
        strategy: "snyk",
        vulnerabilities: "unknown",
        warnings: "all",
        reporters: ["json", "invalidReporter", "console", "console"]
      }
    ];

    it("should keep only valid options from partial config to allow correct merging with default rc", () => {
      partialOrInvalidConfigThatShouldFallbackToDefaultRC.forEach(
        // eslint-disable-next-line max-nested-callbacks
        (partialConfig) => {
          expect(
            standardizeConfig(partialConfig as ConfigOptions)
          ).to.deep.equal(DEFAULT_RUNTIME_CONFIGURATION);
        }
      );
    });
  });
});
