import { promises as fs } from "fs";
import path from "path";

import { ValueOf } from "../lib/types";
import * as RC from "../nodesecurerc.js";

type LockFile = ValueOf<typeof lockFiles>;

export type EnvironmentContext = {
  lockFile: {
    current: LockFile;
    multiple: boolean;
  };
  compatibleStrategy: RC.OutputStrategy;
};

const lockFiles = {
  packageLock: "package-lock.json",
  yarnLock: "yarn.lock",
  shrinkwrap: "npm-shrinkwrap.json",
  none: "none"
} as const;

function isLockFile(name: string, collection: string[]): name is LockFile {
  return collection.includes(name);
}

async function collectLockFiles(rootDir: string): Promise<Set<LockFile>> {
  const lockFilesFound: LockFile[] = [];
  const allLockFiles = Object.values(lockFiles);
  const rootDirFiles = await fs.opendir(path.join(rootDir));

  for await (const { name } of rootDirFiles) {
    if (isLockFile(name, allLockFiles)) {
      lockFilesFound.push(name);
    }
  }

  return new Set([...lockFilesFound]);
}

const fallbackEnvironmentContext = {
  lockFile: {
    current: lockFiles.none,
    multiple: false
  },
  compatibleStrategy: RC.vulnStrategy.none
};

function getFallbackStrategy(strategy: RC.OutputStrategy): RC.OutputStrategy {
  /**
   * "node" and "none" are strategies compatible with all environments.
   * Consequently at this point, if anything else different of "none" is provided,
   * we must fallback to "node".
   */
  return strategy === "NONE" ? strategy : RC.vulnStrategy.node;
}

export async function collectEnvironmentContext({
  rootDir,
  strategy
}: RC.Configuration): Promise<EnvironmentContext> {
  try {
    const collectedLockFiles = await collectLockFiles(rootDir);
    const multipleLockFiles = collectedLockFiles.size > 1 ?? false;
    const [lockFile] = collectedLockFiles;
    // package-lock.json is the lockfile with the best compatibility
    const hasPackageLock = collectedLockFiles.has(lockFiles.packageLock);
    const hasShrinkwrap = collectedLockFiles.has(lockFiles.shrinkwrap);

    if (hasPackageLock || hasShrinkwrap) {
      return {
        lockFile: {
          current: hasPackageLock ? lockFiles.packageLock : lockFile,
          multiple: multipleLockFiles
        },
        /**
         * Everything is compatible with these two lock files, we can safely
         * keep going on with the provided strategy.
         */
        compatibleStrategy: strategy
      };
    }

    return {
      lockFile: {
        current: lockFile ?? lockFiles.none,
        multiple: multipleLockFiles
      },
      compatibleStrategy: getFallbackStrategy(strategy)
    };
  } catch {
    return fallbackEnvironmentContext;
  }
}
