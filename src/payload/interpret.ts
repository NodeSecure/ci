import { Scanner } from "@nodesecure/scanner";
import { GlobalWarning } from "@nodesecure/scanner/types/scanner";
import { Strategy } from "@nodesecure/vuln";
import set from "lodash.set";

import * as RC from "../config/internal/nsci.js";
import type { DependencyWarning } from "../lib/types";
import {
  pipeline,
  convertBooleanAsCheckResult,
  CheckableFunction,
  CheckResult,
  PipelineCheckFunctions,
  FAILING_CHECK
} from "../pipeline/index.js";

import { CompactedScannerPayload, extractScannerPayload } from "./extract.js";

function checkGlobalWarnings(
  warnings: GlobalWarning[]
): CheckableFunction<GlobalWarning> {
  return {
    result: convertBooleanAsCheckResult(warnings.length > 0),
    data: {
      key: "warnings",
      value: warnings
    }
  };
}

function checkDependenciesWarnings(
  warnings: DependencyWarning[],
  runtimeConfiguration: RC.Configuration
): CheckableFunction<DependencyWarning> {
  if (runtimeConfiguration.warnings === "off") {
    return {
      result: convertBooleanAsCheckResult(false),
      data: {
        key: "dependencies.warnings",
        value: []
      }
    };
  }

  if (
    runtimeConfiguration.warnings === "error" ||
    runtimeConfiguration.warnings === "warning"
  ) {
    const allDependencyWarnings = warnings.filter(
      (dependency) => dependency.warnings.length > 0
    );

    return {
      result:
        runtimeConfiguration.warnings === "error"
          ? convertBooleanAsCheckResult(allDependencyWarnings.length > 0)
          : convertBooleanAsCheckResult(false),
      data: {
        key: "dependencies.warnings",
        value: allDependencyWarnings
      }
    };
  }

  const causingErrorWarnings = new Set(
    Object.keys(runtimeConfiguration.warnings)
  );

  const errorOnlyWarnings = warnings
    .map((dependency) => {
      const errorWarnings = dependency.warnings.filter((dependencyWarning) =>
        causingErrorWarnings.has(dependencyWarning.kind)
      );

      return {
        ...dependency,
        warnings: errorWarnings
      };
    })
    .filter((collectedWarnings) => collectedWarnings.warnings.length > 0);

  return {
    result: convertBooleanAsCheckResult(errorOnlyWarnings.length > 0),
    data: {
      key: "dependencies.warnings",
      value: errorOnlyWarnings
    }
  };
}

function convertSeverityAsNumber(
  severity: Strategy.Severity | "all" | undefined
) {
  const severities = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
    info: 0,
    all: 0
  };

  if (severity !== undefined) {
    return severities[severity];
  }

  const DEFAULT_SEVERITY = 0;

  /**
   * When no severity is available on the dependency, which severity should
   * we affect as a default value?
   */
  return DEFAULT_SEVERITY;
}

/**
 * We must ensure that each vulnerability with equal or higher severity than
 * the one defined in the runtime configuration is caught.
 */
// eslint-disable-next-line id-length
function findAllVulnsWithEqualOrHigherSeverity(
  vulnerabilities: Strategy.StandardVulnerability[],
  severity: Strategy.Severity | "all"
): Strategy.StandardVulnerability[] {
  return vulnerabilities.filter(
    (vuln) =>
      convertSeverityAsNumber(vuln.severity) >=
      convertSeverityAsNumber(severity)
  );
}

function checkDependenciesVulns(
  vulnerabilities: Strategy.StandardVulnerability[],
  runtimeConfiguration: RC.Configuration
): CheckableFunction<Strategy.StandardVulnerability> {
  const { vulnerabilitySeverity } = runtimeConfiguration;

  const vulnsClassifiedBySeverity = findAllVulnsWithEqualOrHigherSeverity(
    vulnerabilities,
    vulnerabilitySeverity
  );

  return {
    result: convertBooleanAsCheckResult(vulnsClassifiedBySeverity.length > 0),
    data: {
      key: "dependencies.vulnerabilities",
      value: vulnsClassifiedBySeverity
    }
  };
}

export type OutcomePayloadFromPipelineChecks = {
  status: pipeline.Status;
  data: CompactedScannerPayload;
};

function interpretPayloadChecks(
  pipelineCheckFunctions: PipelineCheckFunctions
): OutcomePayloadFromPipelineChecks {
  const pipelineFunctionsResult = pipelineCheckFunctions.reduce<{
    checks: CheckResult[];
    data: CompactedScannerPayload;
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
      data: {} as CompactedScannerPayload
    }
  );

  const isGlobalCheckPassing =
    !pipelineFunctionsResult.checks.includes(FAILING_CHECK);

  return {
    status: pipeline.getOutcome(isGlobalCheckPassing),
    data: pipelineFunctionsResult.data
  };
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
  rc: RC.Configuration
): OutcomePayloadFromPipelineChecks {
  const { warnings, dependencies } = extractScannerPayload(payload);

  return interpretPayloadChecks([
    () => checkGlobalWarnings(warnings),
    () => checkDependenciesWarnings(dependencies.warnings, rc),
    () => checkDependenciesVulns(dependencies.vulnerabilities, rc)
  ]);
}
