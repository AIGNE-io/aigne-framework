# Team AFS v0.1 规格

> 基于 Team AFS Vision，拆解最小可用版本
> 核心: Append-mostly 数据 repo + AI Agent 处理 + AFS-UI 投影

---

## 1. /team/* 目录规范

```
/team/
├── .meta/                    # 团队元数据
│   ├── config.yaml          # 团队配置
│   ├── members/             # 成员列表 (DID)
│   └── permissions/         # 权限规则
│
│ ─── 人类写入 (原始数据) ───
│
├── discussions/              # 讨论区
│   ├── general/
│   ├── engineering/
│   └── product/
│
├── docs/                     # 文档
│   ├── guides/
│   ├── specs/
│   ├── decisions/           # ADR
│   └── onboarding/
│
├── tasks/                    # 任务
│   ├── backlog/
│   ├── in-progress/
│   └── done/
│
├── projects/                 # 项目空间
│   ├── afs/
│   ├── aigne/
│   └── aine/
│
├── logs/                     # 工作日志 (Agent 自动写入)
│   ├── robert/
│   ├── dev-a/
│   └── agents/              # AI Agent 的操作日志
│
│ ─── AI 生成 (衍生数据) ───
│
├── reports/                  # AI 生成的报告
│   ├── daily/               # 每日摘要
│   └── weekly/              # 周报
│
├── indexes/                  # AI 生成的索引
│   ├── tasks-by-status.md
│   ├── docs-by-topic.md
│   └── recent-activity.md
│
├── views/                    # AI 生成的视图 (供 UI 渲染)
│   ├── dashboard.md
│   ├── kanban.md
│   └── active-tasks.md
│
├── insights/                 # AI 提取的洞察
│   └── patterns.md
│
│ ─── 系统管理 ───
│
└── history/                  # 自动历史 (afsd 管理)
    └── (append-only 历史记录)
```

### 命名约定

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 讨论帖 | `YYYY-MM-DD-slug.md` | `2026-01-16-cli-design.md` |
| 文档 | `slug.md` | `architecture.md` |
| 任务 | `TASK-NNN.md` | `TASK-001.md` |
| 决策 | `ADR-NNN-title.md` | `ADR-001-use-afs.md` |

### Artifact 结构 (以任务为例)

```yaml
# /team/tasks/in-progress/TASK-001.md
---
type: task
id: TASK-001
title: 实现 afsd mount 管理
status: in-progress
assignee: did:abt:robert
created: 2026-01-15T10:00:00Z
updated: 2026-01-16T08:00:00Z
priority: high
labels: [afs, core]
---

## 描述

实现 afsd 的 mount 管理功能...

## 进度

- [x] 设计 mount table 数据结构
- [ ] 实现 mount/unmount API
- [ ] 测试并发 mount
```

---

## 2. Team AFS 与 afsd / afs-cli 的接口边界

### 架构关系

```
┌─────────────────────────────────────────────────────────┐
│  Team AFS (afsd instance hosting /team/*)               │
│  ┌───────────────────────────────────────────────────┐ │
│  │  afsd instance                                     │ │
│  │  - 托管 /team/* 世界                               │ │
│  │  - 持久化 (SQLite / PostgreSQL)                    │ │
│  │  - 多用户并发                                      │ │
│  └───────────────────────────────────────────────────┘ │
│                          │                              │
│  ┌───────────────────────┼───────────────────────────┐ │
│  │  Protocol Layer       │                           │ │
│  │  - HTTP/WebSocket API │                           │ │
│  │  - 认证 (DID)         │                           │ │
│  │  - 权限检查           │                           │ │
│  └───────────────────────┼───────────────────────────┘ │
└──────────────────────────┼──────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ afs-cli  │    │ Web UI   │    │ Agent    │
    │ (local)  │    │ (human)  │    │ (LLM)    │
    └──────────┘    └──────────┘    └──────────┘
```

### 接口定义

**Team AFS 暴露的 API (基于 afsd 协议)**:

```
# 基本操作
GET    /afs/read?path=/team/docs/readme.md
POST   /afs/write?path=/team/docs/readme.md
POST   /afs/exec?path=/team/tasks/create
GET    /afs/explain?path=/team/tasks

# 元操作
GET    /afs/ls?path=/team/discussions
GET    /afs/stat?path=/team/docs/readme.md
GET    /afs/history?path=/team/docs/readme.md

# Mount (用于本地 afsd 连接)
WS     /afs/mount
```

**本地 afs-cli 使用**:

```bash
# 挂载远程 team world
afs mount https://asf.arcblock.io/team /mnt/team

# 之后就像本地路径一样操作
afs ls /mnt/team/discussions
afs read /mnt/team/docs/readme.md
afs write /mnt/team/tasks/TASK-002.md < task.md
```

---

## 3. 运行模式：本地 afsd + Mount

### 架构

```
开发者本地环境
┌─────────────────────────────────────────────────────┐
│  Local afsd                                         │
│  ├── /local/*           (私有数据)                  │
│  ├── /team/*            (mount: Team AFS)           │
│  │     └── 权限在 mount 时确定，之后无需每次检查     │
│  └── /projects/aigne/*  (mount: 项目 repo)          │
│                                                     │
│  Code Agent (Claude Code, Cursor, etc.)             │
│  └── 直接操作本地 AFS 路径                          │
│      - 自动写工作日志                               │
│      - 自动更新任务状态                             │
└─────────────────────────────────────────────────────┘
              │
              │ mount 协议 (sync)
              ▼
┌─────────────────────────────────────────────────────┐
│  Team AFS (远程 afsd)                               │
│  └── /team/*                                        │
└─────────────────────────────────────────────────────┘
```

### 关键设计

| 传统模式 | 本地 afsd + mount |
|---------|------------------|
| 每次操作检查权限 | mount 时一次性确定 |
| Agent 需要 API token | Agent 直接操作本地路径 |
| 网络依赖 | 本地优先，sync 可异步 |
| 手动记录工作 | Agent 自动写日志 |

### Agent 自动化示例

```bash
# Code Agent 工作时自动执行
afs write /team/logs/robert/2026-01-16.md << EOF
## Session: afs-cli 开发
- 完成 explain 命令实现
- 修复 3 个测试用例
EOF

# 任务状态自动更新
afs exec /team/tasks/TASK-042/mark-progress \
  --checkpoint "explain 命令完成"
```

---

## 4. 三视图架构：CLI / API / Web

### 一份数据，三种投影

```
/team/* (Append-mostly 数据)
        │
        ├─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
     afs-cli           afs API          afs-ui
        │                 │                 │
        ▼                 ▼                 ▼
      LLM            脚本/自动化          人类
   Code Agent       CI/CD, Webhook     阅读/导航
```

### 各视图设计目标

| 视图 | 主要用户 | 优化目标 |
|------|---------|---------|
| **afs-cli** | LLM / Code Agent | Token 效率、结构化输出、explain |
| **afs API** | 脚本、自动化、LLM | 稳定接口、批量操作、webhook |
| **afs-ui** | 人类 | 可视化导航、搜索、富文本渲染 |

### 设计原则

```
❌ Web 是"主界面"，CLI 是"辅助"
✅ 三者都是数据的等价投影，针对不同受众优化
```

### 典型工作流

```
1. Code Agent (via cli) 写入工作日志
2. CI/CD (via API) 自动更新构建状态
3. 团队成员 (via Web) 浏览今日进展
4. AI Agent (via API) 生成周报到 /team/reports/
5. 老板 (via Web) 阅读周报
```

---

## 5. 绝对不进入 Team AFS 的功能

### 红线列表

| 功能 | 为什么不进 Team AFS | 应该在哪 |
|------|---------------------|---------|
| **通知系统** | 这是 UI/UX 层面的事 | 各 UI 自己实现 |
| **搜索引擎** | 这是索引服务，不是世界状态 | 独立搜索服务 |
| **评论系统** | 评论就是 artifact，不需要特殊处理 | 作为子文件存在 |
| **工作流引擎** | AFS 托管状态，不编排流程 | Agent / 外部系统 |
| **权限 UI** | 权限数据在 AFS，UI 不在 | 各 UI 实现 |
| **用户管理** | DID 是外部身份系统 | DID 系统 |
| **富文本编辑** | 纯 UI 功能 | Web UI |
| **实时协作** | OT/CRDT 是 UI 层 | Web UI |
| **邮件通知** | 外围服务 | 通知服务 |
| **统计分析** | 衍生数据，不是世界状态 | 分析服务 |

### 判断原则

> **如果它是"对世界的解释"而不是"世界本身"，就不应该在 Team AFS。**

---

## 6. v0.1 最小上线形态

### 必须有 (Must Have)

| 功能 | 说明 |
|------|------|
| **afsd 在线实例** | 托管 /team/* |
| **HTTP API** | read/write/ls/stat |
| **DID 认证** | 基本身份验证 |
| **持久化** | SQLite (单节点够用) |
| **afs-cli 远程 mount** | 可从本地访问 |

### 可以有 (Nice to Have)

| 功能 | 说明 |
|------|------|
| **简易 Web UI** | human view 投影 |
| **history** | 基本版本历史 |
| **explain** | 路径解释 |

### 不要有 (v0.1 不做)

| 功能 | 原因 |
|------|------|
| 复杂权限 | 先验证核心价值 |
| 搜索 | 可以用 grep/afs-cli |
| 通知 | 轮询或手动检查 |
| 富文本编辑 | 用本地编辑器 |

### v0.1 用户旅程

```
1. 用户通过 DID 登录 Team AFS

2. 本地挂载 team world
   $ afs mount https://asf.arcblock.io/team ~/team

3. 用熟悉的工具操作
   $ cd ~/team/discussions/engineering
   $ vim 2026-01-16-new-topic.md
   $ afs write ./2026-01-16-new-topic.md

4. 或用 afs-cli 直接操作
   $ afs ls /team/tasks/in-progress
   $ afs read /team/docs/onboarding/welcome.md

5. Agent 也可以参与
   "帮我在 /team/discussions/engineering 创建一个关于 CLI 设计的讨论"
```

---

## 7. 迁移策略

### Phase 1: 并行运行

```
现有系统        Team AFS
   │               │
   │  ←──同步──→   │
   │               │
   ▼               ▼
用户可选择使用哪个
```

- 保持现有系统运行
- Team AFS 作为"另一种访问方式"
- 数据双向同步（或单向从 Team AFS 到旧系统）

### Phase 2: Team AFS 为主

```
现有系统        Team AFS
   │               │
   │  ←──只读──    │
   │               │
   ▼               ▼
旧系统变成 Team AFS 的 UI 投影
```

- 写操作全部走 Team AFS
- 旧系统变成只读视图
- 验证 Team AFS 稳定性

### Phase 3: 关闭旧系统

```
Team AFS
   │
   ├── Web UI (新)
   ├── afs-cli
   └── Agent
```

- 旧系统下线
- 数据完全在 Team AFS
- 多种 UI 并存

---

## 8. 成功标准

### Dogfood 验证点

- [ ] 能用 afs-cli 发起讨论
- [ ] 能用 vim + afs write 写文档
- [ ] 能用 Agent 创建任务
- [ ] 团队成员愿意使用
- [ ] 比旧系统更简单，不是更复杂

### 关键指标

| 指标 | 目标 |
|------|------|
| 日活跃写入 | > 10 次 |
| CLI 使用率 | > 30% |
| Agent 参与 | 有 agent 操作记录 |
| 数据迁移 | 关键数据迁移完成 |

---

## 9. 技术依赖

| 依赖 | 状态 | 说明 |
|------|------|------|
| afsd | 待开发 | 核心 |
| afs-cli | 待开发 | 用户入口 |
| AFS 远程 mount | 待设计 | 协议扩展 |
| DID 认证 | 已有 | 集成 |

### 开发顺序

```
1. afsd 基本功能 (Week 3-4)
2. afs-cli 基本命令 (Week 4-5)
3. Team AFS HTTP 层 (Week 5-6)
4. DID 认证集成 (Week 6)
5. 简易 Web UI (Week 7-8)
6. 团队试用 (Week 8+)
```

---

## Vision Anchor

> **Team AFS v0.1 的目标是验证一个假设：
> 团队协作的本质是共享一个世界，而不是使用一组工具。**
