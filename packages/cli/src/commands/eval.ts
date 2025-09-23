import { isAbsolute, resolve } from "node:path";
import { exists } from "@aigne/agent-library/utils/fs.js";
import type { Agent } from "@aigne/core";
import type { CommandModule } from "yargs";
import { z } from "zod";
import { runEvaluationPipeline } from "../utils/evaluation/core.js";
import { FileDataset } from "../utils/evaluation/dataset.js";
import { LLMAsJudgeEvaluator } from "../utils/evaluation/evaluator.js";
import { ConsoleReporter, ExcelReporter } from "../utils/evaluation/reporter.js";
import { DefaultRunnerWithConcurrency } from "../utils/evaluation/runner.js";
import { loadAIGNE } from "../utils/load-aigne.js";

const schema = z.object({
  path: z.string().optional(),
  entryAgent: z.string(),
  dataset: z.string(),
  evaluatorAgent: z.string().optional(),
  concurrency: z.number().optional(),
  reporter: z.string().optional(),
});

const getResolvePath = (path: string) => {
  return isAbsolute(path) ? path : resolve(process.cwd(), path);
};

export function createEvalCommand({
  aigneFilePath,
}: {
  aigneFilePath?: string;
} = {}): CommandModule<
  unknown,
  {
    path?: string;
    entryAgent?: string;
    dataset?: string;
    evaluatorAgent?: string;
    concurrency?: number;
    reporter?: string;
  }
> {
  return {
    command: "eval [path] [entry-agent]",
    describe: "Evaluation AIGNE for the specified path",
    builder: async (yargs) => {
      return yargs
        .positional("path", {
          type: "string",
          describe: "Path to the agents directory or URL to an aigne project",
          default: ".",
        })
        .positional("entry-agent", {
          type: "string",
          describe: "Name of the agent to run (defaults to the entry agent if not specified)",
        })
        .positional("dataset", {
          type: "string",
          describe: "Path to the dataset file",
        })
        .positional("evaluator-agent", {
          type: "string",
          describe: "Name of the evaluator to use",
        })
        .positional("reporter", {
          type: "string",
          describe: "Path to the reporter file",
        })
        .positional("concurrency", {
          type: "number",
          describe: "Concurrency level",
          default: 1,
        })
        .help(false)
        .version(false)
        .strict(false);
    },
    handler: async (options) => {
      const parsedOptions = await schema.safeParseAsync(options);
      if (!parsedOptions.success) {
        throw new Error(`Invalid options: ${JSON.stringify(parsedOptions.error.format())}`);
      }

      const {
        entryAgent,
        dataset: datasetPath,
        evaluatorAgent: evaluatorName,
        concurrency,
      } = parsedOptions.data;

      const path = parsedOptions.data?.path;
      const aigne = await loadAIGNE({ path: aigneFilePath || path || "." });

      const resolvedDatasetPath = getResolvePath(datasetPath);
      if (!(await exists(resolvedDatasetPath))) {
        throw new Error("Dataset file does not exist");
      }

      const { chat } = aigne.cli;
      const agent =
        chat && chat.name === options.agent
          ? chat
          : aigne.cli.agents[entryAgent] ||
            aigne.agents[entryAgent] ||
            aigne.skills[entryAgent] ||
            aigne.mcpServer.agents[entryAgent];

      if (!agent) throw new Error("Entry agent does not exist");
      agent.model = agent.model ?? aigne.model;

      let evaluatorAgent: Agent | undefined;
      if (evaluatorName) {
        evaluatorAgent =
          aigne.cli.agents[evaluatorName] ||
          aigne.agents[evaluatorName] ||
          aigne.skills[evaluatorName] ||
          aigne.mcpServer.agents[evaluatorName];
      }

      if (evaluatorAgent) {
        evaluatorAgent.model = evaluatorAgent.model ?? aigne.model;
      }

      const dataset = new FileDataset(resolvedDatasetPath);
      const runner = new DefaultRunnerWithConcurrency(agent, aigne);
      const evaluator = new LLMAsJudgeEvaluator(aigne, evaluatorAgent);
      const reporters = [new ConsoleReporter()];
      if (options.reporter) {
        const resolvedReporterPath = getResolvePath(options.reporter);
        const reporter = new ExcelReporter(resolvedReporterPath);
        reporters.push(reporter);
      }

      await runEvaluationPipeline({
        dataset,
        runner,
        evaluators: [evaluator],
        reporters: reporters,
        options: { concurrency },
      });
    },
  };
}
