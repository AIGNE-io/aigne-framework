# afs-cli (Textual AFS-UI) 规格 v0.1

> 状态: 待执行
> 优先级: 高
> 依赖: AFSD 基本实现完成后

## 1. 定位

afs-cli 是 AFS-UI 的 **reference implementation（文本投影）**。

- CLI ≠ 调试工具
- **CLI = UI**
- CLI 是最小、最诚实的 AFS-UI

---

## 2. 核心原则（Non-Negotiables）

1. **AFS 是唯一真相**
2. **CLI 不创造语义，只投影状态**
3. **每次执行都是一次性投影（stateless）**
4. **输出必须 machine-safe + pipe-safe**
5. **agent 与人类使用同一输出**

---

## 3. 基本命令集合（Must Have）

### 3.1 Path Inspection
```bash
afs ls <path>
afs stat <path>
afs read <path>
```

### 3.2 Mutation / Action
```bash
afs write <path>
afs exec <path>
```

### 3.3 Explainability
```bash
afs explain <path|command>
```

**explain 是一等公民，不是 help。**

---

## 4. 输出视图（Views）

afs-cli 只允许三种 view：

### 4.1 default（默认）
- 一行一条
- 无 emoji / 无颜色
- 字段顺序固定
- stdout = 数据
- stderr = 诊断

```
/aine/status exec 128 2026-01-16T07:32:11Z sha256:abcd
```

### 4.2 --view=llm
- 全大写 key
- 每行一个事实
- 无 JSON 嵌套
- token cheap

```
PATH /aine/status
TYPE EXEC
SIDE_EFFECT NONE
```

### 4.3 --view=human
- 允许 emoji / tree
- 只做视觉增强
- **不得引入新语义**

---

## 5. Exit Code 规范

Exit code 是协议的一部分：

| Code | Meaning |
|------|---------|
| 0 | OK |
| 1 | Not found |
| 2 | Permission denied |
| 3 | Conflict |
| 4 | Partial |
| 5 | Runtime error |

---

## 6. 明确禁止

afs-cli **不得**：
- ❌ 自动总结
- ❌ 推断含义
- ❌ 隐式上下文
- ❌ UI side fix
- ❌ "聪明猜测"

---

## 7. 身份声明

> If it cannot be represented correctly in afs-cli, it does not belong to AFS-UI.

---

## 8. 成功标准

> afs-cli 的职责不是"帮用户理解"，而是"把世界如实呈现"。

---

## 实现计划

### 目录结构
```
afs/
└── cli/
    ├── src/
    │   ├── index.ts        # 入口
    │   ├── commands/
    │   │   ├── ls.ts
    │   │   ├── stat.ts
    │   │   ├── read.ts
    │   │   ├── write.ts
    │   │   ├── exec.ts
    │   │   └── explain.ts
    │   ├── views/
    │   │   ├── default.ts
    │   │   ├── llm.ts
    │   │   └── human.ts
    │   └── protocol.ts     # 与 afsd 通信
    └── test/
```

### 行动项
- [ ] 实现 6 个基本命令
- [ ] 实现 3 种输出视图
- [ ] 实现 exit code 规范
- [ ] 与 afsd 集成测试
- [ ] 测试：pipe-safe、machine-safe
- [ ] 测试：agent 与人类使用同一输出
