# 命令参考

`@aigne/cli` 提供了一套完整的命令来管理 AIGNE 项目的整个生命周期。本节概览所有可用命令。

## 命令列表

### 核心命令

| 命令 | 描述 | 文档 |
|------|------|------|
| `create` | 创建新的 AIGNE 项目 | [详情](/commands/create.md) |
| `run` | 运行 AIGNE 代理 | [详情](/commands/run.md) |
| `test` | 运行项目测试 | [详情](/commands/test.md) |

### 服务命令

| 命令 | 描述 | 文档 |
|------|------|------|
| `serve-mcp` | 将代理作为 MCP 服务器运行 | [详情](/commands/serve-mcp.md) |
| `observe` | 启动可观察性服务器 | [详情](/commands/observe.md) |

### 部署和管理

| 命令 | 描述 | 文档 |
|------|------|------|
| `deploy` | 部署 AIGNE 应用 | [详情](/commands/deploy.md) |
| `hub` | 管理 AIGNE Hub 资源 | [详情](/commands/hub.md) |
| `eval` | 评估代理性能 | [详情](/commands/eval.md) |

## 全局选项

所有命令都支持以下全局选项：

| 选项 | 描述 |
|------|------|
| `--help`, `-h` | 显示帮助信息 |
| `--version`, `-v` | 显示版本号 |

## 快速示例

```bash
# 创建新项目
aigne create my-project

# 运行代理
aigne run

# 指定代理运行
aigne run myAgent

# 运行测试
aigne test

# 启动 MCP 服务器
aigne serve-mcp --port 3000

# 启动可观察性服务
aigne observe

# 部署应用
aigne deploy
```

## 命令使用技巧

### 1. 链式使用

可以结合多个命令完成工作流：

```bash
# 创建、测试、运行
aigne create my-agent && cd my-agent && aigne test && aigne run
```

### 2. 环境变量

使用环境变量配置命令行为：

```bash
# 设置日志级别
LOG_LEVEL=debug aigne run

# 使用特定的 API 密钥
OPENAI_API_KEY=sk-xxx aigne run
```

### 3. 配置文件

项目中的 `.env` 文件会自动加载：

```bash
# 在项目目录创建 .env 文件
echo "OPENAI_API_KEY=sk-xxx" > .env
aigne run
```

## 命令分类

### 开发阶段

- `create` - 创建新项目
- `run` - 本地运行和测试
- `test` - 运行自动化测试

### 集成阶段

- `serve-mcp` - 作为 MCP 服务运行
- `observe` - 监控和调试

### 部署阶段

- `deploy` - 部署到生产环境
- `hub` - 管理远程资源
- `eval` - 性能评估

## 下一步

选择您需要的命令查看详细文档：

- **开始项目**：查看 [create 命令](/commands/create.md)
- **运行代理**：查看 [run 命令](/commands/run.md)
- **服务集成**：查看 [serve-mcp 命令](/commands/serve-mcp.md)
- **监控调试**：查看 [observe 命令](/commands/observe.md)

---

**相关文档：**
- [快速开始](/getting-started.md) - 基本使用流程
- [使用场景](/use-cases.md) - 实际应用示例
- [配置和环境](/configuration.md) - 环境配置
