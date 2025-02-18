import type { Parameter } from "@aigne/agent-v1";

export const USER_INPUT_PARAMETER_TYPES: NonNullable<Parameter["type"]>[] = [
  "string",
  "number",
  "select",
  "language",
  "boolean",
  "image",
  "verify_vc",
];

export function isValidInput(
  input: Parameter,
): input is Parameter & { key: string } {
  return (
    !!input.key && USER_INPUT_PARAMETER_TYPES.includes(input.type || "string")
  );
}
