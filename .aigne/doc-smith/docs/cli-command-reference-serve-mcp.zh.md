# serve-mcp

`aigne serve-mcp` 命令将你本地的 AI Agent 转换为一个运行中的服务，其他应用程序可以连接并与之交互。它会启动一个本地 Web 服务器，通过标准的模型上下文协议（Model Context Protocol, MCP）在网络上暴露你的 Agent 的能力，使其易于集成到更大的系统中。

当你希望另一个应用程序（如网站或后端服务）能够与你的 Agent 通信时，这个功能非常有用。

## 用法

要为当前项目文件夹中的 Agent 启动服务器，只需运行以下命令：

```bash 基本用法 icon=lucide:terminal
aigne serve-mcp
```

默认情况下，这将在 `http://localhost:3000/mcp` 启动一个服务器。

## 选项

`serve-mcp` 命令提供了几个选项来定制其行为。

<x-field-group>
  <x-field data-name="--path" data-type="string" data-default=".">
    <x-field-desc markdown>指向你的 Agent 项目目录的文件路径。默认为当前目录（`.`）。你也可以提供一个远程项目的 URL。</x-field-desc>
  </x-field>
  <x-field data-name="--host" data-type="string" data-default="localhost">
    <x-field-desc markdown>运行服务器的网络主机。使用 `0.0.0.0` 可以使服务器可从网络上的其他计算机访问。</x-field-desc>
  </x-field>
  <x-field data-name="--port" data-type="number" data-default="3000">
    <x-field-desc markdown>服务器监听的端口号。如果设置了 `PORT` 环境变量，则将使用该变量。</x-field-desc>
  </x-field>
  <x-field data-name="--pathname" data-type="string" data-default="/mcp">
    <x-field-desc markdown>Agent 服务可用的特定 URL 路径。</x-field-desc>
  </x-field>
  <x-field data-name="--aigne-hub-url" data-type="string" data-required="false">
    <x-field-desc markdown>AIGNE Hub 服务的自定义 URL。用于在需要时获取远程 Agent 定义或模型。</x-field-desc>
  </x-field>
</x-field-group>

## 工作原理

当你运行 `aigne serve-mcp` 时，它会在标准 Web 协议（HTTP）和你的 Agent 之间创建一个桥梁。其他应用程序可以向此服务器发送请求，服务器随后会调用你的 Agent 并将结果流式传输回来。这使得你的 Agent 可以在一个更大的生态系统中作为一个工具来运作。

```d2 serve-mcp 工作原理 icon=lucide:network
direction: down

Client-App: {
  label: "客户端应用程序"
  shape: rectangle
}

MCP-Server: {
  label: "MCP 服务器\n(aigne serve-mcp)"
  shape: rectangle

  AIGNE-Agent: {
    label: "你的 AIGNE Agent"
    shape: rectangle
  }
}

Client-App -> MCP-Server: "1. 发送 MCP 请求 (HTTP)"
MCP-Server -> MCP-Server.AIGNE-Agent: "2. 调用 Agent 作为工具"
MCP-Server.AIGNE-Agent -> MCP-Server: "3. 返回结果"
MCP-Server -> Client-App: "4. 将响应流式传输回来"
```

## 示例

### 在不同端口上提供服务

如果默认端口 `3000` 已被占用，你可以指定一个不同的端口。

```bash 在 8080 端口启动 icon=lucide:server
aigne serve-mcp --port 8080
```

### 从特定文件夹提供 Agent 服务

如果你的 Agent 项目文件位于不同的目录中，请使用 `--path` 选项。

```bash 提供特定项目的服务 icon=lucide:folder
aigne serve-mcp --path ./my-awesome-agent
```

### 使服务器在你的网络上可访问

要允许你本地网络上的其他设备连接到你的 Agent，请使用 `0.0.0.0` 作为主机。请小心，因为这可能会根据你的网络配置更广泛地暴露该服务。

```bash 在网络上暴露服务器 icon=lucide:wifi
aigne serve-mcp --host 0.0.0.0
```

运行此命令后，控制台将显示服务器 URL，你可以使用该 URL 从其他应用程序与你的 Agent 进行交互。