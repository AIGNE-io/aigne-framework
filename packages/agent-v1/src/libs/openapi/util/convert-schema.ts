const convertSchemaToObject = (schema: any) => {
  if (!schema || typeof schema !== "object") {
    throw new Error("Invalid schema: Schema must be an object");
  }

  switch (schema.type) {
    case "object":
      return convertObjectSchema(schema);
    case "array":
      return convertArraySchema(schema);
    default:
      return convertPrimitiveSchema(schema);
  }
};

const convertObjectSchema = (schema: any): { [key: string]: any } => {
  const result: { [key: string]: any } = {};
  if (schema.properties && typeof schema.properties === "object") {
    Object.keys(schema.properties).forEach((property) => {
      result[property] = schema.properties[property];
    });
  }

  return result;
};

const convertArraySchema = (schema: any): any[] => {
  if (!schema.items) {
    return [];
  }

  return [convertSchemaToObject(schema.items)];
};

const convertPrimitiveSchema = (
  schema: any,
): { type: string; value: any; description?: string } => {
  switch (schema.type) {
    case "string":
      return {
        ...schema,
        value: schema.default ?? (schema.enum ? schema.enum[0] : ""),
      };
    case "integer":
    case "number":
      return { ...schema, value: schema.default ?? 0 };
    case "boolean":
      return { ...schema, value: schema.default ?? false };
    default:
      return { ...schema, value: schema.default ?? null };
  }
};

export default convertSchemaToObject;
