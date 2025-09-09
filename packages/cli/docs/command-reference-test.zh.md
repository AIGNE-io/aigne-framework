---
labels: ["Reference"]
---

# aigne test

`aigne test` 命令为您的 agents 和技能执行自动化测试，为单元和集成测试提供了内置机制。这可以确保您的 agents 及其依赖的工具在部署前能够正常运行。

## Usage

```bash Basic Syntax
aigne test [path]
```

## Arguments

| Argument      | Description                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------|
| `[path]`      | 可选。包含您的 agents 及其相应测试文件的目录路径。如果省略，该命令将在当前目录中搜索测试文件。 |

## Description

该命令会自动发现并运行您项目中的测试文件。例如，默认的 AIGNE 项目模板包含一个 `sandbox.test.js` 文件，旨在验证 `sandbox.js` 技能的功能。`aigne test` 将执行此类文件以验证您的 agent 的能力。

## Examples

### Run tests in the current directory

要为位于当前工作目录的 AIGNE 项目执行测试用例，请不带任何参数运行该命令：

```bash icon=lucide:terminal
aigne test
```

### Run tests in a specific directory

如果您的 agents 位于不同目录，您可以指定该目录的路径：

```bash icon=lucide:terminal
aigne test path/to/agents
```

---

## Next Steps

在确保您的 agents 通过所有测试后，您可以继续部署它们或将其集成到更大的系统中。

<x-cards>
  <x-card data-title="aigne serve-mcp" data-icon="lucide:server" data-href="/command-reference/serve-mcp">
    了解如何将您的 agents 作为 MCP 服务器以用于外部集成。
  </x-card>
  <x-card data-title="aigne deploy" data-icon="lucide:rocket" data-href="/command-reference/deploy">
    了解如何将您的 AIGNE 应用程序部署为 Blocklet。
  </x-card>
</x-cards>