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

## [1.15.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.14.0...core-v1.15.0) (2025-05-15)


### Features

* optimize the stability of the model and ci ([#119](https://github.com/AIGNE-io/aigne-framework/issues/119)) ([de93887](https://github.com/AIGNE-io/aigne-framework/commit/de938879452a8be82a198dda0eda1eb9fcbb0474))


### Bug Fixes

* **core:** response.headers.toJSON is not a function ([#121](https://github.com/AIGNE-io/aigne-framework/issues/121)) ([4609ba6](https://github.com/AIGNE-io/aigne-framework/commit/4609ba645e6b8fe8d76ecd475cd2d7817483a4bd))

## [1.14.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.13.0...core-v1.14.0) (2025-05-12)


### Features

* **docs:** use typedoc build and publish docs to gh-pages ([#100](https://github.com/AIGNE-io/aigne-framework/issues/100)) ([b9074c0](https://github.com/AIGNE-io/aigne-framework/commit/b9074c0148ea343ada92b5919a52b47537a1ad48))
* **memory:** allow agents to act as retrievers and recorders in memory ([#65](https://github.com/AIGNE-io/aigne-framework/issues/65)) ([2bafcbb](https://github.com/AIGNE-io/aigne-framework/commit/2bafcbb66a94fcf55dad8c21ede483eaf075c11d))
* optimize the stability of ci and example ([#113](https://github.com/AIGNE-io/aigne-framework/issues/113)) ([d16ed6c](https://github.com/AIGNE-io/aigne-framework/commit/d16ed6cb60faea19fb4f1c12e1f83d69563b153f))


### Bug Fixes

* **core:** default catch tool's error and continue processing ([#115](https://github.com/AIGNE-io/aigne-framework/issues/115)) ([983b0de](https://github.com/AIGNE-io/aigne-framework/commit/983b0de491afb3f0904e145cb491d432b62f9312))
* **core:** handle response for UserAgent automatically in pub/sub mode ([#116](https://github.com/AIGNE-io/aigne-framework/issues/116)) ([b659714](https://github.com/AIGNE-io/aigne-framework/commit/b659714f2398ea042f21cb22eccc1014f181cd46))

## [1.13.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.12.0...core-v1.13.0) (2025-04-30)


### Features

* **core:** add BedrockChatModel support ([#101](https://github.com/AIGNE-io/aigne-framework/issues/101)) ([a0b98f0](https://github.com/AIGNE-io/aigne-framework/commit/a0b98f01bd78a135232226548848fa35a64982d1))


### Bug Fixes

* **core:** deduplicate tools for chat model ([#103](https://github.com/AIGNE-io/aigne-framework/issues/103)) ([570be6d](https://github.com/AIGNE-io/aigne-framework/commit/570be6d8620ab5b9a0149f835ecd4641009a8654))
* export server/client api types ([93e5341](https://github.com/AIGNE-io/aigne-framework/commit/93e5341dde7a6851f08a3d4e2f6c1a1db91765e9))

## [1.12.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.11.0...core-v1.12.0) (2025-04-27)


### Features

* add AIGNEServer/AIGNEClient api to serve agents via network ([#96](https://github.com/AIGNE-io/aigne-framework/issues/96)) ([1f2dfa3](https://github.com/AIGNE-io/aigne-framework/commit/1f2dfa3a6a2568373063cea3c874b573d0a248d3))
* **core:** support streamable http transport for mcp agents ([#92](https://github.com/AIGNE-io/aigne-framework/issues/92)) ([37da490](https://github.com/AIGNE-io/aigne-framework/commit/37da490538298d882ec328e4b3304395a6cd8cf7))
* support TeamAgent and finalize API naming ([#91](https://github.com/AIGNE-io/aigne-framework/issues/91)) ([033d1b6](https://github.com/AIGNE-io/aigne-framework/commit/033d1b6a7dc5460807476abb35a413ba89a2a664))


### Bug Fixes

* **core:** prioritize self model before falling back to context ([#97](https://github.com/AIGNE-io/aigne-framework/issues/97)) ([2a3d067](https://github.com/AIGNE-io/aigne-framework/commit/2a3d067442200657d8ef3b5314930cc14302f6bf))
* upgrade to streamable api for serve mcp command ([#98](https://github.com/AIGNE-io/aigne-framework/issues/98)) ([ae32bda](https://github.com/AIGNE-io/aigne-framework/commit/ae32bda20e57c2a2eb8b49fad034b0b2a5ebb15e))

## [1.11.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.10.0...core-v1.11.0) (2025-04-23)


### Features

* **core:** enhance ClaudeChatModel to support streaming responses ([#85](https://github.com/AIGNE-io/aigne-framework/issues/85)) ([5433240](https://github.com/AIGNE-io/aigne-framework/commit/5433240e7b663ec9e9f4a79dffa05038088d54fc))
* support set memory in agent yaml ([#90](https://github.com/AIGNE-io/aigne-framework/issues/90)) ([215118f](https://github.com/AIGNE-io/aigne-framework/commit/215118f1dc55f02322d59a3f18395a459198e031))


### Bug Fixes

* **core:** router model should support streaming response ([#88](https://github.com/AIGNE-io/aigne-framework/issues/88)) ([4fb4d92](https://github.com/AIGNE-io/aigne-framework/commit/4fb4d92f8b36011437efba3265591b2477f2d680))

## [1.10.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.9.0...core-v1.10.0) (2025-04-22)


### Features

* **stream:** add streaming output support for agent ([#73](https://github.com/AIGNE-io/aigne-framework/issues/73)) ([5f3ea4b](https://github.com/AIGNE-io/aigne-framework/commit/5f3ea4bccda7c8c457d6e9518b3d6a8b254ec041))


### Bug Fixes

* **core:** support dynamic model capability detection ([#72](https://github.com/AIGNE-io/aigne-framework/issues/72)) ([9d56d98](https://github.com/AIGNE-io/aigne-framework/commit/9d56d9885778962e5bef806445ad8c4d199f2c65))

## [1.9.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.8.0...core-v1.9.0) (2025-04-20)


### Features

* **core:** add model adapters for DeepSeek, Gemini, OpenRouter, and Ollama ([#53](https://github.com/AIGNE-io/aigne-framework/issues/53)) ([5d40546](https://github.com/AIGNE-io/aigne-framework/commit/5d40546bd5ddb70233d27ea3b20e5711b2af320a))


### Bug Fixes

* **dx:** custom error message for agent input/output validation ([#71](https://github.com/AIGNE-io/aigne-framework/issues/71)) ([5145673](https://github.com/AIGNE-io/aigne-framework/commit/5145673aaae2cd6665912e80b1c644e974c42b2f))

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
