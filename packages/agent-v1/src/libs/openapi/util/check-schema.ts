import Joi from "joi";

const CustomJoi = Joi.extend((joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.customId":
      "{{#label}} does not match the expected format (type:path:method)",
  },
  rules: {
    customId: {
      validate(value, helpers) {
        const [, path, method] = value.split(":");
        const parts = helpers.state.ancestors[0];

        if (!path || !method) {
          return helpers.error("string.customId");
        }

        if (
          path !== parts.path ||
          (method || "").toLocaleLowerCase() !==
            (parts.method || "").toLocaleLowerCase()
        ) {
          return helpers.error("string.customId");
        }

        return value;
      },
    },
  },
}));

const BaseParameterObjectSchema = Joi.object({
  description: Joi.string().optional(),
  required: Joi.boolean().optional(),
  deprecated: Joi.boolean().optional(),
  allowEmptyValue: Joi.boolean().optional(),
  style: Joi.string()
    .valid(
      "matrix",
      "label",
      "form",
      "simple",
      "spaceDelimited",
      "pipeDelimited",
      "deepObject",
    )
    .insensitive()
    .optional(),
  explode: Joi.boolean().optional(),
  allowReserved: Joi.boolean().optional(),
  schema: Joi.any().optional(),
  examples: Joi.object().pattern(Joi.string(), Joi.any).optional(),
  example: Joi.any().optional(),
  content: Joi.any().optional(),
}).optional();

const ParameterObjectSchema = BaseParameterObjectSchema.keys({
  name: Joi.string().required(),
  in: Joi.string()
    .valid("query", "header", "path", "cookie")
    .insensitive()
    .required(),
});

const RequestBodyObjectSchema = Joi.object({});

const ResponsesObjectSchema = Joi.object({});

export default Joi.object({
  id: CustomJoi.string().customId().required(),
  name: Joi.string().optional().allow("").empty([null, ""]),
  type: Joi.string().optional().allow("").empty([null, ""]),
  url: Joi.string()
    .pattern(/^https?:\/\//)
    .optional()
    .allow("")
    .empty([null, ""]),
  path: Joi.string().required(),
  method: Joi.string()
    .valid("GET", "POST", "PUT", "DELETE", "PATCH")
    .insensitive()
    .required(),
  summary: Joi.string().optional().allow("").empty([null, ""]),
  description: Joi.string().optional().allow("").empty([null, ""]),
  parameters: Joi.array()
    .items(ParameterObjectSchema)
    .optional()
    .allow(null, "")
    .empty([null, ""]),
  requestBody: RequestBodyObjectSchema.optional().allow("").empty([null, ""]),
  responses: ResponsesObjectSchema.optional().allow("").empty([null, ""]),
}).unknown(true);
