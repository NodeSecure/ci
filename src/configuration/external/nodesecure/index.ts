// Import Node.js Dependencies
import fs from "node:fs/promises";
import { join } from "node:path";

// Import Third-party Dependencies
import { type RC as NodeSecureRuntimeConfig, read } from "@nodesecure/rc";
import type { Result } from "@openally/result";
import { match } from "ts-pattern";

// Import Internal Dependencies
import { consolePrinter } from "../../../../lib/console-printer/index.js";
import type { Maybe } from "../../../types/index.js";
import {
  defaultExternalConfigOptions,
  type ExternalConfigAdapter,
  type ExternalRuntimeConfiguration
} from "../common.js";

import {
  validateIgnoreFile,
  kIgnoreFileName,
  IgnorePatterns
} from "./ignore-file.js";

const { font: log } = consolePrinter;
export const kIgnoreFilePath = join(process.cwd(), kIgnoreFileName);

/**
 * NOTE: this abstract is temporary
 *
 * TODO: create a proper logger abstract
 */
const logger = {
  info: (message: string): void => {
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv !== "test") {
      log
        .standard(message)
        .prefix(log.info("info").message)
        .printWithEmptyLine();
    }
  },
  error: (message: string): void => {
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv !== "test") {
      log.error(message).printWithEmptyLine();
    }
  }
};

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
      /**
       * For now, no difference is made between an ENOENT or an invalid file.
       * We could process a pattern matching on the callback err provided
       * to differentiate ENOENT or and exceptions thrown (e.g: AJV when invalid
       * properties) which would then be reported.
       */
      (_err) => undefined
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

export async function getIgnoreFile(): Promise<IgnorePatterns> {
  const highlightedFilename = log.highlight(".nodesecureignore").message;
  try {
    const ignoreFile = await fs.readFile(kIgnoreFilePath, "utf8");
    const ignoreObject = JSON.parse(ignoreFile);
    const { isValid, error } = validateIgnoreFile(ignoreObject);
    if (!isValid) {
      logger.error(
        `✖ Invalid ${highlightedFilename} file: ${error}. Nothing will be ignored.`
      );

      return IgnorePatterns.default();
    }
    logger.info(`${highlightedFilename} file successfully loaded.`);

    return new IgnorePatterns(ignoreObject.warnings);
  }
  catch (error: any) {
    if (error.code === "ENOENT") {
      logger.info(
        `${highlightedFilename} file not found. Nothing will be ignored.`
      );

      return IgnorePatterns.default();
    }
    logger.error(`✖ Cannot load ignore file: ${error.message}`);

    return IgnorePatterns.default();
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
