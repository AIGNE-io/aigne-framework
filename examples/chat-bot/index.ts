#!/usr/bin/env npx -y bun

import assert from "node:assert";
import { join } from "node:path";
import { ExecutionEngine } from "@aigne/core";
import { runChatLoopInTerminal } from "@aigne/core/utils/run-chat-loop.js";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

const engine = await ExecutionEngine.load({ path: join(import.meta.dirname, "./agents") });

const chat = engine.agents.chat;
assert(chat, "chat agent should be defined");

const user = engine.call(chat);

await runChatLoopInTerminal(user, {
  welcome: "Welcome to the chat bot! Type '/exit' to quit.",
  defaultQuestion: "10! = ?",
});
