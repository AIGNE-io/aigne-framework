import { nanoid } from "nanoid";

import type { MakeNullablePropertyOptional } from "../utils/nullable";
import { OrderedRecord } from "../utils/ordered-map";
import type { ArrayElement } from "../utils/type-utils";
import type { DataType } from "./data-type";

export function schemaToDataType(dataType: {
  [name: string]: DataSchema;
}): OrderedRecord<DataType> {
  return OrderedRecord.fromArray(
    Object.entries(dataType).map(([name, schema]) => {
      const base = {
        ...schema,
        id: nanoid(),
        name,
      };

      switch (schema.type) {
        case "string":
          return {
            ...base,
            type: "string",
          };
        case "number":
          return {
            ...base,
            type: "number",
          };
        case "boolean":
          return {
            ...base,
            type: "boolean",
          };
        case "object":
          return {
            ...base,
            type: "object",
            properties:
              schema.properties && schemaToDataType(schema.properties),
          };
        case "array":
          return {
            ...base,
            type: "array",
            items:
              schema.items &&
              OrderedRecord.find(
                schemaToDataType({ items: schema.items }),
                (i) => i.name === "items",
              ),
          };
        default: {
          throw new Error(`Unknown data type: ${(schema as DataSchema).type}`);
        }
      }
    }),
  );
}

export type DataSchema =
  | DataSchemaString
  | DataSchemaNumber
  | DataSchemaBoolean
  | DataSchemaObject
  | DataSchemaArray;

export interface DataSchemaBase {
  description?: string;
  required?: boolean;
}

export interface DataSchemaString extends DataSchemaBase {
  type: "string";
}

export interface DataSchemaNumber extends DataSchemaBase {
  type: "number";
}

export interface DataSchemaBoolean extends DataSchemaBase {
  type: "boolean";
}

export interface DataSchemaObject extends DataSchemaBase {
  type: "object";
  properties?: { [key: string]: DataSchema };
}

export interface DataSchemaArray extends DataSchemaBase {
  type: "array";
  items?: DataSchema;
}

type SchemaTypeInner<T extends DataSchema> = T extends DataSchemaString
  ? string
  : T extends DataSchemaNumber
    ? number
    : T extends DataSchemaBoolean
      ? boolean
      : T extends DataSchemaObject
        ? MakeNullablePropertyOptional<{
            [K in keyof T["properties"]]: SchemaType<
              NonNullable<T["properties"]>[K]
            >;
          }>
        : T extends DataSchemaArray
          ? Extract<T["items"], null | undefined> extends null | undefined
            ? SchemaType<{ type: "object" }>[]
            : SchemaType<NonNullable<T["items"]>>[]
          : never;

type SchemaType<T extends DataSchema> = T["required"] extends true
  ? SchemaTypeInner<T>
  : SchemaTypeInner<T> | undefined | null;

export type SchemaToType<T extends Record<string, DataSchema>> = SchemaType<{
  type: "object";
  required: true;
  properties: T;
}>;

type TypeToSchemaInner<T> = Extract<T, string | undefined> extends
  | string
  | undefined
  ? DataSchemaString & {
      required: Extract<T, undefined> extends undefined ? false : true;
    }
  : Extract<T, number | undefined> extends number | undefined
    ? DataSchemaNumber & {
        required: Extract<T, undefined> extends undefined ? false : true;
      }
    : Extract<T, boolean | undefined> extends boolean | undefined
      ? DataSchemaBoolean & {
          required: Extract<T, undefined> extends undefined ? false : true;
        }
      : Extract<T, object | undefined> extends object | undefined
        ? DataSchemaObject & {
            properties: {
              [K in keyof T]: TypeToSchemaInner<NonNullable<T[K]>>;
            };
            required: Extract<T, undefined> extends undefined ? false : true;
          }
        : Extract<T, [] | undefined> extends [] | undefined
          ? DataSchemaArray & {
              items: Extract<T, undefined> extends undefined
                ? undefined
                : TypeToSchemaInner<NonNullable<ArrayElement<T>>>;
              required: Extract<T, undefined> extends undefined ? false : true;
            }
          : never;

export type TypeToSchema<T extends Record<string, unknown>> = {
  [K in keyof T]: TypeToSchemaInner<T[K]>;
};
