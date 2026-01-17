# 发版与同步策略

> 状态: 待执行
> 日期: 2026-01-15

## 1. Repo 迁移策略

### 1.1 执行顺序

```bash
# Phase 1: Rename 旧 repo
gh repo rename AIGNE-io/aigne-framework aigne-framework-legacy

# Phase 2: 创建新的公开 repos (占位)
gh repo create AIGNE-io/aigne-framework --public --description "AIGNE Agent Framework"
gh repo create AIGNE-io/afs --public --description "Agentic File System"

# Phase 3: 创建私有主 repo
gh repo create ArcBlock/arcblock-ai --private

# Phase 4: 迁移代码到私有 repo，发布到公开 repo

# Phase 5: Archive 旧 repo
gh repo archive AIGNE-io/aigne-framework-legacy
```

### 1.2 保留的资产

| 资产 | 处理方式 |
|------|---------|
| GitHub Stars | 新 repo 从 0 开始（rename 后 stars 留在 legacy） |
| npm 包名 | @aigne/* 继续使用，新 repo 发布 |
| GitHub Releases | 旧 releases 留在 legacy，新 repo 重新开始 |
| Issues/PRs | 留在 legacy，新 repo 重新开始 |
| 外部链接 | 需要更新（或 legacy repo README 指向新 repo） |

### 1.3 替代方案：Transfer + Fork

```bash
# 如果想保留 stars:
# 1. Fork aigne-framework 到私有 (作为开发 repo)
# 2. 清理原 repo，只保留开源部分
# 3. 但这样历史会混乱
```

**建议**：接受新 repo 从 0 开始，干净的历史更重要。

---

## 2. 私有 → 公开 同步策略

### 2.1 架构

```
arcblock-ai/                    # 私有主 repo (开发)
├── afs/
│   ├── core/                   # → 同步到 afs repo
│   ├── drivers/                # → 同步到 afs repo
│   ├── daemon/                 # → 同步到 afs repo
│   ├── cli/                    # → 同步到 afs repo
│   └── runtime/                # 不同步（私有）
├── aigne/
│   ├── framework/              # → 同步到 aigne-framework repo
│   └── runtime/                # 不同步（私有）
└── scripts/
    └── sync-to-public.sh

公开 Repos (artifact):
├── afs/                        # 只读镜像
└── aigne-framework/            # 只读镜像
```

### 2.2 同步触发时机

| 触发 | 说明 |
|------|------|
| 版本发布 | 每次 release 时自动同步 |
| 手动触发 | 需要紧急修复时 |
| **不是** 每次 commit | 公开 repo 是 artifact，不是开发 repo |

### 2.3 GitHub Action 自动同步（推荐）

```yaml
# .github/workflows/sync-to-oss.yml (私有 repo)
name: Sync to OSS

on:
  push:
    tags:
      - 'afs-v*'      # afs 发版
      - 'aigne-v*'    # aigne 发版
  workflow_dispatch:   # 手动触发
    inputs:
      target:
        description: 'Target repo (afs/aigne)'
        required: true
        type: choice
        options:
          - afs
          - aigne
          - all

jobs:
  sync-afs:
    if: startsWith(github.ref, 'refs/tags/afs-v') || github.event.inputs.target == 'afs' || github.event.inputs.target == 'all'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Extract version
        id: version
        run: |
          if [[ "${{ github.ref }}" == refs/tags/* ]]; then
            echo "version=${GITHUB_REF#refs/tags/afs-}" >> $GITHUB_OUTPUT
          else
            echo "version=latest" >> $GITHUB_OUTPUT
          fi

      - name: Prepare AFS public content
        run: |
          mkdir -p /tmp/afs-oss
          cp -r afs/core /tmp/afs-oss/
          cp -r afs/drivers /tmp/afs-oss/
          cp -r afs/daemon /tmp/afs-oss/
          cp -r afs/cli /tmp/afs-oss/
          # 不复制 runtime

          # 复制公共文件
          cp LICENSE /tmp/afs-oss/
          cp afs/README.md /tmp/afs-oss/ || true

      - name: Clean sensitive content
        run: |
          cd /tmp/afs-oss
          # 移除私有标记文件
          find . -name "*.private.*" -delete
          find . -name ".env*" -delete
          # 验证无敏感内容
          if grep -r "INTERNAL\|ArcBlock private" . 2>/dev/null; then
            echo "ERROR: Found sensitive content!"
            exit 1
          fi

      - name: Push to AFS OSS repo
        uses: cpina/github-action-push-to-another-repository@main
        env:
          SSH_DEPLOY_KEY: ${{ secrets.AFS_OSS_DEPLOY_KEY }}
        with:
          source-directory: '/tmp/afs-oss'
          destination-github-username: 'AIGNE-io'
          destination-repository-name: 'afs'
          target-branch: 'main'
          commit-message: 'Release ${{ steps.version.outputs.version }}'

      - name: Create tag on OSS repo
        if: startsWith(github.ref, 'refs/tags/')
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.AFS_OSS_PAT }}
          script: |
            await github.rest.git.createRef({
              owner: 'AIGNE-io',
              repo: 'afs',
              ref: 'refs/tags/${{ steps.version.outputs.version }}',
              sha: '${{ github.sha }}'
            })

  sync-aigne:
    if: startsWith(github.ref, 'refs/tags/aigne-v') || github.event.inputs.target == 'aigne' || github.event.inputs.target == 'all'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 类似 afs 的流程...
      - name: Prepare AIGNE public content
        run: |
          mkdir -p /tmp/aigne-oss
          cp -r aigne/framework/* /tmp/aigne-oss/
          # 不复制 runtime, observability

      - name: Push to AIGNE OSS repo
        uses: cpina/github-action-push-to-another-repository@main
        env:
          SSH_DEPLOY_KEY: ${{ secrets.AIGNE_OSS_DEPLOY_KEY }}
        with:
          source-directory: '/tmp/aigne-oss'
          destination-github-username: 'AIGNE-io'
          destination-repository-name: 'aigne-framework'
          target-branch: 'main'
```

### 2.4 Secrets 配置

在私有 repo 配置以下 secrets：

| Secret | 用途 |
|--------|------|
| `AFS_OSS_DEPLOY_KEY` | afs 公开 repo 的 deploy key (write) |
| `AFS_OSS_PAT` | 用于创建 tag 的 PAT |
| `AIGNE_OSS_DEPLOY_KEY` | aigne-framework 公开 repo 的 deploy key |
| `AIGNE_OSS_PAT` | 用于创建 tag 的 PAT |

**生成 Deploy Key**:
```bash
# 为每个公开 repo 生成
ssh-keygen -t ed25519 -C "sync-bot" -f afs-oss-deploy-key
# 公钥添加到公开 repo 的 Deploy Keys (Allow write)
# 私钥添加到私有 repo 的 Secrets
```

### 2.5 手动同步脚本（备用）

```bash
#!/bin/bash
# scripts/sync-to-public.sh (本地备用)

set -e

VERSION=$1
TARGET=$2  # afs 或 aigne

# ... 同上，用于本地调试或紧急发布
```

### 2.4 敏感内容清理

```bash
#!/bin/bash
# scripts/clean-sensitive.sh

TARGET=$1

# 移除私有标记的文件
find $TARGET -name "*.private.*" -delete
find $TARGET -name ".env*" -delete

# 移除内部注释
# grep -r "// INTERNAL:" --files-with-matches | xargs sed -i '/\/\/ INTERNAL:/d'

# 验证无敏感内容
if grep -r "ArcBlock internal" $TARGET; then
  echo "ERROR: Found sensitive content!"
  exit 1
fi
```

---

## 3. 版本发布策略

### 3.1 版本号原则

**一个 Repo = 一个版本号**

| Repo | 版本格式 | 说明 |
|------|---------|------|
| afs | v1.x.x | 所有 @afs/* 包同版本 |
| aigne-framework | v1.x.x | 所有 @aigne/* 包同版本 |
| arcblock-ai (私有) | 内部版本 | 可以不同步 |

### 3.2 发布流程

```
1. 私有 repo 开发完成
        ↓
2. 更新版本号 (所有包统一)
        ↓
3. 私有 repo 打 tag
        ↓
4. 触发同步脚本
        ↓
5. 公开 repo 收到代码 + tag
        ↓
6. 公开 repo CI 自动:
   - 运行测试
   - 发布 npm 包
   - 创建 GitHub Release
```

### 3.3 GitHub Release 配置

```yaml
# .github/workflows/release.yml (公开 repo)
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install & Build & Test
        run: |
          pnpm install
          pnpm build
          pnpm test

      - name: Publish to npm
        run: pnpm publish -r --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

### 3.4 版本号管理

**私有 repo (arcblock-ai)**:
```json
// package.json
{
  "version": "1.0.0",
  "private": true
}

// afs/core/package.json
{
  "name": "@afs/core",
  "version": "1.0.0"  // 所有 afs/* 同版本
}
```

**版本更新脚本**:
```bash
#!/bin/bash
# scripts/bump-version.sh

PRODUCT=$1  # afs 或 aigne
VERSION=$2

if [ "$PRODUCT" = "afs" ]; then
  # 更新所有 afs 包的版本
  for pkg in afs/core afs/drivers/* afs/daemon afs/cli; do
    jq ".version = \"$VERSION\"" $pkg/package.json > tmp.json
    mv tmp.json $pkg/package.json
  done
fi

# 提交
git add .
git commit -m "chore: bump $PRODUCT to v$VERSION"
git tag "${PRODUCT}-v${VERSION}"
```

---

## 4. npm 包命名策略

### 4.1 当前 → 新

| 当前包名 | 新包名 | 说明 |
|---------|--------|------|
| @aigne/afs | @afs/core | AFS 独立 scope |
| @aigne/afs-* | @afs/* | AFS 独立 scope |
| @aigne/core | @aigne/core | 保持不变 |
| @aigne/cli | @aigne/cli | 保持不变 |

### 4.2 scope 注册

```bash
# 需要在 npm 注册新 scope
npm login --scope=@afs
```

### 4.3 替代方案：保持 @aigne scope

```
@aigne/afs-core
@aigne/afs-daemon
@aigne/afs-cli
@aigne/core
@aigne/cli
```

**建议**：使用独立 @afs scope，更清晰地表达 AFS 是独立项目。

---

## 5. 迁移检查清单

### Phase 1: 准备
- [ ] 注册 npm scope @afs
- [ ] 创建 arcblock-ai 私有 repo
- [ ] 准备同步脚本
- [ ] 准备 CI/CD 配置

### Phase 2: Repo 迁移
- [ ] Rename aigne-framework → aigne-framework-legacy
- [ ] 创建新 aigne-framework repo
- [ ] 创建新 afs repo
- [ ] legacy repo README 添加指向新 repo 的说明

### Phase 3: 代码迁移
- [ ] 迁移代码到 arcblock-ai
- [ ] 消除 AFS 对 @aigne/core 的依赖
- [ ] 统一版本号
- [ ] 测试构建和发布流程

### Phase 4: 首次发布
- [ ] 同步到公开 repos
- [ ] 发布 npm 包
- [ ] 创建 GitHub Release
- [ ] 验证安装和使用

### Phase 5: 收尾
- [ ] Archive legacy repo
- [ ] 更新所有文档链接
- [ ] 通知用户迁移

---

## 6. 回滚计划

如果迁移出问题：

```bash
# 1. 恢复旧 repo 名称
gh repo rename aigne-framework-legacy aigne-framework

# 2. 删除新创建的 repos (如果还没发布)
gh repo delete AIGNE-io/afs --yes
gh repo delete AIGNE-io/aigne-framework --yes  # 新的那个

# 3. 继续使用旧 monorepo
```

**关键**：在首次公开发布前，随时可以回滚。
