---
labels: ["Reference"]
---

# aigne test

`aigne test` 命令用于为项目中的 agents 和技能运行自动化测试。它会自动发现并执行测试文件，帮助你验证代码的功能和正确性。

该命令对于维护代码质量、确保 agents 在部署前能够按预期运行至关重要。

## 用法

要执行测试，请导航至你的项目根目录或指定其路径。

```bash
# 在当前目录中为项目运行测试
aigne test

# 为特定路径下的项目运行测试
aigne test [path]
```

## 参数

| Argument | Description |
|----------|-----------------------------------------------------------------------------|
| `path` | 可选。包含待测试 agents 的目录路径。如果未指定，则默认为当前目录。 |

## 工作原理

测试运行器会自动发现在指定目录中的测试文件。按照约定，测试文件应以 `.test.js` 为后缀命名。例如，默认项目模板包含一个 `sandbox.test.js` 测试文件，用于验证 `sandbox.js` 中定义的代码执行工具的功能。

## 示例

### 在当前目录运行测试

如果你位于 AIGNE 项目的根目录中，可以使用单个命令运行所有测试：

```bash
aigne test
```

### 在特定目录运行测试

如果你的项目位于其他位置，可以提供其目录的路径：

```bash
aigne test path/to/my-agents
```

该命令将导航至 `path/to/my-agents` 目录，并执行在该目录中找到的测试。

---

使用测试验证 agents 后，你可以继续使用 [`aigne run`](./command-reference-run.md) 命令执行它们，或使用 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 将它们部署为服务。