import { unlinkSync } from "fs";
import path from "path";

import { write } from "@nodesecure/rc";
import { expect } from "chai";

import { ApiConfig } from "./external/api";
import { CliConfig } from "./external/cli";
import { generateDefaultNodeSecureConfig } from "./external/nodesecure";
import { selectRuntimeConfig } from "./manage";
import { Nsci } from "./standard";

/* eslint-disable max-nested-callbacks */
describe("When managing the runtime configuration", () => {
  describe("When there is no .nodesecurerc file", () => {
    describe("When providing no options from the CLI or API", () => {
      it("should fallback to the default Nsci configuration options", async () => {
        const optionsFromCliOrApi: ApiConfig | CliConfig =
          {} as unknown as ApiConfig;

        expect(await selectRuntimeConfig(optionsFromCliOrApi)).to.deep.equal(
          Nsci.DEFAULT_NSCI_RUNTIME_CONFIGURATION
        );
      });
    });
    describe("When providing options from the CLI or API", () => {
      it("should use the configuration provided from function arguments (i.e: coming from either API or CLI)", async () => {
        const optionsFromCliOrApi: ApiConfig | CliConfig = {
          directory: process.cwd(),
          vulnerabilities: "all",
          warnings: "off",
          strategy: "snyk",
          reporters: ["html"]
        };

        expect(await selectRuntimeConfig(optionsFromCliOrApi)).to.deep.equal({
          /**
           * Spreading default Nsci config just for being explicit with the
           * expected behavior which is starting from the default Nsci config
           * and overriding each valid property supplied either from the CLI
           * or the API.
           */
          ...Nsci.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
          rootDir: process.cwd(),
          strategy: "SNYK",
          reporters: ["html"],
          vulnerabilitySeverity: "all",
          warnings: "off"
        });
      });
    });
  });

  describe("When there is a .nodesecurerc file", () => {
    it("should use the configuration provided from the file and ignore function arguments (i.e: coming from either API or CLI)", async () => {
      /**
       * We voluntarily provide Api and Cli options to be sure that they
       * are ignored in favor of options defined in .nodesecurerc
       */
      const optionsFromCliOrApi: ApiConfig | CliConfig = {
        strategy: "snyk",
        reporters: ["console"]
      } as unknown as ApiConfig;

      await generateDefaultNodeSecureConfig();

      /**
       * Here, we emulate a change within the runtime config file which would
       * be done by the user of the library.
       */
      await write(process.cwd(), {
        payload: {
          strategy: "node",
          ci: {
            vulnerabilities: {
              severity: "all"
            },
            reporters: ["html"],
            warnings: "warning"
          }
        },
        partialUpdate: true
      });

      expect(await selectRuntimeConfig(optionsFromCliOrApi)).to.deep.equal({
        // Starting from the default config
        ...Nsci.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
        /**
         * But then we expect custom config defined in the RC file to be reflected
         * in the runtime config which will be used during the analysis
         */
        strategy: "SECURITY_WG",
        vulnerabilitySeverity: "all",
        reporters: ["html"],
        warnings: "warning"
      });

      unlinkSync(path.join(process.cwd(), ".nodesecurerc"));
    });
  });
});
