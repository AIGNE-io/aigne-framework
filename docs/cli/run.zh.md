# 运行代理

[English](run.md) | **中文**

使用 AIGNE CLI 运行您的代理。

## `aigne run` 命令

运行当前目录或者指定目录中的代理。

```bash
aigne run [选项]
```

### 选项

* `--path <路径>`：代理目录的路径（默认为当前目录 `.`）或指向 AIGNE Studio 中项目的 URL
* `--entry-agent <代理>`：要运行的代理名称（默认为找到的第一个代理）
* `--cache-dir <目录>`：下载包的目录（使用URL时），默认为 `~/.aigne/xxx`
* `--chat`：在终端中运行聊天循环（默认为false，即 one-shot 模式）
* `--input -i <输入>`：代理的输入
* `--model <提供商[:模型]>`：要使用的AI模型，格式为'提供商\[:模型]'，其中模型是可选的。示例：'openai'或'openai:gpt-4o-mini'。可用提供商：openai、anthropic、bedrock、deepseek、gemini、ollama、openrouter、xai（默认为openai）
* `--temperature <温度>`：模型的温度参数（控制随机性，值越高输出越随机）。范围：0.0-2.0，0.0为最确定性输出。
* `--top-p <top-p>`：模型的 Top P（核采样）参数（控制多样性）。范围：0.0-1.0，值越低则限制为更可能的标记。
* `--presence-penalty <存在惩罚>`：模型的存在惩罚参数（惩罚重复出现的标记）。范围：-2.0至2.0，正值会减少重复。
* `--frequency-penalty <频率惩罚>`：模型的频率惩罚参数（惩罚标记使用频率）。范围：-2.0至2.0，正值会减少标记重复使用。
* `--log-level <日志级别>`：详细日志级别，用于调试信息。可选值："debug"、"info"、"warn"、"error"。
* `--help`：显示命令帮助

### 基本使用示例

#### 在当前目录中运行代理

```bash
aigne run
```

#### 在特定目录中运行代理

```bash
aigne run ./my-agents
```

#### 运行特定代理

```bash
aigne run --entry-agent myAgent
```

#### 以对话模式运行代理

```bash
aigne run --chat
```

#### 使用特定输入运行代理

```bash
aigne run --input "你好，请帮我分析这个问题"
```

### 从 AIGNE Studio 运行代理

您可以直接从 AIGNE Studio 项目 URL 运行代理：

```bash
aigne run https://www.aigne.io/projects/xxx/xxx.tgz
```

#### 运行 AIGNE Studio 中的 Agents 的完整步骤

https://github.com/user-attachments/assets/f528d1a1-31d1-48e5-b89e-e3d555c53649

1. **在 AIGNE Studio 创建一个项目：**
   * 登录 [AIGNE Studio](https://www.aigne.io)
   * 点击创建新项目
   * 添加所需的 Agents 到项目中

2. **获取 CLI 命令：**
   * 在项目页面中，点击右上角的设置图标
   * 在设置菜单中找到"集成"选项卡
   * 在 AIGNE CLI 部分，如果没有链接则点击"生成链接"按钮
   * 复制生成的 `aigne run` 命令（格式类似 `aigne run https://www.aigne.io/projects/xxx/xxx.tgz?secret=yyy&hash=zzz`）

3. **运行命令：**
   * 打开终端
   * 粘贴并运行复制的命令
   * 系统将自动下载项目及其代理并启动聊天循环

### 模型配置示例

#### 使用不同的AI模型

```bash
# 使用 OpenAI GPT-4
aigne run --model openai:gpt-4

# 使用 Anthropic Claude
aigne run --model anthropic:claude-3-sonnet

# 使用本地 Ollama 模型
aigne run --model ollama:llama2
```

#### 调整模型参数

```bash
# 设置较低的温度以获得更确定性的输出
aigne run --temperature 0.2

# 设置较高的温度以获得更创造性的输出
aigne run --temperature 0.8

# 组合多个参数
aigne run --model openai:gpt-4 --temperature 0.5 --top-p 0.9
```

### 调试和日志

使用不同的日志级别来获取更多调试信息：

```bash
# 启用调试日志
aigne run --log-level debug

# 只显示错误信息
aigne run --log-level error
```
