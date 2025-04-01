import { isAbsolute, resolve } from "node:path";
import { type Agent, ExecutionEngine } from "@aigne/core";
import { runChatLoopInTerminal } from "@aigne/core/utils/run-chat-loop.js";
import { Command, type OptionValues } from "commander";

interface RunOptions extends OptionValues {
  agent?: string;
}

export function createRunCommand(): Command {
  const runCommand = new Command("run")
    .description("Run a chat loop with the specified agent")
    .argument("<path>", "Path to the agents directory")
    .option("--agent <agent>", "Name of the agent to use (defaults to the first agent found)")
    .action(async (path: string, options: RunOptions) => {
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);

      const engine = await ExecutionEngine.load({ path: absolutePath });

      let agent: Agent | undefined;
      if (options.agent) {
        agent = engine.agents[options.agent];
        if (!agent) {
          console.error(`Agent "${options.agent}" not found.`);
          console.log("Available agents:");
          for (const agent of engine.agents) {
            console.log(`- ${agent.name}`);
          }
          process.exit(1);
        }
      } else {
        agent = engine.agents[0];
        if (!agent) {
          console.error("No agents found in the specified path.");
          process.exit(1);
        }
      }

      const user = engine.call(agent);

      await runChatLoopInTerminal(user, {});
    });

  return runCommand;
}
