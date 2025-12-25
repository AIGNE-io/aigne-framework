# create - 创建项目

`aigne create` 命令用于创建新的 AIGNE 项目，包含 Agent 配置文件和项目结构。

## 命令格式

```bash
aigne create [path]
```

## 参数说明

### 位置参数

- **`[path]`**（可选）：项目创建路径
  - 如果省略，将在交互式界面中输入项目名称
  - 如果提供，将在指定路径创建项目
  - 支持相对路径和绝对路径

## 使用示例

### 交互式创建

不指定路径，通过交互界面输入项目信息：

```bash
aigne create
```

系统会提示：
1. 输入项目名称（默认：`my-aigne-project`）
2. 选择项目模板（目前支持 `default` 模板）

### 指定路径创建

直接指定项目路径：

```bash
# 在当前目录下创建 my-agent 项目
aigne create my-agent

# 使用绝对路径
aigne create /path/to/my-agent

# 使用相对路径
aigne create ../projects/my-agent
```

## 交互流程

### 1. 输入项目名称

如果使用 `aigne create` 不带参数，系统会提示输入项目名称：

![项目名称输入提示](../../../../assets/create/create-project-interactive-project-name-prompt.png)

**验证规则**：
- 项目名称不能为空
- 如果目录已存在且非空，会询问是否覆盖

### 2. 选择模板

系统会显示可用的项目模板列表：

```
? Select a template: (Use arrow keys)
❯ default
```

目前支持的模板：
- **default**：包含基本的 Agent 配置和示例文件

### 3. 创建成功

项目创建完成后，会显示成功消息和后续操作提示：

![创建成功消息](../../../../assets/create/create-project-using-default-template-success-message.png)

## 创建的项目结构

使用 `default` 模板创建的项目包含以下文件：

```
my-agent/
├── aigne.yaml          # AIGNE 配置文件
├── .env                # 环境变量配置（需要手动填写）
└── [其他模板文件]       # 根据模板不同而不同
```

### aigne.yaml

这是 AIGNE 的核心配置文件，定义了：
- Agent 名称和描述
- 使用的模型
- Agent 的工具和能力
- 系统提示词

### .env

环境变量配置文件，用于存储敏感信息，如：
- API 密钥（`OPENAI_API_KEY`、`ANTHROPIC_API_KEY` 等）
- 自定义配置项

**注意**：`.env` 文件不应提交到版本控制系统。

## 覆盖现有目录

如果目标目录已存在且非空，系统会询问是否覆盖：

```
? The directory "my-agent" is not empty. Do you want to remove its contents? (y/N)
```

选项：
- **Yes (y)**：删除目录中的所有内容，然后创建新项目
- **No (N)**：取消操作，保留现有内容

## 创建后的操作

项目创建成功后，您可以：

1. **进入项目目录**：
   ```bash
   cd my-agent
   ```

2. **配置环境变量**：
   编辑 `.env` 文件，添加必要的 API 密钥

3. **运行 Agent**：
   ```bash
   aigne run
   ```

4. **查看项目结构**：
   ```bash
   ls -la
   ```

## 模板说明

### default 模板

默认模板提供了一个简单的起始项目结构，包括：
- 基本的 Agent 配置
- 示例提示词
- 环境变量模板

适用于：
- 快速开始新项目
- 学习 AIGNE 框架
- 原型开发

### 未来模板

未来计划添加更多模板，如：
- **blocklet**：用于创建 Blocklet 应用
- **mcp-server**：专注于 MCP 服务的模板
- **multi-agent**：多 Agent 协作模板

## 常见问题

### 项目名称验证失败

**问题**：输入的项目名称被拒绝

**解决方案**：
- 确保项目名称不为空
- 避免使用特殊字符
- 使用有效的目录名称

### 目录已存在

**问题**：目标目录已存在

**解决方案**：
- 选择覆盖现有内容（会删除所有文件）
- 取消操作，手动备份现有内容
- 使用不同的项目名称或路径

### 模板文件缺失

**问题**：创建过程中提示模板未找到

**解决方案**：
- 确认 AIGNE CLI 安装完整
- 尝试重新安装：`npm install -g @aigne/cli`
- 检查文件系统权限

## 导航

### 父主题

- [命令参考](../commands.md) - 返回命令列表

### 相关主题

- [快速开始](../getting-started.md) - 创建项目后的后续步骤
- [run 命令](./run.md) - 运行创建的 Agent

### 下一步

- [run 命令](./run.md) - 了解如何运行 Agent
- [配置说明](../configuration.md) - 配置项目环境
