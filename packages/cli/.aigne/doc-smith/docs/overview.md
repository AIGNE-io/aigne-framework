# AIGNE CLI 概述

AIGNE CLI 是 [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) 的官方命令行工具，专为简化 AIGNE 应用的开发、测试和部署流程而设计。通过提供一系列实用命令，AIGNE CLI 帮助开发者快速创建项目、运行 Agent、测试代码并部署应用。

![AIGNE Logo](../../../logo.svg)

## 核心功能

AIGNE CLI 提供以下核心功能：

### 🚀 项目创建
- 使用预定义的文件结构和配置快速创建新的 AIGNE 项目
- 支持多种项目模板，帮助您快速启动开发
- 交互式创建流程，引导您完成项目初始化

### 💻 Agent 运行
- 轻松运行和测试 AIGNE Agent
- 支持从本地路径或远程 URL 加载 Agent
- 提供交互式聊天界面，方便与 Agent 进行对话

### 🧪 测试支持
- 内置测试命令，支持单元测试和集成测试
- 自动运行 Agent 目录中的测试文件
- 方便的测试工作流集成

### 🔌 MCP 服务
- 将 Agent 作为 MCP（Model Context Protocol）服务器启动
- 支持与外部系统的集成
- 灵活的服务配置和端口管理

### 🌐 AIGNE Hub 连接
- 管理与 AIGNE Hub 的连接
- 支持多个 Hub 的切换和管理
- 集成信用额度查询和支付功能

### 📦 部署能力
- 将 AIGNE 应用部署到指定端点
- 支持 Blocklet 部署方式
- 自动化的部署流程

### 🔍 可观测性
- 内置可观测性服务器，监控 Agent 运行状态
- 查看调用详情和性能数据
- 便于调试和问题排查

### 📊 Agent 评估
- 使用数据集评估 Agent 的性能
- 支持自定义评估器
- 生成评估报告，帮助优化 Agent 表现

### 🎨 交互式界面
- 美观的命令行界面，提供直观的用户体验
- 清晰的命令输出和错误提示
- 支持详细日志模式，方便调试

### 🔧 多模型支持
- 支持 OpenAI、Claude、XAI 等多种模型提供商
- 灵活的模型配置选项
- 支持自定义 AIGNE Hub 服务 URL

## 架构概览

<!-- afs:image id="img-001" key="aigne-cli-architecture" desc="AIGNE CLI architecture diagram showing main components: CLI commands, agent runtime, MCP server, hub connector, deployment engine, and observability service" -->

AIGNE CLI 采用模块化架构设计，主要包含以下组件：

1. **命令行接口层**：处理用户命令输入，提供交互式界面
2. **Agent 运行时**：加载和运行 AIGNE Agent，管理会话状态
3. **MCP 服务器**：提供标准化的模型上下文协议接口
4. **Hub 连接器**：管理与 AIGNE Hub 的通信和认证
5. **部署引擎**：处理应用打包和部署流程
6. **可观测性服务**：收集和展示运行时数据

## 适用场景

AIGNE CLI 适用于以下场景：

- **Agent 开发**：快速创建和测试 AIGNE Agent
- **本地调试**：在本地环境运行和调试 Agent
- **集成开发**：通过 MCP 服务与其他系统集成
- **性能评估**：使用数据集评估 Agent 性能
- **生产部署**：将 Agent 部署到生产环境
- **运维监控**：监控 Agent 运行状态和性能指标

## 版本信息

- **当前版本**：1.59.0-beta.6
- **许可证**：Elastic-2.0
- **仓库地址**：[GitHub](https://github.com/AIGNE-io/aigne-framework)

## 导航

### 下一步

- [安装指南](./installation.md) - 了解如何安装 AIGNE CLI
- [快速开始](./getting-started.md) - 快速创建和运行您的第一个 AIGNE 项目
- [命令参考](./commands.md) - 查看所有可用命令的详细说明
