---
labels: ["Reference"]
---

# aigne test

`aigne test` 命令用于为项目中的 Agent 和技能运行自动化测试。它会发现并执行测试文件，帮助验证代码的功能和正确性。

此命令对于维护代码质量、确保 Agent 在部署前能够按预期运行至关重要。

## 用法

要执行测试，请导航至项目根目录或指定其路径。

```bash
# 为当前目录中的项目运行测试
aigne test

# 为指定路径下的项目运行测试
aigne test [path]
```

## 参数

| 参数 | 描述 |
|----------|-----------------------------------------------------------------------------|
| `path` | 可选。包含待测试 Agent 的目录路径。如果未指定，则默认为当前目录。 |

## 测试工作流

`aigne test` 命令集成到开发生命周期中，以确保代码的可靠性。该过程包括编写代码、创建相应的测试、运行测试命令，然后根据结果进行迭代。

```d2
direction: down

Dev-Cycle: {
  shape: package
  label: "开发周期"
  grid-columns: 1

  Write-Code: {
    shape: rectangle
    label: "1. 编写/更新代码\n（例如，sandbox.js）"
  }

  Write-Tests: {
    shape: rectangle
    label: "2. 编写/更新测试\n（例如，sandbox.test.js）"
  }

  Execute-Command: {
    shape: rectangle
    label: "3. 运行 'aigne test'"
  }

  Test-Runner: {
    shape: package
    label: "AIGNE 测试运行器"
    Test-Discovery: {
      label: "查找 *.test.js 文件"
      shape: rectangle
    }
    Test-Execution: {
      label: "针对代码执行测试"
      shape: rectangle
    }
  }
  
  Output: {
    shape: rectangle
    label: "4. 查看控制台输出"
  }

  Decision: {
    shape: diamond
    label: "测试通过？"
  }

  Success: {
    label: "✅ 通过"
    style: {
      fill: "#d4edda"
    }
  }

  Failure: {
    label: "❌ 失败"
    style: {
      fill: "#f8d7da"
    }
  }

  Write-Code -> Write-Tests: "与开发同步进行"
  Write-Tests -> Execute-Command: "以验证更改"
  Execute-Command -> Test-Runner: "启动"
  Test-Runner.Test-Discovery -> Test-Runner.Test-Execution: "运行找到的测试"
  Test-Runner -> Output: "报告结果"
  Output -> Decision
  Decision -> Success: "是"
  Decision -> Failure: "否"
  Failure -> Write-Code: "调试与重构"
}
```

## 工作原理

测试运行器会自动发现在指定目录中的测试文件。按照惯例，测试文件应以 `.test.js` 为后缀进行命名。例如，默认项目模板包含一个测试文件 `sandbox.test.js`，用于验证 `sandbox.js` 中定义的代码执行工具的功能。

## 示例

### 在当前目录中运行测试

如果你位于 AIGNE 项目的根目录中，可以使用以下单个命令运行所有测试：

```bash
aigne test
```

### 在指定目录中运行测试

如果你的项目位于其他位置，可以提供其目录路径：

```bash
aigne test path/to/my-agents
```

该命令将导航至 `path/to/my-agents` 目录并执行在该目录中找到的测试。

---

使用测试验证你的 Agent 后，可以继续使用 [`aigne run`](./command-reference-run.md) 命令来执行它们，或使用 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 命令将它们部署为服务。