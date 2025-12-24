# 快速开始

**前置条件：** 安装 Node.js（推荐使用 LTS 版本）

本指南将帮助您在 5 分钟内安装 `@aigne/cli` 并运行您的第一个 AIGNE 代理。

## 安装

`@aigne/cli` 可以通过多种包管理器全局安装：

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

安装完成后，验证安装：

```bash
aigne --version
```

您应该看到版本号输出，例如 `1.59.0-beta.3`。

## 查看帮助

查看所有可用命令：

```bash
aigne --help
```

查看特定命令的帮助：

```bash
aigne create --help
aigne run --help
```

## 创建您的第一个项目

使用 `create` 命令创建新项目：

```bash
aigne create my-first-agent
```

CLI 会引导您完成交互式创建流程：

1. **项目名称**：输入项目名称（默认为 `my-first-agent`）
2. **选择模板**：目前支持 `default` 模板

创建完成后，进入项目目录：

```bash
cd my-first-agent
```

## 运行您的第一个代理

在项目目录中运行代理：

```bash
aigne run
```

这将：
1. 加载项目中的代理配置
2. 启动交互式对话界面
3. 等待您的输入

现在您可以与代理对话了！输入您的问题或命令，按 Enter 发送。

## 指定代理运行

如果项目中有多个代理，可以指定运行哪一个：

```bash
aigne run --entry-agent myAgent
```

或者使用简化语法：

```bash
aigne run myAgent
```

## 运行远程代理

您也可以直接从 URL 运行代理：

```bash
aigne run --url https://example.com/aigne-project
```

CLI 会自动下载并缓存远程项目到 `~/.aigne/` 目录。

## 常用选项

### 指定模型

使用 `--model` 选项指定 AI 模型：

```bash
# 使用默认的 OpenAI 模型
aigne run --model openai

# 使用特定的 GPT-4 模型
aigne run --model openai:gpt-4o-mini
```

### 启用详细日志

使用 `--verbose` 选项查看详细日志：

```bash
aigne run --verbose
```

### 非交互式运行

使用 `--chat` 选项控制是否启动交互式对话：

```bash
aigne run --chat false
```

## 下一步

现在您已经成功运行了第一个 AIGNE 代理，可以：

- 查看 [命令参考](/commands.md) 了解所有命令的详细用法
- 探索 [使用场景](/use-cases.md) 学习更多实际应用
- 阅读 [配置和环境](/configuration.md) 了解如何配置模型和环境变量
- 尝试 [serve-mcp 命令](/commands/serve-mcp.md) 将代理作为服务运行

---

**相关文档：**
- [create 命令](/commands/create.md) - 详细的项目创建说明
- [run 命令](/commands/run.md) - 运行代理的完整选项
- [配置和环境](/configuration.md) - 环境变量和模型配置
