import { Listr } from "@aigne/listr2";
import { ConsoleReporter } from "./reporter.js";
import type {
  Dataset,
  DatasetItem,
  Evaluation,
  EvaluationSummary,
  Evaluator,
  Report,
  Reporter,
  Runner,
  RunOptions,
  RunResult,
} from "./type.ts";

function aggregateSummary(
  results: (RunResult & { evaluations: Evaluation[]; error?: any })[],
): EvaluationSummary {
  const total = results.length;
  const scores = results.flatMap((r) => r.evaluations.map((e) => e.score));
  const successRate = Number(
    (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0).toFixed(2),
  );

  const latencies = results.map((r) => r.latency || 0);
  const totalTokens = results.reduce(
    (a, r) => a + (r.usage?.inputTokens || 0) + (r.usage?.outputTokens || 0),
    0,
  );

  const errors = results.filter((r) => r.error).length;

  return {
    total,
    successRate,
    avgLatency: latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1),
    maxLatency: Math.max(...latencies, 0),
    minLatency: Math.min(...latencies, 0),
    totalTokens,
    errorCount: errors,
    scoreDistribution: {
      min: Math.min(...scores, 0),
      max: Math.max(...scores, 0),
      mean: successRate,
      median: scores.length ? scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)] : 0,
      variance:
        scores.length > 1
          ? scores.reduce((a, b) => a + (b - successRate) ** 2, 0) / scores.length
          : 0,
    },
  };
}

type EvaluationPipelineContext = {
  items: DatasetItem[];
  results: (RunResult & { evaluations: Evaluation[] })[];
};

export async function runEvaluationPipeline(params: {
  dataset: Dataset;
  runner: Runner;
  evaluators: Evaluator[];
  reporters?: Reporter[];
  options?: RunOptions;
}) {
  const { dataset, runner, evaluators, reporters = [new ConsoleReporter()], options } = params;

  const results: EvaluationPipelineContext["results"] = [];

  const task1 = new Listr<{ items: DatasetItem[] }>([
    {
      title: "Load dataset",
      task: async (ctx, _task) => {
        ctx.items = await dataset.loadWithOptions();
      },
    },
  ]);

  const { items } = await task1.run();

  const task2 = new Listr<EvaluationPipelineContext>(
    items.map((item) => {
      const input = JSON.stringify(item.input);
      return {
        title: `Run evaluations with input: ${input.length > 100 ? `${input.slice(0, 100)}...` : input}...`,
        task: async (ctx, task) => {
          task.output = `Start running agent with input: ${JSON.stringify(item.input, null, 2)}`;

          const runnerResults = runner.run([item], options);

          for await (const result of runnerResults) {
            task.output = `Start running evaluation with: ${JSON.stringify(
              {
                input: result.input,
                output: result.output,
                expected: result.expected,
              },
              null,
              2,
            )}`;

            const evaluations: Evaluation[] = [];
            for (const evaluator of evaluators) {
              const evals = await evaluator.evaluate(result);
              evaluations.push(...evals);
            }

            results.push({ ...result, evaluations });

            task.output = `Finish running evaluation`;
          }

          ctx.results = results;
        },
      };
    }),
    {
      concurrent: options?.concurrency ? Math.min(items.length, options?.concurrency) : false,
      exitOnError: true,
      rendererOptions: {
        collapseSubtasks: false,
      },
    },
  );

  await task2.run();

  const summary: EvaluationSummary = aggregateSummary(results);
  const report: Report = { dataset: dataset.name, results, summary };

  for (const reporter of reporters) {
    await reporter.report(report);
  }
}
