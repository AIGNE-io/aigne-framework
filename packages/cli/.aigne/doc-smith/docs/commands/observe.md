# observe - 可观测性服务器

> **前置条件**:
> - [命令参考](../commands.md) - 了解所有可用命令
> - [run](./run.md) - 了解如何运行 agent

## 概述

`observe` 命令启动可观测性服务器，用于监控 AIGNE agents 的运行数据、性能指标和调试信息。提供 Web 界面查看实时和历史数据。

## 语法

```bash
aigne observe [options]
```

## 选项

### --host

- **类型**: 字符串
- **默认值**: `localhost`
- **描述**: 可观测性服务器运行的主机地址

使用 `0.0.0.0` 可公开暴露服务器：

```bash
aigne observe --host 0.0.0.0
```

### --port

- **类型**: 数字
- **默认值**: 从环境变量 `PORT` 读取，如未设置则为 `7890`
- **描述**: 可观测性服务器运行的端口

## 使用示例

### 基本用法

#### 启动默认服务器

```bash
aigne observe
```

服务器将在 `http://localhost:7890` 启动。

#### 指定端口

```bash
aigne observe --port 8080
```

服务器将在 `http://localhost:8080` 启动。

#### 公开暴露服务器

```bash
aigne observe --host 0.0.0.0 --port 7890
```

允许外部访问监控界面。

### 高级用法

#### 自定义主机和端口

```bash
aigne observe --host 0.0.0.0 --port 9000
```

#### 在后台运行

```bash
# Unix/Linux/macOS
aigne observe &

# 使用 nohup
nohup aigne observe > observe.log 2>&1 &

# 使用 screen
screen -dmS observe aigne observe
```

## 服务器输出

启动时显示：

```bash
$ aigne observe
Observability database path: /Users/username/.aigne/observability.db
Server is running on http://localhost:7890
```

### 数据库位置

默认数据库路径：`~/.aigne/observability.db`

存储内容：
- Agent 运行记录
- API 调用日志
- 性能指标
- 错误信息

## 监控界面

### 访问界面

在浏览器中打开：`http://localhost:7890`

### 主要功能

#### 1. 实时监控

- **Agent 状态**: 当前运行的 agents
- **活动连接**: 实时连接数
- **请求速率**: 每秒请求数
- **错误率**: 错误发生频率

#### 2. 运行历史

查看历史运行记录：
- 运行时间
- 输入/输出
- 执行时长
- Token 使用量

#### 3. 性能分析

- **响应时间分布**: 响应时间直方图
- **Token 使用趋势**: Token 消耗随时间变化
- **API 调用统计**: 各 API 的调用次数
- **成本分析**: API 调用成本统计

#### 4. 错误日志

- **错误列表**: 所有错误记录
- **错误详情**: 堆栈跟踪和上下文
- **错误趋势**: 错误发生率变化

#### 5. 工具使用

- **工具调用**: 各工具的使用频率
- **工具性能**: 工具执行时间
- **工具成功率**: 工具调用成功率

## 监控指标

### Agent 指标

- **运行次数**: Agent 被调用的总次数
- **成功率**: 成功执行的比例
- **平均响应时间**: 平均执行时长
- **Token 使用量**: 总 Token 消耗

### API 指标

- **调用次数**: API 调用总数
- **成功/失败**: API 调用结果统计
- **成本**: API 调用总成本
- **速率**: 每分钟调用次数

### 系统指标

- **内存使用**: 进程内存占用
- **CPU 使用**: CPU 使用率
- **活动连接**: 当前连接数

## 数据查询

### 过滤条件

在界面中可以按以下条件过滤：

- **时间范围**: 最近 1 小时、24 小时、7 天等
- **Agent 名称**: 特定 agent 的数据
- **状态**: 成功、失败、运行中
- **模型**: 使用的 AI 模型

### 导出数据

可以导出监控数据为：
- JSON
- CSV
- Excel

## 集成使用

### 与其他命令配合

#### 监控 run 命令

```bash
# 终端 1: 启动监控
aigne observe

# 终端 2: 运行 agent
aigne run myAgent
```

在监控界面实时查看 agent 的运行情况。

#### 监控 serve-mcp

```bash
# 终端 1: 启动监控
aigne observe

# 终端 2: 启动 MCP 服务器
aigne serve-mcp
```

监控 MCP 服务器的请求和性能。

#### 监控 eval

```bash
# 终端 1: 启动监控
aigne observe

# 终端 2: 运行评估
aigne eval myAgent --dataset data.csv
```

查看评估过程的详细数据。

## 生产环境部署

### 使用进程管理器

#### PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start "aigne observe --port 7890" --name aigne-observe

# 查看状态
pm2 status

# 查看日志
pm2 logs aigne-observe
```

#### systemd

创建服务文件 `/etc/systemd/system/aigne-observe.service`：

```ini
[Unit]
Description=AIGNE Observability Server
After=network.target

[Service]
Type=simple
User=aigne
WorkingDirectory=/home/aigne
ExecStart=/usr/bin/aigne observe --port 7890
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl enable aigne-observe
sudo systemctl start aigne-observe
sudo systemctl status aigne-observe
```

### 反向代理

#### Nginx

```nginx
server {
  listen 80;
  server_name monitor.example.com;

  location / {
    proxy_pass http://localhost:7890;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

#### Caddy

```
monitor.example.com {
  reverse_proxy localhost:7890
}
```

## 安全配置

### 访问控制

可观测性界面包含敏感数据，建议：

1. **仅在本地网络暴露**：使用 `--host localhost`
2. **使用 VPN**：通过 VPN 访问
3. **添加认证**：在反向代理层添加 HTTP 基本认证

#### Nginx 基本认证

```nginx
location / {
  auth_basic "AIGNE Observability";
  auth_basic_user_file /etc/nginx/.htpasswd;
  proxy_pass http://localhost:7890;
}
```

创建密码文件：

```bash
htpasswd -c /etc/nginx/.htpasswd admin
```

### HTTPS

使用 Let's Encrypt 启用 HTTPS：

```bash
certbot --nginx -d monitor.example.com
```

## 数据管理

### 数据库维护

#### 查看数据库大小

```bash
ls -lh ~/.aigne/observability.db
```

#### 清理旧数据

```bash
# 备份数据库
cp ~/.aigne/observability.db ~/.aigne/observability.db.bak

# 清理 30 天前的数据（需自定义脚本）
# 或手动删除重新开始
rm ~/.aigne/observability.db
```

#### 备份数据库

```bash
# 定期备份
cp ~/.aigne/observability.db ~/backups/observability-$(date +%Y%m%d).db
```

## 常见问题

### 端口被占用

```
Error: Port 7890 is already in use
```

解决方法：
1. 使用其他端口：`--port 7891`
2. 停止占用端口的进程
3. 检查是否已有 observe 服务在运行

### 无法访问界面

检查：
1. 服务器是否正常启动
2. 防火墙是否允许访问
3. 主机地址配置是否正确

### 数据未显示

确保：
1. Agents 正在运行
2. 可观测性功能已启用
3. 数据库路径正确

## 环境变量

### PORT

设置默认端口：

```bash
export PORT=8080
aigne observe
```

## 性能考虑

### 数据库性能

随着数据增长，查询可能变慢：

1. **定期清理**: 删除旧数据
2. **索引优化**: 确保数据库索引正常
3. **分离数据库**: 使用专用数据库服务器

### 监控开销

可观测性会带来少量性能开销：

- **内存**: 约 50-100 MB
- **CPU**: 1-2% 额外占用
- **磁盘**: 取决于保存的数据量

## 技术细节

### 源码位置

实现文件：`src/commands/observe.ts:25`

关键函数：
- `createObservabilityCommand()` - 创建命令
- `startObservabilityCLIServer()` - 启动服务器

### 数据库

使用 SQLite 存储数据：
- **路径**: `~/.aigne/observability.db`
- **表结构**: 运行记录、API 调用、指标数据

### 默认端口逻辑

```typescript
const DEFAULT_PORT = () => {
  const { PORT } = process.env;
  if (!PORT) return 7890;
  const port = Number.parseInt(PORT, 10);
  if (!port || !Number.isInteger(port)) {
    throw new Error(`Invalid PORT: ${PORT}`);
  }
  return port;
};
```

## 下一步

启动监控后，可以：

1. [run](./run.md) - 运行 agent 并监控
2. [serve-mcp](./serve-mcp.md) - 监控 MCP 服务
3. [eval](./eval.md) - 评估并分析性能数据

## 相关命令

- [run](./run.md) - 运行并监控 agent
- [serve-mcp](./serve-mcp.md) - MCP 服务监控
- [eval](./eval.md) - 性能评估

## 参考

- [命令参考](../commands.md) - 返回命令列表
- [基本工作流程](../workflow.md#可观测性) - 监控在开发流程中的作用
- [配置](../configuration.md) - 相关配置选项
