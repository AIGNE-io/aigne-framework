---
labels: ["Reference"]
---

# 内置应用

AIGNE CLI 附带了预封装的应用程序，提供专门的、开箱即用的功能。这些应用是完整的 AIGNE 项目，你可以直接执行，无需先初始化本地项目。

当你第一次调用内置应用时，CLI 会自动从 npm 注册表获取其包，将其安装到本地缓存（`~/.aigne/`）中，然后执行请求的 agent。后续运行会使用缓存版本以加快启动速度，并定期检查新更新。

## Doc Smith (`aigne doc`)

Doc Smith 是一款功能强大的内置应用程序，旨在通过 AI agents 生成和维护项目文档。

**别名**：`doc`, `docsmith`

### 用法

你可以使用 `aigne doc` 命令与 Doc Smith 交互。Doc Smith 应用程序中定义的 agents 可作为子命令使用。

例如，要为当前项目生成文档，你可以运行 `generate` agent：

```bash title="生成项目文档" icon=lucide:terminal
# 运行 'generate' agent 来创建或更新文档
aigne doc generate
```

### 常用命令

由于内置应用是完整的 AIGNE 项目，它们支持 `upgrade` 和 `serve-mcp` 等标准命令。

#### 升级

为确保你拥有最新版本的 Doc Smith，可以运行 `upgrade` 命令。该命令会检查 npm 上是否有新版本，并在有新版本时进行安装。

```bash title="升级 Doc Smith" icon=lucide:terminal
aigne doc upgrade
```

#### 作为 MCP 服务器运行

你可以将 Doc Smith 的 agents 作为标准的模型上下文协议 (Model Context Protocol, MCP) 服务公开，从而允许其他应用程序通过 HTTP 与之交互。

```bash title="运行 Doc Smith agents" icon=lucide:terminal
aigne doc serve-mcp --port 8080
```

有关服务器选项的更多详细信息，请参阅 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 命令参考。