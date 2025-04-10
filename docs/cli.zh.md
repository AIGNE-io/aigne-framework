# AIGNE CLI

[English](cli.md) | **中文**

AIGNE 命令行界面（CLI）提供了一套工具，用于从命令行运行和测试您的 AIGNE 代理。

## 安装

CLI 包含在 `@aigne/cli` 包中。您可以全局安装它：

```bash
npm install -g @aigne/cli
```

或者直接使用 npx：

```bash
npx @aigne/cli [命令]
```

## 命令

AIGNE CLI 提供以下命令：

### 全局选项

- `--version`：显示 CLI 版本
- `--help`：显示帮助信息

### `aigne run`

使用指定代理运行聊天循环。

```bash
aigne run [路径] [选项]
```

#### 参数

- `路径`：代理目录的路径（默认为当前目录 `.`）

#### 选项

- `--agent <代理>`：要使用的代理名称（默认为找到的第一个代理）
- `--help`：显示命令帮助

#### 示例

在当前目录中运行代理：

```bash
aigne run
```

在特定目录中运行代理：

```bash
aigne run ./my-agents
```

运行特定代理：

```bash
aigne run --agent myAgent
```

### `aigne create`

创建一个新的 AIGNE 项目，包含所需的配置文件。该命令会以交互方式提示输入项目名称。

```bash
aigne create [路径]
```

#### 参数

- `路径`：可选的项目目录路径（将在提示中用作默认项目名称）

#### 选项

- `--help`：显示命令帮助

#### 示例

通过交互式提示创建新的 AIGNE 项目：

```bash
aigne create
# 将提示您输入项目名称
```

使用建议的名称创建新的 AIGNE 项目：

```bash
aigne create my-new-agent
# 将以"my-new-agent"作为默认项目名称提示
```

### `aigne test`

在指定的代理目录中运行测试。

```bash
aigne test [路径]
```

#### 参数

- `路径`：代理目录的路径（默认为当前目录 `.`）

#### 选项

- `--help`：显示命令帮助

#### 示例

在当前目录中运行测试：

```bash
aigne test
```

在特定目录中运行测试：

```bash
aigne test ./my-agents
```

### `aigne serve`

将指定目录中的代理作为模型上下文协议（MCP）服务器提供。

```bash
aigne serve [路径] [选项]
```

#### 参数

- `路径`：代理目录的路径（默认为当前目录 `.`）

#### 选项

- `--mcp`：将代理作为 MCP 服务器提供（目前为必需选项）
- `--port <端口>`：运行 MCP 服务器的端口（默认为 3000）
- `--help`：显示命令帮助

#### 示例

在默认端口上将当前目录中的代理作为 MCP 服务器提供：

```bash
aigne serve --mcp
```

将特定目录中的代理与自定义端口一起提供：

```bash
aigne serve ./my-agents --mcp --port 8080
```

## 使用示例

### 创建并运行代理

1. 创建一个新的 AIGNE 项目：

```bash
aigne create my-agent
cd my-agent
```

这将创建包含必要配置文件（`aigne.yaml` 和 `chat.yaml`）的目录。

2. 运行代理：

```bash
aigne run
```

### 运行代理测试

1. 在您的代理目录中创建测试文件（必须使用 Node.js 测试格式）

2. 运行测试：

```bash
aigne test
```

## 环境变量

AIGNE CLI 继承代理所需的任何环境变量。在运行 CLI 之前，请确保设置所需的环境变量。

## 其他资源

有关开发代理的更多信息，请参阅以下资源：

- [代理开发指南](./agent-development.zh.md)：使用 YAML/JS 配置文件开发 AIGNE 代理的指南
- [AIGNE 框架文档](./cookbook.zh.md)：官方框架文档
