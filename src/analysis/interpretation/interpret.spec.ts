// Import Third-party Dependencies
import { Scanner } from "@nodesecure/scanner";
import { Strategy } from "@nodesecure/vuln";
import { expect } from "chai";

// Import Internal Dependencies
import {
  IgnorePatterns,
  WarningEntries
} from "../../configuration/external/nodesecure/ignore-file";
import { Nsci } from "../../configuration/standard/index.js";
import * as pipeline from "../../reporting/status.js";

import { runPayloadInterpreter } from "./interpret.js";

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

        expect(status).equals(pipeline.status.SUCCESS);
      });
    });

    describe("When providing a payload with global warnings", () => {
      it("should make the pipeline fail", () => {
        const scannerPayload: Scanner.Payload = {
          ...kDefaultScannerPayload,
          warnings: [["warning1"], ["warning2"]]
        };

        const { status } = runPayloadInterpreter(
          scannerPayload,
          kDefaultRuntimeConfiguration
        );

        expect(status).equals(pipeline.status.FAILURE);
      });
    });

    describe("When providing a payload with dependencies warnings", () => {
      describe("When using default runtime configuration", () => {
        it("should make the pipeline fail when atleast one warning is found", () => {
          const scannerPayload: Scanner.Payload = {
            ...kDefaultScannerPayload,
            dependencies: {
              "ts-pattern": {
                // @ts-expect-error - we are not interested in providing metadata here
                metadata: {},
                versions: {
                  "2.1.0": {
                    warnings: [],
                    // @ts-expect-error - we are not interested in providing composition
                    composition: {}
                  }
                },
                vulnerabilities: []
              },
              express: {
                // @ts-expect-error - we are not interested in providing metadata here
                metadata: {},
                versions: {
                  "2.1.0": {
                    warnings: [
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
                          [0, 1],
                          [5, 0]
                        ]
                      }
                    ],
                    // @ts-expect-error - we are not interested in providing composition
                    composition: {}
                  }
                },
                vulnerabilities: []
              },
              marker: {
                // @ts-expect-error - we are not interested in providing metadata here
                metadata: {},
                versions: {
                  "1.0.5": {
                    warnings: [
                      {
                        kind: "encoded-literal",
                        location: [
                          [0, 1],
                          [5, 0]
                        ]
                      }
                    ],
                    // @ts-expect-error - we are not interested in providing composition
                    composition: {}
                  }
                },
                vulnerabilities: []
              }
            }
          };

          const { status, data } = runPayloadInterpreter(
            scannerPayload,
            kDefaultRuntimeConfiguration
          );

          expect(status).equals(pipeline.status.FAILURE);
          expect(data).to.deep.equal({
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
                        [0, 1],
                        [5, 0]
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
                        [0, 1],
                        [5, 0]
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
            dependencies: {
              express: {
                // @ts-expect-error - we are not interested in providing metadata here
                metadata: {},
                versions: {
                  "2.1.0": {
                    warnings: [
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
                          [0, 1],
                          [5, 0]
                        ]
                      }
                    ],
                    // @ts-expect-error - we are not interested in providing composition
                    composition: {}
                  }
                },
                vulnerabilities: []
              },
              marker: {
                // @ts-expect-error - we are not interested in providing metadata here
                metadata: {},
                versions: {
                  "1.0.5": {
                    warnings: [
                      {
                        kind: "encoded-literal",
                        location: [
                          [0, 1],
                          [5, 0]
                        ]
                      }
                    ],
                    // @ts-expect-error - we are not interested in providing composition
                    composition: {}
                  }
                },
                vulnerabilities: []
              }
            }
          };

          const { status, data } = runPayloadInterpreter(scannerPayload, {
            ...kDefaultRuntimeConfiguration,
            warnings: Nsci.warnings.OFF
          });

          expect(status).equals(pipeline.status.SUCCESS);
          expect(data).to.deep.equal({
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
                dependencies: {
                  express: {
                    // @ts-expect-error - we are not interested in providing metadata here
                    metadata: {},
                    versions: {
                      "2.1.0": {
                        warnings: [
                          {
                            kind: "unsafe-assign",
                            location: [
                              [0, 1],
                              [5, 0]
                            ]
                          },
                          {
                            kind: "obfuscated-code",
                            location: [
                              [0, 1],
                              [5, 0]
                            ]
                          }
                        ],
                        // @ts-expect-error - we are not interested in providing composition
                        composition: {}
                      }
                    },
                    vulnerabilities: []
                  },
                  marker: {
                    // @ts-expect-error - we are not interested in providing metadata here
                    metadata: {},
                    versions: {
                      "1.0.5": {
                        warnings: [
                          {
                            kind: "encoded-literal",
                            location: [
                              [0, 1],
                              [5, 0]
                            ]
                          },
                          {
                            kind: "obfuscated-code",
                            location: [
                              [0, 1],
                              [5, 0]
                            ]
                          }
                        ],
                        // @ts-expect-error - we are not interested in providing composition
                        composition: {}
                      }
                    },
                    vulnerabilities: []
                  }
                }
              };

              const { status, data } = runPayloadInterpreter(scannerPayload, {
                ...kDefaultRuntimeConfiguration,
                // @ts-expect-error - voluntary partial warnings
                warnings: {
                  "encoded-literal": Nsci.warnings.ERROR,
                  "obfuscated-code": Nsci.warnings.ERROR,
                  "unsafe-assign": Nsci.warnings.WARNING
                }
              });

              expect(status).equals(pipeline.status.FAILURE);
              expect(data.dependencies.warnings).to.deep.equal([
                {
                  package: "express",
                  warnings: [
                    {
                      mode: "warning",
                      kind: "unsafe-assign",
                      location: [
                        [0, 1],
                        [5, 0]
                      ]
                    },
                    {
                      mode: "error",
                      kind: "obfuscated-code",
                      location: [
                        [0, 1],
                        [5, 0]
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
                        [0, 1],
                        [5, 0]
                      ]
                    },
                    {
                      mode: "error",
                      kind: "obfuscated-code",
                      location: [
                        [0, 1],
                        [5, 0]
                      ]
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
                dependencies: {
                  express: {
                    // @ts-expect-error - we are not interested in providing metadata here
                    metadata: {},
                    versions: {
                      "2.1.0": {
                        warnings: [
                          {
                            kind: "unsafe-assign",
                            location: [
                              [0, 1],
                              [5, 0]
                            ]
                          },
                          {
                            kind: "obfuscated-code",
                            location: [
                              [0, 1],
                              [5, 0]
                            ]
                          }
                        ],
                        // @ts-expect-error - we are not interested in providing composition
                        composition: {}
                      }
                    },
                    vulnerabilities: []
                  },
                  marker: {
                    // @ts-expect-error - we are not interested in providing metadata here
                    metadata: {},
                    versions: {
                      "1.0.5": {
                        warnings: [
                          {
                            kind: "encoded-literal",
                            location: [
                              [0, 1],
                              [5, 0]
                            ]
                          },
                          {
                            kind: "obfuscated-code",
                            location: [
                              [0, 1],
                              [5, 0]
                            ]
                          }
                        ],
                        // @ts-expect-error - we are not interested in providing composition
                        composition: {}
                      }
                    },
                    vulnerabilities: []
                  }
                }
              };

              const { status, data } = runPayloadInterpreter(scannerPayload, {
                ...kDefaultRuntimeConfiguration,
                // @ts-expect-error - voluntary partial warnings
                warnings: {
                  "encoded-literal": Nsci.warnings.OFF,
                  "unsafe-assign": Nsci.warnings.WARNING,
                  "obfuscated-code": Nsci.warnings.WARNING
                }
              });

              expect(status).equals(pipeline.status.SUCCESS);
              expect(data.dependencies.warnings).to.deep.equal([
                {
                  package: "express",
                  warnings: [
                    {
                      mode: "warning",
                      kind: "unsafe-assign",
                      location: [
                        [0, 1],
                        [5, 0]
                      ]
                    },
                    {
                      mode: "warning",
                      kind: "obfuscated-code",
                      location: [
                        [0, 1],
                        [5, 0]
                      ]
                    }
                  ]
                },
                {
                  package: "marker",
                  warnings: [
                    {
                      mode: "warning",
                      kind: "obfuscated-code",
                      location: [
                        [0, 1],
                        [5, 0]
                      ]
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
          dependencies: {
            express: {
              // @ts-expect-error - we are not interested in metadata
              metadata: {},
              versions: {},
              vulnerabilities: [unprocessableVulnerability]
            }
          }
        };

        const { data } = runPayloadInterpreter(
          scannerPayload,
          kDefaultRuntimeConfiguration
        );

        expect(data.dependencies.vulnerabilities.length).eq(0);
      });

      describe("When providing default runtime configuration", () => {
        describe("When there is atleast one vulnerability found regardless of its severity", () => {
          it("should make the pipeline fail", () => {
            const scannerPayload: Scanner.Payload = {
              ...kDefaultScannerPayload,
              dependencies: {
                express: {
                  // @ts-expect-error - we are not interested in metadata
                  metadata: {},
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
              }
            };

            const { status } = runPayloadInterpreter(
              scannerPayload,
              kDefaultRuntimeConfiguration
            );

            expect(status).equals(pipeline.status.FAILURE);
          });
        });
      });

      describe("When providing an .nodesecureignore file", () => {
        it("should not return ignored warnings", () => {
          const ignorePatterns = createIgnorePatternsWith({
            "unsafe-assign": ["express"]
          });
          const scannerPayload: Scanner.Payload = createScannerPayloadWith({
            express: ["unsafe-assign"]
          });

          const { status, data } = runPayloadInterpreter(scannerPayload, {
            ...kDefaultRuntimeConfiguration,
            ignorePatterns
          });

          expect(data.dependencies.warnings).to.deep.equal([]);
          expect(status).equals(pipeline.status.SUCCESS);
        });

        it("should return not ignored warnings", () => {
          const ignorePatterns = createIgnorePatternsWith({
            "weak-crypto": ["express"]
          });
          const scannerPayload: Scanner.Payload = createScannerPayloadWith({
            express: ["unsafe-assign"]
          });

          const { status, data } = runPayloadInterpreter(scannerPayload, {
            ...kDefaultRuntimeConfiguration,
            ignorePatterns
          });

          expect(data.dependencies.warnings.length).to.above(0);
          expect(status).equals(pipeline.status.FAILURE);
        });
      });

      describe("When providing customized runtime configuration affecting vulnerabilities", () => {
        describe("When dealing with vulnerabilities with lower severities than the configured threshold", () => {
          it("should make the pipeline succeed with no returned data", () => {
            const scannerPayload: Scanner.Payload = {
              ...kDefaultScannerPayload,
              dependencies: {
                express: {
                  // @ts-expect-error - we are not interested in metadata
                  metadata: {},
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
              }
            };

            const { status, data } = runPayloadInterpreter(scannerPayload, {
              ...kDefaultRuntimeConfiguration,
              vulnerabilitySeverity: "high"
            });

            expect(status).equals(pipeline.status.SUCCESS);
            expect(data).to.deep.equal({
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
              dependencies: {
                express: {
                  // @ts-expect-error - we are not interested in metadata
                  metadata: {},
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
              }
            };

            const { status, data } = runPayloadInterpreter(scannerPayload, {
              ...kDefaultRuntimeConfiguration,
              vulnerabilitySeverity: "all"
            });

            expect(status).equals(pipeline.status.FAILURE);
            expect(data.dependencies.vulnerabilities[0]).to.deep.equal({
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
              dependencies: {
                express: {
                  // @ts-expect-error - we are not interested in metadata
                  metadata: {},
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
              }
            };

            const { status, data } = runPayloadInterpreter(scannerPayload, {
              ...kDefaultRuntimeConfiguration,
              vulnerabilitySeverity: "high"
            });

            expect(status).equals(pipeline.status.FAILURE);
            expect(data.dependencies.vulnerabilities.length).to.equal(1);
            expect(data.dependencies.vulnerabilities[0]).to.deep.equal({
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
            metadata: {} as any,
            versions: {
              // @ts-expect-error
              "2.1.0": {
                warnings: warns.map((warn: string) => {
                  return {
                    kind: warn,
                    location: [
                      [0, 1],
                      [5, 0]
                    ]
                  };
                }),
                composition: {} as any
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
