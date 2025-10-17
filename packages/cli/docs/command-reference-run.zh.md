---
labels: ["Reference"]
---

# aigne run

`aigne run` 命令是执行 AIGNE agent 的主要方式。它可以从本地项目目录或直接从远程 URL 运行 agent。它提供了一套灵活的选项，用于提供输入、配置 AI 模型和处理输出，包括用于对话式 agent 的交互式聊天模式。

## 用法

```bash Basic Syntax
aigne run [path] [agent_name] [options]
```

### 参数

-   `[path]` (可选): AIGNE 项目目录的路径或远程 URL（例如，Git 仓库）。如果省略，则默认为当前目录 (`.`)。
-   `[agent_name]` (可选): 要从项目中运行的特定 agent。如果未指定，CLI 将使用 `aigne.yaml` 中定义的 `entry-agent` 或默认的 `chat` agent，如果两者都未定义，则会使用列出的第一个 agent。

## 工作原理

`run` 命令首先加载 AIGNE 应用程序。如果提供了远程 URL，它会在继续之前在本地下载并缓存项目。然后，它会解析命令行参数，并使用给定的输入和模型配置来执行指定的 agent。

```d2 Remote Execution Flow icon=lucide:workflow
direction: down

User: {
  shape: c4-person
}

CLI: {
  label: "@aigne/cli"

  Download: {
    label: "下载包"
  }

  Extract: {
    label: "解压包"
  }

  Load: {
    label: "加载应用"
  }

  Execute: {
    label: "执行 Agent"
  }
}

Remote-URL: {
  label: "远程 URL\n（例如，GitHub）"
  shape: cylinder
}

Cache-Dir: {
  label: "缓存目录\n(~/.aigne/.download)"
  shape: cylinder
}

Local-Dir: {
  label: "本地目录\n(~/.aigne/<hostname>/...)"
  shape: cylinder
}

User -> CLI: "aigne run <url>"
CLI.Download -> Remote-URL: "1. 获取项目"
Remote-URL -> CLI.Download: "2. 返回 tarball"
CLI.Download -> Cache-Dir: "3. 保存 tarball"
CLI.Extract -> Cache-Dir: "4. 读取 tarball"
CLI.Extract -> Local-Dir: "5. 解包项目文件"
CLI.Load -> Local-Dir: "6. 加载 aigne.yaml 和 .env"
CLI.Execute -> CLI.Load: "7. 运行 Agent"
CLI.Execute -> User: "8. 显示输出"
```

## 示例

### 运行本地 Agent

从本地文件系统上的项目执行 agent。

```bash Run from current directory icon=lucide:folder-dot
# 运行当前目录中的默认 Agent
aigne run
```

```bash Run a specific agent icon=lucide:locate-fixed
# 运行位于特定项目路径中的 'translator' Agent
aigne run path/to/my-project translator
```

### 运行远程 Agent

你可以直接从 Git 仓库或 tarball URL 运行 agent。CLI 会处理下载并将项目缓存到你的主目录 (`~/.aigne`) 中。

```bash Run from a GitHub repository icon=lucide:github
aigne run https://github.com/AIGNE-io/aigne-framework/tree/main/examples/default
```

### 以交互式聊天模式运行

对于对话式 agent，使用 `--chat` 标志启动一个交互式终端会话。

![在聊天模式下运行 Agent](../assets/run/run-default-template-project-in-chat-mode.png)

```bash Start a chat session icon=lucide:messages-square
aigne run --chat
```

在聊天循环中，你可以使用像 `/exit` 这样的命令退出，使用 `/help` 获取帮助。你还可以通过在路径前加上 `@` 前缀，将本地文件附加到你的消息中。

```
💬 告诉我关于这个文件的信息：@/path/to/my-document.pdf
```

## 为 Agent 提供输入

根据 `aigne.yaml` 中定义的输入模式，有多种方式可以为你的 agent 提供输入。

#### 作为命令行选项

如果 agent 的输入模式定义了特定的参数（例如，`text`、`targetLanguage`），你可以将它们作为命令行选项传递。

```bash Pass agent-specific parameters icon=lucide:terminal
# 假设 'translator' agent 有 'text' 和 'targetLanguage' 输入
aigne run translator --text "Hello, world!" --targetLanguage "Spanish"
```

#### 从标准输入 (stdin)

你可以直接将内容通过管道传递给 `run` 命令。这对于链接命令非常有用。

```bash Pipe input to an agent icon=lucide:pipe
echo "Summarize this important update." | aigne run summarizer
```

#### 从文件

使用 `@` 前缀从文件中读取内容并将其作为输入传递。

-   **`--input @<file>`**: 读取整个文件内容作为主要输入。
-   **`--<param> @<file>`**: 为特定的 agent 参数读取文件内容。

```bash Read input from a file icon=lucide:file-text
# 使用 document.txt 的内容作为主要输入
aigne run summarizer --input @document.txt

# 为多个参数提供结构化的 JSON 输入
aigne run translator --input @request-data.json --format json
```

#### 多媒体文件输入

对于处理图像或文档等文件（例如，视觉模型）的 agent，请使用 `--input-file` 选项。

```bash Attach a file for a vision agent icon=lucide:image-plus
aigne run image-describer --input-file cat.png --input "What is in this image?"
```

## 选项参考

### 通用选项

| Option | Description |
|---|---|
| `--chat` | 在终端中以交互式聊天循环方式运行 agent。 |
| `--log-level <level>` | 设置日志记录级别。可用级别：`debug`、`info`、`warn`、`error`、`silent`。默认为 `silent`。 |

### 模型选项

这些选项允许你覆盖 `aigne.yaml` 中定义的模型配置。

| Option | Description |
|---|---|
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如，'openai' 或 'openai:gpt-4o-mini'）。 |
| `--temperature <value>` | 模型温度（0.0-2.0）。值越高，随机性越大。 |
| `--top-p <value>` | 模型 top-p / 核心采样（0.0-1.0）。控制响应的多样性。 |
| `--presence-penalty <value>` | 存在惩罚（-2.0 到 2.0）。对重复的令牌进行惩罚。 |
| `--frequency-penalty <value>` | 频率惩罚（-2.0 到 2.0）。对频繁出现的令牌进行惩罚。 |
| `--aigne-hub-url <url>` | 用于获取远程模型或 agent 的自定义 AIGNE Hub 服务 URL。 |

### 输入和输出选项

| Option | Alias | Description |
|---|---|---|
| `--input <value>` | `-i` | Agent 的输入。可以多次指定。使用 `@<file>` 从文件读取。 |
| `--input-file <path>` | | Agent 输入文件的路径（例如，用于视觉模型）。可以多次指定。 |
| `--format <format>` | | 使用 `--input @<file>` 时的输入格式。可选值：`text`、`json`、`yaml`。 |
| `--output <file>` | `-o` | 用于保存结果的文件路径。默认为打印到标准输出。 |
| `--output-key <key>` | | 要保存到输出文件的 agent 结果对象中的键。默认为 `output`。 |
| `--force` | | 如果输出文件已存在，则覆盖它。如果父目录不存在，则创建它们。 |

---

## 下一步

<x-cards>
  <x-card data-title="aigne observe" data-icon="lucide:monitor-dot" data-href="/command-reference/observe">
    了解如何启动可观察性服务器以查看 agent 运行的详细跟踪信息。
  </x-card>
  <x-card data-title="运行远程 Agent" data-icon="lucide:cloudy" data-href="/guides/running-remote-agents">
    深入了解直接从远程 URL 执行 agent 的具体细节。
  </x-card>
  <x-card data-title="创建自定义 Agent" data-icon="lucide:bot" data-href="/guides/creating-a-custom-agent">
    开始构建你自己的 agent 和技能，以便与 AIGNE CLI 一起使用。
  </x-card>
</x-cards>
