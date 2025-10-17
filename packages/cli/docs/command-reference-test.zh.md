---
labels: ["Reference"]
---

# aigne test

`aigne test` 命令为您的 agent 和技能执行自动化测试。它提供了一个内置的单元和集成测试机制，以确保您的 agent 及其依赖的工具在部署前能够正常工作。

## 用法

```bash Basic Syntax icon=lucide:terminal
aigne test [path]
```

## 参数

| 参数      | 描述                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------|
| `[path]`      | 可选。包含您的 agent 及其相应测试文件的目录路径。如果省略，该命令将在当前目录中搜索测试。 |

## 描述

该命令会自动发现并运行您项目中的测试文件。例如，默认的 AIGNE 项目模板包含一个 `sandbox.test.js` 文件，用于验证 `sandbox.js` 技能的功能。`aigne test` 命令将执行这些文件以验证您的 agent 的能力。

## 示例

### 在当前目录中运行测试

要在当前工作目录中执行 AIGNE 项目的测试用例，请运行不带任何参数的命令：

```bash icon=lucide:terminal
aigne test
```

### 在特定目录中运行测试

如果您的 agent 位于不同的目录中，您可以指定该目录的路径：

```bash icon=lucide:terminal
aigne test path/to/agents
```

---

## 后续步骤

在确保您的 agent 通过所有测试后，您可以继续为它们提供服务以进行集成，或将它们部署为服务。

<x-cards>
  <x-card data-title="aigne serve-mcp" data-icon="lucide:server" data-href="/command-reference/serve-mcp">
    了解如何将您的 agent 作为 MCP 服务器为外部集成提供服务。
  </x-card>
  <x-card data-title="aigne deploy" data-icon="lucide:rocket" data-href="/command-reference/deploy">
    了解如何将您的 AIGNE 应用程序部署为 Blocklet。
  </x-card>
</x-cards>
