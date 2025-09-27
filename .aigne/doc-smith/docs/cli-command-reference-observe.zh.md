# observe

`aigne observe` 命令会启动一个本地 Web 服务器，提供一个可视化界面来监视和调试您的 Agent 的活动。这个可观测性服务器是理解您的 Agent 行为、跟踪对话以及在开发过程中诊断问题的重要工具。

## 用法

```bash Basic Usage icon=lucide:terminal
aigne observe [options]
```

## 描述

当您运行 `aigne observe` 时，它会启动一个基于 Web 的仪表板，该仪表板连接到一个记录 Agent 活动的本地数据库。这使您可以检查关于每个 Agent 交互的详细信息，包括输入、输出、技能执行和状态变更。

服务器将输出本地可观测性数据库的路径以及您可以访问仪表板的 URL。

## 选项

使用以下选项自定义服务器的主机和端口：

<x-field-group>
  <x-field data-name="--host" data-type="string" data-default="localhost">
    <x-field-desc markdown>运行服务器的网络主机。使用 `0.0.0.0` 可在您的网络上公开服务器。</x-field-desc>
  </x-field>
  <x-field data-name="--port" data-type="number" data-default="7890">
    <x-field-desc markdown>运行服务器的端口号。如果默认端口被占用，它将自动查找下一个可用的端口。</x-field-desc>
  </x-field>
</x-field-group>

## 示例

### 在默认端口上启动服务器

要使用默认设置启动可观测性服务器，只需运行不带任何选项的命令即可。它通常可在 `http://localhost:7890` 访问。

```bash Start on Default Port icon=lucide:play
aigne observe
```

运行该命令后，您将看到类似以下的输出：

```text Console Output
Observability database path: /path/to/your/project/.aigne/observability.db
Observability server is running at http://localhost:7890
```

### 在自定义端口上启动服务器

如果默认端口被占用或您希望使用其他端口，可以使用 `--port` 选项来指定。

```bash Start on a Custom Port icon=lucide:play
aigne observe --port 3001
```

这将在端口 3001 上启动服务器，您可以在 `http://localhost:3001` 访问它。