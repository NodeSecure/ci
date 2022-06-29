// Import Third-party dependencies
import JSXray from "@nodesecure/js-x-ray";
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

type WarningEntries = Partial<Record<JSXray.WarningName, string[]>>;

export class IgnoreWarningsPatterns {
  public entries: WarningEntries;

  constructor(entries: WarningEntries = {} as WarningEntries) {
    this.entries = entries;
  }

  has(warning: JSXray.WarningName, pkg: string): boolean {
    return Boolean(this.entries[warning]?.includes(pkg));
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
