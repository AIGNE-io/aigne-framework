/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

import { execSync } from "node:child_process";
import path from "node:path";

import { fs, $, chalk } from "zx";

execSync(
  "bumpp --no-tag --no-commit --no-push package.json blocklets/*/package.json packages/*/package.json framework/*/package.json",
  {
    stdio: "inherit",
  },
);

const { version } = await fs.readJSON("package.json");
await fs.writeFileSync("version", version);

console.log(chalk.greenBright(`[info]: start to modify blocklets version to ${version}`));
const dirPath = path.join(__dirname, "../blocklets");
let pathList = await fs.readdirSync(dirPath);
pathList = pathList.map((item) => `${dirPath}/${item}`);

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

for (const ymlDir of pathList) {
  await $`cd ${ymlDir} && blocklet version ${version}`;

  try {
    await fs.ensureFile(`${ymlDir}/CHANGELOG.md`);
    const oldChangelog = await fs.readFile(`${ymlDir}/CHANGELOG.md`, "utf8");
    const changelog = [title, newChangelog, oldChangelog].filter((item) => !!item).join("\n\n");
    await fs.writeFile(`${ymlDir}/CHANGELOG.md`, changelog);

    console.log(
      `\nNow you can make adjustments to ${chalk.cyan("CHANGELOG.md")}. Then press enter to continue.`,
    );
  } catch (error) {
    console.error(error);
  }
}
console.log(chalk.greenBright("[info]: all blocklets version modified."));

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", process.exit.bind(process, 0));
