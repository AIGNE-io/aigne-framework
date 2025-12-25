# 快速开始

本指南将帮助您快速创建并运行您的第一个 AIGNE 项目。

## 前置条件

在开始之前，请确保您已：

- [安装 AIGNE CLI](./installation.md)
- 准备好模型 API 密钥（如 OpenAI API Key）

## 步骤 1：创建项目

使用 `aigne create` 命令创建一个新项目：

```bash
aigne create
```

该命令会启动交互式创建流程，引导您完成项目初始化：

1. **输入项目名称**：系统会提示您输入项目名称，默认为 `my-aigne-project`

   ![创建项目交互界面](../../../assets/create/create-project-interactive-project-name-prompt.png)

2. **选择项目模板**：目前支持默认模板，后续会添加更多模板选项

3. **创建成功**：项目创建完成后，您会看到成功消息

   ![创建成功消息](../../../assets/create/create-project-using-default-template-success-message.png)

### 指定项目路径

您也可以直接指定项目路径：

```bash
aigne create my-first-agent
```

这将在当前目录下创建一个名为 `my-first-agent` 的项目文件夹。

## 步骤 2：查看项目结构

创建的项目包含以下文件结构：

```
my-first-agent/
├── aigne.yaml          # AIGNE 配置文件
├── .env                # 环境变量配置
└── ...                 # 其他项目文件
```

主要文件说明：

- **`aigne.yaml`**：定义 Agent 的配置、模型、工具和行为
- **`.env`**：存储环境变量，如 API 密钥（不要提交到版本控制）

## 步骤 3：配置环境变量

编辑项目目录下的 `.env` 文件，添加您的模型 API 密钥：

```env
# OpenAI API Key
OPENAI_API_KEY=your-api-key-here

# 或使用其他模型提供商
# ANTHROPIC_API_KEY=your-key-here
# XAI_API_KEY=your-key-here
```

## 步骤 4：运行 Agent

进入项目目录并运行 Agent：

```bash
cd my-first-agent
aigne run
```

这将启动交互式聊天界面，您可以与 Agent 进行对话：

![运行聊天界面](../../../assets/run/run-default-template-project-in-chat-mode.png)

### 指定 Agent 运行

如果项目中定义了多个 Agent，您可以指定要运行的 Agent：

```bash
aigne run --entry-agent myAgent
```

### 指定模型

您也可以在运行时指定使用的模型：

```bash
aigne run --model openai:gpt-4o-mini
```

模型格式为 `provider:model`，其中 `model` 是可选的。

## 步骤 5：测试 Agent

如果项目中包含测试文件，您可以运行测试：

```bash
aigne test
```

该命令会自动查找并运行项目目录中的测试文件。

## 快速开始流程图

<!-- afs:image id="img-002" key="getting-started-flow" desc="Getting started workflow flowchart: install CLI → create project → configure env → run agent → test agent" -->

## 下一步

恭喜！您已经成功创建并运行了第一个 AIGNE 项目。接下来您可以：

- [查看命令参考](./commands.md) - 了解所有可用命令的详细信息
- [配置说明](./configuration.md) - 深入了解配置选项
- [运行 MCP 服务](./commands/serve-mcp.md) - 将 Agent 作为 MCP 服务器运行
- [连接 AIGNE Hub](./commands/hub.md) - 管理 Hub 连接并查看信用额度

## 常见问题

### Agent 无法启动

- 检查 `.env` 文件中的 API 密钥是否正确
- 确认网络连接正常
- 使用 `--verbose` 选项查看详细日志：
  ```bash
  aigne run --verbose
  ```

### 找不到 Agent

- 确认 `aigne.yaml` 文件格式正确
- 检查 Agent 名称拼写
- 使用 `aigne run --help` 查看可用选项

## 导航

### 前置条件

- [安装指南](./installation.md) - 确保已安装 AIGNE CLI

### 相关主题

- [命令参考](./commands.md) - 查看所有可用命令
- [配置说明](./configuration.md) - 了解配置选项
