# test

`aigne test` 命令是确保你的 AI agent 按预期工作的关键工具。它会自动对你的 agent 的技能和配置进行检查，帮助你及早发现潜在问题并保持高质量的体验。

在部署你的 agent 或与他人分享之前运行测试，是确认所有设置都正确且功能符合预期的好方法。

## 用法

要运行测试，你可以在项目目录中执行该命令，或指定一个路径。

```bash 基本语法
aigne test [path]
```

### 参数

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="false" data-desc="可选。你的 agent 项目目录的路径。如果你不提供路径，该命令将在当前目录中运行测试。"></x-field>
</x-field-group>

## 示例

### 测试当前目录中的 Agent

如果你的终端当前位置在 agent 的项目文件夹内，你可以直接运行该命令，无需任何额外参数。

```bash 从项目文件夹运行测试 icon=mdi:folder-open
aigne test
```

### 测试特定目录中的 Agent

如果你想测试位于不同文件夹中的 agent，只需提供该文件夹的路径即可。

```bash 使用特定路径运行测试 icon=mdi:folder-search
aigne test path/to/your-agent
```

当你运行该命令时，AIGNE 会在你的项目中查找测试文件并执行它们。结果将显示在你的终端中，显示哪些测试通过，哪些失败，为改进你的 agent 提供有价值的反馈。