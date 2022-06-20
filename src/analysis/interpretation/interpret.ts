// Import Third-party Dependencies
import { Scanner } from "@nodesecure/scanner";
import { GlobalWarning } from "@nodesecure/scanner/types/scanner";
import set from "lodash.set";

// Import Internal Dependencies
import { IgnorePatterns } from "../../configuration/external/nodesecure/ignore-file.js";
import { Nsci } from "../../configuration/standard/index.js";
import { pipeline } from "../../reporting/index.js";
import { DependencyWarning } from "../../types/index.js";
import {
  extractScannerPayload,
  WorkableVulnerability
} from "../extraction/extract.js";

import {
  CheckResult,
  PipelineCheckFunctions,
  FAILING_CHECK
} from "./checkable.js";
import { checkDependenciesVulns } from "./vulnerabilities.js";
import {
  checkDependenciesWarnings,
  checkGlobalWarnings,
  DependencyWarningWithMode
} from "./warnings.js";

export interface InterpretedScannerPayload {
  warnings: GlobalWarning;
  dependencies: {
    warnings: DependencyWarningWithMode[];
    vulnerabilities: WorkableVulnerability[];
  };
}

export type OutcomePayloadFromPipelineChecks = {
  status: pipeline.Status;
  data: InterpretedScannerPayload;
};

function interpretPayloadChecks(
  pipelineCheckFunctions: PipelineCheckFunctions
): OutcomePayloadFromPipelineChecks {
  const pipelineFunctionsResult = pipelineCheckFunctions.reduce<{
    checks: CheckResult[];
    data: InterpretedScannerPayload;
  }>(
    (accumulatedDataFromChecks, checkFunction) => {
      const { result, data } = checkFunction();

      set(accumulatedDataFromChecks.data, data.key, data.value);

      /**
       * Here, we accumulate an array of boolean Status returned by each Check
       * function, allowing us to easily verify if at least one function failed.
       * We also accumulate each data returned by the Check function, justifying
       * the given Status returned.
       */
      return {
        checks: [...accumulatedDataFromChecks.checks, result],
        data: {
          ...accumulatedDataFromChecks.data
        }
      };
    },
    {
      checks: [],
      data: {} as InterpretedScannerPayload
    }
  );

  const isGlobalCheckPassing =
    !pipelineFunctionsResult.checks.includes(FAILING_CHECK);

  return {
    status: pipeline.getOutcome(isGlobalCheckPassing),
    data: pipelineFunctionsResult.data
  };
}

export function filterDependenciesWarnings(
  dependenciesWarnings: DependencyWarning[],
  ignorePatterns: IgnorePatterns
): DependencyWarning[] {
  const isWarningsEmpty =
    ignorePatterns.warnings === undefined ||
    Object.keys(ignorePatterns?.warnings).length === 0;
  if (isWarningsEmpty) {
    return dependenciesWarnings;
  }

  return dependenciesWarnings.filter(function excludeIgnorableWarnings(
    dependencyWarnings
  ) {
    if (
      dependencyWarnings.warnings.find((w) =>
        ignorePatterns.warnings.has(w.kind, dependencyWarnings.package)
      )
    ) {
      return false;
    }

    return true;
  });
}

/**
 * This interpreter accumulates each Check Function output in order to determine
 * a global pipeline status and at the same time compact the original payload to
 * simplify the reporting step.
 * In other words "status" is used to decide if the pipeline should fail or pass,
 * whereas the data is compacted in order to be easily reported by any type of
 * reporter (HTML, Console, etc).
 */
export function runPayloadInterpreter(
  payload: Scanner.Payload,
  rc: Nsci.Configuration
): OutcomePayloadFromPipelineChecks {
  const { warnings, dependencies } = extractScannerPayload(payload);
  const filteredDependencies = filterDependenciesWarnings(
    dependencies.warnings,
    rc.ignorePatterns
  );

  /* eslint-disable @typescript-eslint/explicit-function-return-type */
  return interpretPayloadChecks([
    () => checkGlobalWarnings(warnings),
    () => checkDependenciesWarnings(filteredDependencies, rc),
    () => checkDependenciesVulns(dependencies.vulnerabilities, rc)
  ]);
}
