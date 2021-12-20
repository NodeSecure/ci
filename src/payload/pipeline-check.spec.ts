/* eslint-disable max-nested-callbacks */
import { Scanner } from "@nodesecure/scanner";
import { expect } from "chai";

import { DEFAULT_RUNTIME_CONFIGURATION } from "../nodesecurerc.js";
import { pipelineStatus } from "../pipeline.js";
import { runPayloadInterpreter } from "./interpret.js";

describe("@nodesecure/ci pipeline checker", () => {
  describe("When providing an empty payload", () => {
    it("should make the pipeline succeed", () => {
      const scannerPayload: Scanner.Payload = {
        id: "1",
        rootDependencyName: "pkg",
        warnings: [],
        dependencies: {},
        version: "1.0.0",
        vulnerabilityStrategy: "npm"
      };

      const { status } = runPayloadInterpreter(
        scannerPayload,
        DEFAULT_RUNTIME_CONFIGURATION
      );
      expect(status).equals(pipelineStatus.SUCCESS);
    });
  });

  describe("When providing a payload with global warnings", () => {
    it("should make the pipeline fail", () => {
      const scannerPayload: Scanner.Payload = {
        id: "1",
        rootDependencyName: "pkg",
        // @ts-expect-error - improve d.ts file
        warnings: ["A", "B"],
        dependencies: {},
        version: "1.0.0",
        vulnerabilityStrategy: "npm"
      };

      const { status } = runPayloadInterpreter(
        scannerPayload,
        DEFAULT_RUNTIME_CONFIGURATION
      );
      expect(status).equals(pipelineStatus.FAILURE);
    });
  });

  describe("When providing a payload with dependencies warnings", () => {
    describe("When providing default runtime configuration", () => {
      it("should make the pipeline fail", () => {
        const scannerPayload: Scanner.Payload = {
          id: "1",
          rootDependencyName: "pkg",
          warnings: [],
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
          },
          version: "1.0.0",
          vulnerabilityStrategy: "npm"
        };

        const { status } = runPayloadInterpreter(
          scannerPayload,
          DEFAULT_RUNTIME_CONFIGURATION
        );
        expect(status).equals(pipelineStatus.FAILURE);
      });
    });
  });

  describe("When providing a payload with dependencies vulnerabilities", () => {
    describe("When providing default runtime configuration", () => {
      it("should make the pipeline fail", () => {
        const scannerPayload: Scanner.Payload = {
          id: "1",
          rootDependencyName: "pkg",
          warnings: [],
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
          },
          version: "1.0.0",
          vulnerabilityStrategy: "npm"
        };

        const { status } = runPayloadInterpreter(
          scannerPayload,
          DEFAULT_RUNTIME_CONFIGURATION
        );
        expect(status).equals(pipelineStatus.FAILURE);
      });
    });

    describe("When providing customized runtime configuration affecting vulnerabilities", () => {
      it("should make the pipeline succeed with no returned data", () => {
        const scannerPayload: Scanner.Payload = {
          id: "1",
          rootDependencyName: "pkg",
          warnings: [],
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
          },
          version: "1.0.0",
          vulnerabilityStrategy: "npm"
        };

        const { status, data } = runPayloadInterpreter(scannerPayload, {
          ...DEFAULT_RUNTIME_CONFIGURATION,
          vulnerabilities: {
            severity: "high"
          }
        });

        expect(status).equals(pipelineStatus.SUCCESS);
        expect(data).to.deep.equal({
          warnings: [],
          dependencies: {
            vulnerabilities: [],
            warnings: []
          }
        });
      });

      describe("When providing vulnerabilities with higher severities than the configured threshold", () => {
        it("should make the pipeline fail for any given vulnerability", () => {
          const scannerPayload: Scanner.Payload = {
            id: "1",
            rootDependencyName: "pkg",
            warnings: [],
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
            },
            version: "1.0.0",
            vulnerabilityStrategy: "npm"
          };

          const { status } = runPayloadInterpreter(scannerPayload, {
            ...DEFAULT_RUNTIME_CONFIGURATION,
            vulnerabilities: {
              severity: "all"
            }
          });

          expect(status).equals(pipelineStatus.FAILURE);
        });

        it("should make the pipeline fail with severities higher than configured threshold", () => {
          const scannerPayload: Scanner.Payload = {
            id: "1",
            rootDependencyName: "pkg",
            warnings: [],
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
                    severity: "critical",
                    vulnerableRanges: [],
                    vulnerableVersions: []
                  }
                ]
              }
            },
            version: "1.0.0",
            vulnerabilityStrategy: "npm"
          };

          const { status, data } = runPayloadInterpreter(scannerPayload, {
            ...DEFAULT_RUNTIME_CONFIGURATION,
            vulnerabilities: {
              severity: "high"
            }
          });

          expect(status).equals(pipelineStatus.FAILURE);
          expect(data.dependencies.vulnerabilities[0]).to.deep.equal({
            origin: "npm",
            package: "express",
            title: "Vuln...",
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
