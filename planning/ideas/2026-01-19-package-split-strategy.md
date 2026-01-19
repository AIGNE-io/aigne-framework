# AFS 与 AIGNE Framework 包拆分策略

> 日期: 2026-01-19
> 目标: 定义 npm 包拆分策略和 repo 组织结构
> 核心决策: 私有 monorepo 开发 → 公开 artifact repos 发布

---

## 执行摘要

**目标**: 将 AFS 和 AIGNE 从单一 monorepo 重组为清晰分层的多 repo 架构

**核心改动**:
- **Repo**: 1 个 → 4 个 (2 个 monorepos + 2 个独立 repos)
- **AFS**: 保持 `@aigne/afs-*` (7 个 npm 包: 5 个 library + explorer + cli)
- **AIGNE**: 保持 `@aigne/core` 单包 (~20 个包，含 history/user-profile-memory)
- **observability**: 独立 repo，可观测性框架
- **afsd**: 独立 repo，daemon 参考实现

**关键原则**:
```
✅ AFS 完全独立，零 AIGNE core 依赖
✅ AIGNE core 统一包，避免过度拆分
✅ CLI/explorer 在 AFS monorepo，daemon 独立
✅ 清晰的分层架构
```

---

## 一、目标架构

### 1.1 Repo 组织结构

**Monorepo 1: AFS**

```
afs/                                (AFS Monorepo)
├── packages/
│   ├── core/           → @aigne/afs
│   ├── local-fs/       → @aigne/afs-local-fs
│   ├── git/            → @aigne/afs-git
│   ├── sqlite/         → @aigne/afs-sqlite
│   ├── json/           → @aigne/afs-json
│   ├── explorer/       → @aigne/afs-explorer (Web UI 包)
│   └── cli/            → @aigne/afs-cli (CLI 工具，可使用 explorer)
└── pnpm-workspace.yaml
```

**Monorepo 2: AIGNE**

```
aigne/                              (AIGNE Monorepo)
├── packages/
│   ├── core/           → @aigne/core (完整 AIGNE framework)
│   ├── cli/            → @aigne/cli
│   ├── agent-library/  → @aigne/agent-library
│   ├── transport/      → @aigne/transport
│   ├── secrets/        → @aigne/secrets
│   ├── platform-helpers/ → @aigne/platform-helpers
│   ├── test-utils/     → @aigne/test-utils
│   ├── history/        → @aigne/history (会话历史存储)
│   └── user-profile-memory/ → @aigne/user-profile-memory (用户档案)
├── models/             → 13 个 @aigne/model-*
└── pnpm-workspace.yaml
```

**独立 Repo 3: observability** (可观测性框架)

```
observability/                      (Observability Monorepo)
├── api/             → @aigne/observability-api (API + 服务端)
├── ui/              → @aigne/observability-ui (React UI 组件)
├── blocklet/        → @blocklet/observability (Blocklet 应用)
└── pnpm-workspace.yaml
```

**独立 Repo 4: afsd** (daemon 服务)

```
afsd/
├── src/
│   ├── daemon/     (核心 daemon)
│   ├── server/     (HTTP/gRPC 服务)
│   └── runtime/    (world host 运行时)
└── package.json    → 依赖 @aigne/afs + providers
```

### 1.2 Repo 对应关系

| Git Repo | npm 包 | 类型 | 说明 |
|---------|--------|------|------|
| **afs** | 7 个 `@aigne/afs-*` | Monorepo | 5 个 library + explorer + cli |
| **aigne** | ~20 个 `@aigne/*` | Monorepo | 纯 library |
| **observability** | 2 个 npm 包 + 1 个 blocklet | Monorepo | 可观测性 |
| **afsd** | 1 个 (daemon) | 独立 Repo | daemon 服务 |

**说明**:
- ✅ AFS monorepo: 包含 5 个纯 library 包 + Web UI (explorer) + CLI 工具
- ✅ AIGNE monorepo: 包含 ~20 个纯 library 包 (含 history/user-profile-memory)
- ✅ AIGNE core 为单一统一包，包含 types + agents + prompt + utils + AIGNE + loader
- ✅ Observability 独立 repo: API (含服务端) + UI 组件 + Blocklet 应用
- ✅ daemon 独立 repo，作为参考实现
- ✅ CLI 可以使用 explorer 提供 Web UI 功能（如 `afs-cli serve`）

---

## 二、AFS 包拆分策略

### 2.1 包列表 (7 个 npm 包)

```
核心:
@aigne/afs              # 核心 + utils (~1,000 行)

Providers (按需):
@aigne/afs-local-fs     # 本地文件系统 (~549 行)
@aigne/afs-git          # Git 仓库 (~586 行)
@aigne/afs-sqlite       # SQLite 数据库 (~1,648 行)
@aigne/afs-json         # JSON/YAML 文件 (~444 行)

UI & 工具:
@aigne/afs-explorer     # Web UI 包 (~2,000 行)
@aigne/afs-cli          # CLI 工具 (~1,500 行，可选依赖 explorer)
```

### 2.2 关键改动

**1. 合并 utils 到 core**
- 将 `@aigne/afs-utils` (139 行) 合并到 `@aigne/afs` 核心包
- 避免过小的包，提升易用性

**2. 消除依赖违规**
- 移除 `@aigne/afs` → `@aigne/platform-helpers` 的依赖
- 复制需要的工具函数到 AFS 内部
- 确保 AFS 零上层依赖

**3. 移除 AI Application 层，移至 AIGNE**
- `@aigne/afs-history` → `@aigne/history`
- `@aigne/afs-user-profile-memory` → `@aigne/user-profile-memory`
- 理由: 这些是 AI 应用概念，归属 AIGNE framework

**4. Explorer 和 CLI 都作为 npm 包发布**

**@aigne/afs-explorer**:
- Web UI 组件包 (~2,000 行)
- React + TypeScript + Ant Design
- 使用场景: (1) 集成到 React 应用, (2) CLI serve 命令, (3) 第三方工具嵌入

**@aigne/afs-cli**:
- CLI 工具 (~1,500 行)
- 支持 machine-safe 输出、LLM 优化视图、human-friendly 格式
- `optionalDependencies` 包含 explorer，提供 `afs-cli serve` 命令

**afsd** (独立 repo):
- Daemon 服务，独立部署和运维
- 开源基本功能，商业版 (afsd-enterprise) 提供生产级特性

---

## 三、AIGNE Framework 包拆分策略

### 3.1 核心决策：不拆分

**问题**: `@aigne/core` 过大 (10,315 行)，是否需要拆分？

**决策**: 保持单一 `@aigne/core` 包

**理由**:
- ✅ ~14.5k 行仍是合理大小
- ✅ 避免决策疲劳，用户无需纠结装哪个包
- ✅ 简化迁移，v1 → v2 几乎无需改动
- ✅ 大部分用户需要完整功能
- ✅ 类似 React、Express 等成熟框架的做法

### 3.2 包设计

**@aigne/core** (~14.5k 行):
- **types**: 类型定义 (~500 行)
- **agents**: Agent 类 (~6k 行)
- **prompt**: Prompt 管理 (~4k 行)
- **utils**: 工具函数 (~2k 行)
- **aigne**: AIGNE 编排器 (~1.5k 行)
- **loader**: Agent 加载器 (~1k 行)
- **依赖**: @aigne/afs (仅部分 utils)

### 3.2 完整包列表 (~20 个)

- **核心包 (1)**: core
- **Model 包 (13)**: model-openai, model-anthropic, model-gemini, model-azure, model-bedrock, model-deepseek, model-groq, model-ollama, model-open-router, model-perplexity, model-vertex-ai, model-xai
- **Memory 包 (2)**: history, user-profile-memory
- **扩展包 (2)**: agent-library, transport, secrets
- **工具包 (2)**: cli, platform-helpers, test-utils

---

## 四、依赖关系

### 4.1 分层架构

```
应用层: @aigne/cli, @aigne/agent-library
   ↓
核心层: @aigne/core (完整 framework)
   ↓
存储层: @aigne/afs + providers

横切关注点:
- @aigne/observability-api (被 core 依赖，轻量级)
- @aigne/observability-ui (可选，Web UI 组件)
- @blocklet/observability (可选，独立部署)
```

### 4.2 关键改进

- ✅ AFS 零上层依赖 (移除 → platform-helpers)
- ✅ Observability 独立，仅依赖 API 接口
- ✅ 清晰的单向依赖流
- ✅ Models 独立，按需安装
