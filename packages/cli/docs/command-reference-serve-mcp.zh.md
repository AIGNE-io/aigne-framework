---
labels: ["Reference"]
---

# aigne serve-mcp

将 AIGNE 项目中的 Agent 作为模型上下文协议（MCP）服务器提供服务。此命令通过一个可流式传输的 HTTP 端点暴露您的 Agent，从而实现与支持 MCP 标准的外部系统和应用程序的无缝集成。

在内部，`aigne serve-mcp` 启动一个轻量级的 Express 服务器。当在配置的端点上收到 POST 请求时，它会调用相应的 Agent，并根据 MCP 规范以流式方式返回响应。

![运行 MCP 服务](../assets/run-mcp-service.png)

## 用法

```bash 基本用法 icon=lucide:terminal
aigne serve-mcp [options]
```

## 选项

`serve-mcp` 命令接受以下选项来自定义服务器的行为：

<x-field data-name="--path, --url" data-type="string" data-default="." data-desc="本地 Agent 目录的路径或远程 AIGNE 项目的 URL。"></x-field>

<x-field data-name="--host" data-type="string" data-default="localhost" data-desc="运行 MCP 服务器的主机。使用 `0.0.0.0` 可将服务器公开到网络。"></x-field>

<x-field data-name="--port" data-type="number" data-default="3000" data-desc="MCP 服务器的端口。如果设置了 `PORT` 环境变量，该命令会遵循该变量；否则，默认为 3000。"></x-field>

<x-field data-name="--pathname" data-type="string" data-default="/mcp" data-desc="MCP 服务端点的 URL 路径。"></x-field>

<x-field data-name="--aigne-hub-url" data-type="string" data-desc="自定义 AIGNE Hub 服务 URL，用于获取远程 Agent 定义或模型。"></x-field>

## 示例

### 为本地项目启动服务器

要从当前目录提供 Agent 服务，请不带任何选项运行该命令。服务器将在默认主机和端口上启动。

```bash 在当前目录启动服务器 icon=lucide:play-circle
aigne serve-mcp
```

**预期输出：**

```text 控制台输出 icon=lucide:server
MCP server is running on http://localhost:3000/mcp
```

### 在特定端口和路径上提供 Agent 服务

您可以指定一个不同的端口，并提供一个指向您的 AIGNE 项目目录的显式路径。

```bash 使用自定义端口和路径启动服务器 icon=lucide:play-circle
aigne serve-mcp --path ./my-ai-project --port 8080
```

**预期输出：**

```text 控制台输出 icon=lucide:server
MCP server is running on http://localhost:8080/mcp
```

### 将服务器暴露到网络

要使您的 MCP 服务器可从网络上的其他机器访问，请将主机设置为 `0.0.0.0`。

```bash 公开暴露服务器 icon=lucide:play-circle
aigne serve-mcp --host 0.0.0.0
```

**预期输出：**

```text 控制台输出 icon=lucide:server
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
