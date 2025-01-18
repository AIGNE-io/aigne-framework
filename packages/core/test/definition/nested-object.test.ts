import { expect, test } from "bun:test";

import type { SchemaMapType } from "../../src";

test("DataTypeSchema nested object definitions", async () => {
  type Type = {
    array0?: (string | null | undefined)[] | null | undefined;
    array1: number[];
    object0?:
      | {
          name?: string | null | undefined;
          age?: number | null | undefined;
          tags?: (string | null | undefined)[] | null | undefined;
          objectList?:
            | {
                name: string;
                age?: number | null | undefined;
              }[]
            | null
            | undefined;
        }
      | null
      | undefined;
    object1: {
      name: string;
      age?: number | null | undefined;
    };
  };

  type Schema = SchemaMapType<{
    array0: {
      type: "array";
      items: {
        type: "string";
      };
    };
    array1: {
      type: "array";
      required: true;
      items: {
        type: "number";
        required: true;
      };
    };
    object0: {
      type: "object";
      properties: {
        name: {
          type: "string";
        };
        age: {
          type: "number";
        };
        tags: {
          type: "array";
          items: {
            type: "string";
          };
        };
        objectList: {
          type: "array";
          items: {
            type: "object";
            required: true;
            properties: {
              name: {
                type: "string";
                required: true;
              };
              age: {
                type: "number";
              };
            };
          };
        };
      };
    };
    object1: {
      type: "object";
      required: true;
      properties: {
        name: {
          type: "string";
          required: true;
        };
        age: {
          type: "number";
        };
      };
    };
  }>;

  type TagsIsStringArray = Schema extends Type
    ? Type extends Schema
      ? true
      : false
    : false;
  expect<TagsIsStringArray>(true).toBeTrue();
});
