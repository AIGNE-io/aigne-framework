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

  const error = spyOn(logger, "error").mockReturnValueOnce(undefined);

  expect((async () => parseJSON(json))()).rejects.toThrowError("JSON Parse error");

  expect(error).toHaveBeenCalledWith("Failed to parse JSON", expect.anything());

  error.mockRestore();
});

test("convertNullableToOptional should convert all nullable properties to optional", async () => {
  const schema = z.object({
    name: z.string(),
    name_nullable: z.string().nullable(),
    name_nullish: z.string().nullish(),

    collections: z.array(z.object({ name: z.string() })),
    collections_nullable: z
      .array(
        z.object({
          name: z.string().nullable(),
        }),
      )
      .nullable(),
    collections_nullish: z
      .array(
        z.object({
          name: z.string().nullish(),
        }),
      )
      .nullish(),

    tags: z.array(z.string()),
    tags_nullable: z.array(z.string().nullable()).nullable(),
    tags_nullish: z.array(z.string().nullish()).nullish(),
  });

  const jsonSchema = outputSchemaToResponseFormatSchema(schema);

  expect(jsonSchema).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "collections": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "name": {
                "type": "string",
              },
            },
            "required": [
              "name",
            ],
            "type": "object",
          },
          "type": "array",
        },
        "collections_nullable": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "name": {
                "type": "string",
              },
            },
            "required": [],
            "type": "object",
          },
          "type": "array",
        },
        "collections_nullish": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "name": {
                "type": "string",
              },
            },
            "required": undefined,
            "type": "object",
          },
          "type": "array",
        },
        "name": {
          "type": "string",
        },
        "name_nullable": {
          "type": "string",
        },
        "name_nullish": {
          "type": "string",
        },
        "tags": {
          "items": {
            "type": "string",
          },
          "type": "array",
        },
        "tags_nullable": {
          "items": {
            "type": "string",
          },
          "type": "array",
        },
        "tags_nullish": {
          "items": {
            "type": "string",
          },
          "type": "array",
        },
      },
      "required": [
        "name",
      ],
      "type": "object",
    }
  `);
});
