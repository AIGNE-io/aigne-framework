# AIGNE Framework 项目结构概览

> 分析日期: 2026-01-15

## 项目定位

AIGNE Framework 是一个**函数式 AI 应用框架**，支持多模型和可插拔工作流模式。

## 顶层目录结构

```
aigne-framework/
├── packages/          # 7个核心库包
├── models/            # 13个 LLM 提供商适配
├── afs/               # 7个 Agentic 文件系统模块
├── memory/            # 4个存储后端
├── examples/          # 25+ 参考示例
├── blocklets/         # ArcBlock 生态集成
├── observability/     # 可观测性平台
├── docs/              # 文档
├── tests/             # 跨环境测试
├── docs-examples/     # 文档示例
└── scripts/           # 工具脚本
```

**项目元数据**：
- 版本: 1.91.0-beta.30
- 许可证: Elastic-2.0
- 包管理: pnpm workspaces
- 运行时: bun (scripts/tests)
- 代码质量: Biome + TypeScript strict mode

---

## 核心包 (packages/)

| 包 | 版本 | 功能 |
|---|---|---|
| @aigne/core | 1.72.0-beta.23 | 中央编排器、代理基类、提示词管理 |
| @aigne/cli | 1.59.0-beta.29 | 命令行界面 |
| @aigne/agent-library | 1.24.0-beta.25 | 预构建代理 |
| @aigne/transport | 0.15.25-beta.25 | 通信协议 |
| @aigne/secrets | - | 密钥管理 |
| @aigne/sqlite | - | SQLite 驱动 |
| @aigne/test-utils | - | 测试工具 |

### packages/core/src 模块结构

```
src/
├── index.ts              # 主导出
├── aigne/                # AIGNE 核心编排器
│   └── aigne.ts          # 中央协调器
├── agents/               # 代理类型 (13个)
│   ├── agent.ts          # 基类
│   ├── ai-agent.ts       # LLM 驱动代理
│   ├── team-agent.ts     # 多代理编排
│   ├── mcp-agent.ts      # MCP 集成
│   ├── transform-agent.ts # 数据转换
│   ├── guide-rail-agent.ts # 输入/输出验证
│   ├── chat-model.ts     # 聊天模型
│   ├── image-model.ts    # 图像模型
│   ├── video-model.ts    # 视频模型
│   └── ...
├── prompt/               # 提示词管理 (10个模块)
├── memory/               # 内存相关 (6个模块)
├── loader/               # 加载器 (9个模块)
├── utils/                # 工具函数 (21个)
└── types/                # 类型定义
```

---

## 模型支持 (models/)

13 个 LLM 提供商：

| 提供商 | 包名 | 用途 |
|---|---|---|
| OpenAI | @aigne/openai | GPT-4, GPT-3.5 |
| Anthropic | @aigne/anthropic | Claude AI |
| Google | @aigne/gemini | Gemini |
| AWS | @aigne/bedrock | Foundation models |
| DeepSeek | @aigne/deepseek | DeepSeek |
| 字节跳动 | @aigne/doubao | Doubao |
| XAI | @aigne/xai | XAI |
| Open Router | @aigne/open-router | 多模型统一 API |
| Poe | @aigne/poe | Poe 平台 |
| LM Studio | @aigne/lmstudio | 本地 LM Studio |
| Ollama | @aigne/ollama | 本地 Ollama |
| Ideogram | @aigne/ideogram | 图像生成 |
| AIGNE Hub | @aigne/aigne-hub | 内部 Hub |

---

## AFS 虚拟文件系统 (afs/)

为 agents 提供统一的多后端存储访问：

| 模块 | 功能 |
|---|---|
| @aigne/afs | 核心虚拟文件系统 |
| @aigne/afs-core | 基础实现 |
| @aigne/afs-local-fs | 本地文件系统 |
| @aigne/afs-history | 对话历史存储 |
| @aigne/afs-sqlite | SQLite 后端 |
| @aigne/afs-json | JSON/YAML 挂载 |
| @aigne/afs-git | Git 仓库挂载 (最新) |

**使用模式**：
```typescript
const afs = new AFS();
afs.mount(new AFSHistory({ storage: { url: "file:./memory.sqlite3" } }));
afs.mount(new LocalFS({ localPath: "/docs" }));
afs.mount(new AFSGit({ gitPath: "/repo" }));
```

---

## 存储后端 (memory/)

| 模块 | 用途 |
|---|---|
| @aigne/default-memory | 默认内存实现 (SQLite, Drizzle ORM) |
| @aigne/agentic-memory | Agent 内存管理 |
| @aigne/did-space | DID Spaces 存储 |
| @aigne/fs | 文件系统存储 |

---

## 示例 (examples/)

25+ 个参考实现：

**AFS 示例 (6个)**：afs-local-fs, afs-sqlite, afs-json, afs-git, afs-memory, afs-mcp-server

**MCP 集成 (6个)**：mcp-server, mcp-sqlite, mcp-github, mcp-puppeteer, mcp-blocklet, mcp-did-spaces

**工作流模式 (8个)**：
- workflow-sequential (管道处理)
- workflow-concurrency (并发执行)
- workflow-handoff (代理切换)
- workflow-reflection (迭代优化)
- workflow-group-chat (群聊)
- workflow-router (路由分发)
- workflow-orchestrator (编排)
- workflow-code-execution (代码执行)

**其他**：agent-skill, chat-bot, memory-did-spaces, nano-banana, images

---

## 代理类型

| 类型 | 说明 |
|---|---|
| AIAgent | LLM 驱动 (指令 + 技能) |
| TeamAgent | 多代理编排 (sequential/parallel/reflection) |
| MCPAgent | Model Context Protocol 集成 |
| TransformAgent | 纯数据转换 (无 LLM 调用) |
| GuideRailAgent | 输入/输出验证 |

---

## 工作流模式

1. **Sequential** - 管道处理，输出流向下一个代理
2. **Parallel** - 并发执行，结果合并
3. **Reflection** - 迭代优化，带 reviewer 验证
4. **Handoff** - 代理切换控制权

---

## 模块依赖关系

```
用户 CLI
  ↓
@aigne/cli
  ├→ @aigne/core (核心编排)
  │   ├→ @aigne/afs (虚拟文件系统)
  │   ├→ @aigne/afs-history
  │   └→ 所有 LLM 模型包
  ├→ @aigne/agent-library (预构建代理)
  ├→ @aigne/transport (通信)
  └→ @aigne/default-memory (存储)

代理系统
  ├→ AIAgent (LLM 驱动)
  ├→ TeamAgent (多代理编排)
  ├→ MCPAgent (MCP 服务)
  ├→ TransformAgent (数据变换)
  └→ GuideRailAgent (验证)

存储系统 (AFS 挂载点)
  ├→ LocalFS (本地文件)
  ├→ SQLite (数据库)
  ├→ History (对话历史)
  ├→ Git (版本控制)
  └→ JSON/YAML (配置文件)
```

---

## 技术栈

- **包管理**: pnpm workspaces
- **运行时**: bun (脚本/测试)
- **代码质量**: Biome + TypeScript strict
- **构建输出**: CJS + ESM + DTS

---

## 开发命令

```bash
# 包管理
pnpm install              # 安装依赖
pnpm build                # 构建所有库包
pnpm lint                 # Biome 检查
pnpm lint:fix             # 自动修复

# 测试
pnpm test                 # 全部测试
pnpm test:coverage        # 覆盖率报告
cd packages/core && bun --cwd test test <file>.test.ts

# 示例运行
cd examples/<name> && bun <script>.ts
```

---

## 最近更新 (git log)

1. **AFSGit 模块** - 可挂载 Git 仓库到虚拟文件系统
2. **AFSJSON 模块** - 支持 JSON/YAML 文件挂载
3. **Keystore 测试修复** - 依赖 pin 到 exact 版本

---

## 设计特点

- **核心轻量** - @aigne/core 纯编排和类型系统
- **模型无关** - 13 个 LLM 适配器可组合
- **存储多元** - AFS 支持任意后端
- **工作流灵活** - 4 种编排模式
- **完整生态** - CLI + 25+ 示例 + 文档
