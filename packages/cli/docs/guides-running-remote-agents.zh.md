---
labels: ["Reference"]
---

# 运行远程 Agent

AIGNE CLI 不仅可以从本地目录执行 Agent，还可以从远程位置执行。此功能允许你直接通过指向压缩项目存档（例如 .tar.gz 文件）的 URL 来运行 Agent。它简化了共享、测试以及将 Agent 集成到自动化工作流中的过程，无需预先克隆仓库。

## 基本用法

为实现此目的，可使用 `run` 命令，并提供一个 URL 来代替本地文件路径。远程源必须是可公开访问的 tarball 存档。

```bash
# 从远程 URL 运行 Agent
aigne run https://example.com/path/to/my-aigne-project.tar.gz
```

Agent 下载并初始化后，CLI 将启动一个交互式聊天会话，就像处理本地 Agent 一样。

![在聊天模式下运行 Agent](../assets/run/run-default-template-project-in-chat-mode.png)

## 工作原理

当你提供一个 URL 时，CLI 会在后台执行以下步骤：

1.  **下载**：它从指定的 URL 获取压缩包。
2.  **缓存**：它创建一个本地目录来存储下载的内容。默认情况下，该目录位于你的主目录下的 `~/.aigne/` 中，其路径由 URL 的主机名和路径派生而来（例如 `~/.aigne/example.com/path/to/project/`）。
3.  **解压**：tarball 被解压到缓存目录中。
4.  **执行**：然后，CLI 从解压后的文件中初始化并运行 Agent，就像处理本地项目一样。

这个过程确保了后续运行同一 URL 时可以使用本地缓存，从而避免重复下载。

```d2
direction: down

shape: sequence_diagram

User: { shape: person }
AIGNE_CLI: "AIGNE CLI"
RemoteServer: "远程服务器"
FileSystem: "本地文件系统"
AIGNE_Engine: "AIGNE 引擎"

User -> AIGNE_CLI: "aigne run https://.../project.tar.gz"
AIGNE_CLI -> AIGNE_CLI: "确定缓存路径 (~/.aigne/...)"
AIGNE_CLI -> RemoteServer: "GET /project.tar.gz"
RemoteServer -> AIGNE_CLI: "返回 tarball 流"
AIGNE_CLI -> FileSystem: "下载软件包并解压到缓存目录"
FileSystem -> AIGNE_CLI: "解压完成"
AIGNE_CLI -> AIGNE_Engine: "从解压文件中初始化 AIGNE"
AIGNE_Engine -> User: "启动 Agent 交互循环"
```

## 实践示例：从 GitHub 仓库运行

你可以直接从 GitHub 仓库的发布存档或特定分支/标签的快照中运行 Agent。GitHub 和其他 Git 平台提供 URL，用于将仓库快照下载为 .tar.gz 文件。

例如，要从一个公共 GitHub 仓库的 `v1.2.0` 标签运行 Agent：

```bash
aigne run https://github.com/AIGNE-io/example-agent/archive/refs/tags/v1.2.0.tar.gz
```

此命令会下载 `example-agent` 仓库的 `v1.2.0` 版本，将其缓存在本地，并启动该项目中定义的默认 Agent。

## 与其他选项结合使用

从 URL 运行时，`run` 命令的所有其他选项也同样适用。你可以指定要运行的特定 Agent，或覆盖模型配置。

```bash
# 从远程包中运行指定的 Agent
aigne run <URL> --entry-agent myAgent

# 使用不同的模型运行远程 Agent
aigne run <URL> --model openai:gpt-4o-mini
```

有关可用标志和选项的完整列表，请参阅 [`aigne run` 命令参考](./command-reference-run.md)。
