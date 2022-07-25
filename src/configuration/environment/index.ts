// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Internal Dependencies
import { ValueOf } from "../../types";
import { Nsci } from "../standard/index.js";

type LockFile = ValueOf<typeof kLockFiles>;

export type EnvironmentContext = {
  lockFile: {
    current: LockFile;
    multiple: boolean;
  };
  compatibleStrategy: Nsci.OutputStrategy;
};

const kLockFiles = {
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
  const allLockFiles = Object.values(kLockFiles);
  const rootDirFiles = await fs.opendir(path.join(rootDir));

  for await (const { name } of rootDirFiles) {
    if (isLockFile(name, allLockFiles)) {
      lockFilesFound.push(name);
    }
  }

  return new Set([...lockFilesFound]);
}

const kFallbackEnvironmentContext = {
  lockFile: {
    current: kLockFiles.none,
    multiple: false
  },
  compatibleStrategy: Nsci.vulnStrategy.none
};

function getFallbackStrategy(
  strategy: Nsci.OutputStrategy
): Nsci.OutputStrategy {
  /**
   * "sonatype" and "none" are strategies compatible with all environments.
   * Consequently at this point, if anything else different of "none" is provided,
   * we must fallback to "sonatype".
   */
  return strategy === "NONE" ? strategy : Nsci.vulnStrategy.sonatype;
}

export async function analyzeEnvironmentContext({
  rootDir,
  strategy
}: Nsci.Configuration): Promise<EnvironmentContext> {
  try {
    const collectedLockFiles = await collectLockFiles(rootDir);
    const multipleLockFiles = collectedLockFiles.size > 1 ?? false;
    const [lockFile] = collectedLockFiles;
    // package-lock.json is the lockfile with the best compatibility
    const hasPackageLock = collectedLockFiles.has(kLockFiles.packageLock);
    const hasShrinkwrap = collectedLockFiles.has(kLockFiles.shrinkwrap);

    if (hasPackageLock || hasShrinkwrap) {
      return {
        lockFile: {
          current: hasPackageLock ? kLockFiles.packageLock : lockFile,
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
        current: lockFile ?? kLockFiles.none,
        multiple: multipleLockFiles
      },
      compatibleStrategy: getFallbackStrategy(strategy)
    };
  } catch {
    return kFallbackEnvironmentContext;
  }
}
