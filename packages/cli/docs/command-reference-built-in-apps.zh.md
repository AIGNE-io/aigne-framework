---
labels: ["Reference"]
---

# 内置应用

内置应用是专为特定任务而设计的预打包 AIGNE 项目。它们可以直接从 CLI 调用，无需本地 `aigne.yaml` 文件。CLI 会自动从 npm 注册表下载、缓存和管理这些应用，使 Agent 驱动的工具随时可用。

## 可用应用

目前，提供以下内置应用：

| Command | Aliases | Description |
|---|---|---|
| `doc-smith` | `docsmith`, `doc` | 生成和维护项目文档 — 由 Agent 驱动。 |

## 用法

要使用内置应用，请遵循 `aigne [app-name] [subcommand] [options]` 模式。每个应用都作为一个自包含的 AIGNE 项目运行，将其定义的 Agent 作为子命令公开，并包含用于管理的标准命令。

### 应用特定 Agent

应用的核心功能由其 Agent 提供，这些 Agent 作为子命令公开。如需查看可用 Agent 及其选项的列表，请使用 `--help` 标志运行应用命令。

```bash
# 获取 doc-smith 的帮助信息并查看可用的 Agent
aigne doc-smith --help
```

要运行特定 Agent，请将其名称附加到应用名称之后。例如，要使用 `doc-smith` 中的 `generate` Agent：

```bash
# 从 doc-smith 应用运行 'generate' Agent
aigne doc generate
```

许多应用还定义了默认 Agent，在未指定子命令时运行。你可以使用应用的名称或其任何别名来运行此 Agent。

```bash
# 运行 doc-smith 的默认 Agent
aigne doc-smith

# 也可以使用别名
aigne doc
```

### 通用管理命令

内置应用还附带用于更新和提供服务的标准子命令。

#### `upgrade`

此命令会检查并从 npm 注册表安装应用的最新版本。

```bash
aigne doc-smith upgrade
```

#### `serve-mcp`

此命令通过模型上下文协议 (MCP) 服务器公开应用的 Agent，从而允许与其他系统集成。更多详情，请参阅 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 命令参考。

```bash
# 在默认主机和端口上为 doc-smith Agent 提供服务
aigne doc-smith serve-mcp
```

![为内置应用运行 MCP 服务器](../assets/run-mcp-service.png)

## 执行与缓存流程

首次运行内置应用时，CLI 会从 npm 注册表（例如 `@aigne/doc-smith`）下载该应用，并将其本地缓存至 `~/.aigne/registry.npmjs.org/`。后续运行会使用缓存的版本。缓存每 24 小时检查一次更新。

```d2
direction: down

start: {
  label: "用户运行 'aigne doc-smith'"
  shape: oval
}

check_cache: {
  label: "应用是否已缓存\n且版本较新 (< 24h)?"
  shape: diamond
}

load_from_cache: {
  label: "从本地缓存加载应用"
  shape: rectangle
}

install_flow: {
  label: "下载并安装"
  shape: package

  fetch_metadata: { label: "获取 '@aigne/doc-smith' 元数据" }
  download: { label: "下载并解压软件包" }
  install_deps: { label: "安装依赖" }

  fetch_metadata -> download -> install_deps
}

execute: {
  label: "执行 Agent 命令"
  shape: oval
}

start -> check_cache
check_cache -> load_from_cache: "是"
check_cache -> install_flow: "否"
install_flow -> load_from_cache
load_from_cache -> execute
```

此过程可确保你始终以最小的开销使用功能齐全且版本最新的应用程序。