import { describe, expect, test } from "bun:test";
import { getJsonOutputPrompt, getJsonToolInputPrompt } from "../../src/utils/prompts.js";

describe("getJsonOutputPrompt", () => {
  test("string schema", () => {
    const schema = "{name: string, age: number}";
    expect(getJsonOutputPrompt(schema)).toMatchSnapshot();
  });

  test("object schema", () => {
    const schema = { name: "string", age: "number" };
    expect(getJsonOutputPrompt(schema)).toMatchSnapshot();
  });

  test("should handle empty schema", () => {
    const schema = {};
    expect(getJsonOutputPrompt(schema)).toMatchSnapshot();
  });

  test("should handle empty string schema", () => {
    const schema = "";
    expect(getJsonOutputPrompt(schema)).toMatchSnapshot();
  });
});

describe("getJsonToolInputPrompt", () => {
  test("string schema", () => {
    const schema = "{foo: string}";
    expect(getJsonToolInputPrompt(schema)).toMatchSnapshot();
  });

  test("object schema", () => {
    const schema = { foo: "string" };
    expect(getJsonToolInputPrompt(schema)).toMatchSnapshot();
  });
});
