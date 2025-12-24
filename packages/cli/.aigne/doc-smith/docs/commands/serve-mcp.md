# serve-mcp - MCP 服务器

> **前置条件**:
> - [命令参考](../commands.md) - 了解所有可用命令
> - [run](./run.md) - 了解如何运行 agent

## 概述

`serve-mcp` 命令将 agents 作为 MCP (Model Context Protocol) 服务器提供，通过 Streamable HTTP 协议对外暴露服务。这使得 AIGNE agents 可以与支持 MCP 协议的外部系统集成。

## 语法

```bash
aigne serve-mcp [options]
```

## 选项

### --path, --url

- **类型**: 字符串
- **默认值**: `.` (当前目录)
- **别名**: `--url`
- **描述**: agents 目录的路径或 AIGNE 项目的 URL

### --host

- **类型**: 字符串
- **默认值**: `localhost`
- **描述**: MCP 服务器运行的主机地址

使用 `0.0.0.0` 可公开暴露服务器，允许外部访问：

```bash
aigne serve-mcp --host 0.0.0.0
```

### --port

- **类型**: 数字
- **默认值**: 从环境变量 `PORT` 读取，如未设置则为 `3000`
- **描述**: MCP 服务器运行的端口

### --pathname

- **类型**: 字符串
- **默认值**: `/mcp`
- **描述**: 服务的路径名

完整的服务 URL 为：`http://<host>:<port><pathname>`

### --aigne-hub-url

- **类型**: 字符串
- **描述**: 自定义 AIGNE Hub 服务 URL
- **用途**: 用于获取远程 agent 定义或模型

## 使用示例

### 基本用法

#### 启动默认 MCP 服务器

```bash
aigne serve-mcp
```

服务器将在 `http://localhost:3000/mcp` 启动。

#### 指定端口

```bash
aigne serve-mcp --port 8080
```

服务器将在 `http://localhost:8080/mcp` 启动。

#### 指定主机和端口

```bash
aigne serve-mcp --host 0.0.0.0 --port 8080
```

服务器将在 `http://0.0.0.0:8080/mcp` 启动，可公开访问。

### 高级用法

#### 自定义路径名

```bash
aigne serve-mcp --pathname /api/agents
```

服务器将在 `http://localhost:3000/api/agents` 启动。

#### 服务指定路径的 agents

```bash
aigne serve-mcp --path path/to/agents --port 3001
```

#### 服务远程 agents

```bash
aigne serve-mcp --url https://example.com/aigne-project
```

#### 组合多个选项

```bash
aigne serve-mcp \
  --path ./agents \
  --host 0.0.0.0 \
  --port 8080 \
  --pathname /mcp/v1 \
  --aigne-hub-url https://hub.aigne.io
```

## MCP 协议

### 什么是 MCP

Model Context Protocol (MCP) 是一个标准化协议，用于：
- 暴露 AI agents 为服务
- 提供统一的接口规范
- 支持流式响应
- 实现系统间互操作

### Streamable HTTP

AIGNE 使用 Streamable HTTP 实现 MCP：
- 支持长连接
- 流式返回结果
- 实时推送更新

## 服务器输出

启动成功后会显示：

```bash
$ aigne serve-mcp --port 3000
MCP server is running on http://localhost:3000/mcp
```

服务器将持续运行，直到手动停止（`Ctrl+C`）。

## API 端点

### 健康检查

```bash
GET http://localhost:3000/mcp/health
```

### 调用 Agent

```bash
POST http://localhost:3000/mcp/invoke
Content-Type: application/json

{
  "agent": "myAgent",
  "message": "Hello, world!"
}
```

### 流式响应

```bash
POST http://localhost:3000/mcp/stream
Content-Type: application/json

{
  "agent": "myAgent",
  "message": "Generate a long response"
}
```

## 集成示例

### 使用 curl

```bash
# 调用 agent
curl -X POST http://localhost:3000/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{"agent": "myAgent", "message": "Hello"}'
```

### 使用 JavaScript

```javascript
const response = await fetch('http://localhost:3000/mcp/invoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    agent: 'myAgent',
    message: 'Hello, world!'
  })
});

const result = await response.json();
console.log(result);
```

### 使用 Python

```python
import requests

response = requests.post(
    'http://localhost:3000/mcp/invoke',
    json={
        'agent': 'myAgent',
        'message': 'Hello, world!'
    }
)

print(response.json())
```

## 部署建议

### 生产环境

在生产环境中运行时，建议：

1. **使用进程管理器**：

```bash
# 使用 pm2
pm2 start "aigne serve-mcp --port 3000" --name aigne-mcp

# 使用 systemd
sudo systemctl start aigne-mcp
```

2. **配置反向代理**：

使用 Nginx 或 Caddy 作为反向代理：

```nginx
# nginx.conf
server {
  listen 80;
  server_name api.example.com;

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

3. **启用 HTTPS**：

使用 Let's Encrypt 或其他证书：

```bash
certbot --nginx -d api.example.com
```

### Docker 部署

```dockerfile
FROM node:18

WORKDIR /app

COPY . .

RUN npm install -g @aigne/cli

EXPOSE 3000

CMD ["aigne", "serve-mcp", "--host", "0.0.0.0", "--port", "3000"]
```

运行容器：

```bash
docker build -t aigne-mcp .
docker run -p 3000:3000 aigne-mcp
```

## 环境变量

### PORT

设置默认端口：

```bash
export PORT=8080
aigne serve-mcp
```

服务器将在端口 8080 启动。

### 其他环境变量

- `OPENAI_API_KEY` - OpenAI API 密钥
- `ANTHROPIC_API_KEY` - Anthropic API 密钥
- `AIGNE_HUB_API_URL` - AIGNE Hub URL

详见 [配置文档](../configuration.md)。

## 安全考虑

### 1. 访问控制

在公开暴露服务器前，考虑添加认证：

```javascript
// 自定义认证中间件
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (token === 'Bearer YOUR_SECRET_TOKEN') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
});
```

### 2. 速率限制

防止滥用：

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 最多 100 个请求
});

app.use('/mcp', limiter);
```

### 3. CORS 配置

如需跨域访问，配置 CORS：

```javascript
import cors from 'cors';

app.use(cors({
  origin: 'https://your-frontend.com'
}));
```

## 监控和日志

### 查看日志

启动服务器时的输出会显示所有请求：

```bash
$ aigne serve-mcp --verbose
MCP server is running on http://localhost:3000/mcp
[2024-01-01 10:00:00] POST /mcp/invoke - 200 - 123ms
[2024-01-01 10:00:05] POST /mcp/stream - 200 - 456ms
```

### 集成监控

结合 [`observe`](./observe.md) 命令监控服务状态：

```bash
# 终端 1
aigne observe

# 终端 2
aigne serve-mcp
```

## 常见问题

### 端口被占用

```
Error: Port 3000 is already in use
```

解决方法：
1. 使用其他端口：`--port 3001`
2. 停止占用端口的进程
3. 检查 `PORT` 环境变量

### 无法公开访问

确保：
1. 使用 `--host 0.0.0.0`
2. 防火墙允许相应端口
3. 云服务器安全组配置正确

### Agent 未找到

```
Error: Agent not found
```

解决方法：
1. 确认 agent 配置文件存在
2. 检查 `--path` 参数是否正确
3. 验证 agent 名称拼写

## 技术细节

### 源码位置

实现文件：`src/commands/serve-mcp.ts:28`

关键函数：
- `createServeMCPCommand()` - 创建命令
- `serveMCPServerFromDir()` - 启动服务器

### 默认端口逻辑

```typescript
const DEFAULT_PORT = () => {
  const { PORT } = process.env;
  if (!PORT) return 3000;
  const port = Number.parseInt(PORT, 10);
  if (!port || !Number.isInteger(port)) {
    throw new Error(`Invalid PORT: ${PORT}`);
  }
  return port;
};
```

## 下一步

启动 MCP 服务器后，可以：

1. [observe](./observe.md) - 启动监控查看服务状态
2. [deploy](./deploy.md) - 部署到生产环境
3. [hub](./hub.md) - 连接到 AIGNE Hub

## 相关命令

- [run](./run.md) - 本地运行 agent
- [observe](./observe.md) - 监控服务
- [deploy](./deploy.md) - 部署应用

## 参考

- [命令参考](../commands.md) - 返回命令列表
- [MCP 协议规范](https://modelcontextprotocol.io/) - MCP 协议文档
- [配置](../configuration.md) - 环境变量配置
