---
labels: ["Reference"]
---

# aigne test

`aigne test` 命令为你的 Agent 和技能执行自动化测试。它提供了一个用于单元测试和集成测试的内置机制，以确保你的 Agent 及其依赖的工具在部署前能够正常工作。

## 用法

```bash Basic Syntax icon=lucide:terminal
aigne test [path]
```

## 参数

| Argument      | Description                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------|
| `[path]`      | 可选。包含你的 Agent 及其相应测试文件的目录路径。如果省略，该命令将在当前目录中搜索测试。 |

## 描述

该命令会自动发现并运行你项目中的测试文件。例如，默认的 AIGNE 项目模板包含一个 `sandbox.test.js` 文件，用于验证 `sandbox.js` 技能的功能。`aigne test` 命令将执行这些文件以验证你的 Agent 的能力。

## 示例

### 在当前目录中运行测试

要为位于当前工作目录中的 AIGNE 项目执行测试用例，请不带任何参数运行该命令：

```bash icon=lucide:terminal
aigne test
```

### 在指定目录中运行测试

如果你的 Agent 位于不同的目录中，你可以指定该目录的路径：

```bash icon=lucide:terminal
aigne test path/to/agents
```

---

## 后续步骤

在确保你的 Agent 通过所有测试后，你可以继续为集成提供服务，或将它们部署为服务。

<x-cards>
  <x-card data-title="aigne serve-mcp" data-icon="lucide:server" data-href="/command-reference/serve-mcp">
    了解如何将你的 Agent 作为 MCP 服务器为外部集成提供服务。
  </x-card>
  <x-card data-title="aigne deploy" data-icon="lucide:rocket" data-href="/command-reference/deploy">
    了解如何将你的 AIGNE 应用程序部署为 Blocklet。
  </x-card>
</x-cards>