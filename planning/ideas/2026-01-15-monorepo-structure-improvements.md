# Monorepo 结构改进建议

> 分析日期: 2026-01-15

## 现状概览

- pnpm workspaces，9 个目录模式
- 40+ 个包，版本独立管理
- 无构建缓存工具

---

## 高优先级

### 1. TypeScript 配置重复严重

**问题**：
- 32 个包各自维护 3 套构建配置（cjs/esm/dts）
- CLI 包与其他包构建模式不一致
- 每个包重复定义路径别名

**建议**：
- 提取共享配置到 `scripts/tsconfig.shared.json`
- 统一 CLI 构建输出格式
- 根级 tsconfig 统一定义路径别名

### 2. 依赖声明混淆

**问题**：
```json
"@aigne/json-schema-to-zod": "^1.3.3"  // 外部 npm
"@aigne/afs": "workspace:^"             // 内部 workspace
```
@aigne 前缀既有内部包也有外部包

**建议**：
- 文档化哪些是内部包、哪些是外部包装
- 或使用不同命名空间区分

### 3. 缺少构建缓存

**问题**：
- 没有 Turborepo/Nx
- 每次全量重建

**建议**：
```bash
pnpm add -Dw turbo
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "outputs": ["lib/**", "dist/**"],
      "cache": true,
      "dependsOn": ["^build"]
    },
    "test": {
      "outputs": ["test/coverage/**"],
      "cache": false
    }
  }
}
```

---

## 中优先级

### 4. Examples 仍在 workspace

**问题**：
- 28+ 示例都发布到 npm（@aigne/example-*）
- 增加发版负担

**建议**：
- 移出 workspace，独立依赖已发布的 @aigne/* 版本
- 或配置 `"private": true`

### 5. 包命名不统一

**现状**：
```
@aigne/default-memory
@aigne/agentic-memory
@aigne/afs
@aigne/afs-local-fs
```

**建议统一分组前缀**：
```
@aigne/afs-*      # 文件系统模块
@aigne/memory-*   # 存储后端
@aigne/model-*    # LLM 提供商
```

### 6. 版本号跨度大

**现状**：
| 包 | 版本 |
|---|---|
| @aigne/core | 1.72.0-beta.23 |
| @aigne/cli | 1.59.0-beta.29 |
| @aigne/afs | 1.4.0-beta.9 |
| @aigne/anthropic | 0.14.16-beta.25 |

**建议**：
- 统一版本策略（所有包同版本）
- 或文档化独立版本的原因

---

## 低优先级

### 7. 重组 Workspace 目录结构

**现状**：9 个顶层目录

**建议重组为**：
```
core/           # @aigne/core, @aigne/afs-*
models/         # 所有 LLM 提供商
storage/        # memory/*
tools/          # cli, secrets, transport
integrations/   # observability, blocklets
examples/       # 示例
```

### 8. 迁移构建工具

考虑用 tsup/esbuild 替代 tsc 三分割，简化配置。

---

## 验证命令

```bash
# 检查导出兼容性
npx arethetypeswrong@latest packages/core

# 检查未使用依赖
pnpm exec depcheck packages/core

# 检查循环依赖
pnpm list --depth=0
```

---

## 行动建议

1. **立即可做**：添加 Turborepo（改动小、收益大）
2. **短期**：统一 tsconfig、规范导出模式
3. **中期**：Examples 独立化、包命名统一
4. **长期**：目录重组、统一版本策略
