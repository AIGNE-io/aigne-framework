export interface DatasetItem {
  id: string | number;
  input: Record<string, any>;
  output?: Record<string, any>;
  expected?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];
  selected?: boolean;
}

export interface Dataset {
  name: string;
  load(): Promise<DatasetItem[]>;
  loadWithOptions(options?: {
    filter?: (item: DatasetItem) => boolean;
    limit?: number;
  }): Promise<DatasetItem[]>;
}

export interface RunOptions {
  timeoutMs?: number;
  concurrency?: number;
  hooks?: {
    onBeforeRun?: (item: DatasetItem) => void;
    onAfterRun?: (result: RunResult) => void;
    onError?: (err: Error) => void;
  };
}

export interface RunResult extends DatasetItem {
  error?: string;
  latency?: number;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface Runner {
  name: string;
  run(dataset: DatasetItem[], options?: RunOptions): AsyncGenerator<RunResult>;
}

export interface Evaluation {
  name: string;
  score: number;
  reason?: string;
  [key: string]: any;
}

export interface Evaluator {
  name: string;
  evaluate(result: RunResult): Promise<Evaluation[]>;
}

export interface EvaluationSummary {
  total: number;
  successRate: number;
  avgLatency?: number;
  totalTokens?: number;
  errorCount?: number;
  [key: string]: any;
}

export interface Report {
  dataset: string;
  results: (RunResult & { evaluations: Evaluation[] })[];
  summary: EvaluationSummary;
}

export interface Reporter {
  name: string;
  report(report: Report): Promise<void>;
}
