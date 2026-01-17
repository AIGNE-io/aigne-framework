# AFSD (AFS Daemon) 规格 v0.1

> 状态: 待执行
> 优先级: 高
> 依赖: AFS repo 独立完成后

## 1. 定位

afsd 是 AFS 的 **world host（世界宿主）**。

**它不是**：
- ❌ 业务系统
- ❌ workflow engine
- ❌ agent orchestrator
- ❌ UI

**它的唯一职责是**：
> 托管一个可被多个 client / agent 共享、持久存在的 AFS 世界。

---

## 2. 核心职责（Must Have）

### 2.1 Path Resolution
- 解析 AFS 路径（如 `/aine/status`）
- 根据 mount table 决定由哪个 provider 处理

### 2.2 Mount Management
- 支持 mount / unmount provider
- 支持：
  - local provider
  - remote afsd（afsd 挂载 afsd）
- mount 信息是显式、可 inspect 的

### 2.3 Operation Dispatch

统一处理并转发以下操作：
- `read(path)`
- `write(path, content)`
- `exec(path, args)`
- `explain(path or command)`

### 2.4 State Persistence
- AFS artifacts、metadata 必须持久化
- afsd crash / restart 后世界仍然存在

### 2.5 Concurrency & Safety
- 同一路径的并发操作必须有明确策略：
  - lock / version / conflict
- 冲突必须显式暴露，不能 silently overwrite

---

## 3. 明确禁止（Non-Goals）

afsd **绝对不允许**：
- ❌ 语义推断（semantic inference）
- ❌ agent 决策
- ❌ workflow / pipeline
- ❌ UI / formatting
- ❌ 自动 summary
- ❌ 隐式状态或 magic behavior

**判断标准**：如果一个功能可以被描述为"帮用户 / agent 更聪明"—— 那它**不属于 afsd**。

---

## 4. Protocol（最小）

afsd 对外暴露一个极简协议（本地或远程）：

```
READ   <path>
WRITE  <path> <content>
EXEC   <path> <args>
EXPLAIN <path|command>
```

**返回要求**：
- deterministic
- explainable
- exit code 是协议的一部分

---

## 5. 架构约束

- afsd 必须允许**多实例**
- **没有中心控制节点**
- 世界通过 mount 关系组合，而不是 global coordinator

---

## 6. 成功标准

> 用户几乎感觉不到它的存在，但所有世界状态都离不开它。

---

---

## 开源与商业版本界限

**内核一致，能力分层**：

| afsd (开源 reference) | AFS Runtime (商业版) |
|----------------------|---------------------|
| 核心协议实现 | 高性能优化 |
| 基本 persistence | 企业级存储 |
| 基本 concurrency | 分布式一致性 |
| 单实例运行 | 水平扩展 / 高可用 |
| 无权限管理 | 权限管理 / ACL |
| 无审计 | Auditing / 合规 |
| 独立运行 | DID 集成 / 身份验证 |

**原则**：
- 开源版：任何人可以跑自己需要的
- 商业版：高性能、权限管理、auditing、DID 集成
- **内核和开源是一样的**

---

## 实现计划

### 目录结构
```
afs/
└── daemon/
    ├── src/
    │   ├── index.ts
    │   ├── server.ts       # 协议服务
    │   ├── mount-table.ts  # mount 管理
    │   ├── path-resolver.ts
    │   ├── operations.ts   # read/write/exec/explain
    │   ├── persistence.ts  # 状态持久化
    │   └── concurrency.ts  # 并发控制
    └── test/
```

### 行动项
- [ ] 设计 mount table 数据结构
- [ ] 实现 path resolution
- [ ] 实现 4 个核心操作
- [ ] 实现持久化层
- [ ] 实现并发控制（lock/version）
- [ ] 实现协议层（本地 IPC / 远程）
- [ ] 测试：多实例、crash recovery、冲突处理
