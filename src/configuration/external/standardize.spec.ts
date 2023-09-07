// Import Node.js Dependencies
import path from "node:path";
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import { RC as NodeSecureRuntimeConfig } from "@nodesecure/rc";

// Import Internal Dependencies
import { IgnorePatterns } from "../../configuration/external/nodesecure/ignore-file";
import { Nsci } from "../standard/index.js";

import { ExternalRuntimeConfiguration } from "./common.js";
import {
  standardizeAllApisOptions,
  standardizeExternalConfiguration
} from "./standardize.js";

describe("Standardize CLI/API configuration to Nsci runtime configuration", () => {
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
        rootDir: path.join(cwd, "src"),
        strategy: "NPM_AUDIT",
        reporters: ["console", "html"],
        vulnerabilitySeverity: "all",
        warnings: "error",
        ignorePatterns: IgnorePatterns.default()
      };
      
      assert.deepEqual(
        standardizeExternalConfiguration(
          externalOptions as ExternalRuntimeConfiguration
        )
      ,finalConfig);
    });
  });

  describe("When providing a partial configuration with invalid options", () => {
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
        strategy: "unknown",
        vulnerabilities: "unknown",
        warnings: "all",
        reporters: "json, console"
      },
      {
        directory: "../NonExistingDirectory",
        strategy: "unknown",
        vulnerabilities: "unknown",
        warnings: "all",
        reporters: ["invalidReporter1", "invalidReporter2", "console"]
      },
      {
        directory: "../NonExistingDirectory",
        strategy: "unknown",
        vulnerabilities: "unknown",
        warnings: {
          "invalid-warning-kind-with-valid-value": "off",
          "invalid-warning-kind-with-invalid-value": undefined,
          "other-invalid-warning-kind-with-invalid-value": []
        },
        reporters: ["invalidReporter1", "invalidReporter2", "console"]
      }
    ];

    it("should only keep valid options from partial config to allow correct merging with default RC", () => {
      partialOrInvalidConfigThatShouldFallbackToDefaultRC.forEach(
        // eslint-disable-next-line max-nested-callbacks
        (partialConfig) => {
          assert.deepEqual(
            standardizeExternalConfiguration(
              partialConfig as ExternalRuntimeConfiguration
            )
          ,Nsci.defaultNsciRuntimeConfiguration);
        }
      );
    });
  });
});

it("should standardize NodeSecure runtime configuration to Nsci runtime configuration", async () => {
  const partialCfg: NodeSecureRuntimeConfig = {
    version: "1.0",
    strategy: "snyk",
    ci: {
      // @ts-expect-error - we voluntarily provide partial warnings
      warnings: {
        "encoded-literal": "off",
        "unsafe-regex": "error",
        "short-identifiers": "warning"
      },
      vulnerabilities: {
        severity: "critical"
      }
    }
  };

  const standardizedCfg = standardizeExternalConfiguration(
    standardizeAllApisOptions(partialCfg)
  );

  assert.deepEqual(standardizedCfg,{
    reporters: ["console"],
    rootDir: process.cwd(),
    strategy: "SNYK",
    vulnerabilitySeverity: "critical",
    warnings: {
      "encoded-literal": "off",
      "unsafe-regex": "error",
      "short-identifiers": "warning"
    },
    ignorePatterns: IgnorePatterns.default()
  });
});
