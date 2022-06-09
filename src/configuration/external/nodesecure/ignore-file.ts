import Validator from "ajv";

export interface IgnoreFile {
  warnings?: Record<string, string[]>;
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

export function validateIgnoreFile(
  ignoreFile: string,
): boolean {
  const validator = new Validator();
  const isValid = validator.validate(kIgnoreFileSchema, ignoreFile);

  return isValid;
}

