# 开源+闭源 Repo 结构方案

> 日期: 2026-01-15

## 问题

多个产品（AFS, AIGNE, AINE），每个都有开源+闭源部分，如何组织 repo 既结构合理又操作不麻烦？

---

## 方案对比

### 方案 A: 单 Monorepo + 私有子模块

```
arcblock-ai/                    # 私有主 repo
├── afs/
│   ├── core/                   # → 同步到公开 afs repo
│   ├── drivers/                # → 同步到公开 afs repo
│   └── runtime/                # 私有，不同步
├── aigne/
│   ├── framework/              # → 同步到公开 aigne-framework repo
│   ├── runtime/                # 私有
│   └── observability/          # 私有
└── aine/                       # 私有
```

**同步机制**: git subtree push 到公开 repo

**优点**:
- 本地开发一个 workspace
- 依赖管理最简单
- 代码共享方便

**缺点**:
- 需要纪律性地同步
- 公开 repo 的 git history 可能不干净
- CI/CD 需要额外配置

---

### 方案 B: 公开 Repo 为主 + 私有扩展 Repo

```
公开:
├── afs/                        # AFS Core + Drivers
└── aigne-framework/            # AIGNE Framework

私有:
└── arcblock-ai-private/        # 所有闭源内容
    ├── afs-runtime/
    ├── aigne-runtime/
    ├── aigne-observability/
    └── aine/
```

**开发方式**: 私有 repo 依赖公开 repo 的发布包

**优点**:
- 边界清晰
- 公开 repo 独立、干净
- 社区贡献友好

**缺点**:
- 跨 repo 开发需要 link
- 版本同步需要管理
- 本地开发多个 checkout

---

### 方案 C: 私有主 Repo + 公开 Fork (推荐)

```
arcblock-ai/                    # 私有主 repo (开发主战场)
├── packages/
│   ├── afs-core/               # 标记: public
│   ├── afs-drivers/            # 标记: public
│   ├── afs-runtime/            # 标记: private
│   ├── aigne-framework/        # 标记: public
│   ├── aigne-runtime/          # 标记: private
│   ├── aigne-observability/    # 标记: private
│   └── aine/                   # 标记: private
└── scripts/
    └── sync-public.sh          # 自动同步公开包到公开 repo
```

**公开 Repo** (只读镜像):
```
afs/                            # 自动从主 repo 同步
aigne-framework/                # 自动从主 repo 同步
```

**同步脚本**:
```bash
#!/bin/bash
# 只同步标记为 public 的包
git subtree push --prefix=packages/afs-core afs main
git subtree push --prefix=packages/aigne-framework aigne-framework main
```

**优点**:
- 单一开发环境
- 自动化同步，不靠纪律
- 公开 repo 干净（只包含公开代码）
- PR 可以在公开 repo 接收，再合并回主 repo

**缺点**:
- 初始设置稍复杂
- 需要维护同步脚本

---

### 方案 D: pnpm Workspace + 多 Repo

```
~/workspace/
├── afs/                        # git repo 1 (公开)
├── aigne-framework/            # git repo 2 (公开)
└── arcblock-private/           # git repo 3 (私有)
    ├── afs-runtime/
    ├── aigne-runtime/
    └── aine/

# pnpm-workspace.yaml (在 workspace 根)
packages:
  - afs/*
  - aigne-framework/*
  - arcblock-private/*
```

**优点**:
- 真正独立的 repo
- pnpm workspace 处理跨 repo 依赖
- 权限完全隔离

**缺点**:
- 需要维护外层 workspace
- 多个 git 操作

---

## 推荐

**方案 E: 私有主 Repo + 公开 Artifact (最终推荐)**

核心思想：**开源 repo 是构建产物，不是开发主战场**

```
arcblock-ai/                    # 私有主 repo
├── 中文 commit message
├── 中文注释/文档
├── 团队自然语言习惯
└── 真实开发环境

        ↓ build / publish

afs/, aigne-framework/          # 公开 repo (artifact)
├── 英文 commit message (生成)
├── 英文文档 (翻译/生成)
├── 干净的 git history
└── 只读，不直接开发
```

**优点**:
1. **团队友好** - 内部用中文，符合语言习惯
2. **单一开发环境** - 不用切换 repo
3. **自动化边界** - 脚本保证不泄露
4. **开源质量可控** - 发布前可审查、清理、翻译
5. **依赖管理简单** - 一个 pnpm workspace

**发布流程**:
```bash
# 1. 提取公开代码
# 2. 清理敏感内容
# 3. 翻译/转换中文 → 英文
# 4. 生成干净的 commit history
# 5. 推送到公开 repo
```

---

## 实施建议

### 目录结构
```
arcblock-ai/                    # 私有主 repo
├── afs/
│   ├── core/                   # public (世界的一部分)
│   ├── drivers/                # public (世界的一部分)
│   ├── daemon/                 # public (reference afsd)
│   ├── cli/                    # public (reference UI)
│   └── runtime/                # private (production 托管)
├── aigne/
│   ├── framework/              # public
│   ├── runtime/                # private (production)
│   └── observability/          # private
├── aine/                       # private
├── providers/                  # private (高级 providers)
│   ├── browser/
│   ├── enterprise-storage/
│   └── secure-execution/
├── pnpm-workspace.yaml
└── scripts/
    └── publish-opensource.sh   # 发布到公开 repo
```

### 开源判断标准

> **"这是世界的一部分，还是世界之上的服务？"**
> - 世界的一部分 → 必须开源
> - 世界之上的服务 → 你决定

### 发布脚本 (publish-opensource.sh)
```bash
#!/bin/bash
# 1. 提取 public 标记的包
# 2. 复制到临时目录
# 3. 运行清理脚本（移除敏感内容）
# 4. 运行翻译脚本（中文 → 英文，可用 AI）
# 5. 生成 squashed commit 或干净 history
# 6. 推送到对应公开 repo
```

### 发布策略
- **频率**: 版本发布时（如 v1.x.0）
- **方式**: CI action 或手动脚本
- **审查**: 发布前人工审查 diff
- **History**: 可选 squash 或保留精简 history

### 社区 PR 处理
1. 社区在公开 repo 提 PR
2. Maintainer 审查
3. 手动 cherry-pick 到私有主 repo
4. 下次发布时自动同步回公开 repo

### 中英文处理
- **代码注释**: 可保持英文（通用习惯）
- **Commit message**: 内部中文 → 发布时翻译/重写
- **文档**: 内部中文 → 发布时翻译
- **工具**: 可用 AI 辅助翻译
