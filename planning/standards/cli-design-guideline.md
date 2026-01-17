# CLI 设计规范 v1.0

> 适用于: AFS, AIGNE, AINE 及所有 ArcBlock CLI 产品
> 日期: 2026-01-16

## 核心设计原则

### 一句话总结

> **CLI = stable machine truth + selectable views**
>
> 默认输出服务机器（LLM + script），人类可视化是可选投影。

### 三类读者

| 读者 | 需求 | 优先级 |
|------|------|--------|
| **LLM / Agent** | 稳定、可解析、语义明确 | 🔴 最高 |
| **Script / Pipeline** | grep/pipe/jq/xargs 友好 | 🔴 最高 |
| **人类** | 好看、易读、交互酷炫 | 🟡 通过 flag 提供 |

### 核心矛盾与解决方案

```
LLM 友好 ≠ 人类好看 ≠ Unix 好 pipe

解决方案: 不做"一个格式讨好所有人"
         而是"单一真相 + 多投影"
```

---

## 输出层级架构

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Machine Truth (默认)                          │
│  - 所有智能都基于这一层                                  │
│  - LLM/script 直接消费                                   │
└─────────────────────────────────────────────────────────┘
                    ↓ projection
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Structured (--json)                           │
│  - 结构化真相，给 contract/replay                        │
└─────────────────────────────────────────────────────────┘
                    ↓ projection
┌─────────────────────────────────────────────────────────┐
│  Layer 3: LLM DSL (--view=llm)                          │
│  - Token cheap，语义丰富                                 │
│  - 比 raw 多语义，比 JSON 少 token                       │
└─────────────────────────────────────────────────────────┘
                    ↓ projection
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Human Interactive (--view=human / -i)         │
│  - 酷炫交互，emoji，颜色，动画                           │
│  - 纯视觉增强，不引入新语义                              │
└─────────────────────────────────────────────────────────┘
```

---

## 详细规格

### 1. 默认输出 (Machine Truth)

**设计目标**: Ultra-boring, LLM-safe, pipe-safe

**必须遵守**:
- 一行一条记录
- 无 emoji / 无颜色 / 无对齐空格
- 字段固定顺序，空格或 tab 分隔
- 绝不换行嵌套
- stdout = 数据，stderr = 诊断
- grep/awk/cut 可直接处理

**示例**:
```bash
$ mycli list
item-1 active 128 2026-01-16T07:32:11Z
item-2 pending 256 2026-01-15T10:00:00Z
item-3 error 0 2026-01-14T08:00:00Z
```

**为什么**:
- LLM (Claude/GPT) 对这种格式理解极好
- 比 JSON 更稳定
- 可直接 pipe: `mycli list | grep active | wc -l`

---

### 2. JSON 输出 (--json)

**设计目标**: 结构化真相，schema-stable

**必须遵守**:
- Schema 必须版本化，向后兼容
- 不为"好看"省略字段
- 不嵌入 UI 语义（no emoji/color/hint）

**示例**:
```bash
$ mycli list --json
{
  "items": [
    {"id": "item-1", "status": "active", "size": 128, "updated": "2026-01-16T07:32:11Z"},
    {"id": "item-2", "status": "pending", "size": 256, "updated": "2026-01-15T10:00:00Z"}
  ],
  "total": 2,
  "schema_version": "1.0"
}
```

**用途**:
- Agent 程序化处理
- Contract 验证
- Replay / 审计

---

### 3. LLM 视图 (--view=llm)

**设计目标**: Token cheap + 语义丰富

**必须遵守**:
- 全大写 KEY
- 每行一个语义事实
- 无 JSON 嵌套
- 可直接 copy 到 LLM reasoning

**示例**:
```bash
$ mycli status item-1 --view=llm
ITEM item-1
STATUS ACTIVE
SIZE 128
UPDATED 2026-01-16T07:32:11Z
HEALTH OK
DEPENDENCIES 3
```

**为什么**:
- 比 JSON 少 ~40% token
- 比 default 多语义上下文
- LLM 可直接用于 chain-of-thought

---

### 4. 人类交互视图 (--view=human 或 -i)

**设计目标**: 酷炫、可交互、视觉愉悦

**允许**:
- Emoji / 颜色 / 图标
- 表格对齐 / 树形结构
- 进度条 / 动画 / spinner
- 友好时间格式 ("2 minutes ago")
- 交互式选择 / 搜索

**示例**:
```bash
$ mycli list --view=human

📋 Items (3 total)
┌──────────┬──────────┬────────┬─────────────────┐
│ ID       │ Status   │ Size   │ Updated         │
├──────────┼──────────┼────────┼─────────────────┤
│ item-1   │ 🟢 active │ 128B   │ 2 min ago       │
│ item-2   │ 🟡 pending│ 256B   │ yesterday       │
│ item-3   │ 🔴 error  │ -      │ 2 days ago      │
└──────────┴──────────┴────────┴─────────────────┘

Press [j/k] to navigate, [Enter] to select, [q] to quit
```

**交互式模式** (-i):
```bash
$ mycli list -i

? Select items to process: (Use arrow keys, space to select)
  ◯ item-1 (active, 128B)
❯ ◉ item-2 (pending, 256B)
  ◯ item-3 (error)

[Space] Toggle  [Enter] Confirm  [Ctrl+C] Cancel
```

**⚠️ 关键约束**:
- **不得引入新语义** — 只是视觉增强
- **不应被 LLM 默认消费** — 会导致解析不稳定
- **自动检测 TTY** — 非 TTY 时自动降级到 default

---

## Exit Code 规范

Exit code 是 CLI 协议的一部分，LLM 依赖它判断结果。

| Code | 含义 | 说明 |
|------|------|------|
| 0 | OK | 成功完成 |
| 1 | Not Found | 资源不存在 |
| 2 | Permission Denied | 权限不足 |
| 3 | Conflict | 并发冲突 |
| 4 | Partial | 部分成功 |
| 5 | Runtime Error | 运行时错误 |
| 10+ | 业务特定 | 各 CLI 自定义 |

---

## explain 命令 (必须实现)

每个 CLI 必须实现 `explain` 命令，给 LLM 提供行为模型。

### help vs explain

| 维度 | help | explain |
|------|------|---------|
| 服务对象 | 人类 | LLM / Agent |
| 关注点 | 语法用法 | 行为语义 |
| 输出稳定性 | 低 | **必须稳定** |
| 副作用说明 | 很少 | **明确** |
| 默认行为 | 隐式 | **显式** |

### explain 模板

```
$ mycli explain list

COMMAND mycli list

PURPOSE
List all items in the system.

INPUT
- filter: optional, status filter (active|pending|error)
- limit: optional, max items to return

DEFAULT BEHAVIOR
- Returns all items
- Sorted by updated desc
- Max 100 items

OUTPUT default:
- one line per item
- fields: ID STATUS SIZE UPDATED
- tab separated

OUTPUT --json:
- structured object
- schema version 1.0

ERRORS
- exit 1: no items found
- exit 2: permission denied

SIDE EFFECTS
- none (read-only)
```

---

## 自动检测与降级

### TTY 检测

```bash
# 交互式终端 → 可以 human view
$ mycli list
[显示 human view，如果配置了 default=human]

# 非 TTY (pipe) → 强制 machine truth
$ mycli list | grep active
[自动降级到 default 格式]
```

### 实现建议

```typescript
function getDefaultView(): View {
  if (process.stdout.isTTY && config.defaultView === 'human') {
    return 'human';
  }
  return 'default'; // machine truth
}
```

---

## 配置与用户偏好

### 全局配置 (~/.config/arcblock/cli.yaml)

```yaml
# 用户可以设置默认偏好
default_view: human  # 终端默认显示 human view
color: auto          # auto | always | never
interactive: true    # 启用交互式选择
```

### 环境变量覆盖

```bash
# 强制机器输出 (CI/CD 场景)
export ARCBLOCK_CLI_VIEW=default
export NO_COLOR=1

# 或单次覆盖
mycli list --view=default
```

---

## 明确禁止

**默认输出中禁止**:
- ❌ emoji / 颜色
- ❌ 表格对齐
- ❌ 省略字段
- ❌ 自动 summary
- ❌ "聪明"的推断

**JSON 输出中禁止**:
- ❌ UI hint
- ❌ 颜色代码
- ❌ 不稳定字段

**永远禁止**:
- ❌ human view 作为默认 (除非 TTY + 用户配置)
- ❌ LLM 消费 human view
- ❌ 不同 view 有不同语义

---

## 实现检查清单

每个 CLI 发布前必须检查:

- [ ] 默认输出 pipe-safe (可 grep/awk)
- [ ] --json 输出 schema-stable
- [ ] --view=llm 实现
- [ ] --view=human 实现 (含交互)
- [ ] explain 命令实现
- [ ] exit code 符合规范
- [ ] TTY 自动检测
- [ ] 非 TTY 自动降级
- [ ] 配置文件支持
- [ ] 无 breaking change (版本化)

---

## 应用范围

| CLI | 状态 |
|-----|------|
| afs-cli | 设计中，完全遵循 |
| aigne-cli | 现有，需要审查 |
| aine-cli | 待定 |
| 未来 CLI | 必须遵循 |

---

## 总结

> **"你做的不是 CLI，是 agent 的世界接口。"**

三个关键点:
1. **默认服务机器** — LLM 和 script 是一等公民
2. **人类是投影** — 酷炫 UI 通过 flag 提供
3. **explain 是灵魂** — 让 agent 自学你的 CLI

这样就能同时做到:
- ✅ LLM friendly
- ✅ Script friendly
- ✅ Human 酷炫交互
