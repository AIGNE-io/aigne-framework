import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { cp } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { Command } from "commander";
import inquirer from "inquirer";

export function createCreateCommand(): Command {
  return new Command("create")
    .description("Create a new aigne project with agent config files")
    .argument("[path]", "Path to create the project directory", ".")
    .action(async (_path: string) => {
      let path = _path;

      if (path === ".") {
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "projectName",
            message: "Project name:",
            default: _path !== "." ? _path : "my-aigne-project",
            validate: (input) => {
              if (input.trim() === "") return "Project name cannot be empty.";

              return true;
            },
          },
        ]);
        path = answers.projectName;
      }

      path = isAbsolute(path) ? path : resolve(process.cwd(), path);

      const isPathNotEmpty = existsSync(path) && readdirSync(path).length > 0;
      if (isPathNotEmpty) {
        const answers = await inquirer.prompt([
          {
            type: "confirm",
            name: "overwrite",
            message: `The directory "${path}" is not empty. Do you want to remove its contents?`,
            default: false,
          },
        ]);

        if (!answers.overwrite) {
          console.log("Operation cancelled.");
          process.exit(0);
        }
      }

      const templates = [{ name: "default" }];

      const { template } = await inquirer.prompt([
        {
          type: "list",
          name: "template",
          message: "Select a template:",
          choices: templates.map((t) => t.name),
          default: "default",
        },
      ]);

      mkdirSync(path, { recursive: true });

      const templatePath = join(import.meta.dirname, "../../templates", template);

      if (!existsSync(templatePath)) throw new Error(`Template "${template}" not found.`);

      const files = readdirSync(templatePath);
      for (const file of files) {
        const source = join(templatePath, file);
        const destination = join(path, file);
        await cp(source, destination, { recursive: true, force: true });
      }

      console.log("\n✅ AIGNE project created successfully!");
      console.log(
        `\nTo use your new agent, run:\n  cd ${relative(process.cwd(), path)} && aigne run`,
      );
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
