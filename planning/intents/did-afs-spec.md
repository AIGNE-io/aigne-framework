# did:afs Method Specification v0.1

> 状态: 设计中
> 目标: 独立开源 repo
> 定位: AFS 世界内的 identity 原语

---

## 1. 核心定位

```
did:afs 与 did:abt 在结构上几乎同构，
但在"语义主权"和"生命周期"上刻意分离；
AFS 生态原生支持二者互通，但不混用。
```

**一句话**：did:afs 是 world-scoped DID method，用于描述在 AFS 世界中的行动者。

---

## 2. did:afs vs did:abt

### 结构同构

从纯 DID 技术层面，did:afs 和 did:abt 几乎一模一样：
- DID syntax
- DID Document
- verificationMethod
- service endpoint
- 签名 / 验证

**这不是重新发明 DID，而是复用 DID 作为形式语言，定义不同的语义域。**

### 语义分离

| 维度 | did:afs | did:abt |
|------|---------|---------|
| **所属域** | 世界内（AFS World） | 现实 / 经济 / 合规 |
| **主体类型** | 人 / agent / device / daemon | 人 / 组织 / 账户 |
| **生命周期** | 秒～长期（可短可长） | 长期、稳定 |
| **是否上链** | ❌ | ✅ / 可选 |
| **是否可撤销** | 高频、廉价 | 低频、高成本 |
| **权限语义** | exec / mount / read | governance / asset / claim |
| **使用场景** | "谁在这个世界里做了什么" | "这个人现实中是谁" |

**同构但不等价。**

---

## 3. DID Syntax

```
did:afs:<method-specific-id>
```

### 示例

```
did:afs:alice                        # 人
did:afs:agent/code-reviewer          # AI agent
did:afs:afsd/home-gateway            # daemon
did:afs:device/fridge                # IoT 设备
did:afs:job/tmp-20260116-abc123      # 临时任务
did:afs:session/xyz789               # ephemeral session
```

### Method-Specific ID 规则

- 允许：`[a-z0-9-_/]`
- `/` 用于层级结构（如 `agent/xxx`, `device/xxx`）
- 长度：1-256 字符

---

## 4. DID Document

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://afs.dev/did/v1"
  ],
  "id": "did:afs:alice",

  "verificationMethod": [{
    "id": "did:afs:alice#key-1",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:afs:alice",
    "publicKeyMultibase": "z6Mkf..."
  }],

  "authentication": ["did:afs:alice#key-1"],

  "alsoKnownAs": [
    "did:abt:z8ia..."
  ],

  "service": [{
    "id": "did:afs:alice#afsd",
    "type": "AFSDEndpoint",
    "serviceEndpoint": "afsd://alice.local:7654"
  }]
}
```

---

## 5. 与 did:abt 的桥接

### 桥接模型（互通但不混用）

```
did:afs:alice
  └── alsoKnownAs: did:abt:z8ia...
```

### Proof of Link（可选）

```json
{
  "id": "did:afs:alice",
  "alsoKnownAs": ["did:abt:z8ia..."],
  "proofOfLink": {
    "type": "Ed25519Signature2020",
    "signedBy": "did:abt:z8ia...",
    "scope": "afs-world",
    "created": "2026-01-16T10:00:00Z",
    "proofValue": "z3FXQehH..."
  }
}
```

### 桥接语义

- AFS 世界 **承认** 这个现实身份
- 但 **不依赖它运行**
- ACL / exec / mount 永远只看 did:afs

---

## 6. Resolution

### 本地优先

did:afs 主要在 AFSD 本地解析，不需要全局 resolver。

```
Client                    AFSD
   │                        │
   │  resolve(did:afs:x)    │
   │───────────────────────→│
   │                        │ local lookup
   │  DID Document          │
   │←───────────────────────│
```

### 解析优先级

1. 本地 AFSD 缓存
2. 已 mount 的远程 AFSD
3. (可选) 公开 resolver

---

## 7. Operations

### Create

- AFSD 本地生成 keypair
- 创建 DID Document
- 存储在本地

### Read (Resolve)

- 查询本地或已知 AFSD
- 返回 DID Document

### Update

- 更新 DID Document（如添加 key, service）
- 由 controller 签名

### Deactivate

- 标记为 deactivated
- 可以是高频、廉价操作（与 did:abt 不同）

---

## 8. 权限模型

### ACL 永远使用 did:afs

```
✅ ALLOW did:afs:alice EXEC /team/deploy
✅ ALLOW did:afs:agent/ci-bot READ /team/logs/*
✅ ALLOW did:afs:device/sensor-1 WRITE /home/sensors/temp

❌ ALLOW did:abt:z8ia... EXEC /team/deploy
```

### Capability 委托

```yaml
# capability.yaml
issuer: did:afs:alice
subject: did:afs:agent/my-assistant
actions:
  - READ /team/**
  - WRITE /team/logs/alice/**
  - EXEC /team/tasks/create
expires: 2026-01-17T00:00:00Z
```

---

## 9. 安全考虑

### 密钥管理

- 私钥存储在本地（AFSD 管理）
- 支持多 key（rotation）
- 支持 ephemeral key（短期任务）

### 签名验证

- AFSD 验证所有操作的签名
- 签名包含：action, path, timestamp, nonce

### 撤销

- did:afs 撤销是本地操作，立即生效
- 不需要上链确认

---

## 10. AI-Native 优势

```
如果两个 DID method 不同，但 Document 结构同构，
LLM / agent 会自然学会它们的映射关系。
```

**Agent 可以理解**：
- "这是同一个主体的两个投影"
- 不需要在系统里写大量 glue logic

这是 AI-native 时代特有的优势。

---

## 11. 对外解释

当有人问"你们怎么又定义了一个 DID？"：

> 我们没有重新发明 DID。
> 我们定义的是一个 world-scoped DID method，
> 用于描述在 AFS 世界中的行动者。
> 它和 did:abt 在结构上完全兼容，并且可以互相链接。

---

## 12. 设计原则

```
did:afs 与 did:abt 同构、互认、各司其职。
AFS 世界的主权，永远在 AFS 内部。
```

### 红线判断

> "这个 identity 是为了在 AFS 世界里行动，还是为了在现实世界里被承认？"
>
> - 前者 → did:afs
> - 后者 → did:abt

### "同构但分域"的好处

- 在 **不破坏 AFS** 的前提下：加强 ABT 的合规/金融/治理能力
- 在 **不引入 ABT 复杂性** 的前提下：让 AFS identity 极度轻量、灵活

两条路不会互相拖累。

---

## 13. Roadmap

- [ ] did:afs method spec 完善
- [ ] 独立开源 repo
- [ ] AFSD 集成 did:afs 解析
- [ ] Capability 委托规范
- [ ] did:afs ↔ did:abt linking spec
- [ ] 参考实现（TypeScript）
