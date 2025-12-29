# AFS Image Generation Implementation Plan

> 基于 [i18n+image.md](./i18n+image.md) 工程设计文档的实现任务计划

## 📋 目标概述

将图片生成能力集成到 AFS 框架中，实现：

1. **Slot 驱动的图片生成**：应用只需在文档中声明图片需求（slot），框架自动创建图片节点并异步生成
2. **统一的 View 模型**：图片生成作为 view materialization，与 i18n 翻译共享同一套基础设施
3. **依赖追踪**：图片依赖其 owner 文档上下文，文档更新时自动标记图片过期
4. **去重复用**：相同描述的图片自动复用同一资源节点

## 🎯 核心设计理念

**"三问判断"验证**：

✅ **稳定 identity**：`assets/images/by-intent/<intentKey>` (基于 prompt hash)
✅ **异步生成**：支持 placeholder/fallback，后台生成图片
✅ **应用层无感知**：应用只需写 slot，框架自动处理

**数据流**：

```
应用写入文档 (包含 slot)
    ↓
SlotScanner 解析 slot
    ↓
创建图片节点 (assets/images/by-intent/<intentKey>)
    ↓
应用读取图片 (通过 assetPath)
    ↓
ImageGenerateDriver 生成
    ↓
记录依赖关系 (图片 → owner 文档)
```

---

## 📊 架构设计

### 1. Slot 协议

**格式规范**：

```html
<!-- afs:image id="architecture-overview" desc="System architecture diagram showing microservices and data flow" -->
```

**可选的 key 参数**（跨文档复用）：

```html
<!-- afs:image id="logo" key="company-logo" desc="Company logo with blue background" -->
```

**约束**：
- 必须单行
- 双引号
- `id`: `[a-z0-9._-]+`，同一 ownerPath 内唯一
- `key`: 可选，`[a-z0-9._-]+`，用于跨文档复用同一图片意图
- `desc`: 图片生成的 prompt seed

### 2. Intent Key 计算

**规则**：

```typescript
function computeIntentKey(desc: string, key?: string): string {
  if (key) {
    // 显式 key 优先
    return key;
  }

  // 规范化 desc：去除多余空格、转小写
  const normalized = desc.trim().toLowerCase().replace(/\s+/g, " ");

  // SHA-256 hash (取前 16 字符)
  return sha256(normalized).substring(0, 16);
}
```

**示例**：
- `desc="System Architecture Diagram"` → `intentKey="a1b2c3d4e5f6g7h8"`
- `key="company-logo"` → `intentKey="company-logo"`

**注意**：intentKey 仅用于去重和路径生成，不影响实际的图片生成内容（仍使用原始 desc）

### 3. 图片节点路径

> ⚠️ **重要变更**：为避免与用户文件夹冲突，图片资源统一存储在 `.afs` 目录下

**Asset Identity**（逻辑路径）：

```
.afs/images/by-intent/<intentKey>
```

**物化存储**（物理路径，实现细节）：

```
.afs/images/by-intent/<intentKey>/<viewKey>/image.<format>
```

**示例**：
- 逻辑路径：`.afs/images/by-intent/a1b2c3d4e5f6g7h8`
- 物理路径：`.afs/images/by-intent/a1b2c3d4e5f6g7h8/format=png;variant=original/image.png`

**ViewKey 示例**：
- `{format:"png", variant:"original"}` → `format=png;variant=original`
- `{format:"webp", variant:"thumbnail", language:"en"}` → `format=webp;language=en;variant=thumbnail`

### 4. 元数据扩展

#### 修改表：`source_metadata`（新增 kind 字段）

> 参考设计文档 [i18n+image.md#4.1](./i18n+image.md#L83-L96)

**新增字段**：

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| kind | TEXT | 资源类型提示：`"doc"` \| `"image"` \| `"unknown"` | `"unknown"` |
| attrs_json | TEXT | 扩展属性（JSON），如 mime、size、width/height 等 | `null` |

**kind 推断规则**（deterministic）：
- `write(path, string)` → `kind="doc"`
- `write(path, Buffer)` + mime sniff → `kind="image"`
- SlotScanner 创建图片节点 → `kind="image"`
- 其他 → `kind="unknown"`

**kind 用途**（hint，非真相）：
- Driver candidate 剪枝（提高匹配效率）
- 生命周期管理（prefetch/GC/统计）
- **不允许**作为唯一判断条件

**sourceRevision 策略**：
- `kind="doc"`: content hash（或 mtime+size）
- `kind="image"` (by-intent): `intent:<intentKey>`（因为 identity 即意图）
- `kind="image"` (上传): binary hash

#### 新增表：`afs_slots`

| 字段 | 类型 | 说明 |
|------|------|------|
| owner_path (PK1) | TEXT | 引用者文档路径 |
| slot_id (PK2) | TEXT | slot 标识符（owner 内唯一） |
| owner_revision | TEXT | 扫描时 owner 的 sourceRevision |
| slot_type | TEXT | v1 固定 `"image"` |
| desc | TEXT | 图片描述（prompt seed） |
| intent_key | TEXT | hash(normalize(desc)) 或 key |
| asset_path | TEXT | `.afs/images/by-intent/<intentKey>` |
| updated_at | INTEGER | 更新时间戳 |

#### 新增表：`afs_deps_meta`

| 字段 | 类型 | 说明 |
|------|------|------|
| out_path (PK1) | TEXT | 产物路径 |
| out_view_key (PK2) | TEXT | 产物 viewKey |
| in_path (PK3) | TEXT | 输入依赖路径 |
| in_revision | TEXT | 输入当时的 sourceRevision |
| role | TEXT | `"owner-context"` \| `"source"` |
| updated_at | INTEGER | 更新时间戳 |

**v1 最小依赖追踪**：
- 图片 view 产物依赖 ownerPath（role=owner-context）
- i18n view 产物依赖 source doc（role=source）

---

## 🚀 分阶段实现计划

### Phase 1: 基础设施搭建（M1 + M2）✅ **已完成**

**目标**：扩展元数据存储 + 实现 Slot Scanner

**完成时间**：2025-12-26

#### 任务清单

- [x] **1.1 扩展元数据 Schema** ✅
  - [x] 修改 `afs/core/src/metadata/models/source-metadata.ts`：
    - 添加 `kind: text("kind")` 字段
    - 添加 `attrsJson: text("attrs_json")` 字段
  - [x] 创建 `afs/core/src/metadata/models/slots-metadata.ts`
  - [x] 创建 `afs/core/src/metadata/models/deps-metadata.ts`
  - [x] 更新 `afs/core/src/metadata/models/index.ts` 导出新表
  - [x] **合并迁移**：直接修改 `001-init.ts`（避免多个迁移文件）
  - [x] 更新 `MetadataStore` 接口和 `SourceMetadata` 类型，添加 kind/attrs 字段
  - [x] 更新 `MetadataStore` 接口，添加 slots 和 deps 相关方法
  - [x] 实现 `normalizeViewKey(view: View): string` 函数（k=v;k=v 格式）
  - [x] 更新现有 `getViewMetadata` / `setViewMetadata` 使用 `normalizeViewKey`

- [x] **1.2 实现 MetadataStore 新方法** ✅
  - [x] `getSlot(ownerPath, slotId)`: 查询单个 slot
  - [x] `listSlots(ownerPath)`: 列出文档的所有 slots
  - [x] `getSlotByAssetPath(assetPath)`: 反向查询 slot（供 driver 使用）
  - [x] `upsertSlot(...)`: 插入或更新 slot
  - [x] `deleteSlots(ownerPath)`: 删除文档的所有 slots
  - [x] `setDependency(...)`: 记录依赖关系
  - [x] `listDependenciesByInput(inPath)`: 查询依赖某个输入的所有产物
  - [x] `listDependenciesByOutput(outPath, outViewKey)`: 查询产物的所有依赖

- [x] **1.3 实现 Slot Scanner** ✅
  - [x] 创建 `afs/core/src/slot-scanner.ts`
  - [x] 实现正则解析：`SLOT_PATTERN = /<!--\s*afs:image\s+id="([a-z0-9._-]+)"(?:\s+key="([a-z0-9._-]+)")?\s+desc="([^"]+)"\s*-->/g`
  - [x] 实现 `computeIntentKey(desc, key?)` 函数（支持显式 key 和描述哈希）
  - [x] 实现 `scan(module, ownerPath, content, ownerRevision)` 方法
  - [x] 实现 `ensureImageNode()`: 创建图片节点的 source_metadata，设置 `kind="image"`, `sourceRevision="intent:<intentKey>"`
  - [x] 添加 slot 格式验证（id/key 必须符合 `[a-z0-9._-]+`）

- [x] **1.4 集成到 ViewProcessor** ✅
  - [x] 在 `ViewProcessor` 构造函数中初始化 `SlotScanner`
  - [x] 修改 `handleWrite()` 方法，在文本内容写入后触发 `slotScanner.scan()`
  - [x] 实现 `markDependentViewsStale(module, inPath)` 方法
  - [x] **重构签名**：`handleWrite/handleDelete` 接收 `AFSModule` 对象而非字符串
  - [x] 集成依赖追踪：文档更新时自动标记依赖图片为 stale

- [x] **1.5 单元测试** ✅
  - [x] 创建 `test/slot-scanner.test.ts`（18 个测试，覆盖率 100%）
  - [x] 创建 `test/view-key.test.ts`（25 个测试）
  - [x] 测试 slot 解析（正常 case、边界 case、错误格式、id 冲突）
  - [x] 测试 intentKey 计算（规范化、去重、显式 key）
  - [x] 测试 metadata 操作（upsert、query、delete、列表）
  - [x] 测试依赖追踪和去重复用

- [x] **1.6 代码重构与质量保证** ✅
  - [x] 创建 `utils.ts`，提取 `sha256Hash` 公共函数
  - [x] 移动 `ImageSlot` 类型到 `type.ts`
  - [x] 合并迁移脚本到 `001-init.ts`（删除 002 迁移）
  - [x] 修复 TypeScript 严格空值检查问题（数组索引使用可选链）
  - [x] 通过 Biome lint 检查（31 个文件，0 错误）

**验收标准（全部达成）**：
- ✅ 写入包含 slot 的文档后，`afs_slots` 表中有对应记录
- ✅ 图片节点的 `source_metadata` 被自动创建，`kind="image"`
- ✅ Slot 格式验证正常工作（重复 id 抛错，malformed slot 跳过）
- ✅ `normalizeViewKey()` 函数通过测试，相同 view 不同键顺序产生相同 viewKey
- ✅ 所有 68 个测试通过（43 个新增 + 25 个现有）
- ✅ 构建成功，代码质量检查通过

**交付成果**：
- **新增文件**（7 个）：
  - `src/utils.ts` - 公共工具函数
  - `src/view-key.ts` - ViewKey 规范化
  - `src/slot-scanner.ts` - Slot 扫描器
  - `src/metadata/models/slots-metadata.ts` - Slots 表定义
  - `src/metadata/models/deps-metadata.ts` - 依赖表定义
  - `test/slot-scanner.test.ts` - Slot 扫描器测试（18 个测试）
  - `test/view-key.test.ts` - ViewKey 规范化测试（25 个测试）
- **更新文件**（6 个）：
  - `src/metadata/migrations/001-init.ts` - 合并所有表定义
  - `src/metadata/type.ts` - 新增 3 个接口，9 个方法签名
  - `src/metadata/store.ts` - 实现 9 个新方法
  - `src/type.ts` - 新增 ImageSlot 接口，启用 format/variant/policy 字段
  - `src/view-processor.ts` - 集成 SlotScanner，实现依赖追踪
  - `src/afs.ts` - 更新 write/delete 调用签名

**实际耗时**：1 天（含重构和测试）

**下一步**：Phase 2 - 图片生成 Driver 实现

---

### Phase 2: 图片生成 Driver（M3）✅ **已完成**

**目标**：实现 ImageGenerateDriver，支持基础图片生成（不带 language）

**完成时间**：2025-12-26

#### 任务清单

- [x] **2.1 创建 image-driver 包** ✅
  - [x] 创建目录 `afs/image-driver/`
  - [x] 参考 `afs/i18n-driver/package.json` 创建 `package.json`：
    - 包名：`@aigne/afs-image-driver`
    - 依赖：`@aigne/afs`, `@aigne/core`, `@aigne/gemini`, `zod`
    - 构建脚本：参考 i18n-driver 的配置
  - [x] 参考 `afs/i18n-driver/tsconfig.json` 创建 `tsconfig.json`
  - [x] 创建 `scripts/` 目录，复制构建配置文件：
    - `tsconfig.build.json`
    - `tsconfig.build.cjs.json`
    - `tsconfig.build.esm.json`
    - `tsconfig.build.dts.json`
  - [x] 创建 `src/driver.ts`
  - [x] 创建 `src/storage.ts`（存储路径计算）
  - [x] 创建 `src/index.ts`

- [x] **2.2 实现 ImageGenerateDriver** ✅
  - [x] 定义 `ImageGenerateDriverOptions` 接口
  - [x] 实现 `canHandle(view)` 方法：Phase 2 只处理 `{format:"png"}` 组合
  - [x] 实现 `process()` 方法主流程：
    1. 从 `afs_slots` 查询 slot 信息
    2. 读取 owner 文档内容（提供生成上下文）
    3. 调用 AI Agent 生成图片
    4. 计算并写入物理存储路径
    5. 记录依赖关系到 `afs_deps_meta`
    6. 返回 AFSEntry
  - [x] 实现存储路径计算：`<assetPath>/<viewKey>/<slug>.<format>`（优化版：使用 slug 作为文件名）

- [x] **2.3 实现默认图片生成 Agent** ✅
  - [x] 创建 `src/default-generation-agent.ts`
  - [x] 定义 `ImageGenerationInput` / `ImageGenerationOutput` 接口
  - [x] 使用 `GeminiImageModel` 实现 Agent（参考 `models/gemini/src/gemini-image-model.ts`）：
    - 默认模型：`gemini-2.5-flash`（Gemini 文生图模型）
  - [x] Prompt 工程：结合 slot.desc + owner context（约 300 字上下文）
  - [x] 支持 format 参数（png），通过 `outputFileType` 配置
  - [x] 实现重试逻辑：失败时自动重试最多 3 次，指数退避间隔（1s, 2s, 4s）
  - [x] 参考测试：`models/gemini/test/gemini-image-model.test.ts`

- [x] **2.4 Driver 注册与测试** ✅
  - [x] 创建集成测试 `test/image-driver.test.ts`（9 个测试）
  - [x] 测试完整流程：write slot → read image → verify generation
  - [x] 测试依赖追踪：update owner → image becomes stale
  - [x] Mock AI Agent 进行测试（避免实际 API 调用）

- [x] **2.5 Slug 优化方案** ✅（附加优化）
  - [x] 添加 `slug` 字段到 `afs_slots` schema
  - [x] 实现 `generateSlug()` 函数从描述生成人类可读的文件名
  - [x] 修改 `getStoragePath()` 使用 slug：`<assetPath>/<viewKey>/<slug>.<format>`
  - [x] 添加 AFS 辅助方法：
    - `getSlot(ownerPath, slotId)` - 获取 slot 元数据
    - `getImageBySlot(ownerPath, slotId, options)` - 通过 slot 读取图片
    - `renderSlots(ownerPath, content, options)` - 替换文档中的 slot 标记
  - [x] 更新 MetadataStore 方法支持 slug 字段
  - [x] 测试 slug 生成和辅助方法

**验收标准（全部达成）**：
- ✅ 读取图片 asset 时，driver 被正确匹配
- ✅ 图片生成完成后，物理文件存在
- ✅ `view_metadata.state = "ready"`，storagePath 正确
- ✅ `afs_deps_meta` 记录了依赖关系
- ✅ 重试机制正常工作：失败时自动重试最多 3 次
- ✅ Slug 优化：文件名可读（如 `company-logo.png` 而非 `image.png`）
- ✅ 辅助方法：可以通过 slot ID 直接访问图片和渲染文档

**交付成果**：
- **新增包**：`@aigne/afs-image-driver`
- **新增文件**（8 个）：
  - `afs/image-driver/package.json`
  - `afs/image-driver/tsconfig.json`
  - `afs/image-driver/src/driver.ts` - ImageGenerateDriver 实现（212 行）
  - `afs/image-driver/src/default-generation-agent.ts` - 默认生成 Agent（45 行）
  - `afs/image-driver/src/storage.ts` - 存储路径计算（27 行）
  - `afs/image-driver/src/index.ts` - 导出接口
  - `afs/image-driver/test/image-driver.test.ts` - 集成测试（9 个测试，394 行）
  - `afs/image-driver/scripts/*` - 构建配置文件（4 个）
- **更新文件**（5 个）：
  - `afs/core/src/metadata/models/slots-metadata.ts` - 添加 slug 字段
  - `afs/core/src/metadata/type.ts` - SlotMetadata 接口添加 slug
  - `afs/core/src/metadata/store.ts` - 所有 slot 方法支持 slug
  - `afs/core/src/slot-scanner.ts` - 生成并存储 slug
  - `afs/core/src/afs.ts` - 添加 3 个辅助方法（getSlot, getImageBySlot, renderSlots）

**测试结果**：
- 所有 9 个测试通过 ✅
- 覆盖功能：
  - 存储路径计算（带 slug）
  - Driver canHandle 匹配逻辑
  - 完整图片生成流程
  - Owner 文档上下文使用
  - 依赖关系记录
  - 错误处理（slot 不存在、context 缺失）
  - Slug 生成（如 `"system architecture diagram"` → `"system-architecture-diagram"`）
  - AFS 辅助方法（getSlot, getImageBySlot, renderSlots）

**实际耗时**：1 天（包含 slug 优化）

**关键技术决策**：
- ✅ 使用 gemini-2.5-flash 模型（而非 imagen-4.0）
- ✅ 默认使用完整 owner 文档作为上下文（约 300 字）
- ✅ Phase 2 只支持 png 格式（variant、language 留待后续）
- ✅ 简单重试策略：失败时重试所有错误类型
- ✅ Slug 优化：解决文件名可读性和 slot 替换便利性问题
- ✅ 路径稳定性：保持 intentKey 作为路径标识，slug 仅用于文件名

**下一步**：Phase 3 - Fallback 与增强功能

**预估工作量**：3-4 天 → **实际：1 天** ✅

---

### Phase 3: Fallback 与增强功能（M4）

**目标**：实现 fallback 策略 + 依赖传播优化

#### 任务清单

- [ ] **3.1 Fallback 提示消息**
  - [ ] 修改 `ViewProcessor.handleRead()`，对图片路径在 fallback 模式返回提示字符串
  - [ ] 提示消息：`"图片还未准备好，正在生成中..."`（或类似文案）
  - [ ] 添加 `isImagePath(path)` 辅助函数（检测 `.afs/images/` 路径）
  - [ ] 测试 fallback 模式：立即返回提示 + 后台生成

- [ ] **3.2 依赖传播优化**
  - [ ] 实现精细化 stale 检查：比较 `in_revision` 与当前 ownerRevision
  - [ ] 仅在 revision 真正变化时标记 stale
  - [ ] 添加批量依赖传播测试

- [ ] **3.3 ViewKey 规范化改进**（可选）
  - [ ] 实现 `normalizeViewKey(view)` 函数（k=v;k=v 格式）
  - [ ] 统一键顺序：`language → format → variant → policy`
  - [ ] 值规范化：trim、lowercase
  - [ ] 迁移现有 JSON.stringify 使用

- [ ] **3.4 错误处理与重试机制**
  - [ ] 参考 i18n driver 的重试逻辑（`afs/i18n-driver/src/driver.ts`）
  - [ ] 实现自动重试：失败时最多重试 3 次
  - [ ] 重试间隔：指数退避（1s, 2s, 4s）
  - [ ] 3 次重试后仍失败，标记 `state="failed"`
  - [ ] 记录详细错误信息到 `view_metadata.error`
  - [ ] 支持手动清除 failed 状态后重新生成

**验收标准**：
- ✅ wait="fallback" 时立即返回提示消息"图片还未准备好，正在生成中..."
- ✅ owner 文档更新后，图片自动标记 stale
- ✅ 生成失败有清晰的错误提示，记录到 `view_metadata.error`
- ✅ 重试逻辑完善：指数退避间隔，3 次后标记 failed

**预估工作量**：2-3 天

---

### Phase 4: 多语言图片支持（M5，可选）

**目标**：支持图片的多语言 view（如 `{format:"png", language:"en"}`）

#### 任务清单

- [ ] **4.1 扩展 Driver 能力**
  - [ ] 修改 `ImageGenerateDriver.canHandle()`，支持 `language` 维度
  - [ ] 更新 `capabilities.dimensions` 为 `["format", "variant", "language"]`

- [ ] **4.2 多语言生成逻辑**
  - [ ] 修改 AI Agent，传递 `language` 参数
  - [ ] Prompt 工程：引导生成特定语言的文字标注
  - [ ] 测试不同语言的图片生成

- [ ] **4.3 Fallback 语言链**
  - [ ] 请求 `language="en"` 但缺失时，fallback 到无语言版本
  - [ ] 实现语言 fallback 链逻辑
  - [ ] 测试多语言 fallback 场景

**验收标准**：
- ✅ 可以生成带语言标注的图片（如中文/英文版本）
- ✅ 语言缺失时能正确 fallback
- ✅ 不同语言的图片独立存储

**预估工作量**：2-3 天

---

### Phase 5: 优化与生产就绪（M6）

**目标**：性能优化、GC 机制、监控

#### 任务清单

- [ ] **5.1 批量预生成（Prefetch）**
  - [ ] 支持批量图片生成：`afs.prefetch(paths, {view: {format:"png"}})`
  - [ ] 并发控制（已有 p-limit）
  - [ ] 进度回调

- [ ] **5.2 垃圾回收（GC）**
  - [ ] 实现 `cleanupUnusedAssets()`：删除无 slot 引用的图片节点
  - [ ] 引用计数：检测 `afs_slots` 中是否还有引用
  - [ ] 物理文件清理策略

- [ ] **5.3 监控与诊断**
  - [ ] 添加统计接口：`getStats()` - 返回 slot/view/deps 数量
  - [ ] 性能监控：记录生成耗时
  - [ ] 健康检查：检测 stale/failed 视图数量

- [ ] **5.4 文档与示例**
  - [ ] 更新 `afs/README.md`
  - [ ] 编写 image-driver 使用文档
  - [ ] 创建完整示例项目（包含 slot → 生成 → 发布流程）

**验收标准**：
- ✅ 可以批量预生成所有图片
- ✅ GC 能清理未引用的资源
- ✅ 有完整的使用文档

**预估工作量**：3-4 天

---

## 📐 关键技术细节

### 1. Slot 解析正则表达式

```typescript
const SLOT_PATTERN = /<!--\s*afs:image\s+id="([^"]+)"\s+(?:key="([^"]+)"\s+)?desc="([^"]+)"\s*-->/g;

// 匹配示例：
// ✅ <!-- afs:image id="logo" desc="Company logo" -->
// ✅ <!-- afs:image id="arch" key="sys-arch" desc="System architecture" -->
// ❌ <!-- afs:image id="invalid id" desc="..." -->  (id 包含空格)
```

### 2. Intent Key 规范化

```typescript
function normalizeDesc(desc: string): string {
  return desc
    .trim()                    // 去除首尾空格
    .toLowerCase()             // 转小写
    .replace(/\s+/g, " ");     // 多个空格合并为一个
}

// 示例：
// "  System   Architecture  " → "system architecture"
// "COMPANY LOGO" → "company logo"
```

### 3. ViewKey 序列化规则

> ⚠️ **重要**：Phase 1 实现规范化格式，确保键顺序一致性

```typescript
/**
 * 规范化 ViewKey 序列化
 * 规则：
 * 1. 仅允许白名单键：language | format | variant | policy
 * 2. 值规范化：trim() + toLowerCase()
 * 3. 键排序固定：language → format → variant → policy
 * 4. 格式：k=v;k=v（无值的键不出现）
 */
function normalizeViewKey(view: View): string {
  const pairs: string[] = [];

  // 固定顺序：language → format → variant → policy
  if (view.language) pairs.push(`language=${view.language.trim().toLowerCase()}`);
  if (view.format) pairs.push(`format=${view.format.trim().toLowerCase()}`);
  if (view.variant) pairs.push(`variant=${view.variant.trim().toLowerCase()}`);
  if (view.policy) pairs.push(`policy=${view.policy.trim().toLowerCase()}`);

  return pairs.join(';');
}

// 示例：
// {format:"PNG", variant:"ORIGINAL"} → "format=png;variant=original"
// {language:"en", format:"webp"} → "language=en;format=webp"
// {language:"zh", format:"png", variant:"original"} → "language=zh;format=png;variant=original"
```

**重要性**：
- 决定 `view_metadata` 表主键的稳定性
- 避免 `{format:"png", language:"en"}` 和 `{language:"en", format:"png"}` 被识别为不同 view
- 所有 view 相关操作必须使用此函数序列化

### 4. 重试机制实现

> 参考 i18n driver 的重试逻辑

```typescript
async function processViewWithRetry(
  module: AFSModule,
  path: string,
  view: View,
  context: any,
  maxRetries = 3
): Promise<AFSEntry> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 尝试生成
      const result = await driver.process(module, path, view, {
        sourceEntry,
        metadata: { derivedFrom: sourceMeta.sourceRevision },
        context,
      });

      return result.data;
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);

      // 如果还有重试机会，等待后重试
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 所有重试都失败
  throw new Error(
    `Failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}
```

### 5. Fallback 提示消息

```typescript
// 在 ViewProcessor.handleRead() 中
if (wait === "fallback") {
  // 触发后台生成
  this.processView(module, path, options.view, context).catch(...);

  // 检测是否为图片路径
  if (isImagePath(path)) {
    return {
      data: {
        path,
        content: "图片还未准备好，正在生成中...",
        metadata: { placeholder: true }
      },
      message: "Image is being generated in background",
      viewStatus: { fallback: true }
    };
  }

  // 非图片，返回源内容（如 doc）
  const sourceResult = await module.read?.(path);
  return { ... };
}

function isImagePath(path: string): boolean {
  return path.startsWith('.afs/images/');
}
```

### 6. 依赖传播示例

```typescript
// 场景：用户修改包含 slot 的文档
await afs.write("/docs/intro.md", updatedContent);

// 触发流程：
// 1. ViewProcessor.handleWrite()
//    - 检测 sourceRevision 变化
//    - 调用 markDependentViewsStale("/docs/intro.md")
//
// 2. markDependentViewsStale()
//    - 查询: SELECT * FROM afs_deps_meta WHERE in_path = "/docs/intro.md"
//    - 结果: [{ outPath: "assets/images/by-intent/a1b2", outViewKey: "format=png;..." }]
//    - 标记: UPDATE view_metadata SET state = "stale" WHERE ...
//
// 3. 下次读取图片时
//    - isViewStale() 返回 true
//    - 重新调用 driver.process() 生成新图片
```

### 7. 物理存储路径规则

```
项目根目录/
└── modules/
    └── doc-smith/
        ├── docs/
        │   └── intro.md                              # 源文档
        ├── .i18n/
        │   └── en/
        │       └── docs/
        │           └── intro.md                      # i18n view 产物
        └── .afs/
            ├── metadata.db                           # SQLite 元数据
            └── images/
                └── by-intent/
                    └── a1b2c3d4/                     # intentKey (图片节点)
                        ├── format=png;variant=original/
                        │   └── image.png             # 基础图片
                        ├── format=webp;variant=thumbnail/
                        │   └── image.webp            # 缩略图
                        └── format=png;language=en;variant=original/
                            └── image.png             # 英文版图片
```

**说明**：
- 应用层 identity：`.afs/images/by-intent/a1b2c3d4`
- 物化存储：`.afs/images/by-intent/a1b2c3d4/<viewKey>/image.<format>`
- 应用层永远不应该直接拼接物化路径，必须通过 `afs.read(path, {view})` 访问
- `.afs/` 目录统一管理 AFS 框架的内部资源，避免与用户文件冲突

---

## 🧪 测试策略

### 单元测试

- **SlotScanner**
  - 正则解析准确性
  - intentKey 计算一致性
  - 格式验证（边界 case）

- **ImageGenerateDriver**
  - canHandle() 匹配逻辑
  - 存储路径计算
  - Mock Agent 测试

### 集成测试

- **完整流程**
  1. Write 文档（包含 slot）
  2. Verify slots 表记录
  3. Read 图片 asset
  4. Verify 生成完成
  5. Update 文档
  6. Verify 图片 stale

- **依赖追踪**
  1. 生成图片
  2. Verify deps 记录
  3. 修改 owner
  4. Verify 图片标记 stale

- **Fallback 行为**
  1. Read 未生成的图片（wait="fallback"）
  2. Verify 立即返回 placeholder
  3. Wait 后台生成完成
  4. Read 再次返回真实图片

### 性能测试

- 批量 slot 扫描（1000+ slots）
- 并发图片生成（concurrency=10）
- 依赖传播性能（大量依赖关系）

---

## ⚠️ 注意事项与风险

### 1. ViewKey 兼容性

**问题**：当前代码使用 `JSON.stringify(view)`，改为 `k=v;k=v` 格式会导致旧数据不兼容。

**解决方案**：
- Phase 1-3 先保持 JSON.stringify
- Phase 4 实现新格式时添加迁移逻辑
- 或者提供配置开关，允许选择序列化方式

### 2. Intent Key 冲突

**问题**：SHA-256 理论上可能冲突（极低概率）。

**解决方案**：
- 插入 `afs_slots` 时检测 intentKey 冲突
- 如果 desc 不同但 intentKey 相同，抛出错误
- 建议用户使用显式 `key` 参数避免冲突

### 3. 图片生成成本

**问题**：AI 图片生成成本高、耗时长。

**解决方案**：
- 默认使用 fallback 模式，后台异步生成
- 提供 prefetch 接口，发布前批量生成
- 考虑缓存策略（intentKey 相同则永久缓存）

### 4. 物理文件清理

**问题**：slot 被删除后，图片文件可能成为孤儿。

**解决方案**：
- Phase 5 实现 GC 机制
- 定期扫描无引用的 asset
- 提供手动清理接口

### 5. 并发生成控制

**问题**：大量图片同时生成可能超出 API 配额。

**解决方案**：
- prefetch 使用 p-limit 控制并发
- 添加队列机制（可选）
- 支持限流配置

---

## 📚 参考资料

- [i18n+image.md](./i18n+image.md) - 完整工程设计文档
- [afs/core/src/view-processor.ts](../afs/core/src/view-processor.ts) - ViewProcessor 实现
- [afs/i18n-driver/src/driver.ts](../afs/i18n-driver/src/driver.ts) - I18nDriver 参考实现
- [afs/core/src/metadata/store.ts](../afs/core/src/metadata/store.ts) - SQLite MetadataStore

---

## 🎯 下一步行动

**建议优先级**：

1. **Review 本文档** - 确认设计方向和任务拆分
2. **Phase 1 实施** - 先搭建基础设施（metadata + slot scanner）
3. **中间验证** - 确保 slot 扫描流程正常工作后再继续
4. **Phase 2 实施** - 实现图片生成 driver
5. **迭代优化** - 根据实际使用情况调整 Phase 3-5

**已确定决策**：

- ✅ **图片路径**：使用 `.afs/images/by-intent/<intentKey>`（避免与用户文件冲突）
- ✅ **source_metadata.kind 字段**：需要在 Phase 1 添加
- ✅ **AI 服务**：使用 Gemini 模型（`imagen-4.0-generate-001` 或 `gemini-2.5-flash`）
- ✅ **包结构**：参考 `i18n-driver` 包的结构和配置
- ✅ **ViewKey 序列化**：实现 `k=v;k=v` 格式，确保键顺序一致（Phase 1 实现）
- ✅ **Fallback 策略**：返回提示字符串"图片还未准备好"（短期不使用真正的 fallback 模式）
- ✅ **重试机制**：失败时自动重试 3 次，参考 i18n driver 的翻译重试逻辑

请 review 本计划，如有调整建议请提出！
