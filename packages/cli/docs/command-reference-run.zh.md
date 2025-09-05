---
labels: ["Reference"]
---

---labels: ["Reference"]---

# aigne run

`aigne run` 命令用于从本地目录或远程 URL 执行一个 agent。它是在开发过程中测试 agent 并与之交互的主要命令，提供了交互式聊天模式、动态模型选择以及灵活的输入/输出处理等功能。

## 用法

```bash
# 在当前目录中运行默认 agent
aigne run

# 从指定的本地路径运行 agent
aigne run --path /path/to/your/project

# 从远程 Git 仓库或 tarball URL 运行 agent
aigne run https://github.com/user/repo.git

# 运行项目中的特定 agent
aigne run mySpecificAgent

# 与 agent 开始交互式聊天会话
aigne run --chat
```

## 工作原理

`run` 命令遵循一系列步骤来准备环境并执行 agent。此过程包括解析路径、在必要时下载远程包、初始化 AIGNE 引擎，然后单次运行或在聊天循环中运行所选的 agent。

```d2
direction: down

start: {
  label: "开始: aigne run [path]"
  shape: circle
}

check_path: {
  label: "路径是远程 URL 吗？"
  shape: diamond
}

handle_remote: {
  label: "处理远程项目"
  shape: package

  download: "下载并解压包\n至本地缓存 (~/.aigne)"
}

handle_local: {
  label: "处理本地项目"
  shape: package

  resolve_path: "解析本地目录路径"
}

init_aigne: {
  label: "初始化 AIGNE 引擎"
  shape: rectangle

  load_env: "加载 .env 文件"
  load_config: "加载 aigne.yaml"
  init_engine: "实例化模型、agent、技能"
}

build_commands: {
  label: "构建 Agent 命令"
  shape: rectangle

  sub_parser: "为 agent 创建子解析器"
  add_agents: "将每个 agent 添加为子命令"
}

parse_args: {
  label: "解析 Agent 和选项"
  shape: parallelogram
}

execute_agent: {
  label: "执行所选 Agent"
  shape: rectangle
}

shutdown: {
  label: "关闭 AIGNE 引擎"
  shape: rectangle
}

end: {
  label: "结束"
  shape: circle
}


start -> check_path
check_path -> handle_remote: "是"
check_path -> handle_local: "否"
handle_remote -> init_aigne
handle_local -> init_aigne
init_aigne -> build_commands
build_commands -> parse_args
parse_args -> execute_agent
execute_agent -> shutdown
shutdown -> end
```

## 选项

`run` 命令支持多种选项以自定义其行为。

### 通用选项

| Option | Description |
|---|---|
| `path` | 位置参数，指定 agent 目录的路径或 AIGNE 项目的 URL。默认为当前目录 (`.`)。 |
| `agent` | 位置参数，指定要运行的 agent 的名称。如果未提供，AIGNE 会显示可用 agent 列表，或者如果已配置默认 agent，则运行默认 agent。 |
| `--chat` | 在终端的交互式聊天循环中运行 agent。此模式非常适合对话式 agent。默认值：`false`。 |
| `--cache-dir <dir>` | 从 URL 运行时，此选项指定用于下载和缓存远程包的目录。默认为 `~/.aigne/<hostname>/<pathname>`。 |

### 模型配置

| Option | Description |
|---|---|
| `--model <provider[:model]>` | 指定要使用的 AI 模型，例如 'openai' 或 'openai:gpt-4o-mini'。此选项会覆盖在 `aigne.yaml` 中配置的模型。 |
| `--temperature <value>` | 设置模型的温度 (0.0-2.0) 以控制随机性。 |
| `--top-p <value>` | 设置模型的 top-p (核心采样) 参数 (0.0-1.0) 以控制多样性。 |
| `--presence-penalty <value>` | 设置存在惩罚 (-2.0 到 2.0) 以阻止重复的词元。 |
| `--frequency-penalty <value>` | 设置频率惩罚 (-2.0 到 2.0) 以阻止高频词元。 |

### 输入与输出

| Option | Alias | Description |
|---|---|---|
| `--input <value>` | `-i` | 为 agent 提供输入。可多次指定。使用 `@<file>` 从文件读取输入。 |
| `--format <format>` | | 从文件或标准输入读取时，指定输入的格式。可以是 `json` 或 `yaml`。 |
| `--output <file>` | `-o` | 将 agent 的结果保存到指定文件，而不是打印到标准输出。 |
| `--output-key <key>` | | 要保存到输出文件的 agent 结果对象中的键。默认为 `output`。 |
| `--force` | | 如果输出文件已存在，此选项允许覆盖它。如果父目录不存在，它也会创建父目录。默认值：`false`。 |

### 其他选项

| Option | Description |
|---|---|
| `--log-level <level>` | 设置日志的详细程度。可用级别：`debug`、`info`、`warn`、`error`、`silent`。 |
| `--aigne-hub-url <url>` | 指定用于获取远程模型或凭证的自定义 AIGNE Hub 服务 URL。 |

## 场景与示例

### 交互式聊天模式

要与您的 agent 进行连续对话，请使用 `--chat` 标志。这对于测试聊天机器人或助手非常有用。

```bash
aigne run --chat
```

这将启动一个会话，您可以在其中输入消息并接收来自 agent 的响应。您可以输入 `/exit` 结束会话，或输入 `/help` 查看可用命令列表。

![在聊天模式下运行项目](../assets/run/run-default-template-project-in-chat-mode.png)

### 从文件提供输入

您可以使用 `@` 前缀将文件的内容作为输入传递给 agent。这对于复杂或冗长的输入非常有用。

```bash
# 将 'prompt.txt' 的内容作为主要输入传递
aigne run --input @prompt.txt

# 如果 agent 的输入结构 (InputSchema) 有一个名为 'document' 的字段
aigne run --document @document.md
```

如果文件是 JSON 或 YAML 文件，CLI 可以根据文件扩展名（`.json`、`.yaml`、`.yml`）自动解析它。您也可以使用 `--format` 显式指定格式。

```bash
# AIGNE 将解析 data.json 并将其键映射到 agent 的输入结构 (InputSchema)
aigne run --input @data.json

# 显式地将 input.txt 作为 YAML 处理
aigne run --input @input.txt --format yaml
```

### 指定模型和参数

您可以直接从命令行覆盖单次运行的默认模型及其设置。

```bash
# 使用特定的 OpenAI 模型和更高的温度运行 agent，以获得更具创造性的响应
aigne run --model openai:gpt-4o-mini --temperature 1.2
```

### 保存 Agent 输出

要将 agent 执行的结果保存到文件，请使用 `--output` 标志。

```bash
# 运行 agent 并将完整的 JSON 结果保存到 result.json
aigne run --input "Summarize the latest AI news" --output result.json
```

如果您只需要输出中的特定字段（例如，文本内容），可以使用 `--output-key`。

```bash
# 假设 agent 返回 { "summary": "...", "sources": [...] }
# 此命令仅将摘要文本保存到 summary.txt
aigne run --input "Summarize..." --output summary.txt --output-key summary
```

对于更高级的用例，例如将您的 agent 部署为服务，请参阅 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 命令。