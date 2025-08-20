type InquirerPromptFn = (prompt: {
  type: string;
  name: string;
  message: string;
  choices: { name: string; value: any }[];
  default: any;
}) => Promise<any>;

export type LoadCredentialOptions = {
  aigneHubUrl?: string;
  inquirerPromptFn?: InquirerPromptFn;
};

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
