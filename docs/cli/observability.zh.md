# 服务部署

[English](observability.md) | **中文**

使用 AIGNE CLI 启动数据监控服务。

## `aigne observability` 命令

在使用 aigne cli 时，会监控 agent 的数据流转情况，可以使用 aigne observability 启动一个服务查看

```bash
aigne observability [选项]
```

### 选项

- `--host <主机>`：运行 MCP 服务器的主机地址（默认为"localhost"），使用"0.0.0.0"可以公开暴露服务器
- `--port <端口>`：运行 MCP 服务器的端口（如果设置了环境变量PORT则使用其值，否则默认为 7890）
- `--help`：显示命令帮助

### 基本使用示例

```bash
aigne observability
```

成功启动后，命令会显示服务器运行地址：

```
Running observability server on http://localhost:7890
```

#### 使用自定义端口

```bash
aigne observability --port 8080
```

#### 公开暴露服务器

```bash
aigne observability --host 0.0.0.0
```

您可以使用环境变量来配置服务器：

```bash
# 设置端口
export PORT=8080
aigne observability

# 或者在命令行中直接设置
PORT=8080 aigne observability
```
