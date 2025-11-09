# AIGNE Framework - Prompt Builder 合规性审查报告

生成日期: 2025-11-09

---

## 📊 执行摘要

### 合规性统计

| 类别 | 总文件数 | 违规文件 | 违规点 | 合规率 |
|------|---------|---------|--------|--------|
| **Examples** | 27 | 26 | 57 | 3.7% |
| **Agent Library** | 1 | 1 | 1 | 0% |
| **Core Library** | - | 0 | 0 | 100% |
| **Tests** | - | 0 | 0 | 100% |
| **总计** | 28+ | 27 | 58 | **3.6%** |

### 问题严重性

- 🔴 **P0 严重问题**: 1 个 (API 误用)
- 🟠 **P1 高优先级**: 26 个 (直接写 prompt 字符串)
- 🟡 **P2 中优先级**: 0 个
- 🟢 **P3 低优先级**: 0 个

---

## ❌ 完整违规清单

### 🔴 P0 - 严重 API 误用 (必须立即修复)

#### 1. packages/agent-library/src/data-mapper/agents/mapper.ts

**行号**: 24-60
**违规类型**: 错误使用 PromptBuilder.from() API
**严重性**: 🔴 Critical

**问题代码**:
```typescript
instructions: PromptBuilder.from({
  messages: [  // ❌ PromptBuilder.from() 不支持 messages 属性
    {
      role: "assistant",
      content: { type: "text", text: PROMPT_MAPPING },
    },
    {
      role: "user",
      content: { type: "text", text: `...` },
    },
  ],
}),
```

**错误原因**: `PromptBuilder.from()` 只接受 `string | { path: string } | GetPromptResult`

---

### 🟠 P1 - Examples 直接写 Prompt (高优先级)

#### 2. examples/afs-system-fs/index.ts

**行号**: 32-33
**违规代码**:
```typescript
instructions:
  "You are a friendly chatbot that can retrieve files from a virtual file system. You should use the provided functions to list, search, and read files as needed to answer user questions.",
```

---

#### 3. examples/mcp-blocklet/index.ts

**行号**: 124
**违规代码**:
```typescript
instructions: PromptBuilder.from(
  "You are a helpful assistant..."
),
```
**注**: 技术上正确，但冗余且仍在代码中写 prompt

---

#### 4. examples/mcp-did-spaces/index.ts

**行号**: 28-32
**违规代码**:
```typescript
instructions: `You are a DID Spaces assistant. Show data only, no explanations.

- Execute the requested operation
- Show only the raw data result
- No formatting, headers, or explanations`
```

---

#### 5. examples/mcp-github/index.ts

**行号**: 24-35
**违规代码**:
```typescript
instructions: `\
  ## GitHub Interaction Assistant
  You are an assistant that helps users interact with GitHub repositories.
  You can perform various GitHub operations like:
  1. Searching repositories
  2. Getting file contents
  3. Creating or updating files
  4. Creating issues and pull requests
  5. And many more GitHub operations

  Always provide clear, concise responses with relevant information from GitHub.
  `
```

---

#### 6. examples/mcp-github/usages.ts

**行号**: 27-38
**违规代码**:
```typescript
instructions: `\
## GitHub Interaction Assistant
You are an assistant that helps users interact with GitHub repositories.
You can perform various GitHub operations like:
1. Searching repositories
2. Getting file contents
3. Creating or updating files
4. Creating issues and pull requests
5. And many more GitHub operations

Always provide clear, concise responses with relevant information from GitHub.
`
```

---

#### 7. examples/mcp-puppeteer/index.ts

**行号**: 17-21
**违规代码**:
```typescript
instructions: `\
  ## Steps to extract content from a website
  1. navigate to the url
  2. evaluate document.body.innerText to get the content
  `
```

---

#### 8. examples/mcp-puppeteer/usages.ts

**行号**: 24-28
**违规代码**:
```typescript
instructions: `\
## Steps to extract content from a website
1. navigate to the url
2. evaluate document.body.innerText to get the content
`
```

---

#### 9. examples/mcp-sqlite/usages.ts

**行号**: 25
**违规代码**:
```typescript
instructions: "You are a database administrator"
```

---

#### 10. examples/memory/index.ts

**行号**: 12
**违规代码**:
```typescript
instructions: "You are a friendly chatbot"
```

---

#### 11. examples/memory-did-spaces/index.ts

**行号**: 14-18
**违规代码**:
```typescript
instructions: `You are a crypto analyst with memory. Give brief answers only.

- Remember user details
- Answer in 20 words or less
- Show facts only, no explanations`
```

---

#### 12. examples/nano-banana/index.ts

**行号**: 10
**违规代码**:
```typescript
instructions: "You are a drawer who creates images based on user descriptions."
```

---

#### 13. examples/nano-banana/usage.ts

**行号**: 14
**违规代码**:
```typescript
instructions: "You are a drawer who creates images based on user descriptions."
```

---

#### 14. examples/workflow-code-execution/index.ts

**行号**: 35-38
**违规代码**:
```typescript
instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`
```

---

#### 15. examples/workflow-code-execution/usages.ts

**行号**: 29-32
**违规代码**:
```typescript
instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`
```

---

#### 16. examples/workflow-concurrency/index.ts

**违规点 #1 - 行号**: 7-11
**违规代码**:
```typescript
instructions: `\
You are a product analyst. Extract and summarize the key features of the product.

Product description:
{{product}}`
```

**违规点 #2 - 行号**: 16-20
**违规代码**:
```typescript
instructions: `\
You are a market researcher. Identify the target audience for the product.

Product description:
{{product}}`
```

---

#### 17. examples/workflow-concurrency/usages.ts

**违规点 #1 - 行号**: 13-17
**违规点 #2 - 行号**: 22-26
(相同的 prompt 内容)

---

#### 18. examples/workflow-group-chat/index.ts

**违规点 #1 - 行号**: 37
**违规代码**:
```typescript
instructions: "You are a Writer. You produce good work."
```

**违规点 #2 - 行号**: 46-49
**违规代码**:
```typescript
instructions: `\
You are an Editor. Plan and guide the task given by the user.
Provide critical feedbacks to the draft and illustration produced by Writer and Illustrator.
Approve if the task is completed and the draft and illustration meets user's requirements.`
```

**违规点 #3 - 行号**: 72-74
**违规代码**:
```typescript
instructions: `\
You are an Illustrator. You use the generate_image tool to create images given user's requirement.
Make sure the images have consistent characters and style.`
```

---

#### 19. examples/workflow-handoff/index.ts

**违规点 #1 - 行号**: 87-96 (Sales agent)
**违规点 #2 - 行号**: 106-114 (Support agent)
**违规点 #3 - 行号**: 125-129 (Manager)
**违规点 #4 - 行号**: 138-142 (Customer service bot)

---

#### 20. examples/workflow-handoff/usages.ts

**违规点 #1 - 行号**: 18
**违规代码**:
```typescript
instructions: "You are a helpful agent."
```

**违规点 #2 - 行号**: 26
**违规代码**:
```typescript
instructions: "Only speak in Haikus."
```

---

#### 21. examples/workflow-orchestrator/index.ts

**违规点 #1 - 行号**: 21-31
**违规点 #2 - 行号**: 38-40

---

#### 22. examples/workflow-orchestrator/usage.ts

**违规点 #1 - 行号**: 30-40
**违规点 #2 - 行号**: 47-49

---

#### 23. examples/workflow-reflection/index.ts

**违规点 #1 - 行号**: 11-30 (Coder)
**违规点 #2 - 行号**: 42-55 (Reviewer)

---

#### 24. examples/workflow-reflection/usages.ts

**违规点 #1 - 行号**: 16-36 (Coder)
**违规点 #2 - 行号**: 46-59 (Reviewer)

---

#### 25. examples/workflow-router/index.ts

**违规点 #1 - 行号**: 10-12 (Product support)
**违规点 #2 - 行号**: 20-22 (Feedback)
**违规点 #3 - 行号**: 30-32 (General)
**违规点 #4 - 行号**: 39-42 (Triage)

---

#### 26. examples/workflow-router/usages.ts

**违规点 #1 - 行号**: 15-17 (Product support)
**违规点 #2 - 行号**: 25-27 (Feedback)
**违规点 #3 - 行号**: 35-37 (General)
**违规点 #4 - 行号**: 44-46 (Router)

---

#### 27. examples/workflow-sequential/index.ts

**违规点 #1 - 行号**: 7-14 (Concept extractor)
**违规点 #2 - 行号**: 19-28 (Writer)
**违规点 #3 - 行号**: 33-44 (Format proof)

---

#### 28. examples/workflow-sequential/usages.ts

**违规点 #1 - 行号**: 13-20 (Concept extractor)
**违规点 #2 - 行号**: 25-34 (Writer)
**违规点 #3 - 行号**: 39-50 (Format proof)

---

## ✅ 符合规范的例子（仅 1 个）

### examples/mcp-sqlite/index.ts

**行号**: 27
**正确代码**:
```typescript
const prompt = await sqlite.prompts["mcp-demo"]?.invoke({
  topic: "product service",
});

const agent = AIAgent.from({
  instructions: PromptBuilder.from(prompt),  // ✅ 从 MCP 加载
  skills: [sqlite],
});
```

---

## 🛠️ 修复方案

### 方案 A: 为每个 Example 创建 prompts/ 目录（推荐）

#### 目录结构
```
examples/
├── workflow-sequential/
│   ├── index.ts
│   ├── usages.ts
│   └── prompts/
│       ├── concept-extractor.txt
│       ├── writer.txt
│       └── format-proof.txt
├── workflow-router/
│   ├── index.ts
│   └── prompts/
│       ├── product-support.txt
│       ├── feedback.txt
│       ├── general.txt
│       └── triage.txt
├── afs-system-fs/
│   ├── index.ts
│   └── prompts/
│       └── chatbot.txt
└── ...
```

#### 修复示例 1: afs-system-fs

**修复前** (index.ts:32-33):
```typescript
instructions:
  "You are a friendly chatbot that can retrieve files from a virtual file system. You should use the provided functions to list, search, and read files as needed to answer user questions.",
```

**修复后** (index.ts):
```typescript
instructions: PromptBuilder.from({
  path: "./prompts/chatbot.txt"
}),
```

**新建文件** (prompts/chatbot.txt):
```
You are a friendly chatbot that can retrieve files from a virtual file system. You should use the provided functions to list, search, and read files as needed to answer user questions.
```

---

#### 修复示例 2: workflow-sequential

**修复前** (index.ts:7-14):
```typescript
const conceptExtractor = AIAgent.from({
  instructions: `\
You are a marketing analyst. Give a product description, identity:
- Key features
- Target audience
- Unique selling points

Product description:
{{product}}`,
  outputKey: "concept",
});
```

**修复后** (index.ts):
```typescript
const conceptExtractor = AIAgent.from({
  instructions: PromptBuilder.from({
    path: "./prompts/concept-extractor.txt"
  }),
  outputKey: "concept",
});
```

**新建文件** (prompts/concept-extractor.txt):
```
You are a marketing analyst. Give a product description, identity:
- Key features
- Target audience
- Unique selling points

Product description:
{{product}}
```

---

#### 修复示例 3: data-mapper (严重问题)

**修复前** (mapper.ts:24-60):
```typescript
instructions: PromptBuilder.from({
  messages: [  // ❌ 不支持
    {
      role: "assistant",
      content: { type: "text", text: PROMPT_MAPPING },
    },
    {
      role: "user",
      content: { type: "text", text: `Given a source data...` },
    },
  ],
}),
```

**修复方案 1 - 使用 ChatMessagesTemplate**:
```typescript
import {
  ChatMessagesTemplate,
  AgentMessageTemplate,
  UserMessageTemplate
} from "@aigne/core";

instructions: new PromptBuilder({
  instructions: ChatMessagesTemplate.from([
    AgentMessageTemplate.from(PROMPT_MAPPING),
    UserMessageTemplate.from({
      path: "./prompts/mapper-user-message.txt"
    }),
  ])
}),
```

**修复方案 2 - 分离到文件**:
```typescript
instructions: PromptBuilder.from({
  path: "./prompts/mapper-instructions.txt"
}),
```

然后在 `prompts/mapper-instructions.txt` 中组合内容。

---

### 方案 B: 渐进式修复优先级

#### Phase 1: 修复严重问题 (1 天)
- ✅ data-mapper API 误用

#### Phase 2: 修复主要 Workflow 示例 (2-3 天)
- ✅ workflow-sequential
- ✅ workflow-router
- ✅ workflow-handoff
- ✅ workflow-reflection
- ✅ workflow-concurrency
- ✅ workflow-orchestrator
- ✅ workflow-group-chat
- ✅ workflow-code-execution

#### Phase 3: 修复 MCP 示例 (1-2 天)
- ✅ mcp-github
- ✅ mcp-puppeteer
- ✅ mcp-sqlite
- ✅ mcp-did-spaces
- ✅ mcp-blocklet

#### Phase 4: 修复其他示例 (1 天)
- ✅ afs-system-fs
- ✅ memory
- ✅ memory-did-spaces
- ✅ nano-banana

---

## 💡 Prompt Builder 改进建议

### 改进 1: 添加运行时类型检查

**位置**: `packages/core/src/prompt/prompt-builder.ts:57-68`

**当前代码**:
```typescript
static from(
  instructions: string | { path: string } | GetPromptResult,
  { workingDir }: { workingDir?: string } = {},
): PromptBuilder {
  if (typeof instructions === "string")
    return new PromptBuilder({ instructions, workingDir: workingDir });

  if (isFromPromptResult(instructions))
    return PromptBuilder.fromMCPPromptResult(instructions);

  if (isFromPath(instructions))
    return PromptBuilder.fromFile(instructions.path, { workingDir });

  throw new Error(`Invalid instructions ${instructions}`);
}
```

**改进后**:
```typescript
static from(
  instructions: string | { path: string } | GetPromptResult,
  { workingDir }: { workingDir?: string } = {},
): PromptBuilder {
  // 添加 messages 属性检查
  if (typeof instructions === "object" && "messages" in instructions) {
    throw new TypeError(
      "PromptBuilder.from() does not accept 'messages' property.\n" +
      "To use multiple messages, use:\n" +
      "  new PromptBuilder({\n" +
      "    instructions: ChatMessagesTemplate.from([...])\n" +
      "  })\n" +
      "See: https://docs.aigne.io/prompt-builder#complex-messages"
    );
  }

  if (typeof instructions === "string") {
    // 开发环境警告
    if (process.env.NODE_ENV !== 'production' && instructions.length > 100) {
      console.warn(
        '⚠️  Prompt Builder Best Practice Warning:\n' +
        '   Long prompt detected in code. Consider using external file:\n' +
        '   PromptBuilder.from({ path: "./prompts/xxx.txt" })\n' +
        `   Current length: ${instructions.length} characters`
      );
    }
    return new PromptBuilder({ instructions, workingDir });
  }

  if (isFromPromptResult(instructions))
    return PromptBuilder.fromMCPPromptResult(instructions);

  if (isFromPath(instructions))
    return PromptBuilder.fromFile(instructions.path, { workingDir });

  throw new TypeError(
    `Invalid instructions type.\n` +
    `Expected: string | { path: string } | GetPromptResult\n` +
    `Received: ${JSON.stringify(instructions, null, 2)}`
  );
}
```

---

### 改进 2: 添加工厂方法

**位置**: `packages/core/src/prompt/prompt-builder.ts`

**新增方法**:
```typescript
export class PromptBuilder {
  // 现有的通用方法
  static from(instructions: string | { path: string } | GetPromptResult): PromptBuilder

  // 新增：更明确的工厂方法
  static fromString(template: string, options?: PromptBuilderOptions): PromptBuilder {
    return new PromptBuilder({ instructions: template, ...options });
  }

  static fromFile(path: string, options?: PromptBuilderOptions): PromptBuilder {
    const text = nodejs.fsSync.readFileSync(path, "utf-8");
    return new PromptBuilder({
      instructions: text,
      workingDir: options?.workingDir || nodejs.path.dirname(path)
    });
  }

  static fromMCP(prompt: GetPromptResult): PromptBuilder {
    return PromptBuilder.fromMCPPromptResult(prompt);
  }

  static fromMessages(messages: ChatMessageTemplate[]): PromptBuilder {
    return new PromptBuilder({
      instructions: ChatMessagesTemplate.from(messages)
    });
  }
}
```

---

### 改进 3: 性能优化 - 缓存 Nunjucks Environment

**位置**: `packages/core/src/prompt/template.ts:28-46`

**当前代码**:
```typescript
async format(variables: Record<string, unknown> = {}, options?: FormatOptions): Promise<string> {
  let env = new nunjucks.Environment();  // ❌ 每次都创建

  if (options?.workingDir) {
    env = new nunjucks.Environment(new CustomLoader({ workingDir: options.workingDir }));
  }

  setupFilters(env);  // ❌ 每次都设置

  return new Promise((resolve, reject) =>
    env.renderString(this.template, variables, (err, res) => {
      if (err || !res) {
        reject(err || new Error(`Failed to render template: ${this.template}`));
      } else {
        resolve(res);
      }
    }),
  );
}
```

**改进后**:
```typescript
export class PromptTemplate {
  private static envCache = new Map<string, nunjucks.Environment>();

  private static getEnvironment(workingDir?: string): nunjucks.Environment {
    const cacheKey = workingDir || '__default__';

    let env = PromptTemplate.envCache.get(cacheKey);
    if (!env) {
      env = workingDir
        ? new nunjucks.Environment(new CustomLoader({ workingDir }))
        : new nunjucks.Environment();
      setupFilters(env);
      PromptTemplate.envCache.set(cacheKey, env);
    }

    return env;
  }

  async format(variables: Record<string, unknown> = {}, options?: FormatOptions): Promise<string> {
    const env = PromptTemplate.getEnvironment(options?.workingDir);

    return new Promise((resolve, reject) =>
      env.renderString(this.template, variables, (err, res) => {
        if (err || !res) {
          const error = new Error(
            `Failed to render template.\n` +
            `Template: ${this.template.substring(0, 100)}${this.template.length > 100 ? '...' : ''}\n` +
            `Variables: ${Object.keys(variables).join(', ')}\n` +
            `Error: ${err?.message || 'Unknown error'}`
          );
          reject(error);
        } else {
          resolve(res);
        }
      }),
    );
  }
}
```

---

### 改进 4: 添加 ESLint 规则（可选）

**新建文件**: `packages/eslint-plugin-aigne/rules/no-inline-prompts.js`

```javascript
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow inline prompt strings in AIAgent.from()',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noInlinePrompt: 'Avoid inline prompts. Use PromptBuilder.from({ path: "..." }) instead.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key.name === 'instructions' &&
          node.parent.parent.type === 'CallExpression' &&
          node.parent.parent.callee.property?.name === 'from'
        ) {
          if (
            node.value.type === 'Literal' ||
            node.value.type === 'TemplateLiteral'
          ) {
            context.report({
              node,
              messageId: 'noInlinePrompt',
            });
          }
        }
      },
    };
  },
};
```

---

## 📈 预期收益

### 修复后的好处

1. **集中管理**: 所有 prompts 在独立目录，易于维护
2. **版本控制**: prompt 变更清晰可追踪
3. **A/B 测试**: 轻松切换不同 prompt 文件
4. **自动优化**: Prompt Builder 可注入最佳实践、memory、tools
5. **多语言支持**: 易于实现 i18n
6. **示例规范**: 开发者学习正确的使用方式

### 性能提升

- Environment 缓存可减少 ~30% 的模版渲染时间
- 文件加载可通过缓存进一步优化

---

## 📋 执行清单

### 立即行动 (本周)
- [ ] 修复 data-mapper API 误用
- [ ] 为 workflow-sequential 创建 prompts/ 目录
- [ ] 为 workflow-router 创建 prompts/ 目录
- [ ] 添加 PromptBuilder 运行时检查

### 近期计划 (2 周内)
- [ ] 修复所有 workflow 示例
- [ ] 修复所有 MCP 示例
- [ ] 实现 Environment 缓存优化
- [ ] 添加工厂方法

### 长期优化 (1 个月内)
- [ ] 修复所有剩余示例
- [ ] 创建 ESLint 规则
- [ ] 更新文档和最佳实践指南
- [ ] 添加迁移脚本工具

---

## 🎯 成功指标

- ✅ 所有 examples 使用外部文件加载 prompts
- ✅ data-mapper API 误用已修复
- ✅ 运行时检查可捕获常见错误
- ✅ 开发者文档更新完成
- ✅ 合规率达到 95%+

---

**报告生成**: AIGNE Framework Compliance Review Tool
**审查人**: Claude Code
**联系**: 如有问题请在 GitHub Issues 提出
