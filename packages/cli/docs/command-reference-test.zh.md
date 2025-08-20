# aigne test

`aigne test` 命令用于执行 AIGNE 项目中 Agent 和技能的自动化测试。CLI 会自动发现在指定 Agent 目录中的测试文件（例如 `sandbox.test.js`）并运行它们，从而让你能够验证代码的功能。

这个过程对于在部署前确保 Agent 及其底层技能按预期运行至关重要。

## 用法

```bash
aigne test [path]
```

## 参数

| 参数 | 描述 |
|---|---|
| `path` | 可选。指定 Agent 目录的路径。如果省略，则默认为当前目录。 |

## 示例

### 测试当前目录中的 Agent

如果你位于 AIGNE 项目的根目录中，则无需任何额外参数即可运行测试。

```bash
# 测试当前目录中的 Agent
aigne test
```

### 测试特定目录中的 Agent

如果要为位于其他目录的项目运行测试，请提供该目录的路径。

```bash
# 测试指定路径下的 Agent
aigne test path/to/agents
```

运行该命令后，CLI 会将测试结果输出到你的控制台。