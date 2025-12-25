# 安装指南

本文档介绍如何在您的系统上安装 AIGNE CLI 工具。

## 前置条件

在安装 AIGNE CLI 之前，请确保您的系统满足以下要求：

- **Node.js**：版本 18 或更高（推荐使用 LTS 版本）
- **npm**、**yarn** 或 **pnpm**：任一包管理器

### 检查 Node.js 版本

```bash
node --version
```

如果尚未安装 Node.js，请访问 [Node.js 官网](https://nodejs.org/) 下载并安装。

## 安装方法

AIGNE CLI 可以通过以下包管理器进行全局安装：

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

安装完成后，您可以通过以下命令验证安装是否成功：

```bash
aigne --version
```

如果安装成功，该命令将输出 AIGNE CLI 的版本号，例如：

```
1.59.0-beta.6
```

您也可以查看帮助信息：

```bash
aigne --help
```

这将显示所有可用命令的列表和简要说明。

## 更新 AIGNE CLI

要更新到最新版本的 AIGNE CLI，请使用与安装时相同的包管理器：

### 使用 npm

```bash
npm update -g @aigne/cli
```

### 使用 yarn

```bash
yarn global upgrade @aigne/cli
```

### 使用 pnpm

```bash
pnpm update -g @aigne/cli
```

## 卸载

如需卸载 AIGNE CLI，请使用以下命令：

### 使用 npm

```bash
npm uninstall -g @aigne/cli
```

### 使用 yarn

```bash
yarn global remove @aigne/cli
```

### 使用 pnpm

```bash
pnpm remove -g @aigne/cli
```

## 环境配置

AIGNE CLI 支持通过环境变量进行配置。常用的环境变量包括：

- **`PORT`**：指定 MCP 服务器或可观测性服务器的默认端口
- **模型配置相关变量**：根据使用的模型提供商设置相应的 API 密钥

您可以在项目目录中创建 `.env` 文件来配置这些变量。AIGNE CLI 会自动加载该文件中的配置。

## 常见问题

### 权限错误

如果在全局安装时遇到权限错误，您可以：

1. 使用 `sudo`（不推荐）：
   ```bash
   sudo npm install -g @aigne/cli
   ```

2. 配置 npm 使用用户目录（推荐）：
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```

### 命令未找到

如果安装后无法使用 `aigne` 命令，请检查：

1. 全局安装路径是否在 `PATH` 环境变量中
2. 使用正确的包管理器和全局安装命令
3. 尝试重新打开终端或重新加载 shell 配置

## 导航

### 父主题

- [概述](./overview.md) - 返回 AIGNE CLI 概述

### 下一步

- [快速开始](./getting-started.md) - 开始使用 AIGNE CLI 创建您的第一个项目
