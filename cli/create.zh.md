# 创建项目

[English](create.md) | **中文**

使用 AIGNE CLI 创建新的 AIGNE 项目。

## `aigne create` 命令

创建一个新的 AIGNE 项目，包含所需的配置文件。该命令会以交互方式提示输入项目名称。

```bash
aigne create [路径]
```

### 参数

* `路径`：可选的项目目录路径（将在提示中用作默认项目名称）

### 示例

#### 通过交互式提示创建项目

```bash
aigne create
# 将提示您输入项目名称
```

#### 使用建议的名称创建项目

```bash
aigne create my-new-agent
# 将以"my-new-agent"作为默认项目名称提示
```

### 项目结构

创建的项目将包含以下基本结构和配置文件，帮助您快速开始开发 AIGNE 代理。
