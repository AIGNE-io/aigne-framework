import { nanoid } from "nanoid";

import type { MakeNullablePropertyOptional } from "../utils/nullable";
import { OrderedRecord } from "../utils/ordered-map";
import type { DataType } from "./data-type";

export function schemaToDataType(dataType: {
  [name: string]: DataTypeSchema;
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
              )!,
          };
        default: {
          throw new Error(
            `Unknown data type: ${(schema as DataTypeSchema).type}`,
          );
        }
      }
    }),
  );
}

export type DataTypeSchema =
  | DataTypeSchemaString
  | DataTypeSchemaNumber
  | DataTypeSchemaBoolean
  | DataTypeSchemaObject
  | DataTypeSchemaArray;

export interface DataTypeSchemaBase {
  description?: string;
  required?: boolean;
}

export interface DataTypeSchemaString extends DataTypeSchemaBase {
  type: "string";
}

export interface DataTypeSchemaNumber extends DataTypeSchemaBase {
  type: "number";
}

export interface DataTypeSchemaBoolean extends DataTypeSchemaBase {
  type: "boolean";
}

export interface DataTypeSchemaObject extends DataTypeSchemaBase {
  type: "object";
  properties?: { [key: string]: DataTypeSchema };
}

export interface DataTypeSchemaArray extends DataTypeSchemaBase {
  type: "array";
  items?: DataTypeSchema;
}

type SchemaTypeInner<T extends DataTypeSchema> = T extends DataTypeSchemaString
  ? string
  : T extends DataTypeSchemaNumber
    ? number
    : T extends DataTypeSchemaBoolean
      ? boolean
      : T extends DataTypeSchemaObject
        ? MakeNullablePropertyOptional<{
            [K in keyof T["properties"]]: SchemaType<
              NonNullable<T["properties"]>[K]
            >;
          }>
        : T extends DataTypeSchemaArray
          ? Extract<T["items"], null | undefined> extends null | undefined
            ? SchemaType<{ type: "object" }>[]
            : SchemaType<NonNullable<T["items"]>>[]
          : never;

export type SchemaType<T extends DataTypeSchema> = T["required"] extends true
  ? SchemaTypeInner<T>
  : SchemaTypeInner<T> | undefined | null;

export type SchemaMapType<T extends Record<string, DataTypeSchema>> =
  SchemaType<{
    type: "object";
    required: true;
    properties: T;
  }>;
