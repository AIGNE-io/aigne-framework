export interface RunData {
  id: string;
  name: string;
  input: string;
  startedAt?: number;
  endedAt?: number;
  output?: {
    model?: string;
    usage?: {
      inputTokens: number;
      outputTokens: number;
    };
    [key: string]: unknown;
  };
  error?: string;
  children?: RunData[];
}
