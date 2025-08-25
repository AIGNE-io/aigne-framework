# aigne test

`aigne test` 命令为项目中的 Agent 和技能运行自动化测试。它会发现并执行测试文件，帮助你验证代码的功能和正确性。

此命令对于维护代码质量、确保 Agent 在部署前按预期运行至关重要。

## 用法

```bash
# 运行当前目录中项目的测试
aigne test

# 运行特定路径下项目的测试
aigne test [path]
```

## 参数

| 参数 | 描述                                                                 |
|----------|-----------------------------------------------------------------------------|
| `path`   | 可选。包含待测试 Agent 的目录路径。如果未指定，则默认为当前目录。 |

## 工作原理

测试运行器会自动发现指定目录中的测试文件。按照惯例，测试文件应以 `.test.js` 为后缀命名。例如，`sandbox.js` 的测试文件应命名为 `sandbox.test.js` 并放置在同一目录中。

## 示例

### 在当前目录中运行测试

如果你位于 AIGNE 项目的根目录，可以使用单个命令运行所有测试：

```bash
aigne test
```

### 在特定目录中运行测试

如果你的项目位于其他位置，可以提供其目录的路径：

```bash
aigne test path/to/my-agents
```

此命令将导航至 `path/to/my-agents` 目录并执行在该目录中找到的测试。

---

使用测试验证 Agent 后，你可以继续使用 [`aigne run`](./command-reference-run.md) 命令执行它们，或使用 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 将其部署为服务。