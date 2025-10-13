このドキュメントでは、複雑な AI アプリケーションを構築するための中核的なオーケストレーターである `AIGNE` クラスの詳細な概要を説明します。

## AIGNE クラス

`AIGNE` クラスはフレームワークの中核であり、複数の Agent を管理・調整して複雑なタスクを実行するように設計されています。Agent のインタラクション、メッセージパッシング、および全体的な実行フローの中心的なハブとして機能します。さまざまな専門 Agent をオーケストレーションすることで、`AIGNE` は高度なマルチ Agent AI システムの構築を可能にします。

### アーキテクチャ概要

以下の図は、AIGNE システムのハイレベルなアーキテクチャを示しており、`AIGNE`、`Agent`、`Context` といった主要なクラス間の関係を表しています。

```d2
direction: down

AIGNE: {
  label: "AIGNE クラス\n(オーケストレーター)"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Context: {
  label: "コンテキスト"
  shape: cylinder
}

Agents: {
  label: "Agent のプール"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  Agent-A: {
    label: "Agent A"
  }
  Agent-B: {
    label: "Agent B"
  }
  Agent-N: {
    label: "..."
  }
}

AIGNE -> Context: "管理"
AIGNE <-> Agents: "オーケストレーションとメッセージのルーティング"
Agents -> Context: "アクセス"
```

### コアコンセプト

-   **Agent 管理**: `AIGNE` は、システム内のすべての Agent の追加、管理、およびライフサイクルのオーケストレーションを担当します。
-   **コンテキスト作成**: 異なるタスクや会話のために、分離された実行コンテキスト（`AIGNEContext`）を作成し、状態とリソース使用が適切に管理されることを保証します。
-   **メッセージパッシング**: 組み込みのメッセージキューを介して Agent 間の通信を促進し、直接呼び出しと publish-subscribe モデルの両方を可能にします。
-   **グローバル設定**: `AIGNE` は、デフォルトの `ChatModel`、`ImageModel`、およびシステム内のどの Agent からもアクセスできる共有 `skills`（専門 Agent）のコレクションなどのグローバル設定を保持します。

### AIGNE インスタンスの作成

`AIGNE` インスタンスは、主に2つの方法で作成できます。コンストラクタを使用してプログラム的に作成する方法と、ファイルシステムから設定をロードする方法です。

#### 1. コンストラクタの使用

コンストラクタを使用すると、インスタンスをプログラム的に設定できます。

```typescript
import { AIGNE, Agent, ChatModel } from "@aigne/core";

// モデルといくつかの Agent (スキル) を定義
const model = new ChatModel(/* ... */);
const skillAgent = new Agent({ /* ... */ });
const mainAgent = new Agent({ /* ... */ });

// AIGNE インスタンスを作成
const aigne = new AIGNE({
  name: "MyAIGNEApp",
  description: "An example AIGNE application.",
  model: model,
  skills: [skillAgent],
  agents: [mainAgent],
});
```

**コンストラクタのオプション (`AIGNEOptions`)**

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="AIGNE インスタンスの名前。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="インスタンスの目的の説明。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="すべての Agent に対するグローバルなデフォルト ChatModel。"></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="画像関連タスクのためのグローバルなデフォルト ImageModel。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="他のすべての Agent が利用できる共有 Agent (スキル) のリスト。"></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="インスタンス作成時追加するプライマリ Agent のリスト。"></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="実行コンテキストの使用制限（例：タイムアウト、最大トークン数）。"></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="インスタンスのアクティビティを監視およびロギングするためのオブザーバー。"></x-field>
</x-field-group>

#### 2. 設定からのロード

静的メソッド `AIGNE.load()` は、`aigne.yaml` ファイルや他の Agent 定義を含むディレクトリからインスタンスを初期化する便利な方法を提供します。これは、設定をコードから分離するのに理想的です。

```typescript
import { AIGNE } from "@aigne/core";

// ディレクトリパスから AIGNE インスタンスをロード
const aigne = await AIGNE.load("./path/to/config/dir");

// ロードされたオプションを上書きすることも可能
const aigneWithOverrides = await AIGNE.load("./path/to/config/dir", {
  name: "MyOverriddenAppName",
});
```

### 主要なメソッド

#### invoke()

`invoke()` メソッドは、Agent と対話するための主要な方法です。さまざまな対話パターンをサポートするために、いくつかのオーバーロードがあります。

**1. シンプルな呼び出し**

これは最も一般的なユースケースで、Agent に入力メッセージを送信し、完全な応答を受け取ります。

**例**
```typescript
import { AIGNE } from '@aigne/core';
import { GreeterAgent } from './agents/greeter.agent.js';

const aigne = new AIGNE();
const greeter = new GreeterAgent();
aigne.addAgent(greeter);

const { message } = await aigne.invoke(greeter, {
  name: 'John',
});

// 期待される出力: "Hello, John"
console.log(message);
```

**2. ストリーミング呼び出し**

長時間のタスクやインタラクティブな体験（チャットボットなど）のために、応答が生成される過程でストリーミングすることができます。

**例**
```typescript
import { AIGNE } from '@aigne/core';
import { StreamAgent } from './agents/stream.agent.js';

const aigne = new AIGNE();
const streamAgent = new StreamAgent();
aigne.addAgent(streamAgent);

const stream = await aigne.invoke(
  streamAgent,
  {
    name: 'World',
  },
  { streaming: true }
);

let fullMessage = '';
for await (const chunk of stream) {
  if (chunk.delta.text?.message) {
    fullMessage += chunk.delta.text.message;
    // チャンクをリアルタイムで処理
    process.stdout.write(chunk.delta.text.message);
  }
}
// 期待される出力: "Hello, World" (一文字ずつストリーミング)
```

**3. UserAgent の作成**

Agent と繰り返し対話する必要がある場合は、`UserAgent` を作成できます。これにより、会話のための一貫したインターフェースが提供されます。

**例**
```typescript
import { AIGNE } from '@aigne/core';
import { CalculatorAgent } from './agents/calculator.agent.js';

const aigne = new AIGNE();
const calculator = new CalculatorAgent();
aigne.addAgent(calculator);

// 電卓用の UserAgent を作成
const user = aigne.invoke(calculator);

// 複数回呼び出す
const result1 = await user.invoke({ operation: 'add', a: 5, b: 3 });
console.log(result1.result); // 8

const result2 = await user.invoke({ operation: 'subtract', a: 10, b: 4 });
console.log(result2.result); // 6
```

#### addAgent()

`AIGNE` インスタンスが作成された後、動的に1つ以上の Agent を追加します。追加されると、Agent はインスタンスにアタッチされ、システムに参加できます。

```typescript
const aigne = new AIGNE();
const agent1 = new MyAgent1();
const agent2 = new MyAgent2();

aigne.addAgent(agent1, agent2);
```

#### publish() / subscribe()

`AIGNE` は、publish-subscribe モデルを使用して、Agent 間の疎結合なイベント駆動型コミュニケーションのためのメッセージキューを提供します。

**例**
```typescript
import { AIGNE } from '@aigne/core';

const aigne = new AIGNE();

// サブスクライバー: トピック上のメッセージをリッスン
aigne.subscribe('user.updated', ({ message }) => {
  console.log(`Received user update: ${message.userName}`);
});

// async/await を使用して単一メッセージを待つ別のサブスクライバー
async function waitForUpdate() {
  const { message } = await aigne.subscribe('user.updated');
  console.log(`Async handler received: ${message.userName}`);
}
waitForUpdate();

// パブリッシャー: トピックにメッセージをブロードキャスト
aigne.publish('user.updated', {
  userName: 'JaneDoe',
  status: 'active',
});
```

#### shutdown()

`AIGNE` インスタンスを正常にシャットダウンし、すべての Agent とスキルがリソースを適切にクリーンアップすることを保証します。これはリソースリークを防ぐために重要です。

**例**
```typescript
const aigne = new AIGNE();
// ... Agent を追加して操作

// 完了したらシャットダウン
await aigne.shutdown();
```

`AIGNE` クラスは `Symbol.asyncDispose` メソッドもサポートしており、`using` ステートメントと組み合わせて自動的なクリーンアップが可能です。

```typescript
import { AIGNE } from '@aigne/core';

async function myApp() {
  await using aigne = new AIGNE();
  // ... このブロックの終わりに aigne は自動的にシャットダウンされます
}
```