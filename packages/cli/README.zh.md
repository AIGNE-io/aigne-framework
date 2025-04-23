# @aigne/cli

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/cli)](https://www.npmjs.com/package/@aigne/cli)
[![MIT licensed](https://img.shields.io/npm/l/@aigne/cli)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

[English](README.md) | **中文**

[AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)的命令行工具，提供便捷的开发和管理功能。

## 简介

`@aigne/cli` 是 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)的官方命令行工具，旨在简化 AIGNE 应用的开发、测试和部署流程。它提供了一系列实用命令，帮助开发者快速创建项目、运行代理、测试代码，以及部署应用等。

## 特性

- **项目创建**：快速创建新的 AIGNE 项目，包含预设的文件结构和配置
- **代理运行**：轻松运行和测试 AIGNE 代理
- **测试支持**：内置测试命令，方便进行单元测试和集成测试
- **MCP 服务**：支持将代理作为 MCP 服务器启动，与外部系统集成
- **交互式界面**：美观的命令行界面，提供直观的使用体验
- **多模型支持**：支持 OpenAI、Claude、XAI 等多种模型提供商

## 安装

```bash
# 使用 npm
npm install -g @aigne/cli

# 使用 yarn
yarn global add @aigne/cli

# 使用 pnpm
pnpm add -g @aigne/cli
```

## 基本命令

AIGNE CLI 提供了以下主要命令：

```bash
# 显示帮助信息
aigne --help

# 创建新项目
aigne create [path]

# 运行代理
aigne run [path]

# 运行测试
aigne test [path]

# 启动 MCP 服务器
aigne serve [path] --mcp
```

## 创建命令 (create)

创建一个带有代理配置文件的新 AIGNE 项目。

```bash
# 在当前目录创建项目（会提示输入项目名称）
aigne create

# 在指定路径创建项目
aigne create my-project
```

交互式创建过程会询问：
- 项目名称
- 项目模板（目前支持 default 模板）

## 运行命令 (run)

启动与指定代理的聊天循环。

```bash
# 运行当前目录中的代理
aigne run

# 运行指定路径中的代理
aigne run path/to/agents

# 运行远程 URL 中的代理
aigne run https://example.com/aigne-project
```

可用选项：
- `--agent <agent>` - 指定要使用的代理名称（默认为找到的第一个代理）
- `--download-dir <dir>` - 指定下载包的目录（URL模式下使用）
- `--model-provider <provider>` - 指定模型提供商（openai、claude、xai）
- `--model-name <model>` - 指定模型名称
- `--verbose` - 启用详细日志记录

## 测试命令 (test)

在指定的代理目录中运行测试。

```bash
# 测试当前目录中的代理
aigne test

# 测试指定路径中的代理
aigne test path/to/agents
```

## 服务命令 (serve)

将指定目录中的代理作为 MCP 服务器提供服务。

```bash
# 在默认端口 3000 启动 MCP 服务器
aigne serve --mcp

# 在指定端口启动 MCP 服务器
aigne serve --mcp --port 3001

# 为指定路径的代理启动 MCP 服务器
aigne serve path/to/agents --mcp
```

## 文档

更多详细的 CLI 使用指南，请参考：

- [CLI 指南](../../docs/cli.zh.md)
- [代理开发指南](../../docs/agent-development.zh.md)
- [Cookbook](../../docs/cookbook.zh.md)

## 协议

MIT
