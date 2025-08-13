import type { ChatModel, ChatModelOptions } from "@aigne/core/agents/chat-model.js";

export type Model =
  | {
      provider?: string | null;
      name?: string | null;
      temperature?: number | null;
      topP?: number | null;
      frequencyPenalty?: number | null;
      presencePenalty?: number | null;
    }
  | undefined;

type InquirerPromptFn = (prompt: {
  type: string;
  name: string;
  message: string;
  choices: { name: string; value: any }[];
  default: any;
}) => Promise<any>;

export type LoadCredentialOptions = {
  model?: string;
  aigneHubUrl?: string;
  inquirerPromptFn?: InquirerPromptFn;
  printLogger?: boolean;
};

export interface LoadableModel {
  name: string | string[];
  apiKeyEnvName?: string | string[];
  create: (options: {
    model?: string;
    modelOptions?: ChatModelOptions;
    apiKey?: string;
    url?: string;
  }) => ChatModel;
}

export type FetchResult = { accessKeyId: string; accessKeySecret: string };

export type BaseWrapSpinner = (
  _: string,
  waiting: () => Promise<FetchResult>,
) => Promise<FetchResult>;

export interface CreateConnectOptions {
  connectUrl: string;
  openPage?: (url: string) => void;
  fetchInterval?: number;
  retry?: number;
  source?: string;
  connectAction?: string;
  appName?: string;
  appLogo?: string;
  wrapSpinner?: BaseWrapSpinner;
  prettyUrl?: (url: string) => string;
  closeOnSuccess?: boolean;
  intervalFetchConfig?: (options: {
    sessionId: string;
    fetchInterval: number;
    fetchTimeout: number;
  }) => Promise<FetchResult>;
}
