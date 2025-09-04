---
labels: ["Reference"]
---

# aigne observe

`aigne observe` 命令会启动一个本地 Web 服务器，帮助你可视化并分析 Agent 的执行追踪。这是调试、监控性能以及理解 Agent 行为步骤的重要工具。

当你运行 Agent 时，AIGNE 框架会自动捕获详细的可观测性数据。`observe` 命令提供了一个用户界面来浏览这些数据。

## 用法

```bash
aigne observe [options]
```

启动后，该命令将打印本地可观测性数据库的路径和用于访问 Web 界面的 URL。

```text
可观测性数据库路径：/path/to/your/project/.aigne/observability.db
可观测性服务器正在监听：http://localhost:7890
```

## 选项

| Option   | Type     | Description                                                                                                        |
| :------- | :------- | :----------------------------------------------------------------------------------------------------------------- |
| `--host` | `string` | 指定运行服务器的主机。使用 `0.0.0.0` 可将服务器暴露到你的本地网络。默认为 `localhost`。 |
| `--port` | `number` | 指定服务器的端口。如果未提供，它将尝试使用 `PORT` 环境变量，或默认为 `7890`。       |

## 示例

### 在默认端口上启动服务器

在你的项目目录中运行该命令，以在 `http://localhost:7890` 上启动服务器。

```bash
aigne observe
```

### 在自定义端口上启动服务器

使用 `--port` 选项指定一个不同的端口。

```bash
aigne observe --port 8000
```

### 将服务器暴露到你的网络

使用 `--host 0.0.0.0` 可使可观测性界面能从同一网络上的其他设备访问。

```bash
aigne observe --host 0.0.0.0 --port 8080
```

## 可观测性界面

服务器运行后，你可以在浏览器中打开提供的 URL，以查看 Agent 执行数据。

### 追踪仪表盘

主仪表盘会列出所有已记录的 Agent 执行追踪，让你对近期活动有一个高层级的概览。

![可观测性服务器的主运行界面，显示了最近的 Agent 追踪列表。](../assets/observe/observe-running-interface.png)

### 追踪详情视图

点击某条特定的追踪将进入详情视图。在这里，你可以检查完整的执行流程，包括模型输入和输出、工具调用、中间步骤，以及 Agent 运行的每个阶段的性能指标。

![特定调用追踪的详细视图，显示了输入、输出、日志和元数据。](../assets/observe/observe-view-call-details.png)