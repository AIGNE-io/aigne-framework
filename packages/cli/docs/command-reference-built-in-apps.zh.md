---
labels: ["Reference"]
---

# 内置应用

AIGNE CLI 附带了预打包的应用程序，可提供专业的、开箱即用的功能。这些应用是完整的 AIGNE 项目，你可以直接执行，无需先初始化本地项目。

当你首次调用内置应用时，CLI 会自动从 npm 注册表获取其包，将其安装到本地缓存（`~/.aigne/`）中，然后运行它。后续运行会使用缓存版本以加快启动速度，并定期检查新更新，以确保你拥有最新的功能。

## 可用应用

以下是当前可用的内置应用程序：

| 命令 | 别名 | 描述 |
|---|---|---|
| `doc` | `docsmith` | 生成和维护项目文档 — 由 agents 提供支持。 |
| `web` | `websmith` | 生成和维护项目网站页面 — 由 agents 提供支持。 |

## Doc Smith (`aigne doc`)

Doc Smith 是一款功能强大的应用程序，旨在使用 AI agents 自动生成和维护项目文档。

### 用法

你可以使用 `aigne doc` 命令与 Doc Smith 进行交互。Doc Smith 应用程序中定义的 agents 可作为子命令使用。

例如，要为当前项目生成文档，你可以运行其 `generate` agent：

```bash title="生成项目文档" icon=lucide:terminal
# 运行 'generate' agent 来创建或更新文档
aigne doc generate
```

## Web Smith (`aigne web`)

Web Smith 是一款专注于为你的项目生成和维护网页的应用程序，例如着陆页、功能展示或博客。

### 用法

与 Doc Smith 类似，你使用 `aigne web` 命令，后跟 Web Smith 应用程序中的 agent 名称。

例如，要为你的网站生成一个新的功能页面：

```bash title="生成新的功能页面" icon=lucide:terminal
# 运行一个 agent 以根据提示创建新页面
aigne web create-page --prompt "一个解释我们新的由 AI 驱动的搜索功能的页面"
```

## 通用命令

由于内置应用是完整的 AIGNE 项目，它们支持你可以直接应用于它们的标准命令。

### 升级

为确保你拥有应用程序的最新版本，可以运行 `upgrade` 命令。该命令将检查 npm 上是否有新版本，并在有新版本时进行安装。

```bash title="升级 Doc Smith" icon=lucide:terminal
aigne doc upgrade
```

### 作为 MCP 服务器运行

你可以将应用程序的 agents 作为标准的模型上下文协议 (MCP) 服务公开，从而允许其他系统通过 HTTP 与它们进行交互。

```bash title="运行 Doc Smith agents 服务" icon=lucide:terminal
aigne doc serve-mcp --port 8080
```

有关服务器选项的完整列表，请参阅 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 命令参考。