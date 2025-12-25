# observe - 可观测性服务

`aigne observe` 命令用于启动可观测性服务器,用于监控 Agent 运行数据、查看调用详情和性能指标。

## 命令格式

```bash
aigne observe [options]
```

## 参数说明

### 选项

- **`--host <host>`**：服务器主机地址
  - 默认值：`localhost`
  - 使用 `0.0.0.0` 可公开暴露服务器
  
- **`--port <number>`**：服务器端口号
  - 默认值：`7890`（或环境变量 `PORT`）

## 使用示例

### 基本用法

在默认端口启动可观测性服务器：

```bash
aigne observe
```

输出：
```
Observability database path: /path/to/observability.db
Observability server is running on http://localhost:7890
```

### 指定端口

使用自定义端口：

```bash
aigne observe --port 8080
```

### 公开暴露服务

允许外部访问（不仅限于 localhost）：

```bash
aigne observe --host 0.0.0.0 --port 7890
```

**注意**：公开暴露服务器可能存在安全风险，建议仅在受信任的网络中使用。

## 可观测性功能

### 监控数据

可观测性服务器收集和展示以下数据：

- **Agent 调用记录**：所有 Agent 的调用历史
- **执行时间**：每次调用的耗时统计
- **模型使用情况**：Token 使用量和成本
- **工具调用**：Agent 使用的工具及其参数
- **错误信息**：调用失败的详细信息
- **输入输出**：完整的请求和响应内容

### Web 界面

在浏览器中访问 `http://localhost:7890` 查看可视化界面：

![可观测性运行界面](../../../../assets/observe/observe-running-interface.png)

界面功能：
- **调用列表**：查看所有 Agent 调用记录
- **详情页面**：查看单次调用的完整信息
- **统计图表**：可视化性能和使用趋势
- **实时更新**：自动刷新最新数据

### 调用详情

点击任意调用记录可查看详细信息：

![查看调用详情](../../../../assets/observe/observe-view-call-details.png)

详情包括：
- **请求参数**：输入文本、配置选项
- **响应内容**：Agent 的完整响应
- **执行轨迹**：工具调用序列
- **Token 统计**：输入/输出 token 数量
- **性能数据**：各阶段耗时
- **错误堆栈**：如果失败，显示错误信息

## 数据存储

### 数据库位置

可观测性数据存储在本地 SQLite 数据库：

- **默认路径**：`~/.aigne/observability.db`
- **自动创建**：首次运行时自动创建
- **持久化**：数据在服务重启后保留

### 数据保留

- 数据会持续累积
- 建议定期清理旧数据
- 可以手动删除数据库文件重新开始

## 与其他命令集成

### 配合 run 命令

在一个终端启动可观测性服务，在另一个终端运行 Agent：

```bash
# 终端 1：启动可观测性服务
aigne observe

# 终端 2：运行 Agent
aigne run --verbose
```

然后在浏览器中查看 Agent 的运行数据。

### 配合 serve-mcp 命令

监控 MCP 服务的调用情况：

```bash
# 终端 1：启动可观测性服务
aigne observe

# 终端 2：启动 MCP 服务
aigne serve-mcp
```

### 配合 eval 命令

查看评估过程的详细数据：

```bash
# 终端 1：启动可观测性服务
aigne observe

# 终端 2：运行评估
aigne eval --dataset test.json
```

## 监控场景

### 开发调试

在开发过程中监控 Agent 行为：

1. 启动可观测性服务
2. 运行 Agent 或执行测试
3. 在 Web 界面查看：
   - Agent 是否正确调用工具
   - 输入输出是否符合预期
   - 执行时间是否合理

### 性能分析

分析 Agent 性能瓶颈：

1. 运行性能测试或评估
2. 在可观测性界面查看：
   - 最慢的调用
   - Token 使用最多的调用
   - 工具执行时间分布

### 错误排查

当 Agent 出现问题时：

1. 查看调用列表中的失败记录
2. 点击查看详细错误信息
3. 检查输入参数和上下文
4. 查看工具调用序列

## 数据分析

### 导出数据

可以通过以下方式导出数据：

1. **直接访问数据库**：
   ```bash
   sqlite3 ~/.aigne/observability.db
   ```

2. **查询数据**：
   ```sql
   SELECT * FROM traces ORDER BY timestamp DESC LIMIT 10;
   ```

3. **导出 CSV**：
   ```bash
   sqlite3 -header -csv ~/.aigne/observability.db \
     "SELECT * FROM traces" > traces.csv
   ```

### 统计分析

使用 SQL 进行数据分析：

```sql
-- 平均响应时间
SELECT AVG(duration) FROM traces;

-- Token 使用总量
SELECT SUM(total_tokens) FROM traces;

-- 按日期统计调用次数
SELECT DATE(timestamp), COUNT(*) 
FROM traces 
GROUP BY DATE(timestamp);

-- 错误率
SELECT 
  COUNT(CASE WHEN error IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as error_rate
FROM traces;
```

## 生产部署

### 使用进程管理器

使用 PM2 管理可观测性服务：

```bash
# 启动服务
pm2 start "aigne observe --port 7890" --name observability

# 设置开机自启
pm2 startup
pm2 save
```

### Docker 部署

创建 Dockerfile：

```dockerfile
FROM node:18-alpine

RUN npm install -g @aigne/cli

EXPOSE 7890

CMD ["aigne", "observe", "--host", "0.0.0.0", "--port", "7890"]
```

### 反向代理

使用 Nginx 保护可观测性服务：

```nginx
server {
    listen 80;
    server_name observability.example.com;

    # 基本认证
    auth_basic "Observability Dashboard";
    auth_basic_user_file /etc/nginx/.htpasswd;

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

## 安全考虑

### 访问控制

可观测性数据可能包含敏感信息：

- **内网访问**：仅在内网或 VPN 中暴露
- **认证保护**：使用反向代理添加认证
- **防火墙**：限制访问 IP 范围

### 数据清理

定期清理敏感数据：

```bash
# 删除 30 天前的数据
sqlite3 ~/.aigne/observability.db \
  "DELETE FROM traces WHERE timestamp < datetime('now', '-30 days');"

# 清空所有数据
sqlite3 ~/.aigne/observability.db "DELETE FROM traces;"
```

## 性能优化

### 数据库优化

定期优化数据库：

```bash
sqlite3 ~/.aigne/observability.db "VACUUM;"
```

### 限制数据量

考虑实现数据轮转策略：

```bash
# 创建清理脚本
#!/bin/bash
sqlite3 ~/.aigne/observability.db \
  "DELETE FROM traces WHERE timestamp < datetime('now', '-7 days');"
sqlite3 ~/.aigne/observability.db "VACUUM;"
```

### 分离存储

对于高负载场景，可以考虑：

- 使用独立的数据库服务器（如 PostgreSQL）
- 将数据导出到数据仓库
- 使用专业的 APM 工具

## 常见问题

### 端口被占用

**问题**：`Error: Port 7890 is already in use`

**解决方案**：
- 使用不同端口：`--port 8080`
- 停止占用端口的进程

### 数据库损坏

**问题**：无法启动服务，数据库错误

**解决方案**：
```bash
# 备份现有数据库
mv ~/.aigne/observability.db ~/.aigne/observability.db.bak

# 重新启动服务（会创建新数据库）
aigne observe
```

### 无法查看数据

**问题**：Web 界面显示为空

**解决方案**：
- 确认 Agent 正在运行并产生数据
- 检查浏览器控制台是否有错误
- 刷新页面
- 检查数据库文件是否存在

### 内存占用高

**问题**：长时间运行后内存占用过高

**解决方案**：
- 清理旧数据
- 定期重启服务
- 优化数据库
- 考虑使用外部数据库

## 最佳实践

1. **持续运行**：在开发环境保持可观测性服务运行
2. **定期清理**：设置定时任务清理旧数据
3. **访问控制**：生产环境添加认证保护
4. **数据备份**：定期备份重要的监控数据
5. **结合日志**：配合应用日志进行全面分析

## 导航

### 父主题

- [命令参考](../commands.md) - 返回命令列表

### 相关主题

- [run 命令](./run.md) - 运行 Agent 并查看监控数据
- [serve-mcp 命令](./serve-mcp.md) - 监控 MCP 服务
- [eval 命令](./eval.md) - 监控评估过程

### 下一步

- [deploy 命令](./deploy.md) - 部署生产环境
- [配置说明](../configuration.md) - 配置可观测性选项
