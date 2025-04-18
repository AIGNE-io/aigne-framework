import { describe, expect, test } from "bun:test";
import { getJsonOutputPrompt } from "../../src/utils/prompts.js";

describe("getJsonOutputPrompt", () => {
  test("should return correct prompt with string schema", () => {
    const schema = "name: string\nage: number";
    const expected = `Provide your output as a JSON containing the following fields:
<json_fields>
name: string
age: number
</json_fields>`;

    expect(getJsonOutputPrompt(schema)).toBe(expected);
  });

  test("should return correct prompt with object schema", () => {
    const schema = {
      name: "string",
      age: "number",
      address: {
        city: "string",
        country: "string",
      },
    };
    const expected = `Provide your output as a JSON containing the following fields:
<json_fields>
{"name":"string","age":"number","address":{"city":"string","country":"string"}}
</json_fields>`;

    expect(getJsonOutputPrompt(schema)).toBe(expected);
  });

  test("should handle empty schema", () => {
    const schema = {};
    const expected = `Provide your output as a JSON containing the following fields:
<json_fields>
{}
</json_fields>`;

    expect(getJsonOutputPrompt(schema)).toBe(expected);
  });

  test("should handle empty string schema", () => {
    const schema = "";
    const expected = `Provide your output as a JSON containing the following fields:
<json_fields>

</json_fields>`;

    expect(getJsonOutputPrompt(schema)).toBe(expected);
  });
});
