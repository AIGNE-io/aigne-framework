## 1.1.0-beta.17 (2025-3-18)

- chore: add support for esm module


## [1.2.0](https://github.com/AIGNE-io/aigne-framework/compare/core-next-v1.1.0...core-next-v1.2.0) (2025-03-18)


### Features

* add Agent FunctionAgent AIAgent MCPAgent and ExecutionEngine ([4d2a5a1](https://github.com/AIGNE-io/aigne-framework/commit/4d2a5a1b3366b8f935f50a0937c2da6e49073348))
* add OrchestratorAgent in agent library ([25a5e9e](https://github.com/AIGNE-io/aigne-framework/commit/25a5e9e6c60d747c8bf484ac884b31dc02c14757))
* add sequential and parallel helper function ([a295697](https://github.com/AIGNE-io/aigne-framework/commit/a295697b5694754e02954fc5c7f382a3b219a3ab))
* add support for MCP resources ([1ded2fb](https://github.com/AIGNE-io/aigne-framework/commit/1ded2fbf222fa8984e75df0852ff384524f73b04))
* **prompt-builder:** support chat history in PromptBuilder ([6ca05f2](https://github.com/AIGNE-io/aigne-framework/commit/6ca05f28eddb683a4f1e228865f8bbf8a8e190f1))
* support run puppeteer example chat loop in terminal ([85ce7f8](https://github.com/AIGNE-io/aigne-framework/commit/85ce7f8de8b443c86e50815dd7bcab99f869c4ce))
* use PromptBuilder instead of string instructions ([e4cb2cb](https://github.com/AIGNE-io/aigne-framework/commit/e4cb2cb6baf4f9bcef390567a4a174e9246c29a3))


### Bug Fixes

* **AIAgent:** should pass both arguments (model generated) and input (user input) to tool ([c49d64e](https://github.com/AIGNE-io/aigne-framework/commit/c49d64ee35f7efd83b0f82f43205bb1c40f999e8))
* **MCP:** catch list resource error treat as empty list ([1885fab](https://github.com/AIGNE-io/aigne-framework/commit/1885fab3585e0dd1467b127e5b47cd0b98282bab))
* use text resource from MCP correctly ([8b9eba8](https://github.com/AIGNE-io/aigne-framework/commit/8b9eba83352ec096a2a5d4f410d4c4bde7420bce))

## 1.1.0-beta.16 (2025-3-18)

- chore: add puppeteer in linux need docker_container

## 1.1.0-beta.15 (2025-3-18)

- chore: make coverage report as text to terminal
- chore: update contributing docs

## 1.1.0-beta.14 (2025-3-18)

- chore(example): add code-execution example

## 1.1.0-beta.13 (2025-3-18)

- feat: add OrchestratorAgent in agent library

## 1.1.0-beta.12 (2025-3-14)

- chore(example): add concurrency reflection handoff workflow examples

## 1.1.0-beta.11 (2025-3-14)

- feat(core): add sequential and parallel helper function
- chore(examples): add workflow-sequential example

## 1.1.0-beta.10 (2025-3-13)

- chore: ensure required environment variables have values

## 1.1.0-beta.9 (2025-3-13)

- fix(MCP): catch list resource error treat as empty list

## 1.1.0-beta.8 (2025-3-13)

- fix(AIAgent): should pass both arguments (model generated) and input (user input) to tool
- chore(examples): add workflow-router example
- chore(examples): rename examples puppeteer-mcp-server and sqlite-mcp-server to mcp-server-puppeteer and mcp-server-sqlite

## 1.1.0-beta.7 (2025-3-13)

- chore: rename @aigne/core to @aigne/core-next

## 1.1.0-beta.6 (2025-3-13)

- chore(examples): default enable mcp debug message for examples

## 1.1.0-beta.5 (2025-3-13)

- feat: support chat history in PromptBuilder
- feat: add `prompts` for MCPAgent to consume prompts from MCP server
- chore: add sqlite-mcp-server example
- test: add more unit test cases

## 1.1.0-beta.4 (2025-3-12)

- feat: support run puppeteer example chat loop in terminal

## 1.1.0-beta.3 (2025-3-11)

- chore: set module type for core package

## 1.1.0-beta.2 (2025-3-11)

- feat: use PromptBuilder instead of string instructions
- refactor: use tools instead of skills
- chore(examples): add puppeteer-mcp-server example

## 1.1.0-beta.1 (2025-3-11)

- feat: add Agent FunctionAgent AIAgent MCPAgent and ExecutionEngine
