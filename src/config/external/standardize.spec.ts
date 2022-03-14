import { unlinkSync } from "fs";
import path from "path";

import { expect } from "chai";

import { Nsci } from "../standard/index.js";

import { ExternalRuntimeConfiguration } from "./common.js";
import * as NodeSecureRC from "./nodesecure/index.js";
import {
  defaultExternalConfigOptions,
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
        rootDir: `${cwd}/src`,
        strategy: "NPM_AUDIT",
        reporters: ["console", "html"],
        vulnerabilitySeverity: "all",
        warnings: "error"
      };

      expect(
        standardizeExternalConfiguration(
          externalOptions as ExternalRuntimeConfiguration
        )
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
      }
    ];

    it("should only keep valid options from partial config to allow correct merging with default RC", () => {
      partialOrInvalidConfigThatShouldFallbackToDefaultRC.forEach(
        // eslint-disable-next-line max-nested-callbacks
        (partialConfig) => {
          expect(
            standardizeExternalConfiguration(
              partialConfig as ExternalRuntimeConfiguration
            )
          ).to.deep.equal(Nsci.DEFAULT_NSCI_RUNTIME_CONFIGURATION);
        }
      );
    });
  });
});

describe("Standardize NodeSecure runtime configuration to Nsci runtime configuration", () => {
  afterEach(() => {
    unlinkSync(path.join(process.cwd(), ".nodesecurerc"));
  });
  describe("When generating the NodeSecure runtime config file", () => {
    it("should retrieve the config after generation", async () => {
      const cfg = await NodeSecureRC.generateDefaultNodeSecureConfig();
      expect(cfg).not.to.equal(undefined);

      const currentCfg = await NodeSecureRC.getNodeSecureConfig();
      expect(cfg).to.deep.equal(currentCfg);
    });
  });

  it("should convert the NodeSecure runtime config as an External config", async () => {
    const cfg = await NodeSecureRC.generateDefaultNodeSecureConfig();

    const adaptedConfig =
      NodeSecureRC.NodeSecureConfigAdapter.adaptToExternalConfig(cfg);

    expect(adaptedConfig).to.deep.equal(defaultExternalConfigOptions);
  });
});
