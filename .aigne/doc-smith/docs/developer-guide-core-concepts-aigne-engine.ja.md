このドキュメントでは、AIGNE フレームワークの中心的なオーケストレーターである `AIGNE` クラスについて詳しく解説します。`AIGNE` クラスを初期化、設定、使用して、Agent を管理し、メッセージングを処理し、複雑な AI ワークフローを実行する方法を学びます。

### システムアーキテクチャ

`AIGNE` クラスがより広範なエコシステムの中でどのように位置づけられるかを理解するために、そのコアコンポーネントとそれらの相互作用を視覚化してみましょう。`AIGNE` クラスは中央ハブとして機能し、Agent、スキル、コミュニケーションチャネルを管理します。

このドキュメントでは、AIGNE フレームワークの中心的なオーケストレーターである `AIGNE` クラスについて詳しく解説します。`AIGNE` クラスを初期化、設定、使用して、Agent を管理し、メッセージングを処理し、複雑な AI ワークフローを実行する方法を学びます。

### システムアーキテクチャ

`AIGNE` クラスがより広範なエコシステムの中でどのように位置づけられるかを理解するために、そのコアコンポーネントとそれらの相互作用を視覚化してみましょう。`AIGNE` クラスは中央ハブとして機能し、Agent、スキル、コミュニケーションチャネルを管理します。

```d2
direction: down

AIGNE-Ecosystem: {
  label: "AIGNE システムアーキテクチャ"
  shape: rectangle

  AIGNE-Class: {
    label: "AIGNE クラス\n(オーケストレーター)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Agents: {
    label: "Agent"
    shape: rectangle
    Agent-1: "Agent 1"
    Agent-2: "Agent 2"
    Agent-N: "..."
  }

  Skills: {
    label: "スキル"
    shape: rectangle
    Skill-A: "Skill A"
    Skill-B: "Skill B"
  }

  Communication-Channels: {
    label: "コミュニケーションチャネル"
    shape: rectangle
    Messaging: {}
    API: {}
  }
}

AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Agents: "管理"
AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Skills: "利用"
AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Communication-Channels: "処理"

```

## 初期化と設定

`AIGNE` クラスは、直接インスタンス化するか、設定ファイルからロードすることができます。これにより、プログラムによる設定と宣言的な設定の両方に対応できる柔軟性が提供されます。

### コンストラクター

コンストラクターを使用すると、指定した設定で `AIGNE` インスタンスを作成できます。

**パラメータ**

<x-field-group>
  <x-field data-name="options" data-type="AIGNEOptions" data-required="false" data-desc="AIGNE インスタンスの設定オプション。"></x-field>
</x-field-group>

**`AIGNEOptions`**

<x-field-group>
  <x-field data-name="rootDir" data-type="string" data-required="false" data-desc="Agent とスキルの相対パスを解決するためのルートディレクトリ。"></x-field>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="AIGNE インスタンスの名前。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="AIGNE インスタンスの説明。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="モデルが指定されていない Agent のためのグローバルチャットモデル。"></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="画像処理タスク用の画像モデル。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="AIGNE インスタンスで使用されるスキルのリスト。"></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="AIGNE インスタンスで使用される Agent のリスト。"></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="タイムアウトやトークン数など、AIGNE インスタンスの使用制限。"></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="AIGNE インスタンスを監視するためのオブザーバー。"></x-field>
</x-field-group>

**例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

const travelAgent = new AIAgent({
  name: 'TravelAgent',
  description: 'An agent that helps with travel planning.',
  model: yourChatModel, // yourChatModel が ChatModel のインスタンスであると仮定
});

const aigne = new AIGNE({
  name: 'MyAIGNE',
  description: 'A simple AIGNE instance.',
  agents: [travelAgent],
});

console.log('AIGNE instance created:', aigne.name);
```

### `load()`

静的メソッド `load` は、`aigne.yaml` ファイルと Agent 定義を含むディレクトリから `AIGNE` システムを初期化する便利な方法を提供します。

**パラメータ**

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="true" data-desc="aigne.yaml ファイルを含むディレクトリへのパス。"></x-field>
  <x-field data-name="options" data-type="Omit<AIGNEOptions, keyof LoadOptions> & LoadOptions" data-required="false" data-desc="ロードされた設定を上書きするためのオプション。"></x-field>
</x-field-group>

**戻り値**

<x-field data-name="Promise<AIGNE>" data-type="Promise" data-desc="設定済みの Agent とスキルを持つ、完全に初期化された AIGNE インスタンス。"></x-field>

**例**

```typescript
import { AIGNE } from '@aigne/core';

async function loadAIGNE() {
  try {
    const aigne = await AIGNE.load('./path/to/your/aigne/config');
    console.log('AIGNE instance loaded:', aigne.name);
  } catch (error) {
    console.error('Error loading AIGNE instance:', error);
  }
}

loadAIGNE();
```

## コアコンポーネント

`AIGNE` クラスは、強力な AI システムを構築するために連携して動作する、いくつかの主要なコンポーネントで構成されています。

### `agents`

`agents` プロパティは、`AIGNE` インスタンスによって管理されるプライマリ Agent のコレクションです。Agent 名によるインデックスアクセスを提供します。

<x-field data-name="agents" data-type="AccessorArray<Agent>" data-desc="プライマリ Agent のコレクション。"></x-field>

### `skills`

`skills` プロパティは、`AIGNE` インスタンスで利用可能なスキル Agent のコレクションです。スキル名によるインデックスアクセスを提供します。

<x-field data-name="skills" data-type="AccessorArray<Agent>" data-desc="スキル Agent のコレクション。"></x-field>

### `model`

`model` プロパティは、独自のモデルを指定しないすべての Agent に使用されるグローバルチャットモデルです。

<x-field data-name="model" data-type="ChatModel" data-desc="グローバルチャットモデル。"></x-field>

## Agent 管理

`AIGNE` クラスは、システム内の Agent を管理するためのメソッドを提供します。

### `addAgent()`

`addAgent` メソッドを使用すると、1 つ以上の Agent を `AIGNE` インスタンスに追加できます。各 Agent は `AIGNE` インスタンスにアタッチされ、そのリソースにアクセスできるようになります。

**パラメータ**

<x-field-group>
  <x-field data-name="...agents" data-type="Agent[]" data-required="true" data-desc="追加する 1 つ以上の Agent インスタンス。"></x-field>
</x-field-group>

**例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

const aigne = new AIGNE();

const weatherAgent = new AIAgent({
  name: 'WeatherAgent',
  description: 'An agent that provides weather forecasts.',
  model: yourChatModel, // yourChatModel が ChatModel のインスタンスであると仮定
});

aigne.addAgent(weatherAgent);
console.log('Agent added:', aigne.agents[0].name);
```

## 呼び出し

`invoke` メソッドは、Agent と対話するための主要な方法です。さまざまな呼び出しパターンをサポートするために、いくつかのオーバーロードがあります。

### `invoke(agent)`

このオーバーロードは、繰り返し呼び出しを行うために Agent をラップした `UserAgent` を作成します。

**パラメータ**

<x-field-group>
  <x-field data-name="agent" data-type="Agent<I, O>" data-required="true" data-desc="ラップされるターゲット Agent。"></x-field>
</x-field-group>

**戻り値**

<x-field data-name="UserAgent<I, O>" data-type="UserAgent" data-desc="User Agent インスタンス。"></x-field>

### `invoke(agent, message, options)`

これは、Agent にメッセージを付けて呼び出し、レスポンスを受け取るための標準的な方法です。

**パラメータ**

<x-field-group>
  <x-field data-name="agent" data-type="Agent<I, O>" data-required="true" data-desc="呼び出すターゲット Agent。"></x-field>
  <x-field data-name="message" data-type="I & Message" data-required="true" data-desc="Agent に送信する入力メッセージ。"></x-field>
  <x-field data-name="options" data-type="InvokeOptions<U>" data-required="false" data-desc="呼び出しのためのオプションの設定パラメータ。"></x-field>
</x-field-group>

**戻り値**

<x-field data-name="Promise<O>" data-type="Promise" data-desc="Agent の完全なレスポンスに解決される Promise。"></x-field>

**例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

async function invokeAgent() {
  const travelAgent = new AIAgent({
    name: 'TravelAgent',
    description: 'An agent that helps with travel planning.',
    model: yourChatModel, // yourChatModel が ChatModel のインスタンスであると仮定
  });

  const aigne = new AIGNE({
    agents: [travelAgent],
  });

  try {
    const response = await aigne.invoke(travelAgent, { content: 'Plan a trip to Paris.' });
    console.log('Agent response:', response.content);
  } catch (error) {
    console.error('Error invoking agent:', error);
  }
}

invokeAgent();
```

### ストリーミング

`invoke` メソッドは、`streaming` オプションを `true` に設定することで、ストリーミングレスポンスもサポートします。

**例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

async function invokeStreamingAgent() {
  const travelAgent = new AIAgent({
    name: 'TravelAgent',
    description: 'An agent that helps with travel planning.',
    model: yourChatModel, // yourChatModel が ChatModel のインスタンスであると仮定
  });

  const aigne = new AIGNE({
    agents: [travelAgent],
  });

  try {
    const stream = await aigne.invoke(travelAgent, { content: 'Plan a trip to Paris.' }, { streaming: true });
    for await (const chunk of stream) {
      console.log('Stream chunk:', chunk.content);
    }
  } catch (error) {
    console.error('Error invoking agent:', error);
  }
}

invokeStreamingAgent();
```

## メッセージング

`AIGNE` クラスは、Agent 間の通信のためのメッセージキューを提供します。

### `publish()`

`publish` メソッドは、指定されたトピックのすべてのサブスクライバーにメッセージをブロードキャストします。

**パラメータ**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="メッセージを公開するトピック。"></x-field>
  <x-field data-name="payload" data-type="Omit<MessagePayload, 'context'> | Message" data-required="true" data-desc="メッセージのペイロード。"></x-field>
  <x-field data-name="options" data-type="InvokeOptions<U>" data-required="false" data-desc="オプションの設定パラメータ。"></x-field>
</x-field-group>

### `subscribe()`

`subscribe` メソッドを使用すると、特定のトピックのメッセージをリッスンできます。リスナーコールバックと共に使用するか、次のメッセージで解決される Promise として使用できます。

**パラメータ**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="サブスクライブするトピック。"></x-field>
  <x-field data-name="listener" data-type="MessageQueueListener" data-required="false" data-desc="受信メッセージを処理するためのオプションのコールバック関数。"></x-field>
</x-field-group>

**戻り値**

<x-field data-name="Unsubscribe | Promise<MessagePayload>" data-type="Function | Promise" data-desc="リスナーが提供されている場合はアンサブスクライブ関数、そうでない場合は次のメッセージで解決される Promise。"></x-field>

### `unsubscribe()`

`unsubscribe` メソッドは、以前に登録されたリスナーをトピックから削除します。

**パラメータ**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="アンサブスクライブするトピック。"></x-field>
  <x-field data-name="listener" data-type="MessageQueueListener" data-required="true" data-desc="削除するリスナー関数。"></x-field>
</x-field-group>

**例**

```typescript
import { AIGNE } from '@aigne/core';

const aigne = new AIGNE();

const listener = (payload) => {
  console.log('Received message:', payload.content);
};

aigne.subscribe('news', listener);
aigne.publish('news', { content: 'AIGNE version 2.0 released!' });
aigne.unsubscribe('news', listener);
```

## ライフサイクル管理

`AIGNE` クラスは、インスタンスとそのすべての Agent およびスキルを正常に終了させるための `shutdown` メソッドを提供します。

### `shutdown()`

`shutdown` メソッドは、終了前にリソースが適切にクリーンアップされることを保証します。

**戻り値**

<x-field data-name="Promise<void>" data-type="Promise" data-desc="シャットダウンが完了したときに解決される Promise。"></x-field>

**例**

```typescript
import { AIGNE } from '@aigne/core';

async function shutdownAIGNE() {
  const aigne = new AIGNE();
  // ... AIGNE のロジック ...
  await aigne.shutdown();
  console.log('AIGNE instance shut down.');
}

shutdownAIGNE();
```