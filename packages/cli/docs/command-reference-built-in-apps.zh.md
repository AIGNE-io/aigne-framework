---
labels: ["Reference"]
---

# 内置应用

AIGNE CLI 附带了预打包的应用程序，提供开箱即用的专业功能。这些应用是完整的 AIGNE 项目，您可以直接执行，无需先初始化本地项目。

当您首次调用内置应用时，CLI 会自动从 npm 注册表获取其包，将其安装到本地缓存（`~/.aigne/`）中，然后运行它。后续运行会使用缓存版本以加快启动速度，并会定期检查更新，以确保您拥有最新的功能。

## 可用应用

以下是当前可用的内置应用程序：

| 命令 | 别名 | 描述 |
|---|---|---|
| `doc` | `docsmith` | 使用 Agent 生成并维护项目文档。 |
| `web` | `websmith` | 使用 Agent 生成并维护项目网站页面。 |

## Doc Smith (`aigne doc`)

Doc Smith 是一个功能强大的应用程序，旨在使用 AI Agent 自动生成和维护项目文档。

### 用法

您可以使用 `aigne doc` 命令与 Doc Smith 进行交互。Doc Smith 应用程序中定义的 Agent 可作为子命令使用。

例如，要为当前项目生成文档，您需要运行其 `generate` Agent：

```bash title="生成项目文档" icon=lucide:terminal
# 运行 'generate' Agent 来创建或更新文档
aigne doc generate
```

## Web Smith (`aigne web`)

Web Smith 是一个专注于为您的项目生成和维护网页（例如登录页面、功能展示或博客）的应用程序。

### 用法

与 Doc Smith 类似，您可以使用 `aigne web` 命令，后跟 Web Smith 应用程序中的 Agent 名称。

例如，要生成一个新网页：

```bash title="生成新网页" icon=lucide:terminal
# 运行一个 Agent 来创建新页面
aigne web generate
```

## 通用命令

由于内置应用是完整的 AIGNE 项目，它们支持您可以直接应用于它们的标准命令。

### 升级

要确保您拥有应用程序的最新版本，可以运行 `upgrade` 命令。此命令将检查 npm 上是否有新版本，并在有可用版本时进行安装。

```bash title="升级 Doc Smith" icon=lucide:terminal
aigne doc upgrade
```

### 作为 MCP 服务器运行

您可以将应用程序的 Agent 作为标准模型上下文协议（Model Context Protocol, MCP）服务公开，从而允许其他系统通过 HTTP 与它们进行交互。

```bash title="运行 Doc Smith Agent 服务" icon=lucide:terminal
aigne doc serve-mcp
```

有关服务器选项的完整列表，请参阅 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 命令参考。
