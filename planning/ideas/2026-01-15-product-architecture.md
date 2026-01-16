# 产品架构与开源策略

> 日期: 2026-01-15

## 核心产品

三个相对独立的核心组件：

| 产品 | 定位 | 开源策略 |
|------|------|----------|
| **AFS** | Agentic File System，VFS 抽象 | 核心 + Drivers 开源 |
| **AIGNE** | AI Agent 框架 | 开源 |
| **AINE** | AI Native Engineering 平台 | 闭源 |

---

## 架构分层

```
┌─────────────────────────────────────────────┐
│  AINE (AI Native Engineering)               │  闭源
│  - 完整应用运行环境                           │
│  - 工程工具链                                 │
│  - 能跑出应用的完整平台                        │
└─────────────────────────────────────────────┘
                    ↓ 依赖
┌─────────────────────────────────────────────┐
│  AIGNE Framework                            │  开源
│  - Agent 编排                                │
│  - 多模型支持                                 │
│  - 工作流模式                                 │
└─────────────────────────────────────────────┘
                    ↓ 依赖
┌─────────────────────────────────────────────┐
│  AFS                                        │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │ Core + Drivers  │  │ Runtime (OS级)    │ │
│  │     开源        │  │     闭源          │ │
│  └─────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 依赖关系原则

```
AINE → AIGNE → AFS (单向依赖)
```

- **AFS**: 最底层，零上层依赖
- **AIGNE**: 依赖 AFS，不依赖 AINE
- **AINE**: 依赖 AIGNE 和 AFS

---

## AFS 内部结构

### 开源部分
```
afs/
├── core/           # VFS 核心抽象
├── drivers/        # 存储驱动
│   ├── local-fs/
│   ├── sqlite/
│   ├── git/
│   ├── json/
│   └── ...
└── types/          # 类型定义
```

### 闭源部分
```
afs-runtime/        # 接近 OS 级别的运行时
├── ui/
├── explorer/
├── process/
├── permissions/
└── ...
```

---

## 开源策略总结

| 组件 | 开源 | Repo |
|------|------|------|
| **AFS** | | |
| - Core + Drivers | ✅ | afs |
| - Runtime | ❌ | afs (或独立) |
| **AIGNE** | | |
| - Framework | ✅ | aigne-framework |
| - Runtime | ❌ | aigne-framework (或独立) |
| - Observability | ❌ | 独立 repo |
| **AINE** | | |
| - Platform | ❌ | 独立 repo (已存在) |

**原则**: 开源基础设施核心（Framework），闭源运行时（Runtime）和应用层。

---

## Repo 规划

```
开源:
├── afs/                 # AFS Core + Drivers
└── aigne-framework/     # AIGNE Framework

闭源:
├── afs-runtime/         # AFS Runtime (或在 afs 内)
├── aigne-runtime/       # AIGNE Runtime (或在 aigne-framework 内)
├── aigne-observability/ # Observability
└── aine/                # AINE Platform (已存在)
```
