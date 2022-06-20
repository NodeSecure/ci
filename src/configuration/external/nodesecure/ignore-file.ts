import Validator from "ajv";

export class IgnorePatterns {
  public warnings: IgnoreWarningsPatterns;

  constructor(warnings: IgnoreWarningsPatterns = new IgnoreWarningsPatterns()) {
    this.warnings = warnings;
  }

  static default(): IgnorePatterns {
    return new IgnorePatterns();
  }
}

export class IgnoreWarningsPatterns {
  public entries: Record<string, string[]>;

  constructor(entries: Record<string, string[]> = {}) {
    this.entries = entries;
  }

  has(warning: string, pkg: string): boolean {
    return this.entries[warning]?.includes(pkg);
  }
}

const kIgnoreFileSchema = {
  type: "object",
  properties: {
    warnings: {
      type: "object",
      patternProperties: {
        "^[0-9]{2,6}$": {
          type: "array",
          items: {
            type: "string"
          }
        }
      }
    }
  },
  additionalProperties: false
} as const;

export const kIgnoreFileName = ".nsci-ignore";

export function validateIgnoreFile(ignoreFile: string): {
  isValid: boolean;
  error?: string;
} {
  const validator = new Validator();
  const validate = validator.compile(kIgnoreFileSchema);
  const isValid = validate(ignoreFile);

  return {
    isValid,
    error: validate.errors ? validate?.errors[0]?.message : undefined
  };
}
