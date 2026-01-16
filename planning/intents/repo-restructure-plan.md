# Repo 重构执行计划

> 状态: 待执行
> 日期: 2026-01-15

## 背景

- 当前巨大 monorepo 不适合 AI native 开发
- AI 重构速度极快，单 repo 容易冲突
- 多人小团队模式，每人负责一个 repo
- 需要隔离的 chamber，减少相互干扰

---

## 目标结构

```
私有 Repos (开发主战场):
├── afs/                    # AFS 全部 (1人负责)
│   ├── core/
│   ├── drivers/
│   └── runtime/
├── aigne/                  # AIGNE 全部 (1人负责)
│   ├── framework/
│   ├── runtime/
│   └── observability/
└── aine/                   # AINE (已独立)

公开 Repos (artifact, 版本发布时同步):
├── afs-oss/                # AFS Core + Drivers
└── aigne-framework-oss/    # AIGNE Framework
```

---

## 执行步骤

### Phase 1: 准备 (Day 1)

**1.1 创建新 Repos**
```bash
# 私有 repos
gh repo create ArcBlock/afs --private
gh repo create ArcBlock/aigne --private

# 公开 repos (artifact)
gh repo create ArcBlock/afs-oss --public
gh repo create ArcBlock/aigne-framework-oss --public
```

**1.2 确定边界**

| 当前位置 | 目标 Repo | 公开/私有 |
|---------|----------|----------|
| afs/* | afs/ | Core+Drivers 公开 |
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
# 标记为 archived
gh repo archive ArcBlock/aigne-framework

# 或重命名
gh repo rename ArcBlock/aigne-framework aigne-framework-legacy
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
