import { expect, spyOn, test } from "bun:test";
import {
  ensureZodUnionArray,
  outputSchemaToResponseFormatSchema,
  parseJSON,
} from "@aigne/core/utils/json-schema.js";
import { logger } from "@aigne/core/utils/logger.js";
import { z } from "zod";

test("ensureZodUnionArray should throw error if the unions is empty array", async () => {
  const enums: string[] = [];

  const schema = async () =>
    z.object({
      enums: z
        .union(ensureZodUnionArray(enums.map((value) => z.literal(value))))
        .describe("test enums with empty array"),
    });

  expect(schema()).rejects.toThrowError();
});

test("ensureZodUnionArray should work if the unions is not empty array", async () => {
  const enums: string[] = ["foo"];

  const schema = async () =>
    outputSchemaToResponseFormatSchema(
      z.object({
        enums: z
          .union(ensureZodUnionArray(enums.map((value) => z.literal(value))))
          .describe("test enums with non-empty array"),
      }),
    );

  expect(schema()).resolves.toEqual(
    expect.objectContaining({
      type: "object",
      properties: {
        enums: {
          type: "string",
          enum: ["foo"],
          description: "test enums with non-empty array",
        },
      },
      required: ["enums"],
      additionalProperties: false,
    }),
  );
});

test("parseJSON should throw error if the json is invalid", async () => {
  const json = "{ foo: bar }";

  const log = spyOn(logger, "core").mockReturnValue(undefined);

  expect((async () => parseJSON(json))()).rejects.toThrowError("JSON Parse error");

  expect(log).toHaveBeenCalledWith("Failed to parse JSON", expect.anything());

  log.mockRestore();
});
