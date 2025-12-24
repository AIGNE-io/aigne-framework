# create - 创建项目

> **前置条件**: [命令参考](../commands.md) - 了解所有可用命令

## 概述

`create` 命令用于创建新的 AIGNE 项目，自动生成项目结构和 agent 配置文件。该命令提供交互式界面，引导用户完成项目初始化。

## 语法

```bash
aigne create [path]
```

## 参数

### path

- **类型**: 字符串（可选）
- **默认值**: `.` (当前目录)
- **描述**: 项目创建的目标路径

如果未指定路径或指定为 `.`，命令会提示输入项目名称。

## 使用示例

### 基本用法

#### 创建项目（交互式）

```bash
aigne create
```

运行后会提示：

```
? Project name: my-aigne-project
? Select a template: default
```

#### 指定项目路径

```bash
aigne create my-agent-project
```

直接创建名为 `my-agent-project` 的项目目录。

#### 指定完整路径

```bash
aigne create /path/to/my-project
```

在指定的绝对路径创建项目。

### 高级用法

#### 覆盖已有目录

如果目标目录已存在且非空，会提示是否覆盖：

```bash
$ aigne create existing-project
? The directory "existing-project" is not empty. Do you want to remove its contents? (y/N)
```

- 选择 `y` 会清空目录并创建新项目
- 选择 `N` 会取消操作

## 项目结构

创建完成后的项目结构：

```
my-aigne-project/
├── agents/              # Agent 配置目录
│   └── example.yml      # 示例 agent 配置
├── .env.example         # 环境变量模板
├── package.json         # 项目配置
└── README.md            # 项目说明文档
```

### 文件说明

#### agents/example.yml

示例 agent 配置文件，定义 agent 的行为、工具和模型配置。

#### .env.example

环境变量模板文件，包含：
- API 密钥配置示例
- 环境变量说明

使用前需复制为 `.env` 并填写实际值：

```bash
cp .env.example .env
```

#### package.json

项目的 npm 配置文件，包含依赖和脚本定义。

#### README.md

项目说明文档，包含使用指南和快速开始步骤。

## 可用模板

当前支持的模板：

### default

默认模板，包含：
- 基础 agent 配置示例
- 环境变量模板
- 项目文档
- 测试用例示例

未来版本可能会添加更多模板选项。

## 完整工作流

### 1. 创建项目

```bash
aigne create my-first-agent
```

### 2. 配置环境

```bash
cd my-first-agent
cp .env.example .env
# 编辑 .env 文件，添加 API 密钥
```

### 3. 运行 agent

```bash
aigne run
```

## 常见问题

### 项目名称验证

项目名称不能为空：

```bash
? Project name:
✗ Project name cannot be empty.
```

### 路径处理

- **相对路径**: 相对于当前工作目录
- **绝对路径**: 使用提供的完整路径
- **`.` (点)**: 在当前目录创建，会提示输入项目名

### 目录已存在

如果目录已存在：
- 空目录: 直接在其中创建项目
- 非空目录: 提示是否覆盖

### 模板不存在

如果指定的模板不存在（内部错误），会抛出错误：

```
Error: Template "template-name" not found.
```

这种情况通常不会发生，因为当前只有 `default` 模板。

## 成功提示

创建成功后会显示：

```bash
✅ AIGNE project created successfully!

To use your new agent, run:
  cd my-first-agent && aigne run
```

## 技术细节

### 实现逻辑

1. **路径处理**: 解析并验证目标路径
2. **交互提示**: 收集项目名称和模板选择
3. **目录检查**: 验证目标目录状态
4. **模板复制**: 从模板目录复制文件到目标位置
5. **完成提示**: 显示成功消息和后续步骤

### 源码位置

实现文件：`src/commands/create.ts:12`

关键函数：`createCreateCommand()`

## 下一步

创建项目后，建议：

1. [快速开始](../getting-started.md#配置环境变量) - 配置环境变量
2. [run](./run.md) - 学习如何运行 agent
3. [基本工作流程](../workflow.md) - 了解完整开发流程

## 相关命令

- [run](./run.md) - 运行创建的 agent
- [test](./test.md) - 测试 agent 功能
- [hub](./hub.md) - 连接到 AIGNE Hub

## 参考

- [命令参考](../commands.md) - 返回命令列表
- [配置](../configuration.md) - 环境变量和配置选项
