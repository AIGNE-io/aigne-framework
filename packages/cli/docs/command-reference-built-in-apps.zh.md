---
labels: ["Reference"]
---

# 内置应用

内置应用是为专业任务设计的预打包 AIGNE 项目。它们可以直接从 CLI 调用，无需本地的 `aigne.yaml` 文件。CLI 会自动从 npm 注册表下载、缓存和管理这些应用，使 Agent 驱动的工具易于访问。

## 可用应用

目前，提供以下内置应用：

| Command | Aliases | Description |
|---|---|---|
| `doc-smith` | `docsmith`, `doc` | 生成并维护项目文档——由 Agent 提供支持。 |

## 用法

要使用内置应用，请遵循 `aigne [app-name] [subcommand] [options]` 模式。每个应用都作为一个独立的 AIGNE 项目运行，将其定义的 Agent 公开为子命令，并包含用于管理的标准命令。

### 应用专属 Agent

应用的核心功能通过其 Agent 提供，这些 Agent 作为子命令公开。要查看可用 Agent 及其选项的列表，请使用 `--help` 标志运行应用命令。

```bash
# 获取 doc-smith 的帮助并查看可用的 Agent
aigne doc-smith --help
```

要运行特定的 Agent，请在应用名称后附加其名称。例如，要在 `doc-smith` 中使用 `generate` Agent：

```bash
# 从 doc-smith 应用运行 'generate' Agent
aigne doc generate
```

许多应用还定义了一个默认 Agent，在未指定子命令时运行。您可以使用应用的名称或其任何别名来运行此 Agent。

```bash
# 运行 doc-smith 的默认 Agent
aigne doc-smith

# 您也可以使用别名
aigne doc
```

### 通用管理命令

内置应用还附带用于更新和服务的标准子命令。

#### `upgrade`

此命令会从 npm 注册表检查并安装应用的最新版本。

```bash
aigne doc-smith upgrade
```

#### `serve-mcp`

此命令通过模型上下文协议 (MCP) 服务器公开应用的 Agent，从而允许与其他系统集成。更多详情，请参阅 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 命令参考。

```bash
# 在默认主机和端口上提供 doc-smith Agent
aigne doc-smith serve-mcp
```

![为内置应用运行 MCP 服务器](../assets/run-mcp-service.png)

## 执行与缓存流程

当您首次运行内置应用时，CLI 会从 npm 注册表（例如，`@aigne/doc-smith`）下载它，并将其本地缓存到 `~/.aigne/registry.npmjs.org/`。后续运行将使用缓存版本。缓存每 24 小时检查一次更新。

```d2
direction: down

"A": "用户运行 'aigne doc-smith'"
"B": "应用是否已缓存且为最近（< 24 小时）？" {
  shape: diamond
}
"C": "从 npm 获取 '@aigne/doc-smith' 元数据"
"D": "下载、提取并安装依赖项"
"E": "从本地缓存加载应用"
"F": "执行 'doc-smith' 命令"

"A" -> "B"
"B" -> "E": "是"
"B" -> "C": "否"
"C" -> "D"
"D" -> "E"
"E" -> "F"
```

此过程可确保您始终以最小的开销使用功能正常且最新的应用版本。