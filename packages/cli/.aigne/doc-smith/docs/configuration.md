# 配置说明

本文档介绍 AIGNE CLI 的配置选项和环境变量，帮助您根据需求定制 CLI 行为。

## 环境变量

AIGNE CLI 支持通过环境变量进行配置。可以在项目目录的 `.env` 文件中设置这些变量。

### 模型 API 配置

#### OpenAI

```env
# OpenAI API 配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，自定义 API 端点
```

#### Anthropic Claude

```env
# Anthropic API 配置
ANTHROPIC_API_KEY=your-anthropic-api-key
```

#### XAI

```env
# XAI API 配置
XAI_API_KEY=your-xai-api-key
```

### AIGNE Hub 配置

```env
# AIGNE Hub 服务 URL
AIGNE_HUB_API_URL=https://hub.aigne.io/ai-kit

# AIGNE Hub API 密钥（通过 hub connect 自动配置）
AIGNE_HUB_API_KEY=your-hub-api-key
```

### 服务端口配置

```env
# MCP 服务器端口
PORT=3000

# 可观测性服务器端口（默认 7890）
# 注意：如果同时运行多个服务，需要使用不同端口
```

### 代理配置

如果需要通过代理访问外部 API：

```env
# HTTP 代理
HTTP_PROXY=http://proxy.example.com:8080

# HTTPS 代理
HTTPS_PROXY=https://proxy.example.com:8080

# 不使用代理的主机列表
NO_PROXY=localhost,127.0.0.1
```

### 日志配置

```env
# 日志级别：debug, info, warn, error
LOG_LEVEL=info

# 在测试环境可以使用 debug 级别
# LOG_LEVEL=debug
```

### 其他配置

```env
# Node 环境
NODE_ENV=production  # 或 development, test

# 缓存目录（用于远程项目）
CACHE_DIR=/custom/cache/path
```

## 命令行选项

大部分配置都可以通过命令行选项覆盖环境变量。

### 全局选项

所有命令都支持：

```bash
--help, -h          # 显示帮助信息
--version, -v       # 显示版本号
```

### 日志选项

```bash
--verbose           # 启用详细日志输出
--log-level <level> # 设置日志级别（debug, info, warn, error）
```

使用示例：

```bash
aigne run --verbose
aigne run --log-level debug
```

### 模型选项

以下选项可用于 `run` 和相关命令：

#### 基本模型配置

```bash
--model <provider[:model]>        # 指定 AI 模型
--image-model <provider[:model]>  # 指定图像模型
```

示例：

```bash
# 使用 OpenAI GPT-4o
aigne run --model openai:gpt-4o

# 使用 Claude
aigne run --model anthropic:claude-3-5-sonnet

# 使用 XAI Grok
aigne run --model xai:grok-beta
```

#### 高级模型参数

```bash
--temperature <number>           # 温度参数 (0.0-2.0)
--top-p <number>                 # Top P 参数 (0.0-1.0)
--presence-penalty <number>      # 存在惩罚 (-2.0 - 2.0)
--frequency-penalty <number>     # 频率惩罚 (-2.0 - 2.0)
```

参数说明：

- **temperature**：控制输出随机性
  - 低值（0.0-0.3）：更确定、一致的输出
  - 中值（0.7-0.9）：平衡的创造性
  - 高值（1.0-2.0）：更多样、创造性的输出

- **top-p**：核采样参数
  - 控制输出的多样性
  - 通常与 temperature 一起使用

- **presence-penalty**：惩罚重复的 token
  - 正值鼓励谈论新主题
  - 负值鼓励保持主题

- **frequency-penalty**：惩罚高频 token
  - 正值减少重复
  - 负值允许更多重复

使用示例：

```bash
# 创造性写作（高 temperature）
aigne run --model openai:gpt-4o --temperature 1.5

# 精确回答（低 temperature）
aigne run --model openai:gpt-4o --temperature 0.2

# 组合使用多个参数
aigne run \
  --model openai:gpt-4o \
  --temperature 0.8 \
  --top-p 0.9 \
  --presence-penalty 0.5
```

### 输入选项

```bash
--input <text>, -i <text>        # 命令行输入
--input-file <file>              # 从文件读取输入
```

使用示例：

```bash
# 命令行输入
aigne run myAgent --input "Hello, world!"

# 从文件读取
aigne run myAgent --input-file input.txt

# 使用 @ 符号
aigne run myAgent --input @input.txt

# 多个输入
aigne run myAgent --input "First input" --input "Second input"
```

## 配置文件

### aigne.yaml

项目的核心配置文件，定义 Agent 的行为。

#### 基本结构

```yaml
name: my-agent
description: Agent 描述

# 默认模型配置
model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.7

# Agent 定义
agents:
  - name: chatbot
    model:
      provider: openai
      name: gpt-4o
    description: 聊天机器人
    instructions: |
      你是一个友好的助手。
    tools:
      - search
      - calculator

# 工具定义
tools:
  - name: search
    description: 搜索工具
    # ...

# CLI 专用 Agent
cli:
  chat:
    agent: chatbot
```

#### 模型配置

可以在不同级别配置模型：

```yaml
# 全局默认模型
model:
  provider: openai
  name: gpt-4o-mini

agents:
  # Agent 级别覆盖
  - name: writer
    model:
      provider: anthropic
      name: claude-3-5-sonnet
      temperature: 1.2
    
  # 使用全局模型
  - name: analyst
    # 未指定 model，使用全局配置
```

#### 环境变量引用

在 `aigne.yaml` 中引用环境变量：

```yaml
model:
  provider: openai
  apiKey: ${OPENAI_API_KEY}
  baseURL: ${OPENAI_BASE_URL}
```

### .env 文件

环境变量配置文件，存储敏感信息。

#### 示例 .env

```env
# API 密钥
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Hub 配置
AIGNE_HUB_API_URL=https://hub.aigne.io/ai-kit

# 自定义配置
MY_CUSTOM_VAR=value
```

#### .env 文件优先级

AIGNE CLI 使用 `dotenv-flow`，支持多个 `.env` 文件：

```
.env                 # 默认配置
.env.local           # 本地覆盖（不应提交到版本控制）
.env.development     # 开发环境
.env.test            # 测试环境
.env.production      # 生产环境
```

加载顺序（后者覆盖前者）：
1. `.env`
2. `.env.<NODE_ENV>`
3. `.env.local`
4. `.env.<NODE_ENV>.local`

#### .gitignore 配置

建议在 `.gitignore` 中排除敏感文件：

```gitignore
# 环境变量
.env.local
.env.*.local

# API 密钥
*.key
secrets/
```

## 可用模型

### 聊天模型

AIGNE CLI 支持以下模型提供商：

| 提供商 | 标识符 | 示例模型 |
|--------|--------|----------|
| OpenAI | `openai` | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo` |
| Anthropic | `anthropic` | `claude-3-5-sonnet`, `claude-3-opus` |
| XAI | `xai` | `grok-beta` |
| Google | `google` | `gemini-pro` |

### 图像模型

| 提供商 | 标识符 | 示例模型 |
|--------|--------|----------|
| OpenAI | `openai` | `dall-e-3`, `dall-e-2` |

### 模型格式

命令行指定模型的格式：

```
provider[:model]
```

- **provider**：必需，模型提供商
- **model**：可选，具体模型名称
  - 如果省略，使用提供商的默认模型

示例：

```bash
# 使用 OpenAI 默认模型
aigne run --model openai

# 指定具体模型
aigne run --model openai:gpt-4o

# 使用 Anthropic
aigne run --model anthropic:claude-3-5-sonnet
```

## 配置最佳实践

### 1. 安全管理

- **不要提交密钥**：API 密钥不应提交到版本控制
- **使用 .env.local**：本地配置使用 `.env.local`
- **权限控制**：限制配置文件的访问权限

### 2. 环境分离

为不同环境使用不同配置：

```bash
# 开发环境
NODE_ENV=development aigne run

# 生产环境
NODE_ENV=production aigne run
```

### 3. 配置模板

提供配置模板而非实际配置：

```env
# .env.example
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
AIGNE_HUB_API_URL=https://hub.aigne.io/ai-kit
```

用户复制并填写实际值：

```bash
cp .env.example .env
# 编辑 .env 填写实际密钥
```

### 4. 文档化配置

在 README 中说明：
- 需要哪些环境变量
- 如何获取 API 密钥
- 可选配置项

### 5. 验证配置

在代码中验证必需的配置：

```javascript
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}
```

## 配置调试

### 查看加载的配置

使用 `--verbose` 选项查看配置加载过程：

```bash
aigne run --verbose
```

### 测试不同配置

临时覆盖环境变量：

```bash
# Linux/macOS
OPENAI_API_KEY=test-key aigne run

# Windows (PowerShell)
$env:OPENAI_API_KEY="test-key"; aigne run
```

### 配置验证

创建测试脚本验证配置：

```javascript
// test-config.js
import { loadAIGNE } from '@aigne/cli';

const aigne = await loadAIGNE({ path: '.' });
console.log('Model:', aigne.model);
console.log('Agents:', aigne.agents.map(a => a.name));
```

## 常见配置问题

### API 密钥无效

**问题**：API 调用失败

**检查**：
- 确认密钥格式正确
- 检查密钥是否过期
- 验证密钥权限

### 模型不可用

**问题**：指定的模型无法使用

**检查**：
- 确认模型名称正确
- 检查 API 密钥权限
- 查看提供商文档

### 配置未生效

**问题**：修改配置后没有变化

**检查**：
- 确认 `.env` 文件位置
- 重启命令行工具
- 检查配置优先级

### 端口冲突

**问题**：服务无法启动，端口被占用

**解决**：
- 更改 `PORT` 环境变量
- 使用 `--port` 选项
- 停止占用端口的进程

## 导航

### 父主题

- [概述](./overview.md) - 返回 AIGNE CLI 概述

### 相关主题

- [快速开始](./getting-started.md) - 快速配置和使用
- [命令参考](./commands.md) - 查看所有命令选项

### 下一步

- [run 命令](./commands/run.md) - 使用配置运行 Agent
- [hub 命令](./commands/hub.md) - 配置 Hub 连接
