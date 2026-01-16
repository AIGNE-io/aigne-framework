# Observability 分拆分析

> 分析日期: 2026-01-15

## 问题

`observability/` 目录放在 aigne-framework monorepo 里是否合理？还是应该分拆出去？

---

## 目录结构

```
observability/
├── api/              (@aigne/observability-api)
│   ├── core/         # 核心数据类型、DB路径管理
│   ├── opentelemetry/# OTel SDK集成、导出器
│   ├── observer/     # AIGNEObserver类、追踪器
│   └── server/       # Express服务器、路由、数据库迁移
│
├── ui/               (@aigne/observability-ui)
│   └── src/          # React组件、hooks、i18n
│
└── blocklet/         (@blocklet/observability)
    └── ...           # Blocklet 部署配置
```

**代码规模**：~8,500 行 TypeScript/TSX，104 个源文件

---

## 依赖关系分析

| 包 | 对 observability 的依赖 |
|---|---|
| @aigne/core | 可选依赖 observability-api |
| @aigne/cli | 可选依赖 observability-api |
| observability-api | 仅依赖 @aigne/sqlite、@aigne/uuid（外部库） |
| observability-ui | 不依赖任何 @aigne/* 包 |

**关键发现**：observability 与核心框架**耦合度极低**，是可选增强。

---

## 独立部署能力

### 模式 A：CLI 模式（本地开发）
```typescript
import { startObservabilityCLIServer } from "@aigne/observability-api/cli";
startObservabilityCLIServer({ port: 7890, dbUrl: "file:observer.db" });
```

### 模式 B：Blocklet 模式（托管部署）
- 完整的 Blocklet 应用配置
- 独立的身份验证、权限管理

---

## 产品定位评估

| 维度 | 评估 |
|---|---|
| 是否独立产品 | ✅ 是 |
| 独立品牌 | ✅ AIGNE Observability |
| 独立版本号 | ✅ 0.11.x（独立于 core 的 1.72.x） |
| 独立市场 | ✅ Blocklet 应用市场 |
| 独立受众 | ✅ AI 应用开发者调试/监控工具 |
| 与 core 解耦 | ✅ core 可不依赖它正常运行 |

---

## 决策分析

### 分拆优势

| 优势 | 权重 |
|---|---|
| 战略独立性：独立产品、市场、用户 | ⭐⭐⭐⭐⭐ |
| 工程解耦：零强依赖，版本已独立 | ⭐⭐⭐⭐ |
| 发布灵活性：不受框架周期束缚 | ⭐⭐⭐⭐ |
| 用户选择：明确是可选组件 | ⭐⭐⭐⭐ |
| 团队效率：独立迭代，减少 PR 冲突 | ⭐⭐⭐ |

### 保留理由（较弱）

- 开发便利性（但版本已独立）
- 紧密集成体验（但集成是可选的）

---

## 结论

**建议：分拆出去**

理由：
1. 本质上是独立的 SaaS/托管产品，不是框架组件
2. 零对 @aigne/core 的强依赖
3. 有独立的品牌、市场、用户、版本号
4. 分拆后用户更清晰理解这是可选工具

---

## 分拆行动计划

1. **创建独立仓库** `aigne-observability`
   ```bash
   git subtree push --prefix observability/
   ```

2. **调整依赖为 peerDependency**
   ```json
   "peerDependencies": {
     "@aigne/observability-api": "^0.11.0"
   }
   ```

3. **文档更新**
   - 明确标注 Observability 是可选组件
   - 链接到独立项目

4. **独立 CI/CD**
   - 独立发布管道
   - 独立版本管理
