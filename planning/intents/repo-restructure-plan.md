# Repo 重构执行计划

> 状态: 待执行
> 日期: 2026-01-15

## 背景

- 当前巨大 monorepo 不适合 AI native 开发
- AI 重构速度极快，单 repo 容易冲突
- 多人小团队模式，每人负责一个 repo
- 需要隔离的 chamber，减少相互干扰

---

## GitHub Org 策略

> 决策日期: 2026-01-16
> 状态: 已决定

### 核心原则

```
开发集中，发布分散
```

### Org 分工

| Org | 用途 | 可见性 | 付费 |
|-----|------|--------|------|
| **arcblock** | 主开发 org | private 为主 | ✅ 付费账户 |
| **aigne** | 开源发布 | public only | ❌ 免费 |
| **blocklet** | 开源发布 | public only | ❌ 免费 |

### 选择理由

1. **成本控制** — 只需为 arcblock org 购买付费账户
2. **权限集中** — 只在一个 org 管理团队权限
3. **品牌清晰** — 外部用户只看到干净的开源 org
4. **安全边界** — 不可能意外推闭源代码到开源 org

### 同步方向

```
arcblock/arcblock-ai (私有开发)
        │
        │ 版本发布时单向同步
        ▼
aigne/aigne-framework (公开 artifact)
aigne/afs (公开 artifact)
blocklet/* (公开 artifact)
```

**关键约束**:
- 单向同步，不反向
- 外部 PR 在公开 org 接收，review 后 cherry-pick 回私有 repo
- 公开 repo 是只读镜像，不直接开发

---

## 目标结构

```
arcblock org (私有，付费):
└── arcblock-ai/            # 主开发 monorepo
    ├── afs/                # AFS 全部
    │   ├── core/
    │   ├── drivers/
    │   ├── daemon/
    │   ├── cli/
    │   └── runtime/        # 私有，不同步
    ├── aigne/              # AIGNE 全部
    │   ├── framework/
    │   ├── runtime/        # 私有，不同步
    │   └── observability/  # 私有，不同步
    └── aine/               # AINE (或独立 repo)

aigne org (公开，免费):
├── aigne-framework/        # AIGNE Framework 公开部分
└── afs/                    # AFS 公开部分

blocklet org (公开，免费):
└── ...                     # Blocklet 相关
```

---

## 执行步骤

### Phase 1: 准备 (Day 1)

**1.1 Repo 迁移策略**

```bash
# Step 1: 创建私有主开发 repo (arcblock org)
gh repo create arcblock/arcblock-ai --private

# Step 2: 创建公开发布 repos (aigne org, 免费)
gh repo create aigne/aigne-framework --public
gh repo create aigne/afs --public

# Step 3: Rename 旧 repo (保留历史)
gh repo rename aigne/aigne-framework aigne-framework-legacy
# 注: 先 rename，再用 Step 2 占原名

# Step 4: Legacy repo README 指向新 repo
# Step 5: 迁移完成后 archive legacy
gh repo archive aigne/aigne-framework-legacy
```

**注意**: 只有 arcblock org 需要付费账户，aigne/blocklet org 只有 public repo，免费。

**1.2 npm scope 准备**
```bash
# 注册新 scope (如果用独立 scope)
npm login --scope=@afs

# 或保持 @aigne scope:
# @aigne/afs-core, @aigne/afs-daemon, @aigne/afs-cli
```

**1.2 确定边界**

> 判断标准："这是世界的一部分，还是世界之上的服务？"

| 当前位置 | 目标 Repo | 公开/私有 | 理由 |
|---------|----------|----------|------|
| afs/core | afs/ | ✅ 公开 | 世界接口 |
| afs/drivers | afs/ | ✅ 公开 | 世界接口 |
| afs/daemon (新) | afs/ | ✅ 公开 | reference world host |
| afs/cli (新) | afs/ | ✅ 公开 | reference UI |
| afs/runtime | afs/ | ❌ 私有 | 托管服务 |
| packages/core | aigne/framework/ | 公开 |
| packages/cli | aigne/framework/ | 公开 |
| packages/agent-library | aigne/framework/ | 公开 |
| packages/transport | aigne/framework/ | 公开 |
| models/* | aigne/framework/ | 公开 |
| observability/* | aigne/observability/ | 私有 |
| examples/* | aigne/framework/ | 公开 |
| memory/* | aigne/framework/ | 公开 |
| blocklets/* | aigne/runtime/ | 私有 |

### Phase 2: AFS 拆分 (Day 2-3)

**2.1 消除 AFS 对 @aigne/core 的依赖**
```bash
# 检查依赖
grep -r "@aigne/core" afs/

# 重构这些模块，移除依赖
# - afs/local-fs
# - afs/json
# - afs/git
# - afs/user-profile-memory (可能需要接口注入)
```

**2.2 迁移到新 repo**
```bash
# 方法: 使用 git filter-repo 保留 history
cd /tmp
git clone aigne-framework afs-new
cd afs-new
git filter-repo --subdirectory-filter afs/

# 或者简单方式: 新建 repo，复制代码
mkdir afs && cd afs
cp -r ../aigne-framework/afs/* .
git init && git add . && git commit -m "Initial: AFS from aigne-framework"
```

**2.3 配置 AFS repo**
```bash
# pnpm workspace
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - core
  - drivers/*
  - runtime/*
EOF

# 安装依赖
pnpm install
pnpm build
pnpm test
```

### Phase 3: AIGNE 拆分 (Day 4-5)

**3.1 保留 AIGNE 相关代码**
```bash
# 从 aigne-framework 移除已拆分的 AFS
rm -rf afs/

# 调整依赖，改为依赖发布的 @afs/* 包
# packages/core/package.json
{
  "dependencies": {
    "@afs/core": "^x.x.x",
    "@afs/history": "^x.x.x"
  }
}
```

**3.2 重组目录结构**
```
aigne/
├── framework/              # 公开部分
│   ├── packages/
│   │   ├── core/
│   │   ├── cli/
│   │   ├── agent-library/
│   │   └── transport/
│   ├── models/
│   ├── memory/
│   └── examples/
├── runtime/                # 私有部分
│   └── blocklets/
└── observability/          # 私有部分
    ├── api/
    ├── ui/
    └── blocklet/
```

**3.3 配置新结构**
```bash
# pnpm workspace
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - framework/packages/*
  - framework/models/*
  - framework/memory/*
  - runtime/*
  - observability/*
EOF
```

### Phase 4: 发布流程 (Day 6)

**4.1 创建发布脚本**
```bash
# scripts/publish-oss.sh
#!/bin/bash
set -e

# AFS
echo "Publishing AFS to afs-oss..."
./scripts/extract-public.sh afs afs-oss
./scripts/translate-to-english.sh afs-oss
cd /tmp/afs-oss && git push origin main

# AIGNE
echo "Publishing AIGNE to aigne-framework-oss..."
./scripts/extract-public.sh aigne/framework aigne-framework-oss
./scripts/translate-to-english.sh aigne-framework-oss
cd /tmp/aigne-framework-oss && git push origin main
```

**4.2 配置 CI/CD**
- AFS repo: 独立 CI，发布 @afs/* 到 npm
- AIGNE repo: 独立 CI，发布 @aigne/* 到 npm
- 公开 repos: 只接收同步，CI 验证

### Phase 5: 团队切换 (Day 7)

**5.1 分配负责人**
| Repo | 负责人 | 职责 |
|------|--------|------|
| afs | TBD | AFS 核心 + 所有 drivers |
| aigne | TBD | Framework + Runtime + Observability |
| aine | TBD | (已独立) |

**5.2 归档旧 repo**
```bash
# 归档 legacy repo (在 aigne org)
gh repo archive aigne/aigne-framework-legacy
```

---

## 依赖发布顺序

```
1. @afs/core
2. @afs/drivers/* (依赖 @afs/core)
   ↓
3. @aigne/core (依赖 @afs/*)
4. @aigne/* (依赖 @aigne/core)
```

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| 依赖断裂 | 先发布 AFS，再迁移 AIGNE |
| CI 中断 | 保留旧 repo 一段时间 |
| npm 包名冲突 | 使用新 scope @afs/* 或保留 @aigne/afs-* |
| 团队不适应 | 提供清晰文档，渐进式迁移 |

---

## 时间线

| Day | 任务 |
|-----|------|
| 1 | 创建 repos，确定边界 |
| 2-3 | AFS 拆分，消除依赖，迁移 |
| 4-5 | AIGNE 重组，调整依赖 |
| 6 | 发布脚本，CI/CD 配置 |
| 7 | 团队切换，归档旧 repo |

---

## 检查清单

### AFS Repo
- [ ] 创建私有 repo `afs`
- [ ] 创建公开 repo `afs-oss`
- [ ] 消除对 @aigne/core 依赖
- [ ] 迁移代码
- [ ] pnpm workspace 配置
- [ ] CI/CD 配置
- [ ] 发布 @afs/* 到 npm
- [ ] 发布脚本到 afs-oss

### AIGNE Repo
- [ ] 创建私有 repo `aigne`
- [ ] 创建公开 repo `aigne-framework-oss`
- [ ] 移除 afs/ 目录
- [ ] 改为依赖 @afs/* 包
- [ ] 重组目录结构 (framework/runtime/observability)
- [ ] pnpm workspace 配置
- [ ] CI/CD 配置
- [ ] 发布脚本到 aigne-framework-oss

### 收尾
- [ ] 归档 aigne-framework (旧 repo)
- [ ] 更新所有文档链接
- [ ] 通知团队切换

---

## Phase 2: 测试体系建设 (Day 8-14)

### AFS Repo 测试
- [ ] 建立 @afs/test-utils
- [ ] AI 生成工具函数测试
- [ ] 确保 core 和 drivers 测试覆盖 >0.8

### AIGNE Repo 测试
- [ ] 迁移现有测试
- [ ] 补充 platform-helpers 测试 (当前 0.02)
- [ ] 补充 memory/* 测试 (当前 0.23-0.25)
- [ ] AI 生成无测试工具函数测试:
  - json-utils.ts (41 行)
  - model-utils.ts (13 行)
  - promise.ts (17 行)
  - role-utils.ts (39 行)
  - stream-polyfill.ts (35 行)
  - typed-event-emitter.ts (15 行)
- [ ] 创建 Model 测试模板，应用到 13 个模型包
- [ ] 移除 coverage.test.ts 模式 (32 个文件)

**预期产出**: 800-1,400 行自动生成测试

---

## Phase 3: 发布与同步体系 (Day 15+)

### 同步策略

```
arcblock/arcblock-ai (私有)     aigne org (公开)
├── afs/
│   ├── core/       ──────────→  aigne/afs
│   ├── drivers/    ──────────→  aigne/afs
│   ├── daemon/     ──────────→  aigne/afs
│   ├── cli/        ──────────→  aigne/afs
│   └── runtime/    ✗ 不同步
└── aigne/
    ├── framework/  ──────────→  aigne/aigne-framework
    ├── runtime/    ✗ 不同步
    └── observability/ ✗ 不同步
```

**触发时机**: 版本发布时，不是每次 commit
**同步方向**: 单向，arcblock → aigne，不反向

### 版本策略

**一个 Repo = 一个版本号**

| Repo | 版本 | 包 |
|------|------|---|
| afs | v1.x.x | 所有 @afs/* 同版本 |
| aigne-framework | v1.x.x | 所有 @aigne/* 同版本 |

### 发布流程

```
私有 repo 开发完成
      ↓
更新版本号 (统一)
      ↓
私有 repo 打 tag
      ↓
触发同步脚本 (清理、翻译、推送)
      ↓
公开 repo CI 自动:
  - 运行测试
  - 发布 npm
  - 创建 GitHub Release
```

### 行动项
- [ ] 开发同步脚本 (sync-to-public.sh)
- [ ] 开发敏感内容清理脚本
- [ ] 配置公开 repo CI/CD (npm publish + GitHub Release)
- [ ] 配置版本号统一更新脚本

**详细方案**: [release-and-sync-strategy.md](./release-and-sync-strategy.md)

---

## Phase 4: 工程优化

- [ ] 各 repo 配置 Turborepo
- [ ] 统一 TypeScript 配置模板
