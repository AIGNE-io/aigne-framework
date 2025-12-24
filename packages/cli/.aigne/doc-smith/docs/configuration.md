# 配置和环境

`@aigne/cli` 支持通过环境变量、配置文件和命令行选项进行灵活配置。

## 环境变量

### AI 模型配置

#### OpenAI

```bash
# API 密钥（必需）
export OPENAI_API_KEY=sk-xxx

# 自定义 API 端点（可选）
export OPENAI_API_URL=https://api.openai.com/v1

# 默认模型（可选）
export MODEL=openai:gpt-4o-mini
```

#### Anthropic (Claude)

```bash
# API 密钥
export ANTHROPIC_API_KEY=sk-ant-xxx

# 自定义 API 端点
export ANTHROPIC_API_URL=https://api.anthropic.com

# 默认模型
export MODEL=anthropic:claude-3-5-sonnet-20241022
```

#### XAI

```bash
# API 密钥
export XAI_API_KEY=xai-xxx

# 默认模型
export MODEL=xai:grok-beta
```

### 图像模型配置

```bash
# 图像生成模型
export IMAGE_MODEL=dall-e-3

# OpenAI 图像 API（默认使用 OPENAI_API_KEY）
export OPENAI_API_KEY=sk-xxx
```

### 日志配置

```bash
# 日志级别：debug, info, warn, error
export LOG_LEVEL=info

# 详细日志（等同于 LOG_LEVEL=debug）
export VERBOSE=true
```

### AIGNE Hub 配置

```bash
# Hub URL
export AIGNE_HUB_URL=https://hub.aigne.io

# Hub API 密钥
export AIGNE_HUB_API_KEY=your-api-key
```

### 可观察性配置

```bash
# 启用/禁用可观察性
export AIGNE_OBSERVABILITY_ENABLED=true

# 自定义数据库路径
export AIGNE_OBSERVABILITY_DB_PATH=/custom/path/observability.db
```

### 其他配置

```bash
# MCP 服务器端口
export PORT=3000

# Node 环境
export NODE_ENV=production

# 代理配置（用于网络请求）
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

## 配置文件

### .env 文件

在项目根目录创建 `.env` 文件，CLI 会自动加载：

```bash
# .env
OPENAI_API_KEY=sk-xxx
MODEL=openai:gpt-4o-mini
LOG_LEVEL=info
AIGNE_HUB_URL=https://hub.aigne.io
```

#### .env 文件变体

支持多种环境的配置文件：

```bash
.env                # 所有环境通用
.env.local          # 本地覆盖（不应提交到 Git）
.env.development    # 开发环境
.env.test           # 测试环境
.env.production     # 生产环境
```

加载优先级（从高到低）：
1. `.env.{NODE_ENV}.local`
2. `.env.{NODE_ENV}`
3. `.env.local`
4. `.env`

### aigne.yaml

项目主配置文件：

```yaml
# aigne.yaml
name: my-agent
version: 1.0.0

# 默认模型配置
model: openai:gpt-4o-mini
temperature: 0.7
topP: 1.0

# AIGNE Hub 配置
aigneHubUrl: https://hub.aigne.io

# 代理定义
agents:
  - name: chatAgent
    systemPrompt: |
      你是一个友好的助手。
    tools:
      - name: search
        description: 搜索信息
```

## 模型配置

### 支持的模型提供商

| 提供商 | 前缀 | 示例 |
|--------|------|------|
| OpenAI | `openai` | `openai:gpt-4o-mini` |
| Anthropic | `anthropic` | `anthropic:claude-3-5-sonnet-20241022` |
| XAI | `xai` | `xai:grok-beta` |

### 模型参数

#### 通用参数

```bash
# 命令行指定
aigne run \
  --model openai:gpt-4o-mini \
  --temperature 0.7 \
  --top-p 1.0
```

在 `aigne.yaml` 中配置：

```yaml
model: openai:gpt-4o-mini
temperature: 0.7
topP: 1.0
frequencyPenalty: 0.0
presencePenalty: 0.0
parallelToolCalls: true
```

#### OpenAI 特定参数

```yaml
model: openai:gpt-4o-mini
reasoningEffort: medium  # o1 系列模型的推理级别
modalities: [text, image]  # 支持的模态
preferInputFileType: image/jpeg
```

### 自定义 API 端点

#### 使用兼容 OpenAI 的端点

```bash
# 设置自定义端点
export OPENAI_API_URL=https://your-api.example.com/v1
export OPENAI_API_KEY=your-key

# 运行代理
aigne run --model openai:gpt-4o-mini
```

#### 配置文件方式

```yaml
# aigne.yaml
model:
  provider: openai
  model: gpt-4o-mini
  apiUrl: https://your-api.example.com/v1
  apiKey: ${OPENAI_API_KEY}  # 从环境变量读取
```

## 配置优先级

配置的优先级（从高到低）：

1. **命令行选项**：`aigne run --model openai:gpt-4`
2. **环境变量**：`export MODEL=openai:gpt-4`
3. **项目配置文件**：`aigne.yaml`
4. **默认值**：CLI 内置默认值

### 示例

```bash
# 1. aigne.yaml 中配置
model: openai:gpt-4o-mini

# 2. 环境变量覆盖
export MODEL=anthropic:claude-3-5-sonnet-20241022

# 3. 命令行选项最终覆盖
aigne run --model openai:gpt-4

# 最终使用：openai:gpt-4
```

## 最佳实践

### 1. 使用 .env 文件

```bash
# .env
OPENAI_API_KEY=sk-xxx
LOG_LEVEL=info
```

不要提交包含敏感信息的 `.env` 文件到 Git：

```bash
# .gitignore
.env
.env.local
.env.*.local
```

### 2. 提供 .env.example

```bash
# .env.example
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
MODEL=openai:gpt-4o-mini
LOG_LEVEL=info
AIGNE_HUB_URL=https://hub.aigne.io
```

团队成员可以复制并填写：

```bash
cp .env.example .env
# 编辑 .env 填写实际的 API 密钥
```

### 3. 环境分离

```bash
# 开发环境
NODE_ENV=development aigne run

# 生产环境
NODE_ENV=production aigne serve-mcp
```

### 4. 使用密钥管理工具

#### AWS Secrets Manager

```bash
# 从 AWS Secrets Manager 获取密钥
export OPENAI_API_KEY=$(aws secretsmanager get-secret-value \
  --secret-id openai-api-key \
  --query SecretString \
  --output text)

aigne run
```

#### Docker Secrets

```yaml
# docker-compose.yml
version: '3.8'
services:
  agent:
    image: my-agent:latest
    environment:
      OPENAI_API_KEY_FILE: /run/secrets/openai_key
    secrets:
      - openai_key

secrets:
  openai_key:
    external: true
```

### 5. 配置验证

创建启动脚本验证配置：

```bash
#!/bin/bash
# start.sh

# 检查必需的环境变量
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY is not set"
  exit 1
fi

if [ -z "$MODEL" ]; then
  echo "Warning: MODEL not set, using default"
  export MODEL=openai:gpt-4o-mini
fi

# 启动服务
aigne serve-mcp
```

## 配置模板

### 开发环境

```bash
# .env.development
OPENAI_API_KEY=sk-dev-xxx
MODEL=openai:gpt-4o-mini
LOG_LEVEL=debug
AIGNE_OBSERVABILITY_ENABLED=true
NODE_ENV=development
```

### 测试环境

```bash
# .env.test
OPENAI_API_KEY=sk-test-xxx
MODEL=openai:gpt-4o-mini
LOG_LEVEL=warn
AIGNE_OBSERVABILITY_ENABLED=false
NODE_ENV=test
```

### 生产环境

```bash
# .env.production
OPENAI_API_KEY=sk-prod-xxx
MODEL=openai:gpt-4
LOG_LEVEL=error
AIGNE_OBSERVABILITY_ENABLED=true
AIGNE_HUB_URL=https://hub.aigne.io
NODE_ENV=production
```

## 常见问题

### Q: 如何在不同环境使用不同配置？

A: 使用环境特定的 .env 文件：

```bash
# 开发
NODE_ENV=development aigne run

# 生产
NODE_ENV=production aigne serve-mcp
```

### Q: API 密钥如何安全存储？

A: 推荐方法：
1. 使用环境变量（不提交到 Git）
2. 使用密钥管理服务（AWS Secrets Manager、HashiCorp Vault）
3. 使用容器秘密（Docker Secrets、Kubernetes Secrets）

### Q: 如何验证配置是否正确？

A: 使用 verbose 模式查看配置：

```bash
aigne run --verbose
```

输出会显示使用的模型、API 端点等配置信息。

### Q: 配置文件可以使用环境变量吗？

A: 可以，使用 `${VAR_NAME}` 语法：

```yaml
# aigne.yaml
model: ${MODEL:-openai:gpt-4o-mini}  # 默认值
apiKey: ${OPENAI_API_KEY}
```

## 下一步

- 查看 [命令参考](/commands.md) 了解命令行选项
- 查看 [使用场景](/use-cases.md) 查看实际配置示例
- 查看 [常见问题](/faq.md) 解决配置问题

---

**相关文档：**
- [快速开始](/getting-started.md) - 基本安装和配置
- [命令参考](/commands.md) - 命令行选项
- [使用场景](/use-cases.md) - 实际应用示例
