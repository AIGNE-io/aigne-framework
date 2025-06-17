export interface RunData {
  id: string;
  name: string;
  startTime?: number;
  endTime?: number;
  error?: string;
  children?: RunData[];
  status?: {
    code: number;
    message: string;
  };
  attributes: {
    input?: Record<string, unknown>;
    output?: {
      model?: string;
      usage?: {
        inputTokens: number;
        outputTokens: number;
      };
      [key: string]: unknown;
    };
    agentName?:string
  };
}
