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

## 9. Key Material 分层

### Identity Stack（三层）

```
Layer 0: Key Material（怎么来的）
         ├── BIP-39 mnemonic（default，与 did:abt 一致）
         ├── Passkey / WebAuthn（人类交互层）
         ├── Derived subkey（从 BIP-39 派生）
         ├── Random seed（ephemeral）
         └── Hardware key

Layer 1: DID（世界内名）
         did:afs:<opaque-id>
         - 可签名、可验证、唯一
         - 支持从 BIP-39 派生路径

Layer 2: Linking / Ownership（可选）
         - derivedFrom bip39:m/44'/999'/0'
         - alsoKnownAs did:abt:...
```

### BIP-39 Default 支持

```
did:afs default 支持 BIP-39 派生，与 did:abt 保持一致。
这对多设备、多 node 场景至关重要。
```

**为什么 default 支持 BIP-39**：
- ✅ 与 did:abt 密钥体系统一
- ✅ 多设备从同一 seed 派生
- ✅ 多 node 可管理、可恢复
- ✅ 提供可靠的恢复路径

**派生路径示例**：
```
m/44'/999'/0'           → did:afs:alice（人类主身份）
m/44'/999'/0'/0         → did:afs:afsd/home（home daemon）
m/44'/999'/0'/1         → did:afs:afsd/office（office daemon）
m/44'/999'/0'/2/0       → did:afs:device/laptop
m/44'/999'/0'/2/1       → did:afs:device/phone
```

**例外（不从 BIP-39 派生）**：
- ❌ ephemeral job / task（随机生成）
- ❌ 临时 session（随机生成）

---

## 10. Passkey 原生支持

### 设计定位

```
Passkey 是"人类进入 AFS 世界的最佳钥匙"，
但 AFS 仍然是"以 DID 为主语的世界"。
```

Passkey 作为 **verificationMethod 的一种实现**，不是 DID 本身。

### DID Document 示例（含 Passkey）

```json
{
  "id": "did:afs:alice",
  "verificationMethod": [
    {
      "id": "did:afs:alice#passkey-1",
      "type": "WebAuthn",
      "controller": "did:afs:alice",
      "publicKeyJwk": { "kty": "EC", "crv": "P-256", ... }
    },
    {
      "id": "did:afs:alice#recovery-key",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:afs:alice",
      "publicKeyMultibase": "z6Mkf..."
    }
  ],
  "authentication": ["did:afs:alice#passkey-1"],
  "recovery": ["did:afs:alice#recovery-key"]
}
```

### AFSD 原生支持范围

1. **注册 / 绑定 Passkey**
   - 创建 did:afs
   - 记录 WebAuthn credential 公钥

2. **挑战-响应签名**
   - AFSD 生成 challenge
   - 客户端用 Passkey 签名（FaceID/TouchID）
   - AFSD 验证签名

3. **会话 Capability 下发**
   - 认证成功后下发短期 capability
   - 后续操作用 capability，不需要每次弹生物识别

### Passkey vs 其他 signer

| 身份类型 | 推荐 signer |
|---------|------------|
| 人类（did:afs:alice） | Passkey |
| Agent（did:afs:agent/*） | Ed25519 keypair |
| Daemon（did:afs:afsd/*） | Node key |
| Device（did:afs:device/*） | Hardware key / TPM |

---

## 11. Node Key Binding（设备密钥绑定）

### 目标

用 Passkey 的**稳定唯一标识**作为 identity anchor，
但**不从 Passkey 派生节点私钥**。

### 安全原则（红线）

```
Passkeys MUST NOT be used as key material for other cryptographic purposes.
They MAY be used to attest ownership or binding of independently generated keys.
```

### 正确做法

```
Human (passkey)
  ↓ proves control
Stable Identity Anchor (credential_id, public, verifiable)
  ↓ used as context
Node / Agent Keys (independent, rotatable)
```

**Identity Anchor 计算**：
```
passkey_anchor = SHA256(credential_id || rp_id)
```
这是 seed / salt，**不是 secret**。

**Node Key 独立生成**：
```
node_keypair = Ed25519.generate()  // 可轮换、可撤销
```

### Binding Attestation

```json
{
  "node": "did:afs:afsd/home",
  "nodeKey": "ed25519:z6Mkf...",
  "boundTo": {
    "type": "passkey-anchor",
    "value": "hash:abcd..."
  },
  "attestedBy": "did:afs:alice",
  "attestation": {
    "type": "webauthn-signature",
    "created": "2026-01-16T10:00:00Z",
    "proofValue": "..."
  }
}
```

**语义**："这个节点 key 是由 Alice 用她的 Passkey 确认归属的。"

### 优势

- ✅ Passkey 私钥永不离开 authenticator
- ✅ Node key 泄露 ≠ 人类身份泄露
- ✅ Node 可以换 key，Passkey 不受影响
- ✅ 审计可解释：谁、用什么、确认了哪个节点

---

## 12. 无钱包设计

### 核心决策

```
摆脱钱包依赖是正确的。
钱包不是"身份"的最佳载体，它只是"资产"的工具。
```

### 钱包模型的问题

钱包体系隐含的假设：
1. 身份 = 账户
2. 账户 = 私钥
3. 私钥 = 人工备份（助记词）
4. 备份失败 = 永久丢失
5. 每次操作都是"高风险金融操作"

**这套模型不适合**：日常工作、多设备、agent/daemon、世界级协作、高频动作。

### AFS 的"去钱包化拆分"

| 维度 | 钱包体系 | AFS 体系 |
|------|---------|---------|
| **身份载体** | 私钥 | Passkey |
| **备份** | 助记词（人工） | 系统级同步 |
| **日常操作** | 高风险 | 低摩擦 |
| **多设备** | 痛苦 | 天然支持 |
| **Agent** | 不友好 | 一等公民 |
| **丢设备** | 灾难 | 无感重建 |
| **权限** | 全有或全无 | 细粒度 capability |

### 三个拆分

1. **身份连续性** → Passkey（无助记词、系统级同步、生物识别）
2. **世界内权限** → did:afs + capability（谁、在哪、能做什么）
3. **节点签名** → 可丢弃 node key（丢了就换，不影响人类身份）

### 对外解释

> "我们不依赖钱包，是因为钱包不是为世界协作设计的。"

这不是反 crypto，是把 crypto 放回它擅长的位置。

---

## 13. 安全考虑

### 密钥管理

- 人类身份：Passkey（推荐）或 BIP-39 派生
- Agent/Daemon：独立生成的 Ed25519 keypair
- 支持多 key（rotation）
- 支持 ephemeral key（短期任务）

### 签名验证

- AFSD 验证所有操作的签名
- 签名包含：action, path, timestamp, nonce

### 撤销

- did:afs 撤销是本地操作，立即生效
- 不需要上链确认
- Node key 可独立轮换，不影响人类 DID

### 恢复

- Passkey：OS 级同步（iCloud/Google）
- 多 verificationMethod：允许恢复 key
- 不依赖助记词人工备份

---

## 14. AI-Native 优势

```
如果两个 DID method 不同，但 Document 结构同构，
LLM / agent 会自然学会它们的映射关系。
```

**Agent 可以理解**：
- "这是同一个主体的两个投影"
- 不需要在系统里写大量 glue logic

这是 AI-native 时代特有的优势。

---

## 15. Payment Routing（支付路由）

### 核心原则

```
AFS 不处理资产，也不管理钱包；
AFS 只验证由 did:abt 出具的"已支付" VC。

AFS 关心的是"是否发生过一笔被认可的支付事实"，
而不是"钱是怎么付的"。
```

### 设计定位

- did:afs 可以是 **支付路由地址**
- did:afs **不应该** 是资产托管地址
- 价值流动通过 PaymentRouting service 定义

### DID Document 示例

```json
{
  "id": "did:afs:alice",
  "service": [{
    "id": "did:afs:alice#payment",
    "type": "PaymentRouting",
    "serviceEndpoint": {
      "chain": "ABT",
      "target": "did:abt:alice",
      "policy": "default"
    }
  }]
}
```

**语义**："给 did:afs:alice 的钱，实际路由到 did:abt:alice 的钱包。"

### 支付闭环

```
1. 用户向 did:afs:alice 付款
2. PaymentRouting → 落到 did:abt:alice
3. did:abt:alice 出具 Payment VC
4. Payment VC 提交给 AFS
5. AFS 验证 VC（issuer、signature、schema）
6. AFS 基于 VC 赋予世界内 capability
```

**AFS 永远不参与第 1–3 步的资产动作。**

### Payment VC 示例

```yaml
type: PaymentReceipt
issuer: did:abt:merchant
subject: did:afs:alice
amount: 100
currency: ABT
purpose: "team subscription"
txHash: 0xabc...
```

### AFS Policy 示例

```
IF valid(PaymentReceipt)
AND amount >= 100
AND purpose == "team subscription"
THEN
  GRANT did:afs:alice MOUNT /team
  FOR 30 days
```

### 为什么 VC 而不是查余额

| 维度 | 查链/余额 | VC 验证 |
|------|---------|--------|
| **耦合** | 需要 RPC、链同步 | 只需 VC 验证器 |
| **可解释** | 难审计 | "因为这张 VC" |
| **可组合** | 单链 | 多来源统一表达 |
| **扩展** | 链相关 | fiat/invoice 都能进 |

### 角色分离

| 角色 | did:afs | did:abt |
|------|---------|---------|
| **定位** | 世界内行动者 | 经济身份 |
| **职责** | 路由、权限、exec | 钱包、资产、结算 |
| **支付** | endpoint | custody |
| **VC** | consumer | issuer |

### 设计原则

```
AFS identity 可以"参与价值流"，
但不应该"承担价值存储"。

AFS evaluates claims, not balances.
Value enters the AFS world only as verifiable facts.
```

### 演进路径

- **今天**：did:afs → did:abt
- **明天**：did:afs → payment proxy / escrow
- **后天**：did:afs → native on-chain account（如果需要）

每一步都不需要推翻前面的设计，只是 serviceEndpoint 的变化。

---

## 16. 对外解释

当有人问"你们怎么又定义了一个 DID？"：

> 我们没有重新发明 DID。
> 我们定义的是一个 world-scoped DID method，
> 用于描述在 AFS 世界中的行动者。
> 它和 did:abt 在结构上完全兼容，并且可以互相链接。

当有人问"AFS 能处理支付吗？"：

> AFS identity 可以作为支付路由地址，
> 但资产托管由 did:abt 的钱包负责。
> AFS 只验证"已支付"的 VC，不处理资产本身。

---

## 17. 设计原则

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

## 18. Roadmap

**v0.1**：
- [ ] did:afs method spec 完善
- [ ] 独立开源 repo
- [ ] AFSD 集成 did:afs 解析
- [ ] BIP-39 派生支持（default）
- [ ] Ed25519 verificationMethod 实现
- [ ] Capability 委托规范
- [ ] 参考实现（TypeScript）

**v0.2**：
- [ ] Passkey / WebAuthn verificationMethod 实现
- [ ] Node key binding flow
- [ ] 多 verificationMethod 支持
- [ ] Key rotation

**Roadmap**：
- [ ] did:afs ↔ did:abt linking spec
- [ ] PaymentRouting service type spec
- [ ] Payment VC schema 定义
- [ ] Hardware key 支持
