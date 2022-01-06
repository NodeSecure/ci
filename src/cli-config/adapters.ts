import * as RC from "../nodesecurerc.js";

function isValidReporter(reporter: string): reporter is RC.ReporterTarget {
  return Object.values(RC.reporterTarget).includes(
    reporter as RC.ReporterTarget
  );
}

export function adaptReporters(reporters: string): RC.ReporterTarget[] {
  return reporters.replace(/\s/g, "").split(",").filter(isValidReporter);
}

function isValidWarnings(inputWarnings: string): inputWarnings is RC.Warnings {
  return Object.values(RC.warnings).includes(inputWarnings as RC.Warnings);
}

export function adaptWarnings(warnings: string): RC.Warnings {
  if (isValidWarnings(warnings)) {
    return warnings;
  }

  return RC.warnings.ERROR;
}

function isValidStrategy(strategy: string): strategy is RC.InputStrategy {
  const validStrategies = Object.keys(RC.vulnStrategy);

  return validStrategies.includes(strategy);
}

export function adaptStrategy(strategy: string): RC.Strategy {
  if (isValidStrategy(strategy)) {
    return RC.vulnStrategy[strategy];
  }

  return RC.vulnStrategy.npm;
}

function isValidSeverity(threshold: string): threshold is RC.Severity {
  return Object.values(RC.vulnSeverity).includes(threshold as RC.Severity);
}

export function adaptSeverity(vulnerabilityThreshold: string): RC.Severity {
  if (isValidSeverity(vulnerabilityThreshold)) {
    return vulnerabilityThreshold;
  }

  return RC.vulnSeverity.ALL;
}
