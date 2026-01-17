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

### 核心决策

```
AFS 必须定义自己的 did:afs，
可以桥接/承认 did:abt，
不能反过来。
```

**这是分层问题，不是阵营问题。**

### 两个不同的问题

| 问题 | 正确归属 |
|------|---------|
| 谁在 AFS 世界里行动？ | did:afs |
| 谁是现实世界/经济世界的主体？ | did:abt |

### did:afs vs did:abt

| 维度 | did:afs | did:abt |
|------|---------|---------|
| **定位** | 世界内名牌 | 世界外护照 |
| **生命周期** | 秒级 / session 级 | 年级 / 合规级 |
| **主体** | agent, daemon, device, job | 人, 账户, 经济主体 |
| **上链** | ❌ 不上链 | ✅ 上链 |
| **解析** | AFSD 本地验证 | 全局解析 |
| **用途** | exec, mount, audit | token, wallet, governance |

### AFS 的 identity 远多于"账户/人"

```
did:afs:agent/code-reviewer      ← AI agent
did:afs:afsd/home-gateway        ← daemon
did:afs:device/fridge            ← IoT 设备
did:afs:job/tmp-20260116         ← 临时任务
did:afs:alice                    ← 人
```

这些 **不应该** 上链、绑定 token、进入经济身份系统。

### 桥接关系（推荐模型）

```json
{
  "id": "did:afs:alice",
  "verificationMethod": [...],
  "alsoKnownAs": [
    "did:abt:z8ia..."
  ]
}
```

**关键**：
- AFS 以 did:afs 为主语
- 可选声明外部锚点（did:abt）
- AFS 的 ACL / exec / mount **永远只看 did:afs**

### 权限模型写法

```
✅ ALLOW did:afs:alice EXEC /team/deploy
❌ ALLOW did:abt:z8ia... EXEC /team/deploy
```

### 红线判断

> "这个 identity 是为了在 AFS 世界里行动，还是为了在现实世界里被承认？"
>
> - 前者 → did:afs
> - 后者 → did:abt

---

## 8. 成功标准

> 用户几乎感觉不到它的存在，但所有世界状态都离不开它。

---

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
