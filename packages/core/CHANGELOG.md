## [1.3.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.2.0...core-v1.3.0) (2025-03-24)


### Features

* add Agent FunctionAgent AIAgent MCPAgent and ExecutionEngine ([4d2a5a1](https://github.com/AIGNE-io/aigne-framework/commit/4d2a5a1b3366b8f935f50a0937c2da6e49073348))
* add OrchestratorAgent in agent library ([25a5e9e](https://github.com/AIGNE-io/aigne-framework/commit/25a5e9e6c60d747c8bf484ac884b31dc02c14757))
* add sequential and parallel helper function ([a295697](https://github.com/AIGNE-io/aigne-framework/commit/a295697b5694754e02954fc5c7f382a3b219a3ab))
* add support for MCP resources ([1ded2fb](https://github.com/AIGNE-io/aigne-framework/commit/1ded2fbf222fa8984e75df0852ff384524f73b04))
* **core:** add ChatModelClaude to use models of anthropic ([#30](https://github.com/AIGNE-io/aigne-framework/issues/30)) ([0a62a64](https://github.com/AIGNE-io/aigne-framework/commit/0a62a6499e3da723a4646e67952051708ce7de6a))
* **core:** add support for subscribing topics for agent memory ([#28](https://github.com/AIGNE-io/aigne-framework/issues/28)) ([eeecc67](https://github.com/AIGNE-io/aigne-framework/commit/eeecc67049a60ebcc4cdba0fbcd987b3d81f4af6))
* **prompt-builder:** support chat history in PromptBuilder ([6ca05f2](https://github.com/AIGNE-io/aigne-framework/commit/6ca05f28eddb683a4f1e228865f8bbf8a8e190f1))
* support run puppeteer example chat loop in terminal ([85ce7f8](https://github.com/AIGNE-io/aigne-framework/commit/85ce7f8de8b443c86e50815dd7bcab99f869c4ce))
* use PromptBuilder instead of string instructions ([e4cb2cb](https://github.com/AIGNE-io/aigne-framework/commit/e4cb2cb6baf4f9bcef390567a4a174e9246c29a3))


### Bug Fixes

* **AIAgent:** should pass both arguments (model generated) and input (user input) to tool ([c49d64e](https://github.com/AIGNE-io/aigne-framework/commit/c49d64ee35f7efd83b0f82f43205bb1c40f999e8))
* **core:** enforce stricter input/output type checks ([#26](https://github.com/AIGNE-io/aigne-framework/issues/26)) ([ef8cf53](https://github.com/AIGNE-io/aigne-framework/commit/ef8cf53586aff08a809909c56ab2a20f215fa129))
* **MCP:** catch list resource error treat as empty list ([1885fab](https://github.com/AIGNE-io/aigne-framework/commit/1885fab3585e0dd1467b127e5b47cd0b98282bab))
* rename @aigne/core-next to @aigne/core ([3a81009](https://github.com/AIGNE-io/aigne-framework/commit/3a8100962c81813217b687ae28e8de604419c622))
* use text resource from MCP correctly ([8b9eba8](https://github.com/AIGNE-io/aigne-framework/commit/8b9eba83352ec096a2a5d4f410d4c4bde7420bce))

## [1.8.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.7.0...core-v1.8.0) (2025-04-17)


### Features

* **ci:** support coverage examples with model matrix ([#59](https://github.com/AIGNE-io/aigne-framework/issues/59)) ([1edd704](https://github.com/AIGNE-io/aigne-framework/commit/1edd70426b80a69e3751b2d5fe818297711d0777))
* **cli:** support model and download customization for aigne run ([#61](https://github.com/AIGNE-io/aigne-framework/issues/61)) ([51f6619](https://github.com/AIGNE-io/aigne-framework/commit/51f6619e6c591a84f1f2339b26ef66d89fa9486e))


### Bug Fixes

* **mcp:** set default timeout to 60s ([#67](https://github.com/AIGNE-io/aigne-framework/issues/67)) ([40dc029](https://github.com/AIGNE-io/aigne-framework/commit/40dc029b7795650283a505fd71b9566e5f0a4471))

## [1.7.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.6.0...core-v1.7.0) (2025-04-15)


### Features

* add TerminalTracer for better UX in terminal ([#56](https://github.com/AIGNE-io/aigne-framework/issues/56)) ([9875a5d](https://github.com/AIGNE-io/aigne-framework/commit/9875a5d46abb55073340ffae841fed6bd6b83ff4))
* **cli:** support run agents from remote URL ([#60](https://github.com/AIGNE-io/aigne-framework/issues/60)) ([5f49920](https://github.com/AIGNE-io/aigne-framework/commit/5f4992089d36f9e780ba55a912a1d35508cad28e))
* **core:** support oauth for McpAgent with example ([#55](https://github.com/AIGNE-io/aigne-framework/issues/55)) ([9420f3a](https://github.com/AIGNE-io/aigne-framework/commit/9420f3a56cf18986cd45f173044e660be76daab4))


### Bug Fixes

* remove usage of new Node.js exists API for compatibility ([#57](https://github.com/AIGNE-io/aigne-framework/issues/57)) ([c10cc08](https://github.com/AIGNE-io/aigne-framework/commit/c10cc086d8ecd0744f38cdb1367d4c8816b723b3))

## [1.6.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.5.0...core-v1.6.0) (2025-04-08)


### Features

* add `serve` command for @aigne/cli ([#54](https://github.com/AIGNE-io/aigne-framework/issues/54)) ([1cca843](https://github.com/AIGNE-io/aigne-framework/commit/1cca843f1760abe832b6651108fa858130f47355))
* add agent library support ([#51](https://github.com/AIGNE-io/aigne-framework/issues/51)) ([1f0d34d](https://github.com/AIGNE-io/aigne-framework/commit/1f0d34ddda3154283a4bc958ddb9b68b4ac106b0))
* support token/call/time limits for ExecutionEngine ([#44](https://github.com/AIGNE-io/aigne-framework/issues/44)) ([5a2ca0a](https://github.com/AIGNE-io/aigne-framework/commit/5a2ca0a033267dd4765f574b53dca71e932e53d4))


### Bug Fixes

* support reconnect to the MCP server automatically ([#50](https://github.com/AIGNE-io/aigne-framework/issues/50)) ([898d83f](https://github.com/AIGNE-io/aigne-framework/commit/898d83f75fc655142b93c70a1afeda376a2e92b4))

## [1.5.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.4.0...core-v1.5.0) (2025-03-27)


### Features

* **dx:** show mcp server url on connecting ([#39](https://github.com/AIGNE-io/aigne-framework/issues/39)) ([5819a76](https://github.com/AIGNE-io/aigne-framework/commit/5819a76435fae7333720f9e0c58a25aebc1089e3))


### Bug Fixes

* **dx:** export models/utils in submodules ([#43](https://github.com/AIGNE-io/aigne-framework/issues/43)) ([bd561b3](https://github.com/AIGNE-io/aigne-framework/commit/bd561b397de816f04c2d63d58538e81fba82fc7f))

## [1.4.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.3.1...core-v1.4.0) (2025-03-26)


### Features

* **core:** add xAI chat model adapter ([#34](https://github.com/AIGNE-io/aigne-framework/issues/34)) ([b228d22](https://github.com/AIGNE-io/aigne-framework/commit/b228d22b550535ab8e511f13de9e4a65dd73e3c0))


### Bug Fixes

* **orchestrator:** refactor and enhance orchestrator with step synthesis ([#31](https://github.com/AIGNE-io/aigne-framework/issues/31)) ([ba9fca0](https://github.com/AIGNE-io/aigne-framework/commit/ba9fca04fad71d49c8f4f52172b56668a94ea714))

## [1.3.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.3.0...core-v1.3.1) (2025-03-25)


### Bug Fixes

* **core:** use system message as user message for claude model if needed ([#32](https://github.com/AIGNE-io/aigne-framework/issues/32)) ([316a6d5](https://github.com/AIGNE-io/aigne-framework/commit/316a6d51f885cceee4020c24695f6588f6b7425f))

## [1.2.0](https://github.com/AIGNE-io/aigne-framework/compare/core-next-v1.1.0...core-next-v1.2.0) (2025-03-18)

- chore: release v1.2.0

## 1.1.0-beta.17 (2025-3-18)

- chore: add support for esm module


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

- chore: rename @aigne/core to @aigne/core

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
