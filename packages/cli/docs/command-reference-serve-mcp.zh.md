---
labels: ["Reference"]
---

# aigne serve-mcp

将指定 AIGNE 项目中的 Agent 作为模型上下文协议 (MCP) 服务器来运行。此命令通过一个可流式传输的 HTTP 端点来暴露您的 Agent，从而可以与支持 MCP 标准的外部系统和应用程序无缝集成。

在内部，`aigne serve-mcp` 会启动一个轻量级的 Express 服务器，该服务器在可配置的路径上监听 POST 请求。当收到请求时，它会调用相应的 Agent，并根据 MCP 规范以流式方式将响应传回。

![运行 MCP 服务](../assets/run-mcp-service.png)

## 用法

```bash
aigne serve-mcp [options]
```

## 选项

`serve-mcp` 命令接受以下选项以自定义服务器的行为：

| 选项 | 别名 | 描述 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| `--path` | `--url` | 本地 Agent 目录的路径，或远程 AIGNE 项目的 URL。 | `string` | `.` |
| `--host` | | 运行 MCP 服务器的主机。使用 `0.0.0.0` 可将服务器公开暴露。 | `string` | `localhost` |
| `--port` | | MCP 服务器的端口。它会遵循 `PORT` 环境变量，如果未设置，则回退到 3000。 | `number` | `3000` |
| `--pathname` | | MCP 服务端点的 URL 路径。 | `string` | `/mcp` |
| `--aigne-hub-url` | | 自定义的 AIGNE Hub 服务 URL，用于获取远程 Agent 定义或模型。 | `string` | | 

## 示例

### 为本地项目启动服务器

若要从当前工作目录运行 Agent，请不带任何选项直接运行该命令。服务器将在默认主机和端口上启动。

```bash
aigne serve-mcp
```

**预期输出：**

```text
MCP server is running on http://localhost:3000/mcp
```

### 在特定端口和路径上运行 Agent

您可以指定一个不同的端口，并为您的 AIGNE 项目目录提供一个明确的路径。

```bash
aigne serve-mcp --path ./my-ai-project --port 8080
```

**预期输出：**

```text
MCP server is running on http://localhost:8080/mcp
```

### 将服务器暴露到网络

要使您的 MCP 服务器可从网络上的其他计算机访问，请将主机设置为 `0.0.0.0`。

```bash
aigne serve-mcp --host 0.0.0.0
```

**预期输出：**

```text
MCP server is running on http://0.0.0.0:3000/mcp
```

## 后续步骤

通过 MCP 服务器暴露您的 Agent 后，您可能希望将它们部署用于生产环境。

<x-cards>
  <x-card data-title="aigne deploy 命令" data-icon="lucide:ship" data-href="/command-reference/deploy">
    了解如何将您的 AIGNE 应用程序部署为 Blocklet。
  </x-card>
  <x-card data-title="部署 Agent 指南" data-icon="lucide:book-open-check" data-href="/guides/deploying-agents">
    遵循分步教程来部署您的 Agent。
  </x-card>
</x-cards>