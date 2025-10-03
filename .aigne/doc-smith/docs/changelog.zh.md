# 更新日志

本文档提供了 `@aigne/core` 包所有版本的完整记录，详细说明了新功能、错误修复和重大变更。

## [1.62.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.4...core-v1.62.0-beta.5) (2025-10-02)

### 功能

-   **core:** 为 AI Agent 添加 `keepTextInToolUses` 选项 ([#585](https://github.com/AIGNE-io/aigne-framework/issues/585)) ([6c6be9e](https://github.com/AIGNE-io/aigne-framework/commit/6c6be9eee8e96294921b676a1982a18c93b2f66d))

### 错误修复

-   **core:** Agent 重试时不应发出错误事件 ([#583](https://github.com/AIGNE-io/aigne-framework/issues/583)) ([04edcbf](https://github.com/AIGNE-io/aigne-framework/commit/04edcbfd71aa2746dad98140e20e0b718701fa0a))

## [1.62.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.3...core-v1.62.0-beta.4) (2025-10-01)

### 错误修复

-   在加载函数中处理可选的 imageModel ([#582](https://github.com/AIGNE-io/aigne-framework/issues/582)) ([7d55084](https://github.com/AIGNE-io/aigne-framework/commit/7d550841b6edfc762ef7c188a585d9fc8ffdf4c7))
-   更新 CommonJS 环境中的依赖项兼容性 ([#580](https://github.com/AIGNE-io/aigne-framework/issues/580)) ([a1e35d0](https://github.com/AIGNE-io/aigne-framework/commit/a1e35d016405accb51c1aeb6a544503a1c78e912))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.11.1-beta.2

## [1.62.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.2...core-v1.62.0-beta.3) (2025-10-01)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.11.1-beta.1

## [1.62.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta.1...core-v1.62.0-beta.2) (2025-10-01)

### 错误修复

-   **core:** 为 Agent 定义添加 `include_input_in_output` 选项 ([#575](https://github.com/AIGNE-io/aigne-framework/issues/575)) ([9e28b72](https://github.com/AIGNE-io/aigne-framework/commit/9e28b729963faa8bea90ee42fde855868889396d))

## [1.62.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.62.0-beta...core-v1.62.0-beta.1) (2025-10-01)

### 错误修复

-   防止 Agent 和工具消息的模板渲染 ([#572](https://github.com/AIGNE-io/aigne-framework/issues/572)) ([859687e](https://github.com/AIGNE-io/aigne-framework/commit/859687e499b07ffebced8b2cd89d4af676f6a462))

## [1.62.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.1-beta...core-v1.62.0-beta) (2025-09-30)

### 功能

-   **cli:** 支持为子应用定义嵌套命令 ([#568](https://github.com/AIGNE-io/aigne-framework/issues/568)) ([0693b80](https://github.com/AIGNE-io/aigne-framework/commit/0693b807e0f8d335010e6ad00763b07cf095e65b))

## [1.61.1-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0...core-v1.61.1-beta) (2025-09-29)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.11.1-beta

## [1.61.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.8...core-v1.61.0) (2025-09-27)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.11.0
        -   @aigne/platform-helpers 已更新至 0.6.3

## [1.61.0-beta.8](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.7...core-v1.61.0-beta.8) (2025-09-26)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.11.0-beta.1

## [1.61.0-beta.7](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.6...core-v1.61.0-beta.7) (2025-09-26)

### 错误修复

-   **core:** 通过结构而非 instanceOf 检查 Agent ([826ef6f](https://github.com/AIGNE-io/aigne-framework/commit/826ef6fd4e9603cf51344e8e5b11af644396220e))

## [1.61.0-beta.6](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.5...core-v1.61.0-beta.6) (2025-09-26)

### 错误修复

-   多输入提醒 ([#550](https://github.com/AIGNE-io/aigne-framework/issues/550)) ([0ab858f](https://github.com/AIGNE-io/aigne-framework/commit/0ab858fbe5177f02c1ca6af239b4171a358545df))

## [1.61.0-beta.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.4...core-v1.61.0-beta.5) (2025-09-25)

### 功能

-   **core:** 为结构化输出添加自动 JSON 解析和验证 ([#548](https://github.com/AIGNE-io/aigne-framework/issues/548)) ([9077f93](https://github.com/AIGNE-io/aigne-framework/commit/9077f93856865915aaf5e8caa5638ef0b7f05b1e))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.11.0-beta

## [1.61.0-beta.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.3...core-v1.61.0-beta.4) (2025-09-25)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.10.5-beta

## [1.61.0-beta.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.2...core-v1.61.0-beta.3) (2025-09-24)

### 功能

-   **core:** 为 Agent YAML 添加多角色指令支持 ([#538](https://github.com/AIGNE-io/aigne-framework/issues/538)) ([97bf77f](https://github.com/AIGNE-io/aigne-framework/commit/97bf77f96b5f69321539311159010499eb3b1b25))

## [1.61.0-beta.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta.1...core-v1.61.0-beta.2) (2025-09-23)

### 错误修复

-   为图像模型添加首选输入文件类型选项 ([#536](https://github.com/AIGNE-io/aigne-framework/issues/536)) ([3cba8a5](https://github.com/AIGNE-io/aigne-framework/commit/3cba8a5562233a1567b49b6dd5c446c0760f5c4c))

## [1.61.0-beta.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.61.0-beta...core-v1.61.0-beta.1) (2025-09-23)

### 错误修复

-   标准化跨模型的文件参数命名 ([#534](https://github.com/AIGNE-io/aigne-framework/issues/534)) ([f159a9d](https://github.com/AIGNE-io/aigne-framework/commit/f159a9d6af21ec0e99641996b150560929845845))

## [1.61.0-beta](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.60.3...core-v1.61.0-beta) (2025-09-22)

### 功能

-   改进图像模型架构和文件处理 ([#527](https://github.com/AIGNE-io/aigne-framework/issues/527)) ([4db50aa](https://github.com/AIGNE-io/aigne-framework/commit/4db50aa0387a1a0f045ca11aaa61613e36ca7597))

### 错误修复

-   解决 Windows 文件导入 URI 问题 ([#528](https://github.com/AIGNE-io/aigne-framework/issues/528)) ([bf807c5](https://github.com/AIGNE-io/aigne-framework/commit/bf807c5a3563c4423dc82fddff7fba280ef57957))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/platform-helpers 已更新至 0.6.3-beta

## [1.60.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.60.2...core-v1.60.3) (2025-09-18)

### 错误修复

-   **models:** 为图像模型将本地图像转换为 base64 ([#517](https://github.com/AIGNE-io/aigne-framework/issues/517)) ([c0bc971](https://github.com/AIGNE-io/aigne-framework/commit/c0bc971087ef6e1caa641a699aed391a24feb40d))

## [1.60.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.60.1...core-v1.60.2) (2025-09-11)

### 错误修复

-   **core:** 为输出模式添加 nullish 或 nullable 支持 ([#482](https://github.com/AIGNE-io/aigne-framework/issues/482)) ([bf80c29](https://github.com/AIGNE-io/aigne-framework/commit/bf80c29e10d3fef654c830df8dc7f3b7939fa58d))

## [1.60.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.60.0...core-v1.60.1) (2025-09-11)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.10.4

## [1.60.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.59.0...core-v1.60.0) (2025-09-10)

### 功能

-   支持为每个 Agent 自定义模型 ([#472](https://github.com/AIGNE-io/aigne-framework/issues/472)) ([0bda78a](https://github.com/AIGNE-io/aigne-framework/commit/0bda78a2ebf537e953d855882d68cb37d94d1d10))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.10.3

## [1.59.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.58.3...core-v1.59.0) (2025-09-09)

### 功能

-   支持自定义首选输入文件类型 ([#469](https://github.com/AIGNE-io/aigne-framework/issues/469)) ([db0161b](https://github.com/AIGNE-io/aigne-framework/commit/db0161bbac52542c771ee2f40f361636b0668075))

## [1.58.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.58.2...core-v1.58.3) (2025-09-08)

### 错误修复

-   处理 Agent YAML 提示 URL 中的绝对路径 ([#466](https://github.com/AIGNE-io/aigne-framework/issues/466)) ([a07a088](https://github.com/AIGNE-io/aigne-framework/commit/a07a0880728f65fc831578763b62ce5144d1aed8))
-   支持 gemini 的可选字段结构化输出 ([#468](https://github.com/AIGNE-io/aigne-framework/issues/468)) ([70c6279](https://github.com/AIGNE-io/aigne-framework/commit/70c62795039a2862e3333f26707329489bf938de))

## [1.58.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.58.1...core-v1.58.2) (2025-09-05)

### 错误修复

-   **model:** 在请求 llm 前将本地文件转换为 base64 ([#462](https://github.com/AIGNE-io/aigne-framework/issues/462)) ([58ef5d7](https://github.com/AIGNE-io/aigne-framework/commit/58ef5d77046c49f3c4eed15b7f0cc283cbbcd74a))

## [1.58.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.58.0...core-v1.58.1) (2025-09-05)

### 错误修复

-   不应从 aigne hub 服务返回本地路径 ([#460](https://github.com/AIGNE-io/aigne-framework/issues/460)) ([c959717](https://github.com/AIGNE-io/aigne-framework/commit/c95971774f7e84dbeb3313f60b3e6464e2bb22e4))

## [1.58.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.5...core-v1.58.0) (2025-09-05)

### 功能

-   为聊天模型添加多模态支持 ([#454](https://github.com/AIGNE-io/aigne-framework/issues/454)) ([70d1bf6](https://github.com/AIGNE-io/aigne-framework/commit/70d1bf631f4e711235d89c6df8ee210a19179b30))

### 错误修复

-   添加禁用的可观察性环境变量 ([#453](https://github.com/AIGNE-io/aigne-framework/issues/453)) ([3e01107](https://github.com/AIGNE-io/aigne-framework/commit/3e01107deb07d3e4eb6fbe49a7b39919fa412df1))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.10.2

## [1.57.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.4...core-v1.57.5) (2025-09-01)

### 错误修复

-   **core:** 使用动态导入替换静态导入以兼容 CommonJS ([#448](https://github.com/AIGNE-io/aigne-framework/issues/448)) ([6db1e57](https://github.com/AIGNE-io/aigne-framework/commit/6db1e570858fff32f7352143585b98e900f1f71d))

## [1.57.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.3...core-v1.57.4) (2025-08-30)

### 错误修复

-   **core:** 正确处理相对路径 ([#440](https://github.com/AIGNE-io/aigne-framework/issues/440)) ([45a65fe](https://github.com/AIGNE-io/aigne-framework/commit/45a65fea432da44218007e566fe952fa973d8ae2))

## [1.57.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.2...core-v1.57.3) (2025-08-30)

### 错误修复

-   **core:** 改进嵌套提示文件解析 ([#437](https://github.com/AIGNE-io/aigne-framework/issues/437)) ([38b5b13](https://github.com/AIGNE-io/aigne-framework/commit/38b5b1397b7897cddef39d60c8cae2152e37dc5b))

## [1.57.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.1...core-v1.57.2) (2025-08-29)

### 错误修复

-   **core:** 正确解析嵌套提示文件 ([#434](https://github.com/AIGNE-io/aigne-framework/issues/434)) ([b334092](https://github.com/AIGNE-io/aigne-framework/commit/b334092900c003ca3c22d320e12712fd55c2500c))

## [1.57.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.57.0...core-v1.57.1) (2025-08-29)

### 错误修复

-   **core:** 正确加载带相对路径的嵌套提示文件 ([#432](https://github.com/AIGNE-io/aigne-framework/issues/432)) ([036ffa7](https://github.com/AIGNE-io/aigne-framework/commit/036ffa72391d3f27870a5022b7964739805a6161))

## [1.57.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.56.0...core-v1.57.0) (2025-08-28)

### 功能

-   **cli:** 添加具有动态过滤功能的可搜索复选框组件 ([#426](https://github.com/AIGNE-io/aigne-framework/issues/426)) ([1a76fe7](https://github.com/AIGNE-io/aigne-framework/commit/1a76fe7c2f7d91bc4041dfcd73850b39a18a036b))

## [1.56.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.55.1...core-v1.56.0) (2025-08-27)

### 功能

-   **models:** 为网络错误和结构化输出验证错误添加重试机制 ([#418](https://github.com/AIGNE-io/aigne-framework/issues/418)) ([52bc9ee](https://github.com/AIGNE-io/aigne-framework/commit/52bc9eec5f4f4fa3c3f26881c405f4f89dad01c9))

## [1.55.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.55.0...core-v1.55.1) (2025-08-26)

### 错误修复

-   **cli:** 减少 AIGNE CLI 的内存使用 ([#411](https://github.com/AIGNE-io/aigne-framework/issues/411)) ([9c36969](https://github.com/AIGNE-io/aigne-framework/commit/9c369699d966d37abf2d6a1624eac3d2fda4123b))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.10.1

## [1.55.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.54.0...core-v1.55.0) (2025-08-21)

### 功能

-   **blocklet:** 支持 Agent 运行时 blocklet ([#396](https://github.com/AIGNE-io/aigne-framework/issues/396)) ([baaae69](https://github.com/AIGNE-io/aigne-framework/commit/baaae691d552b7c7d313c4964a135a1b245943f9))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.10.0

## [1.54.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.53.0...core-v1.54.0) (2025-08-21)

### 功能

-   **cli:** 为 CLI 添加聊天模式支持 ([#389](https://github.com/AIGNE-io/aigne-framework/issues/389)) ([d7dc138](https://github.com/AIGNE-io/aigne-framework/commit/d7dc138719dd638ddb12c4625abdf42746baf35d))

### 错误修复

-   **cli:** 使用缓存清除强制重新导入 Agent 模块 ([#392](https://github.com/AIGNE-io/aigne-framework/issues/392)) ([c372cb9](https://github.com/AIGNE-io/aigne-framework/commit/c372cb9600a9d78ad1808a045bcddfc285e9c6f0))

## [1.53.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.52.0...core-v1.53.0) (2025-08-20)

### 功能

-   添加 ImageModel/ImageAgent 支持 ([#383](https://github.com/AIGNE-io/aigne-framework/issues/383)) ([96a2093](https://github.com/AIGNE-io/aigne-framework/commit/96a209368d91d98f47db6de1e404640368a86fa8))

## [1.52.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.51.0...core-v1.52.0) (2025-08-20)

### 功能

-   **agents:** 添加异步内存记录选项 ([#385](https://github.com/AIGNE-io/aigne-framework/issues/385)) ([573acdb](https://github.com/AIGNE-io/aigne-framework/commit/573acdb617434e6699b2e07db942e6336706d27f))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.9.1

## [1.51.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.50.1...core-v1.51.0) (2025-08-18)

### 功能

-   **cli:** 支持在 CLI 中隐藏或折叠 Agent 的任务 ([#381](https://github.com/AIGNE-io/aigne-framework/issues/381)) ([05b372d](https://github.com/AIGNE-io/aigne-framework/commit/05b372d431a862f7cdfa2a90bb4b7b2379bf97ab))

## [1.50.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.50.0...core-v1.50.1) (2025-08-16)

### 错误修复

-   **core:** 将 getCredential 设为异步以检索 aigne-hub 挂载点 ([#372](https://github.com/AIGNE-io/aigne-framework/issues/372)) ([34ce7a6](https://github.com/AIGNE-io/aigne-framework/commit/34ce7a645fa83994d3dfe0f29ca70098cfecac9c))

## [1.50.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.49.1...core-v1.50.0) (2025-08-14)

### 功能

-   **core:** 为 Agent 钩子添加优先级支持 ([#358](https://github.com/AIGNE-io/aigne-framework/issues/358)) ([9196141](https://github.com/AIGNE-io/aigne-framework/commit/91961413aea171048a6afae87ffc8dc53e20fca8))

### 错误修复

-   **cli:** 在 loadAIGNE 中只记录一次日志 ([#357](https://github.com/AIGNE-io/aigne-framework/issues/357)) ([6e6d968](https://github.com/AIGNE-io/aigne-framework/commit/6e6d96814fbc87f210522ae16daf94c1f84f311a))
-   **cli:** 防止同时出现多个购买积分的提示 ([#363](https://github.com/AIGNE-io/aigne-framework/issues/363)) ([b8fb459](https://github.com/AIGNE-io/aigne-framework/commit/b8fb459261fe327bcc9bfb4d163e66863cb797ec))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/platform-helpers 已更新至 0.6.2

## [1.49.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.49.0...core-v1.49.1) (2025-08-12)

### 错误修复

-   **core:** 为 AI Agent 添加可选的内存上下文切换 ([#350](https://github.com/AIGNE-io/aigne-framework/issues/350)) ([92322cc](https://github.com/AIGNE-io/aigne-framework/commit/92322ccaf6f2b6e4440d47a7631589061c351d64))

## [1.49.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.48.0...core-v1.49.0) (2025-08-12)

### 功能

-   **cli:** 为 AIGNE Hub 添加重试功能并改进错误处理 ([#348](https://github.com/AIGNE-io/aigne-framework/issues/348)) ([672c93a](https://github.com/AIGNE-io/aigne-framework/commit/672c93abbba8b4b234f6d810536ff4b603a97e1e))

### 错误修复

-   **core:** 使用 aigne-hub 时失败的示例案例 ([#337](https://github.com/AIGNE-io/aigne-framework/issues/337)) ([0d4a31c](https://github.com/AIGNE-io/aigne-framework/commit/0d4a31c24d9e7d26f00d1accb80719d9ad79a4c6))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/platform-helpers 已更新至 0.6.1

## [1.48.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.47.0...core-v1.48.0) (2025-08-12)

### 功能

-   增强任务标题功能以支持动态生成 ([#346](https://github.com/AIGNE-io/aigne-framework/issues/346)) ([fff098c](https://github.com/AIGNE-io/aigne-framework/commit/fff098c9828beca9d99e4b2ebaebdf6b92efb84e))

## [1.47.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.46.1...core-v1.47.0) (2025-08-11)

### 功能

-   通过支持思考模式增强 AI Agent 流式处理 ([#343](https://github.com/AIGNE-io/aigne-framework/issues/343)) ([bea2a39](https://github.com/AIGNE-io/aigne-framework/commit/bea2a39a2610c2fe58e46ad612b5103726159ab9))

## [1.46.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.46.0...core-v1.46.1) (2025-08-08)

### 错误修复

-   **core:** 为启用了 structuredStreamMode 的 AIAgent 自动修剪尾随空格 ([#334](https://github.com/AIGNE-io/aigne-framework/issues/334)) ([342eb49](https://github.com/AIGNE-io/aigne-framework/commit/342eb493995809f01da02fca6975ea6e52ecbd3a))
-   **core:** 从跟踪日志中隐藏内部属性 toolsMap ([#335](https://github.com/AIGNE-io/aigne-framework/issues/335)) ([bcec317](https://github.com/AIGNE-io/aigne-framework/commit/bcec317bf436988e5f43af05f649196bdbd6ac55))

## [1.46.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.45.0...core-v1.46.0) (2025-08-06)

### 功能

-   **cli:** 支持在 CLI 中自定义 Agent 的任务标题 ([#328](https://github.com/AIGNE-io/aigne-framework/issues/328)) ([128d75f](https://github.com/AIGNE-io/aigne-framework/commit/128d75fb42ca470b47a2793d79c92d7bb64cfedb))

### 错误修复

-   **core:** 改进 Agent 和上下文中的钩子处理 ([#325](https://github.com/AIGNE-io/aigne-framework/issues/325)) ([c858fec](https://github.com/AIGNE-io/aigne-framework/commit/c858fecb08453c2daca9708f4b8a9c135fac40b0))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/platform-helpers 已更新至 0.6.0

## [1.45.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.44.0...core-v1.45.0) (2025-08-06)

### 功能

-   **core:** 为团队 Agent 添加并发支持 ([#323](https://github.com/AIGNE-io/aigne-framework/issues/323)) ([5743260](https://github.com/AIGNE-io/aigne-framework/commit/57432603a45208ad3503b9fc4c64f07c8151f9ee))

### 错误修复

-   **core:** 移除 lodash 依赖，确保核心同时支持 esm 和 cjs ([#324](https://github.com/AIGNE-io/aigne-framework/issues/324)) ([d6c2452](https://github.com/AIGNE-io/aigne-framework/commit/d6c2452b660a163c73f2c628ffdc2a12949360b0))
-   **models:** aigne-hub 适配器在 node.js v21 中无法工作 ([#320](https://github.com/AIGNE-io/aigne-framework/issues/320)) ([2884d00](https://github.com/AIGNE-io/aigne-framework/commit/2884d00b83e153ae7465ef1369fcd22d7c6d43e0))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/platform-helpers 已更新至 0.5.1

## [1.44.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.43.1...core-v1.44.0) (2025-08-05)

### 功能

-   允许手动插入 agent-hub 积分 ([#315](https://github.com/AIGNE-io/aigne-framework/issues/315)) ([e3e4d1f](https://github.com/AIGNE-io/aigne-framework/commit/e3e4d1ff0d9d3fef33bb41d85e99735d4dd76cb7))

### 错误修复

-   **cli:** 改进 CLI 提示和输出处理 ([#318](https://github.com/AIGNE-io/aigne-framework/issues/318)) ([681ee79](https://github.com/AIGNE-io/aigne-framework/commit/681ee79e9b18aed5a977a0a418c2d9df20a7297c))

## [1.43.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.43.0...core-v1.43.1) (2025-08-05)

### 错误修复

-   **core:** 过滤空的内存内容 ([#312](https://github.com/AIGNE-io/aigne-framework/issues/312)) ([39dd77a](https://github.com/AIGNE-io/aigne-framework/commit/39dd77a68154d51c7a132adccd9f21b8bc461be0))

## [1.43.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.42.0...core-v1.43.0) (2025-08-04)

### 功能

-   添加 includeAllStepsOutput 选项以控制 TeamAgent 顺序流式处理行为 ([#305](https://github.com/AIGNE-io/aigne-framework/issues/305)) ([0817475](https://github.com/AIGNE-io/aigne-framework/commit/08174751316b940a70463e71971a19a18b92667b))

### 错误修复

-   **core:** 从上下文中共享技能/Agent ([#309](https://github.com/AIGNE-io/aigne-framework/issues/309)) ([88dd849](https://github.com/AIGNE-io/aigne-framework/commit/88dd849954c6f3fb68df238be22be3371c734e6e))

## [1.42.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.41.0...core-v1.42.0) (2025-08-01)

### 功能

-   **cli:** 为 aigne 应用程序添加 `--model` 选项 ([#302](https://github.com/AIGNE-io/aigne-framework/issues/302)) ([5d63743](https://github.com/AIGNE-io/aigne-framework/commit/5d63743b8a47be64fd49245983f4f2f9da3197a0))
-   支持谷歌模型并在连接到 Hub 时跳过检查模式 ([#300](https://github.com/AIGNE-io/aigne-framework/issues/300)) ([e992c0f](https://github.com/AIGNE-io/aigne-framework/commit/e992c0f3335a7c512fa807d5b8ad10c9c3bf2351))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.9.0
        -   @aigne/platform-helpers 已更新至 0.5.0

## [1.41.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.40.0...core-v1.41.0) (2025-07-31)

### 功能

-   **cli:** 为 Agent 添加别名支持 ([#297](https://github.com/AIGNE-io/aigne-framework/issues/297)) ([fa166ab](https://github.com/AIGNE-io/aigne-framework/commit/fa166ab66d19e89ddd32c34e1470450eb4fbdbbd))

## [1.40.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.39.0...core-v1.40.0) (2025-07-31)

### 功能

-   **cli:** 支持动态下载和执行 doc-smith 应用 ([#293](https://github.com/AIGNE-io/aigne-framework/issues/293)) ([4c40077](https://github.com/AIGNE-io/aigne-framework/commit/4c40077bacef076bc4b098879e948ef866218e39))

## [1.39.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.38.1...core-v1.39.0) (2025-07-28)

### 功能

-   **cli:** 为 CLI 添加 inquirer/prompts 集成 ([#286](https://github.com/AIGNE-io/aigne-framework/issues/286)) ([33af756](https://github.com/AIGNE-io/aigne-framework/commit/33af7567fe2e7f9fb4b1633127e1d54fd65cb2a8))

### 错误修复

-   **observability:** 插入时使用唯一索引并优化跟踪查询性能 ([#268](https://github.com/AIGNE-io/aigne-framework/issues/268)) ([bd02d2e](https://github.com/AIGNE-io/aigne-framework/commit/bd02d2ef4dadc3df7e4806746fede2faa5cc50bb))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.8.2

## [1.38.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.38.0...core-v1.38.1) (2025-07-24)

### 错误修复

-   添加缺失的依赖项 ([#280](https://github.com/AIGNE-io/aigne-framework/issues/280)) ([5da315e](https://github.com/AIGNE-io/aigne-framework/commit/5da315e29dc02818293e74ad159294f137e2c7f7))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.8.1

## [1.38.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.37.0...core-v1.38.0) (2025-07-24)

### 功能

-   **cli:** 支持 aigne hub 连接和模型使用 ([#267](https://github.com/AIGNE-io/aigne-framework/issues/267)) ([8e5a32a](https://github.com/AIGNE-io/aigne-framework/commit/8e5a32afc64593137153d7407bde13837312ac70))
-   **core:** 在 yaml 文件中支持 TeamAgent 的配置反射 ([#276](https://github.com/AIGNE-io/aigne-framework/issues/276)) ([e6296a8](https://github.com/AIGNE-io/aigne-framework/commit/e6296a8aff313e8209c4fbb2878e7869cc672576))

## [1.37.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.36.0...core-v1.37.0) (2025-07-22)

### 功能

-   **core:** 为 TeamAgent 添加反射模式支持 ([#273](https://github.com/AIGNE-io/aigne-framework/issues/273)) ([4e2dad6](https://github.com/AIGNE-io/aigne-framework/commit/4e2dad687c1caefa231c7a7620651d060f8c8b9d))

### 错误修复

-   **core:** 函数 Agent 应使用来自 yaml 定义的通用模式 ([#270](https://github.com/AIGNE-io/aigne-framework/issues/270)) ([076a489](https://github.com/AIGNE-io/aigne-framework/commit/076a4896948c397518e99df46c1a443ea43daa64))

## [1.36.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.35.0...core-v1.36.0) (2025-07-17)

### 功能

-   **core:** 支持在 yaml 中为 Agent 定义钩子 ([#260](https://github.com/AIGNE-io/aigne-framework/issues/260)) ([c388e82](https://github.com/AIGNE-io/aigne-framework/commit/c388e8216134271af4d9c7def70862ea3c354c7f))

## [1.35.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.34.0...core-v1.35.0) (2025-07-17)

### 功能

-   **core:** 支持为 Agent 自定义默认输入值 ([#258](https://github.com/AIGNE-io/aigne-framework/issues/258)) ([352ac70](https://github.com/AIGNE-io/aigne-framework/commit/352ac70400fb7e28cc36c4f6dc9c591b0d64e546))

## [1.34.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.33.2...core-v1.34.0) (2025-07-15)

### 功能

-   **memory:** 支持 did space 内存适配器 ([#229](https://github.com/AIGNE-io/aigne-framework/issues/229)) ([6f69b64](https://github.com/AIGNE-io/aigne-framework/commit/6f69b64e98b963db9d6ab5357306b445385eaa68))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.8.0
        -   @aigne/platform-helpers 已更新至 0.4.0

## [1.33.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.33.1...core-v1.33.2) (2025-07-14)

### 错误修复

-   **core:** 修复数组类型外部模式的错误 ([#251](https://github.com/AIGNE-io/aigne-framework/issues/251)) ([bd80921](https://github.com/AIGNE-io/aigne-framework/commit/bd80921bbbe8385645eb7c52fd719ce48d672da9))

## [1.33.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.33.0...core-v1.33.1) (2025-07-14)

### 错误修复

-   **cli:** 为 CLI 打印美观的错误消息 ([#249](https://github.com/AIGNE-io/aigne-framework/issues/249)) ([d68e0f7](https://github.com/AIGNE-io/aigne-framework/commit/d68e0f7151259a05696de77d9f00793b6f5b36b2))
-   **core:** 在 TeamAgent 处理前检查技能是否为空 ([#250](https://github.com/AIGNE-io/aigne-framework/issues/250)) ([f0fff7e](https://github.com/AIGNE-io/aigne-framework/commit/f0fff7e41512cf06f106a0d7fe03a7d98206f136))
-   **deps:** 将依赖项更新至最新版本 ([#247](https://github.com/AIGNE-io/aigne-framework/issues/247)) ([3972f88](https://github.com/AIGNE-io/aigne-framework/commit/3972f887a9abff20c26da6b51c1071cbd54c0bf1))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.7.2
        -   @aigne/platform-helpers 已更新至 0.3.1

## [1.33.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.32.2...core-v1.33.0) (2025-07-10)

### 功能

-   **core:** 支持外部文件作为 Agent 输入/输出模式 ([#242](https://github.com/AIGNE-io/aigne-framework/issues/242)) ([58f8de6](https://github.com/AIGNE-io/aigne-framework/commit/58f8de63008b78ea1b404ba7721c3a242c330113))

## [1.32.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.32.1...core-v1.32.2) (2025-07-09)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.7.1

## [1.32.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.32.0...core-v1.32.1) (2025-07-09)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.7.0

## [1.32.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.31.0...core-v1.32.0) (2025-07-08)

### 功能

-   **core:** 为提示构建器添加 jinja 语法支持 ([#230](https://github.com/AIGNE-io/aigne-framework/issues/230)) ([74436a7](https://github.com/AIGNE-io/aigne-framework/commit/74436a7faac0c59a32b0153481386162649f4357))
-   支持将组件 ID 设置为不同的组件数据 ([#226](https://github.com/AIGNE-io/aigne-framework/issues/226)) ([c7b3224](https://github.com/AIGNE-io/aigne-framework/commit/c7b32240e6660f34974615bcb9b91978a1191e3e))

### 错误修复

-   **core:** 确保输出为记录类型 ([#228](https://github.com/AIGNE-io/aigne-framework/issues/228)) ([dfd9104](https://github.com/AIGNE-io/aigne-framework/commit/dfd910451e5f1f9edd94a719857e36d34fadbe45))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.6.0

## [1.31.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.30.0...core-v1.31.0) (2025-07-04)

### 功能

-   **core:** 在 userContext 中添加标准的 userId/sessionId ([#219](https://github.com/AIGNE-io/aigne-framework/issues/219)) ([58e5804](https://github.com/AIGNE-io/aigne-framework/commit/58e5804cf08b1d2fa6e232646fadd70b5db2e007))
-   **core:** 为 AIAgent 添加 strucutredStreamMode 选项以支持一次性输出文本和 json ([#222](https://github.com/AIGNE-io/aigne-framework/issues/222)) ([c0af92b](https://github.com/AIGNE-io/aigne-framework/commit/c0af92b6a020453b047e5bb3782239795839baa8))
-   **memory:** 为 AgenticMemory 添加支持并对 DefaultMemory 进行了一些改进 ([#224](https://github.com/AIGNE-io/aigne-framework/issues/224)) ([f4a08af](https://github.com/AIGNE-io/aigne-framework/commit/f4a08aff935205c62615c060763c835a9579607d))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.5.0
        -   @aigne/platform-helpers 已更新至 0.3.0

## [1.30.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.29.1...core-v1.30.0) (2025-07-03)

### 功能

-   升级依赖项并使代码适应重大变更 ([#216](https://github.com/AIGNE-io/aigne-framework/issues/216)) ([f215ced](https://github.com/AIGNE-io/aigne-framework/commit/f215cedc1a57e321164064c33316e496eae8d25f))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.4.0
        -   @aigne/platform-helpers 已更新至 0.2.0

## [1.29.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.29.0...core-v1.29.1) (2025-07-02)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.3.3

## [1.29.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.28.2...core-v1.29.0) (2025-07-02)

### 功能

-   支持为 TeamAgent 迭代特殊输入调用技能 ([#188](https://github.com/AIGNE-io/aigne-framework/issues/188)) ([8cf06d3](https://github.com/AIGNE-io/aigne-framework/commit/8cf06d39172ed59ca93f34d893486f2bb7bd2e5a))

## [1.28.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.28.1...core-v1.28.2) (2025-07-01)

### 错误修复

-   修复：兼容 node 20.0 并完善示例定义 ([#209](https://github.com/AIGNE-io/aigne-framework/issues/209)) ([9752b96](https://github.com/AIGNE-io/aigne-framework/commit/9752b96dc54a44c6f710f056fe9205c0f2b0a73e))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.3.2

## [1.28.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.28.0...core-v1.28.1) (2025-07-01)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability-api 已更新至 0.3.1

## [1.28.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.27.0...core-v1.28.0) (2025-07-01)

### 功能

-   **example:** 使用 AIGNE cli 运行聊天机器人示例 ([#198](https://github.com/AIGNE-io/aigne-framework/issues/198)) ([7085541](https://github.com/AIGNE-io/aigne-framework/commit/708554100692f2a557f7329ea78e46c3c870ce10))

## [1.27.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.26.0...core-v1.27.0) (2025-07-01)

### 功能

-   **cli:** 支持 HTTPS_PROXY 和命名路径参数 ([#196](https://github.com/AIGNE-io/aigne-framework/issues/196)) ([04e684e](https://github.com/AIGNE-io/aigne-framework/commit/04e684ee26bc2d79924b0e3cb541cd07a7191804))

## [1.26.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.25.0...core-v1.26.0) (2025-06-30)

### 功能

-   **ux:** 完善跟踪用户体验并更新文档 ([#193](https://github.com/AIGNE-io/aigne-framework/issues/193)) ([f80b63e](https://github.com/AIGNE-io/aigne-framework/commit/f80b63ecb1cfb00daa9b68330026da839d33f8a2))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability 已更新至 0.3.0

## [1.25.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.24.1...core-v1.25.0) (2025-06-29)

### 功能

-   **observability:** 调整跟踪用户体验并支持增量导出 ([#184](https://github.com/AIGNE-io/aigne-framework/issues/184)) ([d174188](https://github.com/AIGNE-io/aigne-framework/commit/d174188459c77acb09b5ca040972f83abb067587))

### 错误修复

-   **core:** 为通过消息队列进行的 Agent 调用启用正确的跟踪 ([#191](https://github.com/AIGNE-io/aigne-framework/issues/191)) ([f8a4ce5](https://github.com/AIGNE-io/aigne-framework/commit/f8a4ce5fa54e0e01113b31fefcbd248b163980b2))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability 已更新至 0.2.0

## [1.24.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.24.0...core-v1.24.1) (2025-06-26)

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability 已更新至 0.1.3

## [1.24.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.23.1...core-v1.24.0) (2025-06-26)

### 功能

-   **transport:** 支持调用服务器端聊天模型 ([#182](https://github.com/AIGNE-io/aigne-framework/issues/182)) ([f81a1bf](https://github.com/AIGNE-io/aigne-framework/commit/f81a1bf883abda1845ccee09b270e5f583e287ab))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability 已更新至 0.1.2

## [1.23.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.23.0...core-v1.23.1) (2025-06-25)

### 错误修复

-   **core:** 将输入/输出直接传递给 MemoryAgent ([#178](https://github.com/AIGNE-io/aigne-framework/issues/178)) ([3b20e33](https://github.com/AIGNE-io/aigne-framework/commit/3b20e33f1eefc81ac1e009b1afff14fca46644b1))

## [1.23.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.22.0...core-v1.23.0) (2025-06-25)

### 功能

-   支持从消息中记住自定义字段 ([#174](https://github.com/AIGNE-io/aigne-framework/issues/174)) ([664069d](https://github.com/AIGNE-io/aigne-framework/commit/664069d343137f69d0c103b2b5eff545ab0051fb))

### 错误修复

-   **blocklet:** 确保只有管理员才能访问跟踪信息 ([#173](https://github.com/AIGNE-io/aigne-framework/issues/173)) ([9c5cc06](https://github.com/AIGNE-io/aigne-framework/commit/9c5cc06c5841b9684d16c5c60af764d8c98c9c3e))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability 已更新至 0.1.1

## [1.22.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.21.0...core-v1.22.0) (2025-06-24)

### 功能

-   支持 CLI 和 blocklet 的可观察性 ([#155](https://github.com/AIGNE-io/aigne-framework/issues/155)) ([5baa705](https://github.com/AIGNE-io/aigne-framework/commit/5baa705a33cfdba1efc5ccbe18674c27513ca97d))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/observability 已更新至 0.1.0

## [1.21.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.20.1...core-v1.21.0) (2025-06-20)

### 功能

-   **cli:** 支持通过 --input-xxx 将命名输入传递给 Agent ([#167](https://github.com/AIGNE-io/aigne-framework/issues/167)) ([cda5bb6](https://github.com/AIGNE-io/aigne-framework/commit/cda5bb6baab680787de1a042664fe34c17a84bb1))

## [1.20.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.20.0...core-v1.20.1) (2025-06-19)

### 错误修复

-   为 AIAgent 使用 `inputKey` 而不是隐式的 $message ([#165](https://github.com/AIGNE-io/aigne-framework/issues/165)) ([8b6e589](https://github.com/AIGNE-io/aigne-framework/commit/8b6e5896bba8209fd2eecb0f5b9263618bffdaf8))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/platform-helpers 已更新至 0.1.2

## [1.20.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.19.0...core-v1.20.0) (2025-06-17)

### 功能

-   通过启用 returnMetadata 选项支持返回 $meta 输出 ([#163](https://github.com/AIGNE-io/aigne-framework/issues/163)) ([ac73759](https://github.com/AIGNE-io/aigne-framework/commit/ac73759615d44a09fa71b3bfbd3e9356ffe1d2ed))

## [1.19.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.6...core-v1.19.0) (2025-06-16)

### 功能

-   通过为 aigne.invoke 启用 `returnProgressChunks` 选项来支持响应进行中的数据块 ([cf4c313](https://github.com/AIGNE-io/aigne-framework/commit/cf4c313ee69f255be799ac196da675b79f69bf76))

## [1.18.6](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.5...core-v1.18.6) (2025-06-11)

### 错误修复

-   **core:** 为 Safari 上的 ReadableStream 添加异步生成器 polyfill ([#158](https://github.com/AIGNE-io/aigne-framework/issues/158)) ([70ef026](https://github.com/AIGNE-io/aigne-framework/commit/70ef026f413726c369f6a0781efc7f0333735406))
-   **core:** 从可调用技能的最终工具列表中排除嵌套技能 ([#156](https://github.com/AIGNE-io/aigne-framework/issues/156)) ([91645f1](https://github.com/AIGNE-io/aigne-framework/commit/91645f12e79110a00f8f2db8ebc19401ddbd5a80))

## [1.18.5](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.4...core-v1.18.5) (2025-06-06)

### 错误修复

-   **core:** 应将调用选项中的内存传递给嵌套 Agent ([#153](https://github.com/AIGNE-io/aigne-framework/issues/153)) ([57629a5](https://github.com/AIGNE-io/aigne-framework/commit/57629a5da6cf2a295356dfe32ecbb15154e098fe))

## [1.18.4](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.3...core-v1.18.4) (2025-06-05)

### 错误修复

-   **core:** 优先返回 json 块 ([#151](https://github.com/AIGNE-io/aigne-framework/issues/151)) ([8bf49a1](https://github.com/AIGNE-io/aigne-framework/commit/8bf49a18c083b33d2e0b35e8d0f22f68d9d6effa))

## [1.18.3](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.2...core-v1.18.3) (2025-06-05)

### 错误修复

-   兼容 nodejs 版本 >=20 ([#149](https://github.com/AIGNE-io/aigne-framework/issues/149)) ([d5ae9f2](https://github.com/AIGNE-io/aigne-framework/commit/d5ae9f245972e87e70fd87cdd960ade9940f288c))

## [1.18.2](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.1...core-v1.18.2) (2025-05-30)

### 错误修复

-   为 AIGNE 提供可用内存 ([#145](https://github.com/AIGNE-io/aigne-framework/issues/145)) ([c5dc960](https://github.com/AIGNE-io/aigne-framework/commit/c5dc9605e0fb7ca60e1f5fa2f0da67ffec00c601))

## [1.18.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.18.0...core-v1.18.1) (2025-05-30)

### 错误修复

-   尊重 logger 的 DEBUG 环境变量 ([#142](https://github.com/AIGNE-io/aigne-framework/issues/142)) ([f84738a](https://github.com/AIGNE-io/aigne-framework/commit/f84738acb382d9fb4f47253fcf91c92c02200053))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/platform-helpers 已更新至 0.1.1

## [1.18.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.17.0...core-v1.18.0) (2025-05-29)

### 功能

-   为客户端 Agent 添加内存 Agent 支持 ([#139](https://github.com/AIGNE-io/aigne-framework/issues/139)) ([57044fa](https://github.com/AIGNE-io/aigne-framework/commit/57044fa87b8abcba395cd05f941d6d312ab65764))

### 依赖项

-   更新了以下工作区依赖项
    -   依赖项
        -   @aigne/platform-helpers 已更新至 0.1.0

## [1.17.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.16.0...core-v1.17.0) (2025-05-25)

### 功能

-   添加用户上下文支持 ([#131](https://github.com/AIGNE-io/aigne-framework/issues/131)) ([4dd9d20](https://github.com/AIGNE-io/aigne-framework/commit/4dd9d20953f6ac33933723db56efd9b44bafeb02))

## [1.16.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.15.0...core-v1.16.0) (2025-05-23)

### 功能

-   为 `run` 命令添加 `--chat` 选项 ([#120](https://github.com/AIGNE-io/aigne-framework/issues/120)) ([7699550](https://github.com/AIGNE-io/aigne-framework/commit/76995507001ca33b09b29f72ff588dae513cb340))
-   **core:** 支持使用导轨 Agent 检查输出 ([#117](https://github.com/AIGNE-io/aigne-framework/issues/117)) ([bdf7ab3](https://github.com/AIGNE-io/aigne-framework/commit/bdf7ab31789379ba5b0fd920541a469cb86150ff))
-   **core:** 支持 Agent 的生命周期钩子 ([#124](https://github.com/AIGNE-io/aigne-framework/issues/124)) ([0af6afa](https://github.com/AIGNE-io/aigne-framework/commit/0af6afa923dcb917d545fd4535cabe7804fa84c9))
-   **models:** 将模型适配器作为独立包发布 ([#126](https://github.com/AIGNE-io/aigne-framework/issues/126)) ([588b8ae](https://github.com/AIGNE-io/aigne-framework/commit/588b8aea6abcee5fa87def1358bf51f84021c6ef))

### 错误修复

-   自动将工具名称转换为有效格式 ([#128](https://github.com/AIGNE-io/aigne-framework/issues/128)) ([e9ee91d](https://github.com/AIGNE-io/aigne-framework/commit/e9ee91d9d782fa19000adb4cf95b9d65196ab651))

## [1.15.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.14.0...core-v1.15.0) (2025-05-15)

### 功能

-   优化模型和 CI 的稳定性 ([#119](https://github.com/AIGNE-io/aigne-framework/issues/119)) ([de93887](https://github.com/AIGNE-io/aigne-framework/commit/de938879452a8be82a198dda0eda1eb9fcbb0474))

### 错误修复

-   **core:** response.headers.toJSON 不是一个函数 ([#121](https://github.com/AIGNE-io/aigne-framework/issues/121)) ([4609ba6](https://github.com/AIGNE-io/aigne-framework/commit/4609ba645e6b8fe8d76ecd475cd2d7817483a4bd))

## [1.14.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.13.0...core-v1.14.0) (2025-05-12)

### 功能

-   **docs:** 使用 typedoc 构建并将文档发布到 gh-pages ([#100](https://github.com/AIGNE-io/aigne-framework/issues/100)) ([b9074c0](https://github.com/AIGNE-io/aigne-framework/commit/b9074c0148ea343ada92b5919a52b47537a1ad48))
-   **memory:** 允许 Agent 在内存中充当检索器和记录器 ([#65](https://github.com/AIGNE-io/aigne-framework/issues/65)) ([2bafcbb](https://github.com/AIGNE-io/aigne-framework/commit/2bafcbb66a94fcf55dad8c21ede483eaf075c11d))
-   优化 CI 和示例的稳定性 ([#113](https://github.com/AIGNE-io/aigne-framework/issues/113)) ([d16ed6c](https://github.com/AIGNE-io/aigne-framework/commit/d16ed6cb60faea19fb4f1c12e1f83d69563b153f))

### 错误修复

-   **core:** 默认捕获工具错误并继续处理 ([#115](https://github.com/AIGNE-io/aigne-framework/issues/115)) ([983b0de](https://github.com/AIGNE-io/aigne-framework/commit/983b0de491afb3f0904e145cb491d432b62f9312))
-   **core:** 在发布/订阅模式下自动处理 UserAgent 的响应 ([#116](https://github.com/AIGNE-io/aigne-framework/issues/116)) ([b659714](https://github.com/AIGNE-io/aigne-framework/commit/b659714f2398ea042f21cb22eccc1014f181cd46))

## [1.13.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.12.0...core-v1.13.0) (2025-04-30)

### 功能

-   **core:** 添加 BedrockChatModel 支持 ([#101](https://github.com/AIGNE-io/aigne-framework/issues/101)) ([a0b98f0](https://github.com/AIGNE-io/aigne-framework/commit/a0b98f01bd78a135232226548848fa35a64982d1))

### 错误修复

-   **core:** 为聊天模型去重工具 ([#103](https://github.com/AIGNE-io/aigne-framework/issues/103)) ([570be6d](https://github.com/AIGNE-io/aigne-framework/commit/570be6d8620ab5b9a0149f835ecd4641009a8654))
-   导出服务器/客户端 API 类型 ([93e5341](https://github.com/AIGNE-io/aigne-framework/commit/93e5341dde7a6851f08a3d4e2f6c1a1db91765e9))

## [1.12.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.11.0...core-v1.12.0) (2025-04-27)

### 功能

-   添加 AIGNEServer/AIGNEClient API 以通过网络服务 Agent ([#96](https://github.com/AIGNE-io/aigne-framework/issues/96)) ([1f2dfa3](https://github.com/AIGNE-io/aigne-framework/commit/1f2dfa3a6a2568373063cea3c874b573d0a248d3))
-   **core:** 支持 mcp Agent 的流式 http 传输 ([#92](https://github.com/AIGNE-io/aigne-framework/issues/92)) ([37da490](https://github.com/AIGNE-io/aigne-framework/commit/37da490538298d882ec328e4b3304395a6cd8cf7))
-   支持 TeamAgent 并最终确定 API 命名 ([#91](https://github.com/AIGNE-io/aigne-framework/issues/91)) ([033d1b6](https://github.com/AIGNE-io/aigne-framework/commit/033d1b6a7dc5460807476abb35a413ba89a2a664))

### 错误修复

-   **core:** 优先使用自身模型，然后再回退到上下文 ([#97](https://github.com/AIGNE-io/aigne-framework/issues/97)) ([2a3d067](https://github.com/AIGNE-io/aigne-framework/commit/2a3d067442200657d8ef3b5314930cc14302f6bf))
-   为 serve mcp 命令升级到流式 API ([#98](https://github.com/AIGNE-io/aigne-framework/issues/98)) ([ae32bda](https://github.com/AIGNE-io/aigne-framework/commit/ae32bda20e57c2a2eb8b49fad034b0b2a5ebb15e))

## [1.11.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.10.0...core-v1.11.0) (2025-04-23)

### 功能

-   **core:** 增强 ClaudeChatModel 以支持流式响应 ([#85](https://github.com/AIGNE-io/aigne-framework/issues/85)) ([5433240](https://github.com/AIGNE-io/aigne-framework/commit/5433240e7b663ec9e9f4a79dffa05038088d54fc))
-   支持在 Agent yaml 中设置内存 ([#90](https://github.com/AIGNE-io/aigne-framework/issues/90)) ([215118f](https://github.com/AIGNE-io/aigne-framework/commit/215118f1dc55f02322d59a3f18395a459198e031))

### 错误修复

-   **core:** 路由器模型应支持流式响应 ([#88](https://github.com/AIGNE-io/aigne-framework/issues/88)) ([4fb4d92](https://github.com/AIGNE-io/aigne-framework/commit/4fb4d92f8b36011437efba3265591b2477f2d680))

## [1.10.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.9.0...core-v1.10.0) (2025-04-22)

### 功能

-   **stream:** 为 Agent 添加流式输出支持 ([#73](https://github.com/AIGNE-io/aigne-framework/issues/73)) ([5f3ea4b](https://github.com/AIGNE-io/aigne-framework/commit/5f3ea4bccda7c8c457d6e9518b3d6a8b254ec041))

### 错误修复

-   **core:** 支持动态模型能力检测 ([#72](https://github.com/AIGNE-io/aigne-framework/issues/72)) ([9d56d98](https://github.com/AIGNE-io/aigne-framework/commit/9d56d9885778962e5bef806445ad8c4d199f2c65))

## [1.9.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.8.0...core-v1.9.0) (2025-04-20)

### 功能

-   **core:** 为 DeepSeek、Gemini、OpenRouter 和 Ollama 添加模型适配器 ([#53](https://github.com/AIGNE-io/aigne-framework/issues/53)) ([5d40546](https://github.com/AIGNE-io/aigne-framework/commit/5d40546bd5ddb70233d27ea3b20e5711b2af320a))

### 错误修复

-   **dx:** 为 Agent 输入/输出验证提供自定义错误消息 ([#71](https://github.com/AIGNE-io/aigne-framework/issues/71)) ([5145673](https://github.com/AIGNE-io/aigne-framework/commit/5145673aaae2cd6665912e80b1c644e974c42b2f))

## [1.8.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.7.0...core-v1.8.0) (2025-04-17)

### 功能

-   **ci:** 支持使用模型矩阵覆盖示例 ([#59](https://github.com/AIGNE-io/aigne-framework/issues/59)) ([1edd704](https://github.com/AIGNE-io/aigne-framework/commit/1edd70426b80a69e3751b2d5fe818297711d0777))
-   **cli:** 支持为 aigne run 自定义模型和下载 ([#61](https://github.com/AIGNE-io/aigne-framework/issues/61)) ([51f6619](https://github.com/AIGNE-io/aigne-framework/commit/51f6619e6c591a84f1f2339b26ef66d89fa9486e))

### 错误修复

-   **mcp:** 将默认超时设置为 60 秒 ([#67](https://github.com/AIGNE-io/aigne-framework/issues/67)) ([40dc029](https://github.com/AIGNE-io/aigne-framework/commit/40dc029b7795650283a505fd71b9566e5f0a4471))

## [1.7.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.6.0...core-v1.7.0) (2025-04-15)

### 功能

-   添加 TerminalTracer 以改善终端用户体验 ([#56](https://github.com/AIGNE-io/aigne-framework/issues/56)) ([9875a5d](https://github.com/AIGNE-io/aigne-framework/commit/9875a5d46abb55073340ffae841fed6bd6b83ff4))
-   **cli:** 支持从远程 URL 运行 Agent ([#60](https://github.com/AIGNE-io/aigne-framework/issues/60)) ([5f49920](https://github.com/AIGNE-io/aigne-framework/commit/5f4992089d36f9e780ba55a912a1d35508cad28e))
-   **core:** 支持 McpAgent 的 oauth 并提供示例 ([#55](https://github.com/AIGNE-io/aigne-framework/issues/55)) ([9420f3a](https://github.com/AIGNE-io/aigne-framework/commit/9420f3a56cf18986cd45f173044e660be76daab4))

### 错误修复

-   为兼容性移除新的 Node.js exists API 的使用 ([#57](https://github.com/AIGNE-io/aigne-framework/issues/57)) ([c10cc08](https://github.com/AIGNE-io/aigne-framework/commit/c10cc086d8ecd0744f38cdb1367d4c8816b723b3))

## [1.6.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.5.0...core-v1.6.0) (2025-04-08)

### 功能

-   为 @aigne/cli 添加 `serve` 命令 ([#54](https://github.com/AIGNE-io/aigne-framework/issues/54)) ([1cca843](https://github.com/AIGNE-io/aigne-framework/commit/1cca843f1760abe832b6651108fa858130f47355))
-   添加 Agent 库支持 ([#51](https://github.com/AIGNE-io/aigne-framework/issues/51)) ([1f0d34d](https://github.com/AIGNE-io/aigne-framework/commit/1f0d34ddda3154283a4bc958ddb9b68b4ac106b0))
-   支持 ExecutionEngine 的 token/调用/时间限制 ([#44](https://github.com/AIGNE-io/aigne-framework/issues/44)) ([5a2ca0a](https://github.com/AIGNE-io/aigne-framework/commit/5a2ca0a033267dd4765f574b53dca71e932e53d4))

### 错误修复

-   支持自动重新连接到 MCP 服务器 ([#50](https://github.com/AIGNE-io/aigne-framework/issues/50)) ([898d83f](https://github.com/AIGNE-io/aigne-framework/commit/898d83f75fc655142b93c70a1afeda376a2e92b4))

## [1.5.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.4.0...core-v1.5.0) (2025-03-27)

### 功能

-   **dx:** 连接时显示 mcp 服务器 url ([#39](https://github.com/AIGNE-io/aigne-framework/issues/39)) ([5819a76](https://github.com/AIGNE-io/aigne-framework/commit/5819a76435fae7333720f9e0c58a25aebc1089e3))

### 错误修复

-   **dx:** 在子模块中导出模型/工具 ([#43](https://github.com/AIGNE-io/aigne-framework/issues/43)) ([bd561b3](https://github.com/AIGNE-io/aigne-framework/commit/bd561b397de816f04c2d63d58538e81fba82fc7f))

## [1.4.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.3.1...core-v1.4.0) (2025-03-26)

### 功能

-   **core:** 添加 xAI 聊天模型适配器 ([#34](https://github.com/AIGNE-io/aigne-framework/issues/34)) ([b228d22](https://github.com/AIGNE-io/aigne-framework/commit/b228d22b550535ab8e511f13de9e4a65dd73e3c0))

### 错误修复

-   **orchestrator:** 通过步骤合成重构并增强编排器 ([#31](https://github.com/AIGNE-io/aigne-framework/issues/31)) ([ba9fca0](https://github.com/AIGNE-io/aigne-framework/commit/ba9fca04fad71d49c8f4f52172b56668a94ea714))

## [1.3.1](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.3.0...core-v1.3.1) (2025-03-25)

### 错误修复

-   **core:** 如果需要，将系统消息用作 claude 模型的用户消息 ([#32](https://github.com/AIGNE-io/aigne-framework/issues/32)) ([316a6d5](https://github.com/AIGNE-io/aigne-framework/commit/316a6d51f885cceee4020c24695f6588f6b7425f))

## [1.3.0](https://github.com/AIGNE-io/aigne-framework/compare/core-v1.2.0...core-v1.3.0) (2025-03-24)

### 功能

-   添加 Agent、FunctionAgent、AIAgent、MCPAgent 和 ExecutionEngine ([4d2a5a1](https://github.com/AIGNE-io/aigne-framework/commit/4d2a5a1b3366b8f935f50a0937c2da6e49073348))
-   在 Agent 库中添加 OrchestratorAgent ([25a5e9e](https://github.com/AIGNE-io/aigne-framework/commit/25a5e9e6c60d747c8bf484ac884b31dc02c14757))
-   添加顺序和并行辅助函数 ([a295697](https://github.com/AIGNE-io/aigne-framework/commit/a295697b5694754e02954fc5c7f382a3b219a3ab))
-   添加对 MCP 资源的支持 ([1ded2fb](https://github.com/AIGNE-io/aigne-framework/commit/1ded2fbf222fa8984e75df0852ff384524f73b04))
-   **core:** 添加 ChatModelClaude 以使用 anthropic 的模型 ([#30](https://github.com/AIGNE-io/aigne-framework/issues/30)) ([0a62a64](https://github.com/AIGNE-io/aigne-framework/commit/0a62a6499e3da723a4646e67952051708ce7de6a))
-   **core:** 添加对订阅 Agent 内存主题的支持 ([#28](https://github.com/AIGNE-io/aigne-framework/issues/28)) ([eeecc67](https://github.com/AIGNE-io/aigne-framework/commit/eeecc67049a60ebcc4cdba0fbcd987b3d81f4af6))
-   **prompt-builder:** 在 PromptBuilder 中支持聊天历史记录 ([6ca05f2](https://github.com/AIGNE-io/aigne-framework/commit/6ca05f28eddb683a4f1e228865f8bbf8a8e190f1))
-   支持在终端中运行 puppeteer 示例聊天循环 ([85ce7f8](https://github.com/AIGNE-io/aigne-framework/commit/85ce7f8de8b443c86e50815dd7bcab99f869c4ce))
-   使用 PromptBuilder 代替字符串指令 ([e4cb2cb](https://github.com/AIGNE-io/aigne-framework/commit/e4cb2cb6baf4f9bcef390567a4a174e9246c29a3))

### 错误修复

-   **AIAgent:** 应将参数（模型生成）和输入（用户输入）都传递给工具 ([c49d64e](https://github.com/AIGNE-io/aigne-framework/commit/c49d64ee35f7efd83b0f82f43205bb1c40f999e8))
-   **core:** 强制执行更严格的输入/输出类型检查 ([#26](https://github.com/AIGNE-io/aigne-framework/issues/26)) ([ef8cf53](https://github.com/AIGNE-io/aigne-framework/commit/ef8cf53586aff08a809909c56ab2a20f215fa129))
-   **MCP:** 捕获列出资源错误并视为空列表 ([1885fab](https://github.com/AIGNE-io/aigne-framework/commit/1885fab3585e0dd1467b127e5b47cd0b98282bab))
-   将 @aigne/core-next 重命名为 @aigne/core ([3a81009](https://github.com/AIGNE-io/aigne-framework/commit/3a8100962c81813217b687ae28e8de604419c622))
-   正确使用来自 MCP 的文本资源 ([8b9eba8](https://github.com/AIGNE-io/aigne-framework/commit/8b9eba83352ec096a2a5d4f410d4c4bde7420bce))