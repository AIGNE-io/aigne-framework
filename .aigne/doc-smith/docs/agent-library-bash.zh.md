# Bash

Bash Agent 提供了一种安全可控的方法，用于在 Agent 工作流中执行 Shell 脚本和命令行工具。本文档详细介绍了其功能、配置以及系统级操作的最佳实践。通过本指南，您将学习如何集成和利用 Bash Agent 来完成文件操作、进程管理和自动化等任务。

## 概述

Bash Agent 旨在受控环境中运行 Bash 脚本，并利用 [Anthropic 的沙盒运行时](https://github.com/anthropic-experimental/sandbox-runtime) 来增强安全性。它会捕获并流式传输标准输出（`stdout`）、标准错误（`stderr`）以及最终的退出码，从而提供关于脚本执行的全面反馈。

下图展示了 Bash Agent 如何在安全沙盒内执行脚本，控制文件系统和网络访问，同时将输出流式传输回用户。

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Bash](assets/diagram/agent-library-bash-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

主要功能包括：
- **沙盒化执行**：脚本在具有可配置安全策略的隔离环境中执行。
- **网络控制**：通过白名单或黑名单管理网络访问。
- **文件系统控制**：为文件和目录定义特定的读写权限。
- **实时输出**：在脚本运行时流式传输 `stdout` 和 `stderr`。
- **退出码跟踪**：捕获脚本的退出码以验证成功或处理错误。

## 输入

该 Agent 在其输入对象中接受一个必需参数。

<x-field-group>
  <x-field data-name="script" data-type="string" data-required="true" data-desc="要执行的 Bash 脚本。"></x-field>
</x-field-group>

## 输出

该 Agent 返回一个包含脚本执行结果的对象。

<x-field-group>
  <x-field data-name="stdout" data-type="string" data-required="false" data-desc="脚本产生的标准输出流。"></x-field>
  <x-field data-name="stderr" data-type="string" data-required="false" data-desc="脚本产生的标准错误流。"></x-field>
  <x-field data-name="exitCode" data-type="number" data-required="false" data-desc="脚本完成后返回的退出码。值 0 通常表示成功。"></x-field>
</x-field-group>

## 基本用法

使用 Bash Agent 最直接的方式是通过 YAML 配置文件。这允许以声明式方法定义 Agent 的行为和安全约束。

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
# 沙盒默认启用，并采用严格设置。
# 详细选项请参阅“沙盒配置”部分。
```

要执行此 Agent，您可以使用 AIGNE CLI，并将脚本作为参数传递。

```bash icon=lucide:terminal
aigne run . Bash --script 'echo "Hello from the Bash Agent!"'
```

## 配置

Bash Agent 可以通过多个选项进行配置，以定制其行为，特别是关于执行环境的配置。

### Agent 选项

这些选项在 Agent 的 YAML 定义的顶层指定。

<x-field-group>
  <x-field data-name="sandbox" data-type="object | boolean" data-required="false" data-default="true">
    <x-field-desc markdown>控制沙盒化执行环境。设置为 `false` 可完全禁用沙盒，或提供一个配置对象以自定义其限制。默认情况下，沙盒是启用的。</x-field-desc>
  </x-field>
</x-field-group>

### 禁用沙盒

对于受信任的环境或不支持沙盒的平台（如 Windows），您可以禁用它。

:::warning
禁用沙盒会移除 Agent 提供的所有安全保护。这只应在完全受信任且已知所执行脚本是安全的环境中进行。
:::

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox: false # 禁用沙盒
```

## 沙盒配置

当 `sandbox` 选项启用时，您可以提供一个配置对象来为网络和文件系统访问定义精细的安全策略。

### 网络配置

通过指定允许和拒绝的域来控制 Agent 的网络访问。

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox:
  network:
    # 允许脚本访问的域列表。支持通配符 (*)。
    allowedDomains:
      - "*.example.com"
      - "api.github.com"
    # 禁止脚本访问的域列表。此列表的优先级高于 allowedDomains。
    deniedDomains:
      - "*.ads.com"
```

### 文件系统配置

定义脚本可以读取和写入文件系统的哪些部分。

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox:
  filesystem:
    # 允许脚本写入的文件路径或模式列表。
    allowWrite:
      - "./output"
      - "/tmp"
    # 禁止脚本读取的文件路径或模式列表。
    denyRead:
      - "~/.ssh"
      - "*.key"
    # 禁止脚本写入的文件路径或模式列表。
    denyWrite:
      - "/etc"
      - "/usr"
```

### 完整示例

这是一个综合示例，展示了用于运行开发工具的完整沙盒配置。

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox:
  network:
    allowedDomains:
      - "*.npmjs.org"
      - "registry.npmjs.org"
      - "github.com"
      - "api.github.com"
    deniedDomains:
      - "*.ads.com"
  filesystem:
    allowWrite:
      - "./output"
      - "./logs"
      - "/tmp"
    denyRead:
      - "~/.ssh"
      - "~/.aws"
      - "*.pem"
      - "*.key"
    denyWrite:
      - "/etc"
      - "/usr"
      - "/bin"
      - "/sbin"
```

## 平台支持

Bash Agent 的功能因操作系统而异，主要区别在于沙盒的可用性。

| 平台 | 沙盒支持 | 直接执行 |
| :--- | :--- | :--- |
| **Linux** | ✅ 完全支持 | ✅ 支持 |
| **macOS** | ✅ 完全支持 | ✅ 支持 |
| **Windows** | ❌ 不支持 | ✅ 支持 |

:::info
在 Windows 上不支持沙盒模式。您必须在配置中设置 `sandbox: false` 才能使用 Bash Agent。在 Windows 上直接执行可能需要安装 Windows Subsystem for Linux (WSL) 或 Git Bash 等环境。
:::

## 最佳实践

为确保安全有效地使用 Bash Agent，请遵循以下实践。

- **应用最小权限原则**：仅授予脚本运行所需的最低权限。避免过于宽松的规则，如允许写入 `/` 或允许网络访问 `*`。
- **处理退出码**：始终检查 Agent 输出中的 `exitCode`。非零值表示发生错误，应检查 `stderr` 流以获取详细信息。
- **保护敏感文件**：明确拒绝读取包含敏感信息的目录和文件，例如 `~/.ssh`、`.env` 文件或私钥。
- **使用具体的通配符**：在为网络或文件系统规则使用通配符时，使其尽可能具体（例如，使用 `api.example.com` 而非 `*.com`）。
- **记录和审计**：对于安全关键型应用，记录所有脚本的执行情况，包括输入脚本和结果输出，以维护审计追踪。