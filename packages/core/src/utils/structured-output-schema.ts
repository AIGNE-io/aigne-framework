import omitBy from "lodash/omitBy";

import type { RunnableOutput } from "../runnable";
import { isNonNullable } from "./is-non-nullable";
import type { OmitPropsFromUnion } from "./omit";
import { OrderedRecord } from "./ordered-map";

export function outputsToJsonSchema(outputs: OrderedRecord<RunnableOutput>) {
  const outputToSchema = (
    output: OmitPropsFromUnion<RunnableOutput, "id">,
  ): object => {
    const properties =
      output.type === "object" && output.properties?.$indexes.length
        ? OrderedRecord.map(output.properties, (property) => {
            if (!property.name) return null;

            const schema = outputToSchema(property);
            if (!schema) return null;

            return { schema, property };
          }).filter(isNonNullable)
        : undefined;

    return omitBy(
      {
        type: output.type,
        description: output.description,
        properties: properties?.length
          ? Object.fromEntries(
              properties.map((p) => [p.property.name, p.schema]),
            )
          : undefined,
        items:
          output.type === "array" && output.items
            ? outputToSchema(output.items)
            : undefined,
        additionalProperties: output.type === "object" ? false : undefined,
        required: properties?.length
          ? properties
              .filter((i) => i.property.required)
              .map((i) => i.property.name)
          : undefined,
      },
      (v) => v === undefined,
    );
  };

  return outputToSchema({
    type: "object",
    properties: outputs,
  });
}
