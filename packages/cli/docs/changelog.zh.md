# 更新日志

本页面提供了 @aigne/cli 每个版本的功能、错误修复和依赖项更新的完整日志。

## [1.37.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.36.4...cli-v1.37.0) (2025-08-18)


### 功能

* **cli:** 在 CLI 参数中添加对数组输入的支持 ([#378](https://github.com/AIGNE-io/aigne-framework/issues/378)) ([827ae11](https://github.com/AIGNE-io/aigne-framework/commit/827ae112de8d1a2e997b272b759090b6e5b8d395))
* **cli:** 支持在 CLI 中隐藏或折叠 Agent 的任务 ([#381](https://github.com/AIGNE-io/aigne-framework/issues/381)) ([05b372d](https://github.com/AIGNE-io/aigne-framework/commit/05b372d431a862f7cdfa2a90bb4b7b2379bf97ab))


### 错误修复

* **cli:** 仅记录 info 及以上级别的 API 请求 ([#376](https://github.com/AIGNE-io/aigne-framework/issues/376)) ([03fc4d9](https://github.com/AIGNE-io/aigne-framework/commit/03fc4d9aad6e81aeae3b2eb02a62f7acade3bd77))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.22
    * @aigne/agentic-memory 版本升至 1.0.22
    * @aigne/aigne-hub 版本升至 0.6.4
    * @aigne/core 版本升至 1.51.0
    * @aigne/default-memory 版本升至 1.1.4
    * @aigne/openai 版本升至 0.11.4

## [1.36.4](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.36.3...cli-v1.36.4) (2025-08-16)


### 错误修复

* **core:** 将 getCredential 设为异步以支持 aigne-hub 挂载点检索 ([#372](https://github.com/AIGNE-io/aigne-framework/issues/372)) ([34ce7a6](https://github.com/AIGNE-io/aigne-framework/commit/34ce7a645fa83994d3dfe0f29ca70098cfecac9c))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.21
    * @aigne/agentic-memory 版本升至 1.0.21
    * @aigne/aigne-hub 版本升至 0.6.3
    * @aigne/core 版本升至 1.50.1
    * @aigne/default-memory 版本升至 1.1.3
    * @aigne/openai 版本升至 0.11.3

## [1.36.3](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.36.2...cli-v1.36.3) (2025-08-15)


### 错误修复

* **cli:** 链接到 hub 时仅显示源 URL ([#369](https://github.com/AIGNE-io/aigne-framework/issues/369)) ([b3baf3f](https://github.com/AIGNE-io/aigne-framework/commit/b3baf3f2c98f965d5279dd0dfb282be9f5ffb6c2))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/aigne-hub 版本升至 0.6.2

## [1.36.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.36.1...cli-v1.36.2) (2025-08-15)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/aigne-hub 版本升至 0.6.1

## [1.36.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.36.0...cli-v1.36.1) (2025-08-14)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/aigne-hub 版本升至 0.6.0

## [1.36.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.35.1...cli-v1.36.0) (2025-08-14)


### 功能

* **core:** 为 Agent 钩子添加优先级支持 ([#358](https://github.com/AIGNE-io/aigne-framework/issues/358)) ([9196141](https://github.com/AIGNE-io/aigne-framework/commit/91961413aea171048a6afae87ffc8dc53e20fca8))


### 错误修复

* **cli:** 在 Agent 处理完成后始终打印使用信息 ([58da143](https://github.com/AIGNE-io/aigne-framework/commit/58da143329a6748005c7812723c6b3f986e07e08))
* **cli:** 升级前清理 app 文件夹 ([#362](https://github.com/AIGNE-io/aigne-framework/issues/362)) ([0553c50](https://github.com/AIGNE-io/aigne-framework/commit/0553c504f5d0a446397bdccb20c91921cc618167))
* **cli:** 改进 AIGNE Hub 命令的反馈 ([#361](https://github.com/AIGNE-io/aigne-framework/issues/361)) ([ff29a4b](https://github.com/AIGNE-io/aigne-framework/commit/ff29a4b3c7bb828ef9894482586c8c4df41a2122))
* **cli:** 改进 markdown 终端主题样式 ([#360](https://github.com/AIGNE-io/aigne-framework/issues/360)) ([dc9efbb](https://github.com/AIGNE-io/aigne-framework/commit/dc9efbb477e6792f51090c4fdd6e129e90821263))
* **cli:** 在 loadAIGNE 中仅记录一次日志 ([#357](https://github.com/AIGNE-io/aigne-framework/issues/357)) ([6e6d968](https://github.com/AIGNE-io/aigne-framework/commit/6e6d96814fbc87f210522ae16daf94c1f84f311a))
* **cli:** 防止同时出现多个购买积分的提示 ([#363](https://github.com/AIGNE-io/aigne-framework/issues/363)) ([b8fb459](https://github.com/AIGNE-io/aigne-framework/commit/b8fb459261fe327bcc9bfb4d163e66863cb797ec))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.20
    * @aigne/agentic-memory 版本升至 1.0.20
    * @aigne/aigne-hub 版本升至 0.5.2
    * @aigne/core 版本升至 1.50.0
    * @aigne/default-memory 版本升至 1.1.2
    * @aigne/openai 版本升至 0.11.2

## [1.35.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.35.0...cli-v1.35.1) (2025-08-13)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/aigne-hub 版本升至 0.5.1

## [1.35.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.34.1...cli-v1.35.0) (2025-08-13)


### 功能

* **cli:** 支持 aigne hub 命令 ([#352](https://github.com/AIGNE-io/aigne-framework/issues/352)) ([0341f19](https://github.com/AIGNE-io/aigne-framework/commit/0341f190229b42c5d2ab8a8616597359f35543a7))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/aigne-hub 版本升至 0.5.0

## [1.34.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.34.0...cli-v1.34.1) (2025-08-12)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.19
    * @aigne/agentic-memory 版本升至 1.0.19
    * @aigne/aigne-hub 版本升至 0.4.10
    * @aigne/core 版本升至 1.49.1
    * @aigne/default-memory 版本升至 1.1.1
    * @aigne/openai 版本升至 0.11.1

## [1.34.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.33.1...cli-v1.34.0) (2025-08-12)


### 功能

* **cli:** 为 AIGNE Hub 添加重试功能并改进错误处理 ([#348](https://github.com/AIGNE-io/aigne-framework/issues/348)) ([672c93a](https://github.com/AIGNE-io/aigne-framework/commit/672c93abbba8b4b234f6d810536ff4b603a97e1e))


### 错误修复

* **core:** 修复了使用 aigne-hub 时失败的示例案例 ([#337](https://github.com/AIGNE-io/aigne-framework/issues/337)) ([0d4a31c](https://github.com/AIGNE-io/aigne-framework/commit/0d4a31c24d9e7d26f00d1accb80719d9ad79a4c6))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.18
    * @aigne/agentic-memory 版本升至 1.0.18
    * @aigne/aigne-hub 版本升至 0.4.9
    * @aigne/core 版本升至 1.49.0
    * @aigne/default-memory 版本升至 1.1.0
    * @aigne/openai 版本升至 0.11.0

## [1.33.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.33.0...cli-v1.33.1) (2025-08-12)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.17
    * @aigne/agentic-memory 版本升至 1.0.17
    * @aigne/aigne-hub 版本升至 0.4.8
    * @aigne/core 版本升至 1.48.0
    * @aigne/default-memory 版本升至 1.0.17
    * @aigne/openai 版本升至 0.10.17

## [1.33.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.32.2...cli-v1.33.0) (2025-08-11)


### 功能

* 增强 AI Agent 流式传输，支持思考模式 ([#343](https://github.com/AIGNE-io/aigne-framework/issues/343)) ([bea2a39](https://github.com/AIGNE-io/aigne-framework/commit/bea2a39a2610c2fe58e46ad612b5103726159ab9))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.16
    * @aigne/agentic-memory 版本升至 1.0.16
    * @aigne/aigne-hub 版本升至 0.4.7
    * @aigne/core 版本升至 1.47.0
    * @aigne/default-memory 版本升至 1.0.16
    * @aigne/openai 版本升至 0.10.16

## [1.32.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.32.1...cli-v1.32.2) (2025-08-11)


### 错误修复

* **cli:** 高亮显示错误消息中的 URL ([#340](https://github.com/AIGNE-io/aigne-framework/issues/340)) ([74c233b](https://github.com/AIGNE-io/aigne-framework/commit/74c233b548c8054f1be91955c9f1420a53785739))

## [1.32.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.32.0...cli-v1.32.1) (2025-08-08)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.15
    * @aigne/agentic-memory 版本升至 1.0.15
    * @aigne/aigne-hub 版本升至 0.4.6
    * @aigne/core 版本升至 1.46.1
    * @aigne/default-memory 版本升至 1.0.15
    * @aigne/openai 版本升至 0.10.15

## [1.32.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.31.0...cli-v1.32.0) (2025-08-07)


### 功能

* **cli:** 支持配置自定义 AIGNE Hub 服务 URL ([#330](https://github.com/AIGNE-io/aigne-framework/issues/330)) ([21d30c8](https://github.com/AIGNE-io/aigne-framework/commit/21d30c8c75d9f27cb257d92434ba63e38e06f468))


### 错误修复

* **cli:** 正确处理 Agent 选项中的布尔和数字类型 ([#331](https://github.com/AIGNE-io/aigne-framework/issues/331)) ([c9f4209](https://github.com/AIGNE-io/aigne-framework/commit/c9f4209ec1b236bc54e8aaef0b960e10a380e375))

## [1.31.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.4...cli-v1.31.0) (2025-08-06)


### 功能

* **cli:** 支持在 cli 中为 Agent 自定义任务标题 ([#328](https://github.com/AIGNE-io/aigne-framework/issues/328)) ([128d75f](https://github.com/AIGNE-io/aigne-framework/commit/128d75fb42ca470b47a2793d79c92d7bb64cfedb))


### 错误修复

* **cli:** nunjucks 应作为 cjs 模块导入 ([432b9e1](https://github.com/AIGNE-io/aigne-framework/commit/432b9e1e436bd5b02427a5effea907be1f589c31))
* **core:** 改进 Agent 和上下文中的钩子处理 ([#325](https://github.com/AIGNE-io/aigne-framework/issues/325)) ([c858fec](https://github.com/AIGNE-io/aigne-framework/commit/c858fecb08453c2daca9708f4b8a9c135fac40b0))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.14
    * @aigne/agentic-memory 版本升至 1.0.14
    * @aigne/aigne-hub 版本升至 0.4.5
    * @aigne/core 版本升至 1.46.0
    * @aigne/default-memory 版本升至 1.0.14
    * @aigne/openai 版本升至 0.10.14

## [1.30.4](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.3...cli-v1.30.4) (2025-08-06)


### 错误修复

* **cli:** 改进帮助显示和命令处理 ([#319](https://github.com/AIGNE-io/aigne-framework/issues/319)) ([306ca5f](https://github.com/AIGNE-io/aigne-framework/commit/306ca5f251d6de356131b11909293be3904d0675))
* create connect 添加 app 信息 ([#321](https://github.com/AIGNE-io/aigne-framework/issues/321)) ([f0094a3](https://github.com/AIGNE-io/aigne-framework/commit/f0094a3f891617a9822df90918445639cd8c1a90))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.13
    * @aigne/agentic-memory 版本升至 1.0.13
    * @aigne/aigne-hub 版本升至 0.4.4
    * @aigne/openai 版本升至 0.10.13
    * @aigne/core 版本升至 1.45.0
    * @aigne/default-memory 版本升至 1.0.13

## [1.30.3](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.2...cli-v1.30.3) (2025-08-05)


### 错误修复

* **cli:** 改进 CLI 提示和输出处理 ([#318](https://github.com/AIGNE-io/aigne-framework/issues/318)) ([681ee79](https://github.com/AIGNE-io/aigne-framework/commit/681ee79e9b18aed5a977a0a418c2d9df20a7297c))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.12
    * @aigne/agentic-memory 版本升至 1.0.12
    * @aigne/aigne-hub 版本升至 0.4.3
    * @aigne/openai 版本升至 0.10.12
    * @aigne/core 版本升至 1.44.0
    * @aigne/default-memory 版本升至 1.0.12

## [1.30.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.1...cli-v1.30.2) (2025-08-05)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.11
    * @aigne/agentic-memory 版本升至 1.0.11
    * @aigne/aigne-hub 版本升至 0.4.2
    * @aigne/openai 版本升至 0.10.11
    * @aigne/core 版本升至 1.43.1
    * @aigne/default-memory 版本升至 1.0.11

## [1.30.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.30.0...cli-v1.30.1) (2025-08-04)


### 错误修复

* **cli:** 持久化提示日志并改进终端输出 ([#307](https://github.com/AIGNE-io/aigne-framework/issues/307)) ([ac8116f](https://github.com/AIGNE-io/aigne-framework/commit/ac8116fc46f26169e7619860c392fb9f66bc3fee))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.10
    * @aigne/agentic-memory 版本升至 1.0.10
    * @aigne/aigne-hub 版本升至 0.4.1
    * @aigne/openai 版本升至 0.10.10
    * @aigne/core 版本升至 1.43.0
    * @aigne/default-memory 版本升至 1.0.10

## [1.30.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.29.0...cli-v1.30.0) (2025-08-01)


### 功能

* **cli:** 为 aigne 应用程序添加 `--model` 选项 ([#302](https://github.com/AIGNE-io/aigne-framework/issues/302)) ([5d63743](https://github.com/AIGNE-io/aigne-framework/commit/5d63743b8a47be64fd49245983f4f2f9da3197a0))
* **cli:** 为 aigne app 添加 `upgrade` 命令 ([#299](https://github.com/AIGNE-io/aigne-framework/issues/299)) ([1bf461a](https://github.com/AIGNE-io/aigne-framework/commit/1bf461ab644b2d810ef81cd3092475496dfc7ddc))
* 支持 google 模型，并在连接到 Hub 时跳过检查模式 ([#300](https://github.com/AIGNE-io/aigne-framework/issues/300)) ([e992c0f](https://github.com/AIGNE-io/aigne-framework/commit/e992c0f3335a7c512fa807d5b8ad10c9c3bf2351))


### 错误修复

* **cli:** macos 终端中指示器无响应 ([#304](https://github.com/AIGNE-io/aigne-framework/issues/304)) ([336f75b](https://github.com/AIGNE-io/aigne-framework/commit/336f75b8a7dfaf28d78e9a4cfcb4ac8c6a29c469))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.9
    * @aigne/agentic-memory 版本升至 1.0.9
    * @aigne/aigne-hub 版本升至 0.4.0
    * @aigne/openai 版本升至 0.10.9
    * @aigne/core 版本升至 1.42.0
    * @aigne/default-memory 版本升至 1.0.9
    * @aigne/observability-api 版本升至 0.9.0

## [1.29.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.28.0...cli-v1.29.0) (2025-07-31)


### 功能

* **cli:** 添加 Agent 的别名支持 ([#297](https://github.com/AIGNE-io/aigne-framework/issues/297)) ([fa166ab](https://github.com/AIGNE-io/aigne-framework/commit/fa166ab66d19e89ddd32c34e1470450eb4fbdbbd))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.8
    * @aigne/agentic-memory 版本升至 1.0.8
    * @aigne/aigne-hub 版本升至 0.3.2
    * @aigne/anthropic 版本升至 0.10.4
    * @aigne/bedrock 版本升至 0.8.8
    * @aigne/core 版本升至 1.41.0
    * @aigne/deepseek 版本升至 0.7.8
    * @aigne/default-memory 版本升至 1.0.8
    * @aigne/gemini 版本升至 0.8.8
    * @aigne/ollama 版本升至 0.7.8
    * @aigne/open-router 版本升至 0.7.8
    * @aigne/openai 版本升至 0.10.8
    * @aigne/xai 版本升至 0.7.8

## [1.28.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.27.0...cli-v1.28.0) (2025-07-31)


### 功能

* **cli:** 支持动态下载和执行 doc-smith 应用 ([#293](https://github.com/AIGNE-io/aigne-framework/issues/293)) ([4c40077](https://github.com/AIGNE-io/aigne-framework/commit/4c40077bacef076bc4b098879e948ef866218e39))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.7
    * @aigne/agentic-memory 版本升至 1.0.7
    * @aigne/aigne-hub 版本升至 0.3.1
    * @aigne/anthropic 版本升至 0.10.3
    * @aigne/bedrock 版本升至 0.8.7
    * @aigne/core 版本升至 1.40.0
    * @aigne/deepseek 版本升至 0.7.7
    * @aigne/default-memory 版本升至 1.0.7
    * @aigne/gemini 版本升至 0.8.7
    * @aigne/ollama 版本升至 0.7.7
    * @aigne/open-router 版本升至 0.7.7
    * @aigne/openai 版本升至 0.10.7
    * @aigne/xai 版本升至 0.7.7

## [1.27.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.26.0...cli-v1.27.0) (2025-07-30)


### 功能

* 支持 aigne connect 命令并添加测试 ([#283](https://github.com/AIGNE-io/aigne-framework/issues/283)) ([387d22d](https://github.com/AIGNE-io/aigne-framework/commit/387d22d5cacf20abe02a13deaca1f36987d48ba5))


### 错误修复

* **cli:** 将外部依赖替换为内置的用户订阅 API ([#292](https://github.com/AIGNE-io/aigne-framework/issues/292)) ([67de7fa](https://github.com/AIGNE-io/aigne-framework/commit/67de7fa521626ee7266c6c527e4eafc227bafa48))
* 支持 aigne connect status 的更多信息 ([#290](https://github.com/AIGNE-io/aigne-framework/issues/290)) ([04c5a06](https://github.com/AIGNE-io/aigne-framework/commit/04c5a0625938a7c1ca1d6fd997f6e9047d425ea0))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/aigne-hub 版本升至 0.3.0

## [1.26.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.25.1...cli-v1.26.0) (2025-07-28)


### 功能

* **cli:** 为 cli 添加 inquirer/prompts 集成 ([#286](https://github.com/AIGNE-io/aigne-framework/issues/286)) ([33af756](https://github.com/AIGNE-io/aigne-framework/commit/33af7567fe2e7f9fb4b1633127e1d54fd65cb2a8))


### 错误修复

* **可观测性:** 插入时使用唯一索引并优化跟踪查询性能 ([#268](https://github.com/AIGNE-io/aigne-framework/issues/268)) ([bd02d2e](https://github.com/AIGNE-io/aigne-framework/commit/bd02d2ef4dadc3df7e4806746fede2faa5cc50bb))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.6
    * @aigne/agentic-memory 版本升至 1.0.6
    * @aigne/aigne-hub 版本升至 0.2.2
    * @aigne/anthropic 版本升至 0.10.2
    * @aigne/bedrock 版本升至 0.8.6
    * @aigne/core 版本升至 1.39.0
    * @aigne/deepseek 版本升至 0.7.6
    * @aigne/default-memory 版本升至 1.0.6
    * @aigne/gemini 版本升至 0.8.6
    * @aigne/observability-api 版本升至 0.8.2
    * @aigne/ollama 版本升至 0.7.6
    * @aigne/open-router 版本升至 0.7.6
    * @aigne/openai 版本升至 0.10.6
    * @aigne/xai 版本升至 0.7.6

## [1.25.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.25.0...cli-v1.25.1) (2025-07-24)


### 错误修复

* 添加缺失的依赖项 ([#280](https://github.com/AIGNE-io/aigne-framework/issues/280)) ([5da315e](https://github.com/AIGNE-io/aigne-framework/commit/5da315e29dc02818293e74ad159294f137e2c7f7))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.5
    * @aigne/agentic-memory 版本升至 1.0.5
    * @aigne/aigne-hub 版本升至 0.2.1
    * @aigne/anthropic 版本升至 0.10.1
    * @aigne/bedrock 版本升至 0.8.5
    * @aigne/core 版本升至 1.38.1
    * @aigne/deepseek 版本升至 0.7.5
    * @aigne/default-memory 版本升至 1.0.5
    * @aigne/gemini 版本升至 0.8.5
    * @aigne/observability-api 版本升至 0.8.1
    * @aigne/ollama 版本升至 0.7.5
    * @aigne/open-router 版本升至 0.7.5
    * @aigne/openai 版本升至 0.10.5
    * @aigne/xai 版本升至 0.7.5

## [1.25.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.24.1...cli-v1.25.0) (2025-07-24)


### 功能

* **cli:** 支持 aigne hub 连接和模型使用 ([#267](https://github.com/AIGNE-io/aigne-framework/issues/267)) ([8e5a32a](https://github.com/AIGNE-io/aigne-framework/commit/8e5a32afc64593137153d7407bde13837312ac70))


### 错误修复

* ci lint ([#278](https://github.com/AIGNE-io/aigne-framework/issues/278)) ([b23dea9](https://github.com/AIGNE-io/aigne-framework/commit/b23dea98bf91082ce7429b766dff28cfa5163cd9))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.4
    * @aigne/agentic-memory 版本升至 1.0.4
    * @aigne/aigne-hub 版本升至 0.2.0
    * @aigne/anthropic 版本升至 0.10.0
    * @aigne/bedrock 版本升至 0.8.4
    * @aigne/core 版本升至 1.38.0
    * @aigne/deepseek 版本升至 0.7.4
    * @aigne/default-memory 版本升至 1.0.4
    * @aigne/gemini 版本升至 0.8.4
    * @aigne/ollama 版本升至 0.7.4
    * @aigne/open-router 版本升至 0.7.4
    * @aigne/openai 版本升至 0.10.4
    * @aigne/xai 版本升至 0.7.4

## [1.24.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.24.0...cli-v1.24.1) (2025-07-22)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.3
    * @aigne/agentic-memory 版本升至 1.0.3
    * @aigne/aigne-hub 版本升至 0.1.3
    * @aigne/anthropic 版本升至 0.9.3
    * @aigne/bedrock 版本升至 0.8.3
    * @aigne/core 版本升至 1.37.0
    * @aigne/deepseek 版本升至 0.7.3
    * @aigne/default-memory 版本升至 1.0.3
    * @aigne/gemini 版本升至 0.8.3
    * @aigne/ollama 版本升至 0.7.3
    * @aigne/open-router 版本升至 0.7.3
    * @aigne/openai 版本升至 0.10.3
    * @aigne/xai 版本升至 0.7.3

## [1.24.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.23.1...cli-v1.24.0) (2025-07-17)


### 功能

* **core:** 支持在 yaml 中为 Agent 定义钩子 ([#260](https://github.com/AIGNE-io/aigne-framework/issues/260)) ([c388e82](https://github.com/AIGNE-io/aigne-framework/commit/c388e8216134271af4d9c7def70862ea3c354c7f))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.2
    * @aigne/agentic-memory 版本升至 1.0.2
    * @aigne/anthropic 版本升至 0.9.2
    * @aigne/bedrock 版本升至 0.8.2
    * @aigne/core 版本升至 1.36.0
    * @aigne/deepseek 版本升至 0.7.2
    * @aigne/default-memory 版本升至 1.0.2
    * @aigne/gemini 版本升至 0.8.2
    * @aigne/ollama 版本升至 0.7.2
    * @aigne/open-router 版本升至 0.7.2
    * @aigne/openai 版本升至 0.10.2
    * @aigne/xai 版本升至 0.7.2
    * @aigne/aigne-hub 版本升至 0.1.2

## [1.23.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.23.0...cli-v1.23.1) (2025-07-17)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.1
    * @aigne/agentic-memory 版本升至 1.0.1
    * @aigne/anthropic 版本升至 0.9.1
    * @aigne/bedrock 版本升至 0.8.1
    * @aigne/core 版本升至 1.35.0
    * @aigne/deepseek 版本升至 0.7.1
    * @aigne/default-memory 版本升至 1.0.1
    * @aigne/gemini 版本升至 0.8.1
    * @aigne/ollama 版本升至 0.7.1
    * @aigne/open-router 版本升至 0.7.1
    * @aigne/openai 版本升至 0.10.1
    * @aigne/xai 版本升至 0.7.1
    * @aigne/aigne-hub 版本升至 0.1.1

## [1.23.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.8...cli-v1.23.0) (2025-07-15)


### 功能

* **memory:** 支持 did space 内存适配器 ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))
* **model:** 支持 aigne-hub 模型适配器 ([#253](https://github.com/AIGNE-io/aigne-framework/issues/253)) ([4b33f8d](https://github.com/AIGNE-io/aigne-framework/commit/4b33f8d1a819f52357db81d502c56b55eaa0669f))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.21.0
    * @aigne/agentic-memory 版本升至 1.0.0
    * @aigne/anthropic 版本升至 0.9.0
    * @aigne/bedrock 版本升至 0.8.0
    * @aigne/core 版本升至 1.34.0
    * @aigne/deepseek 版本升至 0.7.0
    * @aigne/default-memory 版本升至 1.0.0
    * @aigne/gemini 版本升至 0.8.0
    * @aigne/observability-api 版本升至 0.8.0
    * @aigne/ollama 版本升至 0.7.0
    * @aigne/open-router 版本升至 0.7.0
    * @aigne/openai 版本升至 0.10.0
    * @aigne/xai 版本升至 0.7.0
    * @aigne/aigne-hub 版本升至 0.1.0

## [1.22.8](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.7...cli-v1.22.8) (2025-07-14)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.20.5
    * @aigne/anthropic 版本升至 0.8.2
    * @aigne/bedrock 版本升至 0.7.5
    * @aigne/core 版本升至 1.33.2
    * @aigne/deepseek 版本升至 0.6.5
    * @aigne/gemini 版本升至 0.7.2
    * @aigne/ollama 版本升至 0.6.5
    * @aigne/open-router 版本升至 0.6.5
    * @aigne/openai 版本升至 0.9.2
    * @aigne/xai 版本升至 0.6.6

## [1.22.7](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.6...cli-v1.22.7) (2025-07-14)


### 错误修复

* **cli:** 为 cli 打印美化后的错误消息 ([#249](https://github.com/AIGNE-io/aigne-framework/issues/249)) ([d68e0f7](https://github.com/AIGNE-io/aigne-framework/commit/d68e0f7151259a05696de77d9f00793b6f5b36b2))
* **deps:** 将依赖项更新至最新版本 ([#247](https://github.com/AIGNE-io/aigne-framework/issues/247)) ([3972f88](https://github.com/AIGNE-io/aigne-framework/commit/3972f887a9abff20c26da6b51c1071cbd54c0bf1))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.20.4
    * @aigne/anthropic 版本升至 0.8.1
    * @aigne/bedrock 版本升至 0.7.4
    * @aigne/core 版本升至 1.33.1
    * @aigne/deepseek 版本升至 0.6.4
    * @aigne/gemini 版本升至 0.7.1
    * @aigne/observability-api 版本升至 0.7.2
    * @aigne/ollama 版本升至 0.6.4
    * @aigne/open-router 版本升至 0.6.4
    * @aigne/openai 版本升至 0.9.1
    * @aigne/xai 版本升至 0.6.5

## [1.22.6](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.5...cli-v1.22.6) (2025-07-10)


### 错误修复

* **cli:** 减少过多的控制台输出以提高 cli 性能 ([#246](https://github.com/AIGNE-io/aigne-framework/issues/246)) ([4430504](https://github.com/AIGNE-io/aigne-framework/commit/4430504b643bba92775e5a908ca1c1153d90a402))

## [1.22.5](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.4...cli-v1.22.5) (2025-07-10)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.20.3
    * @aigne/anthropic 版本升至 0.8.0
    * @aigne/bedrock 版本升至 0.7.3
    * @aigne/core 版本升至 1.33.0
    * @aigne/deepseek 版本升至 0.6.3
    * @aigne/gemini 版本升至 0.7.0
    * @aigne/ollama 版本升至 0.6.3
    * @aigne/open-router 版本升至 0.6.3
    * @aigne/openai 版本升至 0.9.0
    * @aigne/xai 版本升至 0.6.4

## [1.22.4](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.3...cli-v1.22.4) (2025-07-09)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/xai 版本升至 0.6.3

## [1.22.3](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.2...cli-v1.22.3) (2025-07-09)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.20.2
    * @aigne/anthropic 版本升至 0.7.2
    * @aigne/bedrock 版本升至 0.7.2
    * @aigne/core 版本升至 1.32.2
    * @aigne/deepseek 版本升至 0.6.2
    * @aigne/gemini 版本升至 0.6.2
    * @aigne/observability-api 版本升至 0.7.1
    * @aigne/ollama 版本升至 0.6.2
    * @aigne/open-router 版本升至 0.6.2
    * @aigne/openai 版本升至 0.8.2
    * @aigne/xai 版本升至 0.6.2

## [1.22.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.1...cli-v1.22.2) (2025-07-09)


### 错误修复

* **model:** 确保 gemini 的最后一条消息不是系统角色 ([#231](https://github.com/AIGNE-io/aigne-framework/issues/231)) ([1b72e1e](https://github.com/AIGNE-io/aigne-framework/commit/1b72e1e6be98060aa32e68585142b2eea401d109))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.20.1
    * @aigne/anthropic 版本升至 0.7.1
    * @aigne/bedrock 版本升至 0.7.1
    * @aigne/core 版本升至 1.32.1
    * @aigne/deepseek 版本升至 0.6.1
    * @aigne/gemini 版本升至 0.6.1
    * @aigne/observability-api 版本升至 0.7.0
    * @aigne/ollama 版本升至 0.6.1
    * @aigne/open-router 版本升至 0.6.1
    * @aigne/openai 版本升至 0.8.1
    * @aigne/xai 版本升至 0.6.1

## [1.22.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.22.0...cli-v1.22.1) (2025-07-08)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.20.0
    * @aigne/anthropic 版本升至 0.7.0
    * @aigne/bedrock 版本升至 0.7.0
    * @aigne/core 版本升至 1.32.0
    * @aigne/deepseek 版本升至 0.6.0
    * @aigne/gemini 版本升至 0.6.0
    * @aigne/observability-api 版本升至 0.6.0
    * @aigne/ollama 版本升至 0.6.0
    * @aigne/open-router 版本升至 0.6.0
    * @aigne/openai 版本升至 0.8.0
    * @aigne/xai 版本升至 0.6.0

## [1.22.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.21.0...cli-v1.22.0) (2025-07-04)


### 功能

* **core:** 在 userContext 中添加标准 userId/sessionId ([#219](https://github.com/AIGNE-io/aigne-framework/issues/219)) ([58e5804](https://github.com/AIGNE-io/aigne-framework/commit/58e5804cf08b1d2fa6e232646fadd70b5db2e007))
* **core:** 为 AIAgent 添加 structuredStreamMode 选项，以支持一次性输出文本和 json ([#222](https://github.com/AIGNE-io/aigne-framework/issues/222)) ([c0af92b](https://github.com/AIGNE-io/aigne-framework/commit/c0af92b6a020453b047e5bb3782239795839baa8))


### 错误修复

* **cli:** 将 run 设置为默认命令 ([#221](https://github.com/AIGNE-io/aigne-framework/issues/221)) ([7f3346c](https://github.com/AIGNE-io/aigne-framework/commit/7f3346c461a13de9df24ca00b7a7c1102ece2d06))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.19.0
    * @aigne/anthropic 版本升至 0.6.1
    * @aigne/bedrock 版本升至 0.6.1
    * @aigne/core 版本升至 1.31.0
    * @aigne/deepseek 版本升至 0.5.1
    * @aigne/gemini 版本升至 0.5.1
    * @aigne/observability-api 版本升至 0.5.0
    * @aigne/ollama 版本升至 0.5.1
    * @aigne/open-router 版本升至 0.5.1
    * @aigne/openai 版本升至 0.7.1
    * @aigne/xai 版本升至 0.5.1

## [1.21.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.20.1...cli-v1.21.0) (2025-07-03)


### 功能

* 升级依赖项并使代码适应重大变更 ([#216](https://github.com/AIGNE-io/aigne-framework/issues/216)) ([f215ced](https://github.com/AIGNE-io/aigne-framework/commit/f215cedc1a57e321164064c33316e496eae8d25f))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.18.0
    * @aigne/anthropic 版本升至 0.6.0
    * @aigne/bedrock 版本升至 0.6.0
    * @aigne/core 版本升至 1.30.0
    * @aigne/deepseek 版本升至 0.5.0
    * @aigne/gemini 版本升至 0.5.0
    * @aigne/observability-api 版本升至 0.4.0
    * @aigne/ollama 版本升至 0.5.0
    * @aigne/open-router 版本升至 0.5.0
    * @aigne/openai 版本升至 0.7.0
    * @aigne/xai 版本升至 0.5.0

## [1.20.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.20.0...cli-v1.20.1) (2025-07-02)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.9
    * @aigne/anthropic 版本升至 0.5.4
    * @aigne/bedrock 版本升至 0.5.4
    * @aigne/core 版本升至 1.29.1
    * @aigne/deepseek 版本升至 0.4.4
    * @aigne/gemini 版本升至 0.4.4
    * @aigne/observability-api 版本升至 0.3.3
    * @aigne/ollama 版本升至 0.4.4
    * @aigne/open-router 版本升至 0.4.4
    * @aigne/openai 版本升至 0.6.4
    * @aigne/xai 版本升至 0.4.4

## [1.20.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.19.0...cli-v1.20.0) (2025-07-02)


### 功能

* **cli:** 支持通过 shebang (#!/usr/bin/env aigne) 执行 aigne.yaml ([#211](https://github.com/AIGNE-io/aigne-framework/issues/211)) ([2a82c27](https://github.com/AIGNE-io/aigne-framework/commit/2a82c2754b5eab5c3d6e45a5cbe7f0c76d927967))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.8
    * @aigne/anthropic 版本升至 0.5.3
    * @aigne/bedrock 版本升至 0.5.3
    * @aigne/core 版本升至 1.29.0
    * @aigne/deepseek 版本升至 0.4.3
    * @aigne/gemini 版本升至 0.4.3
    * @aigne/ollama 版本升至 0.4.3
    * @aigne/open-router 版本升至 0.4.3
    * @aigne/openai 版本升至 0.6.3
    * @aigne/xai 版本升至 0.4.3

## [1.19.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.18.1...cli-v1.19.0) (2025-07-01)


### 功能

* 将命令 serve 重命名为 serve-mcp ([#206](https://github.com/AIGNE-io/aigne-framework/issues/206)) ([f3dfc93](https://github.com/AIGNE-io/aigne-framework/commit/f3dfc932b4eeb8ff956bf2d4b1b71b36bd05056e))


### 错误修复

* 修复：兼容 node 20.0 并优化示例定义 ([#209](https://github.com/AIGNE-io/aigne-framework/issues/209)) ([9752b96](https://github.com/AIGNE-io/aigne-framework/commit/9752b96dc54a44c6f710f056fe9205c0f2b0a73e))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.7
    * @aigne/anthropic 版本升至 0.5.2
    * @aigne/bedrock 版本升至 0.5.2
    * @aigne/core 版本升至 1.28.2
    * @aigne/deepseek 版本升至 0.4.2
    * @aigne/gemini 版本升至 0.4.2
    * @aigne/observability-api 版本升至 0.3.2
    * @aigne/ollama 版本升至 0.4.2
    * @aigne/open-router 版本升至 0.4.2
    * @aigne/openai 版本升至 0.6.2
    * @aigne/xai 版本升至 0.4.2

## [1.18.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.18.0...cli-v1.18.1) (2025-07-01)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.6
    * @aigne/anthropic 版本升至 0.5.1
    * @aigne/bedrock 版本升至 0.5.1
    * @aigne/core 版本升至 1.28.1
    * @aigne/deepseek 版本升至 0.4.1
    * @aigne/gemini 版本升至 0.4.1
    * @aigne/observability-api 版本升至 0.3.1
    * @aigne/ollama 版本升至 0.4.1
    * @aigne/open-router 版本升至 0.4.1
    * @aigne/openai 版本升至 0.6.1
    * @aigne/xai 版本升至 0.4.1

## [1.18.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.17.0...cli-v1.18.0) (2025-07-01)


### 功能

* **example:** 使用 AIGNE cli 运行聊天机器人示例 ([#198](https://github.com/AIGNE-io/aigne-framework/issues/198)) ([7085541](https://github.com/AIGNE-io/aigne-framework/commit/708554100692f2a557f7329ea78e46c3c870ce10))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.5
    * @aigne/anthropic 版本升至 0.5.0
    * @aigne/bedrock 版本升至 0.5.0
    * @aigne/core 版本升至 1.28.0
    * @aigne/deepseek 版本升至 0.4.0
    * @aigne/gemini 版本升至 0.4.0
    * @aigne/ollama 版本升至 0.4.0
    * @aigne/open-router 版本升至 0.4.0
    * @aigne/openai 版本升至 0.6.0
    * @aigne/xai 版本升至 0.4.0

## [1.17.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.16.0...cli-v1.17.0) (2025-07-01)


### 功能

* **cli:** 支持 HTTPS_PROXY 和命名路径参数 ([#196](https://github.com/AIGNE-io/aigne-framework/issues/196)) ([04e684e](https://github.com/AIGNE-io/aigne-framework/commit/04e684ee26bc2d79924b0e3cb541cd07a7191804))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.4
    * @aigne/anthropic 版本升至 0.4.0
    * @aigne/bedrock 版本升至 0.4.0
    * @aigne/core 版本升至 1.27.0
    * @aigne/deepseek 版本升至 0.3.11
    * @aigne/gemini 版本升至 0.3.11
    * @aigne/ollama 版本升至 0.3.11
    * @aigne/open-router 版本升至 0.3.11
    * @aigne/openai 版本升至 0.5.0
    * @aigne/xai 版本升至 0.3.11

## [1.16.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.15.0...cli-v1.16.0) (2025-06-30)


### 功能

* **cli:** AIGNE CLI 自动加载 dotenv 文件 ([#192](https://github.com/AIGNE-io/aigne-framework/issues/192)) ([56d5632](https://github.com/AIGNE-io/aigne-framework/commit/56d5632ba427a1cf39235bcd1c30df3bc60643f6))
* **ux:** 优化跟踪用户体验并更新文档 ([#193](https://github.com/AIGNE-io/aigne-framework/issues/193)) ([f80b63e](https://github.com/AIGNE-io/aigne-framework/commit/f80b63ecb1cfb00daa9b68330026da839d33f8a2))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.3
    * @aigne/anthropic 版本升至 0.3.10
    * @aigne/bedrock 版本升至 0.3.10
    * @aigne/core 版本升至 1.26.0
    * @aigne/deepseek 版本升至 0.3.10
    * @aigne/gemini 版本升至 0.3.10
    * @aigne/observability 版本升至 0.3.0
    * @aigne/ollama 版本升至 0.3.10
    * @aigne/open-router 版本升至 0.3.10
    * @aigne/openai 版本升至 0.4.3
    * @aigne/xai 版本升至 0.3.10

## [1.15.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.14.1...cli-v1.15.0) (2025-06-29)


### 功能

* **可观测性:** 调整跟踪用户体验并支持增量导出 ([#184](https://github.com/AIGNE-io/aigne-framework/issues/184)) ([d174188](https://github.com/AIGNE-io/aigne-framework/commit/d174188459c77acb09b5ca040972f83abb067587))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.2
    * @aigne/anthropic 版本升至 0.3.9
    * @aigne/bedrock 版本升至 0.3.9
    * @aigne/core 版本升至 1.25.0
    * @aigne/deepseek 版本升至 0.3.9
    * @aigne/gemini 版本升至 0.3.9
    * @aigne/observability 版本升至 0.2.0
    * @aigne/ollama 版本升至 0.3.9
    * @aigne/open-router 版本升至 0.3.9
    * @aigne/openai 版本升至 0.4.2
    * @aigne/xai 版本升至 0.3.9

## [1.14.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.14.0...cli-v1.14.1) (2025-06-26)


### 错误修复

* aigne cli 找不到包 ([#185](https://github.com/AIGNE-io/aigne-framework/issues/185)) ([5d98b61](https://github.com/AIGNE-io/aigne-framework/commit/5d98b6158f1e43e049a3a51a69bab88092bf1c92))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.1
    * @aigne/anthropic 版本升至 0.3.8
    * @aigne/bedrock 版本升至 0.3.8
    * @aigne/core 版本升至 1.24.1
    * @aigne/deepseek 版本升至 0.3.8
    * @aigne/gemini 版本升至 0.3.8
    * @aigne/observability 版本升至 0.1.3
    * @aigne/ollama 版本升至 0.3.8
    * @aigne/open-router 版本升至 0.3.8
    * @aigne/openai 版本升至 0.4.1
    * @aigne/xai 版本升至 0.3.8

## [1.14.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.13.2...cli-v1.14.0) (2025-06-26)


### 功能

* **transport:** 支持调用服务器端聊天模型 ([#182](https://github.com/AIGNE-io/aigne-framework/issues/182)) ([f81a1bf](https://github.com/AIGNE-io/aigne-framework/commit/f81a1bf883abda1845ccee09b270e5f583e287ab))


### 错误修复

* blocklet 启动失败 ([#180](https://github.com/AIGNE-io/aigne-framework/issues/180)) ([296a481](https://github.com/AIGNE-io/aigne-framework/commit/296a481be69d9b9b279dc4e50b0d21c993d1d841))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.17.0
    * @aigne/anthropic 版本升至 0.3.7
    * @aigne/bedrock 版本升至 0.3.7
    * @aigne/core 版本升至 1.24.0
    * @aigne/deepseek 版本升至 0.3.7
    * @aigne/gemini 版本升至 0.3.7
    * @aigne/observability 版本升至 0.1.2
    * @aigne/ollama 版本升至 0.3.7
    * @aigne/open-router 版本升至 0.3.7
    * @aigne/openai 版本升至 0.4.0
    * @aigne/xai 版本升至 0.3.7

## [1.13.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.13.1...cli-v1.13.2) (2025-06-25)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.16.1
    * @aigne/anthropic 版本升至 0.3.6
    * @aigne/bedrock 版本升至 0.3.6
    * @aigne/core 版本升至 1.23.1
    * @aigne/deepseek 版本升至 0.3.6
    * @aigne/gemini 版本升至 0.3.6
    * @aigne/ollama 版本升至 0.3.6
    * @aigne/open-router 版本升至 0.3.6
    * @aigne/openai 版本升至 0.3.6
    * @aigne/xai 版本升至 0.3.6

## [1.13.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.13.0...cli-v1.13.1) (2025-06-25)


### 错误修复

* **blocklet:** 确保只有管理员才能访问跟踪 ([#173](https://github.com/AIGNE-io/aigne-framework/issues/173)) ([9c5cc06](https://github.com/AIGNE-io/aigne-framework/commit/9c5cc06c5841b9684d16c5c60af764d8c98c9c3e))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.16.0
    * @aigne/anthropic 版本升至 0.3.5
    * @aigne/bedrock 版本升至 0.3.5
    * @aigne/core 版本升至 1.23.0
    * @aigne/deepseek 版本升至 0.3.5
    * @aigne/gemini 版本升至 0.3.5
    * @aigne/observability 版本升至 0.1.1
    * @aigne/ollama 版本升至 0.3.5
    * @aigne/open-router 版本升至 0.3.5
    * @aigne/openai 版本升至 0.3.5
    * @aigne/xai 版本升至 0.3.5

## [1.13.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.12.0...cli-v1.13.0) (2025-06-24)


### 功能

* 支持 cli 和 blocklet 的可观测性 ([#155](https://github.com/AIGNE-io/aigne-framework/issues/155)) ([5baa705](https://github.com/AIGNE-io/aigne-framework/commit/5baa705a33cfdba1efc5ccbe18674c27513ca97d))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.15.0
    * @aigne/anthropic 版本升至 0.3.4
    * @aigne/bedrock 版本升至 0.3.4
    * @aigne/core 版本升至 1.22.0
    * @aigne/deepseek 版本升至 0.3.4
    * @aigne/gemini 版本升至 0.3.4
    * @aigne/ollama 版本升至 0.3.4
    * @aigne/open-router 版本升至 0.3.4
    * @aigne/openai 版本升至 0.3.4
    * @aigne/xai 版本升至 0.3.4

## [1.12.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.9...cli-v1.12.0) (2025-06-20)


### 功能

* **cli:** 支持通过 --input-xxx 向 Agent 传递命名输入 ([#167](https://github.com/AIGNE-io/aigne-framework/issues/167)) ([cda5bb6](https://github.com/AIGNE-io/aigne-framework/commit/cda5bb6baab680787de1a042664fe34c17a84bb1))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.14.0
    * @aigne/anthropic 版本升至 0.3.3
    * @aigne/bedrock 版本升至 0.3.3
    * @aigne/core 版本升至 1.21.0
    * @aigne/deepseek 版本升至 0.3.3
    * @aigne/gemini 版本升至 0.3.3
    * @aigne/ollama 版本升至 0.3.3
    * @aigne/open-router 版本升至 0.3.3
    * @aigne/openai 版本升至 0.3.3
    * @aigne/xai 版本升至 0.3.3

## [1.11.9](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.8...cli-v1.11.9) (2025-06-19)


### 错误修复

* 为 AIAgent 使用 `inputKey` 而非隐式的 $message ([#165](https://github.com/AIGNE-io/aigne-framework/issues/165)) ([8b6e589](https://github.com/AIGNE-io/aigne-framework/commit/8b6e5896bba8209fd2eecb0f5b9263618bffdaf8))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.13.2
    * @aigne/anthropic 版本升至 0.3.2
    * @aigne/bedrock 版本升至 0.3.2
    * @aigne/core 版本升至 1.20.1
    * @aigne/deepseek 版本升至 0.3.2
    * @aigne/gemini 版本升至 0.3.2
    * @aigne/ollama 版本升至 0.3.2
    * @aigne/open-router 版本升至 0.3.2
    * @aigne/openai 版本升至 0.3.2
    * @aigne/xai 版本升至 0.3.2

## [1.11.8](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.7...cli-v1.11.8) (2025-06-17)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.13.1
    * @aigne/anthropic 版本升至 0.3.1
    * @aigne/bedrock 版本升至 0.3.1
    * @aigne/core 版本升至 1.20.0
    * @aigne/deepseek 版本升至 0.3.1
    * @aigne/gemini 版本升至 0.3.1
    * @aigne/ollama 版本升至 0.3.1
    * @aigne/open-router 版本升至 0.3.1
    * @aigne/openai 版本升至 0.3.1
    * @aigne/xai 版本升至 0.3.1

## [1.11.7](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.6...cli-v1.11.7) (2025-06-16)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.13.0
    * @aigne/anthropic 版本升至 0.3.0
    * @aigne/bedrock 版本升至 0.3.0
    * @aigne/core 版本升至 1.19.0
    * @aigne/deepseek 版本升至 0.3.0
    * @aigne/gemini 版本升至 0.3.0
    * @aigne/ollama 版本升至 0.3.0
    * @aigne/open-router 版本升至 0.3.0
    * @aigne/openai 版本升至 0.3.0
    * @aigne/xai 版本升至 0.3.0

## [1.11.6](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.5...cli-v1.11.6) (2025-06-11)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.12.6
    * @aigne/anthropic 版本升至 0.2.7
    * @aigne/bedrock 版本升至 0.2.7
    * @aigne/core 版本升至 1.18.6
    * @aigne/deepseek 版本升至 0.2.7
    * @aigne/gemini 版本升至 0.2.7
    * @aigne/ollama 版本升至 0.2.7
    * @aigne/open-router 版本升至 0.2.7
    * @aigne/openai 版本升至 0.2.7
    * @aigne/xai 版本升至 0.2.7

## [1.11.5](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.4...cli-v1.11.5) (2025-06-06)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.12.5
    * @aigne/anthropic 版本升至 0.2.6
    * @aigne/bedrock 版本升至 0.2.6
    * @aigne/core 版本升至 1.18.5
    * @aigne/deepseek 版本升至 0.2.6
    * @aigne/gemini 版本升至 0.2.6
    * @aigne/ollama 版本升至 0.2.6
    * @aigne/open-router 版本升至 0.2.6
    * @aigne/openai 版本升至 0.2.6
    * @aigne/xai 版本升至 0.2.6

## [1.11.4](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.3...cli-v1.11.4) (2025-06-05)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.12.4
    * @aigne/anthropic 版本升至 0.2.5
    * @aigne/bedrock 版本升至 0.2.5
    * @aigne/core 版本升至 1.18.4
    * @aigne/deepseek 版本升至 0.2.5
    * @aigne/gemini 版本升至 0.2.5
    * @aigne/ollama 版本升至 0.2.5
    * @aigne/open-router 版本升至 0.2.5
    * @aigne/openai 版本升至 0.2.5
    * @aigne/xai 版本升至 0.2.5

## [1.11.3](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.2...cli-v1.11.3) (2025-06-05)


### 错误修复

* 兼容 nodejs 版本 >=20 ([#149](https://github.com/AIGNE-io/aigne-framework/issues/149)) ([d5ae9f2](https://github.com/AIGNE-io/aigne-framework/commit/d5ae9f245972e87e70fd87cdd960ade9940f288c))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.12.3
    * @aigne/anthropic 版本升至 0.2.4
    * @aigne/bedrock 版本升至 0.2.4
    * @aigne/core 版本升至 1.18.3
    * @aigne/deepseek 版本升至 0.2.4
    * @aigne/gemini 版本升至 0.2.4
    * @aigne/ollama 版本升至 0.2.4
    * @aigne/open-router 版本升至 0.2.4
    * @aigne/openai 版本升至 0.2.4
    * @aigne/xai 版本升至 0.2.4

## [1.11.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.1...cli-v1.11.2) (2025-05-30)


### 错误修复

* 为 AIGNE 提供可用内存 ([#145](https://github.com/AIGNE-io/aigne-framework/issues/145)) ([c5dc960](https://github.com/AIGNE-io/aigne-framework/commit/c5dc9605e0fb7ca60e1f5fa2f0da67ffec00c601))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/agent-library 版本升至 1.12.2
    * @aigne/anthropic 版本升至 0.2.3
    * @aigne/bedrock 版本升至 0.2.3
    * @aigne/core 版本升至 1.18.2
    * @aigne/deepseek 版本升至 0.2.3
    * @aigne/gemini 版本升至 0.2.3
    * @aigne/ollama 版本升至 0.2.3
    * @aigne/open-router 版本升至 0.2.3
    * @aigne/openai 版本升至 0.2.3
    * @aigne/xai 版本升至 0.2.3

## [1.11.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.11.0...cli-v1.11.1) (2025-05-30)


### 错误修复

* logger 遵守 DEBUG 环境变量 ([#142](https://github.com/AIGNE-io/aigne-framework/issues/142)) ([f84738a](https://github.com/AIGNE-io/aigne-framework/commit/f84738acb382d9fb4f47253fcf91c92c02200053))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/anthropic 版本升至 0.2.2
    * @aigne/bedrock 版本升至 0.2.2
    * @aigne/core 版本升至 1.18.1
    * @aigne/deepseek 版本升至 0.2.2
    * @aigne/gemini 版本升至 0.2.2
    * @aigne/ollama 版本升至 0.2.2
    * @aigne/open-router 版本升至 0.2.2
    * @aigne/openai 版本升至 0.2.2
    * @aigne/xai 版本升至 0.2.2

## [1.11.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.10.1...cli-v1.11.0) (2025-05-29)


### 功能

* 为 client Agent 添加 memory Agent 支持 ([#139](https://github.com/AIGNE-io/aigne-framework/issues/139)) ([57044fa](https://github.com/AIGNE-io/aigne-framework/commit/57044fa87b8abcba395cd05f941d6d312ab65764))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/anthropic 版本升至 0.2.1
    * @aigne/bedrock 版本升至 0.2.1
    * @aigne/core 版本升至 1.18.0
    * @aigne/deepseek 版本升至 0.2.1
    * @aigne/gemini 版本升至 0.2.1
    * @aigne/ollama 版本升至 0.2.1
    * @aigne/open-router 版本升至 0.2.1
    * @aigne/openai 版本升至 0.2.1
    * @aigne/xai 版本升至 0.2.1

## [1.10.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.10.0...cli-v1.10.1) (2025-05-25)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/anthropic 版本升至 0.2.0
    * @aigne/bedrock 版本升至 0.2.0
    * @aigne/core 版本升至 1.17.0
    * @aigne/deepseek 版本升至 0.2.0
    * @aigne/gemini 版本升至 0.2.0
    * @aigne/ollama 版本升至 0.2.0
    * @aigne/open-router 版本升至 0.2.0
    * @aigne/openai 版本升至 0.2.0
    * @aigne/xai 版本升至 0.2.0

## [1.10.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.9.1...cli-v1.10.0) (2025-05-23)


### 功能

* 为 `run` 命令添加 `--chat` 选项 ([#120](https://github.com/AIGNE-io/aigne-framework/issues/120)) ([7699550](https://github.com/AIGNE-io/aigne-framework/commit/76995507001ca33b09b29f72ff588dae513cb340))
* **models:** 将模型适配器作为独立包发布 ([#126](https://github.com/AIGNE-io/aigne-framework/issues/126)) ([588b8ae](https://github.com/AIGNE-io/aigne-framework/commit/588b8aea6abcee5fa87def1358bf51f84021c6ef))


### 错误修复

* **cli:** listr ctx 可能未定义 ([#130](https://github.com/AIGNE-io/aigne-framework/issues/130)) ([dfc7b13](https://github.com/AIGNE-io/aigne-framework/commit/dfc7b139e05cf9b6e0314f42f308d25e9b70ea5c))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/anthropic 版本升至 0.1.0
    * @aigne/bedrock 版本升至 0.1.0
    * @aigne/core 版本升至 1.16.0
    * @aigne/deepseek 版本升至 0.1.0
    * @aigne/gemini 版本升至 0.1.0
    * @aigne/ollama 版本升至 0.1.0
    * @aigne/open-router 版本升至 0.1.0
    * @aigne/openai 版本升至 0.1.0
    * @aigne/xai 版本升至 0.1.0

## [1.9.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.9.0...cli-v1.9.1) (2025-05-15)


### 错误修复

* **core:** response.headers.toJSON 不是一个函数 ([#121](https://github.com/AIGNE-io/aigne-framework/issues/121)) ([4609ba6](https://github.com/AIGNE-io/aigne-framework/commit/4609ba645e6b8fe8d76ecd475cd2d7817483a4bd))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/core 版本升至 1.15.0

## [1.9.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.8.1...cli-v1.9.0) (2025-05-12)


### 功能

* **docs:** 使用 typedoc 构建文档并发布到 gh-pages ([#100](https://github.com/AIGNE-io/aigne-framework/issues/100)) ([b9074c0](https://github.com/AIGNE-io/aigne-framework/commit/b9074c0148ea343ada92b5919a52b47537a1ad48))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/core 版本升至 1.14.0

## [1.8.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.8.0...cli-v1.8.1) (2025-04-30)


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/core 版本升至 1.13.0

## [1.8.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.7.0...cli-v1.8.0) (2025-04-27)


### 功能

* 支持 TeamAgent 并最终确定 API 命名 ([#91](https://github.com/AIGNE-io/aigne-framework/issues/91)) ([033d1b6](https://github.com/AIGNE-io/aigne-framework/commit/033d1b6a7dc5460807476abb35a413ba89a2a664))


### 错误修复

* 为 serve mcp 命令升级到可流式传输的 API ([#98](https://github.com/AIGNE-io/aigne-framework/issues/98)) ([ae32bda](https://github.com/AIGNE-io/aigne-framework/commit/ae32bda20e57c2a2eb8b49fad034b0b2a5ebb15e))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/core 版本升至 1.12.0

## [1.7.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.6.0...cli-v1.7.0) (2025-04-23)


### 功能

* **core:** 增强 ClaudeChatModel 以支持流式响应 ([#85](https://github.com/AIGNE-io/aigne-framework/issues/85)) ([5433240](https://github.com/AIGNE-io/aigne-framework/commit/5433240e7b663ec9e9f4a79dffa05038088d54fc))
* 支持在 Agent yaml 中设置内存 ([#90](https://github.com/AIGNE-io/aigne-framework/issues/90)) ([215118f](https://github.com/AIGNE-io/aigne-framework/commit/215118f1dc55f02322d59a3f18395a459198e031))
* **测试:** 添加示例测试并更新 CI 配置 ([#81](https://github.com/AIGNE-io/aigne-framework/issues/81)) ([777bb8d](https://github.com/AIGNE-io/aigne-framework/commit/777bb8d184c21e74b3eb9bbb4a1003708409a338))


### 依赖项

* 更新了以下工作区依赖项
  * 依赖项
    * @aigne/core 版本升至 1.11.0

## [1.6.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.5.1...cli-v1.6.0) (2025-04-22)


### 功能

* **cli:** 为 run 命令添加 --verbose 选项 ([#82](https://github.com/AIGNE-io/aigne-framework/issues/82)) ([7adf8be](https://github.com/AIGNE-io/aigne-framework/commit/7adf8be34963e714268457ab8b2ffeb945da5721))

## [1.5.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.5.0...cli-v1.5.1) (2025-04-22)


### 错误修复

* 使用 bunwrapper 启动示例 ([#79](https://github.com/AIGNE-io/aigne-framework/issues/79)) ([55022e2](https://github.com/AIGNE-io/aigne-framework/commit/55022e20bb253bac608dad3024600da91e093a69))

## [1.5.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.4.0...cli-v1.5.0) (2025-04-22)


### 功能

* **cli:** 使用 markdown 高亮渲染输出消息 ([#76](https://github.com/AIGNE-io/aigne-framework/issues/76)) ([b2a793a](https://github.com/AIGNE-io/aigne-framework/commit/b2a793a638e5f95d3f68be80f907da40bd7e624a))
* **流式传输:** 为 Agent 添加流式输出支持 ([#73](https://github.com/AIGNE-io/aigne-framework/issues/73)) ([5f3ea4b](https://github.com/AIGNE-io/aigne-framework/commit/5f3ea4bccda7c8c457d6e9518b3d6a8b254ec041))

## [1.4.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.3.0...cli-v1.4.0) (2025-04-20)


### 功能

* **core:** 添加 DeepSeek、Gemini、OpenRouter 和 Ollama 的模型适配器 ([#53](https://github.com/AIGNE-io/aigne-framework/issues/53)) ([5d40546](https://github.com/AIGNE-io/aigne-framework/commit/5d40546bd5ddb70233d27ea3b20e5711b2af320a))


### 错误修复

* **cli:** 为 `run` 命令显示进度 ([#68](https://github.com/AIGNE-io/aigne-framework/issues/68)) ([e3d2193](https://github.com/AIGNE-io/aigne-framework/commit/e3d21930bc2cf20edeb0ad7123e9e87e3e0ea653))
* **cli:** 在解压包之前确保目录存在 ([#70](https://github.com/AIGNE-io/aigne-framework/issues/70)) ([5ebe56d](https://github.com/AIGNE-io/aigne-framework/commit/5ebe56d3483d4309d9e39ab0566d353b3787edce))

## [1.3.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.2.0...cli-v1.3.0) (2025-04-17)


### 功能

* **ci:** 支持使用模型矩阵覆盖示例 ([#59](https://github.com/AIGNE-io/aigne-framework/issues/59)) ([1edd704](https://github.com/AIGNE-io/aigne-framework/commit/1edd70426b80a69e3751b2d5fe818297711d0777))
* **cli:** 支持从 studio 转换 Agent ([#64](https://github.com/AIGNE-io/aigne-framework/issues/64)) ([f544bc7](https://github.com/AIGNE-io/aigne-framework/commit/f544bc77a2fb07e034b317ceb6a46aadd35830c9))
* **cli:** 支持 aigne run 的模型和下载自定义 ([#61](https://github.com/AIGNE-io/aigne-framework/issues/61)) ([51f6619](https://github.com/AIGNE-io/aigne-framework/commit/51f6619e6c591a84f1f2339b26ef66d89fa9486e))

## [1.2.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.1.0...cli-v1.2.0) (2025-04-15)


### 功能

* 添加 TerminalTracer 以改善终端用户体验 ([#56](https://github.com/AIGNE-io/aigne-framework/issues/56)) ([9875a5d](https://github.com/AIGNE-io/aigne-framework/commit/9875a5d46abb55073340ffae841fed6bd6b83ff4))
* **cli:** 支持从远程 URL 运行 Agent ([#60](https://github.com/AIGNE-io/aigne-framework/issues/60)) ([5f49920](https://github.com/AIGNE-io/aigne-framework/commit/5f4992089d36f9e780ba55a912a1d35508cad28e))


### 错误修复

* 为保证兼容性，移除新的 Node.js exists API 的使用 ([#57](https://github.com/AIGNE-io/aigne-framework/issues/57)) ([c10cc08](https://github.com/AIGNE-io/aigne-framework/commit/c10cc086d8ecd0744f38cdb1367d4c8816b723b3))

## [1.1.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.0.0...cli-v1.1.0) (2025-04-08)


### 功能

* 为 @aigne/cli 添加 `serve` 命令 ([#54](https://github.com/AIGNE-io/aigne-framework/issues/54)) ([1cca843](https://github.com/AIGNE-io/aigne-framework/commit/1cca843f1760abe832b6651108fa858130f47355))
* 添加 Agent 库支持 ([#51](https://github.com/AIGNE-io/aigne-framework/issues/51)) ([1f0d34d](https://github.com/AIGNE-io/aigne-framework/commit/1f0d34ddda3154283a4bc958ddb9b68b4ac106b0))

