# AFS 独立性分析

> 分析日期: 2026-01-15

## 问题

AFS 是否应该从 aigne-framework 独立出去？

---

## AFS 结构

```
afs/
├── core/           # 基础 VFS 层（无 core 依赖）
├── history/        # 对话历史（依赖 sqlite）
├── local-fs/       # 本地文件系统（⚠️ 依赖 core）
├── sqlite/         # SQLite 后端（无 core 依赖）
├── json/           # JSON/YAML（⚠️ 依赖 core）
├── git/            # Git 仓库（⚠️ 依赖 core）
└── user-profile-memory/  # 用户档案（❌ 强依赖 core）
```

**代码规模**: ~6,300 行 TypeScript

---

## 依赖关系分析

### Core → AFS（正常，单向消费）
- Core 的 peerDependencies: `@aigne/afs`, `@aigne/afs-history`
- 集成点: `prompt/skills/afs/*` (8 个工具 agent)

### AFS → Core（问题，反向依赖）
```
afs/local-fs → @aigne/core  ⚠️
afs/json     → @aigne/core  ⚠️
afs/git      → @aigne/core  ⚠️
afs/user-profile-memory → @aigne/core  ❌ 强依赖
```

**这违反了单向依赖原则**

---

## 与 Observability 对比

| 维度 | AFS | Observability |
|---|---|---|
| 核心设计 | 通用 VFS 抽象 | AI 专用监控 |
| 独立使用场景 | ✅ 完全可行 | ❌ 绑定框架 |
| 非 AI 适用 | ✅ 数据库、DevOps | ❌ 仅 AI 应用 |
| 外部用户 | ✅ 可独立发布 | ❌ 紧耦合 |

---

## 分拆 vs 保留分析

### 分拆优点
1. 清晰的依赖关系
2. 独立版本管理
3. 降低 Core 复杂度
4. 易于社区采用
5. 减少 bundle 大小

### 分拆缺点
1. 多 repo 管理复杂
2. 开发体验下降
3. 版本兼容性矩阵
4. 初期收益有限

---

## 结论

**决策：AFS 长期独立化**

AFS 有独立的生态愿景：
- afs-ui（可视化界面）
- afs-explorer（文件浏览器）
- afs-runtime（运行时管理）
- 各种 drivers（存储驱动）

**架构原则**：
- AFS 对 AIGNE 零感知、零依赖
- AIGNE Framework 作为消费者依赖 AFS
- 单向依赖：AIGNE → AFS

---

## 行动计划

### Phase 1: 清晰化（1-2周）
- [ ] 检查 afs/{local-fs,json,git} 为什么依赖 @aigne/core
- [ ] 分析 user-profile-memory 的耦合度
- [ ] 文档化当前依赖关系

### Phase 2: 重构（2-4周）
- [ ] 提取共享类型到 @aigne/types
- [ ] 消除 afs/local-fs → @aigne/core 依赖
- [ ] 消除 afs/json → @aigne/core 依赖
- [ ] 消除 afs/git → @aigne/core 依赖

### Phase 3: 持续
- [ ] user-profile-memory 保持对 core 依赖（本质是 AI 功能）
- [ ] 如需分离，建立 afs-ai-extensions 处理 AI 相关模块

---

## 目标架构

```
当前（有问题）:
packages/core ←→ afs/modules (双向依赖)

目标（健康）:
packages/core ← afs/modules (单向消费)
                    ↓
              afs-ai-extensions (可选 AI 增强)
```
