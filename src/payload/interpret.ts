import { Scanner } from "@nodesecure/scanner";
import { Strategy } from "@nodesecure/vuln";
import set from "lodash.set";

import { RuntimeConfiguration } from "../nodesecurerc.js";
import { CompactedScannerPayload, extractScannerPayload } from "./extract.js";
import { DependencyWarning } from "../types/index.js";
import * as pipeline from "../pipeline.js";
import { GlobalWarning } from "@nodesecure/scanner/types/scanner";

type CheckableFunction<T> = {
  status: boolean;
  data: {
    key: string;
    value: T[];
  };
};

function checkGlobalWarnings(
  warnings: GlobalWarning[]
): CheckableFunction<GlobalWarning> {
  return {
    status: warnings.length > 0,
    data: {
      key: "warnings",
      value: warnings
    }
  };
}

function checkDependenciesWarnings(
  warnings: DependencyWarning[],
  _runtimeConfiguration: RuntimeConfiguration
): CheckableFunction<DependencyWarning> {
  /**
   * TODO: How should we use runtime configuration for dependencies warnings?
   * For now, each dependency warning is returned, whatever its type is.
   */
  const dependencyWarnings = warnings.filter(
    (dependency) => dependency.warnings.length > 0
  );

  return {
    status: dependencyWarnings.length > 0,
    data: {
      key: "dependencies.warnings",
      value: dependencyWarnings
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
  runtimeConfiguration: RuntimeConfiguration
): CheckableFunction<Strategy.StandardVulnerability> {
  const {
    vulnerabilities: { severity }
  } = runtimeConfiguration;

  const vulnsClassifiedBySeverity = findAllVulnsWithEqualOrHigherSeverity(
    vulnerabilities,
    severity
  );

  return {
    status: vulnsClassifiedBySeverity.length > 0,
    data: {
      key: "dependencies.vulnerabilities",
      value: vulnsClassifiedBySeverity
    }
  };
}

type PipelineCheckFunctions = Array<
  () => CheckableFunction<
    GlobalWarning | DependencyWarning | Strategy.StandardVulnerability
  >
>;

export type InterpretedPayload = {
  status: pipeline.Status;
  data: CompactedScannerPayload;
};

function interpretPayloadChecks(
  pipelineCheckFunctions: PipelineCheckFunctions
): InterpretedPayload {
  const FAILING_WARNING = true;
  const pipelineFunctionsResults = pipelineCheckFunctions.reduce<{
    status: boolean[];
    data: CompactedScannerPayload;
  }>(
    (accumulatedChecks, checkFunction) => {
      const { status, data } = checkFunction();

      set(accumulatedChecks.data, data.key, data.value);

      /**
       * Here, we accumulate an array of boolean Status returned by each Check
       * function, allowing us to easily verify if at least one function failed.
       * We also accumulate each data returned by the Check function, justifying
       * the given Status returned.
       */
      return {
        status: [...accumulatedChecks.status, status],
        data: {
          ...accumulatedChecks.data
        }
      };
    },
    {
      status: [],
      data: {} as CompactedScannerPayload
    }
  );

  const isCheckOk = !pipelineFunctionsResults.status.includes(FAILING_WARNING);

  return {
    status: pipeline.getStatus(isCheckOk),
    data: pipelineFunctionsResults.data
  };
}

/**
 * This interpreter accumulates each Check Function output in order to determine
 * a global pipeline status and a compacted version of the payload.
 * The "Status" is used to decide if the pipeline should fail or pass,
 * whereas the data is compacted in order to be easily reported by any type of
 * reporter (HTML, Console, etc).
 */
export function runPayloadInterpreter(
  payload: Scanner.Payload,
  rc: RuntimeConfiguration
): InterpretedPayload {
  const { warnings, dependencies } = extractScannerPayload(payload);

  return interpretPayloadChecks([
    () => checkGlobalWarnings(warnings),
    () => checkDependenciesWarnings(dependencies.warnings, rc),
    () => checkDependenciesVulns(dependencies.vulnerabilities, rc)
  ]);
}
