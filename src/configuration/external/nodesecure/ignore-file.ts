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

export const kIgnoreFileName = ".nsci-ignore";

export function validateIgnoreFile(
  ignoreFile: string,
): { isValid: boolean; error?: string } {
  const validator = new Validator();
  const validate = validator.compile(kIgnoreFileSchema);
  const isValid = validate(ignoreFile);
 
 return { 
   isValid, 
   error: validate.errors ? validate?.errors[0]?.message : undefined 
 };
}

