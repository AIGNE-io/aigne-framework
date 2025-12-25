# run - 运行 Agent

`aigne run` 命令用于启动并与指定的 Agent 进行交互，提供交互式聊天界面。

## 命令格式

```bash
aigne run [path] [entry-agent] [options]
```

## 参数说明

### 位置参数

- **`[path]`**（可选）：Agent 目录路径或项目 URL
  - 默认值：`.`（当前目录）
  - 支持本地路径和远程 URL
  
- **`[entry-agent]`**（可选）：要运行的 Agent 名称
  - 如果未指定，使用配置文件中的入口 Agent
  - 如果配置了多个 Agent，默认运行第一个

### 选项

- **`--entry-agent <name>`**：指定要运行的 Agent 名称
- **`--model <provider[:model]>`**：指定 AI 模型
  - 格式：`provider` 或 `provider:model`
  - 示例：`openai`、`openai:gpt-4o-mini`、`anthropic:claude-3-5-sonnet`
- **`--image-model <provider[:model]>`**：指定图像生成模型
- **`--cache-dir <dir>`**：URL 模式下的缓存目录
- **`--chat`**：在终端中运行聊天循环（默认行为）
- **`--verbose`**：启用详细日志输出
- **`--log-level <level>`**：设置日志级别
- **`--version`, `-v`**：显示版本号
- **`--help`, `-h`**：显示帮助信息

## 使用示例

### 基本用法

在当前目录运行 Agent：

```bash
aigne run
```

这将加载当前目录的 `aigne.yaml` 配置并启动默认 Agent。

### 指定路径运行

运行指定目录的 Agent：

```bash
# 相对路径
aigne run ./my-agent

# 绝对路径
aigne run /path/to/my-agent
```

### 从 URL 运行

从远程 URL 下载并运行 Agent：

```bash
aigne run --url https://github.com/user/repo/archive/main.zip
```

URL 模式下，AIGNE CLI 会：
1. 下载并解压项目到本地缓存目录
2. 加载 Agent 配置
3. 启动 Agent

默认缓存位置：`~/.aigne/<hostname>/<path>`

### 指定 Agent

如果项目中定义了多个 Agent，可以指定要运行的 Agent：

```bash
# 使用位置参数
aigne run . myAgent

# 使用选项
aigne run --entry-agent myAgent
```

### 指定模型

覆盖配置文件中的模型设置：

```bash
# 只指定提供商（使用默认模型）
aigne run --model openai

# 指定提供商和模型
aigne run --model openai:gpt-4o-mini

# 使用 Anthropic Claude
aigne run --model anthropic:claude-3-5-sonnet

# 使用 XAI
aigne run --model xai:grok-beta
```

### 启用详细日志

调试时查看详细日志：

```bash
aigne run --verbose

# 或设置特定日志级别
aigne run --log-level debug
```

### 组合使用选项

```bash
aigne run ./my-agent --entry-agent chatbot --model openai:gpt-4o --verbose
```

## 交互界面

运行 Agent 后，会进入交互式聊天界面：

![运行聊天界面](../../../../assets/run/run-default-template-project-in-chat-mode.png)

### 聊天界面功能

- **发送消息**：输入文本后按回车
- **多行输入**：某些情况下支持多行文本输入
- **查看响应**：Agent 的回复会实时显示
- **退出**：输入 `exit`、`quit` 或按 `Ctrl+C`

### 会话管理

在聊天会话中，Agent 会：
- 保持对话上下文
- 调用配置的工具
- 使用系统提示词指导行为

## 运行流程

<!-- afs:image id="img-004" key="run-command-flow" desc="Run command execution flow: load config → initialize agent → setup model → start chat loop → process messages → exit" -->

`aigne run` 命令的执行流程：

1. **加载配置**：读取 `aigne.yaml` 和环境变量
2. **解析参数**：处理命令行选项
3. **初始化 Agent**：根据配置创建 Agent 实例
4. **设置模型**：配置 AI 模型连接
5. **启动聊天循环**：进入交互式界面
6. **处理消息**：接收用户输入，生成 Agent 响应
7. **退出**：用户退出后清理资源

## 环境变量

`run` 命令会自动加载项目目录下的 `.env` 文件，支持的环境变量包括：

### API 密钥

- `OPENAI_API_KEY`：OpenAI API 密钥
- `ANTHROPIC_API_KEY`：Anthropic API 密钥
- `XAI_API_KEY`：XAI API 密钥

### Hub 配置

- `AIGNE_HUB_API_URL`：自定义 AIGNE Hub URL
- `AIGNE_HUB_API_KEY`：AIGNE Hub API 密钥

### 其他配置

- `PORT`：默认端口（如果 Agent 需要启动服务）

## 远程运行模式

从 URL 运行 Agent 时的特殊行为：

### 支持的 URL 格式

- **GitHub 仓库**：`https://github.com/user/repo/archive/main.zip`
- **直接下载链接**：任何可下载的压缩包 URL

### 缓存机制

远程项目会被下载到：
```
~/.aigne/<hostname>/<pathname>/
```

例如：
```
~/.aigne/github.com/user/repo/
```

缓存目录可通过 `--cache-dir` 选项自定义。

### 自动更新

每次运行时，会重新下载项目以确保使用最新版本。

## 多 Agent 支持

如果 `aigne.yaml` 中定义了多个 Agent：

```yaml
agents:
  - name: chatbot
    model: openai:gpt-4o-mini
    description: 聊天机器人
  
  - name: coder
    model: openai:gpt-4o
    description: 代码助手
```

可以选择运行特定 Agent：

```bash
# 运行 chatbot
aigne run --entry-agent chatbot

# 运行 coder
aigne run --entry-agent coder
```

## CLI Agent

AIGNE 支持定义 CLI 专用的 Agent，这些 Agent 可以接受命令行参数：

```bash
aigne run <agent-name> [agent-specific-options]
```

CLI Agent 可以用于：
- 批处理任务
- 自动化脚本
- 与其他工具集成

## 常见问题

### Agent 无法启动

**可能原因**：
- API 密钥未配置或无效
- 网络连接问题
- 配置文件格式错误

**解决方案**：
1. 检查 `.env` 文件中的 API 密钥
2. 使用 `--verbose` 查看详细错误信息
3. 验证 `aigne.yaml` 格式
4. 测试网络连接

### 找不到 Agent

**问题**：提示 "Entry agent does not exist"

**解决方案**：
- 检查 Agent 名称拼写
- 确认 `aigne.yaml` 中定义了该 Agent
- 使用 `--entry-agent` 明确指定 Agent

### 模型响应慢

**可能原因**：
- 网络延迟
- 模型负载高
- 复杂的系统提示词

**优化建议**：
- 使用更快的模型（如 `gpt-4o-mini`）
- 优化系统提示词长度
- 检查网络连接质量

### URL 模式下载失败

**问题**：无法从 URL 下载项目

**解决方案**：
- 检查 URL 是否可访问
- 验证 URL 格式正确
- 检查防火墙和代理设置
- 使用 `--verbose` 查看详细错误

## 导航

### 父主题

- [命令参考](../commands.md) - 返回命令列表

### 前置条件

- [create 命令](./create.md) - 创建项目后再运行
- [安装指南](../installation.md) - 确保已安装 AIGNE CLI

### 相关主题

- [test 命令](./test.md) - 测试 Agent
- [serve-mcp 命令](./serve-mcp.md) - 将 Agent 作为服务运行
- [配置说明](../configuration.md) - 配置选项详解

### 下一步

- [test 命令](./test.md) - 测试您的 Agent
- [eval 命令](./eval.md) - 评估 Agent 性能
