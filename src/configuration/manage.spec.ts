// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import {
  type ApiConfig,
  type CliConfig
} from "./external/index.js";
import { selectRuntimeConfig } from "./manage.js";
import { Nsci } from "./standard/index.js";

describe("When managing the runtime configuration", () => {
  describe("When there is no .nodesecurerc file", () => {
    describe("When providing no options from the CLI or API", () => {
      it("should fallback to the default Nsci configuration options", async() => {
        const optionsFromCliOrApi: ApiConfig | CliConfig =
          {} as unknown as ApiConfig;

        const { configMode, runtimeConfig } =
          await selectRuntimeConfig(optionsFromCliOrApi);

        assert.deepEqual(configMode, "raw");
        assert.deepEqual(runtimeConfig, Nsci.defaultNsciRuntimeConfiguration);
      });
    });
    describe("When providing options from the CLI or API", () => {
      it("should use the configuration provided from function arguments (i.e: coming from either API or CLI)", async() => {
        const optionsFromCliOrApi: ApiConfig | CliConfig = {
          directory: process.cwd(),
          vulnerabilities: "all",
          warnings: "off",
          strategy: "snyk",
          reporters: ["html"]
        };

        const { configMode, runtimeConfig } =
          await selectRuntimeConfig(optionsFromCliOrApi);

        assert.deepEqual(configMode, "raw");
        assert.deepEqual(runtimeConfig, {
          /**
           * Spreading default Nsci config just for being explicit with the
           * expected behavior which is starting from the default Nsci config
           * and overriding each valid property supplied either from the CLI
           * or the API.
           */
          ...Nsci.defaultNsciRuntimeConfiguration,
          rootDir: process.cwd(),
          strategy: "SNYK",
          reporters: ["html"],
          vulnerabilitySeverity: "all",
          warnings: "off"
        });
      });
    });
  });
});
