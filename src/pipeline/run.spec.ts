/* eslint-disable max-nested-callbacks */
import { Scanner } from "@nodesecure/scanner";
import { StandardVulnerability } from "@nodesecure/vuln/types/strategy";
import { expect } from "chai";

import * as RC from "../config/nodesecurerc.js";
import { runPayloadInterpreter } from "../payload/interpret.js";

import * as pipeline from "./status.js";

const DEFAULT_RUNTIME_CONFIGURATION: RC.Configuration = {
  rootDir: process.cwd(),
  strategy: RC.vulnStrategy.npm,
  reporters: [RC.reporterTarget.CONSOLE],
  vulnerabilitySeverity: RC.vulnSeverity.ALL,
  warnings: RC.warnings.ERROR
};

const DEFAULT_SCANNER_PAYLOAD: Scanner.Payload = {
  id: "1",
  rootDependencyName: "pkg",
  warnings: [],
  dependencies: {},
  scannerVersion: "1.0.0",
  vulnerabilityStrategy: "npm"
};

describe("Pipeline check workflow", () => {
  describe("When providing an empty payload", () => {
    it("should make the pipeline succeed", () => {
      const { status } = runPayloadInterpreter(
        DEFAULT_SCANNER_PAYLOAD,
        DEFAULT_RUNTIME_CONFIGURATION
      );

      expect(status).equals(pipeline.status.SUCCESS);
    });
  });

  describe("When providing a payload with global warnings", () => {
    it("should make the pipeline fail", () => {
      const scannerPayload: Scanner.Payload = {
        ...DEFAULT_SCANNER_PAYLOAD,
        warnings: [["warning1"], ["warning2"]]
      };

      const { status } = runPayloadInterpreter(
        scannerPayload,
        DEFAULT_RUNTIME_CONFIGURATION
      );

      expect(status).equals(pipeline.status.FAILURE);
    });
  });

  describe("When providing a payload with dependencies warnings", () => {
    describe("When using default runtime configuration", () => {
      it("should make the pipeline fail when atleast one warning is found", () => {
        const scannerPayload: Scanner.Payload = {
          ...DEFAULT_SCANNER_PAYLOAD,
          dependencies: {
            express: {
              // @ts-expect-error - we are not interested in providing metadata here
              metadata: {},
              versions: {
                "2.1.0": {
                  id: 1,
                  usedBy: {},
                  size: 0,
                  description: "",
                  author: "noone",
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
                  license: [],
                  flags: [],
                  gitUrl: null,
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
                  id: 1,
                  usedBy: {},
                  size: 0,
                  description: "",
                  author: "noone",
                  warnings: [
                    {
                      kind: "encoded-literal",
                      location: [
                        [0, 1],
                        [5, 0]
                      ]
                    }
                  ],
                  license: [],
                  flags: [],
                  gitUrl: null,
                  // @ts-expect-error - we are not interested in providing composition
                  composition: {}
                }
              },
              vulnerabilities: []
            }
          }
        };

        const { status } = runPayloadInterpreter(
          scannerPayload,
          DEFAULT_RUNTIME_CONFIGURATION
        );

        expect(status).equals(pipeline.status.FAILURE);
      });
    });

    describe("When providing a customized runtime configuration", () => {
      it("should make the pipeline pass when warnings are ignored", () => {
        const scannerPayload: Scanner.Payload = {
          ...DEFAULT_SCANNER_PAYLOAD,
          dependencies: {
            express: {
              // @ts-expect-error - we are not interested in providing metadata here
              metadata: {},
              versions: {
                "2.1.0": {
                  id: 1,
                  usedBy: {},
                  size: 0,
                  description: "",
                  author: "noone",
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
                  license: [],
                  flags: [],
                  gitUrl: null,
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
                  id: 1,
                  usedBy: {},
                  size: 0,
                  description: "",
                  author: "noone",
                  warnings: [
                    {
                      kind: "encoded-literal",
                      location: [
                        [0, 1],
                        [5, 0]
                      ]
                    }
                  ],
                  license: [],
                  flags: [],
                  gitUrl: null,
                  // @ts-expect-error - we are not interested in providing composition
                  composition: {}
                }
              },
              vulnerabilities: []
            }
          }
        };

        const { status, data } = runPayloadInterpreter(scannerPayload, {
          ...DEFAULT_RUNTIME_CONFIGURATION,
          warnings: RC.warnings.OFF
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

      describe("When atleast one warning configured on 'error' is met", () => {
        it("should make the pipeline fail", () => {
          const scannerPayload: Scanner.Payload = {
            ...DEFAULT_SCANNER_PAYLOAD,
            dependencies: {
              express: {
                // @ts-expect-error - we are not interested in providing metadata here
                metadata: {},
                versions: {
                  "2.1.0": {
                    id: 1,
                    usedBy: {},
                    size: 0,
                    description: "",
                    author: "noone",
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
                    license: [],
                    flags: [],
                    gitUrl: null,
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
                    id: 1,
                    usedBy: {},
                    size: 0,
                    description: "",
                    author: "noone",
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
                    license: [],
                    flags: [],
                    gitUrl: null,
                    // @ts-expect-error - we are not interested in providing composition
                    composition: {}
                  }
                },
                vulnerabilities: []
              }
            }
          };

          const { status, data } = runPayloadInterpreter(scannerPayload, {
            ...DEFAULT_RUNTIME_CONFIGURATION,
            warnings: {
              "encoded-literal": RC.warnings.ERROR
            }
          });

          expect(status).equals(pipeline.status.FAILURE);
          expect(data.dependencies.warnings).to.deep.equal([
            {
              package: "marker",
              warnings: [
                {
                  kind: "encoded-literal",
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
      } as unknown as StandardVulnerability;

      const scannerPayload: Scanner.Payload = {
        ...DEFAULT_SCANNER_PAYLOAD,
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
        DEFAULT_RUNTIME_CONFIGURATION
      );

      expect(data.dependencies.vulnerabilities.length).eq(0);
    });

    describe("When providing default runtime configuration", () => {
      describe("When there is atleast one vulnerability found regardless of its severity", () => {
        it("should make the pipeline fail", () => {
          const scannerPayload: Scanner.Payload = {
            ...DEFAULT_SCANNER_PAYLOAD,
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
            DEFAULT_RUNTIME_CONFIGURATION
          );

          expect(status).equals(pipeline.status.FAILURE);
        });
      });
    });

    describe("When providing customized runtime configuration affecting vulnerabilities", () => {
      describe("When dealing with vulnerabilities with lower severities than the configured threshold", () => {
        it("should make the pipeline succeed with no returned data", () => {
          const scannerPayload: Scanner.Payload = {
            ...DEFAULT_SCANNER_PAYLOAD,
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
            ...DEFAULT_RUNTIME_CONFIGURATION,
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
            ...DEFAULT_SCANNER_PAYLOAD,
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
            ...DEFAULT_RUNTIME_CONFIGURATION,
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
            ...DEFAULT_SCANNER_PAYLOAD,
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
            ...DEFAULT_RUNTIME_CONFIGURATION,
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
