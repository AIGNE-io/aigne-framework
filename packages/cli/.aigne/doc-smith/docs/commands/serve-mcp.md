# serve-mcp - MCP 服务器

`serve-mcp` 命令将 AIGNE 代理作为 MCP（Model Context Protocol）服务器运行，通过 HTTP 流式传输协议提供服务。

## 语法

```bash
aigne serve-mcp [options]
```

## 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--path`, `--url` | string | `.` | 代理目录路径或 URL |
| `--host` | string | `localhost` | 服务器监听地址 |
| `--port` | number | `3000` | 服务器监听端口 |
| `--pathname` | string | `/mcp` | 服务路径 |
| `--aigne-hub-url` | string | - | 自定义 AIGNE Hub 服务 URL |

## 使用方式

### 基本用法

在默认端口（3000）启动 MCP 服务器：

```bash
aigne serve-mcp
```

服务将在 `http://localhost:3000/mcp` 上运行。

### 指定端口

在自定义端口启动服务：

```bash
aigne serve-mcp --port 8080
```

### 公开访问

允许外部访问（绑定到所有网络接口）：

```bash
aigne serve-mcp --host 0.0.0.0 --port 3000
```

**安全提示**：公开暴露服务前请确保已配置适当的安全措施。

### 自定义服务路径

更改服务的 URL 路径：

```bash
aigne serve-mcp --pathname /api/agents
```

服务将在 `http://localhost:3000/api/agents` 上运行。

### 指定代理目录

运行特定目录的代理：

```bash
aigne serve-mcp --path ./my-agents --port 3000
```

## MCP 协议

MCP（Model Context Protocol）是一个标准化的协议，用于 AI 代理与外部系统的集成。

### 协议特性

- **流式传输**：支持实时数据流传输
- **HTTP 传输**：基于标准 HTTP 协议
- **标准化接口**：符合 MCP 规范的统一接口

### 端点说明

MCP 服务器提供以下端点：

- `POST /mcp` - MCP 主要端点，接收和处理请求

## 与客户端集成

### 使用 MCP SDK

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// 创建 MCP 客户端
const transport = new SSEClientTransport(
  new URL('http://localhost:3000/mcp')
);

const client = new Client(
  {
    name: 'my-client',
    version: '1.0.0',
  },
  {
    capabilities: {},
  }
);

await client.connect(transport);

// 调用代理
const result = await client.callTool({
  name: 'myAgent',
  arguments: { input: 'Hello' },
});
```

### 使用 HTTP 请求

```bash
# 使用 curl 调用 MCP 服务
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/call", "params": {"name": "myAgent", "arguments": {"input": "Hello"}}}'
```

## 示例

### 示例 1：开发环境

```bash
# 启动本地开发服务器
aigne serve-mcp --port 3000

# 在另一个终端测试
curl http://localhost:3000/mcp
```

### 示例 2：生产环境

```bash
# 使用环境变量配置
export PORT=8080
export HOST=0.0.0.0

# 启动服务
aigne serve-mcp --path /app/agents
```

### 示例 3：多服务实例

```bash
# 启动多个服务实例
aigne serve-mcp --path ./agents1 --port 3001 &
aigne serve-mcp --path ./agents2 --port 3002 &
aigne serve-mcp --path ./agents3 --port 3003 &
```

### 示例 4：Docker 容器

```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install -g @aigne/cli
EXPOSE 3000
CMD ["aigne", "serve-mcp", "--host", "0.0.0.0"]
```

```bash
# 构建并运行
docker build -t my-mcp-server .
docker run -p 3000:3000 my-mcp-server
```

## 环境变量

### 端口配置

```bash
# 使用 PORT 环境变量
export PORT=8080
aigne serve-mcp
```

### API 密钥

```bash
# 配置 AI 模型 API 密钥
export OPENAI_API_KEY=sk-xxx
aigne serve-mcp
```

### 完整配置示例

```bash
# .env
PORT=3000
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
LOG_LEVEL=info
```

## 生产部署

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start aigne --name mcp-server -- serve-mcp --port 3000

# 查看状态
pm2 status

# 查看日志
pm2 logs mcp-server
```

### 使用 systemd

创建服务文件 `/etc/systemd/system/aigne-mcp.service`：

```ini
[Unit]
Description=AIGNE MCP Server
After=network.target

[Service]
Type=simple
User=aigne
WorkingDirectory=/app/agents
Environment="PORT=3000"
Environment="OPENAI_API_KEY=sk-xxx"
ExecStart=/usr/bin/aigne serve-mcp --host 0.0.0.0
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable aigne-mcp
sudo systemctl start aigne-mcp
sudo systemctl status aigne-mcp
```

### 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name agents.example.com;

    location /mcp {
        proxy_pass http://localhost:3000/mcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 支持流式传输
        proxy_buffering off;
    }
}
```

## 监控和日志

### 健康检查

```bash
# 简单的健康检查脚本
curl -f http://localhost:3000/mcp || exit 1
```

### 日志记录

```bash
# 将日志输出到文件
aigne serve-mcp 2>&1 | tee mcp-server.log

# 使用 PM2 日志管理
pm2 logs mcp-server --lines 100
```

## 性能优化

### 集群模式

使用 PM2 集群模式运行多个实例：

```bash
pm2 start aigne --name mcp-server -i max -- serve-mcp
```

### 负载均衡

使用 Nginx 进行负载均衡：

```nginx
upstream mcp_servers {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    location /mcp {
        proxy_pass http://mcp_servers;
    }
}
```

## 安全最佳实践

1. **不要公开暴露到互联网**：使用反向代理和防火墙
2. **使用 HTTPS**：通过 Nginx 或其他反向代理启用 SSL
3. **API 密钥管理**：使用环境变量，不要硬编码
4. **访问控制**：实施 IP 白名单或认证机制
5. **监控和告警**：设置服务监控和异常告警

## 常见问题

### Q: 如何更改默认端口？

A: 使用 `--port` 选项或设置 `PORT` 环境变量。

### Q: 服务无法启动怎么办？

A: 检查：
1. 端口是否被占用
2. 代理配置是否正确
3. API 密钥是否已配置
4. 查看详细日志输出

### Q: 如何实现认证？

A: 在 MCP 服务器前使用反向代理（如 Nginx）实施认证：

```nginx
location /mcp {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:3000/mcp;
}
```

### Q: 支持 WebSocket 吗？

A: MCP 协议使用 SSE（Server-Sent Events）进行流式传输，不需要 WebSocket。

## 下一步

- 查看 [observe 命令](/commands/observe.md) 了解如何监控 MCP 服务
- 查看 [deploy 命令](/commands/deploy.md) 了解如何部署到生产环境
- 阅读 [MCP 协议规范](https://modelcontextprotocol.io) 了解更多细节

---

**相关命令：**
- [run](/commands/run.md) - 本地运行代理
- [observe](/commands/observe.md) - 监控服务运行
- [deploy](/commands/deploy.md) - 部署到生产环境
