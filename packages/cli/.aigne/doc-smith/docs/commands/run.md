# run - 运行代理

`run` 命令用于运行 AIGNE 代理，支持本地项目和远程 URL，提供交互式对话界面。

## 语法

```bash
aigne run [path] [entry-agent]
aigne [path] [entry-agent]  # 简化形式（run 是默认命令）
```

## 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `path` | string | 否 | `.` | 代理目录路径或 URL |
| `entry-agent` | string | 否 | 第一个代理 | 要运行的代理名称 |

## 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--version`, `-v` | boolean | - | 显示版本号 |
| `--chat` | boolean | `false` | 在终端启动交互式对话 |
| `--model` | string | - | 指定 AI 模型，格式：`provider[:model]` |
| `--image-model` | string | - | 指定图像生成模型 |
| `--log-level` | string | `info` | 日志级别：`debug`、`info`、`warn`、`error` |
| `--verbose` | boolean | `false` | 启用详细日志输出 |
| `--aigne-hub-url` | string | - | 自定义 AIGNE Hub 服务 URL |

## 使用方式

### 基本用法

运行当前目录的代理：

```bash
aigne run
# 或使用简化形式
aigne
```

运行指定路径的代理：

```bash
aigne run ./my-agents
aigne run /absolute/path/to/agents
```

### 指定代理

运行特定代理：

```bash
aigne run --entry-agent myAgent
# 或使用简化形式
aigne run myAgent
aigne myAgent
```

### 运行远程代理

从 URL 运行代理：

```bash
aigne run --url https://example.com/aigne-project.tar.gz
# 或直接使用 URL 作为 path
aigne run https://example.com/aigne-project
```

远程代理会被下载到 `~/.aigne/<hostname><pathname>/` 目录并缓存。

## 模型配置

### 指定模型提供商

使用默认模型：

```bash
# OpenAI（默认模型）
aigne run --model openai

# Claude
aigne run --model anthropic

# XAI
aigne run --model xai
```

### 指定具体模型

使用特定模型版本：

```bash
# OpenAI GPT-4
aigne run --model openai:gpt-4o-mini

# Claude Sonnet
aigne run --model anthropic:claude-3-5-sonnet-20241022

# XAI Grok
aigne run --model xai:grok-beta
```

### 配置图像模型

指定图像生成模型：

```bash
aigne run --image-model dall-e-3
```

## 日志和调试

### 设置日志级别

```bash
# 详细日志
aigne run --log-level debug

# 仅错误
aigne run --log-level error
```

### 使用 verbose 模式

```bash
aigne run --verbose
```

这等同于 `--log-level debug`。

## 交互式对话

### 启动对话模式

```bash
aigne run --chat
```

在对话模式中：
- 输入消息后按 Enter 发送
- 使用 `Ctrl+C` 或输入 `exit` 退出
- 代理的回复会实时显示

### 非交互式运行

某些代理可能设计为非交互式运行（如定时任务、事件处理器）：

```bash
aigne run --chat false
```

## 环境变量

`run` 命令会自动加载以下环境变量：

### API 密钥

```bash
# OpenAI
export OPENAI_API_KEY=sk-xxx
aigne run

# Claude
export ANTHROPIC_API_KEY=sk-ant-xxx
aigne run --model anthropic

# XAI
export XAI_API_KEY=xai-xxx
aigne run --model xai
```

### 项目配置

在项目目录创建 `.env` 文件：

```bash
# .env
OPENAI_API_KEY=sk-xxx
LOG_LEVEL=debug
AIGNE_HUB_URL=https://custom-hub.example.com
```

CLI 会自动加载这些配置。

## 示例

### 示例 1：基本运行

```bash
# 创建并运行项目
aigne create my-bot
cd my-bot
aigne run
```

### 示例 2：使用特定模型

```bash
# 使用 GPT-4
aigne run --model openai:gpt-4o-mini

# 使用 Claude
aigne run --model anthropic:claude-3-5-sonnet-20241022
```

### 示例 3：运行远程代理

```bash
# 从 GitHub 运行
aigne run https://github.com/user/repo/archive/main.tar.gz

# 从私有服务器运行
aigne run https://my-server.com/agents/customer-support.tar.gz
```

### 示例 4：调试模式

```bash
# 启用详细日志
aigne run --verbose

# 或指定日志级别
aigne run --log-level debug
```

### 示例 5：多代理项目

```bash
# 列出所有可用代理
aigne run --help

# 运行特定代理
aigne run agent1
aigne run agent2
```

## 工作流程

`run` 命令的执行流程：

1. **解析参数**：解析命令行参数和选项
2. **加载项目**：
   - 本地项目：直接加载
   - 远程 URL：下载并解压到缓存目录
3. **加载环境**：读取 `.env` 文件
4. **初始化 AIGNE**：加载代理配置和依赖
5. **启动代理**：根据指定的代理名称启动
6. **交互循环**：如果启用 `--chat`，进入交互式对话

## 常见问题

### Q: 如何查看项目中有哪些代理？

A: 运行 `aigne run --help` 会列出所有可用代理。

### Q: 可以同时运行多个代理吗？

A: 一次只能运行一个代理。如果需要运行多个，可以在不同终端窗口中分别运行。

### Q: 远程代理如何更新？

A: 删除缓存目录 `~/.aigne/<hostname><pathname>/` 后重新运行即可重新下载。

### Q: 如何切换不同的 API 提供商？

A: 使用 `--model` 选项指定提供商，并确保相应的 API 密钥已配置。

## 最佳实践

1. **使用环境变量**：将 API 密钥存储在 `.env` 文件而非命令行
   ```bash
   # .env
   OPENAI_API_KEY=sk-xxx
   ```

2. **开发时启用详细日志**：便于调试
   ```bash
   aigne run --verbose
   ```

3. **生产环境禁用详细日志**：减少日志输出
   ```bash
   aigne run --log-level warn
   ```

4. **使用别名简化命令**：
   ```bash
   # 在 ~/.bashrc 或 ~/.zshrc 中
   alias aigne-dev="aigne run --verbose"
   alias aigne-prod="aigne run --log-level warn"
   ```

5. **版本控制 .env.example**：提供环境变量模板
   ```bash
   # .env.example
   OPENAI_API_KEY=your-api-key-here
   LOG_LEVEL=info
   ```

## 性能优化

### 缓存远程代理

远程代理会自动缓存到本地，后续运行会直接使用缓存：

```bash
# 首次运行会下载
aigne run https://example.com/agent.tar.gz

# 后续运行使用缓存，速度更快
aigne run https://example.com/agent.tar.gz
```

### 清理缓存

手动清理缓存以节省磁盘空间：

```bash
rm -rf ~/.aigne/
```

## 下一步

- 查看 [serve-mcp 命令](/commands/serve-mcp.md) 了解如何将代理作为服务运行
- 查看 [test 命令](/commands/test.md) 了解如何测试代理
- 查看 [配置和环境](/configuration.md) 了解详细的配置选项

---

**相关命令：**
- [create](/commands/create.md) - 创建新项目
- [test](/commands/test.md) - 运行测试
- [serve-mcp](/commands/serve-mcp.md) - 作为 MCP 服务运行
