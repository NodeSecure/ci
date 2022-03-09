/* eslint-disable no-sync */
/* eslint-disable max-nested-callbacks */
import fs from "fs";
import path from "path";

import { expect } from "chai";

import * as RC from "../config/internal/nsci.js";

import { analyzeEnvironmentContext } from "./index.js";

const fixtureEnvironment = {
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

const fixturesFolder = "fixtures";

function getFixtureFolderPath(folderName: string): string {
  return path.join(fixturesFolder, folderName);
}

function createFixturesFolder(): void {
  fs.mkdirSync(fixturesFolder);
  Object.entries(fixtureEnvironment).forEach(([, fixtureEnvironment]) => {
    const folderName = path.join(fixturesFolder, fixtureEnvironment.folderName);
    fs.mkdirSync(folderName);
    fixtureEnvironment.files.forEach((file) =>
      fs.writeFileSync(path.join(folderName, file), JSON.stringify({}))
    );
  });
}

function deleteFixturesFolder(): void {
  fs.rmdirSync(fixturesFolder, { recursive: true });
}

before(() => createFixturesFolder());
after(() => deleteFixturesFolder());

describe("Environment data collection", () => {
  describe("When traversing the environment", () => {
    describe("When dealing with one single lockfile", () => {
      it("should find the yarn lockfile at the given location", async () => {
        expect(
          (
            await analyzeEnvironmentContext({
              ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
              rootDir: getFixtureFolderPath(fixtureEnvironment.yarn.folderName)
            })
          ).lockFile
        ).to.deep.equal({
          current: "yarn.lock",
          multiple: false
        });
      });

      it("should find the shrinkwrap at the given location", async () => {
        expect(
          await analyzeEnvironmentContext({
            ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
            rootDir: getFixtureFolderPath(
              fixtureEnvironment.shrinkwrap.folderName
            )
          })
        ).to.deep.equal({
          lockFile: {
            current: "npm-shrinkwrap.json",
            multiple: false
          },
          compatibleStrategy: "NPM_AUDIT"
        });
      });

      it("should find the package-lock lockfile at the given location", async () => {
        expect(
          (
            await analyzeEnvironmentContext({
              ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
              rootDir: getFixtureFolderPath(
                fixtureEnvironment.packageLock.folderName
              )
            })
          ).lockFile
        ).to.deep.equal({
          current: "package-lock.json",
          multiple: false
        });
      });

      it("should fallback to 'none' when no lockfile is found at the given location", async () => {
        expect(
          (
            await analyzeEnvironmentContext({
              ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
              rootDir: getFixtureFolderPath(
                fixtureEnvironment.noLockFile.folderName
              )
            })
          ).lockFile
        ).to.deep.equal({
          current: "none",
          multiple: false
        });
      });
    });

    describe("When dealing with multiple lockfiles", () => {
      it("should keep the package-lock file", async () => {
        expect(
          await analyzeEnvironmentContext({
            ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
            rootDir: getFixtureFolderPath(
              fixtureEnvironment.multipleLockFiles.folderName
            )
          })
        ).to.deep.equal({
          lockFile: {
            current: "package-lock.json",
            multiple: true
          },
          compatibleStrategy: "NPM_AUDIT"
        });
      });
    });

    describe("When providing a strategy not compatible with the environment", () => {
      describe("When the lockfile is missing or incompatible with the environment", () => {
        it("should fallback to 'NODE' strategy", async () => {
          expect(
            await analyzeEnvironmentContext({
              ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
              strategy: "NPM_AUDIT",
              rootDir: getFixtureFolderPath(fixtureEnvironment.yarn.folderName)
            })
          ).to.deep.equal({
            lockFile: {
              current: "yarn.lock",
              multiple: false
            },
            compatibleStrategy: "SECURITY_WG"
          });

          expect(
            await analyzeEnvironmentContext({
              ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
              strategy: "NPM_AUDIT",
              rootDir: getFixtureFolderPath(
                fixtureEnvironment.noLockFile.folderName
              )
            })
          ).to.deep.equal({
            lockFile: {
              current: "none",
              multiple: false
            },
            compatibleStrategy: "SECURITY_WG"
          });
        });
      });
    });

    describe("When providing a strategy compatible with every environment", () => {
      it("should not fallback to any strategy", async () => {
        const SAME_NODE_STRATEGY = "SECURITY_WG";
        expect(
          await analyzeEnvironmentContext({
            ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
            strategy: SAME_NODE_STRATEGY,
            rootDir: getFixtureFolderPath(
              fixtureEnvironment.shrinkwrap.folderName
            )
          })
        ).to.deep.equal({
          lockFile: {
            current: "npm-shrinkwrap.json",
            multiple: false
          },
          compatibleStrategy: SAME_NODE_STRATEGY
        });

        const SAME_NONE_STRATEGY = "NONE";

        expect(
          await analyzeEnvironmentContext({
            ...RC.DEFAULT_NSCI_RUNTIME_CONFIGURATION,
            strategy: SAME_NONE_STRATEGY,
            rootDir: getFixtureFolderPath(fixtureEnvironment.yarn.folderName)
          })
        ).to.deep.equal({
          lockFile: {
            current: "yarn.lock",
            multiple: false
          },
          compatibleStrategy: SAME_NONE_STRATEGY
        });
      });
    });
  });
});
