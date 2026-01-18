# Planning

项目规划与演进记录。

## 核心文档

### AFS/AFSD（重点）

| 文档 | 状态 | 描述 |
|-----|------|------|
| [afsd-spec.md](intents/afsd-spec.md) | 📝 设计中 | **AFSD 完整规格**：协议、场景验证、技术栈 |
| [did-afs-spec.md](intents/did-afs-spec.md) | 📝 设计中 | DID:AFS 身份规格 |
| [afs-cli-spec.md](intents/afs-cli-spec.md) | 📝 设计中 | AFS CLI 设计规范 |
| [team-afs-vision.md](intents/team-afs-vision.md) | 💡 愿景 | Team AFS 团队协作愿景 |
| [team-afs-v0.1-spec.md](intents/team-afs-v0.1-spec.md) | 📝 设计中 | Team AFS v0.1 规格 |

### 路线图与架构

| 文档 | 描述 |
|-----|------|
| [2026-Q1.md](roadmap/2026-Q1.md) | Q1 路线图：Repo 重组、AFSD、CLI |
| [product-architecture.md](ideas/2026-01-15-product-architecture.md) | 产品架构与开源策略 |
| [afs-architecture-evaluation.md](ideas/2026-01-17-afs-architecture-evaluation.md) | **AFS 架构综合评估** |

---

## AFSD Spec 速览

> 详见 [afsd-spec.md](intents/afsd-spec.md)

### 核心定位

```
AFS 不是存储系统，而是统一的访问接口和控制系统（Control Surface）。
```

### 操作模型

```
read   - 读取内容
write  - 写入内容
list   - 列出子项
exec   - 执行操作（支持 Human in the loop）
explain - 解释说明
```

### 技术栈

```
AIGNE  → 构建 Agent（开发时）
AINE   → 运行 Agent + Agent 构建 App（运行时 + 创造环境）
AFS    → 访问世界（Control Surface）
AFS-UI → 展示视图（Human 投影）
```

### 场景验证（15 个）

| 已验证 | 潜在场景 |
|-------|---------|
| S3 网盘 | AI Agent 记忆层 |
| Smart Home | 个人数据中心 |
| Team AFS | 第二大脑 |
| 个人 Blog/Bookmark | 开发者工作空间 |
| 社交/IM/聚合 | 多模态工作室 |
| | 分布式计算 |
| | API 聚合层 |
| | 数字孪生 |
| | 合规审计 |
| | 教育平台 |

**所有场景无需修改核心设计 → 验证了通用性**

---

## 目录结构

```
planning/
├── ideas/      # 想法收集、分析报告
├── intents/    # 明确的规格文档
├── roadmap/    # 路线图与里程碑
├── standards/  # 设计规范
└── changelog/  # 重大变更记录
```

## Ideas（想法与分析）

| 日期 | 文档 | 描述 |
|-----|------|------|
| 01-17 | [afs-architecture-evaluation.md](ideas/2026-01-17-afs-architecture-evaluation.md) | AFS 架构综合评估 |
| 01-16 | [team-structure-analysis.md](ideas/2026-01-16-team-structure-analysis.md) | 团队结构分析 |
| 01-15 | [product-architecture.md](ideas/2026-01-15-product-architecture.md) | 产品架构与开源策略 |
| 01-15 | [afs-independence-analysis.md](ideas/2026-01-15-afs-independence-analysis.md) | AFS 独立性分析 |
| 01-15 | [repo-structure-options.md](ideas/2026-01-15-repo-structure-options.md) | Repo 结构方案 |
| 01-15 | [testing-analysis.md](ideas/2026-01-15-testing-analysis.md) | 测试现状分析 |
| 01-15 | [observability-split-analysis.md](ideas/2026-01-15-observability-split-analysis.md) | Observability 分拆分析 |
| 01-15 | [monorepo-structure-improvements.md](ideas/2026-01-15-monorepo-structure-improvements.md) | Monorepo 改进 |
| 01-15 | [project-structure-overview.md](ideas/2026-01-15-project-structure-overview.md) | 项目结构概览 |

## Intents（规格文档）

| 文档 | 状态 | 描述 |
|-----|------|------|
| [afsd-spec.md](intents/afsd-spec.md) | 📝 | AFSD 完整规格（2600+ 行） |
| [did-afs-spec.md](intents/did-afs-spec.md) | 📝 | DID:AFS 身份规格 |
| [afs-cli-spec.md](intents/afs-cli-spec.md) | 📝 | AFS CLI 设计 |
| [team-afs-vision.md](intents/team-afs-vision.md) | 💡 | Team AFS 愿景 |
| [team-afs-v0.1-spec.md](intents/team-afs-v0.1-spec.md) | 📝 | Team AFS v0.1 |
| [repo-restructure-plan.md](intents/repo-restructure-plan.md) | 📝 | Repo 重组计划 |
| [release-and-sync-strategy.md](intents/release-and-sync-strategy.md) | 📝 | 发版与同步策略 |

## Standards（设计规范）

| 文档 | 描述 |
|-----|------|
| [cli-design-guideline.md](standards/cli-design-guideline.md) | CLI 设计规范 |

## 文件命名约定

- Ideas: `YYYY-MM-DD-<slug>.md`
- Intents: `<feature-name>.md`
- Roadmap: `YYYY-Q<N>.md` 或 `v<version>.md`
- Changelog: `YYYY-MM-DD-<title>.md`
