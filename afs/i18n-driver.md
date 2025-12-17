# AFS i18n Driver 实施方案

## 一、背景与目标

### 1.1 问题分析

当前 DocSmith 中的多语言翻译是通过 Agent 编排流程实现的 workaround：
- 生成文档 → 调用翻译 Agent → 等待翻译 → 保存多语言版本
- 应用层承担了本应属于文件系统的职责
- AFS 只支持"单语言文件"，缺少语义化视图能力

### 1.2 设计目标

将多语言建模为**同一文件的不同语言视图**，由 AFS 框架统一提供：
- Agent 只需声明"我要什么"（path + language）
- 格式转换/翻译由 driver 层完成
- Agent 不参与调度、不感知转换细节
- 支持异步 I/O，读不到就挂起，数据就绪后唤醒

---

## 二、架构设计

### 2.1 核心概念

#### View（视图投影键）

`View` 是对同一文件的不同投影结果的统一抽象，path 是唯一 identity，view 只是读取/生成的投影键。

```typescript
type View = {
  language?: string;   // "en", "zh", "ja" - 目标语言
  // format?: string;     // 未来扩展：格式转换，如 "md", "html", "pdf"
  // policy?: string;     // 未来扩展：不同风格策略，如 "technical", "marketing"
  // variant?: string;    // 未来扩展：变体，如 "summary", "toc", "index"
};
```

**当前实现范围：**
- V1 版本只实现 `language` 维度，用于多语言翻译
- 其他维度（format、policy、variant）作为未来扩展点预留
- 设计上支持多维度组合，但实现上分阶段进行

**关键原则：**
- `path` 是文件的唯一标识
- `view` 是多维投影键的组合（可扩展）
- 多语言只是 view 的一个维度（当前唯一实现的维度）

#### Driver（视图转换器）

Driver 负责将 source 文件转换为指定 view 的投影结果：
- 以"能力"注册：声明自己处理哪些 view 维度（子集匹配）
- 对同一次 read(path, view)：AFS 选择唯一 capable driver
- 避免多 driver 行为叠加和组合爆炸

**Driver 示例：**
- i18n driver：关心 `{ language }`（V1 实现）
- format driver：关心 `{ format }`（未来扩展）
- summary driver：关心 `{ variant: "summary" }`（未来扩展）

### 2.2 架构分层

```
┌─────────────────────────────────────────────┐
│         Agent / Application Layer           │
│  afs.read("docs/intro.md", {                │
│    view: { language: "en" },                │
│    wait: "strict"                           │
│  })                                         │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│              AFS Core Layer                 │
│  - View resolution                          │
│  - Driver matching & dispatch               │
│  - Async I/O coordination                   │
│  - Metadata management                      │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│          AFSModule Layer                    │
│  - LocalFS (读取源文件)                      │
│  - History                                  │
│  - UserProfileMemory                        │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│             Driver Layer                    │
│  - i18n Driver (处理 language view)          │
│  - Format Driver (未来：处理 format)         │
│  - ... (extensible)                         │
└─────────────────────────────────────────────┘
```

**数据流说明：**
1. Agent 请求读取文件的特定 view（如英文版）
2. AFS Core 解析请求，匹配对应的 driver
3. **先通过 AFSModule 读取源文件内容**（如 LocalFS 读取 `docs/intro.md`）
4. 将源文件内容交给 Driver 处理（如 i18n Driver 进行翻译）
5. Driver 返回处理后的结果给 AFS Core
6. AFS Core 返回最终结果给 Agent

---

## 三、API 设计

### 3.1 扩展 AFS API

```typescript
type View = {
  language?: string;   // 目标语言（V1 实现）
  // format?: string;     // 未来扩展：格式转换
  // policy?: string;     // 未来扩展：风格策略
  // variant?: string;    // 未来扩展：变体
};

type ReadOptions = {
  view?: View;
  wait?: "strict" | "fallback";
};

interface AFS {
  // Read with view support
  read(path: string, opts?: ReadOptions): Promise<{ result?: AFSEntry; message?: string }>;

  // Write - 只支持写入 source，不支持直接写入 view
  // View 是内容的投影，应该由 driver 自动生成，不允许直接修改
  write(
    path: string,
    content: AFSWriteEntryPayload,
    opts?: AFSWriteOptions  // 不包含 view
  ): Promise<{ result: AFSEntry; message?: string }>;

  // Stat with view support
  stat(path: string, opts?: { view?: View }): Promise<{ result?: AFSEntryStat }>;

  // List with view support
  list(
    path: string,
    opts?: AFSListOptions & { view?: View }
  ): Promise<{ list: AFSEntry[]; message?: string }>;

  // Prefetch views for batch generation
  prefetch(
    pathOrGlob: string | string[],
    opts: { view: View }
  ): Promise<void>;
}
```

### 3.2 Wait 策略

```typescript
type WaitStrategy = "strict" | "fallback";
```

- **`strict`**: 严格等待，view 不存在/过期则生成并等待完成
  - 适用场景：必须获取最新翻译才能继续
  - 行为：挂起当前请求，等待生成完成或失败

- **`fallback`**: 降级策略，view 不存在/过期则触发后台生成，立即返回 source
  - 适用场景：允许先使用源语言，后台生成翻译
  - 行为：返回 source + message 提示后台生成中

### 3.3 使用示例

```typescript
// 示例 1: 严格等待翻译
const result = await afs.read("docs/intro.md", {
  view: { language: "en" },
  wait: "strict"
});
// 如果英文版不存在，会触发翻译并等待完成

// 示例 2: 降级策略
const result = await afs.read("docs/intro.md", {
  view: { language: "en" },
  wait: "fallback"
});
// 英文版不存在，返回中文源文件 + 后台生成英文版

// 示例 3: 批量预生成
await afs.prefetch("docs/**/*.md", {
  view: { language: "en" }
});
// 后台批量生成所有 markdown 文件的英文版

// 未来扩展示例：组合 view（language + format）
// const result = await afs.read("docs/intro.md", {
//   view: { language: "en", format: "html" },
//   wait: "strict"
// });
// 注：V1 版本暂不支持组合 view，仅支持 language 维度
```

---

## 四、Driver 设计

### 4.1 Driver 接口

```typescript
interface AFSDriver {
  readonly name: string;
  readonly description?: string;

  // 声明 driver 能处理的 view 维度
  readonly capabilities: {
    dimensions: (keyof View)[];  // e.g., ["language"]
  };

  // 判断是否可以处理指定 view
  canHandle(view: View): boolean;

  // 处理并生成 view 投影
  process(
    module: AFSModule,
    path: string,
    view: View,
    options: {
      sourceEntry: AFSEntry;
      metadata: ViewMetadata;
      context: any;
    }
  ): Promise<{ result: AFSEntry; message?: string }>;

  // 可选：driver 初始化时调用
  onMount?(root: AFSRoot): void;
}
```

### 4.2 i18n Driver 实现

```typescript
export class I18nDriver implements AFSDriver {
  readonly name = "i18n";
  readonly description = "Multilingual translation driver";
  readonly capabilities = {
    dimensions: ["language" as const]
  };

  constructor(private options: {
    defaultSourceLanguage?: string;  // 默认源语言，如 "zh"
    supportedLanguages?: string[];   // 支持的目标语言
    translationAgent?: Agent;        // 自定义翻译 Agent（可选）
    model?: ChatModel;               // LLM 模型（用于默认翻译 Agent）
  } = {}) {
    // 如果没有提供自定义 translationAgent，创建默认的翻译 Agent
    if (!this.translationAgent) {
      this.translationAgent = this.createDefaultTranslationAgent();
    }
  }

  private translationAgent: Agent;

  private createDefaultTranslationAgent(): Agent {
    // 创建内置的默认翻译 Agent
    return AIAgent.from({
      name: "i18n_translator",
      description: "Built-in translation agent for i18n driver",
      model: this.options.model,
      instructions: `You are a professional translator.

Translate the provided content from the source language to the target language.
Maintain the original formatting, structure, and technical terms.
Preserve markdown syntax, code blocks, and special formatting.

Requirements:
- Translate naturally and fluently
- Keep technical terms and proper nouns when appropriate
- Maintain the tone and style of the original content
- Do not add explanations or extra content`,
      inputSchema: z.object({
        content: z.string().describe("Content to translate"),
        targetLanguage: z.string().describe("Target language code (e.g., 'en', 'ja')"),
        sourceLanguage: z.string().optional().describe("Source language code")
      }),
      outputSchema: z.object({
        translatedContent: z.string().describe("Translated content")
      })
    });
  }

  canHandle(view: View): boolean {
    // V1 实现：只处理单纯的 language view
    // 确保只有 language 字段，没有其他 view 维度
    return !!view.language && Object.keys(view).length === 1;
  }

  async process(
    module: AFSModule,
    path: string,
    view: View,
    options: {
      sourceEntry: AFSEntry;
      metadata: ViewMetadata;
      context: any;
    }
  ): Promise<{ result: AFSEntry; message?: string }> {
    const { language } = view;
    const { sourceEntry, context } = options;

    // 调用翻译 Agent
    const translatedContent = await this.translate(
      sourceEntry.content,
      language!,
      context
    );

    // 返回翻译后的 entry
    return {
      result: {
        ...sourceEntry,
        content: translatedContent,
        metadata: {
          ...sourceEntry.metadata,
          view: { language }
        }
      }
    };
  }

  private async translate(
    content: string,
    targetLanguage: string,
    context: any
  ): Promise<string> {
    // 使用 translationAgent 进行翻译（默认或自定义）
    const result = await this.translationAgent.invoke({
      content,
      targetLanguage,
      sourceLanguage: this.options.defaultSourceLanguage
    }, { context });

    return result.translatedContent;
  }
}
```

### 4.3 Driver 注册与匹配

**注册方式（在 AFS 或 AFSModule 配置中）：**

```typescript
import { I18nDriver } from "@aigne/afs-i18n-driver";
import { OpenAIChatModel } from "@aigne/openai";

// 方式 1: 使用默认内置翻译 Agent（推荐）
const afs = new AFS({
  drivers: [
    new I18nDriver({
      defaultSourceLanguage: "zh",
      supportedLanguages: ["en", "ja", "ko"],
      model: new OpenAIChatModel({ apiKey: process.env.OPENAI_API_KEY })
      // 不提供 translationAgent，会自动使用内置的默认翻译 Agent
    })
  ]
});

// 方式 2: 使用自定义翻译 Agent
const customTranslationAgent = AIAgent.from({
  name: "custom_translator",
  instructions: "Custom translation instructions...",
  model: myModel,
  inputSchema: z.object({
    content: z.string(),
    targetLanguage: z.string(),
    sourceLanguage: z.string().optional()
  }),
  outputSchema: z.object({
    translatedContent: z.string()
  })
});

const afs2 = new AFS({
  drivers: [
    new I18nDriver({
      defaultSourceLanguage: "zh",
      supportedLanguages: ["en", "ja", "ko"],
      translationAgent: customTranslationAgent  // 使用自定义 Agent
    })
  ]
});

// 方式 3: 在 module 级别配置 driver（未来支持，当前在 AFS 层配置）
// const localFS = new LocalFS({
//   localPath: "/path/to/docs",
//   drivers: [i18nDriver]
// });
```

**匹配原则：**
1. 对于 `read(path, { view })` 请求，AFS 查找 `canHandle(view)` 返回 true 的 driver
2. 如果多个 driver 都能处理，抛出错误（避免歧义）
3. 如果没有 driver 能处理，返回错误提示

---

## 五、Metadata 设计

### 5.1 Metadata 分层

AFS 维护统一的 metadata，用于 view 状态判断、任务去重、增量更新。

#### Source-level（按 path）

```typescript
interface SourceMetadata {
  path: string;
  sourceRevision: string;    // 主内容版本标识（hash / mtime）
  updatedAt: Date;           // 主内容更新时间
  driversHint?: string[];    // 可选：可能涉及的 driver 名称
}
```

**用途：**
- 主内容变更后，AFS 可据此将相关 view 标记为 stale
- 触发后续生成策略（strict / fallback / prefetch）

#### View-level（按 path + view）

```typescript
type ViewState = "ready" | "stale" | "generating" | "failed";

interface ViewMetadata {
  path: string;
  view: View;                 // 视图键
  state: ViewState;           // 状态
  derivedFrom: string;        // 对应的 sourceRevision
  generatedAt?: Date;         // 生成时间
  error?: string;             // 失败原因（便于诊断与重试）
  storagePath?: string;       // 物理存储路径（如 .i18n/en/...）
}
```

**用途：**
- 快速判断某个 view 是否可用（ready）、是否需要重建（stale / missing）、是否正在生成（generating）
- (path, view) 维度的 job 去重与等待队列管理

### 5.2 Metadata 存储方案

采用**独立 Metadata Store**（SQLite 数据库），与 AFSHistory 类似的存储机制。

#### 数据库 Schema

```sql
-- Source metadata table
CREATE TABLE source_metadata (
  path TEXT PRIMARY KEY,
  source_revision TEXT NOT NULL,
  updated_at INTEGER NOT NULL,  -- Unix timestamp (ms)
  drivers_hint TEXT,            -- JSON array, e.g., '["i18n"]'
  created_at INTEGER NOT NULL   -- Unix timestamp (ms)
);

-- View metadata table
CREATE TABLE view_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  view TEXT NOT NULL,           -- JSON stringified View, e.g., '{"language":"en"}'
  state TEXT NOT NULL,          -- 'ready' | 'stale' | 'generating' | 'failed'
  derived_from TEXT NOT NULL,   -- sourceRevision at generation time
  generated_at INTEGER,         -- Unix timestamp (ms)
  error TEXT,                   -- Error message if state = 'failed'
  storage_path TEXT,            -- Physical storage path, e.g., 'docs/.i18n/en/intro.md'
  created_at INTEGER NOT NULL,  -- Unix timestamp (ms)
  updated_at INTEGER NOT NULL,  -- Unix timestamp (ms)
  UNIQUE(path, view)
);

CREATE INDEX idx_view_path ON view_metadata(path);
CREATE INDEX idx_view_state ON view_metadata(state);
CREATE INDEX idx_view_derived_from ON view_metadata(derived_from);
```

#### TypeScript 接口

```typescript
// Metadata Store 接口
interface MetadataStore {
  // Source metadata operations
  getSourceMetadata(path: string): Promise<SourceMetadata | null>;
  setSourceMetadata(path: string, metadata: Omit<SourceMetadata, 'path'>): Promise<void>;
  deleteSourceMetadata(path: string): Promise<void>;

  // View metadata operations
  getViewMetadata(path: string, view: View): Promise<ViewMetadata | null>;
  setViewMetadata(path: string, view: View, metadata: Partial<ViewMetadata>): Promise<void>;
  listViewMetadata(path: string): Promise<ViewMetadata[]>;
  deleteViewMetadata(path: string, view?: View): Promise<void>;

  // Batch operations
  markViewsAsStale(path: string): Promise<void>;
  listStaleViews(): Promise<ViewMetadata[]>;
  listGeneratingViews(): Promise<ViewMetadata[]>;
}

// 实现类
class SQLiteMetadataStore implements MetadataStore {
  constructor(private db: Database) {}

  async getSourceMetadata(path: string): Promise<SourceMetadata | null> {
    const row = await this.db.get(
      'SELECT * FROM source_metadata WHERE path = ?',
      path
    );
    if (!row) return null;

    return {
      path: row.path,
      sourceRevision: row.source_revision,
      updatedAt: new Date(row.updated_at),
      driversHint: row.drivers_hint ? JSON.parse(row.drivers_hint) : undefined
    };
  }

  async setSourceMetadata(
    path: string,
    metadata: Omit<SourceMetadata, 'path'>
  ): Promise<void> {
    const now = Date.now();
    await this.db.run(
      `INSERT OR REPLACE INTO source_metadata
       (path, source_revision, updated_at, drivers_hint, created_at)
       VALUES (?, ?, ?, ?, COALESCE(
         (SELECT created_at FROM source_metadata WHERE path = ?), ?
       ))`,
      path,
      metadata.sourceRevision,
      metadata.updatedAt.getTime(),
      metadata.driversHint ? JSON.stringify(metadata.driversHint) : null,
      path,
      now
    );
  }

  async getViewMetadata(path: string, view: View): Promise<ViewMetadata | null> {
    const viewKey = JSON.stringify(view);
    const row = await this.db.get(
      'SELECT * FROM view_metadata WHERE path = ? AND view = ?',
      path,
      viewKey
    );
    if (!row) return null;

    return {
      path: row.path,
      view: JSON.parse(row.view),
      state: row.state as ViewState,
      derivedFrom: row.derived_from,
      generatedAt: row.generated_at ? new Date(row.generated_at) : undefined,
      error: row.error || undefined,
      storagePath: row.storage_path || undefined
    };
  }

  async setViewMetadata(
    path: string,
    view: View,
    metadata: Partial<ViewMetadata>
  ): Promise<void> {
    const viewKey = JSON.stringify(view);
    const now = Date.now();

    // 获取现有记录
    const existing = await this.getViewMetadata(path, view);

    const merged = {
      state: metadata.state || existing?.state || 'stale',
      derivedFrom: metadata.derivedFrom || existing?.derivedFrom || '',
      generatedAt: metadata.generatedAt?.getTime() || existing?.generatedAt?.getTime(),
      error: metadata.error || existing?.error,
      storagePath: metadata.storagePath || existing?.storagePath
    };

    await this.db.run(
      `INSERT OR REPLACE INTO view_metadata
       (path, view, state, derived_from, generated_at, error, storage_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(
         (SELECT created_at FROM view_metadata WHERE path = ? AND view = ?), ?
       ), ?)`,
      path,
      viewKey,
      merged.state,
      merged.derivedFrom,
      merged.generatedAt || null,
      merged.error || null,
      merged.storagePath || null,
      path,
      viewKey,
      now,
      now
    );
  }

  async markViewsAsStale(path: string): Promise<void> {
    await this.db.run(
      `UPDATE view_metadata
       SET state = 'stale', updated_at = ?
       WHERE path = ? AND state IN ('ready', 'generating')`,
      Date.now(),
      path
    );
  }

  async listViewMetadata(path: string): Promise<ViewMetadata[]> {
    const rows = await this.db.all(
      'SELECT * FROM view_metadata WHERE path = ?',
      path
    );

    return rows.map(row => ({
      path: row.path,
      view: JSON.parse(row.view),
      state: row.state as ViewState,
      derivedFrom: row.derived_from,
      generatedAt: row.generated_at ? new Date(row.generated_at) : undefined,
      error: row.error || undefined,
      storagePath: row.storage_path || undefined
    }));
  }

  async deleteViewMetadata(path: string, view?: View): Promise<void> {
    if (view) {
      const viewKey = JSON.stringify(view);
      await this.db.run(
        'DELETE FROM view_metadata WHERE path = ? AND view = ?',
        path,
        viewKey
      );
    } else {
      // 删除该 path 的所有 view metadata
      await this.db.run('DELETE FROM view_metadata WHERE path = ?', path);
    }
  }

  async listStaleViews(): Promise<ViewMetadata[]> {
    const rows = await this.db.all(
      "SELECT * FROM view_metadata WHERE state = 'stale'"
    );

    return rows.map(row => ({
      path: row.path,
      view: JSON.parse(row.view),
      state: row.state as ViewState,
      derivedFrom: row.derived_from,
      generatedAt: row.generated_at ? new Date(row.generated_at) : undefined,
      error: row.error || undefined,
      storagePath: row.storage_path || undefined
    }));
  }

  async listGeneratingViews(): Promise<ViewMetadata[]> {
    const rows = await this.db.all(
      "SELECT * FROM view_metadata WHERE state = 'generating'"
    );

    return rows.map(row => ({
      path: row.path,
      view: JSON.parse(row.view),
      state: row.state as ViewState,
      derivedFrom: row.derived_from,
      generatedAt: row.generated_at ? new Date(row.generated_at) : undefined,
      error: row.error || undefined,
      storagePath: row.storage_path || undefined
    }));
  }
}
```

### 5.3 Metadata 生成机制

#### 5.3.1 Source Metadata 生成

**触发时机：**
1. `write()` 操作写入文件后
2. 首次 `read()` 一个文件时（如果 source metadata 不存在）

**生成流程：**

```typescript
async writeSource(path: string, content: AFSWriteEntryPayload): Promise<AFSEntry> {
  // 1. 写入文件到 module
  const result = await this.module.write(path, content);

  // 2. 计算 sourceRevision
  const sourceRevision = this.computeRevision(result);

  // 3. 保存 source metadata
  await this.metadataStore.setSourceMetadata(path, {
    sourceRevision,
    updatedAt: new Date(),
    driversHint: this.getApplicableDrivers(path)
  });

  // 4. 标记所有相关 view 为 stale
  await this.metadataStore.markViewsAsStale(path);

  return result;
}

private computeRevision(entry: AFSEntry): string {
  if (typeof entry.content === 'string') {
    // 对文本内容计算 SHA-256 hash
    const hash = crypto.createHash('sha256')
      .update(entry.content)
      .digest('hex')
      .substring(0, 16);
    return `hash:sha256:${hash}`;
  }

  // 对二进制文件使用 mtime + size
  const mtime = entry.updatedAt?.getTime() || Date.now();
  const size = entry.metadata?.size || 0;
  return `mtime:${mtime}:size:${size}`;
}

private getApplicableDrivers(path: string): string[] {
  // 返回可能处理该文件的 driver 名称列表
  // 用于优化：只需检查相关 driver 的 view
  return this.drivers.map(d => d.name);
}
```

#### 5.3.2 View Metadata 生成（V1 简化版）

**触发时机：**
1. `read(path, { view })` 时，如果 view metadata 不存在或过期
2. Driver 处理完成后更新状态

**生成流程（V1 - 无 job 去重）：**

```typescript
async processView(path: string, view: View): Promise<AFSEntry> {
  try {
    // 1. 获取或创建 source metadata
    let sourceMeta = await this.metadataStore.getSourceMetadata(path);
    if (!sourceMeta) {
      const sourceEntry = await this.readSource(path);
      const sourceRevision = this.computeRevision(sourceEntry);
      await this.metadataStore.setSourceMetadata(path, {
        sourceRevision,
        updatedAt: new Date()
      });
      sourceMeta = await this.metadataStore.getSourceMetadata(path);
    }

    // 2. 标记为 generating
    await this.metadataStore.setViewMetadata(path, view, {
      state: 'generating',
      derivedFrom: sourceMeta!.sourceRevision
    });

    // 3. 读取 source
    const sourceEntry = await this.readSource(path);

    // 4. 查找并调用 driver
    const driver = this.findDriver(view);
    if (!driver) {
      throw new Error(`No driver found for view: ${JSON.stringify(view)}`);
    }

    const result = await driver.process(this.module, path, view, {
      sourceEntry,
      metadata: { derivedFrom: sourceMeta!.sourceRevision },
      context: this.context
    });

    // 5. 更新为 ready
    await this.metadataStore.setViewMetadata(path, view, {
      state: 'ready',
      generatedAt: new Date(),
      storagePath: result.result.metadata?.storagePath,
      error: undefined
    });

    return result.result;

  } catch (error) {
    // 6. 处理失败，标记为 failed
    await this.metadataStore.setViewMetadata(path, view, {
      state: 'failed',
      error: error.message
    });
    throw error;
  }
}
```

**V1 说明：**
- 直接执行处理，不检查并发
- 如果多个请求同时触发同一个 view，会重复处理
- V2 将增加 job 去重机制避免重复处理

### 5.4 Metadata 更新机制

#### 5.4.1 Source 更新时

```typescript
async write(path: string, content: AFSWriteEntryPayload): Promise<AFSEntry> {
  const oldSourceMeta = await this.metadataStore.getSourceMetadata(path);

  // 写入新内容
  const result = await this.writeSource(path, content);
  const newRevision = this.computeRevision(result);

  // 检查 revision 是否变化
  if (oldSourceMeta?.sourceRevision !== newRevision) {
    // 更新 source metadata
    await this.metadataStore.setSourceMetadata(path, {
      sourceRevision: newRevision,
      updatedAt: new Date()
    });

    // 标记所有 view 为 stale
    await this.metadataStore.markViewsAsStale(path);
  }

  return result;
}
```

#### 5.4.2 View 过期检测

```typescript
async isViewStale(path: string, view: View): Promise<boolean> {
  const viewMeta = await this.metadataStore.getViewMetadata(path, view);
  if (!viewMeta) return true; // 不存在视为过期

  if (viewMeta.state === 'stale' || viewMeta.state === 'failed') {
    return true;
  }

  if (viewMeta.state === 'generating') {
    return false; // 正在生成，不算过期
  }

  // 检查 derivedFrom 是否匹配当前 sourceRevision
  const sourceMeta = await this.metadataStore.getSourceMetadata(path);
  if (!sourceMeta) return true;

  return viewMeta.derivedFrom !== sourceMeta.sourceRevision;
}
```

### 5.5 Metadata 使用机制

#### 5.5.1 Read 时使用 Metadata

```typescript
async read(path: string, opts?: ReadOptions): Promise<{ result?: AFSEntry; message?: string }> {
  // 无 view，直接读取 source
  if (!opts?.view) {
    return this.readSource(path);
  }

  // 1. 查询 view metadata
  const viewMeta = await this.metadataStore.getViewMetadata(path, opts.view);
  const isStale = await this.isViewStale(path, opts.view);

  // 2. 如果 view 是 ready 且未过期，直接返回
  if (viewMeta?.state === 'ready' && !isStale) {
    return this.readViewResult(viewMeta);
  }

  // 3. 如果正在生成
  if (viewMeta?.state === 'generating') {
    if (opts.wait === 'strict') {
      return this.waitForProcess(path, opts.view);
    } else {
      // fallback: 返回 source
      return this.readSourceWithMessage(path, 'View is being processed');
    }
  }

  // 4. 需要生成 view
  if (opts.wait === 'strict') {
    // 等待生成完成
    const result = await this.processView(path, opts.view);
    return { result };
  } else {
    // 后台生成，立即返回 source
    this.processViewInBackground(path, opts.view);
    return this.readSourceWithMessage(path, 'View is being processed in background');
  }
}
```

#### 5.5.2 Prefetch 使用 Metadata

```typescript
async prefetch(pathOrGlob: string | string[], opts: { view: View }): Promise<void> {
  const paths = Array.isArray(pathOrGlob) ? pathOrGlob : await this.glob(pathOrGlob);

  // 批量检查哪些需要生成
  const tasksToGenerate: Array<{ path: string; view: View }> = [];

  for (const path of paths) {
    const isStale = await this.isViewStale(path, opts.view);
    const viewMeta = await this.metadataStore.getViewMetadata(path, opts.view);

    // 只有 stale/failed/missing 才需要生成
    if (isStale || !viewMeta || viewMeta.state !== 'ready') {
      tasksToGenerate.push({ path, view: opts.view });
    }
  }

  // 并发生成（限制并发数）
  const concurrency = 5;
  const batches = chunk(tasksToGenerate, concurrency);

  for (const batch of batches) {
    await Promise.all(
      batch.map(({ path, view }) => this.processView(path, view))
    );
  }
}
```

### 5.6 Metadata 清理机制

```typescript
// 清理孤立的 view metadata（source 已删除）
async cleanupOrphanedViewMetadata(): Promise<void> {
  const allViewMeta = await this.db.all('SELECT DISTINCT path FROM view_metadata');

  for (const row of allViewMeta) {
    const sourceMeta = await this.metadataStore.getSourceMetadata(row.path);
    if (!sourceMeta) {
      // Source 已删除，清理所有相关 view metadata
      await this.metadataStore.deleteViewMetadata(row.path);
    }
  }
}

// 清理失败的 view metadata（可选，允许重试）
async cleanupFailedViews(olderThan?: Date): Promise<void> {
  const cutoff = olderThan || new Date(Date.now() - 24 * 60 * 60 * 1000); // 默认 24 小时

  await this.db.run(
    `DELETE FROM view_metadata
     WHERE state = 'failed' AND updated_at < ?`,
    cutoff.getTime()
  );
}
```

---

## 六、View 生成流程

### 6.1 Read 流程（with view）- V1 简化版

**V1 实现说明：**
- 暂不实现 job 去重和等待队列机制
- 直接触发 driver 处理，等待完成后返回
- V2 将增加并发控制和任务队列优化

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Agent 调用 afs.read(path, { view, wait })                │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AFS Core: 查询 view metadata                             │
│    - 如果 state = "ready" && !stale → 返回 view 结果        │
│    - 如果 state = "stale" / missing → 需要生成              │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Driver Matching: 查找 canHandle(view) 的 driver          │
│    - 如果找到唯一 driver → 进入处理流程                     │
│    - 如果找不到 / 多个 driver → 返回错误                    │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. 触发处理：标记 state = "generating"                      │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Driver.process(): 读取 source，调用处理逻辑              │
│    - 成功 → 写入 view 结果，更新 metadata state = "ready"   │
│    - 失败 → 更新 metadata state = "failed", error = ...     │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. 返回处理结果或错误                                       │
└─────────────────────────────────────────────────────────────┘
```

**V2 优化方向（未来）：**
- 增加 job 去重：多个并发请求同一个 view 时，复用同一个处理任务
- 增加等待队列：正在处理时新请求加入队列等待
- 增加超时机制：处理超时后标记失败并清理

### 6.2 Wait 策略实现（V1 简化版）

**strict 模式（默认）：**
- 等待 view 处理完成再返回
- 适用场景：必须获取翻译结果才能继续

```typescript
async read(path: string, opts?: ReadOptions): Promise<{ result?: AFSEntry; message?: string }> {
  // 无 view，直接读取 source
  if (!opts?.view) {
    return this.readSource(path);
  }

  // 1. 查询 view metadata
  const viewMeta = await this.metadataStore.getViewMetadata(path, opts.view);
  const isStale = await this.isViewStale(path, opts.view);

  // 2. 如果 view 是 ready 且未过期，直接返回
  if (viewMeta?.state === 'ready' && !isStale) {
    return this.readViewResult(viewMeta);
  }

  // 3. 需要生成 view（V1: 直接等待，不检查 generating 状态）
  if (opts.wait === 'strict' || !opts.wait) {
    // 触发处理并等待完成
    const result = await this.processView(path, opts.view);
    return { result };
  } else {
    // fallback 模式
    return this.readSourceAndProcessInBackground(path, opts.view);
  }
}
```

**fallback 模式：**
- 立即返回 source，后台处理 view
- 适用场景：允许先使用原文，翻译在后台进行

```typescript
async readSourceAndProcessInBackground(
  path: string,
  view: View
): Promise<{ result?: AFSEntry; message?: string }> {
  // 触发后台处理（fire and forget）
  this.processView(path, view).catch(error => {
    console.error(`Background view processing failed for ${path}:`, error);
  });

  // 立即返回 source
  const source = await this.readSource(path);
  return {
    result: source,
    message: `View (${JSON.stringify(view)}) is being processed in background`
  };
}
```

**processView 简化实现（V1）：**

```typescript
async processView(path: string, view: View): Promise<AFSEntry> {
  try {
    // 1. 获取 source metadata
    let sourceMeta = await this.metadataStore.getSourceMetadata(path);

    // 如果不存在，创建 source metadata
    if (!sourceMeta) {
      const sourceEntry = await this.readSource(path);
      const sourceRevision = this.computeRevision(sourceEntry);
      await this.metadataStore.setSourceMetadata(path, {
        sourceRevision,
        updatedAt: new Date()
      });
      sourceMeta = await this.metadataStore.getSourceMetadata(path);
    }

    // 2. 标记为 generating
    await this.metadataStore.setViewMetadata(path, view, {
      state: 'generating',
      derivedFrom: sourceMeta!.sourceRevision
    });

    // 3. 读取 source
    const sourceEntry = await this.readSource(path);

    // 4. 查找 driver
    const driver = this.findDriver(view);
    if (!driver) {
      throw new Error(`No driver found for view: ${JSON.stringify(view)}`);
    }

    // 5. 调用 driver 处理
    const result = await driver.process(this.module, path, view, {
      sourceEntry,
      metadata: { derivedFrom: sourceMeta!.sourceRevision },
      context: this.context
    });

    // 6. 更新为 ready
    await this.metadataStore.setViewMetadata(path, view, {
      state: 'ready',
      generatedAt: new Date(),
      storagePath: result.result.metadata?.storagePath,
      error: undefined
    });

    return result.result;

  } catch (error) {
    // 7. 处理失败，标记为 failed
    await this.metadataStore.setViewMetadata(path, view, {
      state: 'failed',
      error: error.message
    });
    throw error;
  }
}
```

**V1 vs V2 对比：**

| 特性 | V1 实现 | V2 优化 |
|------|---------|---------|
| 并发请求同一 view | 每次都触发新的处理 | Job 去重，复用同一任务 |
| generating 状态处理 | 直接覆盖并重新处理 | 等待队列，复用正在处理的任务 |
| 超时控制 | 依赖 driver 本身超时 | 框架级超时控制 |
| 复杂度 | 简单，易于实现 | 需要任务队列和状态同步 |

### 6.3 Source 更新触发 View 失效

```typescript
async write(path: string, content: AFSWriteEntryPayload, opts?: AFSWriteOptions) {
  // 写入 source（write 不支持 view 参数）
  const result = await this.writeSource(path, content, opts);

  // 计算新的 sourceRevision
  const newRevision = this.computeRevision(result.result);

  // 更新 source metadata
  await this.updateSourceMetadata(path, {
    sourceRevision: newRevision,
    updatedAt: new Date()
  });

  // 标记所有相关 view 为 stale
  // 下次 read 时会检测到过期并触发重新生成
  await this.markViewsAsStale(path);

  return result;
}
```

**设计说明：**
- `write` 操作只能修改 source 文件，不支持直接写入 view
- View 是 source 的投影，应该由 driver 自动生成
- 当 source 更新时，所有相关的 view 会被标记为 stale
- 后续 `read` 请求会检测到 view 过期，根据 wait 策略重新生成

---

## 七、物理存储方案

### 7.1 文件落盘约定（LocalFS + i18n driver）

以 DocSmith workspace 为例：

```
.aigne/doc-smith/
  docs/                        # 主语言内容（source of truth）
    intro.md
    guide.md
  docs/.i18n/                  # 多语言派生版本（进 Git）
    en/
      intro.md
      guide.md
    ja/
      intro.md
  .afs/                        # AFS 元数据目录（进 Git）
    metadata.db                # SQLite 数据库存储 metadata
  intent/                      # 用户 intent / lexicon / rules
```

**说明：**
- `docs/` 是 source 目录，包含主语言（如中文）内容
- `docs/.i18n/{lang}/` 存储翻译后的各语言版本
- `.afs/metadata.db` 使用 SQLite 存储 source 和 view metadata
- 对上层 API 始终使用：`afs.read('docs/intro.md', { view: { language: 'en' } })`
- 应用层不需要知道 `.i18n` 目录和 metadata 存储的存在

**Metadata 存储位置：**
- 数据库路径：`.afs/metadata.db`（相对于 workspace 根目录）
- 与 AFSHistory 类似，使用 SQLite 持久化存储
- 进 Git 管理，团队共享 metadata 状态
- Schema 见第五章 5.2 节

### 7.2 StoragePath 映射

Driver 负责将逻辑 view 映射到物理存储路径：

```typescript
class I18nDriver implements AFSDriver {
  getStoragePath(path: string, view: View): string {
    const { language } = view;
    const dir = dirname(path);
    const filename = basename(path);
    return join(dir, ".i18n", language, filename);
  }

  async process(module, path, view, options) {
    const storagePath = this.getStoragePath(path, view);

    // 翻译内容
    const translatedContent = await this.translate(...);

    // 写入物理路径
    await module.write(storagePath, { content: translatedContent });

    // 更新 metadata
    await this.updateViewMetadata(path, view, {
      state: "ready",
      storagePath,
      derivedFrom: options.metadata.sourceRevision,
      generatedAt: new Date()
    });

    return { result: { path, content: translatedContent } };
  }
}
```

---

## 八、Skill 层集成

### 8.1 动态 Schema 组装

基于配置的 drivers 动态组装 view schema，各 skill 独立调用公共方法，易于扩展。

#### 8.1.1 公共方法：buildViewSchema

在 `afs/core/src/view-schema.ts` 中提供统一的 schema 构建方法：

```typescript
import { z } from 'zod';
import type { AFSDriver } from './type';

/**
 * 根据已注册的 drivers 动态构建 view schema
 *
 * @param drivers - 已注册的 driver 列表
 * @returns Zod schema object，如果没有 driver 支持 view 则返回 undefined
 */
export function buildViewSchema(drivers: AFSDriver[]): z.ZodObject<any> | undefined {
  if (!drivers || drivers.length === 0) {
    return undefined;
  }

  // 收集所有 driver 支持的 view dimensions
  const supportedDimensions = new Set<keyof View>();

  drivers.forEach(driver => {
    driver.capabilities.dimensions.forEach(dim => {
      supportedDimensions.add(dim);
    });
  });

  if (supportedDimensions.size === 0) {
    return undefined;
  }

  // 动态构建 view schema object
  const viewSchemaFields: Record<string, z.ZodOptional<z.ZodString>> = {};

  if (supportedDimensions.has('language')) {
    viewSchemaFields.language = z.string().optional()
      .describe("Target language for translation (e.g., 'en', 'zh', 'ja')");
  }

  if (supportedDimensions.has('format')) {
    viewSchemaFields.format = z.string().optional()
      .describe("Target format conversion (e.g., 'md', 'html', 'pdf')");
  }

  if (supportedDimensions.has('policy')) {
    viewSchemaFields.policy = z.string().optional()
      .describe("Content style policy (e.g., 'technical', 'marketing')");
  }

  if (supportedDimensions.has('variant')) {
    viewSchemaFields.variant = z.string().optional()
      .describe("Content variant (e.g., 'summary', 'toc', 'index')");
  }

  return z.object(viewSchemaFields);
}

/**
 * 为支持 view 的操作构建完整的 input schema
 *
 * @param baseSchema - 基础 schema（不含 view）
 * @param drivers - 已注册的 driver 列表
 * @returns 扩展后的 schema（如果有 driver 则包含 view 字段）
 */
export function extendSchemaWithView<T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  drivers: AFSDriver[]
): z.ZodObject<any> {
  const viewSchema = buildViewSchema(drivers);

  if (!viewSchema) {
    return baseSchema;
  }

  return baseSchema.extend({
    view: viewSchema.optional().describe("View projection options")
  });
}
```

#### 8.1.2 Skill 中使用

各 skill 在构造时调用公共方法动态扩展 schema：

```typescript
// packages/core/src/prompt/skills/afs/read.ts
import { extendSchemaWithView } from '@aigne/afs-core/view-schema';

export class AFSReadAgent extends Agent<AFSReadInput, AFSReadOutput> {
  constructor(options: AFSReadAgentOptions) {
    // 定义基础 schema（不含 view）
    const baseSchema = z.object({
      path: z.string().describe("Absolute file path to read"),
      withLineNumbers: z.boolean().optional()
    });

    // 根据 AFS 配置的 drivers 动态扩展 schema
    let inputSchema = extendSchemaWithView(baseSchema, options.afs.drivers);

    // 如果有 driver 支持 view，则添加 wait 策略字段
    if (options.afs.drivers && options.afs.drivers.length > 0) {
      inputSchema = inputSchema.extend({
        wait: z.enum(["strict", "fallback"]).optional()
          .describe("Wait strategy: 'strict' (wait for view, default) or 'fallback' (return source immediately)")
      });
    }

    super({
      name: "afs_read",
      description: "Read complete file contents with optional view projection",
      inputSchema,
      outputSchema: z.object({
        content: z.string(),
        metadata: z.record(z.any()).optional()
      }),
      ...options,
    });
  }

  async run(input: AFSReadInput): Promise<AFSReadOutput> {
    const result = await this.afs.read(input.path, {
      view: input.view,  // 如果没有 driver，这个字段不会出现在 schema 中
      wait: input.wait,  // 如果没有 driver，这个字段不会出现在 schema 中
      withLineNumbers: input.withLineNumbers
    });

    return {
      content: result.result?.content || '',
      metadata: result.result?.metadata
    };
  }
}
```

```typescript
// packages/core/src/prompt/skills/afs/list.ts
export class AFSListAgent extends Agent<AFSListInput, AFSListOutput> {
  constructor(options: AFSListAgentOptions) {
    const baseSchema = z.object({
      path: z.string().describe("Directory path to list"),
      recursive: z.boolean().optional()
    });

    // 使用同样的公共方法扩展 schema
    const inputSchema = extendSchemaWithView(baseSchema, options.afs.drivers);

    super({
      name: "afs_list",
      description: "List files and directories with optional view filtering",
      inputSchema,
      // ...
    });
  }
}
```

```typescript
// packages/core/src/prompt/skills/afs/stat.ts
export class AFSStatAgent extends Agent<AFSStatInput, AFSStatOutput> {
  constructor(options: AFSStatAgentOptions) {
    const baseSchema = z.object({
      path: z.string().describe("File or directory path to stat")
    });

    // stat 也支持 view 查询
    const inputSchema = extendSchemaWithView(baseSchema, options.afs.drivers);

    super({
      name: "afs_stat",
      description: "Get file or directory metadata with optional view status",
      inputSchema,
      // ...
    });
  }
}
```

```typescript
// packages/core/src/prompt/skills/afs/write.ts
export class AFSWriteAgent extends Agent<AFSWriteInput, AFSWriteOutput> {
  constructor(options: AFSWriteAgentOptions) {
    // write 不支持 view，使用基础 schema 即可，不调用 extendSchemaWithView
    const inputSchema = z.object({
      path: z.string().describe("File path to write"),
      content: z.string().describe("Content to write")
    });

    super({
      name: "afs_write",
      description: "Write content to file (source only, views are auto-generated)",
      inputSchema,
      // ...
    });
  }
}
```

#### 8.1.3 getAFSSkills 保持简洁

```typescript
// packages/core/src/prompt/skills/afs/index.ts
export async function getAFSSkills(afs: AFS): Promise<Agent[]> {
  // 不需要检查 driver，各 skill 内部会根据 afs.drivers 动态处理
  return [
    new AFSListAgent({ afs }),
    new AFSSearchAgent({ afs }),
    new AFSReadAgent({ afs }),
    new AFSStatAgent({ afs }),
    new AFSWriteAgent({ afs }),
    // ...
  ];
}
```

**设计优势：**
1. **易于扩展**：新增 driver 只需在 `capabilities.dimensions` 中声明，schema 自动更新
2. **统一管理**：所有 view schema 逻辑集中在 `buildViewSchema`，避免重复代码
3. **按需支持**：各 skill 根据自身需求决定是否调用 `extendSchemaWithView`
4. **类型安全**：基于已注册的 driver 动态生成 schema，LLM 只会看到真正支持的字段
5. **V1 → V2 平滑过渡**：当添加新的 view dimension 时，无需修改 skill 代码

---

## 九、实施计划

### Phase 1: 基础架构（AFS Core） ✅ 已完成

**目标：** 在 `afs/core` 中建立 view 和 driver 机制

**完成日期：** 2024-12-16

**任务：**
1. [x] 扩展 `afs/core/src/type.ts`：
   - ✅ 定义 `View` 类型（V1 实现 `language`，预留 format/policy/variant）
   - ✅ 定义 `AFSDriver` 接口（canHandle, process, capabilities, onMount）
   - ✅ 扩展 `ReadOptions` 支持 view 和 wait 策略
   - ✅ 定义 `WaitStrategy` 类型（strict/fallback）

2. [x] 扩展 `afs/core/src/afs.ts`：
   - ✅ 增加 `drivers` 字段和注册机制
   - ✅ 实现 `read` 支持 view 参数（`write` 不支持 view）
   - ✅ 实现 driver 匹配逻辑
   - ✅ 实现 `prefetch` API（支持并发控制）
   - ✅ Driver onMount 生命周期
   - ✅ Write/delete 自动更新 metadata

3. [x] 创建 `afs/core/src/metadata/`：
   - ✅ `metadata/type.ts`: 定义 `SourceMetadata`, `ViewMetadata`, `MetadataStore` 接口
   - ✅ `metadata/store.ts`: 使用 **drizzle-orm** 实现 `SQLiteMetadataStore` 类
   - ✅ `metadata/models/`: drizzle schema 定义（source-metadata, view-metadata）
   - ✅ `metadata/migrations/001-init.ts`: 创建 source_metadata 和 view_metadata 表
   - ✅ `metadata/index.ts`: 导出所有接口和实现

4. [x] Metadata Store 核心功能：
   - ✅ `getSourceMetadata()`: 查询 source metadata
   - ✅ `setSourceMetadata()`: 更新/创建 source metadata（使用 drizzle update/insert）
   - ✅ `getViewMetadata()`: 查询 view metadata
   - ✅ `setViewMetadata()`: 更新/创建 view metadata（支持部分更新）
   - ✅ `markViewsAsStale()`: 批量标记 view 为 stale
   - ✅ `listViewMetadata()`: 列出某个 path 的所有 view
   - ✅ `cleanupOrphanedViewMetadata()`: 清理孤立的 view metadata
   - ✅ 使用 drizzle query builder 替代手写 SQL

5. [x] 创建 `afs/core/src/view-processor.ts`（V1 简化版）：
   - ✅ 实现 `processView()`: 异步处理 view 生成（无 job 去重）
   - ✅ 实现 `isViewStale()`: 检查 view 是否过期
   - ✅ 实现 `computeRevision()`: 计算 sourceRevision（hash:sha256 / mtime:size）
   - ✅ 实现 `readViewResult()`: 从 storagePath 读取 view 结果
   - ✅ 实现 strict / fallback 策略
   - ✅ 实现 `prefetch()`: 批量生成（使用 **p-limit** 控制并发）
   - ⚠️ **V1 暂不实现：** job 去重、等待队列（留待 V2）

6. [x] 创建 `afs/core/src/view-schema.ts`：
   - ✅ 实现 `buildViewSchema()`: 根据 drivers 动态构建 view schema
   - ✅ 实现 `extendSchemaWithView()`: 为基础 schema 扩展 view 字段
   - ✅ 支持所有 view dimensions（language, format, policy, variant）
   - ✅ **注意：** 这是 AFS Core 的基础功能，供 Skill 层使用

7. [x] 扩展 `afs/core/src/afs.ts` 集成 Metadata：
   - ✅ 在 constructor 中初始化 MetadataStore（数据库路径：`.afs/metadata.db`）
   - ✅ 配置项：`storage.url`（可选，默认 `.afs`）
   - ✅ `read()` 中使用 metadata 判断 view 状态
   - ✅ `write()` 中更新 source metadata 并标记 view 为 stale
   - ✅ `delete()` 中清理相关 metadata
   - ✅ Driver onMount 生命周期

8. [x] AFS 配置扩展：
   - ✅ 增加 `AFSOptions.storage.url` 配置项
   - ✅ 默认值：`.afs`（相对于 workspace 根目录）
   - ✅ metadata.db 存放在 `{storage.url}/metadata.db`

9. [x] 单元测试（`afs/core/test/view-driver.test.ts`）：
   - ✅ MockI18nDriver 翻译驱动
   - ✅ 多语言 view 读取测试
   - ✅ View 缓存机制测试
   - ✅ Source 变更后 view 失效测试
   - ✅ Fallback 模式测试
   - ✅ Prefetch 批量生成测试
   - ✅ **测试结果:** 5 个测试全部通过 ✅

**输出：**
- ✅ `@aigne/afs` Phase 1 完成
- ✅ 向后兼容：不传 view 时行为与当前一致
- ✅ TypeScript 编译通过
- ✅ Biome lint 检查通过
- ✅ 所有单元测试通过

**实现亮点：**
1. **Drizzle ORM 集成** - 使用 schema 定义和 query builder API，类型安全
2. **并发控制优化** - 使用 `p-limit` 管理 prefetch 并发（可配置并发数）
3. **严格的类型检查** - 移除所有非空断言，通过所有 lint 检查
4. **完整的测试覆盖** - 5 个核心场景，20 个断言

---

### Phase 2: i18n Driver 实现 ✅ 已完成

**目标：** 实现第一个 driver：i18n driver

**完成日期：** 2024-12-16

**任务：**
1. [x] 创建 `afs/i18n-driver/` 包：
   - ✅ `src/index.ts`: 导出所有公共 API
   - ✅ `src/driver.ts`: 实现 `I18nDriver` 类
   - ✅ `src/default-translation-agent.ts`: 实现内置默认翻译 Agent
   - ✅ `src/storage.ts`: 实现 `/.i18n/{lang}/path` 物理路径映射

2. [x] 配置选项设计：
   - ✅ `context`: AIGNE Context（必需，用于调用翻译 Agent）
   - ✅ `defaultSourceLanguage`: 默认源语言（可选，如 "zh"）
   - ✅ `supportedLanguages`: 支持的目标语言列表（可选）
   - ✅ `translationAgent`: 自定义翻译 Agent（可选，不提供则使用内置默认）
   - ✅ `storagePath`: 物理存储路径模板（可选，默认 `.i18n/{language}`）
   - ⚠️ 删除 `model` 配置：通过 context 自动获取外层 model

3. [x] 默认翻译 Agent 实现：
   - ✅ 使用 AIAgent.from 创建
   - ✅ 支持多语言翻译，保持格式和技术术语
   - ✅ 输入：content, targetLanguage, sourceLanguage
   - ✅ 输出：translatedContent
   - ✅ 独立文件，方便后续优化

4. [x] 测试：
   - ✅ 单元测试：getStoragePath 路径映射
   - ✅ 单元测试：canHandle view 匹配
   - ✅ 单元测试：supportedLanguages 过滤
   - ✅ 集成测试：I18nDriver 翻译流程
   - ✅ 集成测试：与 AFS 集成
   - ✅ **测试结果:** 7 个测试全部通过 ✅

**输出：**
- ✅ `@aigne/afs-i18n-driver` v0.0.1
- ✅ TypeScript 编译通过
- ✅ Biome lint 检查通过
- ✅ 所有单元测试通过

**实现亮点：**
1. **Context 驱动** - 通过 `context.newContext({ reset: true }).invoke()` 调用翻译 Agent
2. **路径映射简化** - `/.i18n/{lang}/` 前缀直接添加到原路径，保留完整目录结构
3. **模块化设计** - 默认翻译 Agent 独立文件，支持自定义替换
4. **完整的类型导出** - 导出 schema、类型、创建函数，便于扩展

**文件结构：**
```
afs/i18n-driver/
├── package.json
├── tsconfig.json
├── scripts/
├── src/
│   ├── index.ts                      # 导出所有公共 API
│   ├── driver.ts                     # I18nDriver 实现
│   ├── default-translation-agent.ts  # 内置翻译 Agent
│   └── storage.ts                    # 路径映射
├── test/
│   └── i18n-driver.test.ts
├── README.md
└── CHANGELOG.md
```

---

### Phase 3: Skill 层集成 ✅ 已完成

**目标：** 在 `packages/core` 中集成 view 支持

**完成日期：** 2024-12-16

**任务：**
1. [x] 扩展 `packages/core/src/prompt/skills/afs/read.ts`：
   - ✅ 使用 `extendSchemaWithView()` 动态扩展 schema
   - ✅ 增加 `view` 字段到 `AFSReadInput`（根据 drivers 自动添加）
   - ✅ 增加 `wait` 字段（可选，默认使用 AFS Core 的默认值 "strict"）
   - ✅ 增加 `viewStatus` 字段到 `AFSReadOutput`（指示是否 fallback）
   - ✅ 更新 description（根据 driver 可用性动态生成）

2. [x] AFS Core 扩展（支持 viewStatus 返回）：
   - ✅ `type.ts`: 新增 `ViewStatus` 接口和 `AFSReadResult` 类型
   - ✅ `view-processor.ts`: `handleRead` 返回增加 `viewStatus`
   - ✅ `afs.ts`: `read` 方法返回类型改为 `AFSReadResult`

3. [x] **不实现** list/stat 的 view 支持（V1 简化）：
   - ⚠️ `list.ts` 暂不支持 view（未来可扩展）
   - ⚠️ `stat.ts` 不存在，暂不实现

4. [x] **不修改** `packages/core/src/prompt/skills/afs/write.ts`：
   - ✅ write 不支持 view 参数
   - ✅ 只能写入 source，view 由 driver 自动生成

5. [x] 保持 `packages/core/src/prompt/skills/afs/index.ts` 简洁：
   - ✅ `getAFSSkills` 不需要检查 driver
   - ✅ 各 skill 内部自动根据 afs.drivers 动态处理

**输出：**
- ✅ `@aigne/core` 支持 view 的 AFS skills
- ✅ TypeScript 编译通过
- ✅ Biome lint 检查通过
- ✅ 所有测试通过

**实现亮点：**
1. **动态 Schema 构建** - 根据 drivers 配置自动添加 view/wait 字段到 inputSchema
2. **viewStatus 反馈** - 输出中包含 `viewStatus.fallback` 指示是否降级到 source
3. **向后兼容** - 无 driver 时行为与之前完全一致
4. **辅助函数** - `getDriversFromAfsConfig()` 处理各种 AFS 配置类型

**依赖：**
- 使用 Phase 1 创建的 `afs/core/src/view-schema.ts` 公共模块

---

### Phase 4: Loader 集成

**目标：** 在 agent loader 中支持 driver 配置

**任务：**
1. [ ] 扩展 `packages/core/src/loader/agent-yaml.ts`：
   - 在 `BaseAgentSchema.afs` 中增加 `drivers` 字段
   - Schema:
     ```typescript
     afs?:
       | boolean
       | {
           modules?: AFSModuleSchema[];
           drivers?: AFSDriverSchema[];  // 新增
         };
     ```

2. [ ] 在 `packages/core/src/loader/index.ts` 中：
   - 解析 driver 配置
   - 实例化 driver 并注入到 AFS

3. [ ] 示例配置（aigne.yaml）：
   ```yaml
   # 方式 1: 使用默认内置翻译 Agent（推荐）
   afs:
     modules:
       - module: local-fs
         options:
           local_path: ./docs
     drivers:
       - driver: i18n
         options:
           default_source_language: zh
           supported_languages:
             - en
             - ja
           # 不配置 translation_agent，会使用内置默认翻译 Agent
           # model 会从 Agent 配置中继承

   # 方式 2: 使用自定义翻译 Agent
   afs:
     modules:
       - module: local-fs
         options:
           local_path: ./docs
     drivers:
       - driver: i18n
         options:
           default_source_language: zh
           supported_languages:
             - en
             - ja
           translation_agent: ./agents/custom-translator.yaml
   ```

**输出：**
- Loader 支持 driver 配置

---

## 十、技术细节与边界

### 10.1 Driver 组合问题

**问题：** 如何处理 `{ language: "en", format: "html" }` 这样的组合 view？

**V1 实现：**
- V1 版本不支持组合 view
- `I18nDriver.canHandle()` 会检查 `Object.keys(view).length === 1`，拒绝处理组合 view
- 如果传入组合 view，AFS Core 会返回错误："No driver found for view"

**未来扩展方案：**
1. **推荐：组合 driver**
   - 创建一个 `I18nFormatDriver` 明确处理 `{ language, format }`
   - 内部编排：先 i18n 再 format（或并行）
   - 对外仍保持"一个请求一个 driver"的语义

2. **不推荐：链式 driver**
   - 多个 driver 依次执行（易出错，难调试）

### 10.2 Metadata 一致性

**问题：** 如果物理文件被外部修改（如直接编辑 `.i18n/en/intro.md`），metadata 会失效吗？

**方案：**
1. 在 `read` 时校验 `derivedFrom` 是否匹配当前 `sourceRevision`
2. 如果不匹配，标记为 stale，触发重新生成
3. 可选：监听文件系统变化（如 chokidar），自动更新 metadata

### 10.3 并发控制（V2 功能）

**问题：** 多个请求同时触发同一个 view 的生成，如何去重？

**V1 实现：**
- 暂不处理并发去重
- 多个并发请求会触发多次处理（可能导致重复翻译）
- 通过 metadata 的 `state = 'generating'` 可以看到正在处理，但不会等待

**V2 优化方案：**
- 使用 in-memory 的 `processingJobs: Map<string, Promise<AFSEntry>>`
- key = `${path}:${JSON.stringify(view)}`
- 第一个请求创建 Promise，后续请求复用同一个 Promise

```typescript
// V2 实现示例
private processingJobs = new Map<string, Promise<AFSEntry>>();

async processView(path: string, view: View): Promise<AFSEntry> {
  const key = `${path}:${JSON.stringify(view)}`;

  // 如果已有正在进行的任务，复用
  if (this.processingJobs.has(key)) {
    return this.processingJobs.get(key)!;
  }

  // 创建新任务
  const job = this._doProcessView(path, view).finally(() => {
    this.processingJobs.delete(key);
  });

  this.processingJobs.set(key, job);
  return job;
}
```

**优先级：** V2（非必需，V1 可先不实现）

### 10.4 SourceRevision 计算

**方案：**
- 对于文本文件：使用内容的 SHA-256 hash
- 对于二进制文件：使用 mtime + size 组合
- 存储为字符串：`hash:sha256:abc123...` 或 `mtime:1234567890:size:1024`

```typescript
function computeRevision(entry: AFSEntry): string {
  if (typeof entry.content === "string") {
    const hash = crypto.createHash("sha256").update(entry.content).digest("hex");
    return `hash:sha256:${hash}`;
  }
  return `mtime:${entry.updatedAt?.getTime()}:size:${entry.metadata?.size}`;
}
```

---

## 十一、总结

### V1 实现范围

**包含功能：**
- ✅ View 抽象（仅 `language` 维度）
- ✅ i18n Driver 实现（单语言翻译，内置默认翻译 Agent）
- ✅ Metadata 管理（SQLite 存储，Source + View 两层）
- ✅ 异步 I/O（strict / fallback 两种策略，简化版）
- ✅ 物理存储映射（`.i18n/{lang}/`）
- ✅ AFS Core 集成（read/write/prefetch API）
- ✅ Skill 层集成（动态 schema 组装）
- ✅ Loader 集成（driver 配置支持）

**V1 简化（V2 优化）：**
- ⚠️ 并发请求处理：V1 直接执行，可能重复处理；V2 增加 job 去重
- ⚠️ generating 状态：V1 不等待，直接覆盖；V2 增加等待队列
- ⚠️ 超时控制：V1 依赖 driver；V2 框架级超时

**不包含功能：**
- ❌ 组合 view（如 `{ language: "en", format: "html" }`）
- ❌ 其他 view 维度（format、policy、variant）
- ❌ 链式 driver 支持
- ❌ 文件系统监听（自动 metadata 更新）

### 关键设计点

1. **View 是投影键，不是多个文件**
   - path 是唯一 identity
   - language 只是 view 的一个维度（V1 唯一实现的维度）

2. **Driver 在 Module 之后处理**
   - 先通过 AFSModule 读取源文件
   - 再由 Driver 进行转换处理

3. **Driver 负责转换，Agent 不感知**
   - Agent 只需声明"我要什么"
   - Driver 负责生成和缓存

4. **异步 I/O（V1 简化版）**
   - strict: 直接触发处理并等待
   - fallback: 后台处理，立即返回 source
   - V1 不处理并发去重，V2 增加任务队列

5. **Metadata 分层管理**
   - Source-level: 主内容版本
   - View-level: 投影状态

6. **物理存储对上层透明**
   - `.i18n/{lang}/` 只是 driver 的实现细节
   - API 始终使用逻辑 path + view

7. **内置默认翻译 Agent**
   - i18n Driver 提供开箱即用的默认翻译 Agent
   - 用户只需提供 model，无需自己实现翻译逻辑
   - 支持自定义翻译 Agent 以满足特殊需求

### 扩展性

未来可以轻松扩展：
- Format driver: `{ format: "html" }`（格式转换）
- Summary driver: `{ variant: "summary" }`（摘要生成）
- Policy driver: `{ policy: "marketing" }`（风格策略）
- 组合 driver: `{ language: "en", format: "html" }`（多维度组合）

所有 driver 共享相同的基础设施（metadata、job queue、wait 策略）。

---

## 附录：关键文件清单

### AFS Core
- `afs/core/src/type.ts` - 类型定义（View, AFSDriver, ReadOptions, **ViewStatus**, **AFSReadResult**）
- `afs/core/src/afs.ts` - AFS 主类，driver 匹配与调度，metadata 集成，**read 返回 AFSReadResult**
- `afs/core/src/view-schema.ts` - 动态 View Schema 构建（buildViewSchema, extendSchemaWithView）
- `afs/core/src/metadata/type.ts` - Metadata 接口定义
- `afs/core/src/metadata/store.ts` - SQLiteMetadataStore 实现
- `afs/core/src/metadata/migrations/001-init.ts` - 数据库 schema
- `afs/core/src/metadata/index.ts` - Metadata 模块导出
- `afs/core/src/view-processor.ts` - View 处理流程，**handleRead 返回 viewStatus**

### i18n Driver
- `afs/i18n-driver/src/index.ts` - I18nDriver 实现
- `afs/i18n-driver/src/default-translation-agent.ts` - 内置默认翻译 Agent
- `afs/i18n-driver/src/storage.ts` - 物理存储映射

### Skills
- `packages/core/src/prompt/skills/afs/read.ts` - ✅ **已修改** - 动态 schema（view/wait）+ viewStatus 输出
- `packages/core/src/prompt/skills/afs/list.ts` - ⚠️ 暂不支持 view（未来可扩展）
- `packages/core/src/prompt/skills/afs/stat.ts` - ⚠️ 不存在，暂不实现
- `packages/core/src/prompt/skills/afs/write.ts` - ✅ 无需修改（write 不支持 view）
- `packages/core/src/prompt/skills/afs/index.ts` - ✅ 保持简洁（getAFSSkills 不检查 driver）

### Loader
- `packages/core/src/loader/agent-yaml.ts` - YAML schema 扩展
- `packages/core/src/loader/index.ts` - Driver 实例化
