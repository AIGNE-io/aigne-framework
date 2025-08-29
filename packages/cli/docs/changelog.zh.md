---
labels: ["Reference"]
---

# 更新日志

本文档提供了对 @aigne/cli 包所做的所有重要更改的完整历史记录。

## [1.42.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.41.3...cli-v1.42.0) (2025-08-28)


### 功能

* **cli:** 添加具有动态筛选功能的可搜索复选框组件 ([#426](https://github.com/AIGNE-io/aigne-framework/issues/426)) ([1a76fe7](https://github.com/AIGNE-io/aigne-framework/commit/1a76fe7c2f7d91bc4041dfcd73850b39a18a036b))


### 修复

* **cli:** 仅在帮助和错误信息中显示 ASCII 徽标 ([#425](https://github.com/AIGNE-io/aigne-framework/issues/425)) ([1279376](https://github.com/AIGNE-io/aigne-framework/commit/1279376b7ca9c1c38148dcde581ee4730771a4ad))


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.31
    * @aigne/agentic-memory 已升级至 1.0.31
    * @aigne/aigne-hub 已升级至 0.8.1
    * @aigne/core 已升级至 1.57.0
    * @aigne/default-memory 已升级至 1.1.13
    * @aigne/openai 已升级至 0.13.2
  * 开发依赖项
    * @aigne/test-utils 已升级至 0.5.38

## [1.41.3](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.41.2...cli-v1.41.3) (2025-08-27)


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.30
    * @aigne/agentic-memory 已升级至 1.0.30
    * @aigne/aigne-hub 已升级至 0.8.0
    * @aigne/core 已升级至 1.56.0
    * @aigne/default-memory 已升级至 1.1.12
    * @aigne/openai 已升级至 0.13.1
  * 开发依赖项
    * @aigne/test-utils 已升级至 0.5.37

## [1.41.2](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.41.1...cli-v1.41.2) (2025-08-27)


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.29
    * @aigne/agentic-memory 已升级至 1.0.29
    * @aigne/aigne-hub 已升级至 0.7.0
    * @aigne/default-memory 已升级至 1.1.11
    * @aigne/openai 已升级至 0.13.0

## [1.41.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.41.0...cli-v1.41.1) (2025-08-26)


### 修复

* **cli:** 降低 AIGNE CLI 的内存使用量 ([#411](https://github.com/AIGNE-io/aigne-framework/issues/411)) ([9c36969](https://github.com/AIGNE-io/aigne-framework/commit/9c369699d966d37abf2d6a1624eac3d2fda4123b))
* **cli:** 使用 corepack 代替 npm 安装依赖项 ([#413](https://github.com/AIGNE-io/aigne-framework/issues/413)) ([1b9150c](https://github.com/AIGNE-io/aigne-framework/commit/1b9150c534bfd0cfbb51f5bed51fff609da93628))
* 优化 hub 连接文案 ([#415](https://github.com/AIGNE-io/aigne-framework/issues/415)) ([8acc4ad](https://github.com/AIGNE-io/aigne-framework/commit/8acc4adf5815afc9564235eeb40b09293c6ab00c))


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.28
    * @aigne/agentic-memory 已升级至 1.0.28
    * @aigne/aigne-hub 已升级至 0.6.10
    * @aigne/core 已升级至 1.55.1
    * @aigne/default-memory 已升级至 1.1.10
    * @aigne/observability-api 已升级至 0.10.1
    * @aigne/openai 已升级至 0.12.4
  * 开发依赖项
    * @aigne/test-utils 已升级至 0.5.36

## [1.41.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.40.0...cli-v1.41.0) (2025-08-25)


### 功能

* **ux:** 在 aigne 运行时中使用标准 blocklet 布局 ([#403](https://github.com/AIGNE-io/aigne-framework/issues/403)) ([a14274d](https://github.com/AIGNE-io/aigne-framework/commit/a14274dbf970bae7fed0eff150933ecf0f65eb64))


### 修复

* **cli:** 加载 loadChatModel 时优先使用 process.env 中的变量 ([#407](https://github.com/AIGNE-io/aigne-framework/issues/407)) ([d32b2db](https://github.com/AIGNE-io/aigne-framework/commit/d32b2db20435a022d944a674e90333899d881daf))


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.27
    * @aigne/agentic-memory 已升级至 1.0.27
    * @aigne/aigne-hub 已升级至 0.6.9
    * @aigne/default-memory 已升级至 1.1.9
    * @aigne/openai 已升级至 0.12.3
  * 开发依赖项
    * @aigne/test-utils 已升级至 0.5.35

## [1.40.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.39.1...cli-v1.40.0) (2025-08-22)


### 功能

* **cli:** 支持 aigne deploy 命令 ([#399](https://github.com/AIGNE-io/aigne-framework/issues/399)) ([b69cba9](https://github.com/AIGNE-io/aigne-framework/commit/b69cba901d95882f847032f41d963e2fa6893ab6))

## [1.39.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.39.0...cli-v1.39.1) (2025-08-21)


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.26
    * @aigne/agentic-memory 已升级至 1.0.26
    * @aigne/aigne-hub 已升级至 0.6.8
    * @aigne/core 已升级至 1.55.0
    * @aigne/default-memory 已升级至 1.1.8
    * @aigne/observability-api 已升级至 0.10.0
    * @aigne/openai 已升级至 0.12.2

## [1.39.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.38.1...cli-v1.39.0) (2025-08-21)


### 功能

* **cli:** 为 cli 添加聊天模式支持 ([#389](https://github.com/AIGNE-io/aigne-framework/issues/389)) ([d7dc138](https://github.com/AIGNE-io/aigne-framework/commit/d7dc138719dd638ddb12c4625abdf42746baf35d))


### 修复

* **cli:** 强制重新导入 Agent 模块并清除缓存 ([#392](https://github.com/AIGNE-io/aigne-framework/issues/392)) ([c372cb9](https://github.com/AIGNE-io/aigne-framework/commit/c372cb9600a9d78ad1808a045bcddfc285e9c6f0))


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.25
    * @aigne/agentic-memory 已升级至 1.0.25
    * @aigne/aigne-hub 已升级至 0.6.7
    * @aigne/core 已升级至 1.54.0
    * @aigne/default-memory 已升级至 1.1.7
    * @aigne/openai 已升级至 0.12.1

## [1.38.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.38.0...cli-v1.38.1) (2025-08-21)


### 修复

* **cli:** 加载应用程序出错时强制升级应用程序 ([#390](https://github.com/AIGNE-io/aigne-framework/issues/390)) ([fa5e427](https://github.com/AIGNE-io/aigne-framework/commit/fa5e427eb29157c3ebcd9c9bf8c5c6b31efad4ae))

## [1.38.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.37.1...cli-v1.38.0) (2025-08-20)


### 功能

* 添加 ImageModel/ImageAgent 支持 ([#383](https://github.com/AIGNE-io/aigne-framework/issues/383)) ([96a2093](https://github.com/AIGNE-io/aigne-framework/commit/96a209368d91d98f47db6de1e404640368a86fa8))


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.24
    * @aigne/agentic-memory 已升级至 1.0.24
    * @aigne/aigne-hub 已升级至 0.6.6
    * @aigne/core 已升级至 1.53.0
    * @aigne/default-memory 已升级至 1.1.6
    * @aigne/openai 已升级至 0.12.0

## [1.37.1](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.37.0...cli-v1.37.1) (2025-08-20)


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.23
    * @aigne/agentic-memory 已升级至 1.0.23
    * @aigne/aigne-hub 已升级至 0.6.5
    * @aigne/core 已升级至 1.52.0
    * @aigne/default-memory 已升级至 1.1.5
    * @aigne/observability-api 已升级至 0.9.1
    * @aigne/openai 已升级至 0.11.5

## [1.37.0](https://github.com/AIGNE-io/aigne-framework/compare/cli-v1.36.4...cli-v1.37.0) (2025-08-18)


### 功能

* **cli:** 在 CLI 参数中添加对数组输入的支持 ([#378](https://github.com/AIGNE-io/aigne-framework/issues/378)) ([827ae11](https://github.com/AIGNE-io/aigne-framework/commit/827ae112de8d1a2e997b272b759090b6e5b8d395))
* **cli:** 支持在 CLI 中为 Agent 隐藏或折叠任务 ([#381](https://github.com/AIGNE-io/aigne-framework/issues/381)) ([05b372d](https://github.com/AIGNE-io/aigne-framework/commit/05b372d431a862f7cdfa2a90bb4b7b2379bf97ab))


### 修复

* **cli:** 仅记录信息级别及以上的 API 请求 ([#376](https://github.com/AIGNE-io/aigne-framework/issues/376)) ([03fc4d9](https://github.com/AIGNE-io/aigne-framework/commit/03fc4d9aad6e81aeae3b2eb02a62f7acade3bd77))


### 依赖

* 以下工作区依赖项已更新
  * 依赖项
    * @aigne/agent-library 已升级至 1.21.22
    * @aigne/agentic-memory 已升级至 1.0.22
    * @aigne/aigne-hub 已升级至 0.6.4
    * @aigne/core 已升级至 1.51.0
    * @aigne/default-memory 已升级至 1.1.4
    * @aigne/openai 已升级至 0.11.4

所有其他版本依此类推...