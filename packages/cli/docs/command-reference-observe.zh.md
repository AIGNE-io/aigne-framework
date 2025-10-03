---
labels: ["Reference"]
---

---
labels: ["参考"]
---

# aigne observe

`aigne observe` 命令会启动一个本地 Web 服务器，用于监控和分析 Agent 执行数据。它提供了一个用户友好的界面，用于检查跟踪、查看详细的调用信息，并了解您的 Agent 在运行期间的行为。该工具对于调试、性能调优以及深入了解您的 Agent 如何处理信息并与各种工具和模型交互至关重要。

## 用法

要启动可观测性服务器，请在终端中运行以下命令：

```bash Usage icon=lucide:terminal
aigne observe [options]
```

启动后，CLI 将打印出服务器的 URL 和本地可观测性数据库的路径。

![AIGNE 可观测性服务器运行界面](../assets/observe/observe-running-interface.png)

## 工作原理

`observe` 命令会启动一个 Web 应用程序，该程序从本地 SQLite 数据库中读取数据，AIGNE 在该数据库中存储所有执行跟踪。每次运行 Agent（使用 `aigne run` 或 `aigne serve-mcp`）时，框架都会自动记录执行流程的详细日志。然后，这些日志就可以在可观测性 UI 中进行检查。

UI 允许您浏览所有已记录跟踪的列表，并深入研究特定的跟踪，以查看 Agent 操作的逐步分解，包括输入、输出、工具调用和模型响应。

![在 AIGNE 可观测性 UI 中查看调用详情](../assets/observe/observe-view-call-details.png)

## 选项

<x-field data-name="--host" data-type="string" data-default="localhost" data-desc="指定服务器的主机地址。使用 `0.0.0.0` 可将服务器暴露给本地网络上的其他设备。"></x-field>
<x-field data-name="--port" data-type="number" data-default="7890" data-desc="设置服务器监听的端口号。如果指定端口不可用，它将尝试查找下一个可用端口。也可以通过 `PORT` 环境变量进行设置。"></x-field>

## 示例

### 在默认端口上启动服务器

不带任何选项运行该命令将使用默认设置启动服务器。

```bash Start with default settings icon=lucide:play
aigne observe
```

**预期输出：**

```text Console Output
可观测性数据库路径：/path/to/your/project/.aigne/observability.db
可观测性服务器正在 http://localhost:7890 运行
```

然后，您可以在 Web 浏览器中打开 `http://localhost:7890` 来访问 UI。

### 在特定端口上启动服务器

使用 `--port` 选项指定一个不同的端口。

```bash Start on a custom port icon=lucide:play-circle
aigne observe --port 8080
```

这将在 `http://localhost:8080` 上启动服务器（如果 8080 端口正在使用，则会使用下一个可用端口）。

### 将服务器暴露到您的本地网络

要允许网络上的其他设备访问可观测性 UI，请将主机设置为 `0.0.0.0`。

```bash Expose the server publicly icon=lucide:globe
aigne observe --host 0.0.0.0
```

然后，服务器将可以通过 `http://<your-local-ip>:7890` 进行访问。