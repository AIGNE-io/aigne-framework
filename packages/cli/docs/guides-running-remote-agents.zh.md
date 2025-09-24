---
labels: ["Reference"]
---

---
labels: ["Reference"]
---

# 运行远程 Agent

AIGNE CLI 不仅限于运行本地文件系统中的项目。它还提供了一个强大的功能，可以直接从远程 URL 执行 Agent。这对于测试、共享和运行 Agent 非常有用，无需克隆代码仓库或手动下载文件。

本指南将引导您了解如何从远程源运行 Agent，并解释其底层的缓存机制。

## 工作原理

当您向 `aigne run` 命令提供一个 URL 时，CLI 会自动执行以下步骤：

1.  **下载**：它从提供的 HTTP/HTTPS URL 获取软件包。
2.  **缓存**：下载的软件包存储在本地缓存目录中（默认为 `~/.aigne/`）。这会加速同一远程 Agent 的后续运行，因为如果缓存版本已存在，CLI 将使用该版本。
3.  **解压**：CLI 将软件包（应为 tarball 格式）的内容解压到缓存中的工作目录。
4.  **执行**：最后，它从解压的文件中加载 AIGNE 应用程序，并像运行本地项目一样运行指定的 Agent。

整个过程经过简化，以提供无缝的体验，使远程 Agent 感觉就像本地 Agent 一样易于访问。

```d2
direction: down

developer: {
  shape: c4-person
  label: "开发者"
}

cli: {
  label: "AIGNE CLI"
}

remote-server: {
  label: "远程服务器\n（例如，GitHub）"
  shape: cylinder
}

local-cache: {
  label: "本地缓存\n(~/.aigne/)"
  shape: cylinder
}

agent-runtime: {
  label: "Agent 运行时"
}

developer -> cli: "1. aigne run <URL>"
cli -> remote-server: "2. 下载软件包"
remote-server -> cli: "3. 返回 tarball"
cli -> local-cache: "4. 解压并缓存"
cli -> agent-runtime: "5. 从缓存执行 Agent"
agent-runtime -> developer: "6. 输出"
```

## 用法

要运行远程 Agent，只需将指向 AIGNE 项目的 tarball（`.tar.gz`、`.tgz`）的 URL 传递给 `aigne run` 命令即可。

### 基本命令

```bash AIGNE CLI icon=lucide:terminal
# 从远程 AIGNE 项目运行默认 Agent
aigne run https://example.com/path/to/your/aigne-project.tar.gz
```

### 运行特定的 Agent

如果远程项目包含多个 Agent，您可以在 URL 后面添加其名称来指定要运行哪一个。

```bash AIGNE CLI icon=lucide:terminal
# 从远程项目运行名为 'my-agent' 的特定 Agent
aigne run https://example.com/path/to/your/aigne-project.tar.gz my-agent
```

您提供的任何其他参数或选项都将直接传递给远程 Agent。

```bash AIGNE CLI icon=lucide:terminal
# 运行带有附加选项的特定 Agent
aigne run https://example.com/path/to/your/aigne-project.tar.gz my-agent --input "Hello, world!"
```

## 缓存

AIGNE CLI 会自动缓存下载的远程 Agent，以避免每次运行时都重新下载。

*   **默认位置**：缓存存储在您主目录下的 `.aigne` 目录中（例如 `~/.aigne/`）。缓存中的确切路径由 URL 的主机名和路径决定，以确保不同的远程 Agent 分开存储。

*   **覆盖缓存目录**：虽然默认位置适用于大多数情况，但您可以使用 `--cache-dir` 选项指定自定义缓存目录。这对于 CI/CD 环境或管理不同组的缓存 Agent 非常有用。

```bash AIGNE CLI icon=lucide:terminal
# 使用自定义目录缓存下载的软件包
aigne run https://example.com/path/to/your/aigne-project.tar.gz --cache-dir /tmp/aigne-cache
```

这个强大的功能简化了 AIGNE Agent 的协作和分发。您现在可以继续学习如何部署您的 Agent 以供生产使用。

<x-card data-title="部署 Agent" data-icon="lucide:rocket" data-href="/guides/deploying-agents" data-cta="阅读指南">
  了解如何将您的 AIGNE 项目部署为 Blocklet 以供生产使用。
</x-card>