/* eslint-disable no-sync */
/* eslint-disable max-nested-callbacks */

// Import Node.js Dependencies
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";

// Import Internal Dependencies
import { Nsci } from "../standard/index.js";

import { analyzeEnvironmentContext } from "./index.js";

// CONSTANTS
const kFixtureEnvironment = {
  yarn: {
    folderName: "project-using-yarn",
    files: ["yarn.lock"]
  },
  shrinkwrap: {
    folderName: "project-using-shrinkwrap",
    files: ["npm-shrinkwrap.json"]
  },
  packageLock: {
    folderName: "project-using-packagelock",
    files: ["package-lock.json"]
  },
  noLockFile: {
    folderName: "project-without-lockfile",
    files: []
  },
  multipleLockFiles: {
    folderName: "project-using-multiple-lockfiles",
    files: ["npm-shrinkwrap.json", "package-lock.json", "yarn.lock"]
  }
};

const kFixturesFolder = "fixtures";

function getFixtureFolderPath(folderName: string): string {
  return path.join(kFixturesFolder, folderName);
}

function createFixturesFolder(): void {
  fs.mkdirSync(kFixturesFolder);
  Object.entries(kFixtureEnvironment).forEach(([, fixtureEnvironment]) => {
    const folderName = path.join(
      kFixturesFolder,
      fixtureEnvironment.folderName
    );
    fs.mkdirSync(folderName);
    fixtureEnvironment.files.forEach((file) =>
      fs.writeFileSync(path.join(folderName, file), JSON.stringify({}))
    );
  });
}

function deleteFixturesFolder(): void {
  fs.rmSync(kFixturesFolder, { recursive: true });
}

describe("Environment data collection", () => {
  before(async () => createFixturesFolder());
  after(async () => deleteFixturesFolder());

  describe("When traversing the environment", () => {
    describe("When dealing with one single lockfile", () => {
      it("should find the yarn lockfile at the given location", async () => {
        assert.deepEqual(
          (
            await analyzeEnvironmentContext({
              ...Nsci.defaultNsciRuntimeConfiguration,
              rootDir: getFixtureFolderPath(kFixtureEnvironment.yarn.folderName)
            })
          ).lockFile,
          {
            current: "yarn.lock",
            multiple: false
          }
        );
      });

      it("should find the shrinkwrap at the given location", async () => {
        assert.deepEqual(
          await analyzeEnvironmentContext({
            ...Nsci.defaultNsciRuntimeConfiguration,
            rootDir: getFixtureFolderPath(
              kFixtureEnvironment.shrinkwrap.folderName
            )
          }),
          {
            lockFile: {
              current: "npm-shrinkwrap.json",
              multiple: false
            },
            compatibleStrategy: "NPM_AUDIT"
          }
        );
      });

      it("should find the package-lock lockfile at the given location", async () => {
        assert.deepEqual(
          (
            await analyzeEnvironmentContext({
              ...Nsci.defaultNsciRuntimeConfiguration,
              rootDir: getFixtureFolderPath(
                kFixtureEnvironment.packageLock.folderName
              )
            })
          ).lockFile,
          {
            current: "package-lock.json",
            multiple: false
          }
        );
      });

      it("should fallback to 'none' when no lockfile is found at the given location", async () => {
        assert.deepEqual(
          (
            await analyzeEnvironmentContext({
              ...Nsci.defaultNsciRuntimeConfiguration,
              rootDir: getFixtureFolderPath(
                kFixtureEnvironment.noLockFile.folderName
              )
            })
          ).lockFile,
          {
            current: "none",
            multiple: false
          }
        );
      });
    });

    describe("When dealing with multiple lockfiles", () => {
      it("should keep the package-lock file", async () => {
        assert.deepEqual(
          await analyzeEnvironmentContext({
            ...Nsci.defaultNsciRuntimeConfiguration,
            rootDir: getFixtureFolderPath(
              kFixtureEnvironment.multipleLockFiles.folderName
            )
          }),
          {
            lockFile: {
              current: "package-lock.json",
              multiple: true
            },
            compatibleStrategy: "NPM_AUDIT"
          }
        );
      });
    });

    describe("When providing a strategy not compatible with the environment", () => {
      describe("When the lockfile is missing or incompatible with the environment", () => {
        it("should fallback to 'SONATYPE' strategy", async () => {
          assert.deepEqual(
            await analyzeEnvironmentContext({
              ...Nsci.defaultNsciRuntimeConfiguration,
              strategy: "NPM_AUDIT",
              rootDir: getFixtureFolderPath(kFixtureEnvironment.yarn.folderName)
            }),
            {
              lockFile: {
                current: "yarn.lock",
                multiple: false
              },
              compatibleStrategy: "SONATYPE"
            }
          );

          assert.deepEqual(
            await analyzeEnvironmentContext({
              ...Nsci.defaultNsciRuntimeConfiguration,
              strategy: "NPM_AUDIT",
              rootDir: getFixtureFolderPath(
                kFixtureEnvironment.noLockFile.folderName
              )
            }),
            {
              lockFile: {
                current: "none",
                multiple: false
              },
              compatibleStrategy: "SONATYPE"
            }
          );
        });
      });
    });

    describe("When providing a strategy compatible with every environment", () => {
      it("should not fallback to any strategy", async () => {
        const SAME_NODE_STRATEGY = "SECURITY_WG";
        assert.deepEqual(
          await analyzeEnvironmentContext({
            ...Nsci.defaultNsciRuntimeConfiguration,
            strategy: SAME_NODE_STRATEGY,
            rootDir: getFixtureFolderPath(
              kFixtureEnvironment.shrinkwrap.folderName
            )
          }),
          {
            lockFile: {
              current: "npm-shrinkwrap.json",
              multiple: false
            },
            compatibleStrategy: SAME_NODE_STRATEGY
          }
        );

        const SAME_NONE_STRATEGY = "NONE";

        assert.deepEqual(
          await analyzeEnvironmentContext({
            ...Nsci.defaultNsciRuntimeConfiguration,
            strategy: SAME_NONE_STRATEGY,
            rootDir: getFixtureFolderPath(kFixtureEnvironment.yarn.folderName)
          }),
          {
            lockFile: {
              current: "yarn.lock",
              multiple: false
            },
            compatibleStrategy: SAME_NONE_STRATEGY
          }
        );
      });
    });
  });
});
