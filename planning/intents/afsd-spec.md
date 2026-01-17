# AFSD (AFS Daemon) 规格 v0.1

> 状态: 待执行
> 优先级: 高
> 依赖: AFS repo 独立完成后

## 1. 定位

afsd 是 AFS 的 **world host（世界宿主）**。

**它不是**：
- ❌ 业务系统
- ❌ workflow engine
- ❌ agent orchestrator
- ❌ UI

**它的唯一职责是**：
> 托管一个可被多个 client / agent 共享、持久存在的 AFS 世界。

---

## 2. 核心职责（Must Have）

### 2.1 Path Resolution
- 解析 AFS 路径（如 `/aine/status`）
- 根据 mount table 决定由哪个 provider 处理

### 2.2 Mount Management
- 支持 mount / unmount provider
- 支持：
  - local provider
  - remote afsd（afsd 挂载 afsd）
- mount 信息是显式、可 inspect 的

### 2.3 Operation Dispatch

统一处理并转发以下操作：
- `read(path)`
- `write(path, content)`
- `exec(path, args)`
- `explain(path or command)`

### 2.4 State Persistence
- AFS artifacts、metadata 必须持久化
- afsd crash / restart 后世界仍然存在

### 2.5 Concurrency & Safety
- 同一路径的并发操作必须有明确策略：
  - lock / version / conflict
- 冲突必须显式暴露，不能 silently overwrite

---

## 3. 明确禁止（Non-Goals）

afsd **绝对不允许**：
- ❌ 语义推断（semantic inference）
- ❌ agent 决策
- ❌ workflow / pipeline
- ❌ UI / formatting
- ❌ 自动 summary
- ❌ 隐式状态或 magic behavior

**判断标准**：如果一个功能可以被描述为"帮用户 / agent 更聪明"—— 那它**不属于 afsd**。

---

## 4. Protocol（最小）

afsd 对外暴露一个极简协议（本地或远程）：

```
READ   <path>
WRITE  <path> <content>
EXEC   <path> <args>
EXPLAIN <path|command>
```

**返回要求**：
- deterministic
- explainable
- exit code 是协议的一部分

---

## 5. Transport Layer（抽象）

### 设计原则

```
AFSD assumes a secure transport.
Transport is an abstraction — implementations are pluggable.
No dynamic control plane is required.
```

### Transport Layer 职责

| 做 | 不做 |
|----|------|
| 提供加密通道 | 互联网级 peer discovery |
| 静态 peer 配置 | NAT 穿透服务 |
| identity anchor (如 pubkey) | 网络级 ACL |
| 连接建立 | 复杂重连逻辑 |
| **本地网络自动发现** | 中心化协调服务 |

### 本地网络发现（LAN Discovery）

**目的**：便于用户管理自己的设备，自动发现同一网络内的 afsd 实例。

**实现方式**：mDNS / Bonjour（成熟、无中心、零配置）

```
# afsd 启动时广播
_afsd._tcp.local.
  name: "robert-macbook"
  port: 7654
  txt: "id=did:abt:xxx" "version=0.1"

# 其他 afsd 自动发现
$ afs discover
robert-macbook.local:7654  did:abt:xxx
robert-nas.local:7654      did:abt:yyy
```

**边界**：
- ✅ 本地网络（同一 LAN / subnet）
- ✅ 自己的设备
- ❌ 跨互联网发现（需要显式配置或 WireGuard）

### 抽象接口

```typescript
interface AFSTransport {
  // 建立到 peer 的连接
  connect(peer: PeerConfig): Connection;

  // 从 transport identity 映射到 AFS identity
  resolveIdentity(transportId: string): AFSIdentity;
}

interface PeerConfig {
  endpoint: string;           // 如何连接
  transportId: string;        // transport 层的 identity
  afsIdentity?: AFSIdentity;  // 映射到 AFS identity
}
```

### 实现选项

| 实现 | 适用场景 | 状态 |
|------|---------|------|
| **Local IPC** | 单机多进程 | v0.1 必须 |
| **TCP/TLS** | 简单远程 | v0.1 可选 |
| **WireGuard** | 安全点对点，无中心依赖 | Roadmap |
| **WebSocket** | Web 客户端 | Roadmap |

### WireGuard 实现说明（Roadmap）

**定位**：Secure Transport，不是 VPN 产品。

```
WireGuard 协议    ≠    WireGuard 控制器
静态 peer 配置    ≠    动态 mesh 网络
```

**只用 WireGuard 的最小子集**：
- ✅ 加密隧道
- ✅ 静态 peer 定义（手工配置）
- ✅ WG pubkey → AFS identity 映射
- ❌ 动态 peer discovery
- ❌ NAT 打洞服务
- ❌ 网络 UI

**配置示例**（静态模式）：
```yaml
# afsd transport config
transport:
  type: wireguard
  privateKey: <local-private-key>
  peers:
    - publicKey: <peer-pubkey>
      endpoint: 192.168.1.100:51820
      afsIdentity: did:abt:robert
```

**防失控检测**（一旦出现就越界）：
- ❌ 需要"重连逻辑"
- ❌ 需要"peer 生命周期管理"
- ❌ 需要"网络 UI"

---

## 6. 架构约束

- afsd 必须允许**多实例**
- **没有中心控制节点**
- 世界通过 mount 关系组合，而不是 global coordinator

### 边缘 afsd 模式（Edge Pattern）

**核心原则**：Driver 在边缘处理，其他设备只看 AFS 抽象。

```
Laptop afsd                   Gateway afsd                  NAS afsd
┌──────────────┐             ┌──────────────┐            ┌──────────────┐
│ /local/*     │             │ /home/*      │            │ /storage/*   │
│ /home/*  ────│── mount ───→│ ├── lights/  │←zigbee     │ ├── photos/  │
│ /nas/*   ────│── mount ───────────────────────────────→│ └── videos/  │
└──────────────┘             └──────────────┘            └──────────────┘
                                   │
                             Driver 在这里
                             其他设备不需要关心
```

**典型场景**：

| 边缘 afsd | 处理的 driver | 暴露的 AFS 路径 |
|----------|--------------|----------------|
| Smart Home 网关 | Zigbee, HomeKit, Matter | `/home/lights/*`, `/home/sensors/*` |
| NAS | 存储、RAID、备份 | `/storage/photos/*`, `/storage/backups/*` |
| 媒体服务器 | 转码、流媒体 | `/media/movies/*`, `/media/music/*` |
| 开发服务器 | GPU、模型推理 | `/compute/models/*`, `/compute/jobs/*` |

**优势**：
- ✅ 本地设备不需要安装各种 driver/SDK
- ✅ 统一的 AFS 路径访问所有资源
- ✅ 边缘设备专注做好一件事
- ✅ 通过 mount 灵活组合
- ✅ LAN Discovery 自动发现可用的边缘 afsd

---

## 7. Identity：did:afs

> 详细规格见 [did-afs-spec.md](did-afs-spec.md)（独立开源 repo）

### 核心决策

```
did:afs 与 did:abt 在结构上几乎同构，
但在"语义主权"和"生命周期"上刻意分离；
AFS 生态原生支持二者互通，但不混用。
```

### 快速对照

| 维度 | did:afs | did:abt |
|------|---------|---------|
| **定位** | 世界内名牌 | 世界外护照 |
| **生命周期** | 秒～长期 | 长期、稳定 |
| **主体** | 人 / agent / device / daemon | 人 / 组织 / 账户 |
| **上链** | ❌ | ✅ |
| **解析** | AFSD 本地 | 全局 |

### 示例

```
did:afs:alice                    # 人
did:afs:agent/code-reviewer      # AI agent
did:afs:afsd/home-gateway        # daemon
did:afs:device/fridge            # IoT 设备
```

### 桥接（互通但不混用）

```
did:afs:alice
  └── alsoKnownAs: did:abt:z8ia...
```

ACL 永远只看 did:afs：
```
✅ ALLOW did:afs:alice EXEC /team/deploy
❌ ALLOW did:abt:... EXEC /team/deploy
```

---

## 8. 成功标准

> 用户几乎感觉不到它的存在，但所有世界状态都离不开它。

---

## 9. 产品架构：AFSD 与 AINE 的关系

> 决策日期: 2026-01-16
> 状态: 已决定

### 核心原则

```
AFSD 是内核，AINE 是产品
用户装一个 App，内部是两层架构
```

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│  AINE (面向用户的产品)                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AINE Desktop (GUI 入口，系统托盘常驻)            │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AINE Runtime                                     │  │
│  │  ├── Blocklet 兼容层 (运行旧 blocklet)            │  │
│  │  └── AIGNE Observe (可观测性模块)                 │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AFSD (核心 daemon，长期驻留)                     │  │
│  │  └── 世界宿主，所有状态的 source of truth         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 组件定位

| 组件 | 定位 | 长期驻留 | 用户可见 |
|------|------|---------|---------|
| **AFSD** | 核心 daemon，世界宿主 | ✅ 必须 | ❌ 透明 |
| **AINE Runtime** | 应用层，含 Blocklet 兼容 | ✅ 随 AFSD | ❌ 透明 |
| **AINE Desktop** | GUI 壳，管理一切 | ✅ 系统托盘 | ✅ 主入口 |
| **AIGNE Observe** | AINE 的功能模块 | 按需启动 | 通过 AINE |
| **Blocklet Server** | ❌ 被 AINE 取代 | — | — |

### 战略决策

1. **Blocklet 是历史产物** — 只做兼容，不再独立发展
2. **AINE 取代 Blocklet** — AINE 目标是能运行 Blocklet
3. **用户只装一个东西** — AINE Desktop（内含 AFSD）

### 用户体验

**GUI 用户**:
```
安装 AINE Desktop
└── 自动包含 afsd
└── 系统托盘常驻
└── 一键管理所有服务
```

**CLI/Server 用户**:
```bash
brew install aine-cli  # 包含 afsd
aine start             # 启动 afsd + aine runtime
```

### 类比

```
AINE Desktop : AFSD = Docker Desktop : Docker Daemon
```

- AFSD 是无头的核心引擎
- AINE Desktop 是面向用户的 GUI 壳
- 两者可以分离部署（headless 场景）

### 实现策略

> AINE Desktop 已存在，AFSD 无需实现任何 UI

| 组件 | UI 职责 |
|------|--------|
| **AFSD** | ❌ 无 UI，纯 daemon |
| **AINE Desktop** | ✅ 提供 AFSD 管理面板 |

**AFSD 只暴露**:
- IPC/HTTP API（供 AINE Desktop 调用）
- CLI 命令（供脚本/调试使用）

**AINE Desktop 负责**:
- AFSD 状态展示
- Mount 管理界面
- 服务启停控制
- 日志查看

---

## 开源与商业版本界限

**内核一致，能力分层**：

| afsd (开源 reference) | AFS Runtime (商业版) |
|----------------------|---------------------|
| 核心协议实现 | 高性能优化 |
| 基本 persistence | 企业级存储 |
| 基本 concurrency | 分布式一致性 |
| 单实例运行 | 水平扩展 / 高可用 |
| 无权限管理 | 权限管理 / ACL |
| 无审计 | Auditing / 合规 |
| 独立运行 | DID 集成 / 身份验证 |

**原则**：
- 开源版：任何人可以跑自己需要的
- 商业版：高性能、权限管理、auditing、DID 集成
- **内核和开源是一样的**

---

## 实现计划

### 目录结构
```
afs/
└── daemon/
    ├── src/
    │   ├── index.ts
    │   ├── server.ts       # 协议服务
    │   ├── mount-table.ts  # mount 管理
    │   ├── path-resolver.ts
    │   ├── operations.ts   # read/write/exec/explain
    │   ├── persistence.ts  # 状态持久化
    │   ├── concurrency.ts  # 并发控制
    │   └── transport/      # Transport Layer 抽象
    │       ├── interface.ts    # AFSTransport 接口
    │       ├── local-ipc.ts    # 本地 IPC 实现
    │       └── tcp-tls.ts      # TCP/TLS 实现
    └── test/
```

### 行动项

**v0.1 必须**：
- [ ] 设计 mount table 数据结构
- [ ] 实现 path resolution
- [ ] 实现 4 个核心操作
- [ ] 实现持久化层
- [ ] 实现并发控制（lock/version）
- [ ] 实现 Transport Layer 抽象接口
- [ ] 实现 Local IPC transport
- [ ] 实现 LAN Discovery（mDNS/Bonjour）
- [ ] 测试：多实例、crash recovery、冲突处理

**Roadmap**：
- [ ] 实现 TCP/TLS transport
- [ ] 实现 WireGuard transport（静态模式）
- [ ] 实现 WebSocket transport
