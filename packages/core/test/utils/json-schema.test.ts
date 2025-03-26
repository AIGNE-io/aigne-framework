import { expect, test } from "bun:test";
import { ensureZodUnionArray, outputSchemaToResponseFormatSchema } from "@aigne/core";
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
