// Node.Js Dependencies
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Import Third-party Dependencies
import { RC as NodeSecureRuntimeConfig, read } from "@nodesecure/rc";
import { match } from "ts-pattern";
import type { Result } from "ts-results";

// Import Internal Dependencies
import { validateIgnoreFile, kIgnoreFileName, IgnoreFile } from "./ignore-file";
import {
  defaultExternalConfigOptions,
  ExternalConfigAdapter,
  ExternalRuntimeConfiguration
} from "../common.js";
import { Maybe } from "../../../types/index.js";
import { consolePrinter } from "../../../../lib/console-printer";

const { font: log } = consolePrinter;
const __dirname = dirname(fileURLToPath(import.meta.url));
const kRootPath = join(__dirname, "..", "..", "..");
export const kIgnoreFilePath = join(kRootPath, kIgnoreFileName);

function interpretNodeSecureConfigResult(
  config: Result<NodeSecureRuntimeConfig, NodeJS.ErrnoException>
): NodeSecureRuntimeConfig | undefined {
  /**
   * It seems that ts-results' could not type narrow with the current
   * TypeScript version/config.
   * Let's bring ts-pattern to the rescue!
   */
  return match(config)
    .with({ ok: true }, (result) => result.val)
    .with(
      { ok: false },
      // eslint-disable-next-line handle-callback-err
      (_err) =>
        /**
         * For now, no difference is made between an ENOENT or an invalid file.
         * We could process a pattern matching on the callback err provided
         * to differentiate ENOENT or and exceptions thrown (e.g: AJV when invalid
         * properties) which would then be reported.
         */
        undefined
    )
    .exhaustive();
}

export async function generateDefaultNodeSecureConfig(): Promise<
  Maybe<NodeSecureRuntimeConfig>
> {
  const config = await read(process.cwd(), {
    createIfDoesNotExist: true,
    createMode: "ci"
  });

  return interpretNodeSecureConfigResult(config);
}

export async function getNodeSecureConfig(): Promise<
  Maybe<NodeSecureRuntimeConfig>
> {
  const config = await read(process.cwd());

  return interpretNodeSecureConfigResult(config);
}

export async function getIgnoreFile(): Promise<IgnoreFile> {
  try {
    const ignoreFile = await readFile(kIgnoreFilePath, "utf8");
    const ignoreObject = JSON.parse(ignoreFile);
    const { isValid, error } = validateIgnoreFile(ignoreObject);
    if (!isValid) {
      log.error(`Invalid ignore file: ${error}, empty one will be used instead`).print();
      return {};
    }
    log.success("Ignore file loaded").print();
    return JSON.parse(ignoreFile) as IgnoreFile;

  }
  catch (error: any) {
    log.error(`Cannot load ignore file: ${error.message}`).print();
    return {};
  }
}

function adaptNodeSecureConfigToExternalConfig(
  runtimeConfig: NodeSecureRuntimeConfig
): ExternalRuntimeConfiguration {
  return {
    directory: process.cwd(),
    strategy: runtimeConfig.strategy ?? defaultExternalConfigOptions.strategy,
    vulnerabilities:
      runtimeConfig.ci?.vulnerabilities?.severity ??
      defaultExternalConfigOptions.vulnerabilities,
    warnings:
      runtimeConfig.ci?.warnings ?? defaultExternalConfigOptions.warnings,
    reporters:
      runtimeConfig.ci?.reporters ?? defaultExternalConfigOptions.reporters
  };
}

export const NodeSecureConfigAdapter: ExternalConfigAdapter<NodeSecureRuntimeConfig> =
  {
    adaptToExternalConfig: adaptNodeSecureConfigToExternalConfig
  };
