import Joi from "joi";

export type ProjectSettings = {
  id: string;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  model?: string;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  maxTokens?: number;
  appearance?: {
    primaryColor?: string;
    secondaryColor?: string;
    typography?: {
      fontFamily?: string;
      heading?: {
        fontFamily?: string;
      };
    };
    aigneBannerVisible?: boolean;
  };
  iconVersion?: string;
  readme?: string;
  executor?: AgentExecutor;
};

export const projectSettingsSchema = Joi.object<ProjectSettings>({
  id: Joi.string().required(),
  name: Joi.string().empty(["", null]),
  description: Joi.string().empty(["", null]),
  model: Joi.string().empty(["", null]),
  temperature: Joi.number().empty(["", null]),
  topP: Joi.number().empty(["", null]),
  presencePenalty: Joi.number().empty(["", null]),
  frequencyPenalty: Joi.number().empty(["", null]),
  maxTokens: Joi.number().empty(["", null]),
  createdAt: Joi.alternatives(
    Joi.string().isoDate(),
    Joi.date().cast("string"),
  ).empty(["", null]),
  updatedAt: Joi.alternatives(
    Joi.string().isoDate(),
    Joi.date().cast("string"),
  ).empty(["", null]),
  createdBy: Joi.string().empty(["", null]),
  updatedBy: Joi.string().empty(["", null]),
  appearance: Joi.object({
    primaryColor: Joi.string().empty(["", null]),
    typography: Joi.object({
      fontFamily: Joi.string().empty(["", null]),
      heading: Joi.object({
        fontFamily: Joi.string().empty(["", null]),
      }).empty(["", null]),
    }).empty(["", null]),
  }).empty(["", null]),
  readme: Joi.string().empty(["", null]).optional(),
  executor: Joi.object<AgentExecutor>().empty(["", null]).optional(),
})
  .rename("_id", "id", { override: true, ignoreUndefined: true })
  .options({ stripUnknown: true });

export interface AgentExecutor {
  agent?: {
    blockletDid?: string;
    projectId?: string;
    id: string;
  };

  inputValues?: { [key: string]: any };
}
