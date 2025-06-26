export interface TraceData {
  id: string;
  name: string;
  startTime?: number;
  endTime?: number;
  error?: string;
  children?: TraceData[];
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
    agentTag?: string;
    userContext?: Record<string, unknown>;
    memories?: Record<string, unknown>[];
  };
}
