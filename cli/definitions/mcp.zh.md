# 创建 MCP Agent

[English](mcp.md) | **中文**

想让您的 AI Agent 具备更强大的能力吗？MCP（Model Context Protocol）是连接外部资源的标准协议。通过 MCP，您的 AI 可以访问文件系统、数据库、API 等各种外部资源，成为功能丰富的智能助手。

## 基本结构

MCP 代理提供两种连接方式：

1. **使用本地命令** - 启动本地 MCP 服务：

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

使用本地命令时：

* `type`：必须设置为 `mcp`，指定这是一个 MCP 代理
* `command`：运行 MCP 服务器的基本命令
* `args`：传递给命令的参数数组
  * 第一个元素通常是实现 MCP 服务器的包名
  * 根据特定 MCP 服务器的需求，可以传递额外的参数

2. **使用 URL 连接远程服务器**：

```yaml
type: mcp
url: "http://localhost:3000"
```

连接到远程服务器时：

* `type`：必须设置为 `mcp`，标识这是一个 MCP 代理
* `url`：要连接的远程 MCP 服务器的 URL，可以是本地或远程地址

## 工作原理

MCP 代理充当 AI 与外部世界之间的桥梁，帮助 AI 访问各种外部资源。MCP 服务器可以提供：

1. **工具（Tools）**：可以被 AI 调用的可执行函数，扩展 AI 的操作能力
2. **资源（Resources）**：可以被 AI 访问的数据源，为 AI 提供丰富的信息
3. **资源模板（Resource Templates）**：用于动态生成资源的模式，支持灵活的资源访问

当 MCP 代理初始化时，AIGNE 框架会执行以下步骤：

1. 使用提供的命令和参数启动 MCP 服务器
2. 连接到服务器并发现可用的工具和资源
3. 通过标准化接口使这些工具和资源对 AI 可用

## 常用 MCP 服务器

以下是一些常用的 MCP 服务器示例：

1. **文件系统服务器** - 提供文件操作能力：

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

2. **SQLite 数据库服务器** - 提供数据库操作能力：

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-sqlite", "database.db"]
```

3. **GitHub 服务器** - 提供 GitHub 仓库访问能力：

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-github"]
```

***

现在您已经了解了 MCP Agent 的创建方法。通过 MCP 代理，您的 AI 具备了：

* 文件系统访问和操作能力
* 数据库查询和管理功能
* 各种外部 API 的连接能力
* 与标准 MCP 服务器的协作能力

**下一步：** 根据您的需求选择合适的 MCP 服务器，扩展 AI 的功能范围。

**参考资源：** [MCP 官方文档](https://modelcontextprotocol.io)
