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
  componentId?: string;
  userId?: string;
  token?: number;
  cost?: number;
  remark?: string;
}

export interface RunDetailDrawerProps {
  traceId: string;
  traceInfo: TraceData;
  selectedTrace: TraceData;
  setSelectedTrace: (trace: TraceData | null) => void;
  onClose: () => void;
}
