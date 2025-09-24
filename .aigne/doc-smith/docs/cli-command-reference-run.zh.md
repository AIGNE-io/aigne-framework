# run

`aigne run` 命令是您与 AI agent 交互和测试的主要工具。它允许您在终端中启动一个交互式聊天会话，或向 agent 发送单个提示以查看其响应。

## 用法

以下是使用 `run` 命令的常见方法：

```bash 基本用法
# 在当前目录中运行默认 agent
aigne run

# 按名称运行指定的 agent
aigne run <agent-name>

# 运行位于不同目录中的 agent
aigne run --path /path/to/your/project

# 直接从远程 URL 运行 agent
aigne run --url https://example.com/aigne-project.zip
```

## 参数

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="false" data-desc="AIGNE 项目的本地目录路径或远程 URL。如果未提供，则默认为当前目录（“.”）。"></x-field>
  <x-field data-name="entry-agent" data-type="string" data-required="false" data-desc="您要运行的特定 agent 的名称。如果省略，AIGNE 将运行项目中定义的默认 agent。"></x-field>
</x-field-group>

## 选项

这些选项允许您自定义 agent 的执行环境、模型参数以及输入/输出处理。

### 常规选项

<x-field-group>
  <x-field data-name="--chat" data-type="boolean" data-default="false" data-required="false" data-desc="在终端中启动一个交互式聊天循环，允许与 agent 进行连续对话。"></x-field>
  <x-field data-name="--entry-agent <name>" data-type="string" data-required="false" data-desc="通过名称指定要运行的 agent。这是位置参数 entry-agent 的替代方案。"></x-field>
  <x-field data-name="--cache-dir <dir>" data-type="string" data-required="false" data-desc="在使用 --url 选项时，指定一个自定义目录来下载和缓存远程 agent 包。"></x-field>
  <x-field data-name="--log-level <level>" data-type="string" data-default="silent" data-required="false">
    <x-field-desc markdown>设置日志的详细程度。可用级别包括 `silent`、`error`、`warn`、`info`、`debug`、`trace`。</x-field-desc>
  </x-field>
  <x-field data-name="--verbose" data-type="boolean" data-required="false" data-desc="启用详细日志记录的简写。等同于 `--log-level debug`。"></x-field>
</x-field-group>

### 模型选项

<x-field-group>
  <x-field data-name="--model <provider[:model]>" data-type="string" data-required="false" data-desc="指定要使用的 AI 模型，例如 'openai' 或 'openai:gpt-4o-mini'。这将覆盖 agent 配置中定义的模型。"></x-field>
  <x-field data-name="--temperature <value>" data-type="number" data-required="false" data-desc="控制随机性。较高的值（例如 0.8）会使输出更随机，而较低的值（例如 0.2）会使其更具确定性。范围：0.0 到 2.0。"></x-field>
  <x-field data-name="--top-p <value>" data-type="number" data-required="false" data-desc="通过核心采样控制多样性。较低的值（例如 0.1）意味着只考虑最可能的 token。范围：0.0 到 1.0。"></x-field>
  <x-field data-name="--presence-penalty <value>" data-type="number" data-required="false" data-desc="根据新 token 是否在文本中出现过来惩罚它们，从而增加模型谈论新主题的可能性。范围：-2.0 到 2.0。"></x-field>
  <x-field data-name="--frequency-penalty <value>" data-type="number" data-required="false" data-desc="根据新 token 在文本中已有的频率来惩罚它们，从而降低模型逐字重复同一行的可能性。范围：-2.0 到 2.0。"></x-field>
  <x-field data-name="--aigne-hub-url <url>" data-type="string" data-required="false" data-desc="指定用于获取远程模型或 agent 的自定义 AIGNE Hub 服务 URL。"></x-field>
</x-field-group>

### 输入和输出选项

<x-field-group>
  <x-field data-name="--input <text>" data-type="string" data-required="false" data-alias="-i" data-desc="向 agent 提供输入文本。要从文件读取内容，请使用 '@path/to/file.txt' 格式。可以多次指定。"></x-field>
  <x-field data-name="--input-file <path>" data-type="string" data-required="false" data-desc="向 agent 提供文件作为输入，这对于接受图像、文档等的的多模态 agent 非常有用。可以多次指定。"></x-field>
  <x-field data-name="--format <format>" data-type="string" data-required="false" data-desc="在从文件或标准输入读取时，指定输入数据的格式。可用选项：'text'、'json'、'yaml'。"></x-field>
  <x-field data-name="--output <path>" data-type="string" data-required="false" data-alias="-o" data-desc="将 agent 的输出保存到指定文件，而不是打印到控制台。"></x-field>
  <x-field data-name="--output-key <key>" data-type="string" data-default="output" data-required="false" data-desc="如果 agent 的结果是一个对象，此选项指定要将哪个键的值保存到输出文件。"></x-field>
  <x-field data-name="--force" data-type="boolean" data-default="false" data-required="false" data-desc="如果输出文件已存在，此选项将覆盖它。如果输出路径的父目录不存在，它也会创建这些目录。"></x-field>
</x-field-group>

## 示例

### 启动交互式聊天

要与您的 agent 进行连续对话，请使用 `--chat` 标志。

```bash 启动聊天会话 icon=lucide:message-square
aigne run your-agent-name --chat
```

### 发送单条消息

您可以直接从命令行发送单条文本。

```bash 发送提示 icon=lucide:terminal
aigne run your-agent-name --input "Translate 'hello' to French."
```

### 使用不同的 AI 模型

单次运行时覆盖 agent 的默认模型。

```bash 指定模型 icon=lucide:brain-circuit
aigne run your-agent-name --model openai:gpt-4o-mini --input "What is AIGNE?"
```

### 处理本地文件

要让 agent 处理文件内容，请使用 `@` 前缀。

```bash 处理文本文件 icon=lucide:file-text
aigne run summarizer-agent --input @long-article.txt
```

### 将输出保存到文件

结合输入和输出标志来创建处理流程。此命令读取 `long-article.txt`，生成摘要，并将其保存到 `summary.md`。

```bash 保存输出 icon=lucide:save
aigne run summarizer-agent --input @long-article.txt --output summary.md --force
```