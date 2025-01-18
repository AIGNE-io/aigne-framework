import type { RuleGroupType } from "react-querybuilder";

import type { AgentExecutor } from "../resource";
import type {
  RuntimeOutputAppearance,
  RuntimeOutputVariable,
  RuntimeOutputVariablesSchema,
} from "../runtime";

export { default as Mustache } from "./mustache/mustache";
export * from "./mustache/directive";

export enum OnTaskCompletion {
  EXIT = "EXIT",
}

export type MemoryFile = {
  variables?: Variable[];
};

export type ConfigFile = {
  entry?: string;
};

export interface CronJob {
  id: string;
  name?: string;
  cronExpression?: string;
  enable?: boolean;
  agentId?: string;
  inputs?: { [key: string]: any };
}

export type CronFile = {
  jobs?: CronJob[];
};

export type AssistantType = Assistant["type"];

export type Assistant =
  | Agent
  | PromptAssistant
  | ImageAssistant
  | ApiAssistant
  | FunctionAssistant
  | RouterAssistant
  | CallAssistant
  | ImageBlenderAssistant;

export type Role = "system" | "user" | "assistant";

export type ExecuteBlockRole = Role | "none";

export type Tool = {
  blockletDid?: string;
  projectId?: string;
  id: string;
  from?: "assistant" | "blockletAPI" | "knowledge";
  parameters?: { [key: string]: any };
  functionName?: string;
  onEnd?: OnTaskCompletion;
};

type ExecuteBlockCommon = {
  id: string;
  role?: ExecuteBlockRole;
  selectByPrompt?: string;
  tools?: Tool[];
  formatResultType?: "none" | "asHistory";
  prefix?: string;
  suffix?: string;
  variable?: string;
  type?: "dataset" | "history" | "setStore" | "getStore" | "knowledge";
  respondAs?: "none" | "message" | "systemMessage";
};

export type ExecuteBlockSelectAll = ExecuteBlockCommon & { selectType: "all" };

type ModelConfiguration = {
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  maxTokens?: number;
  model?: string;
};

export type ExecuteBlockSelectByPrompt = ExecuteBlockCommon & {
  selectType: "selectByPrompt";
  executeModel?: ModelConfiguration;
  defaultToolId?: string;
};

export type ExecuteBlock = ExecuteBlockSelectAll | ExecuteBlockSelectByPrompt;

export type PromptMessage = {
  id: string;
  role: Role;
  content?: string;
  name?: string;
};

export type Prompt =
  | {
      type: "message";
      data: PromptMessage;
      visibility?: "hidden";
    }
  | {
      type: "executeBlock";
      data: ExecuteBlock;
      visibility?: "hidden";
    };

export type Variable = {
  id: string;
  scope?: VariableScope;
  key: string;
  reset?: boolean;
  defaultValue?: any;
  type?: VariableType;
};

export type VariableScope = "user" | "session" | "global";

export interface AssistantBase {
  id: string;
  name?: string;
  parameters?: Parameter[];
  tags?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  executor?: AgentExecutor;
  tests?: {
    id: string;
    parameters: { [key: string]: any };
    output?: string;
    error?: { message: string };
    createdBy: string;
  }[];
  formatResultType?: "none";
  release?: {
    template?: string;
    title?: string;
    description?: string;
    openerMessage?: string;
    logo?: string;
    maxRoundLimit?: number;
    reachMaxRoundLimitTip?: string;
    submitButton?: {
      title?: string;
      background?: string;
    };
    payment?: {
      enable?: boolean;
      price?: string;
    };
  };
  entries?: {
    id: string;
    title?: string;
    parameters?: { [key: string]: any };
  }[];
  outputVariables?: OutputVariable[];
  cache?: {
    enable?: boolean;
  };
  openEmbed?: {
    enable?: boolean;
  };
  access?: {
    noLoginRequired?: boolean;
  };
}

export interface VariableTypeBase {
  id: string;
  name?: string;
  description?: string;
  required?: boolean;
  hidden?: boolean;
  faker?: any;
}

export type VariableType = VariableTypeBase &
  (
    | { type?: undefined }
    | {
        type: "string";
        defaultValue?: string;
      }
    | {
        type: "number";
        defaultValue?: number;
      }
    | {
        type: "boolean";
        defaultValue?: boolean;
      }
    | {
        type: "object";
        properties?: VariableType[];
      }
    | {
        type: "array";
        element?: VariableType;
      }
  );

export type OutputVariable = VariableType & {
  variable?: { key: string; scope: VariableScope };
  valueTemplate?: string;
  activeWhen?: string;
  from?:
    | { type?: undefined }
    | { type: "input" | "output"; id?: string }
    | {
        type: "callAgent";
        callAgent?: {
          blockletDid?: string;
          projectId?: string;
          agentId?: string;
          inputs?: { [key: string]: any };
        };
      };
  appearance?: RuntimeOutputAppearance;
  initialValue?: RuntimeOutputVariablesSchema[RuntimeOutputVariable];
};

export interface Agent extends AssistantBase {
  type: "agent";
}

export interface BlockletAgent
  extends Omit<
    AssistantBase,
    "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
  > {
  type: "blocklet";
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RouterAssistant extends AssistantBase {
  type: "router";
  defaultToolId?: string;
  prompt?: string;
  decisionType?: "ai" | "json-logic";
  routes?: ({ condition?: RuleGroupType } & Tool)[];

  // 参数配置，为了可以复用UI和 prompt一致
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  maxTokens?: number;
  model?: string;
}

export interface ImageBlenderAssistant extends AssistantBase {
  type: "imageBlender";
  templateId?: string;
  dynamicData?: { [key: string]: string };
}

export interface CallAssistant extends AssistantBase {
  type: "callAgent";
  agents?: Tool[];
}

export interface PromptAssistant extends AssistantBase {
  type: "prompt";
  prompts?: Prompt[];
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  maxTokens?: number;
  model?: string;
}

export interface ImageAssistant extends AssistantBase {
  type: "image";
  prepareExecutes?: ExecuteBlock[];
  prompt?: string;
  model?: string;
  n?: number;
  quality?: string;
  style?: string;
  size?: string;
}

export interface ApiAssistant extends AssistantBase {
  type: "api";
  prepareExecutes?: ExecuteBlock[];
  requestParameters?: { id: string; key?: string; value?: string }[];
  requestMethod?: string;
  requestUrl?: string;
  requestHeaders: { id: string; key?: string; value?: string }[];
}

export interface FunctionAssistant extends AssistantBase {
  type: "function";
  prepareExecutes?: ExecuteBlock[];
  code?: string;
}

export interface DatastoreParameter {
  variableFrom?: "datastore"; // Storage 感觉更好，但是又出现了多个命名，维持 Datastore
  variable?: { key: string; scope: string };
}

export interface AgentParameter {
  variableFrom?: "tool";
  agent?: Tool;
}

export interface KnowledgeParameter {
  variableFrom?: "knowledge";
  knowledge?: Tool;
}

export interface HistoryParameter {
  variableFrom?: "history";
  chatHistory?: { limit?: number; keyword?: string };
}

export interface APIParameter {
  variableFrom?: "blockletAPI";
  api?: Tool;
}

export interface SecretParameter {
  variableFrom?: "secret";
}

export type Parameter =
  | StringParameter
  | NumberParameter
  | SelectParameter
  | LanguageParameter
  | BooleanParameter
  | SourceParameter
  | LLMInputMessagesParameter
  | LLMInputToolsParameter
  | LLMInputToolChoiceParameter
  | LLMInputResponseFormatParameter
  | ImageParameter
  | VerifyVCParameter;

export interface ParameterBase {
  id: string;
  key?: string;
  label?: string;
  docLink?: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  from?:
    | "editor"
    | "agentParameter"
    | "knowledgeParameter"
    | "blockletAPIParameter"
    | "imageBlenderParameter";
  hidden?: boolean;
}

export function isUserInputParameter(
  parameter: Parameter,
): parameter is Exclude<Parameter, SourceParameter> {
  return parameter.type !== "source";
}

export interface LLMInputMessagesParameter extends ParameterBase {
  type: "llmInputMessages";
  defaultValue?: any;
}

export interface LLMInputToolsParameter extends ParameterBase {
  type: "llmInputTools";
  defaultValue?: any;
}

export interface LLMInputToolChoiceParameter extends ParameterBase {
  type: "llmInputToolChoice";
  defaultValue?: any;
}

export interface LLMInputResponseFormatParameter extends ParameterBase {
  type: "llmInputResponseFormat";
  defaultValue?: any;
}

export interface SourceParameter extends ParameterBase {
  type: "source";
  defaultValue?: string;
  source?:
    | DatastoreParameter
    | AgentParameter
    | KnowledgeParameter
    | HistoryParameter
    | APIParameter
    | SecretParameter;
}

export interface StringParameter extends ParameterBase {
  type?: "string";
  value?: string;
  defaultValue?: string;
  multiline?: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface VerifyVCParameter extends ParameterBase {
  type?: "verify_vc";
  value?: any;
  defaultValue?: any;
  vcItem?: string[];
  vcTrustedIssuers?: string[];
  buttonTitle?: string;
  buttonTitleVerified?: string;
  alertTitleVerified?: string;
}

export interface BooleanParameter extends ParameterBase {
  type: "boolean";
  value?: boolean;
  defaultValue?: boolean;
}

export interface NumberParameter extends ParameterBase {
  type: "number";
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
}

export interface SelectParameter extends ParameterBase {
  type: "select";
  value?: string | string[];
  defaultValue?: string | string[];
  multiple?: boolean;
  style?: "dropdown" | "checkbox";
  options?: { id: string; label: string; value: string }[];
}

export interface LanguageParameter extends ParameterBase {
  type: "language";
  value?: string;
  defaultValue?: string;
}

export interface ImageParameter extends ParameterBase {
  type: "image";
  value?: string | string[];
  multiple?: boolean;
  defaultValue?: string | string[];
}

export interface User {
  id: string;
  did: string;
  role?: string;
  fullName?: string;
  provider?: string;
  walletOS?: string;
}
