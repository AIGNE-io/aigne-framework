import "reflect-metadata";

import { join } from "node:path";

import { Command, program } from "commander";
import { existsSync, writeFileSync } from "fs-extra";

import { Runtime } from "../runtime";
import { generateWrapperCode } from "./utils/generate-wrapper-code";

program
  .addCommand(
    new Command("gen-code")
      .requiredOption("-p, --project <string>", "path to AIGNE project")
      .action(async ({ project }) => {
        if (typeof project !== "string" || !existsSync(project)) {
          throw new Error(`Invalid project path: ${project}`);
        }
        (async () => {
          const runtime = await Runtime.load({ path: project });
          const files = await generateWrapperCode(
            runtime.options.projectDefinition!,
          );
          for (const { fileName, content } of files) {
            writeFileSync(join(project, fileName), content);
          }
        })();
      }),
  )
  .parse(process.argv);
