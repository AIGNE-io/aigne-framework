# 使用监视器

[English](observe.md) | **中文**

使用 AIGNE CLI 启动数据监控服务，实时监控和分析 AI Agent 的运行状态。

## `aigne observe` 命令

AIGNE 监视器提供强大的可视化界面，帮助您监控 Agent 的数据流转情况。

```bash
aigne observe [选项]
```

### 选项

* `--host <主机>`：运行监视器服务的主机地址（默认为"localhost"），使用"0.0.0.0"可以公开暴露服务器
* `--port <端口>`：运行监视器服务的端口（如果设置了环境变量PORT则使用其值，否则默认为 7890）
* `--help`：显示命令帮助

### 基本使用示例

启动监视器服务：

```bash
aigne observe
```

成功启动后，命令会显示服务器运行地址：

```
Running observability server on http://localhost:7890
```

在浏览器中访问该地址即可查看监视器界面。

![AIGNE Monitor Screenshot](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

#### 使用自定义端口

```bash
aigne observe --port 8080
```

#### 公开暴露服务器

```bash
aigne observe --host 0.0.0.0
```

#### 使用环境变量配置

您可以使用环境变量来配置服务器：

```bash
# 设置端口
export PORT=8080
aigne observe

# 或者在命令行中直接设置
PORT=8080 aigne observe
```

## 运行示例应用

运行示例 AIGNE 应用时，可以在监视器中实时查看 Agent 的数据流和调用链。

```bash
# 设置 OpenAI API 密钥
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# One-shot 模式运行
npx -y @aigne/example-chat-bot

# 或者加入 `--chat` 参数进入交互式聊天模式
npx -y @aigne/example-chat-bot --chat
```
