# Team AFS — Append-mostly 团队数据世界

> Vision v0.2
> 状态: 探索中
> 目标: Dogfood AFS，用 Team AFS 取代现有办公协作系统

---

## 1. 核心概念

> **Team AFS = Append-mostly 的团队数据 repo
> 对象是人和 AI，产物全部留在 AFS 里**

```
┌─────────────────────────────────────────────────────────┐
│                    Team AFS World                       │
│                                                         │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│   │  Human  │  │  Human  │  │  Agent  │               │
│   └────┬────┘  └────┬────┘  └────┬────┘               │
│        │            │            │                     │
│        ▼            ▼            ▼                     │
│   ┌─────────────────────────────────────────────────┐ │
│   │              Append-mostly Data                  │ │
│   │  discussions/ docs/ tasks/ decisions/ ...       │ │
│   └─────────────────────────────────────────────────┘ │
│                         │                              │
│                         ▼                              │
│   ┌─────────────────────────────────────────────────┐ │
│   │           AI Agent Processing                    │ │
│   │  - 监控变化                                       │ │
│   │  - 生成报告                                       │ │
│   │  - 创建视图                                       │ │
│   └─────────────────────────────────────────────────┘ │
│                         │                              │
│                         ▼                              │
│   ┌─────────────────────────────────────────────────┐ │
│   │           Derived Artifacts (也在 AFS)           │ │
│   │  reports/ summaries/ views/ indexes/ ...        │ │
│   └─────────────────────────────────────────────────┘ │
│                         │                              │
│                         ▼                              │
│   ┌─────────────────────────────────────────────────┐ │
│   │              AFS-UI Projections                  │ │
│   │  Web / CLI / Agent 都是等价的视图投影            │ │
│   └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Append-mostly 模型

### 类比

```
Git repo 之于代码 = Team AFS 之于团队数据

- 所有变化有历史
- 可以 diff
- 可以 blame
- AI 可以读取全部上下文
```

### 为什么是 Append-mostly

| 传统系统 | Team AFS |
|---------|----------|
| CRUD 为主 | Append 为主 |
| 编辑覆盖历史 | 历史自动保留 |
| 状态难追溯 | 完整审计轨迹 |
| 删除即消失 | 删除是标记，数据仍在 |

### 操作语义

```
write   = append new version (原数据保留在 history)
delete  = mark as deleted (数据不真正删除)
update  = write new version + link to previous
```

### 好处

- **完整历史**: 谁、什么时候、改了什么
- **可审计**: 所有变化可追溯
- **AI 友好**: Agent 可以看到完整上下文
- **无冲突**: append 天然避免写冲突

---

## 3. 人与 AI 的数据流

### 人类写入 (原始数据)

```
/team/
├── discussions/
│   └── 2026-01-16-cli-design.md      # 人写的讨论
├── docs/
│   └── architecture.md               # 人写的文档
├── tasks/
│   └── TASK-001.md                   # 人创建的任务
└── decisions/
    └── ADR-001-use-afs.md            # 人写的决策
```

### AI Agent 处理 (监控 → 生成)

```
AI Agent watches /team/* and generates:

/team/
├── reports/                          # AI 生成
│   ├── daily/
│   │   └── 2026-01-16.md            # 每日摘要
│   └── weekly/
│       └── 2026-W03.md              # 周报
│
├── indexes/                          # AI 生成
│   ├── tasks-by-status.md           # 任务状态索引
│   ├── docs-by-topic.md             # 文档主题索引
│   └── recent-activity.md           # 最近活动
│
├── views/                            # AI 生成
│   ├── active-tasks.md              # 活跃任务视图
│   ├── recent-discussions.md        # 最近讨论
│   └── kanban.md                    # 看板视图
│
└── insights/                         # AI 生成
    ├── patterns.md                  # 工作模式
    └── recommendations.md           # 建议
```

### 关键: 所有产物都在 AFS

- 人写的 → 在 AFS
- AI 生成的报告 → 在 AFS
- AI 创建的索引 → 在 AFS
- AI 产出的视图 → 在 AFS

**没有"外部系统"，一切都是 AFS artifact。**

---

## 4. AI Agent 角色定义

### 4.1 数据处理 Agent

```yaml
name: team-data-processor
watches: /team/discussions/**, /team/docs/**, /team/tasks/**
triggers:
  - on: new_file
  - on: file_updated
actions:
  - update /team/indexes/*
  - generate /team/views/*
outputs_to: /team/indexes/, /team/views/
```

### 4.2 报告生成 Agent

```yaml
name: report-generator
schedule:
  daily: every day 20:00
  weekly: every Sunday 20:00
reads:
  - /team/** (relevant period)
outputs:
  - /team/reports/daily/YYYY-MM-DD.md
  - /team/reports/weekly/YYYY-WNN.md
```

### 4.3 洞察提取 Agent

```yaml
name: insight-extractor
schedule: weekly
reads:
  - /team/discussions/**
  - /team/tasks/**
  - /team/reports/**
outputs:
  - /team/insights/patterns.md
  - /team/insights/recommendations.md
```

---

## 5. AFS-UI: 视图投影

### UI 不创造数据，只渲染 AFS

```
❌ 错误: UI 计算 "有 5 个 active tasks"
✅ 正确: 读取 /team/views/active-tasks.md，渲染它
```

### 三种等价的 UI

| UI | 目标用户 | 渲染方式 |
|---|---------|---------|
| **Web** | 人类 | 漂亮的 HTML |
| **CLI** | 人/机器 | 终端文本 |
| **Agent** | LLM | 读取 views/*.md |

### Web UI 示例

```
访问 https://team.arcblock.io/

实际上是:
1. 读取 /team/views/dashboard.md
2. 渲染成 HTML
3. 显示给用户

点击 "任务看板":
1. 读取 /team/views/kanban.md
2. 渲染成看板 UI
```

---

## 6. 与传统系统的对比

### 传统 Team 系统

```
Forum App ──┐
Docs App  ──┼── 各自数据库 ── 各自 UI ── 人使用
Tasks App ──┘
           (AI 难以访问)
```

### Team AFS

```
/team/* (统一 append-mostly 数据)
    │
    ├── 人写入原始数据
    │
    ├── AI Agent 监控处理
    │       │
    │       └── 生成 reports/ indexes/ views/ insights/
    │
    └── AFS-UI 投影
            ├── Web (人类)
            ├── CLI (人/机器)
            └── Agent (LLM)
```

---

## 7. 核心原则

### 7.1 世界宿主，不是应用

Team AFS 是 afsd 实例，托管 /team/* 世界。

**它不是**:
- ❌ 论坛应用
- ❌ 文档系统
- ❌ 任务管理工具

**它是**:
- ✅ 团队数据的 authoritative source
- ✅ Append-mostly 历史库
- ✅ AI 可 inhabit 的世界

### 7.2 处理而不是管理

```
传统: 人写 → 系统管理 → 人查看
Team AFS: 人写 → AI 处理 → 产物保留 → 多种视图
```

### 7.3 视图而不是功能

```
传统: "任务系统有看板功能"
Team AFS: Agent 生成 /team/views/kanban.md，UI 渲染它
```

---

## 8. Vision Anchor

> **Team AFS 不是一个新的协作工具，
> 而是一个 append-mostly 的团队数据世界。
>
> 人和 AI 共同写入，
> AI 自动处理生成报告和视图，
> 所有产物（包括衍生数据）都留在同一个世界里，
> UI 只是对这个世界的投影。**

---

## 9. 关键洞察

```
数据 repo (像 Git)     而不是   应用集合
Append-mostly         而不是   CRUD
AI 处理               而不是   系统管理
视图投影              而不是   内置功能
所有产物都在 AFS      而不是   散落各处
```
