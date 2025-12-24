# 快速开始

> **前置条件**: [概述](./overview.md) - 了解 AIGNE CLI 的核心功能和特性

本指南将帮助您快速安装 AIGNE CLI 并创建第一个 AI agent 项目。

## 安装

AIGNE CLI 可以通过多种包管理器全局安装：

### 使用 npm

```bash
npm install -g @aigne/cli
```

### 使用 yarn

```bash
yarn global add @aigne/cli
```

### 使用 pnpm

```bash
pnpm add -g @aigne/cli
```

## 验证安装

安装完成后，运行以下命令验证安装是否成功：

```bash
aigne --version
```

您应该看到类似 `1.59.0-beta.3` 的版本号输出。

查看帮助信息：

```bash
aigne --help
```

这将显示所有可用的命令和选项。

## 创建第一个项目

使用 `create` 命令创建新的 AIGNE 项目：

### 在当前目录创建

```bash
aigne create
```

运行后会提示您输入项目名称：

```
? Project name: my-first-agent
? Select a template: default
```

### 指定项目路径

您也可以直接指定项目路径：

```bash
aigne create my-first-agent
```

### 项目结构

创建完成后，项目目录结构如下：

```
my-first-agent/
├── agents/           # Agent 定义目录
│   └── example.yml   # 示例 agent 配置
├── .env.example      # 环境变量模板
├── package.json      # 项目配置
└── README.md         # 项目说明
```

## 配置环境变量

在运行 agent 之前，需要配置 AI 模型的 API 密钥。

1. 复制环境变量模板：

```bash
cd my-first-agent
cp .env.example .env
```

2. 编辑 `.env` 文件，添加您的 API 密钥：

```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# XAI
XAI_API_KEY=your_xai_api_key_here
```

根据您使用的模型提供商配置相应的 API 密钥。

## 运行第一个 Agent

配置完成后，运行 agent：

```bash
cd my-first-agent
aigne run
```

这将启动交互式聊天界面，您可以与 agent 进行对话。

### 指定模型

默认情况下，AIGNE CLI 使用配置文件中指定的模型。您也可以通过命令行选项指定：

```bash
# 使用 OpenAI GPT-4
aigne run --model openai:gpt-4

# 使用 Claude 3
aigne run --model anthropic:claude-3-sonnet-20240229
```

### 运行特定 Agent

如果项目中有多个 agents，可以指定要运行的 agent：

```bash
aigne run --entry-agent myAgent
```

或使用简化语法：

```bash
aigne run myAgent
```

## 测试 Agent

运行测试以验证 agent 的功能：

```bash
aigne test
```

这将执行 agent 目录中定义的所有测试用例。

## 启动可观测性服务器

为了监控 agent 的运行状态，可以启动可观测性服务器：

```bash
aigne observe
```

服务器默认在 `http://localhost:7890` 启动，您可以通过浏览器访问监控界面。

## 常见问题

### API 密钥未配置

如果运行时出现 API 密钥相关错误，请检查：

1. `.env` 文件是否存在
2. API 密钥是否正确配置
3. 环境变量名称是否正确

### 端口被占用

如果可观测性服务器端口被占用，可以指定其他端口：

```bash
aigne observe --port 8080
```

### 模型不可用

如果指定的模型不可用，请：

1. 检查 API 密钥是否有效
2. 确认您的账户是否有权限访问该模型
3. 尝试使用其他模型

## 下一步

恭喜！您已经成功创建并运行了第一个 AIGNE agent。接下来可以：

- [基本工作流程](./workflow.md) - 了解完整的开发工作流程
- [命令参考](./commands.md) - 深入了解所有可用命令
- [配置](./configuration.md) - 学习如何配置 AIGNE CLI

## 相关命令

- [`create`](./commands/create.md) - 详细的项目创建说明
- [`run`](./commands/run.md) - Agent 运行选项和高级用法
- [`test`](./commands/test.md) - 测试相关配置
- [`observe`](./commands/observe.md) - 可观测性功能详解
