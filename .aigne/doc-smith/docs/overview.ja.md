このドキュメントでは、AIGNE フレームワークの中核的なオーケストレーターである `AIGNE` クラスについて詳しく解説します。`AIGNE` インスタンスを作成、設定、使用して、Agent の管理、メッセージパッシングの処理、複雑な AI 駆動型アプリケーションの構築方法を学びます。

### はじめに

`AIGNE` クラスは、フレームワークの中心的なコンポーネントであり、複数の Agent とその相互作用をオーケストレーションするように設計されています。これは主要な実行エンジンとして機能し、Agent のライフサイクルを管理し、メッセージキューを介した通信を促進し、Agent ワークフローを呼び出すための統一されたエントリーポイントを提供します。

`AIGNE` クラスの主な責務は次のとおりです。
-   **Agent 管理**: アプリケーションを構成する Agent の読み込み、追加、管理。
-   **実行コンテキスト**: 各ワークフローに対して分離されたコンテキストを作成し、状態の管理と制限の適用を行います。
-   **呼び出し**: Agent と対話するための柔軟な `invoke` メソッドを提供し、標準応答とストリーミング応答の両方をサポートします。
-   **メッセージパッシング**: Agent 間の疎結合な通信のために、発行/購読システムを提供します。
-   **リソース管理**: Agent と関連リソースの正常なシャットダウンを保証します。

### アーキテクチャ概要

`AIGNE` クラスはフレームワークの中心に位置し、さまざまなコンポーネントを調整して複雑なタスクを実行します。次の図は、アーキテクチャにおけるその中心的な役割を示しています。

```d2
direction: down

User-Application: {
  label: "ユーザーアプリケーション"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  AIGNE: {
    label: "AIGNE クラス\n(コアオーケストレーター)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Managed-Components: {
    grid-columns: 2

    Agents: {
      label: "管理対象 Agent"
      shape: rectangle
      Agent-A: "Agent A"
      Agent-B: "Agent B"
      Agent-C: "..."
    }

    Message-Queue: {
      label: "メッセージキュー\n(Pub/Sub)"
      shape: queue
    }
  }
}

User-Application -> AIGNE-Framework.AIGNE: "invoke()"
AIGNE-Framework.AIGNE -> AIGNE-Framework.Managed-Components.Agents: "Agent 管理"
AIGNE-Framework.AIGNE -> AIGNE-Framework.Managed-Components.Message-Queue: "メッセージパッシング"
AIGNE-Framework.AIGNE -> AIGNE-Framework.AIGNE: "実行コンテキストの作成"
AIGNE-Framework.Managed-Components.Agents.Agent-A <-> AIGNE-Framework.Managed-Components.Message-Queue: "通信"

```

### インスタンスの作成

`AIGNE` インスタンスは、主に2つの方法で作成できます。コンストラクタを直接使用する方法と、ファイルシステムから設定を読み込む方法です。

#### 1. コンストラクタの使用

最も直接的な方法は、`AIGNEOptions` オブジェクトを使用してクラスをインスタンス化することです。これにより、グローバルモデル、Agent、スキルなど、エンジンのすべての側面をプログラムで定義できます。

**パラメータ (`AIGNEOptions`)**

| パラメータ | 型 | 説明 |
| :--- | :--- | :--- |
| `name` | `string` | AIGNE インスタンスの名前。 |
| `description` | `string` | インスタンスの目的を説明する記述。 |
| `model` | `ChatModel` | 特定のモデルが割り当てられていないすべての Agent が使用するグローバルモデル。 |
| `imageModel` | `ImageModel` | 画像関連タスク用のオプションのグローバル画像モデル。 |
| `skills` | `Agent[]` | インスタンスで利用可能なスキル Agent のリスト。 |
| `agents` | `Agent[]` | インスタンスによって管理される主要な Agent のリスト。 |
| `limits` | `ContextLimits` | タイムアウトや最大トークン数など、実行コンテキストの使用制限。 |
| `observer` | `AIGNEObserver` | 監視とロギングのためのオブザーバー。 |

**例**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. モデルインスタンスを作成
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. Agent を定義
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. AIGNE インスタンスを作成
const aigne = new AIGNE({
  model: model,
  agents: [assistantAgent],
  name: "MyFirstAIGNE",
});
```

#### 2. 設定からの読み込み

より複雑なアプリケーションでは、AIGNE の設定を YAML ファイルで定義し、静的メソッド `AIGNE.load()` を使用して読み込むことができます。このアプローチは設定をコードから分離し、アプリケーションのモジュール性を高めます。

```typescript
import { AIGNE } from '@aigne/core';

// './my-aigne-app' ディレクトリに `aigne.yaml` があることを前提とします
async function loadAigne() {
  const aigne = await AIGNE.load('./my-aigne-app');
  console.log(`AIGNE instance "${aigne.name}" loaded successfully.`);
  return aigne;
}
```

### コアメソッド

`AIGNE` クラスは、Agent を管理し、対話するための強力なメソッド群を提供します。

#### `invoke()`

`invoke` メソッドは、Agent と対話するための主要な方法です。永続的なユーザーセッションの作成、単一メッセージの送信、ストリーミング応答など、複数のパターンをサポートしています。

**1. User Agent の作成**

メッセージなしで Agent を呼び出すと、一貫した対話コンテキストを維持する `UserAgent` が作成されます。

```typescript
// 'assistantAgent' との継続的な対話のために UserAgent を作成します
const userAgent = aigne.invoke(assistantAgent);

// これで userAgent を介して複数のメッセージを送信できます
const response1 = await userAgent.invoke("Hello, what's your name?");
const response2 = await userAgent.invoke("Can you help me with a task?");
```

**2. 単一メッセージの送信 (リクエスト/レスポンス)**

単純な一度きりの対話の場合、Agent とメッセージを直接渡すことができます。

```typescript
const response = await aigne.invoke(
  assistantAgent,
  "Write a short poem about AI.",
);
console.log(response);
```

**3. ストリーミング応答**

応答をチャンクのストリームとして受け取るには、`streaming` オプションを `true` に設定します。これは、チャットボットのようなリアルタイムアプリケーションに最適です。

```typescript
const stream = await aigne.invoke(
  assistantAgent,
  "Tell me a long story.",
  { streaming: true }
);

for await (const chunk of stream) {
  // ストーリーの各部分が届くたびに処理します
  process.stdout.write(chunk.delta.text?.content || "");
}
```

#### `addAgent()`

作成後の `AIGNE` インスタンスに Agent を動的に追加できます。追加された Agent は、インスタンスのライフサイクルと通信システムにアタッチされます。

```typescript
const newAgent = AIAgent.from({ name: "NewAgent", instructions: "..." });
aigne.addAgent(newAgent);
```

#### `publish()` & `subscribe()`

フレームワークには、Agent 間の疎結合な通信のためのメッセージキューが含まれています。Agent はトピックにメッセージを発行でき、他の Agent はそれらのトピックを購読してメッセージを受信できます。

**メッセージの発行**

```typescript
// 'news_updates' トピックにメッセージを発行します
aigne.publish("news_updates", {
  headline: "AIGNE Framework v2.0 Released",
  content: "New features include...",
});
```

**トピックの購読**

トピックを購読して単一のメッセージを受信したり、永続的なリスナーを設定したりできます。

```typescript
// 1. トピックの次のメッセージを待機します
const nextMessage = await aigne.subscribe('user_actions');
console.log('Received action:', nextMessage);

// 2. トピックのすべてのメッセージに対するリスナーを設定します
const unsubscribe = aigne.subscribe('system_events', (payload) => {
  console.log(`System Event: ${payload.message.type}`);
});

// 後でリスニングを停止する場合:
unsubscribe();
```

#### `shutdown()`

クリーンな終了を保証するため、`shutdown` メソッドはすべての Agent とスキルを正常に終了させ、それらが保持するリソースをクリーンアップします。

```typescript
await aigne.shutdown();
console.log("AIGNE instance has been shut down.");
```

これは、最新の JavaScript/TypeScript の `Symbol.asyncDispose` 機能を使用して自動的に管理することもできます。

```typescript
async function run() {
  await using aigne = new AIGNE({ ... });
  // ... aigne インスタンスを使用 ...
} // ここで aigne.shutdown() が自動的に呼び出されます
```