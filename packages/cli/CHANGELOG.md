# Changelog

## [1.32.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.31.0...cli-v1.32.0) (2025-08-07)


### Features

* **cli:** support config custom AIGNE Hub service URL ([#330](https://github.com/AIGNE-io/aigne-framework/issues/330)) ([21d30c8](https://github.com/AIGNE-io/aigne-framework/commit/21d30c8c75d9f27cb257d92434ba63e38e06f468))


### Bug Fixes

* **cli:** properly handle boolean and number types in agent options ([#331](https://github.com/AIGNE-io/aigne-framework/issues/331)) ([c9f4209](https://github.com/AIGNE-io/aigne-framework/commit/c9f4209ec1b236bc54e8aaef0b960e10a380e375))

## [1.31.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.4...cli-v1.31.0) (2025-08-06)


### Features

* **cli:** support custom task title of agent in cli ([#328](https://github.com/AIGNE-io/aigne-framework/issues/328)) ([128d75f](https://github.com/AIGNE-io/aigne-framework/commit/128d75fb42ca470b47a2793d79c92d7bb64cfedb))


### Bug Fixes

* **cli:** nunjucks should import as cjs module ([432b9e1](https://github.com/AIGNE-io/aigne-framework/commit/432b9e1e436bd5b02427a5effea907be1f589c31))
* **core:** improve hook handling in agent and context ([#325](https://github.com/AIGNE-io/aigne-framework/issues/325)) ([c858fec](https://github.com/AIGNE-io/aigne-framework/commit/c858fecb08453c2daca9708f4b8a9c135fac40b0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.14
    * @aigne/agentic-memory bumped to 1.0.14
    * @aigne/aigne-hub bumped to 0.4.5
    * @aigne/core bumped to 1.46.0
    * @aigne/default-memory bumped to 1.0.14
    * @aigne/openai bumped to 0.10.14

## [1.30.4](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.3...cli-v1.30.4) (2025-08-06)


### Bug Fixes

* **cli:** improve help display and command handling ([#319](https://github.com/AIGNE-io/aigne-framework/issues/319)) ([306ca5f](https://github.com/AIGNE-io/aigne-framework/commit/306ca5f251d6de356131b11909293be3904d0675))
* create connect add app info ([#321](https://github.com/AIGNE-io/aigne-framework/issues/321)) ([f0094a3](https://github.com/AIGNE-io/aigne-framework/commit/f0094a3f891617a9822df90918445639cd8c1a90))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.13
    * @aigne/agentic-memory bumped to 1.0.13
    * @aigne/aigne-hub bumped to 0.4.4
    * @aigne/openai bumped to 0.10.13
    * @aigne/core bumped to 1.45.0
    * @aigne/default-memory bumped to 1.0.13

## [1.30.3](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.2...cli-v1.30.3) (2025-08-05)


### Bug Fixes

* **cli:** improve CLI prompts and output handling ([#318](https://github.com/AIGNE-io/aigne-framework/issues/318)) ([681ee79](https://github.com/AIGNE-io/aigne-framework/commit/681ee79e9b18aed5a977a0a418c2d9df20a7297c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.12
    * @aigne/agentic-memory bumped to 1.0.12
    * @aigne/aigne-hub bumped to 0.4.3
    * @aigne/openai bumped to 0.10.12
    * @aigne/core bumped to 1.44.0
    * @aigne/default-memory bumped to 1.0.12

## [1.30.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.1...cli-v1.30.2) (2025-08-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.11
    * @aigne/agentic-memory bumped to 1.0.11
    * @aigne/aigne-hub bumped to 0.4.2
    * @aigne/openai bumped to 0.10.11
    * @aigne/core bumped to 1.43.1
    * @aigne/default-memory bumped to 1.0.11

## [1.30.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.0...cli-v1.30.1) (2025-08-04)


### Bug Fixes

* **cli:** persist prompts log and improve terminal output ([#307](https://github.com/AIGNE-io/aigne-framework/issues/307)) ([ac8116f](https://github.com/AIGNE-io/aigne-framework/commit/ac8116fc46f26169e7619860c392fb9f66bc3fee))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.10
    * @aigne/agentic-memory bumped to 1.0.10
    * @aigne/aigne-hub bumped to 0.4.1
    * @aigne/openai bumped to 0.10.10
    * @aigne/core bumped to 1.43.0
    * @aigne/default-memory bumped to 1.0.10

## [1.30.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.29.0...cli-v1.30.0) (2025-08-01)


### Features

* **cli:** add `--model` option for aigne applications ([#302](https://github.com/AIGNE-io/aigne-framework/issues/302)) ([5d63743](https://github.com/AIGNE-io/aigne-framework/commit/5d63743b8a47be64fd49245983f4f2f9da3197a0))
* **cli:** add `upgrade` command for aigne app ([#299](https://github.com/AIGNE-io/aigne-framework/issues/299)) ([1bf461a](https://github.com/AIGNE-io/aigne-framework/commit/1bf461ab644b2d810ef81cd3092475496dfc7ddc))
* support google model and skip check mode when connected to Hub ([#300](https://github.com/AIGNE-io/aigne-framework/issues/300)) ([e992c0f](https://github.com/AIGNE-io/aigne-framework/commit/e992c0f3335a7c512fa807d5b8ad10c9c3bf2351))


### Bug Fixes

* **cli:** indicator not responsive in macos terminal ([#304](https://github.com/AIGNE-io/aigne-framework/issues/304)) ([336f75b](https://github.com/AIGNE-io/aigne-framework/commit/336f75b8a7dfaf28d78e9a4cfcb4ac8c6a29c469))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.9
    * @aigne/agentic-memory bumped to 1.0.9
    * @aigne/aigne-hub bumped to 0.4.0
    * @aigne/openai bumped to 0.10.9
    * @aigne/core bumped to 1.42.0
    * @aigne/default-memory bumped to 1.0.9
    * @aigne/observability-api bumped to 0.9.0

## [1.29.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.28.0...cli-v1.29.0) (2025-07-31)


### Features

* **cli:** add alias support for agent ([#297](https://github.com/AIGNE-io/aigne-framework/issues/297)) ([fa166ab](https://github.com/AIGNE-io/aigne-framework/commit/fa166ab66d19e89ddd32c34e1470450eb4fbdbbd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.8
    * @aigne/agentic-memory bumped to 1.0.8
    * @aigne/aigne-hub bumped to 0.3.2
    * @aigne/anthropic bumped to 0.10.4
    * @aigne/bedrock bumped to 0.8.8
    * @aigne/core bumped to 1.41.0
    * @aigne/deepseek bumped to 0.7.8
    * @aigne/default-memory bumped to 1.0.8
    * @aigne/gemini bumped to 0.8.8
    * @aigne/ollama bumped to 0.7.8
    * @aigne/open-router bumped to 0.7.8
    * @aigne/openai bumped to 0.10.8
    * @aigne/xai bumped to 0.7.8

## [1.28.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.27.0...cli-v1.28.0) (2025-07-31)


### Features

* **cli:** support dynamic download and execution of doc-smith app ([#293](https://github.com/AIGNE-io/aigne-framework/issues/293)) ([4c40077](https://github.com/AIGNE-io/aigne-framework/commit/4c40077bacef076bc4b098879e948ef866218e39))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.7
    * @aigne/agentic-memory bumped to 1.0.7
    * @aigne/aigne-hub bumped to 0.3.1
    * @aigne/anthropic bumped to 0.10.3
    * @aigne/bedrock bumped to 0.8.7
    * @aigne/core bumped to 1.40.0
    * @aigne/deepseek bumped to 0.7.7
    * @aigne/default-memory bumped to 1.0.7
    * @aigne/gemini bumped to 0.8.7
    * @aigne/ollama bumped to 0.7.7
    * @aigne/open-router bumped to 0.7.7
    * @aigne/openai bumped to 0.10.7
    * @aigne/xai bumped to 0.7.7

## [1.27.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.26.0...cli-v1.27.0) (2025-07-30)


### Features

* support aigne connect command and add test ([#283](https://github.com/AIGNE-io/aigne-framework/issues/283)) ([387d22d](https://github.com/AIGNE-io/aigne-framework/commit/387d22d5cacf20abe02a13deaca1f36987d48ba5))


### Bug Fixes

* **cli:** replace external dependency with built-in user subscription API ([#292](https://github.com/AIGNE-io/aigne-framework/issues/292)) ([67de7fa](https://github.com/AIGNE-io/aigne-framework/commit/67de7fa521626ee7266c6c527e4eafc227bafa48))
* support aigne connect status more info ([#290](https://github.com/AIGNE-io/aigne-framework/issues/290)) ([04c5a06](https://github.com/AIGNE-io/aigne-framework/commit/04c5a0625938a7c1ca1d6fd997f6e9047d425ea0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/aigne-hub bumped to 0.3.0

## [1.26.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.25.1...cli-v1.26.0) (2025-07-28)


### Features

* **cli:** add inquirer/prompts integrations for cli ([#286](https://github.com/AIGNE-io/aigne-framework/issues/286)) ([33af756](https://github.com/AIGNE-io/aigne-framework/commit/33af7567fe2e7f9fb4b1633127e1d54fd65cb2a8))


### Bug Fixes

* **observability:** uniq index on insert and perf on trace query ([#268](https://github.com/AIGNE-io/aigne-framework/issues/268)) ([bd02d2e](https://github.com/AIGNE-io/aigne-framework/commit/bd02d2ef4dadc3df7e4806746fede2faa5cc50bb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.6
    * @aigne/agentic-memory bumped to 1.0.6
    * @aigne/aigne-hub bumped to 0.2.2
    * @aigne/anthropic bumped to 0.10.2
    * @aigne/bedrock bumped to 0.8.6
    * @aigne/core bumped to 1.39.0
    * @aigne/deepseek bumped to 0.7.6
    * @aigne/default-memory bumped to 1.0.6
    * @aigne/gemini bumped to 0.8.6
    * @aigne/observability-api bumped to 0.8.2
    * @aigne/ollama bumped to 0.7.6
    * @aigne/open-router bumped to 0.7.6
    * @aigne/openai bumped to 0.10.6
    * @aigne/xai bumped to 0.7.6

## [1.25.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.25.0...cli-v1.25.1) (2025-07-24)


### Bug Fixes

* add missing dependencies ([#280](https://github.com/AIGNE-io/aigne-framework/issues/280)) ([5da315e](https://github.com/AIGNE-io/aigne-framework/commit/5da315e29dc02818293e74ad159294f137e2c7f7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.5
    * @aigne/agentic-memory bumped to 1.0.5
    * @aigne/aigne-hub bumped to 0.2.1
    * @aigne/anthropic bumped to 0.10.1
    * @aigne/bedrock bumped to 0.8.5
    * @aigne/core bumped to 1.38.1
    * @aigne/deepseek bumped to 0.7.5
    * @aigne/default-memory bumped to 1.0.5
    * @aigne/gemini bumped to 0.8.5
    * @aigne/observability-api bumped to 0.8.1
    * @aigne/ollama bumped to 0.7.5
    * @aigne/open-router bumped to 0.7.5
    * @aigne/openai bumped to 0.10.5
    * @aigne/xai bumped to 0.7.5

## [1.25.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.24.1...cli-v1.25.0) (2025-07-24)


### Features

* **cli:** support aigne hub connect and model use ([#267](https://github.com/AIGNE-io/aigne-framework/issues/267)) ([8e5a32a](https://github.com/AIGNE-io/aigne-framework/commit/8e5a32afc64593137153d7407bde13837312ac70))


### Bug Fixes

* ci lint ([#278](https://github.com/AIGNE-io/aigne-framework/issues/278)) ([b23dea9](https://github.com/AIGNE-io/aigne-framework/commit/b23dea98bf91082ce7429b766dff28cfa5163cd9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.4
    * @aigne/agentic-memory bumped to 1.0.4
    * @aigne/aigne-hub bumped to 0.2.0
    * @aigne/anthropic bumped to 0.10.0
    * @aigne/bedrock bumped to 0.8.4
    * @aigne/core bumped to 1.38.0
    * @aigne/deepseek bumped to 0.7.4
    * @aigne/default-memory bumped to 1.0.4
    * @aigne/gemini bumped to 0.8.4
    * @aigne/ollama bumped to 0.7.4
    * @aigne/open-router bumped to 0.7.4
    * @aigne/openai bumped to 0.10.4
    * @aigne/xai bumped to 0.7.4

## [1.24.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.24.0...cli-v1.24.1) (2025-07-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.3
    * @aigne/agentic-memory bumped to 1.0.3
    * @aigne/aigne-hub bumped to 0.1.3
    * @aigne/anthropic bumped to 0.9.3
    * @aigne/bedrock bumped to 0.8.3
    * @aigne/core bumped to 1.37.0
    * @aigne/deepseek bumped to 0.7.3
    * @aigne/default-memory bumped to 1.0.3
    * @aigne/gemini bumped to 0.8.3
    * @aigne/ollama bumped to 0.7.3
    * @aigne/open-router bumped to 0.7.3
    * @aigne/openai bumped to 0.10.3
    * @aigne/xai bumped to 0.7.3

## [1.24.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.23.1...cli-v1.24.0) (2025-07-17)


### Features

* **core:** support define hooks for agent in yaml ([#260](https://github.com/AIGNE-io/aigne-framework/issues/260)) ([c388e82](https://github.com/AIGNE-io/aigne-framework/commit/c388e8216134271af4d9c7def70862ea3c354c7f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.2
    * @aigne/agentic-memory bumped to 1.0.2
    * @aigne/anthropic bumped to 0.9.2
    * @aigne/bedrock bumped to 0.8.2
    * @aigne/core bumped to 1.36.0
    * @aigne/deepseek bumped to 0.7.2
    * @aigne/default-memory bumped to 1.0.2
    * @aigne/gemini bumped to 0.8.2
    * @aigne/ollama bumped to 0.7.2
    * @aigne/open-router bumped to 0.7.2
    * @aigne/openai bumped to 0.10.2
    * @aigne/xai bumped to 0.7.2
    * @aigne/aigne-hub bumped to 0.1.2

## [1.23.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.23.0...cli-v1.23.1) (2025-07-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.1
    * @aigne/agentic-memory bumped to 1.0.1
    * @aigne/anthropic bumped to 0.9.1
    * @aigne/bedrock bumped to 0.8.1
    * @aigne/core bumped to 1.35.0
    * @aigne/deepseek bumped to 0.7.1
    * @aigne/default-memory bumped to 1.0.1
    * @aigne/gemini bumped to 0.8.1
    * @aigne/ollama bumped to 0.7.1
    * @aigne/open-router bumped to 0.7.1
    * @aigne/openai bumped to 0.10.1
    * @aigne/xai bumped to 0.7.1
    * @aigne/aigne-hub bumped to 0.1.1

## [1.23.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.8...cli-v1.23.0) (2025-07-15)


### Features

* **memory:** support did space memory adapter ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))
* **model:** support aigne-hub model adapter ([#253](https://github.com/AIGNE-io/aigne-framework/issues/253)) ([4b33f8d](https://github.com/AIGNE-io/aigne-framework/commit/4b33f8d1a819f52357db81d502c56b55eaa0669f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.21.0
    * @aigne/agentic-memory bumped to 1.0.0
    * @aigne/anthropic bumped to 0.9.0
    * @aigne/bedrock bumped to 0.8.0
    * @aigne/core bumped to 1.34.0
    * @aigne/deepseek bumped to 0.7.0
    * @aigne/default-memory bumped to 1.0.0
    * @aigne/gemini bumped to 0.8.0
    * @aigne/observability-api bumped to 0.8.0
    * @aigne/ollama bumped to 0.7.0
    * @aigne/open-router bumped to 0.7.0
    * @aigne/openai bumped to 0.10.0
    * @aigne/xai bumped to 0.7.0
    * @aigne/aigne-hub bumped to 0.1.0

## [1.22.8](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.7...cli-v1.22.8) (2025-07-14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.20.5
    * @aigne/anthropic bumped to 0.8.2
    * @aigne/bedrock bumped to 0.7.5
    * @aigne/core bumped to 1.33.2
    * @aigne/deepseek bumped to 0.6.5
    * @aigne/gemini bumped to 0.7.2
    * @aigne/ollama bumped to 0.6.5
    * @aigne/open-router bumped to 0.6.5
    * @aigne/openai bumped to 0.9.2
    * @aigne/xai bumped to 0.6.6

## [1.22.7](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.6...cli-v1.22.7) (2025-07-14)


### Bug Fixes

* **cli:** print pretty error message for cli ([#249](https://github.com/AIGNE-io/aigne-framework/issues/249)) ([d68e0f7](https://github.com/AIGNE-io/aigne-framework/commit/d68e0f7151259a05696de77d9f00793b6f5b36b2))
* **deps:** update deps to latest version ([#247](https://github.com/AIGNE-io/aigne-framework/issues/247)) ([3972f88](https://github.com/AIGNE-io/aigne-framework/commit/3972f887a9abff20c26da6b51c1071cbd54c0bf1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.20.4
    * @aigne/anthropic bumped to 0.8.1
    * @aigne/bedrock bumped to 0.7.4
    * @aigne/core bumped to 1.33.1
    * @aigne/deepseek bumped to 0.6.4
    * @aigne/gemini bumped to 0.7.1
    * @aigne/observability-api bumped to 0.7.2
    * @aigne/ollama bumped to 0.6.4
    * @aigne/open-router bumped to 0.6.4
    * @aigne/openai bumped to 0.9.1
    * @aigne/xai bumped to 0.6.5

## [1.22.6](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.5...cli-v1.22.6) (2025-07-10)


### Bug Fixes

* **cli:** reduce excessive console output to improve cli performance ([#246](https://github.com/AIGNE-io/aigne-framework/issues/246)) ([4430504](https://github.com/AIGNE-io/aigne-framework/commit/4430504b643bba92775e5a908ca1c1153d90a402))

## [1.22.5](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.4...cli-v1.22.5) (2025-07-10)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.20.3
    * @aigne/anthropic bumped to 0.8.0
    * @aigne/bedrock bumped to 0.7.3
    * @aigne/core bumped to 1.33.0
    * @aigne/deepseek bumped to 0.6.3
    * @aigne/gemini bumped to 0.7.0
    * @aigne/ollama bumped to 0.6.3
    * @aigne/open-router bumped to 0.6.3
    * @aigne/openai bumped to 0.9.0
    * @aigne/xai bumped to 0.6.4

## [1.22.4](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.3...cli-v1.22.4) (2025-07-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/xai bumped to 0.6.3

## [1.22.3](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.2...cli-v1.22.3) (2025-07-09)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.20.2
    * @aigne/anthropic bumped to 0.7.2
    * @aigne/bedrock bumped to 0.7.2
    * @aigne/core bumped to 1.32.2
    * @aigne/deepseek bumped to 0.6.2
    * @aigne/gemini bumped to 0.6.2
    * @aigne/observability-api bumped to 0.7.1
    * @aigne/ollama bumped to 0.6.2
    * @aigne/open-router bumped to 0.6.2
    * @aigne/openai bumped to 0.8.2
    * @aigne/xai bumped to 0.6.2

## [1.22.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.1...cli-v1.22.2) (2025-07-09)


### Bug Fixes

* **model:** ensure last message is not system role for gemini ([#231](https://github.com/AIGNE-io/aigne-framework/issues/231)) ([1b72e1e](https://github.com/AIGNE-io/aigne-framework/commit/1b72e1e6be98060aa32e68585142b2eea401d109))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.20.1
    * @aigne/anthropic bumped to 0.7.1
    * @aigne/bedrock bumped to 0.7.1
    * @aigne/core bumped to 1.32.1
    * @aigne/deepseek bumped to 0.6.1
    * @aigne/gemini bumped to 0.6.1
    * @aigne/observability-api bumped to 0.7.0
    * @aigne/ollama bumped to 0.6.1
    * @aigne/open-router bumped to 0.6.1
    * @aigne/openai bumped to 0.8.1
    * @aigne/xai bumped to 0.6.1

## [1.22.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.0...cli-v1.22.1) (2025-07-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.20.0
    * @aigne/anthropic bumped to 0.7.0
    * @aigne/bedrock bumped to 0.7.0
    * @aigne/core bumped to 1.32.0
    * @aigne/deepseek bumped to 0.6.0
    * @aigne/gemini bumped to 0.6.0
    * @aigne/observability-api bumped to 0.6.0
    * @aigne/ollama bumped to 0.6.0
    * @aigne/open-router bumped to 0.6.0
    * @aigne/openai bumped to 0.8.0
    * @aigne/xai bumped to 0.6.0

## [1.22.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.21.0...cli-v1.22.0) (2025-07-04)


### Features

* **core:** add standard userId/sessionId in userContext ([#219](https://github.com/AIGNE-io/aigne-framework/issues/219)) ([58e5804](https://github.com/AIGNE-io/aigne-framework/commit/58e5804cf08b1d2fa6e232646fadd70b5db2e007))
* **core:** add strucutredStreamMode option for AIAgent to support text and json output in one-shot ([#222](https://github.com/AIGNE-io/aigne-framework/issues/222)) ([c0af92b](https://github.com/AIGNE-io/aigne-framework/commit/c0af92b6a020453b047e5bb3782239795839baa8))


### Bug Fixes

* **cli:** set run as the default command ([#221](https://github.com/AIGNE-io/aigne-framework/issues/221)) ([7f3346c](https://github.com/AIGNE-io/aigne-framework/commit/7f3346c461a13de9df24ca00b7a7c1102ece2d06))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.19.0
    * @aigne/anthropic bumped to 0.6.1
    * @aigne/bedrock bumped to 0.6.1
    * @aigne/core bumped to 1.31.0
    * @aigne/deepseek bumped to 0.5.1
    * @aigne/gemini bumped to 0.5.1
    * @aigne/observability-api bumped to 0.5.0
    * @aigne/ollama bumped to 0.5.1
    * @aigne/open-router bumped to 0.5.1
    * @aigne/openai bumped to 0.7.1
    * @aigne/xai bumped to 0.5.1

## [1.21.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.20.1...cli-v1.21.0) (2025-07-03)


### Features

* upgrade dependencies and adapt code to breaking changes ([#216](https://github.com/AIGNE-io/aigne-framework/issues/216)) ([f215ced](https://github.com/AIGNE-io/aigne-framework/commit/f215cedc1a57e321164064c33316e496eae8d25f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.18.0
    * @aigne/anthropic bumped to 0.6.0
    * @aigne/bedrock bumped to 0.6.0
    * @aigne/core bumped to 1.30.0
    * @aigne/deepseek bumped to 0.5.0
    * @aigne/gemini bumped to 0.5.0
    * @aigne/observability-api bumped to 0.4.0
    * @aigne/ollama bumped to 0.5.0
    * @aigne/open-router bumped to 0.5.0
    * @aigne/openai bumped to 0.7.0
    * @aigne/xai bumped to 0.5.0

## [1.20.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.20.0...cli-v1.20.1) (2025-07-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.9
    * @aigne/anthropic bumped to 0.5.4
    * @aigne/bedrock bumped to 0.5.4
    * @aigne/core bumped to 1.29.1
    * @aigne/deepseek bumped to 0.4.4
    * @aigne/gemini bumped to 0.4.4
    * @aigne/observability-api bumped to 0.3.3
    * @aigne/ollama bumped to 0.4.4
    * @aigne/open-router bumped to 0.4.4
    * @aigne/openai bumped to 0.6.4
    * @aigne/xai bumped to 0.4.4

## [1.20.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.19.0...cli-v1.20.0) (2025-07-02)


### Features

* **cli:** support executing aigne.yaml via shebang (#!/usr/bin/env aigne) ([#211](https://github.com/AIGNE-io/aigne-framework/issues/211)) ([2a82c27](https://github.com/AIGNE-io/aigne-framework/commit/2a82c2754b5eab5c3d6e45a5cbe7f0c76d927967))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.8
    * @aigne/anthropic bumped to 0.5.3
    * @aigne/bedrock bumped to 0.5.3
    * @aigne/core bumped to 1.29.0
    * @aigne/deepseek bumped to 0.4.3
    * @aigne/gemini bumped to 0.4.3
    * @aigne/ollama bumped to 0.4.3
    * @aigne/open-router bumped to 0.4.3
    * @aigne/openai bumped to 0.6.3
    * @aigne/xai bumped to 0.4.3

## [1.19.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.18.1...cli-v1.19.0) (2025-07-01)


### Features

* rename command serve to serve-mcp ([#206](https://github.com/AIGNE-io/aigne-framework/issues/206)) ([f3dfc93](https://github.com/AIGNE-io/aigne-framework/commit/f3dfc932b4eeb8ff956bf2d4b1b71b36bd05056e))


### Bug Fixes

* fix: compatible with node 20.0 & polish example defintions ([#209](https://github.com/AIGNE-io/aigne-framework/issues/209)) ([9752b96](https://github.com/AIGNE-io/aigne-framework/commit/9752b96dc54a44c6f710f056fe9205c0f2b0a73e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.7
    * @aigne/anthropic bumped to 0.5.2
    * @aigne/bedrock bumped to 0.5.2
    * @aigne/core bumped to 1.28.2
    * @aigne/deepseek bumped to 0.4.2
    * @aigne/gemini bumped to 0.4.2
    * @aigne/observability-api bumped to 0.3.2
    * @aigne/ollama bumped to 0.4.2
    * @aigne/open-router bumped to 0.4.2
    * @aigne/openai bumped to 0.6.2
    * @aigne/xai bumped to 0.4.2

## [1.18.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.18.0...cli-v1.18.1) (2025-07-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.6
    * @aigne/anthropic bumped to 0.5.1
    * @aigne/bedrock bumped to 0.5.1
    * @aigne/core bumped to 1.28.1
    * @aigne/deepseek bumped to 0.4.1
    * @aigne/gemini bumped to 0.4.1
    * @aigne/observability-api bumped to 0.3.1
    * @aigne/ollama bumped to 0.4.1
    * @aigne/open-router bumped to 0.4.1
    * @aigne/openai bumped to 0.6.1
    * @aigne/xai bumped to 0.4.1

## [1.18.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.17.0...cli-v1.18.0) (2025-07-01)


### Features

* **example:** use AIGNE cli to run chat-bot example ([#198](https://github.com/AIGNE-io/aigne-framework/issues/198)) ([7085541](https://github.com/AIGNE-io/aigne-framework/commit/708554100692f2a557f7329ea78e46c3c870ce10))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.5
    * @aigne/anthropic bumped to 0.5.0
    * @aigne/bedrock bumped to 0.5.0
    * @aigne/core bumped to 1.28.0
    * @aigne/deepseek bumped to 0.4.0
    * @aigne/gemini bumped to 0.4.0
    * @aigne/ollama bumped to 0.4.0
    * @aigne/open-router bumped to 0.4.0
    * @aigne/openai bumped to 0.6.0
    * @aigne/xai bumped to 0.4.0

## [1.17.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.16.0...cli-v1.17.0) (2025-07-01)


### Features

* **cli:** support HTTPS_PROXY and named path param ([#196](https://github.com/AIGNE-io/aigne-framework/issues/196)) ([04e684e](https://github.com/AIGNE-io/aigne-framework/commit/04e684ee26bc2d79924b0e3cb541cd07a7191804))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.4
    * @aigne/anthropic bumped to 0.4.0
    * @aigne/bedrock bumped to 0.4.0
    * @aigne/core bumped to 1.27.0
    * @aigne/deepseek bumped to 0.3.11
    * @aigne/gemini bumped to 0.3.11
    * @aigne/ollama bumped to 0.3.11
    * @aigne/open-router bumped to 0.3.11
    * @aigne/openai bumped to 0.5.0
    * @aigne/xai bumped to 0.3.11

## [1.16.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.15.0...cli-v1.16.0) (2025-06-30)


### Features

* **cli:** auto-load dotenv files for AIGNE CLI ([#192](https://github.com/AIGNE-io/aigne-framework/issues/192)) ([56d5632](https://github.com/AIGNE-io/aigne-framework/commit/56d5632ba427a1cf39235bcd1c30df3bc60643f6))
* **ux:** polish tracing ux and update docs ([#193](https://github.com/AIGNE-io/aigne-framework/issues/193)) ([f80b63e](https://github.com/AIGNE-io/aigne-framework/commit/f80b63ecb1cfb00daa9b68330026da839d33f8a2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.3
    * @aigne/anthropic bumped to 0.3.10
    * @aigne/bedrock bumped to 0.3.10
    * @aigne/core bumped to 1.26.0
    * @aigne/deepseek bumped to 0.3.10
    * @aigne/gemini bumped to 0.3.10
    * @aigne/observability bumped to 0.3.0
    * @aigne/ollama bumped to 0.3.10
    * @aigne/open-router bumped to 0.3.10
    * @aigne/openai bumped to 0.4.3
    * @aigne/xai bumped to 0.3.10

## [1.15.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.14.1...cli-v1.15.0) (2025-06-29)


### Features

* **observability:** tune trace ux and supoort incremental exporting ([#184](https://github.com/AIGNE-io/aigne-framework/issues/184)) ([d174188](https://github.com/AIGNE-io/aigne-framework/commit/d174188459c77acb09b5ca040972f83abb067587))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.2
    * @aigne/anthropic bumped to 0.3.9
    * @aigne/bedrock bumped to 0.3.9
    * @aigne/core bumped to 1.25.0
    * @aigne/deepseek bumped to 0.3.9
    * @aigne/gemini bumped to 0.3.9
    * @aigne/observability bumped to 0.2.0
    * @aigne/ollama bumped to 0.3.9
    * @aigne/open-router bumped to 0.3.9
    * @aigne/openai bumped to 0.4.2
    * @aigne/xai bumped to 0.3.9

## [1.14.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.14.0...cli-v1.14.1) (2025-06-26)


### Bug Fixes

* aigne cli not found package ([#185](https://github.com/AIGNE-io/aigne-framework/issues/185)) ([5d98b61](https://github.com/AIGNE-io/aigne-framework/commit/5d98b6158f1e43e049a3a51a69bab88092bf1c92))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.1
    * @aigne/anthropic bumped to 0.3.8
    * @aigne/bedrock bumped to 0.3.8
    * @aigne/core bumped to 1.24.1
    * @aigne/deepseek bumped to 0.3.8
    * @aigne/gemini bumped to 0.3.8
    * @aigne/observability bumped to 0.1.3
    * @aigne/ollama bumped to 0.3.8
    * @aigne/open-router bumped to 0.3.8
    * @aigne/openai bumped to 0.4.1
    * @aigne/xai bumped to 0.3.8

## [1.14.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.13.2...cli-v1.14.0) (2025-06-26)


### Features

* **transport:** support invoke server side chat model ([#182](https://github.com/AIGNE-io/aigne-framework/issues/182)) ([f81a1bf](https://github.com/AIGNE-io/aigne-framework/commit/f81a1bf883abda1845ccee09b270e5f583e287ab))


### Bug Fixes

* blocklet start failed ([#180](https://github.com/AIGNE-io/aigne-framework/issues/180)) ([296a481](https://github.com/AIGNE-io/aigne-framework/commit/296a481be69d9b9b279dc4e50b0d21c993d1d841))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.17.0
    * @aigne/anthropic bumped to 0.3.7
    * @aigne/bedrock bumped to 0.3.7
    * @aigne/core bumped to 1.24.0
    * @aigne/deepseek bumped to 0.3.7
    * @aigne/gemini bumped to 0.3.7
    * @aigne/observability bumped to 0.1.2
    * @aigne/ollama bumped to 0.3.7
    * @aigne/open-router bumped to 0.3.7
    * @aigne/openai bumped to 0.4.0
    * @aigne/xai bumped to 0.3.7

## [1.13.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.13.1...cli-v1.13.2) (2025-06-25)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.16.1
    * @aigne/anthropic bumped to 0.3.6
    * @aigne/bedrock bumped to 0.3.6
    * @aigne/core bumped to 1.23.1
    * @aigne/deepseek bumped to 0.3.6
    * @aigne/gemini bumped to 0.3.6
    * @aigne/ollama bumped to 0.3.6
    * @aigne/open-router bumped to 0.3.6
    * @aigne/openai bumped to 0.3.6
    * @aigne/xai bumped to 0.3.6

## [1.13.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.13.0...cli-v1.13.1) (2025-06-25)


### Bug Fixes

* **blocklet:** ensure only admins can access traces ([#173](https://github.com/AIGNE-io/aigne-framework/issues/173)) ([9c5cc06](https://github.com/AIGNE-io/aigne-framework/commit/9c5cc06c5841b9684d16c5c60af764d8c98c9c3e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.16.0
    * @aigne/anthropic bumped to 0.3.5
    * @aigne/bedrock bumped to 0.3.5
    * @aigne/core bumped to 1.23.0
    * @aigne/deepseek bumped to 0.3.5
    * @aigne/gemini bumped to 0.3.5
    * @aigne/observability bumped to 0.1.1
    * @aigne/ollama bumped to 0.3.5
    * @aigne/open-router bumped to 0.3.5
    * @aigne/openai bumped to 0.3.5
    * @aigne/xai bumped to 0.3.5

## [1.13.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.12.0...cli-v1.13.0) (2025-06-24)


### Features

* support observability for cli and blocklet ([#155](https://github.com/AIGNE-io/aigne-framework/issues/155)) ([5baa705](https://github.com/AIGNE-io/aigne-framework/commit/5baa705a33cfdba1efc5ccbe18674c27513ca97d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.15.0
    * @aigne/anthropic bumped to 0.3.4
    * @aigne/bedrock bumped to 0.3.4
    * @aigne/core bumped to 1.22.0
    * @aigne/deepseek bumped to 0.3.4
    * @aigne/gemini bumped to 0.3.4
    * @aigne/ollama bumped to 0.3.4
    * @aigne/open-router bumped to 0.3.4
    * @aigne/openai bumped to 0.3.4
    * @aigne/xai bumped to 0.3.4

## [1.12.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.9...cli-v1.12.0) (2025-06-20)


### Features

* **cli:** support pass named input to agent by --input-xxx ([#167](https://github.com/AIGNE-io/aigne-framework/issues/167)) ([cda5bb6](https://github.com/AIGNE-io/aigne-framework/commit/cda5bb6baab680787de1a042664fe34c17a84bb1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.14.0
    * @aigne/anthropic bumped to 0.3.3
    * @aigne/bedrock bumped to 0.3.3
    * @aigne/core bumped to 1.21.0
    * @aigne/deepseek bumped to 0.3.3
    * @aigne/gemini bumped to 0.3.3
    * @aigne/ollama bumped to 0.3.3
    * @aigne/open-router bumped to 0.3.3
    * @aigne/openai bumped to 0.3.3
    * @aigne/xai bumped to 0.3.3

## [1.11.9](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.8...cli-v1.11.9) (2025-06-19)


### Bug Fixes

* use `inputKey` instead of implicit $message for AIAgent ([#165](https://github.com/AIGNE-io/aigne-framework/issues/165)) ([8b6e589](https://github.com/AIGNE-io/aigne-framework/commit/8b6e5896bba8209fd2eecb0f5b9263618bffdaf8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.13.2
    * @aigne/anthropic bumped to 0.3.2
    * @aigne/bedrock bumped to 0.3.2
    * @aigne/core bumped to 1.20.1
    * @aigne/deepseek bumped to 0.3.2
    * @aigne/gemini bumped to 0.3.2
    * @aigne/ollama bumped to 0.3.2
    * @aigne/open-router bumped to 0.3.2
    * @aigne/openai bumped to 0.3.2
    * @aigne/xai bumped to 0.3.2

## [1.11.8](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.7...cli-v1.11.8) (2025-06-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.13.1
    * @aigne/anthropic bumped to 0.3.1
    * @aigne/bedrock bumped to 0.3.1
    * @aigne/core bumped to 1.20.0
    * @aigne/deepseek bumped to 0.3.1
    * @aigne/gemini bumped to 0.3.1
    * @aigne/ollama bumped to 0.3.1
    * @aigne/open-router bumped to 0.3.1
    * @aigne/openai bumped to 0.3.1
    * @aigne/xai bumped to 0.3.1

## [1.11.7](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.6...cli-v1.11.7) (2025-06-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.13.0
    * @aigne/anthropic bumped to 0.3.0
    * @aigne/bedrock bumped to 0.3.0
    * @aigne/core bumped to 1.19.0
    * @aigne/deepseek bumped to 0.3.0
    * @aigne/gemini bumped to 0.3.0
    * @aigne/ollama bumped to 0.3.0
    * @aigne/open-router bumped to 0.3.0
    * @aigne/openai bumped to 0.3.0
    * @aigne/xai bumped to 0.3.0

## [1.11.6](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.5...cli-v1.11.6) (2025-06-11)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.12.6
    * @aigne/anthropic bumped to 0.2.7
    * @aigne/bedrock bumped to 0.2.7
    * @aigne/core bumped to 1.18.6
    * @aigne/deepseek bumped to 0.2.7
    * @aigne/gemini bumped to 0.2.7
    * @aigne/ollama bumped to 0.2.7
    * @aigne/open-router bumped to 0.2.7
    * @aigne/openai bumped to 0.2.7
    * @aigne/xai bumped to 0.2.7

## [1.11.5](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.4...cli-v1.11.5) (2025-06-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.12.5
    * @aigne/anthropic bumped to 0.2.6
    * @aigne/bedrock bumped to 0.2.6
    * @aigne/core bumped to 1.18.5
    * @aigne/deepseek bumped to 0.2.6
    * @aigne/gemini bumped to 0.2.6
    * @aigne/ollama bumped to 0.2.6
    * @aigne/open-router bumped to 0.2.6
    * @aigne/openai bumped to 0.2.6
    * @aigne/xai bumped to 0.2.6

## [1.11.4](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.3...cli-v1.11.4) (2025-06-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.12.4
    * @aigne/anthropic bumped to 0.2.5
    * @aigne/bedrock bumped to 0.2.5
    * @aigne/core bumped to 1.18.4
    * @aigne/deepseek bumped to 0.2.5
    * @aigne/gemini bumped to 0.2.5
    * @aigne/ollama bumped to 0.2.5
    * @aigne/open-router bumped to 0.2.5
    * @aigne/openai bumped to 0.2.5
    * @aigne/xai bumped to 0.2.5

## [1.11.3](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.2...cli-v1.11.3) (2025-06-05)


### Bug Fixes

* compatible nodejs version &gt;=20 ([#149](https://github.com/AIGNE-io/aigne-framework/issues/149)) ([d5ae9f2](https://github.com/AIGNE-io/aigne-framework/commit/d5ae9f245972e87e70fd87cdd960ade9940f288c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.12.3
    * @aigne/anthropic bumped to 0.2.4
    * @aigne/bedrock bumped to 0.2.4
    * @aigne/core bumped to 1.18.3
    * @aigne/deepseek bumped to 0.2.4
    * @aigne/gemini bumped to 0.2.4
    * @aigne/ollama bumped to 0.2.4
    * @aigne/open-router bumped to 0.2.4
    * @aigne/openai bumped to 0.2.4
    * @aigne/xai bumped to 0.2.4

## [1.11.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.1...cli-v1.11.2) (2025-05-30)


### Bug Fixes

* provide available memories for AIGNE ([#145](https://github.com/AIGNE-io/aigne-framework/issues/145)) ([c5dc960](https://github.com/AIGNE-io/aigne-framework/commit/c5dc9605e0fb7ca60e1f5fa2f0da67ffec00c601))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aigne/agent-library bumped to 1.12.2
    * @aigne/anthropic bumped to 0.2.3
    * @aigne/bedrock bumped to 0.2.3
    * @aigne/core bumped to 1.18.2
    * @aigne/deepseek bumped to 0.2.3
    * @aigne/gemini bumped to 0.2.3
    * @aigne/ollama bumped to 0.2.3
    * @aigne/open-router bumped to 0.2.3
    * @aigne/openai bumped to 0.2.3
    * @aigne/xai bumped to 0.2.3

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
