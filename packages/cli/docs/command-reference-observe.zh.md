---
labels: ["Reference"]
---

# aigne observe

`aigne observe` 命令会启动一个本地 Web 服务器，用于监控和分析 Agent 的执行数据。它提供了一个用户友好的界面，可以检查追踪信息、查看详细的调用信息，并了解 Agent 在运行过程中的行为。

该工具对于调试、性能调优以及深入了解 Agent 如何处理信息并与各种工具和模型交互至关重要。

## 用法

要启动可观测性服务器，请在终端中运行以下命令：

```bash 用法 icon=lucide:terminal
aigne observe [options]
```

启动后，CLI 将打印出服务器 URL 和本地可观测性数据库的路径。

![AIGNE 可观测性服务器运行界面](../assets/observe/observe-running-interface.png)

## 工作原理

`observe` 命令会启动一个 Web 应用程序，该程序从本地 SQLite 数据库中读取数据，AIGNE 将所有执行追踪信息存储在该数据库中。每次运行 Agent（使用 `aigne run` 或 `aigne serve-mcp`）时，该框架都会自动记录执行流程的详细日志，这些日志随后可在可观测性 UI 中进行检查。

该 UI 允许你浏览所有已记录追踪信息的列表，并深入查看特定的追踪信息，以了解 Agent 操作的逐步分解，包括输入、输出、工具调用和模型响应。

![在 AIGNE 可观测性 UI 中查看调用详情](../assets/observe/observe-view-call-details.png)

## 选项

`observe` 命令接受以下选项来自定义其行为：

| 选项   | 描述                                                                                                                           | 默认值                                                              | 
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `--host` | 指定服务器的主机地址。使用 `0.0.0.0` 可将服务器暴露给本地网络上的其他设备。                 | `localhost`                                                          |
| `--port` | 设置服务器监听的端口号。如果指定端口不可用，它将尝试寻找下一个可用端口。 | `7890` (可被 `PORT` 环境变量覆盖)        |

## 示例

### 在默认端口上启动服务器

运行不带任何选项的命令将使用默认设置启动服务器。

```bash 使用默认设置启动 icon=lucide:play
aigne observe
```

**预期输出：**

```text 控制台输出
Observability database path: /path/to/your/project/.aigne/observability.db
Observability server is running at http://localhost:7890
```

然后，你可以在 Web 浏览器中打开 `http://localhost:7890` 来访问 UI。

### 在特定端口上启动服务器

使用 `--port` 选项指定一个不同的端口。

```bash 在自定义端口上启动 icon=lucide:play-circle
aigne observe --port 8080
```

这将在 `http://localhost:8080` 上启动服务器。

### 将服务器暴露到你的本地网络

要允许网络上的其他设备访问可观测性 UI，请将主机设置为 `0.0.0.0`。

```bash 公开服务器 icon=lucide:globe
aigne observe --host 0.0.0.0
```

然后，服务器将可以通过 `http://<your-local-ip>:7890` 进行访问。