# observe - 可观察性

`observe` 命令启动可观察性服务器，用于监控 AIGNE 代理的运行状态、性能指标和执行日志。

## 语法

```bash
aigne observe [options]
```

## 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--host` | string | `localhost` | 服务器监听地址 |
| `--port` | number | `7890` | 服务器监听端口 |

## 使用方式

### 基本用法

在默认端口（7890）启动可观察性服务器：

```bash
aigne observe
```

服务将在 `http://localhost:7890` 上运行。

### 指定端口

在自定义端口启动服务：

```bash
aigne observe --port 8080
```

### 公开访问

允许外部访问（绑定到所有网络接口）：

```bash
aigne observe --host 0.0.0.0 --port 7890
```

## 功能特性

### 实时监控

可观察性服务器提供实时监控功能：

- **运行状态**：查看代理的当前运行状态
- **执行历史**：浏览历史执行记录
- **性能指标**：查看响应时间、Token 使用量等
- **错误追踪**：监控和分析错误信息

### 数据存储

监控数据存储在本地 SQLite 数据库中：

```bash
# 数据库位置
~/.aigne/observability.db
```

启动时会显示数据库路径：

```
Observability database path: /Users/username/.aigne/observability.db
```

## Web 界面

可观察性服务器提供 Web 界面，通过浏览器访问：

```
http://localhost:7890
```

### 界面功能

1. **仪表板**：总览代理运行情况
2. **执行记录**：查看详细的执行日志
3. **性能分析**：分析响应时间和资源使用
4. **错误日志**：查看和搜索错误信息

## 与代理集成

可观察性服务器会自动收集运行在同一环境中的代理数据。

### 自动集成

当您运行代理时，它们会自动向可观察性服务器发送数据：

```bash
# 终端 1：启动可观察性服务器
aigne observe

# 终端 2：运行代理（会自动发送数据到可观察性服务器）
aigne run
```

### 环境变量配置

通过环境变量配置可观察性设置：

```bash
# 禁用可观察性
export AIGNE_OBSERVABILITY_ENABLED=false
aigne run

# 自定义可观察性数据库路径
export AIGNE_OBSERVABILITY_DB_PATH=/custom/path/observability.db
aigne observe
```

## 示例

### 示例 1：基本监控

```bash
# 启动可观察性服务器
aigne observe

# 在浏览器打开
open http://localhost:7890
```

### 示例 2：多环境监控

```bash
# 开发环境
aigne observe --port 7890

# 测试环境
aigne observe --port 7891

# 生产环境
aigne observe --port 7892
```

### 示例 3：后台运行

```bash
# 使用 nohup 后台运行
nohup aigne observe --port 7890 > observe.log 2>&1 &

# 查看日志
tail -f observe.log
```

### 示例 4：使用 PM2

```bash
# 使用 PM2 管理
pm2 start aigne --name observe-server -- observe --port 7890

# 查看状态
pm2 status observe-server

# 查看日志
pm2 logs observe-server
```

## 生产部署

### 使用 systemd

创建服务文件 `/etc/systemd/system/aigne-observe.service`：

```ini
[Unit]
Description=AIGNE Observability Server
After=network.target

[Service]
Type=simple
User=aigne
WorkingDirectory=/app
Environment="PORT=7890"
ExecStart=/usr/bin/aigne observe --host 0.0.0.0
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable aigne-observe
sudo systemctl start aigne-observe
sudo systemctl status aigne-observe
```

### 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name observe.example.com;

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

### Docker 容器

```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app
RUN npm install -g @aigne/cli
EXPOSE 7890
VOLUME ["/data"]
ENV AIGNE_OBSERVABILITY_DB_PATH=/data/observability.db
CMD ["aigne", "observe", "--host", "0.0.0.0"]
```

```bash
# 构建并运行
docker build -t aigne-observe .
docker run -d -p 7890:7890 -v /path/to/data:/data aigne-observe
```

## 数据管理

### 查看数据库

使用 SQLite 命令行工具查看数据：

```bash
sqlite3 ~/.aigne/observability.db

# 查看表
.tables

# 查询数据
SELECT * FROM executions LIMIT 10;

# 退出
.quit
```

### 备份数据

定期备份可观察性数据：

```bash
# 备份数据库
cp ~/.aigne/observability.db ~/backups/observability-$(date +%Y%m%d).db

# 或使用 SQLite 命令
sqlite3 ~/.aigne/observability.db ".backup ~/backups/observability-$(date +%Y%m%d).db"
```

### 清理数据

清理旧数据以节省空间：

```bash
# 删除 30 天前的数据
sqlite3 ~/.aigne/observability.db "DELETE FROM executions WHERE timestamp < datetime('now', '-30 days')"

# 压缩数据库
sqlite3 ~/.aigne/observability.db "VACUUM"
```

## 监控指标

可观察性服务器收集以下指标：

### 执行指标

- **执行次数**：总执行次数和成功率
- **响应时间**：平均响应时间、P50、P95、P99
- **Token 使用**：输入和输出 Token 数量
- **成本统计**：基于 Token 的成本估算

### 错误指标

- **错误率**：错误发生频率
- **错误类型**：不同类型错误的分布
- **错误详情**：具体的错误信息和堆栈

### 资源指标

- **内存使用**：代理运行时的内存占用
- **CPU 使用**：CPU 使用率
- **并发数**：同时运行的代理数量

## 性能优化

### 数据库优化

定期优化数据库性能：

```bash
# 重建索引
sqlite3 ~/.aigne/observability.db "REINDEX"

# 分析查询计划
sqlite3 ~/.aigne/observability.db "ANALYZE"
```

### 数据保留策略

实施数据保留策略：

```bash
# 创建清理脚本
cat > cleanup_observability.sh << 'EOF'
#!/bin/bash
DB_PATH="$HOME/.aigne/observability.db"
DAYS=30

sqlite3 "$DB_PATH" "DELETE FROM executions WHERE timestamp < datetime('now', '-$DAYS days')"
sqlite3 "$DB_PATH" "VACUUM"
echo "Cleaned up data older than $DAYS days"
EOF

chmod +x cleanup_observability.sh

# 添加到 crontab（每天凌晨 2 点执行）
crontab -e
# 添加：0 2 * * * /path/to/cleanup_observability.sh
```

## 安全建议

1. **访问控制**：不要直接暴露到公网，使用 VPN 或反向代理
2. **认证**：在 Nginx 中配置基本认证
3. **HTTPS**：生产环境使用 SSL 加密
4. **数据加密**：敏感数据加密存储
5. **日志审计**：记录访问日志

## 常见问题

### Q: 如何访问远程服务器的可观察性界面？

A: 使用 SSH 端口转发：

```bash
ssh -L 7890:localhost:7890 user@remote-server
```

然后在本地浏览器访问 `http://localhost:7890`。

### Q: 数据库文件太大怎么办？

A: 定期清理旧数据和压缩数据库：

```bash
sqlite3 ~/.aigne/observability.db "DELETE FROM executions WHERE timestamp < datetime('now', '-7 days')"
sqlite3 ~/.aigne/observability.db "VACUUM"
```

### Q: 如何导出监控数据？

A: 使用 SQLite 导出为 CSV：

```bash
sqlite3 -header -csv ~/.aigne/observability.db "SELECT * FROM executions" > executions.csv
```

### Q: 可以同时运行多个可观察性服务器吗？

A: 可以，但它们需要使用不同的端口和数据库文件：

```bash
aigne observe --port 7890  # 默认数据库
AIGNE_OBSERVABILITY_DB_PATH=/path/to/db2.db aigne observe --port 7891
```

## 与其他工具集成

### Prometheus

导出指标到 Prometheus（需要自定义脚本）：

```javascript
// prometheus-exporter.js
import sqlite3 from 'sqlite3';
import express from 'express';

const app = express();
const db = new sqlite3.Database(`${process.env.HOME}/.aigne/observability.db`);

app.get('/metrics', (req, res) => {
  db.all('SELECT COUNT(*) as count FROM executions', (err, rows) => {
    res.send(`aigne_executions_total ${rows[0].count}\n`);
  });
});

app.listen(9090);
```

### Grafana

连接 SQLite 数据库创建仪表板（需要 Grafana SQLite 插件）。

## 下一步

- 查看 [run 命令](/commands/run.md) 了解如何运行代理
- 查看 [serve-mcp 命令](/commands/serve-mcp.md) 了解如何运行 MCP 服务
- 查看 [eval 命令](/commands/eval.md) 了解如何评估代理性能

---

**相关命令：**
- [run](/commands/run.md) - 运行代理
- [serve-mcp](/commands/serve-mcp.md) - MCP 服务器
- [eval](/commands/eval.md) - 评估代理
