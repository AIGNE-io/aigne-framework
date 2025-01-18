import type { ChatCompletionResponse } from "@blocklet/ai-kit/api/types/chat";
import Joi from "joi";
import omitBy from "lodash/omitBy";
import toLower from "lodash/toLower";

import type { Assistant, BlockletAgent, OutputVariable, Variable } from "..";

export const variableBlockListForAgent: {
  [key in Assistant["type"]]?: {
    block?: Set<RuntimeOutputVariable>;
    allow?: Set<RuntimeOutputVariable>;
  };
} = {
  prompt: {
    // block: new Set(['$images']),
  },
  image: {
    // allow: new Set(['$images']),
  },
};

type OmitUnion<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export const runtimeVariablesSchema: {
  [key in RuntimeOutputVariable]?: OmitUnion<OutputVariable, "id">;
} = {
  $text: {
    type: "string",
    description: "Text Stream",
    faker: "lorem.paragraph",
  },
  $images: {
    type: "array",
    description: "Generated Images",
    element: {
      id: "",
      type: "object",
      properties: [
        {
          id: "",
          type: "string",
          name: "url",
          description: "Image Url",
          required: true,
          faker: "image.url",
        },
      ],
    },
  },
  "$suggested.questions": {
    type: "array",
    description:
      "Generate 3 questions for users to ask you based on answers and context",
    element: {
      id: "",
      type: "object",
      properties: [
        {
          id: "",
          type: "string",
          name: "question",
          required: true,
          faker: "lorem.sentence",
        },
      ],
    },
    required: true,
  },
  "$reference.links": {
    type: "array",
    description: "List all referenced links in the generated text",
    element: {
      id: "",
      type: "object",
      properties: [
        {
          id: "",
          type: "string",
          name: "title",
          required: true,
          faker: "lorem.sentence",
        },
        {
          id: "",
          type: "string",
          name: "url",
          required: true,
          faker: "internet.url",
        },
      ],
    },
    required: true,
  },
};

export function outputVariablesToJsonSchema(
  assistant: Assistant,
  {
    variables,
    includeRuntimeOutputVariables,
    includeFaker,
  }: {
    variables: Variable[];
    includeRuntimeOutputVariables?: boolean;
    includeFaker?: boolean;
  },
): { type: "object"; properties: { [key: string]: any } } | undefined {
  const variableToSchema = (
    variable: OmitUnion<OutputVariable, "id"> & { faker?: any },
  ): any => {
    if (variable.from?.type === "input") return undefined;
    if (
      !includeRuntimeOutputVariables &&
      ignoreJsonSchemaOutputs.has(variable.name as RuntimeOutputVariable)
    )
      return undefined;

    if (variable.name && isRuntimeOutputVariable(variable.name)) {
      const runtimeVariable =
        runtimeVariablesSchema[variable.name as RuntimeOutputVariable];
      if (!runtimeVariable) return undefined;

      return variableToSchema({
        ...runtimeVariable,
        description: [runtimeVariable.description, variable.description]
          .filter((i) => !!i)
          .join("\n"),
      });
    }

    if (variable.variable) {
      const { key, scope } = variable.variable;
      const v = variables.find(
        (i) => toLower(i.key) === toLower(key) && i.scope === scope,
      );
      if (!v?.type) throw new Error(`Variable ${key} not found from ${scope}`);

      return variableToSchema(v.type);
    }

    return omitBy(
      {
        type: variable.type || "string",
        description: variable.description,
        properties:
          variable.type === "object" && variable.properties
            ? Object.fromEntries(
                variable.properties
                  .map(
                    (property) =>
                      [property.name, variableToSchema(property)] as const,
                  )
                  .filter((i) => i[0] && i[1]),
              )
            : undefined,
        items:
          variable.type === "array" && variable.element
            ? variableToSchema(variable.element)
            : undefined,
        additionalProperties: variable.type === "object" ? false : undefined,
        required:
          variable.type === "object" && variable.properties?.length
            ? variable.properties
                .filter(
                  (i) =>
                    i.name &&
                    (i.required ||
                      (runtimeOutputVariableSet.has(
                        i.name as RuntimeOutputVariable,
                      ) &&
                        runtimeVariablesSchema[
                          i.name as RuntimeOutputVariable
                        ] &&
                        !ignoreJsonSchemaOutputs.has(
                          i.name as RuntimeOutputVariable,
                        ))),
                )
                .map((i) => i.name)
            : undefined,
        faker: includeFaker ? variable.faker : undefined,
      },
      (v) => v === undefined,
    );
  };

  const outputVariables = (assistant.outputVariables ?? []).filter(
    (i) =>
      !i.hidden && i.from?.type !== "callAgent" && !i.valueTemplate?.trim(),
  );
  return variableToSchema({ type: "object", properties: outputVariables });
}

export function outputVariablesToJoiSchema(
  assistant: Assistant | BlockletAgent,
  { partial, variables }: { partial?: boolean; variables: Variable[] },
): Joi.AnySchema {
  const variableToSchema = (
    variable: OmitUnion<OutputVariable, "id">,
  ): Joi.AnySchema | undefined => {
    let schema: Joi.AnySchema | undefined;

    if (variable.from?.type === "input") {
      const fromId = variable.from.id;
      const input = assistant.parameters?.find(
        (i) => i.id === fromId && !i.hidden,
      );
      if (input) {
        return Joi.any();
      }

      return undefined;
    }

    if (variable.from?.type === "output") {
      return Joi.any();
    }

    if (variable.name && isRuntimeOutputVariable(variable.name)) {
      if (variable.name === RuntimeOutputVariable.llmResponseStream) {
        schema = Joi.any();
      } else {
        const runtimeVariable =
          runtimeVariablesSchema[variable.name as RuntimeOutputVariable];
        if (!runtimeVariable) return undefined;

        schema = variableToSchema({ ...runtimeVariable });
        if (schema) {
          schema = Joi.alternatives().try(schema, Joi.any().empty(Joi.any()));
        }
      }
      return schema;
    }

    if (variable.variable) {
      const { key, scope } = variable.variable;

      const v = variables.find(
        (i) => toLower(i.key) === toLower(key) && i.scope === scope,
      );
      if (!v?.type) return undefined;

      schema = variableToSchema(v.type);
    } else if (!variable.type || variable.type === "string") {
      schema = Joi.string().empty(["", null]);
    } else if (variable.type === "number") {
      schema = Joi.number().empty([null, ""]);
    } else if (variable.type === "boolean") {
      schema = Joi.boolean().empty([null, ""]);
    } else if (variable.type === "object") {
      if (variable.properties?.length) {
        schema = Joi.object(
          Object.fromEntries(
            (variable.properties ?? [])
              .map(
                (property) =>
                  [property.name, variableToSchema(property)] as const,
              )
              .filter((i) => i[0] && i[1]),
          ),
        )
          .empty([null, ""])
          .options({ stripUnknown: true });
      } else {
        schema = Joi.any().empty(["", null]);
      }
    } else if (variable.type === "array") {
      schema = Joi.array()
        .empty([null, ""])
        .items(
          (variable.element && variableToSchema(variable.element)) ||
            Joi.string().empty([null, ""]),
        );
    }

    if (!schema) return undefined;

    if ("defaultValue" in variable) {
      schema = schema.default(variable.defaultValue);
    }

    if (variable.required) {
      schema = schema.required();
    }

    return schema;
  };

  const outputVariables = (assistant.outputVariables ?? []).filter(
    (i) => !i.hidden && i.from?.type !== "callAgent" && !i.valueTemplate,
  );
  return variableToSchema({
    type: "object",
    properties: partial
      ? outputVariables.map((i) => ({ ...i, required: false }))
      : outputVariables,
  })!;
}

export enum RuntimeOutputVariable {
  llmResponseStream = "$llmResponseStream",
  text = "$text",
  images = "$images",
  suggestedQuestions = "$suggested.questions",
  referenceLinks = "$reference.links",
  appearancePage = "$appearance.page",
  appearanceInput = "$appearance.input",
  appearanceOutput = "$appearance.output",
  children = "$children",
  share = "$share",
  openingQuestions = "$openingQuestions",
  openingMessage = "$openingMessage",
  profile = "$profile",
}

const runtimeOutputVariableSet = new Set(Object.values(RuntimeOutputVariable));

const ignoreJsonSchemaOutputs: Set<RuntimeOutputVariable> = new Set([
  RuntimeOutputVariable.text,
  RuntimeOutputVariable.images,
]);

export function isRuntimeOutputVariable(
  variable: string,
): variable is RuntimeOutputVariable {
  return Object.values(RuntimeOutputVariable).includes(
    variable as RuntimeOutputVariable,
  );
}

export interface RuntimeOutputAppearance {
  componentBlockletDid?: string;
  componentId?: string;
  componentName?: string;
  componentProperties?: { [key: string]: any };
  componentProps?: { [key: string]: any };
  title?: string;
  icon?: string;
  jsonataExpression?: string;
}

export interface RuntimeOutputChildren {
  agents?: { id: string; name?: string }[];
}

export interface RuntimeOutputShare {
  items?: { to: string }[];
  shareAttachUrl?: boolean;
  shareAttachInputs?: boolean;
}

export interface RuntimeOutputOpeningQuestions {
  items?: { id: string; title?: string; parameters?: any }[];
}

export interface RuntimeOutputOpeningMessage {
  message?: string;
}

export interface RuntimeOutputProfile {
  avatar?: string;
  name?: string;
  description?: string;
  ogImage?: string;
}

export interface RuntimeOutputVariablesSchema {
  [RuntimeOutputVariable.llmResponseStream]?: ReadableStream<ChatCompletionResponse>;
  [RuntimeOutputVariable.text]?: string;
  [RuntimeOutputVariable.images]?: { url: string }[];
  [RuntimeOutputVariable.suggestedQuestions]?: { question: string }[];
  [RuntimeOutputVariable.referenceLinks]?: { title?: string; url: string }[];
  [RuntimeOutputVariable.appearancePage]?: undefined;
  [RuntimeOutputVariable.appearanceInput]?: undefined;
  [RuntimeOutputVariable.appearanceOutput]?: undefined;
  [RuntimeOutputVariable.children]?: RuntimeOutputChildren;
  [RuntimeOutputVariable.share]?: RuntimeOutputShare;
  [RuntimeOutputVariable.openingQuestions]?: RuntimeOutputOpeningQuestions;
  [RuntimeOutputVariable.openingMessage]?: RuntimeOutputOpeningMessage;
  [RuntimeOutputVariable.profile]?: RuntimeOutputProfile;
}

export function jsonSchemaToOpenAIJsonSchema(schema: any): any {
  if (schema?.type === "object") {
    const { required, properties } = schema;

    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(properties).map(([key, value]: any) => {
          const valueSchema = jsonSchemaToOpenAIJsonSchema(value);

          // NOTE: All fields must be required https://platform.openai.com/docs/guides/structured-outputs/all-fields-must-be-required
          return [
            key,
            required?.includes(key)
              ? valueSchema
              : { anyOf: [valueSchema, { type: ["null"] }] },
          ];
        }),
      ),
      required: Object.keys(properties),
    };
  }

  if (schema?.type === "array") {
    return {
      ...schema,
      items: jsonSchemaToOpenAIJsonSchema(schema.items),
    };
  }

  return schema;
}
