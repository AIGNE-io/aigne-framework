# 🔗 创建 MCP Agent - 连接外部世界的桥梁

[English](mcp.md) | **中文**

🌐 想让您的 AI Agent 拥有超能力吗？MCP（Model Context Protocol）就是这把万能钥匙！通过 MCP，您的 AI 可以轻松连接文件系统、数据库、API 等各种外部资源，瞬间变身为全能助手。

## 🏗️ 基本结构 - 两种连接方式任您选择

MCP 代理就像一座桥梁，有两种搭建方式：

1. 🖥️ **使用本地命令** - 就地启动服务：

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

使用本地命令时：

* `type`：🏷️ 必须设置为 `mcp`，告诉 AIGNE 这是一个 MCP 代理
* `command`：⚡ 运行 MCP 服务器的基本命令
* `args`：📋 传递给命令的参数数组
  * 第一个元素通常是实现 MCP 服务器的包名
  * 根据特定 MCP 服务器的需求，可以传递额外的参数

2. 🌐 **使用 URL 连接远程服务器** - 跨越网络的力量：

```yaml
type: mcp
url: "http://localhost:3000"
```

连接到远程服务器时：

* `type`：🏷️ 必须设置为 `mcp`，标识这是一个 MCP 代理
* `url`：🔗 要连接的远程 MCP 服务器的 URL，可以是本地或远程地址

## ⚙️ MCP 代理工作原理 - 魔法是如何发生的

MCP 代理就像一个翻译官，帮助 AI 与外部世界沟通。这些 MCP 服务器就像是各种专业助手，可以提供：

1. 🛠️ **工具（Tools）**：可以被 AI 调用的可执行函数，让 AI 拥有"动手"能力
2. 📊 **资源（Resources）**：可以被 AI 访问的数据源，给 AI 提供丰富的知识库
3. 📋 **资源模板（Resource Templates）**：用于动态生成资源的模式，让 AI 灵活适应不同场景

当 MCP 代理初始化时，AIGNE 框架像导演一样协调一切：

1. 🚀 使用提供的命令和参数启动 MCP 服务器
2. 🤝 连接到服务器并发现可用的工具和资源
3. 🔌 通过标准化接口使这些工具和资源对 AI 可用

## 🎯 常用 MCP 服务器 - 现成的超能力套装

为您精选的热门 MCP 服务器，开箱即用：

1. 📁 **文件系统服务器** - 让 AI 成为文件管理专家：

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

2. 🗃️ **SQLite 数据库服务器** - AI 秒变数据分析师：

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-sqlite", "database.db"]
```

3. 🐙 **GitHub 服务器** - 代码仓库的智能助手：

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-github"]
```

***

🎉 **太棒了！** 您已经掌握了 MCP Agent 的创建秘诀。现在您的 AI 不再是孤岛，而是：

✅ 可以读写文件的智能管家
✅ 能操作数据库的数据专家
✅ 连接各种 API 的万能接口
✅ 与任何 MCP 服务器无缝协作

🚀 **下一步：** 试试连接您最需要的外部服务，让 AI 成为您的得力助手！

📚 **深入学习：** [MCP 官方文档](https://modelcontextprotocol.io)
