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
afs explain <command>     # explain CLI command behavior
afs explain <path>        # explain AFS object
afs explain --json <...>  # machine-readable explain (for agent caching)
```

**explain 是一等公民，不是 help。**

---

## 4. help vs explain (核心设计原则)

### 设计原则

> **help 解决的是"我怎么用"，explain 解决的是"它到底做了什么"。**

### 对比

| 维度 | help | explain |
|------|------|---------|
| **服务对象** | 人类 | LLM / agent |
| **关注点** | 用法语法 | 行为语义 |
| **输出稳定性** | 低 | **必须稳定** |
| **是否可 parse** | 否 | 是 |
| **是否解释副作用** | 很少 | **明确** |
| **是否解释输出 schema** | 否 | **明确** |
| **是否解释错误** | 简略 | **系统化** |
| **是否描述默认行为** | 隐式 | **显式** |

### 为什么 LLM 特别需要 explain

LLM 的真实使用模式：
1. 看 explain
2. 在脑子里构建：输入 → 行为 → 输出
3. 再去调用命令
4. 根据 exit code / output 判断下一步

如果只有 help，LLM 会：
- 猜默认行为 → 错误假设
- 猜输出结构 → 错误 parse
- 猜错误语义 → 不稳定 agent 行为

### explain 的输出规则

- 纯文本
- 无 emoji
- 全大写 section header
- 字段枚举，不是 prose
- 尽量短，但不省略

---

## 5. explain 规格

### 5.1 explain 命令 (afs explain afs <command>)

```
COMMAND afs ls

PURPOSE
List entries under a given AFS path.

INPUT
- path: absolute or relative AFS path

DEFAULT BEHAVIOR
- Lists direct children only
- Sorted by name ascending
- Follows no symlinks
- Does not recurse

OUTPUT default:
- one entry per line
- fields: PATH TYPE SIZE MODIFIED HASH
- stable order

OUTPUT --view=llm:
- semantic facts per entry
- uppercase keys

OUTPUT --json:
- structured object
- schema version 1

ERRORS
- exit 1: path not found
- exit 2: permission denied

SIDE EFFECTS
- none
```

### 5.2 explain 对象 (afs explain <path>)

```
OBJECT /aine/memory/user-profile

TYPE
exec

DESCRIPTION
User profile memory with get/set/delete operations.

INPUTS
- action: get | set | delete
- key: string (for get/set/delete)
- value: any (for set)

OUTPUTS
- get: returns value or null
- set: returns { success: true }
- delete: returns { success: true }

ERRORS
- exit 1: key not found (get/delete)
- exit 3: concurrent modification conflict

SIDE EFFECTS
- set: modifies persistent state
- delete: modifies persistent state

METADATA
- provider: user-profile-memory
- mount: /aine/memory/
- permissions: read, write
```

### 5.3 explain 模板

**命令 explain 模板**:
```
COMMAND afs <name>

PURPOSE
<one line description>

INPUT
<- field: type description>

DEFAULT BEHAVIOR
<- explicit default behavior>

OUTPUT default:
<- output format description>

OUTPUT --view=llm:
<- llm view format>

OUTPUT --json:
<- json schema reference>

ERRORS
<- exit N: description>

SIDE EFFECTS
<- none | list of effects>
```

**对象 explain 模板**:
```
OBJECT <path>

TYPE
<file | dir | exec | link>

DESCRIPTION
<one line description>

INPUTS
<- if exec: input parameters>

OUTPUTS
<- expected output structure>

ERRORS
<- exit N: description>

SIDE EFFECTS
<- none | list of effects>

METADATA
<- provider, mount, permissions, etc.>
```

### 5.4 explain --json

为 agent 提供可缓存的结构化输出：

```json
{
  "type": "command",
  "name": "afs ls",
  "purpose": "List entries under a given AFS path.",
  "inputs": [
    { "name": "path", "type": "string", "required": true }
  ],
  "defaultBehavior": [
    "Lists direct children only",
    "Sorted by name ascending"
  ],
  "outputs": {
    "default": { "format": "lines", "fields": ["PATH", "TYPE", "SIZE", "MODIFIED", "HASH"] },
    "llm": { "format": "facts", "style": "uppercase keys" },
    "json": { "schema": "v1" }
  },
  "errors": [
    { "code": 1, "meaning": "path not found" },
    { "code": 2, "meaning": "permission denied" }
  ],
  "sideEffects": []
}
```

---

## 6. 输出视图（Views）

### 设计原则

> **AFS CLI = stable machine truth + selectable views**
>
> 不要试图做"一个输出格式同时讨好所有人"
> 要做"单一真相 + 多投影（projection）"

三类读者的需求矛盾：
- **LLM**: 稳定、可解析、语义明确
- **人类**: 好看、易读、视觉层级
- **Unix 工具链**: grep/pipe/jq/xargs 友好

👉 **解决方案**: 分离视图，各自优化

---

### 6.1 default（默认）— 机器真相层

**目标**: Ultra-boring, LLM-safe, pipe-safe

**规则**:
- 一行一条
- 无 emoji / 无颜色
- 无对齐空格
- 无装饰
- 字段固定顺序
- 绝不换行嵌套
- grep/jq/awk 可直接用
- stdout = 数据
- stderr = 诊断

**示例 (afs ls)**:
```
/aine/status exec 128 2026-01-16T07:32:11Z sha256:abcd1234
/aine/config file 256 2026-01-15T10:00:00Z sha256:efgh5678
/aine/logs dir 0 2026-01-16T08:00:00Z -
```

**示例 (afs stat)**:
```
PATH=/aine/status
TYPE=exec
SIZE=128
MODIFIED=2026-01-16T07:32:11Z
HASH=sha256:abcd1234
PROVIDER=memory
```

**为什么这样设计**:
- Claude / Codex 对这种格式理解极好
- 比"好看 JSON"还稳定
- 可直接 pipe 到其他工具

---

### 6.2 --json — 结构化真相

**目标**: 给 agent / contract / replay 用

**规则**:
- JSON 必须 schema-stable
- 不为"好看"牺牲字段冗余
- 不嵌入任何 UI 语义（no emoji / no color）

**示例 (afs ls --json)**:
```json
{
  "path": "/aine",
  "type": "dir",
  "entries": [
    {
      "path": "/aine/status",
      "type": "exec",
      "size": 128,
      "modified": "2026-01-16T07:32:11Z",
      "hash": "sha256:abcd1234"
    },
    {
      "path": "/aine/config",
      "type": "file",
      "size": 256,
      "modified": "2026-01-15T10:00:00Z",
      "hash": "sha256:efgh5678"
    }
  ]
}
```

**示例 (afs stat --json)**:
```json
{
  "path": "/aine/status",
  "type": "exec",
  "size": 128,
  "modified": "2026-01-16T07:32:11Z",
  "hash": "sha256:abcd1234",
  "provider": "memory",
  "permissions": ["read", "exec"],
  "metadata": {
    "description": "System status endpoint"
  }
}
```

---

### 6.3 --view=llm — LLM 语义层

**目标**: Token cheap, 语义明确, 无 UI 噪音

**这是 AFS CLI 的灵魂点** — "给 LLM 的 DSL"

**规则**:
- 全大写 key（LLM 极易识别）
- 每行一个事实
- 无 JSON 嵌套
- 可被 Claude Code 直接 copy into reasoning
- 比 JSON 少 token
- 比 raw 多语义

**示例 (afs stat --view=llm)**:
```
FILE /aine/status
TYPE EXEC
SIZE 128
HASH sha256:abcd1234
STATE READY
UPDATED 2026-01-16T07:32:11Z
SIDE_EFFECT NONE
```

**示例 (afs ls --view=llm)**:
```
DIR /aine
ENTRY /aine/status TYPE=exec SIZE=128 STATE=ready
ENTRY /aine/config TYPE=file SIZE=256 STATE=ready
ENTRY /aine/logs TYPE=dir CHILDREN=5
TOTAL 3
```

---

### 6.4 --view=human — 人类可视化层

**目标**: 给人类看的投影

**允许**:
- emoji
- 对齐
- 缩进
- 颜色
- 树形结构
- 时间友好格式

**示例 (afs ls --view=human)**:
```
📁 /aine
 ├─ 🟢 status        128B   updated 2m ago
 ├─ 📄 config       256B   updated yesterday
 └─ 📂 logs/         5 items
```

**⚠️ 关键约束**:
- **不得引入新语义**
- **human view 永远不应该被 LLM 默认消费**
- 否则引入不稳定解析灾难

---

### 6.5 视图对照表

| 命令 | default | --view=llm | --view=human |
|------|---------|------------|--------------|
| ls | 一行一条目 | ENTRY 格式 | emoji tree |
| stat | KEY=VALUE | 全大写 KEY | 格式化表格 |
| read | 原始内容 | 带 CONTENT header | 语法高亮 |
| explain | 结构化文本 | 同 default | 带示例 |

---

## 7. Exit Code 规范

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

## 8. 明确禁止

afs-cli **不得**：
- ❌ 自动总结
- ❌ 推断含义
- ❌ 隐式上下文
- ❌ UI side fix
- ❌ "聪明猜测"

---

## 9. 身份声明

> If it cannot be represented correctly in afs-cli, it does not belong to AFS-UI.

---

## 10. 成功标准

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
    │   ├── explain/        # explain 专用模块
    │   │   ├── command-explain.ts
    │   │   ├── object-explain.ts
    │   │   └── templates.ts
    │   ├── views/
    │   │   ├── default.ts
    │   │   ├── llm.ts
    │   │   └── human.ts
    │   └── protocol.ts     # 与 afsd 通信
    └── test/
```

### 行动项
- [ ] 实现 6 个基本命令 (ls, stat, read, write, exec, explain)
- [ ] 实现 explain 两种模式：命令 explain + 对象 explain
- [ ] 实现 explain 模板系统
- [ ] 实现 explain --json 输出
- [ ] 实现 3 种输出视图
- [ ] 实现 exit code 规范
- [ ] 与 afsd 集成测试
- [ ] 测试：explain 输出稳定性（agent 可依赖）
- [ ] 测试：pipe-safe、machine-safe
- [ ] 测试：agent 与人类使用同一输出
