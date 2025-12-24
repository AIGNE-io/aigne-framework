# 配置

> **前置条件**: [快速开始](./getting-started.md) - 了解基本安装和使用

## 概述

AIGNE CLI 通过环境变量、配置文件和命令行选项提供灵活的配置方式。本文档详细说明所有可用的配置选项。

## 配置方式

### 优先级

配置的优先级（从高到低）：

1. **命令行参数** - 直接传递给命令的参数
2. **环境变量** - 系统或 `.env` 文件中设置的变量
3. **配置文件** - `aigne.yaml` 或项目配置文件
4. **默认值** - 内置的默认配置

### 配置来源

```bash
# 1. 命令行参数（最高优先级）
aigne run --model openai:gpt-4

# 2. 环境变量
export OPENAI_API_KEY=sk-...
aigne run

# 3. .env 文件
# 在项目根目录创建 .env
OPENAI_API_KEY=sk-...

# 4. 配置文件
# aigne.yaml 中的配置
```

## 环境变量

### AI 模型 API 密钥

#### OPENAI_API_KEY

OpenAI API 密钥，用于访问 GPT 系列模型。

```bash
export OPENAI_API_KEY=sk-...
```

获取方式：https://platform.openai.com/api-keys

支持的模型：
- `gpt-4`
- `gpt-4-turbo`
- `gpt-4o`
- `gpt-4o-mini`
- `gpt-3.5-turbo`

#### ANTHROPIC_API_KEY

Anthropic API 密钥，用于访问 Claude 系列模型。

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

获取方式：https://console.anthropic.com/

支持的模型：
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`
- `claude-3-5-sonnet-20240620`

#### XAI_API_KEY

XAI API 密钥，用于访问 Grok 系列模型。

```bash
export XAI_API_KEY=xai-...
```

支持的模型：
- `grok-beta`
- `grok-vision-beta`

### AIGNE Hub 配置

#### AIGNE_HUB_API_URL

AIGNE Hub 服务的 API 地址。

```bash
export AIGNE_HUB_API_URL=https://hub.aigne.io/ai-kit
```

默认值：https://hub.aigne.io/ai-kit

#### AIGNE_HUB_API_KEY

AIGNE Hub 的 API 密钥。

```bash
export AIGNE_HUB_API_KEY=your-hub-api-key
```

通过 `aigne hub connect` 命令连接后自动配置。

### 模型配置

#### MODEL

默认使用的聊天模型。

```bash
export MODEL=openai:gpt-4
```

格式：`<provider>:<model-name>`

示例：
- `openai:gpt-4`
- `anthropic:claude-3-sonnet-20240229`
- `xai:grok-beta`

#### IMAGE_MODEL

默认使用的图像模型。

```bash
export IMAGE_MODEL=openai:dall-e-3
```

### 服务端口配置

#### PORT

MCP 服务器和可观测性服务器的默认端口。

```bash
export PORT=3000
```

影响的命令：
- `aigne serve-mcp` - 默认端口为 3000
- `aigne observe` - 默认端口为 7890

### 其他环境变量

#### INITIAL_CALL

agent 启动时的初始调用消息。

```bash
export INITIAL_CALL="开始处理任务"
aigne run
```

#### NODE_ENV

Node.js 环境标识。

```bash
export NODE_ENV=production
aigne run
```

常用值：
- `development` - 开发环境
- `production` - 生产环境
- `test` - 测试环境

#### CI

持续集成环境标识。

```bash
export CI=true
```

在 CI 环境中会禁用某些交互式功能。

## .env 文件

### 基本用法

在项目根目录创建 `.env` 文件：

```bash
# .env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MODEL=openai:gpt-4
PORT=3000
```

### .env 文件类型

AIGNE CLI 使用 `dotenv-flow`，支持多个环境文件：

```
.env                # 所有环境的默认配置
.env.local          # 本地覆盖（不应提交到 Git）
.env.development    # 开发环境
.env.production     # 生产环境
.env.test           # 测试环境
```

### 加载顺序

根据 `NODE_ENV` 加载不同的文件：

```bash
# 开发环境
NODE_ENV=development aigne run
# 加载: .env, .env.development, .env.local

# 生产环境
NODE_ENV=production aigne run
# 加载: .env, .env.production, .env.local
```

### 示例配置

#### .env (基础配置)

```bash
# API 密钥（可以为空，在 .env.local 中覆盖）
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# 默认模型
MODEL=openai:gpt-4o-mini

# 服务端口
PORT=3000
```

#### .env.local (本地配置)

```bash
# 本地 API 密钥
OPENAI_API_KEY=sk-your-local-key
ANTHROPIC_API_KEY=sk-ant-your-local-key

# 本地 Hub 配置
AIGNE_HUB_API_URL=http://localhost:8080
```

#### .env.production (生产配置)

```bash
# 生产环境使用更强大的模型
MODEL=openai:gpt-4

# 生产端口
PORT=8080

# 生产 Hub
AIGNE_HUB_API_URL=https://hub.aigne.io
```

### .gitignore 配置

确保敏感信息不被提交：

```gitignore
# .gitignore
.env.local
.env.*.local
```

保留示例文件：

```bash
# 提交 .env.example 作为模板
.env.example
```

## 配置文件

### aigne.yaml

项目的主配置文件。

```yaml
# aigne.yaml
name: my-agent-project
version: 1.0.0

# 默认模型
model: openai:gpt-4

# Agents 配置
agents:
  - name: assistantAgent
    description: 通用助手 agent
    model: openai:gpt-4o-mini
    temperature: 0.7

  - name: codeAgent
    description: 代码生成 agent
    model: anthropic:claude-3-sonnet-20240229
    temperature: 0.2

# 工具配置
tools:
  - calculator
  - web-search

# 内存配置
memory:
  type: default
  ttl: 3600
```

### 配置项说明

#### 项目信息

```yaml
name: my-project        # 项目名称
version: 1.0.0          # 项目版本
description: 项目描述   # 项目描述
```

#### 模型配置

```yaml
model: openai:gpt-4     # 默认模型
temperature: 0.7        # 温度参数 (0-2)
topP: 1.0               # Top-P 采样
frequencyPenalty: 0     # 频率惩罚
presencePenalty: 0      # 存在惩罚
```

#### Agent 配置

```yaml
agents:
  - name: myAgent               # Agent 名称
    description: Agent 描述     # Agent 描述
    model: openai:gpt-4         # 使用的模型
    temperature: 0.7            # 温度参数
    tools:                      # 可用工具列表
      - calculator
      - web-search
    prompt: |                   # 系统提示词
      你是一个有帮助的助手...
```

#### 工具配置

```yaml
tools:
  - name: calculator            # 工具名称
    enabled: true               # 是否启用

  - name: web-search
    config:                     # 工具配置
      maxResults: 10
```

#### 内存配置

```yaml
memory:
  type: default                 # 内存类型
  ttl: 3600                     # 过期时间（秒）
  maxSize: 1000                 # 最大条目数
```

## 命令行参数

### 全局参数

所有命令通用的参数：

```bash
--help, -h          # 显示帮助
--version, -v       # 显示版本
```

### run 命令参数

```bash
--model <provider[:model]>      # 指定模型
--verbose                       # 详细日志
--log-level <level>             # 日志级别
--chat                          # 聊天模式
```

示例：

```bash
aigne run --model openai:gpt-4 --verbose
```

### serve-mcp 命令参数

```bash
--host <host>                   # 主机地址
--port <port>                   # 端口
--pathname <pathname>           # 路径名
--aigne-hub-url <url>           # Hub URL
```

示例：

```bash
aigne serve-mcp --host 0.0.0.0 --port 8080 --pathname /api
```

### observe 命令参数

```bash
--host <host>                   # 主机地址
--port <port>                   # 端口
```

示例：

```bash
aigne observe --port 7890
```

### eval 命令参数

```bash
--dataset <path>                # 数据集路径
--evaluator <name>              # 评估器名称
--concurrency <number>          # 并发数
--output, -o <path>             # 输出文件
```

示例：

```bash
aigne eval myAgent --dataset data.csv --concurrency 5 -o results.csv
```

## 模型参数详解

### temperature

控制输出的随机性。

- **范围**: 0.0 - 2.0
- **默认值**: 1.0
- **用途**:
  - 0.0: 最确定性的输出
  - 0.7: 平衡创造性和一致性
  - 1.5+: 更有创造性的输出

```yaml
agents:
  - name: creativeAgent
    temperature: 1.5    # 高温度，更有创造性

  - name: preciseAgent
    temperature: 0.2    # 低温度，更精确
```

### topP

Top-P 采样（核采样）。

- **范围**: 0.0 - 1.0
- **默认值**: 1.0
- **用途**: 控制输出的多样性

```yaml
topP: 0.9
```

### frequencyPenalty

频率惩罚，减少重复内容。

- **范围**: -2.0 - 2.0
- **默认值**: 0.0

```yaml
frequencyPenalty: 0.5
```

### presencePenalty

存在惩罚，鼓励讨论新话题。

- **范围**: -2.0 - 2.0
- **默认值**: 0.0

```yaml
presencePenalty: 0.6
```

## 最佳实践

### 1. 安全管理 API 密钥

```bash
# ✓ 好：使用 .env.local
echo "OPENAI_API_KEY=sk-..." > .env.local

# ✗ 不好：硬编码在代码中
# aigne.yaml
model: openai:gpt-4
apiKey: sk-...  # 不要这样做！
```

### 2. 环境分离

```bash
# 开发环境
NODE_ENV=development aigne run

# 生产环境
NODE_ENV=production aigne run
```

### 3. 使用 .env.example

```bash
# .env.example
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
MODEL=openai:gpt-4o-mini
PORT=3000
```

团队成员可以复制并填写实际值：

```bash
cp .env.example .env
# 然后编辑 .env 填写真实的 API 密钥
```

### 4. 版本控制

```.gitignore
# 不要提交敏感信息
.env
.env.local
.env.*.local

# 提交配置模板
!.env.example
```

### 5. 成本控制

```yaml
# 开发环境使用较便宜的模型
agents:
  - name: devAgent
    model: openai:gpt-4o-mini  # 更便宜

# 生产环境使用更强大的模型
agents:
  - name: prodAgent
    model: openai:gpt-4        # 更强大
```

## 故障排查

### API 密钥未配置

**问题**：
```
Error: API key not configured
```

**解决方法**：
1. 检查 `.env` 文件是否存在
2. 确认环境变量名称正确
3. 验证 API 密钥有效性

### 环境变量未加载

**问题**：
环境变量设置了但未生效。

**解决方法**：
1. 确认在正确的目录运行命令
2. 检查 `.env` 文件格式
3. 尝试直接导出环境变量：
   ```bash
   export OPENAI_API_KEY=sk-...
   ```

### 配置冲突

**问题**：
多个配置来源导致行为不一致。

**解决方法**：
1. 理解配置优先级
2. 使用 `--verbose` 查看实际配置
3. 检查所有配置文件

## 参考

### 相关文档

- [快速开始](./getting-started.md#配置环境变量) - 基本配置步骤
- [命令参考](./commands.md) - 各命令的参数说明

### 外部资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic API 文档](https://docs.anthropic.com)
- [dotenv-flow 文档](https://github.com/kerimdzhanov/dotenv-flow)
