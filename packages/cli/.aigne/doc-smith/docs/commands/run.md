# run - 运行 Agent

> **前置条件**:
> - [命令参考](../commands.md) - 了解所有可用命令
> - [create](./create.md) - 了解如何创建项目

## 概述

`run` 命令用于运行 AIGNE agent 并启动聊天循环。这是 AIGNE CLI 的默认命令，也是最常用的命令之一。

## 语法

```bash
aigne run [path] [entry-agent] [options]
# 或简化为
aigne [path] [entry-agent] [options]
```

当不指定子命令时，`aigne` 默认执行 `run` 命令。

## 参数

### path

- **类型**: 字符串（可选）
- **默认值**: `.` (当前目录)
- **描述**: agents 目录的路径或 AIGNE 项目的 URL

支持：
- 本地路径（相对路径或绝对路径）
- HTTP/HTTPS URL

### entry-agent

- **类型**: 字符串（可选）
- **描述**: 要运行的 agent 名称
- **默认值**: 项目中的第一个 agent（如未指定）

## 选项

### --version, -v

显示版本号并退出。

```bash
aigne --version
# 或
aigne -v
```

### --chat

在终端中运行聊天循环。

```bash
aigne run --chat
```

### --model

指定要使用的 AI 模型。

```bash
aigne run --model <provider[:model]>
```

格式：`provider` 或 `provider:model`
- `provider`: 模型提供商（如 `openai`, `anthropic`）
- `model`: 具体模型名称（可选）

示例：
```bash
# 使用 OpenAI 默认模型
aigne run --model openai

# 使用特定的 OpenAI 模型
aigne run --model openai:gpt-4

# 使用 Claude
aigne run --model anthropic:claude-3-sonnet-20240229
```

### --verbose

启用详细日志输出，用于调试。

```bash
aigne run --verbose
```

### --log-level

设置日志级别。

```bash
aigne run --log-level debug
```

### --cache-dir

指定下载包的缓存目录（用于 URL 模式）。

```bash
aigne run --url https://example.com/agent --cache-dir /path/to/cache
```

## 使用示例

### 基本用法

#### 运行当前目录的 agent

```bash
aigne run
# 或简化为
aigne
```

#### 运行指定路径的 agent

```bash
aigne run --path path/to/agents
# 或简化为
aigne path/to/agents
```

#### 运行远程 agent

```bash
aigne run --url https://example.com/aigne-project
# 或简化为
aigne https://example.com/aigne-project
```

#### 运行特定 agent

```bash
aigne run --entry-agent myAgent
# 或简化为
aigne myAgent
```

### 高级用法

#### 指定模型和详细日志

```bash
aigne run --model openai:gpt-4 --verbose
```

#### 运行远程 agent 并指定模型

```bash
aigne run --url https://hub.aigne.io/agents/example --model anthropic:claude-3-opus-20240229
```

#### 启用聊天模式

```bash
aigne run --chat --entry-agent chatbot
```

#### 组合多个选项

```bash
aigne run path/to/agents --entry-agent myAgent --model openai:gpt-4o-mini --verbose
```

## 工作原理

### 加载流程

1. **路径解析**: 确定 agent 的位置（本地或远程）
2. **下载（如需要）**: 如果是 URL，下载并缓存项目
3. **环境加载**: 加载 `.env` 文件中的环境变量
4. **AIGNE 初始化**: 加载 AIGNE 配置和 agents
5. **Agent 选择**: 确定要运行的 agent
6. **启动执行**: 启动 agent 并进入聊天循环

### 远程 URL 支持

当使用 URL 时：

```bash
aigne run --url https://example.com/agent.tar.gz
```

1. 下载包到 `~/.aigne/<hostname>/<path>`
2. 解压并缓存
3. 从缓存位置加载运行

缓存位置示例：
```
~/.aigne/example.com/agent/
```

### Agent 选择优先级

1. 命令行指定的 `--entry-agent`
2. 位置参数指定的 agent 名称
3. 配置文件中的 entry agent
4. 项目中的第一个 agent

## 交互式聊天

启动后进入交互式聊天界面：

```
> Hello
Agent: Hi! How can I help you today?

> What can you do?
Agent: I can help you with...

> exit
```

常用命令：
- `exit` 或 `quit`: 退出聊天
- `help`: 显示帮助信息

## 兼容性

### 旧版命令格式

为了向后兼容，支持以下旧格式：

```bash
# 旧格式
aigne run --path /path/to/agents --entry-agent myAgent

# 新格式（推荐）
aigne /path/to/agents myAgent
```

## 环境变量

运行时会自动加载以下环境变量：

- `OPENAI_API_KEY` - OpenAI API 密钥
- `ANTHROPIC_API_KEY` - Anthropic API 密钥
- `XAI_API_KEY` - XAI API 密钥
- `AIGNE_HUB_API_URL` - AIGNE Hub URL
- `AIGNE_HUB_API_KEY` - AIGNE Hub API 密钥

详见 [配置文档](../configuration.md)。

## 常见问题

### Agent 未找到

```
Error: Entry agent does not exist
```

解决方法：
1. 检查 agent 名称是否正确
2. 确认 agent 配置文件存在
3. 使用 `--verbose` 查看详细日志

### API 密钥未配置

```
Error: API key not configured
```

解决方法：
1. 创建 `.env` 文件
2. 添加相应的 API 密钥
3. 确保环境变量名称正确

### 下载失败

```
Error: Failed to download package
```

解决方法：
1. 检查 URL 是否正确
2. 确认网络连接
3. 尝试手动下载验证

## 调试技巧

### 启用详细日志

```bash
aigne run --verbose
```

显示：
- API 调用详情
- 工具执行日志
- 内存操作记录
- 错误堆栈

### 查看版本信息

```bash
aigne --version
```

### 查看帮助

```bash
aigne run --help
```

## 性能优化

### 使用本地缓存

远程 agent 会自动缓存，重复运行更快：

```bash
# 第一次运行（下载）
aigne run --url https://example.com/agent

# 后续运行（使用缓存）
aigne run --url https://example.com/agent  # 更快
```

### 选择合适的模型

根据任务选择模型：
- 简单任务: `gpt-4o-mini`
- 复杂推理: `gpt-4`, `claude-3-opus`
- 平衡性能: `claude-3-sonnet`

## 技术细节

### 源码位置

实现文件：`src/commands/run.ts:22`

关键函数：
- `createRunCommand()` - 创建命令
- `loadApplication()` - 加载应用
- `prepareDirs()` - 准备目录

### V1 包兼容性

支持旧版 V1 格式的 agent 包，会自动转换：

```typescript
if (await isV1Package(cacheDir)) {
  await toAIGNEPackage(cacheDir, dir);
}
```

## 下一步

运行 agent 后，可以：

1. [test](./test.md) - 运行测试验证功能
2. [eval](./eval.md) - 评估 agent 性能
3. [observe](./observe.md) - 启动监控查看运行状态

## 相关命令

- [create](./create.md) - 创建新项目
- [test](./test.md) - 运行测试
- [serve-mcp](./serve-mcp.md) - 作为 MCP 服务运行
- [hub](./hub.md) - 管理 Hub 连接

## 参考

- [命令参考](../commands.md) - 返回命令列表
- [基本工作流程](../workflow.md) - 完整开发流程
- [配置](../configuration.md) - 配置选项详解
