## [1.2.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.1.0...aigne-framework-v1.2.0) (2025-03-18)

- chore: release v1.2.0


## [1.6.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.5.0...aigne-framework-v1.6.0) (2025-04-08)


### Features

* add `serve` command for @aigne/cli ([#54](https://github.com/AIGNE-io/aigne-framework/issues/54)) ([1cca843](https://github.com/AIGNE-io/aigne-framework/commit/1cca843f1760abe832b6651108fa858130f47355))
* add agent library support ([#51](https://github.com/AIGNE-io/aigne-framework/issues/51)) ([1f0d34d](https://github.com/AIGNE-io/aigne-framework/commit/1f0d34ddda3154283a4bc958ddb9b68b4ac106b0))
* support token/call/time limits for ExecutionEngine ([#44](https://github.com/AIGNE-io/aigne-framework/issues/44)) ([5a2ca0a](https://github.com/AIGNE-io/aigne-framework/commit/5a2ca0a033267dd4765f574b53dca71e932e53d4))


### Bug Fixes

* support reconnect to the MCP server automatically ([#50](https://github.com/AIGNE-io/aigne-framework/issues/50)) ([898d83f](https://github.com/AIGNE-io/aigne-framework/commit/898d83f75fc655142b93c70a1afeda376a2e92b4))

## [1.5.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.4.0...aigne-framework-v1.5.0) (2025-03-27)


### Features

* **dx:** show mcp server url on connecting ([#39](https://github.com/AIGNE-io/aigne-framework/issues/39)) ([5819a76](https://github.com/AIGNE-io/aigne-framework/commit/5819a76435fae7333720f9e0c58a25aebc1089e3))


### Bug Fixes

* **dx:** export models/utils in submodules ([#43](https://github.com/AIGNE-io/aigne-framework/issues/43)) ([bd561b3](https://github.com/AIGNE-io/aigne-framework/commit/bd561b397de816f04c2d63d58538e81fba82fc7f))

## [1.4.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.3.1...aigne-framework-v1.4.0) (2025-03-26)


### Features

* **core:** add xAI chat model adapter ([#34](https://github.com/AIGNE-io/aigne-framework/issues/34)) ([b228d22](https://github.com/AIGNE-io/aigne-framework/commit/b228d22b550535ab8e511f13de9e4a65dd73e3c0))


### Bug Fixes

* **orchestrator:** refactor and enhance orchestrator with step synthesis ([#31](https://github.com/AIGNE-io/aigne-framework/issues/31)) ([ba9fca0](https://github.com/AIGNE-io/aigne-framework/commit/ba9fca04fad71d49c8f4f52172b56668a94ea714))

## [1.3.1](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.3.0...aigne-framework-v1.3.1) (2025-03-25)


### Bug Fixes

* **core:** use system message as user message for claude model if needed ([#32](https://github.com/AIGNE-io/aigne-framework/issues/32)) ([316a6d5](https://github.com/AIGNE-io/aigne-framework/commit/316a6d51f885cceee4020c24695f6588f6b7425f))
* simplify mcp examples ([2b0b50e](https://github.com/AIGNE-io/aigne-framework/commit/2b0b50ef278edb938d26e5b31f0be73eb51e9204))

## [1.3.0](https://github.com/AIGNE-io/aigne-framework/compare/aigne-framework-v1.2.0...aigne-framework-v1.3.0) (2025-03-24)


### Features

* **core:** add ChatModelClaude to use models of anthropic ([#30](https://github.com/AIGNE-io/aigne-framework/issues/30)) ([0a62a64](https://github.com/AIGNE-io/aigne-framework/commit/0a62a6499e3da723a4646e67952051708ce7de6a))
* **core:** add support for subscribing topics for agent memory ([#28](https://github.com/AIGNE-io/aigne-framework/issues/28)) ([eeecc67](https://github.com/AIGNE-io/aigne-framework/commit/eeecc67049a60ebcc4cdba0fbcd987b3d81f4af6))


### Bug Fixes

* **core:** enforce stricter input/output type checks ([#26](https://github.com/AIGNE-io/aigne-framework/issues/26)) ([ef8cf53](https://github.com/AIGNE-io/aigne-framework/commit/ef8cf53586aff08a809909c56ab2a20f215fa129))
* rename @aigne/core-next to @aigne/core ([3a81009](https://github.com/AIGNE-io/aigne-framework/commit/3a8100962c81813217b687ae28e8de604419c622))

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
