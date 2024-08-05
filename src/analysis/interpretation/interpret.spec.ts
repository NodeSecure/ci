// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import * as JSXRay from "@nodesecure/js-x-ray";
import * as Scanner from "@nodesecure/scanner";
import { Strategy } from "@nodesecure/vuln";

// Import Internal Dependencies
import {
  IgnorePatterns,
  WarningEntries
} from "../../configuration/external/nodesecure/ignore-file";
import { Nsci } from "../../configuration/standard/index.js";
import { WarningMode, Warnings } from "../../configuration/standard/nsci.js";
import * as pipeline from "../../reporting/status.js";
import { DeepPartialRecord } from "../../types";

import { runPayloadInterpreter } from "./interpret.js";
import { DependencyWarningWithMode } from "./warnings.js";

// CONSTANTS
const kDefaultRuntimeConfiguration: Nsci.Configuration = {
  rootDir: process.cwd(),
  strategy: Nsci.vulnStrategy.npm,
  reporters: [Nsci.reporterTarget.CONSOLE],
  vulnerabilitySeverity: Nsci.vulnSeverity.ALL,
  warnings: Nsci.warnings.ERROR,
  ignorePatterns: IgnorePatterns.default()
};

const kDefaultScannerPayload: Scanner.Payload = {
  id: "1",
  rootDependencyName: "pkg",
  warnings: [],
  dependencies: {},
  highlighted: {
    contacts: []
  },
  scannerVersion: "1.0.0",
  vulnerabilityStrategy: "npm"
};

/* eslint-disable max-nested-callbacks */
describe("Pipeline check workflow", () => {
  describe("When running the payload interpreter", () => {
    describe("When providing an empty payload", () => {
      it("should make the pipeline succeed", () => {
        const { status } = runPayloadInterpreter(
          kDefaultScannerPayload,
          kDefaultRuntimeConfiguration
        );

        expectNsciPipelineToBeSuccessful(status);
      });
    });

    describe("When providing a payload with global warnings", () => {
      it("should make the pipeline fail", () => {
        const scannerPayload: Scanner.Payload = {
          ...kDefaultScannerPayload,
          warnings: ["warning1", "warning2"]
        };

        const { status } = runPayloadInterpreter(
          scannerPayload,
          kDefaultRuntimeConfiguration
        );

        assert.equal(status, pipeline.status.FAILURE);
      });
    });

    describe("When providing a payload with dependencies warnings", () => {
      describe("When using default runtime configuration", () => {
        it("should make the pipeline fail when atleast one warning is found", () => {
          const scannerPayload: Scanner.Payload = {
            ...kDefaultScannerPayload,
            dependencies: makePartialScannerDependencies({
              "ts-pattern": {
                versions: {
                  "2.1.0": {
                    warnings: []
                  }
                },
                vulnerabilities: []
              },
              express: {
                versions: {
                  "2.1.0": {
                    warnings: makePartialJSXRayWarnings([
                      {
                        kind: "obfuscated-code",
                        location: [
                          [0, 1],
                          [5, 0]
                        ]
                      },
                      {
                        kind: "obfuscated-code",
                        location: [
                          [2, 5],
                          [5, 3]
                        ]
                      }
                    ])
                  }
                },
                vulnerabilities: []
              },
              marker: {
                versions: {
                  "1.0.5": {
                    warnings: makePartialJSXRayWarnings([
                      {
                        kind: "encoded-literal",
                        location: [
                          [1, 1],
                          [5, 9]
                        ]
                      }
                    ])
                  }
                },
                vulnerabilities: []
              }
            })
          };

          const { status, data } = runPayloadInterpreter(
            scannerPayload,
            kDefaultRuntimeConfiguration
          );

          assert.equal(status, pipeline.status.FAILURE);
          assert.deepEqual(data, {
            warnings: [],
            dependencies: {
              vulnerabilities: [],
              warnings: [
                {
                  package: "express",
                  warnings: [
                    {
                      mode: "error",
                      kind: "obfuscated-code",
                      location: [
                        [0, 1],
                        [5, 0]
                      ]
                    },
                    {
                      mode: "error",
                      kind: "obfuscated-code",
                      location: [
                        [2, 5],
                        [5, 3]
                      ]
                    }
                  ]
                },
                {
                  package: "marker",
                  warnings: [
                    {
                      mode: "error",
                      kind: "encoded-literal",
                      location: [
                        [1, 1],
                        [5, 9]
                      ]
                    }
                  ]
                }
              ]
            }
          });
        });
      });

      describe("When providing a customized runtime configuration", () => {
        it("should make the pipeline pass when warnings are ignored", () => {
          const scannerPayload: Scanner.Payload = {
            ...kDefaultScannerPayload,
            dependencies: makePartialScannerDependencies({
              express: {
                versions: {
                  "2.1.0": {
                    warnings: makePartialJSXRayWarnings([
                      {
                        kind: "obfuscated-code"
                      },
                      {
                        kind: "obfuscated-code"
                      }
                    ])
                  }
                },
                vulnerabilities: []
              },
              marker: {
                versions: {
                  "1.0.5": {
                    warnings: makePartialJSXRayWarnings([
                      {
                        kind: "encoded-literal"
                      }
                    ])
                  }
                },
                vulnerabilities: []
              }
            })
          };

          const { status, data } = runPayloadInterpreter(scannerPayload, {
            ...kDefaultRuntimeConfiguration,
            warnings: Nsci.warnings.OFF
          });

          expectNsciPipelineToBeSuccessful(status);
          assert.deepEqual(data, {
            warnings: [],
            dependencies: {
              vulnerabilities: [],
              warnings: []
            }
          });
        });

        describe("When atleast one warning is met", () => {
          describe("When one warning configured on 'error' is met", () => {
            it("should make the pipeline fail with the 'error' warnings", () => {
              const scannerPayload: Scanner.Payload = {
                ...kDefaultScannerPayload,
                dependencies: makePartialScannerDependencies({
                  express: {
                    versions: {
                      "2.1.0": {
                        warnings: makePartialJSXRayWarnings([
                          {
                            kind: "unsafe-import"
                          },
                          {
                            kind: "obfuscated-code"
                          }
                        ])
                      }
                    },
                    vulnerabilities: []
                  },
                  marker: {
                    versions: {
                      "1.0.5": {
                        warnings: makePartialJSXRayWarnings([
                          {
                            kind: "encoded-literal"
                          },
                          {
                            kind: "obfuscated-code"
                          }
                        ])
                      }
                    },
                    vulnerabilities: []
                  }
                })
              };

              const { status, data } = runPayloadInterpreter(scannerPayload, {
                ...kDefaultRuntimeConfiguration,
                warnings: {
                  "encoded-literal": Nsci.warnings.ERROR,
                  "obfuscated-code": Nsci.warnings.ERROR,
                  "unsafe-import": Nsci.warnings.WARNING
                } as Warnings
              });

              assert.equal(status, pipeline.status.FAILURE);

              expectNsciPayloadToHaveWarnings(data.dependencies.warnings, [
                {
                  package: "express",
                  warnings: [
                    {
                      mode: "warning",
                      kind: "unsafe-import"
                    },
                    {
                      mode: "error",
                      kind: "obfuscated-code"
                    }
                  ]
                },
                {
                  package: "marker",
                  warnings: [
                    {
                      mode: "error",
                      kind: "encoded-literal"
                    },
                    {
                      mode: "error",
                      kind: "obfuscated-code"
                    }
                  ]
                }
              ]);
            });
          });

          describe("Whenever a warning configured on 'warning' or 'off' is met", () => {
            it("should make the pipeline succeed with the 'warning' warnings", () => {
              const scannerPayload: Scanner.Payload = {
                ...kDefaultScannerPayload,
                dependencies: makePartialScannerDependencies({
                  express: {
                    versions: {
                      "2.1.0": {
                        warnings: makePartialJSXRayWarnings([
                          {
                            kind: "unsafe-stmt"
                          },
                          {
                            kind: "obfuscated-code"
                          }
                        ])
                      }
                    },
                    vulnerabilities: []
                  },
                  marker: {
                    versions: {
                      "1.0.5": {
                        warnings: makePartialJSXRayWarnings([
                          {
                            kind: "encoded-literal"
                          },
                          {
                            kind: "obfuscated-code"
                          }
                        ])
                      }
                    },
                    vulnerabilities: []
                  }
                })
              };

              const { status, data } = runPayloadInterpreter(scannerPayload, {
                ...kDefaultRuntimeConfiguration,
                warnings: {
                  "encoded-literal": Nsci.warnings.OFF,
                  "unsafe-stmt": Nsci.warnings.WARNING,
                  "obfuscated-code": Nsci.warnings.WARNING
                } as Warnings
              });

              expectNsciPipelineToBeSuccessful(status);
              expectNsciPayloadToHaveWarnings(data.dependencies.warnings, [
                {
                  package: "express",
                  warnings: [
                    {
                      mode: "warning",
                      kind: "unsafe-stmt"
                    },
                    {
                      mode: "warning",
                      kind: "obfuscated-code"
                    }
                  ]
                },
                {
                  package: "marker",
                  warnings: [
                    {
                      mode: "warning",
                      kind: "obfuscated-code"
                    }
                  ]
                }
              ]);
            });
          });
        });
      });
    });

    describe("When providing a payload with dependencies vulnerabilities", () => {
      it("should filter unprocessable vulnerabilities", () => {
        const unprocessableVulnerability = {
          id: undefined,
          origin: "npm",
          package: undefined,
          title: undefined,
          url: undefined,
          severity: undefined,
          vulnerableRanges: [],
          vulnerableVersions: []
        } as unknown as Strategy.StandardVulnerability;

        const scannerPayload: Scanner.Payload = {
          ...kDefaultScannerPayload,
          dependencies: makePartialScannerDependencies({
            express: {
              versions: {},
              vulnerabilities: [unprocessableVulnerability]
            }
          })
        };

        const { data } = runPayloadInterpreter(
          scannerPayload,
          kDefaultRuntimeConfiguration
        );

        assert.equal(data.dependencies.vulnerabilities.length, 0);
      });

      describe("When providing default runtime configuration", () => {
        describe("When there is atleast one vulnerability found regardless of its severity", () => {
          it("should make the pipeline fail", () => {
            const scannerPayload: Scanner.Payload = {
              ...kDefaultScannerPayload,
              dependencies: makePartialScannerDependencies({
                express: {
                  versions: {},
                  vulnerabilities: [
                    {
                      origin: "npm",
                      package: "express",
                      title: "Vuln...",
                      cves: [],
                      vulnerableRanges: [],
                      vulnerableVersions: []
                    }
                  ]
                }
              })
            };

            const { status } = runPayloadInterpreter(
              scannerPayload,
              kDefaultRuntimeConfiguration
            );

            assert.equal(status, pipeline.status.FAILURE);
          });
        });
      });

      describe("When providing an .nodesecureignore file", () => {
        it("should not return ignored warnings", () => {
          const ignorePatterns = createIgnorePatternsWith({
            "unsafe-stmt": ["express"]
          });
          const scannerPayload: Scanner.Payload = createScannerPayloadWith({
            express: ["unsafe-stmt"]
          });

          const { status, data } = runPayloadInterpreter(scannerPayload, {
            ...kDefaultRuntimeConfiguration,
            ignorePatterns
          });

          assert.deepEqual(data.dependencies.warnings, []);
          expectNsciPipelineToBeSuccessful(status);
        });

        it("should return not ignored warnings", () => {
          const ignorePatterns = createIgnorePatternsWith({
            "weak-crypto": ["express"]
          });
          const scannerPayload: Scanner.Payload = createScannerPayloadWith({
            express: ["unsafe-stmt"]
          });

          const { status, data } = runPayloadInterpreter(scannerPayload, {
            ...kDefaultRuntimeConfiguration,
            ignorePatterns
          });

          assert.ok(data.dependencies.warnings.length > 0);
          expectNsciPipelineToFail(status);
        });
      });

      describe("When providing customized runtime configuration affecting vulnerabilities", () => {
        describe("When dealing with vulnerabilities with lower severities than the configured threshold", () => {
          it("should make the pipeline succeed with no returned data", () => {
            const scannerPayload: Scanner.Payload = {
              ...kDefaultScannerPayload,
              dependencies: makePartialScannerDependencies({
                express: {
                  versions: {},
                  vulnerabilities: [
                    {
                      origin: "npm",
                      package: "express",
                      title: "Vuln...",
                      cves: [],
                      vulnerableRanges: [],
                      vulnerableVersions: []
                    }
                  ]
                }
              })
            };

            const { status, data } = runPayloadInterpreter(scannerPayload, {
              ...kDefaultRuntimeConfiguration,
              vulnerabilitySeverity: "high"
            });

            expectNsciPipelineToBeSuccessful(status);
            assert.deepEqual(data, {
              warnings: [],
              dependencies: {
                vulnerabilities: [],
                warnings: []
              }
            });
          });
        });

        describe("When dealing with vulnerabilities with higher severities than the configured threshold", () => {
          it("should make the pipeline fail for any given vulnerability found", () => {
            const scannerPayload: Scanner.Payload = {
              ...kDefaultScannerPayload,
              dependencies: makePartialScannerDependencies({
                express: {
                  versions: {},
                  vulnerabilities: [
                    {
                      origin: "npm",
                      package: "express",
                      title: "Vuln...",
                      cves: [],
                      severity: "medium",
                      vulnerableRanges: [],
                      vulnerableVersions: []
                    }
                  ]
                }
              })
            };

            const { status, data } = runPayloadInterpreter(scannerPayload, {
              ...kDefaultRuntimeConfiguration,
              vulnerabilitySeverity: "all"
            });

            expectNsciPipelineToFail(status);
            assert.deepEqual(data.dependencies.vulnerabilities[0], {
              origin: "npm",
              package: "express",
              title: "Vuln...",
              cves: [],
              severity: "medium",
              vulnerableRanges: [],
              vulnerableVersions: []
            });
          });

          it("should make the pipeline fail with severities higher than configured threshold", () => {
            const scannerPayload: Scanner.Payload = {
              ...kDefaultScannerPayload,
              dependencies: makePartialScannerDependencies({
                express: {
                  versions: {},
                  vulnerabilities: [
                    {
                      origin: "npm",
                      package: "express",
                      title: "Express vuln that should not be ignored",
                      cves: [],
                      severity: "critical",
                      vulnerableRanges: [],
                      vulnerableVersions: []
                    },
                    {
                      origin: "npm",
                      package: "marker",
                      title: "Marker vuln that should be ignored",
                      cves: [],
                      severity: "medium",
                      vulnerableRanges: [],
                      vulnerableVersions: []
                    }
                  ]
                }
              })
            };

            const { status, data } = runPayloadInterpreter(scannerPayload, {
              ...kDefaultRuntimeConfiguration,
              vulnerabilitySeverity: "high"
            });

            expectNsciPipelineToFail(status);
            assert.equal(data.dependencies.vulnerabilities.length, 1);
            assert.deepEqual(data.dependencies.vulnerabilities[0], {
              origin: "npm",
              package: "express",
              title: "Express vuln that should not be ignored",
              cves: [],
              severity: "critical",
              vulnerableRanges: [],
              vulnerableVersions: []
            });
          });
        });
      });
    });
  });
});

// /////////////////
// // HELPERS //////
// /////////////////

function createIgnorePatternsWith(
  warningsEntries: WarningEntries
): IgnorePatterns {
  return new IgnorePatterns(warningsEntries);
}

type SimplifiedWarningEntries = Record<string, string[]>;

function createScannerPayloadWith(
  warnings: SimplifiedWarningEntries
): Scanner.Payload {
  const scannerPayload: Scanner.Payload = {
    ...kDefaultScannerPayload,
    dependencies: {
      ...Object.entries(warnings).reduce(
        (
          acc: Record<string, Scanner.Dependency>,
          [pkg, warns]: [string, string[]]
        ) => {
          acc[pkg] = {
            versions: {
              "2.1.0": {
                // @ts-expect-error
                warnings: warns.map((warn: string) => {
                  return {
                    kind: warn,
                    location: [
                      [0, 1],
                      [5, 0]
                    ]
                  };
                })
              }
            },
            vulnerabilities: []
          };

          return acc;
        },
        {}
      )
    }
  };

  return scannerPayload;
}

function makePartialJSXRayWarnings(
  warnings: Partial<JSXRay.Warning>[]
): JSXRay.Warning[] {
  return warnings.map((warning) => {
    return {
      ...warning,
      location: warning.location || [
        [0, 0],
        [0, 0]
      ]
    };
  }) as JSXRay.Warning[];
}

function makePartialScannerDependencies(
  dependencies: Record<string, DeepPartialRecord<Scanner.Dependency>>
): Record<string, Scanner.Dependency> {
  return dependencies as Record<string, Scanner.Dependency>;
}

function expectNsciPipelineToBeSuccessful(status: pipeline.Status): void {
  assert.equal(status, pipeline.status.SUCCESS);
}

function expectNsciPipelineToFail(status: pipeline.Status): void {
  assert.equal(status, pipeline.status.FAILURE);
}

function expectNsciPayloadToHaveWarnings(
  payloadWarnings: DependencyWarningWithMode[],
  simplifiedWarnings: {
    package: string;
    warnings: (Partial<JSXRay.Warning> & {
      mode: WarningMode;
      kind: JSXRay.WarningName;
    })[];
  }[]
): void {
  const warnings = simplifiedWarnings.map((simplifiedWarning) => {
    return {
      package: simplifiedWarning.package,
      warnings: simplifiedWarning.warnings.map((warning) => {
        return {
          mode: warning.mode,
          kind: warning.kind,
          location: warning.location ?? [
            [0, 0],
            [0, 0]
          ]
        };
      })
    };
  });

  assert.deepEqual(payloadWarnings, warnings);
}
