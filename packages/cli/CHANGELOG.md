# Changelog

## [1.11.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.0...cli-v1.11.1) (2025-05-30)


### Bug Fixes

* respect DEBUG env for logger ([#142](https://github.com/AIGNE-io/aigne-framework/issues/142)) ([f84738a](https://github.com/AIGNE-io/aigne-framework/commit/f84738acb382d9fb4f47253fcf91c92c02200053))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/anthropic bumped to 0.2.2
    * @aigne/bedrock bumped to 0.2.2
    * @aigne/core bumped to 1.18.1
    * @aigne/deepseek bumped to 0.2.2
    * @aigne/gemini bumped to 0.2.2
    * @aigne/ollama bumped to 0.2.2
    * @aigne/open-router bumped to 0.2.2
    * @aigne/openai bumped to 0.2.2
    * @aigne/xai bumped to 0.2.2

## [1.11.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.10.1...cli-v1.11.0) (2025-05-29)


### Features

* add memory agents support for client agent ([#139](https://github.com/AIGNE-io/aigne-framework/issues/139)) ([57044fa](https://github.com/AIGNE-io/aigne-framework/commit/57044fa87b8abcba395cd05f941d6d312ab65764))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/anthropic bumped to 0.2.1
    * @aigne/bedrock bumped to 0.2.1
    * @aigne/core bumped to 1.18.0
    * @aigne/deepseek bumped to 0.2.1
    * @aigne/gemini bumped to 0.2.1
    * @aigne/ollama bumped to 0.2.1
    * @aigne/open-router bumped to 0.2.1
    * @aigne/openai bumped to 0.2.1
    * @aigne/xai bumped to 0.2.1

## [1.10.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.10.0...cli-v1.10.1) (2025-05-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/anthropic bumped to 0.2.0
    * @aigne/bedrock bumped to 0.2.0
    * @aigne/core bumped to 1.17.0
    * @aigne/deepseek bumped to 0.2.0
    * @aigne/gemini bumped to 0.2.0
    * @aigne/ollama bumped to 0.2.0
    * @aigne/open-router bumped to 0.2.0
    * @aigne/openai bumped to 0.2.0
    * @aigne/xai bumped to 0.2.0

## [1.10.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.9.1...cli-v1.10.0) (2025-05-23)


### Features

* add `--chat` option for `run` command ([#120](https://github.com/AIGNE-io/aigne-framework/issues/120)) ([7699550](https://github.com/AIGNE-io/aigne-framework/commit/76995507001ca33b09b29f72ff588dae513cb340))
* **models:** publish model adapters as standalone packages ([#126](https://github.com/AIGNE-io/aigne-framework/issues/126)) ([588b8ae](https://github.com/AIGNE-io/aigne-framework/commit/588b8aea6abcee5fa87def1358bf51f84021c6ef))


### Bug Fixes

* **cli:** listr ctx maybe undefined ([#130](https://github.com/AIGNE-io/aigne-framework/issues/130)) ([dfc7b13](https://github.com/AIGNE-io/aigne-framework/commit/dfc7b139e05cf9b6e0314f42f308d25e9b70ea5c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/anthropic bumped to 0.1.0
    * @aigne/bedrock bumped to 0.1.0
    * @aigne/core bumped to 1.16.0
    * @aigne/deepseek bumped to 0.1.0
    * @aigne/gemini bumped to 0.1.0
    * @aigne/ollama bumped to 0.1.0
    * @aigne/open-router bumped to 0.1.0
    * @aigne/openai bumped to 0.1.0
    * @aigne/xai bumped to 0.1.0

## [1.9.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.9.0...cli-v1.9.1) (2025-05-15)


### Bug Fixes

* **core:** response.headers.toJSON is not a function ([#121](https://github.com/AIGNE-io/aigne-framework/issues/121)) ([4609ba6](https://github.com/AIGNE-io/aigne-framework/commit/4609ba645e6b8fe8d76ecd475cd2d7817483a4bd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.15.0

## [1.9.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.8.1...cli-v1.9.0) (2025-05-12)


### Features

* **docs:** use typedoc build and publish docs to gh-pages ([#100](https://github.com/AIGNE-io/aigne-framework/issues/100)) ([b9074c0](https://github.com/AIGNE-io/aigne-framework/commit/b9074c0148ea343ada92b5919a52b47537a1ad48))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.14.0

## [1.8.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.8.0...cli-v1.8.1) (2025-04-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.13.0

## [1.8.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.7.0...cli-v1.8.0) (2025-04-27)


### Features

* support TeamAgent and finalize API naming ([#91](https://github.com/AIGNE-io/aigne-framework/issues/91)) ([033d1b6](https://github.com/AIGNE-io/aigne-framework/commit/033d1b6a7dc5460807476abb35a413ba89a2a664))


### Bug Fixes

* upgrade to streamable api for serve mcp command ([#98](https://github.com/AIGNE-io/aigne-framework/issues/98)) ([ae32bda](https://github.com/AIGNE-io/aigne-framework/commit/ae32bda20e57c2a2eb8b49fad034b0b2a5ebb15e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.12.0

## [1.7.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.6.0...cli-v1.7.0) (2025-04-23)


### Features

* **core:** enhance ClaudeChatModel to support streaming responses ([#85](https://github.com/AIGNE-io/aigne-framework/issues/85)) ([5433240](https://github.com/AIGNE-io/aigne-framework/commit/5433240e7b663ec9e9f4a79dffa05038088d54fc))
* support set memory in agent yaml ([#90](https://github.com/AIGNE-io/aigne-framework/issues/90)) ([215118f](https://github.com/AIGNE-io/aigne-framework/commit/215118f1dc55f02322d59a3f18395a459198e031))
* **tests:** add example tests and update the ci configuration ([#81](https://github.com/AIGNE-io/aigne-framework/issues/81)) ([777bb8d](https://github.com/AIGNE-io/aigne-framework/commit/777bb8d184c21e74b3eb9bbb4a1003708409a338))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/core bumped to 1.11.0

## [1.6.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.5.1...cli-v1.6.0) (2025-04-22)


### Features

* **cli:** add --verbose option for run command ([#82](https://github.com/AIGNE-io/aigne-framework/issues/82)) ([7adf8be](https://github.com/AIGNE-io/aigne-framework/commit/7adf8be34963e714268457ab8b2ffeb945da5721))

## [1.5.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.5.0...cli-v1.5.1) (2025-04-22)


### Bug Fixes

* use bunwrapper launch examples ([#79](https://github.com/AIGNE-io/aigne-framework/issues/79)) ([55022e2](https://github.com/AIGNE-io/aigne-framework/commit/55022e20bb253bac608dad3024600da91e093a69))

## [1.5.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.4.0...cli-v1.5.0) (2025-04-22)


### Features

* **cli:** render output message with markdown highlight ([#76](https://github.com/AIGNE-io/aigne-framework/issues/76)) ([b2a793a](https://github.com/AIGNE-io/aigne-framework/commit/b2a793a638e5f95d3f68be80f907da40bd7e624a))
* **stream:** add streaming output support for agent ([#73](https://github.com/AIGNE-io/aigne-framework/issues/73)) ([5f3ea4b](https://github.com/AIGNE-io/aigne-framework/commit/5f3ea4bccda7c8c457d6e9518b3d6a8b254ec041))

## [1.4.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.3.0...cli-v1.4.0) (2025-04-20)


### Features

* **core:** add model adapters for DeepSeek, Gemini, OpenRouter, and Ollama ([#53](https://github.com/AIGNE-io/aigne-framework/issues/53)) ([5d40546](https://github.com/AIGNE-io/aigne-framework/commit/5d40546bd5ddb70233d27ea3b20e5711b2af320a))


### Bug Fixes

* **cli:** display progressing for `run` command ([#68](https://github.com/AIGNE-io/aigne-framework/issues/68)) ([e3d2193](https://github.com/AIGNE-io/aigne-framework/commit/e3d21930bc2cf20edeb0ad7123e9e87e3e0ea653))
* **cli:** ensure dir exists before extract package ([#70](https://github.com/AIGNE-io/aigne-framework/issues/70)) ([5ebe56d](https://github.com/AIGNE-io/aigne-framework/commit/5ebe56d3483d4309d9e39ab0566d353b3787edce))

## [1.3.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.2.0...cli-v1.3.0) (2025-04-17)


### Features

* **ci:** support coverage examples with model matrix ([#59](https://github.com/AIGNE-io/aigne-framework/issues/59)) ([1edd704](https://github.com/AIGNE-io/aigne-framework/commit/1edd70426b80a69e3751b2d5fe818297711d0777))
* **cli:** support convert agents from studio ([#64](https://github.com/AIGNE-io/aigne-framework/issues/64)) ([f544bc7](https://github.com/AIGNE-io/aigne-framework/commit/f544bc77a2fb07e034b317ceb6a46aadd35830c9))
* **cli:** support model and download customization for aigne run ([#61](https://github.com/AIGNE-io/aigne-framework/issues/61)) ([51f6619](https://github.com/AIGNE-io/aigne-framework/commit/51f6619e6c591a84f1f2339b26ef66d89fa9486e))

## [1.2.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.1.0...cli-v1.2.0) (2025-04-15)


### Features

* add TerminalTracer for better UX in terminal ([#56](https://github.com/AIGNE-io/aigne-framework/issues/56)) ([9875a5d](https://github.com/AIGNE-io/aigne-framework/commit/9875a5d46abb55073340ffae841fed6bd6b83ff4))
* **cli:** support run agents from remote URL ([#60](https://github.com/AIGNE-io/aigne-framework/issues/60)) ([5f49920](https://github.com/AIGNE-io/aigne-framework/commit/5f4992089d36f9e780ba55a912a1d35508cad28e))


### Bug Fixes

* remove usage of new Node.js exists API for compatibility ([#57](https://github.com/AIGNE-io/aigne-framework/issues/57)) ([c10cc08](https://github.com/AIGNE-io/aigne-framework/commit/c10cc086d8ecd0744f38cdb1367d4c8816b723b3))

## [1.1.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.0.0...cli-v1.1.0) (2025-04-08)


### Features

* add `serve` command for @aigne/cli ([#54](https://github.com/AIGNE-io/aigne-framework/issues/54)) ([1cca843](https://github.com/AIGNE-io/aigne-framework/commit/1cca843f1760abe832b6651108fa858130f47355))
* add agent library support ([#51](https://github.com/AIGNE-io/aigne-framework/issues/51)) ([1f0d34d](https://github.com/AIGNE-io/aigne-framework/commit/1f0d34ddda3154283a4bc958ddb9b68b4ac106b0))
