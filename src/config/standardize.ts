function adaptConfigOptions(options: Record<string, string>) {
  const { vulnerability, directory, reporters, ...remainingOptions } = options;

  return {
    ...remainingOptions,
    rootDir: directory,
    reporters: reporters.split(","),
    vulnerabilities: {
      severity: vulnerability
    }
  };
}

export function standardizeConfig(externalConfig: Record<string, string>) {
  return adaptConfigOptions(externalConfig);
}
