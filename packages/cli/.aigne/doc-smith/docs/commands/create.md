# create - 创建项目

`create` 命令用于快速创建新的 AIGNE 项目，包含预定义的代理配置文件和项目结构。

## 语法

```bash
aigne create [path]
```

## 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `path` | string | 否 | `.` | 创建项目的目录路径 |

## 选项

`create` 命令本身没有特殊选项，但支持全局选项 `--help` 和 `--version`。

## 使用方式

### 基本用法

在当前目录创建项目（会提示输入项目名称）：

```bash
aigne create
```

指定项目路径：

```bash
aigne create my-aigne-project
```

使用绝对路径：

```bash
aigne create /path/to/my-project
```

## 交互流程

运行 `create` 命令后，CLI 会引导您完成以下交互步骤：

### 1. 项目名称

如果未指定路径或路径为 `.`，会提示输入项目名称：

```
? Project name: (my-aigne-project)
```

- 项目名称不能为空
- 默认值为命令行参数中指定的路径名

### 2. 目录覆盖确认

如果目标目录已存在且不为空，会询问是否覆盖：

```
? The directory "my-project" is not empty. Do you want to remove its contents? (y/N)
```

- 选择 `y` 将清空目录并继续
- 选择 `n` 将取消操作

### 3. 选择模板

选择项目模板：

```
? Select a template: (Use arrow keys)
❯ default
```

目前支持的模板：
- **default**: 标准 AIGNE 项目模板

## 项目结构

创建的项目包含以下文件和目录：

```
my-aigne-project/
├── aigne.yaml          # AIGNE 配置文件
├── agents/             # 代理定义目录
│   └── example.yaml    # 示例代理配置
├── .env.example        # 环境变量示例
└── README.md           # 项目说明
```

## 示例

### 示例 1：快速创建项目

```bash
# 创建项目
aigne create my-bot

# 进入项目目录
cd my-bot

# 运行代理
aigne run
```

### 示例 2：创建多个项目

```bash
# 创建不同用途的项目
aigne create customer-support-bot
aigne create data-analysis-agent
aigne create code-review-assistant
```

### 示例 3：在特定位置创建

```bash
# 在用户目录下创建
aigne create ~/projects/my-agent

# 在工作区创建
aigne create /workspace/agents/new-agent
```

## 常见问题

### Q: 如何使用自定义模板？

A: 目前仅支持内置的 `default` 模板。自定义模板功能在未来版本中会支持。

### Q: 创建的项目可以立即运行吗？

A: 可以！创建的项目包含示例代理配置，可以直接运行：

```bash
cd my-project
aigne run
```

### Q: 如何自定义项目结构？

A: 创建项目后，您可以根据需要修改配置文件和添加新的代理定义。参考 AIGNE Framework 文档了解配置选项。

### Q: 创建失败怎么办？

A: 检查以下几点：
1. 确保有目标目录的写入权限
2. 确保磁盘空间充足
3. 检查路径是否正确
4. 使用 `--verbose` 选项查看详细错误信息

## 最佳实践

1. **使用描述性名称**：项目名称应该清楚地表达代理的用途
   ```bash
   aigne create email-assistant
   aigne create customer-support-bot
   ```

2. **组织项目结构**：为不同类型的项目创建专门的目录
   ```bash
   mkdir ~/aigne-projects
   cd ~/aigne-projects
   aigne create project1
   aigne create project2
   ```

3. **立即测试**：创建后立即运行确保环境正常
   ```bash
   aigne create test-agent && cd test-agent && aigne run
   ```

4. **版本控制**：创建后立即初始化 Git 仓库
   ```bash
   aigne create my-agent
   cd my-agent
   git init
   git add .
   git commit -m "Initial commit"
   ```

## 下一步

创建项目后，您可以：

- 查看 [run 命令](/commands/run.md) 了解如何运行代理
- 查看 [test 命令](/commands/test.md) 了解如何测试代理
- 阅读 [配置和环境](/configuration.md) 了解项目配置

---

**相关命令：**
- [run](/commands/run.md) - 运行创建的代理
- [test](/commands/test.md) - 测试代理功能
