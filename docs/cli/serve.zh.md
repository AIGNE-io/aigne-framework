# 服务部署

[English](serve.md) | **中文**

使用 AIGNE CLI 将代理部署为服务。

## `aigne serve` 命令

将指定目录中的代理作为模型上下文协议（MCP）服务器提供。

```bash
aigne serve [路径] [选项]
```

### 参数

* `路径`：代理目录的路径（默认为当前目录 `.`）

### 选项

* `--mcp`：将代理作为 MCP 服务器提供（目前为必需选项）
* `--host <主机>`：运行 MCP 服务器的主机地址（默认为"localhost"），使用"0.0.0.0"可以公开暴露服务器
* `--port <端口>`：运行 MCP 服务器的端口（如果设置了环境变量PORT则使用其值，否则默认为3000）
* `--pathname <路径名>`：MCP 服务器端点的 URL 路径（默认为"/mcp"）
* `--help`：显示命令帮助

### 基本使用示例

#### 在默认端口上提供 MCP 服务

```bash
aigne serve --mcp
```

成功启动后，命令会显示服务器运行地址：

```
MCP server is running on http://localhost:3000/mcp
```

#### 在特定目录中提供服务

```bash
aigne serve ./my-agents --mcp
```

#### 使用自定义端口

```bash
aigne serve ./my-agents --mcp --port 8080
```

#### 公开暴露服务器

```bash
aigne serve --mcp --host 0.0.0.0
```

#### 使用自定义端点路径

```bash
aigne serve --mcp --pathname /api/agents
```

### 高级配置示例

#### 完整的自定义配置

```bash
aigne serve ./my-agents --mcp --host 0.0.0.0 --port 8080 --pathname /api/agents
```

这将在 `http://0.0.0.0:8080/api/agents` 上提供 MCP 服务。

### 环境变量

您可以使用环境变量来配置服务器：

```bash
# 设置端口
export PORT=8080
aigne serve --mcp

# 或者在命令行中直接设置
PORT=8080 aigne serve --mcp
```

### MCP 服务器

模型上下文协议（MCP）是一个标准协议，允许 AI 模型与外部工具和数据源进行交互。通过将您的 AIGNE 代理作为 MCP 服务器提供，您可以：

1. **集成到其他应用**：让其他应用程序通过 MCP 协议使用您的代理
2. **提供 API 访问**：为您的代理提供标准化的 API 接口
3. **扩展功能**：允许多个客户端同时访问您的代理服务

### 部署注意事项

1. **安全性**：在生产环境中部署时，确保适当的安全措施
2. **性能**：根据预期负载调整服务器配置
3. **监控**：实施适当的日志记录和监控
4. **网络配置**：确保防火墙和网络设置允许所需的连接
