# AFS View + Driver Materialization（i18n + image）工程设计 v1

## 1. 目标与范围

### 1.1 目标

* 把 **多语言翻译** 与 **图片生成/派生** 都统一为 AFS 的 **view 物化能力**：
  * identity = `path`
  * projection = `view`
  * materialization = driver 产物（落盘/缓存/异步 job）

* 应用层（DocSmith 等）只负责：
  * 写入 source-of-truth（doc 内容）
  * 声明图片需求（slot）
  
* 框架层（AFS）负责：
  * 解析 slot、去重复用、创建图片节点
  * view 状态管理、strict/fallback/prefetch
  * 多语言 i18n driver
  * image driver（generate/derive），图片可选多语言 view

### 1.2 v1 范围

* View 统一模型（language/format/variant/policy）
* sqlite 元数据：source/view/slots/deps（deps 可先最小实现）
* i18n driver：doc 的 language view
* image pipeline：slot scanner + image generate + image derive
* kind：保留，作为 hint（非真相），提供推断/纠错机制

---

## 2. 对外 API（v1）

```ts
type View = {
  language?: string;   // "en" | "zh" | ...
  format?: string;     // doc: "md"|"html"|"pdf" ; image: "png"|"webp"
  // variant?: string;    // doc: "summary"|"toc" ; image: "original"|"thumbnail"
  // policy?: string;     // "technical"|"marketing" ...
};

// 下面这些接口参数名只是设计，以代码中实现为这准
type ReadOptions = { view?: View; wait?: "strict" | "fallback" };

afs.read(path: string, opts?: ReadOptions): Promise<string | Buffer>;
afs.write(path: string, content: any, opts?: { view?: View }): Promise<void>;
afs.stat(path: string, opts?: { view?: View }): Promise<Stat>;
afs.list(pathOrGlob: string, opts?: { view?: View }): Promise<Entry[]>;
afs.prefetch(pathOrGlob: string|string[], opts: { view: View }): Promise<void>;
```

### 2.1 约束（强制）

* `write(path, {view})` 只允许 driver/框架写 view 产物；应用写 source 不带 view。
* `read(path, {view})` 是唯一获取 view 的入口；应用不拼 `.i18n/` 或图片缓存路径。

---

## 3. ViewKey 规范化（必须做）

### 3.1 ViewKey 序列化规则

* 仅允许白名单 keys：`language|format|variant|policy`
* 值 normalize：`trim()`，`lowercase()`（语言代码等）
* key 排序固定：`language -> format -> variant -> policy`
* 序列化格式：`k=v;k=v`（无值的 key 不出现）

示例：

* `{language:"en"}` → `language=en`
* `{format:"webp",variant:"thumbnail"}` → `format=webp;variant=thumbnail`
* `{language:"zh",format:"png",variant:"original"}` → `language=zh;format=png;variant=original`

> 这决定了 `afs_view_meta` 的主键稳定性，必须统一。

---

## 4. 元数据存储（sqlite）

> 你们已经在 i18n 用了 sqlite 两表（source/view），这里扩展为 **4 表（v1 推荐）**：
> `source_meta` / `view_meta` / `slots` / `deps`（deps 可先最小实现）

### 4.1 `afs_source_meta`（按 path） 代码中这个表已经存在了，需要合并考虑，不要覆盖现有实现

| 字段              | 类型      | 说明                               |         |                |           |
| --------------- | ------- | -------------------------------- | ------- | -------------- | --------- |
| path (PK)       | TEXT    | identity                         |         |                |           |
| kind            | TEXT    | `doc                             | image   | unknown`（hint） |           |
| updated_at      | INTEGER | unix ms                          |         |                |           |
| attrs_json      | TEXT    | 可选扩展（mime、size、width/height…）    |         |                |           |

**source_revision 建议：**

* doc：content hash（或 mtime+size）
* image（by-intent）：`intentKey`（因为 identity=意图）
* image（上传）：binary hash

### 4.2 `afs_view_meta`（按 path + viewKey） 代码中这个表已经存在了，需要合并考虑，不要覆盖现有实现

| 字段             | 类型      | 说明                 |       |            |         |
| -------------- | ------- | ------------------ | ----- | ---------- | ------- |
| path (PK1)     | TEXT    | identity           |       |            |         |
| view_key (PK2) | TEXT    | viewKey            |       |            |         |
| state          | TEXT    | `ready             | stale | generating | failed` |
| derived_from   | TEXT    | 对应 source_revision |       |            |         |
| generated_at   | INTEGER | unix ms            |       |            |         |
| driver_id      | TEXT    | 物化 driver（诊断用）     |       |            |         |
| error          | TEXT    | 可选错误               |       |            |         |

### 4.3 `afs_slots`（slot → asset 绑定）

| 字段               | 类型      | 说明                                    |
| ---------------- | ------- | ------------------------------------- |
| owner_path (PK1) | TEXT    | 引用者节点                                 |
| slot_id (PK2)    | TEXT    | 稳定锚点                                  |
| owner_revision   | TEXT    | 扫描时 owner 的 source_revision           |
| slot_type        | TEXT    | v1 固定 `image`                         |
| desc             | TEXT    | prompt seed                           |
| intent_key       | TEXT    | hash(normalize(desc))                 |
| asset_path       | TEXT    | `assets/images/by-intent/<intentKey>` |
| updated_at       | INTEGER | unix ms                               |

> v1 的复用：desc 相同 → intentKey 相同 → assetPath 相同。

### 4.4 `afs_deps_meta`（产物 view 依赖）

| 字段                 | 类型      | 说明                    |         |        |    |
| ------------------ | ------- | --------------------- | ------- | ------ | -- |
| out_path (PK1)     | TEXT    | 产物 path               |         |        |    |
| out_view_key (PK2) | TEXT    | 产物 viewKey            |         |        |    |
| in_path (PK3)      | TEXT    | 输入依赖 path             |         |        |    |
| in_revision        | TEXT    | 输入当时的 source_revision |         |        |    |
| role               | TEXT    | `owner-context        | lexicon | policy | …` |
| updated_at         | INTEGER | unix ms               |         |        |    |

**v1 最小 deps：**

* image view 产物依赖 ownerPath（role=owner-context）
* i18n view 产物依赖 source doc（role=source）

---

## 5. kind：来源、推断、纠错、使用

### 5.1 kind 定位

* kind 是 **hint**，用于：

  * driver candidate 剪枝
  * 生命周期管理（prefetch/GC/统计）
* kind 不是真相，不允许成为唯一判断条件。

### 5.2 kind 写入来源优先级

1. **AFS/Scanner 创建**的节点（高可信）：例如 `assets/images/by-intent/*` → `kind=image`
2. **Driver 写入** view 产物时可补充 attrs（mime/size），但不改 source kind
3. 应用写入 doc：AFS 根据 `content` 类型检测

### 5.3 推断规则（deterministic）

* `write(path, string)` → kind=doc
* `write(path, Buffer)` + mime sniff → kind=image
* path pattern `assets/images/by-intent/` → image
* 其它 → unknown

### 5.4 读时校验（兜底触发条件）

仅在以下情况触发 sniff：

* kind=unknown
* resolver 发现多个 driver 候选且 kind 无法剪枝
* driver 执行前发现输入不符合预期（例如 image driver 打开后不是图片）

触发后：

* 更新 `afs_source_meta.kind `（自愈）
* 重新 resolve 一次

---

## 6. Slot 协议与 Scanner（deterministic pass）

### 6.1 slot 格式（单一规范）

```
<!-- afs:image id="architecture-overview"  key="snap-kit-architecture" desc="..." -->
```

约束：

* 必须单行
* 双引号
* id：`[a-z0-9._-]+`，同 ownerPath 内唯一
* desc：允许任意文本；若包含 `"` 需要 `\"`（或 v1 直接规定 desc 不允许双引号）
* key is optional. Use a short, stable token ([a-z0-9._-]+) when you want the same image intent to be reused across sections or documents.

### 6.2 Scanner 触发时机（v1）

* 在 `afs.write(ownerPath)` 完成后，AFS core enqueue `scan(ownerPath)`
* 可选：`afs.prefetch(ownerPath, {view:{variant:"images"}})` 主动触发 scan+生成

### 6.3 Scanner 算法（伪代码）

```ts
function scanOwnerForImageSlots(ownerPath):
  content = afs.read(ownerPath) // source read
  ownerMeta = source_meta(ownerPath) // must exist

  slots = parseSlots(content) // regex + strict validation
  for slot in slots:
    intentKey = hash(normalize(slot.desc))
    assetPath = `assets/images/by-intent/${intentKey}`

    upsert afs_slots(ownerPath, slot.id, ownerMeta.source_revision, "image",
                     slot.desc, intentKey, assetPath)

    ensure source_meta(assetPath):
      kind=image, kind_source=scanner, conf=100
      source_revision=intentKey

    // mark baseline views missing/stale (optional)
    ensure view_meta(assetPath, viewKeyFor({variant:"original",format:"png"})):
      if not exists -> state=missing (store as stale or add explicit missing)
```

> **状态字段里你们现在用 missing/stale/ready**。sqlite 里如果只存 4 态，建议：

* 不存在 = missing
* 存在且 state=stale 表示需要重建
  （这样不用额外枚举 missing）

---

## 7. Driver 体系与 resolve（避免 pipeline）

### 7.1 Driver 注册（能力声明）

每个 driver 声明：

* `id`
* `supportedKinds`（可选剪枝）
* `match(view)`：是否能处理某些维度子集
* `materialize(path, view, ctx)`：产物生成

建议 v1 至少有：

* `i18n.driver`（doc + language）
* `image.generate.driver`（image + variant=original + format=png/webp + 可选 language）

### 7.2 Resolve 流程（伪代码）

```ts
async function read(path, {view, wait}):
  viewKey = normalizeViewKey(view)

  // 1) fast-path: view ready
  vm = view_meta.get(path, viewKey)
  if (vm?.state === "ready"):
    return readMaterialized(path, viewKey)

  // 2) determine source + kind hint
  sm = source_meta.get(path) || inferSourceMetaIfNeeded(path)
  kind = sm.kind

  // 3) find capable driver (UNIQUE)
  candidates = drivers.filter(d => d.match(view) && d.supportsKind(kind))
  driver = pickUnique(candidates) // must be unique; otherwise fail or require composite

  // 4) materialization control
  if (wait === "fallback"):
    kickJobDedup(path, viewKey, driver)
    return fallbackResult(path, view) // doc: source default lang; image: best-effort

  // strict
  return await waitForJob(path, viewKey, () => kickJobDedup(...))
```

### 7.3 “唯一 driver”策略（必须）

* `pickUnique()` 不能返回多个
* 多维组合（如 `language+format`）必须通过**组合 driver**显式注册，例如：

  * `doc.i18n+format.driver`（内部先 i18n 再 format），对外仍是一个 driver

> 这和你们 i18n 讨论里“避免 middleware 叠加”完全一致。

---

## 8. Materialization：状态机、wait 策略

### 8.1 状态机（view_meta.state）

* `ready`：可直接读产物
* `stale`：可读旧产物（可选）但应重建；v1 建议 stale 时 strict 等重建，fallback 返回旧/降级
* `generating`：已有 job 在跑
* `failed`：生成失败（可重试）

> “missing” 用 `view_meta` 不存在表示。

### 8.2 strict / fallback

* `strict`：缺失/过期 → 等待 materialize 完成（promise）
* `fallback`：

  * doc（i18n）：直接返回主语言内容，同时后台翻译
  * image：

    * 如果请求 `language=xx` 缺失 → 先返回不带 language 的图（若 ready），否则返回占位
    * 同时后台生成目标语言图

---

## 10. deps：过期传播（把“上下文变化”纳入一致性）

这是图片方案落地后最容易变成技术债的点，所以 v1 就建议做“最小 deps”。

### 10.1 image view 生成完成时写 deps

在 `image.generate.driver.materialize()` 完成后：

* 写 `deps(out=assetPath+viewKey, in=ownerPath+ownerRevision, role=owner-context)`

### 10.2 ownerPath 更新后传播 stale（两种实现）

A) 简单实现（v1 推荐）
`write(ownerPath)` 后：

* scanner 重新扫描 slot（更新 ownerRevision）
* 同时查询 deps：`SELECT out_path,out_view_key WHERE in_path=ownerPath`
  将这些 out 的 view_meta 标记 stale

B) 更精细（v2）
比较 `in_revision` 与当前 ownerRevision，只有不一致才 stale

---

## 11. 物化产物落盘（Workspace 约定）
`modules/doc-smith`

`modules` 是 afs 读取的前缀
`doc-smith` 是 module 名称

### 11.1 Doc i18n

* source：`modules/doc-smith/docs/`（主语言）
* 物化：`modules/doc-smith/.i18n/docs/<lang>/...`（落盘策略，不是抽象）
* meta：`.afs/metadata.db`

### 11.2 Image

* asset identity：`modules/doc-smith/assets/images/by-intent/<intentKey>`
* 物化 view 存储（示例策略）：

  * `modules/doc-smith/assets/images/by-intent/<intentKey>/<viewKey>/image.png`
    （实现层细节，抽象层不暴露）

---

## 12. 关键实现清单（任务拆分）

### M1：View/Meta/Resolve 基建 - 已实现了部分版本，需要结合现有代码实现

* [ ] ViewKey 规范化实现
* [ ] sqlite：source_meta / view_meta / slots / deps 表
* [ ] kind 推断（write-time）+ 兜底校验入口
* [ ] read/write/prefetch 的框架骨架（含 wait）

### M2：i18n driver（doc + language） - 已实现了部分版本，需要结合现有代码实现

* [ ] i18n.materialize：翻译生成、写入 view 产物、更新 view_meta
* [ ] strict/fallback 行为落地
* [ ] deps：doc language view 依赖 source doc

### M3：image pipeline（scan + generate + derive）

* [ ] slot parser（regex + 语法校验）
* [ ] scanner：写 slots + ensure image node
* [ ] image.generate.driver：original png（先不做 language）
* [ ] deps：image view 依赖 ownerPath（最小实现）

### M4：图片多语言（可选）

* [ ] image.generate 支持 view.language
* [ ] fallback：无语言图兜底
* [ ] 渲染器默认策略：优先 language view + fallback

---

## 13. 最小可运行示例（行为预期）

### 13.1 应用写 doc（包含 slot）

* `afs.write("docs/intro.md", "...<!-- afs:image id="img-001" desc="..." -->...")`
* AFS 自动 scan：

  * upsert slots：`owner=docs/intro.md, slot=img-001 → assetPath=assets/images/by-intent/<k>`
  * ensure `source_meta(assetPath).kind=image`

### 13.2 发布器渲染请求图片

* `assetPath = lookupSlots("docs/intro.md","img-001")`
* `afs.read(assetPath, { view:{format:"webp",variant:"thumbnail",language:"en"}, wait:"fallback" })`
* 若缺：立即返回无语言图或占位，同时后台生成语言版缩略图
