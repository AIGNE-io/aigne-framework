import chalk from "chalk";
import gradient from "gradient-string";
import { AIGNE_CLI_VERSION } from "../constants.js";

const modernGradient = gradient(["#4facfe", "#7367f0", "#f86aad"]);

const logo = `
     _    ___ ____ _   _ _____
    / \\  |_ _/ ___| \\ | | ____|
   / _ \\  | | |  _|  \\| |  _|
  / ___ \\ | | |_| | |\\  | |___
 /_/   \\_\\___\\____|_| \\_|_____|
`;

const frameworkInfo = `v${AIGNE_CLI_VERSION}`;

const logoLines = logo.split("\n");
const maxLength = Math.max(...logoLines.filter((line) => line.trim()).map((line) => line.length));
const versionText = frameworkInfo;
const padding = Math.floor((maxLength - versionText.length) / 2);
const centeredVersion = " ".repeat(padding) + versionText;

export const asciiLogo = `${modernGradient(logo)}\n${chalk.cyan(centeredVersion)}\n\n`;
