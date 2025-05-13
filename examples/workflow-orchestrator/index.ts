#!/usr/bin/env bunwrapper

import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, MCPAgent } from "@aigne/core";

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  env: process.env as Record<string, string>,
});

const filesystem = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", import.meta.dir],
});

const finder = AIAgent.from({
  name: "finder",
  description: "Find the closest match to a user's request",
  instructions: `You are an agent that can find information on the web.
You are tasked with finding the closest match to the user's request.
You can use puppeteer to scrape the web for information.
You can also use the filesystem to save the information you find.

Rules:
- do not use screenshot of puppeteer
- use document.body.innerText to get the text content of a page
- if you want a url to some page, you should get all link and it's title of current(home) page,
then you can use the title to search the url of the page you want to visit.
  `,
  skills: [puppeteer, filesystem],
});

const writer = AIAgent.from({
  name: "writer",
  description: "Write to the filesystem",
  instructions: `You are an agent that can write to the filesystem.
  You are tasked with taking the user's input, addressing it, and
  writing the result to disk in the appropriate location.`,
  skills: [filesystem],
});

const agent = OrchestratorAgent.from({
  skills: [finder, writer],
  maxIterations: 3,
  tasksConcurrency: 1, // puppeteer can only run one task at a time
});

await runWithAIGNE(agent, {
  modelOptions: { parallelToolCalls: false },
  chatLoopOptions: {
    welcome: "Welcome to the Orchestrator Agent!",
    defaultQuestion: `\
  Conduct an in-depth research on ArcBlock using only the official website\
  (avoid search engines or third-party sources) and compile a detailed report saved as arcblock.md. \
  The report should include comprehensive insights into the company's products \
  (with detailed research findings and links), technical architecture, and future plans.`,
  },
});

process.exit(0);
