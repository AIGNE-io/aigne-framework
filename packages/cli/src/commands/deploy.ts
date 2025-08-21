import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { access, copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, isAbsolute, join, resolve } from "node:path";
import { Listr } from "@aigne/listr2";
import { input as inputInquirer, select as selectInquirer } from "@inquirer/prompts";
import { ListrInquirerPromptAdapter } from "@listr2/prompt-adapter-inquirer";
import { parse, stringify } from "yaml";
import type { CommandModule } from "yargs";

interface DeployOptions {
  path?: string;
  endpoint?: string;
}

async function fileExists(p: string) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const DEPLOYED_FILE = "deployed.yaml";

export async function run(cmd: string, args: string[] = [], opts: any = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const { catchOutput = true, ...rest } = opts;
    const spawnOpts = { shell: true, ...rest, stdio: catchOutput ? "pipe" : "inherit" };
    const child = spawn(cmd, args, spawnOpts);

    if (catchOutput) {
      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(stderr.trim() || `Process failed with code ${code}`));
        }
      });
    } else {
      child.on("close", (code) => {
        if (code === 0) {
          resolve("");
        } else {
          reject(new Error(`${cmd} ${args.join(" ")} failed with code ${code}`));
        }
      });
    }
  });
}

export function createDeployCommands(): CommandModule<unknown, DeployOptions> {
  return {
    command: "deploy",
    describe: "Deploy an aigne application",
    builder: (yargs) => {
      return yargs
        .option("path", {
          type: "string",
        })
        .option("endpoint", {
          type: "string",
          describe: "Deploy an aigne application to a specified endpoint.",
        });
    },
    handler: async (argv) => {
      const path = argv.path;
      const endpoint = argv.endpoint;

      if (!path) {
        console.error("path is required");
        process.exit(1);
      }

      if (!endpoint) {
        console.error("endpoint is required");
        process.exit(1);
      }

      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);
      await deploy(absolutePath, endpoint);
    },
  };
}

async function copyDir(src: string, dest: string) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  const skip = [".deploy", "node_modules"];

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (skip.includes(entry.name)) continue;

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

const deploy = async (path: string, endpoint: string) => {
  const aigneHomeDir = join(homedir(), ".aigne");
  if (!(await fileExists(aigneHomeDir))) {
    await mkdir(aigneHomeDir, { recursive: true });
  }

  const deployRoot = join(path, ".deploy");
  const agentDest = join(deployRoot, "agent");

  const tasks = new Listr<{ logs: string[] }>(
    [
      {
        title: "Prepare deploy environment",
        task: async (ctx, task) => {
          ctx.logs = [];

          task.output = "Preparing deploy environment...";

          const entryFile = join(path, "aigne.yaml");
          if (!(await fileExists(entryFile))) {
            throw new Error(`Entry file not found: ${entryFile}`);
          }

          await rm(deployRoot, { recursive: true, force: true });

          task.output = "Copying template files...";

          const templatePath = join(import.meta.dirname, "../../templates/blocklet");
          await copyDir(templatePath, deployRoot);

          await copyDir(path, agentDest);

          const specialFiles = [
            "package.json",
            "package-lock.json",
            "README.md",
            "CHANGELOG.md",
            "biome.json",
          ];
          for (const file of specialFiles) {
            const srcFile = join(path, file);
            if (await fileExists(srcFile)) {
              await copyFile(srcFile, join(deployRoot, file));
              await rm(join(deployRoot, file), { force: true });
            }
          }

          if (await fileExists(join(deployRoot, "package.json"))) {
            task.output = "Running npm install...";
            await run("npm", ["install"], { cwd: deployRoot });
          }
        },
      },
      {
        title: "Check Blocklet CLI",
        task: async (_, task) => {
          try {
            task.output = "Checking Blocklet CLI Version...";
            await run("blocklet", ["--version"], { cwd: deployRoot });
          } catch {
            task.output = "Blocklet CLI not installed, asking to install...";
            const { install } = await task
              .prompt(ListrInquirerPromptAdapter as any)
              .run(selectInquirer, {
                type: "list",
                name: "install",
                message: "Install Blocklet CLI?",
                choices: ["yes", "no"],
                default: "yes",
              });

            if (install === "yes") {
              task.output = "Installing Blocklet CLI...";
              await run("npm", ["install", "-g", "@blocklet/cli"], { cwd: deployRoot });
            } else {
              throw new Error(
                "Blocklet CLI not found, please install manually: npm install -g @blocklet/cli",
              );
            }
          }
        },
      },
      {
        title: "Configure Blocklet",
        task: async (ctx, task) => {
          task.output = "Configuring Blocklet...";

          if (await fileExists(join(deployRoot, "blocklet.yml"))) {
            const entryFile = join(path, "aigne.yaml");
            const aigneFile = await readFile(entryFile, "utf-8");
            const aigneData = parse(aigneFile);
            const agentName = aigneData.name;
            const deployed = parse(
              await readFile(join(aigneHomeDir, DEPLOYED_FILE), "utf-8").catch(() => stringify({})),
            );

            let blockletName = deployed[path]?.name;

            if (!blockletName) {
              task.output = "Asking for Blocklet name...";
              blockletName = await task
                .prompt(ListrInquirerPromptAdapter as any)
                .run(inputInquirer, {
                  type: "input",
                  name: "blockletName",
                  message: "Please input agent blocklet name:",
                  default: deployed[path]?.name || agentName || basename(path),
                  validate: (input: string) => {
                    if (input.trim() === "") return "Blocklet name cannot be empty.";
                    return true;
                  },
                });
            }

            let did = deployed[path]?.did;
            if (!did) {
              task.output = "Creating DID...";
              const info = await run("blocklet", ["create", "--did-only"], {
                cwd: deployRoot,
                catchOutput: true,
              });

              const match = info.match(/Created Blocklet DID:\s+(\S+)/);
              if (match?.[1]) {
                did = match[1];
              } else {
                throw new Error(`DID not found. Output content: ${info}`);
              }
            }

            task.output = `Blocklet name: ${blockletName}, DID: ${did}`;
            ctx.logs.push(task.output);

            const yml = await readFile(join(deployRoot, "blocklet.yml"), "utf-8");
            const data = parse(yml);
            data.name = blockletName;
            data.title = blockletName;
            data.did = did;

            await writeFile(join(deployRoot, "blocklet.yml"), stringify(data));
            await writeFile(
              join(aigneHomeDir, DEPLOYED_FILE),
              stringify({ ...deployed, [path]: { name: blockletName, did } }),
            );
          }
        },
      },
      {
        title: "Bundle Blocklet",
        task: async (_, task) => {
          task.output = "Running blocklet bundle...";
          await run("blocklet", ["bundle", "--create-release"], { cwd: deployRoot });
        },
      },
      {
        title: "Deploy to target endpoint",
        task: async (_, task) => {
          task.output = `Deploying to ${endpoint}...`;
          await run("blocklet", ["deploy", "--endpoint", endpoint, ".blocklet/bundle"], {
            cwd: deployRoot,
          });
        },
      },
      {
        title: "Clean deploy files",
        task: async () => {
          await rm(deployRoot, { recursive: true, force: true });
        },
      },
    ],
    {
      concurrent: false,
      exitOnError: true,
      rendererOptions: {
        collapseSubtasks: false,
      },
    },
  );

  try {
    await tasks.run();
    console.log(`✅ Deploy completed: ${path} -> ${endpoint}`);
  } catch (error) {
    console.error(`❌ Deploy failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};
