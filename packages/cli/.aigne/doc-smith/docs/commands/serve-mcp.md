# serve-mcp - MCP 服务

`aigne serve-mcp` 命令用于将 Agent 作为 MCP（Model Context Protocol）服务器启动,提供标准化的 HTTP 流式接口。

## 命令格式

```bash
aigne serve-mcp [options]
```

## 参数说明

### 选项

- **`--path <path>`**：Agent 目录路径或项目 URL
  - 默认值：`.`（当前目录）
  - 别名：`--url`
  
- **`--host <host>`**：服务器主机地址
  - 默认值：`localhost`
  - 使用 `0.0.0.0` 可公开暴露服务器
  
- **`--port <number>`**：服务器端口号
  - 默认值：`3000`（或环境变量 `PORT`）
  
- **`--pathname <path>`**：服务路径名
  - 默认值：`/mcp`
  - 服务的 URL 路径前缀
  
- **`--aigne-hub-url <url>`**：自定义 AIGNE Hub 服务 URL
  - 用于获取远程 Agent 定义或模型

## 使用示例

### 基本用法

在默认端口启动 MCP 服务器：

```bash
aigne serve-mcp
```

服务器将在以下地址运行：
```
http://localhost:3000/mcp
```

### 指定端口

使用自定义端口：

```bash
aigne serve-mcp --port 8080
```

### 公开暴露服务

允许外部访问（不仅限于 localhost）：

```bash
aigne serve-mcp --host 0.0.0.0 --port 3000
```

**警告**：公开暴露服务器可能存在安全风险，请确保适当的安全措施。

### 自定义路径

更改服务的 URL 路径：

```bash
aigne serve-mcp --pathname /api/agent
```

服务将在 `http://localhost:3000/api/agent` 运行。

### 指定 Agent 目录

从特定目录加载 Agent：

```bash
aigne serve-mcp --path ./my-agent --port 3001
```

### 组合使用

```bash
aigne serve-mcp \
  --path ./production-agent \
  --host 0.0.0.0 \
  --port 8080 \
  --pathname /mcp/v1
```

## MCP 协议

### 什么是 MCP

MCP（Model Context Protocol）是一个标准化协议，用于：
- 在应用程序和 AI 模型之间传输上下文
- 提供统一的接口规范
- 支持流式响应
- 实现跨平台集成

### 协议特性

- **HTTP/HTTPS 传输**：基于标准 HTTP 协议
- **流式响应**：支持服务器推送事件（SSE）
- **工具调用**：支持 Agent 使用工具
- **上下文管理**：维护会话状态

## 服务架构

<!-- afs:image id="img-007" key="mcp-service-architecture" desc="MCP service architecture diagram showing client requests → MCP server → AIGNE agent → model API, with tool execution and response streaming" -->

MCP 服务器架构包括：

1. **HTTP 服务器**：接收客户端请求
2. **MCP 协议层**：处理 MCP 协议规范
3. **AIGNE Agent**：执行实际的 Agent 逻辑
4. **模型接口**：与 AI 模型通信
5. **工具执行器**：运行 Agent 工具

## 运行示例

### 启动服务

```bash
aigne serve-mcp --port 3000
```

输出：
```
MCP server is running on http://localhost:3000/mcp
```

![MCP 服务运行界面](../../../../assets/run-mcp-service.png)

### 服务状态

服务启动后会持续运行，直到：
- 用户按 `Ctrl+C` 停止
- 进程被终止
- 发生致命错误

## 客户端集成

### Claude Desktop 集成

在 Claude Desktop 中使用 MCP 服务器：

1. 打开 Claude Desktop 设置
2. 添加 MCP 服务器配置：

```json
{
  "mcpServers": {
    "my-agent": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

3. 重启 Claude Desktop

### HTTP 客户端

使用标准 HTTP 客户端调用：

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, Agent!"}'
```

### JavaScript 客户端

```javascript
const response = await fetch('http://localhost:3000/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello, Agent!' })
});

const reader = response.body.getReader();
// 处理流式响应
```

## 环境配置

### 环境变量

MCP 服务器会加载项目目录的 `.env` 文件：

```env
# API 密钥
OPENAI_API_KEY=your-key

# 自定义端口
PORT=3000

# Hub 配置
AIGNE_HUB_API_URL=https://hub.aigne.io
```

### 代理配置

如果需要通过代理访问模型 API：

```env
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=https://proxy.example.com:8080
```

## 监控和日志

### 启用详细日志

```bash
# 通过环境变量
LOG_LEVEL=debug aigne serve-mcp

# 或在 .env 文件中设置
LOG_LEVEL=debug
```

### 日志内容

- 请求接收
- Agent 处理过程
- 工具调用
- 响应发送
- 错误信息

### 结合可观测性

配合 `observe` 命令监控 MCP 服务：

```bash
# 终端 1：启动可观测性服务
aigne observe

# 终端 2：启动 MCP 服务
aigne serve-mcp
```

然后在浏览器中访问 `http://localhost:7890` 查看实时数据。

## 生产部署

### 使用进程管理器

使用 PM2 管理 MCP 服务：

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start "aigne serve-mcp --port 3000" --name my-agent-mcp

# 查看状态
pm2 status

# 查看日志
pm2 logs my-agent-mcp

# 重启服务
pm2 restart my-agent-mcp
```

### 使用 Docker

创建 Dockerfile：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装 AIGNE CLI
RUN npm install -g @aigne/cli

# 复制 Agent 文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["aigne", "serve-mcp", "--host", "0.0.0.0", "--port", "3000"]
```

构建和运行：

```bash
docker build -t my-agent-mcp .
docker run -p 3000:3000 -e OPENAI_API_KEY=your-key my-agent-mcp
```

### 反向代理

使用 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name agent.example.com;

    location /mcp {
        proxy_pass http://localhost:3000/mcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 安全考虑

### 认证

MCP 服务器本身不提供认证，建议：

1. **使用反向代理**：在 Nginx/Apache 层添加认证
2. **API Gateway**：使用 API 网关管理访问
3. **VPN**：仅在内网或 VPN 中暴露服务

### 限流

防止滥用：

```nginx
# Nginx 限流配置
limit_req_zone $binary_remote_addr zone=mcp:10m rate=10r/s;

location /mcp {
    limit_req zone=mcp burst=20;
    proxy_pass http://localhost:3000/mcp;
}
```

### HTTPS

在生产环境使用 HTTPS：

```bash
# 使用 Let's Encrypt 证书
certbot --nginx -d agent.example.com
```

## 性能优化

### 连接池

配置模型 API 的连接池：

```javascript
// 在 Agent 配置中
{
  model: {
    provider: 'openai',
    maxConnections: 10
  }
}
```

### 缓存策略

对于相同输入缓存响应：

```javascript
// 实现缓存中间件
// (需要自定义代码)
```

### 负载均衡

运行多个 MCP 服务实例：

```bash
# 实例 1
aigne serve-mcp --port 3001

# 实例 2
aigne serve-mcp --port 3002

# 实例 3
aigne serve-mcp --port 3003
```

然后使用负载均衡器（如 Nginx）分发请求。

## 常见问题

### 端口已被占用

**问题**：`Error: Port 3000 is already in use`

**解决方案**：
- 使用不同端口：`--port 3001`
- 停止占用端口的进程
- 检查是否有其他 MCP 服务实例在运行

### 无法访问服务

**问题**：客户端无法连接到 MCP 服务器

**解决方案**：
- 检查防火墙设置
- 确认服务器正在运行
- 验证主机地址和端口
- 检查网络连接

### 流式响应中断

**问题**：响应流意外终止

**解决方案**：
- 检查 Agent 是否有错误
- 查看服务器日志
- 确认模型 API 连接稳定
- 增加超时设置

## 导航

### 父主题

- [命令参考](../commands.md) - 返回命令列表

### 相关主题

- [run 命令](./run.md) - 交互式运行 Agent
- [deploy 命令](./deploy.md) - 部署为生产服务
- [observe 命令](./observe.md) - 监控 MCP 服务

### 下一步

- [observe 命令](./observe.md) - 监控服务运行状态
- [配置说明](../configuration.md) - 配置生产环境
