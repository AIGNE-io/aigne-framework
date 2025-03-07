/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

import { execSync } from "node:child_process";
import path, { join } from "node:path";

import { fs, $, chalk } from "zx";

execSync("bumpp --no-tag --no-commit --no-push package.json packages/*/package.json", {
  stdio: "inherit",
});

const { version } = await fs.readJSON("package.json");
fs.writeFileSync("version", version);

console.log(chalk.greenBright(`[info]: start to modify packages version to ${version}`));
const dirPath = path.join(__dirname, "../packages");
let changeLogDirs = fs.readdirSync(dirPath);
changeLogDirs = [join(__dirname, ".."), ...changeLogDirs.map((item) => `${dirPath}/${item}`)];

let newChangelog = "";
const now = new Date();
const currentDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
const title = `## ${version} (${currentDate})`;

try {
  const gitRes = await $`git log --pretty=format:"- %s" "main"...HEAD`;
  newChangelog = gitRes.stdout.trim();
} catch {
  console.error(chalk.redBright("Could not get git log, please write changelog manually."));
}

for (const dir of changeLogDirs) {
  try {
    await fs.ensureFile(`${dir}/CHANGELOG.md`);
    const oldChangelog = await fs.readFile(`${dir}/CHANGELOG.md`, "utf8");
    const changelog = [title, newChangelog, oldChangelog].filter((item) => !!item).join("\n\n");
    await fs.writeFile(`${dir}/CHANGELOG.md`, changelog);

    console.log(
      `\nNow you can make adjustments to ${chalk.cyan("CHANGELOG.md")}. Then press enter to continue.`,
    );
  } catch (error) {
    console.error(error);
  }
}
console.log(chalk.greenBright("[info]: all packages version modified."));

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", process.exit.bind(process, 0));
