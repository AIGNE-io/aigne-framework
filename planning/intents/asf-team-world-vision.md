# ASF (AFS Service) — A Team World Host

> Vision v0.1
> 状态: 探索中
> 目标: Dogfood AFS，用 team afsd 取代现有办公协作系统

---

## 1. 为什么需要 ASF

现有的 team 站点（论坛、文档、网站、任务系统）在形式上是多个 Web 应用，但在本质上，它们一直试图解决同一个问题：

> **如何让一个团队共享同一个"工作世界"？**

过去的做法：
- forum 承载讨论
- docs 承载知识
- tasks 承载状态
- website 承载展示

这些系统彼此链接，但并不共享同一个"真实状态空间"。
它们通过 UI 和业务逻辑来"模拟一个世界"，而不是直接托管一个世界。

**ASF 的出现，是为了终结这种割裂。**

---

## 2. ASF 的核心定义

> **ASF 是一个在线运行的 afsd 实例，
> 它托管的是"团队的 AFS 世界"，而不是"一个 Web 应用"。**

**ASF 不是**：
- ❌ 一个新的论坛
- ❌ 一个新的文档系统
- ❌ 一个新的任务管理工具
- ❌ 一个新的知识库 UI

**ASF 是**：
- ✅ 一个长期在线、可多用户访问、可被 agent inhabit 的 world host
- ✅ 一个团队级 AFS 的 authoritative instance

---

## 3. 世界模型，而不是应用集合

在 ASF 中，团队的一切存在形式统一为 AFS 路径和 artifact：

```
/team/
  discussions/
  docs/
  tasks/
  sites/
  history/
```

- 一篇讨论帖 = 一个文件
- 一个任务 = 一个文件 + metadata
- 一篇文档 = 一个文件
- 一个网站页面 = 一个可发布的路径视图

这些不是"被某个系统管理的数据"，
而是**世界本身的组成部分**。

ASF 不负责"解释它们是什么"，
只负责**托管、持久化、路由和暴露这些状态**。

---

## 4. ASF 的角色边界（非常重要）

ASF 的职责是极其克制的：

### ASF 负责 ✅

- 托管 `/team/*` 这个世界
- 处理 read / write / exec / explain
- 持久化 artifact 与历史
- 支持多用户 / 多 agent 并发访问
- 作为本地 afsd、agent、afs-cli 的远程 mount 目标

### ASF 不负责 ❌

- 业务流程
- 工作流编排
- 语义推断
- UI 决策
- "这是一个 task / forum / doc"的判断

> **ASF 是世界宿主，不是世界导演。**

---

## 5. UI 的退化与正名

在 ASF 世界中，UI 不再是系统的中心。

三种等价的 AFS-UI：
- Web UI
- CLI（afs-cli）
- Agent

它们地位完全平等，只是不同形式的 AFS-UI 投影。

UI 的职责只有一件事：

> **把 AFS 世界如实投影出来，而不注入新语义。**

因此：
- ASF 的 Web 界面 ≠ team 产品
- 它只是 AFS-UI（human view）的一个实例

---

## 6. 人与 Agent 的同一性

在 ASF 世界里：
- 人
- LLM agent
- 自动化程序

本质上是同一类参与者：

> **都是在同一个 AFS 世界中
> 读路径、写 artifact、执行行为。**

ASF 不区分"这是人写的"还是"这是 agent 写的"，
只区分：
- 哪个路径
- 哪个操作
- 产生了什么状态变化

---

## 7. 与过去系统的根本不同

ASF 在外观上可能让人联想到：
- Novell / NFS
- 共享盘
- "文件系统解决一切"

但它在本质上不同于这些历史系统：
- artifact ≠ 字节文件
- exec ≠ CRUD
- semantic ≠ UI 约定
- history / explain 是一等公民

更重要的是：

> **ASF 是为"可被智能 inhabit 的世界"而设计的。**

这是过去任何 team system 都不具备的前提。

---

## 8. ASF 的长期意义

ASF 的目标不是"替代一个 team 工具"，而是：

> **成为团队存在本身的一部分。**

当 ASF 成立后：
- 工具可以换
- UI 可以换
- agent 可以进化

**但世界不需要被重建。**

---

## 9. Vision Anchor

> **ASF 不是一个新的 team 产品，
> 而是一个让团队、工具与 agent
> 共同生活的 AFS 世界宿主。**

---

## 待拆解问题

1. `/team/*` 的最小目录规范
2. ASF 与 afsd / afs-cli 的接口边界
3. 哪些功能绝对不应该进入 ASF
4. 最小上线形态 (v0.1)
5. 迁移策略：现有系统 → ASF
