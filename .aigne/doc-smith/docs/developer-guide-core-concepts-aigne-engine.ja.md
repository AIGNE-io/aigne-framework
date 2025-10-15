# AIGNE

`AIGNE` クラスは、フレームワークの中心的な実行エンジンです。複数の Agent を統合して複雑な AI アプリケーションを構築し、Agent のインタラクション、メッセージパッシング、および全体的な実行フローの主要な調整ポイントとして機能します。

このガイドでは、`AIGNE` エンジンのインスタンス化と設定方法、`invoke` メソッドを使用した Agent の実行、およびアプリケーションのライフサイクル管理について説明します。

```d2
direction: down

Developer: {
  shape: c4-person
}

Instantiation: {
  label: "インスタンス化メソッド"
  shape: rectangle
  style.stroke-dash: 2

  Constructor: {
    label: "`new AIGNE()`\n(プログラムによる)"
  }

  Load-Method: {
    label: "`AIGNE.load()`\n(ディレクトリから)"
  }
}

AIGNE-Engine: {
  label: "AIGNE"
  shape: rectangle

  Core: {
    label: "主要な責務"
    shape: rectangle
    style.stroke-dash: 4

    Agent-Management: {
      label: "Agent とスキルの\n管理"
    }
    Model-Configuration: {
      label: "グローバルモデル\n設定"
    }
    Execution-Context: {
      label: "実行コンテキスト"
    }
  }
}

Invocation-Results: {
  label: "`invoke()` の結果"
  shape: rectangle
  style.stroke-dash: 2

  Standard-Response: {
    label: "標準レスポンス\n(Promise)"
  }

  Streaming-Response: {
    label: "ストリーミングレスポンス\n(AgentResponseStream)"
  }

  User-Agent: {
    label: "ステートフル UserAgent\n(コンテキストを維持)"
  }
}

Developer -> Instantiation: "Initializes via"
Instantiation.Constructor -> AIGNE-Engine
Instantiation.Load-Method -> AIGNE-Engine

Developer -> AIGNE-Engine: "Calls `invoke()`"

AIGNE-Engine -> Invocation-Results.Standard-Response: "Returns"
AIGNE-Engine -> Invocation-Results.Streaming-Response: "Returns"
AIGNE-Engine -> Invocation-Results.User-Agent: "Returns"

Invocation-Results -> Developer: "Receives result"

```

## 概要

AIGNE は、Agent アプリケーション全体のためのコンテナとして機能します。その主な責務は以下の通りです。

-   **Agent 管理**: 登録されたすべての Agent とスキルのライフサイクルを管理します。
-   **モデル設定**: チャットモデルと画像モデルに対するグローバルなデフォルト設定を提供します。これは個々の Agent によって継承または上書きできます。
-   **実行コンテキスト**: 各呼び出しに対して分離されたコンテキストを作成・管理し、同時操作が互いに干渉しないようにします。
-   **ライフサイクル制御**: アプリケーションを正常に開始および停止するメソッドを提供し、すべてのリソースが適切に処理されることを保証します。

## インスタンス化

`AIGNE` インスタンスを作成するには、主に2つの方法があります。コンストラクタを使用してプログラムによって作成する方法と、ディレクトリから設定を読み込む方法です。

### コンストラクタの使用

最も直接的な方法は、オプションオブジェクトを渡して `AIGNE` コンストラクタを使用することです。このアプローチは、設定がコード内で動的に管理されるアプリケーションに最適です。

```typescript AIGNE のインスタンス化 icon=logos:typescript
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  name: "MyFirstAIGNEApp",
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});
```

### 設定ファイルからの読み込み

より複雑なプロジェクトでは、`aigne.yaml` ファイルや他の Agent 定義を含むディレクトリにアプリケーション構造を定義することがベストプラクティスです。静的メソッド `AIGNE.load()` はこのディレクトリを読み込み、完全に設定されたインスタンスを構築します。これにより、ロジックから設定を分離することが促進されます。

```typescript ディレクトリから AIGNE を読み込む icon=logos:typescript
import { AIGNE } from "@aigne/core";
import { join } from "node:path";

const configPath = join(process.cwd(), "my-aigne-project");
const aigne = await AIGNE.load(configPath);
```

## 設定オプション

`AIGNE` コンストラクタは、その動作を制御するために `AIGNEOptions` オブジェクトを受け入れます。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="AIGNE インスタンスの一意の名前。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="インスタンスの目的の簡単な説明。"></x-field>
  <x-field data-name="rootDir" data-type="string" data-required="false" data-desc="Agent とスキルの相対パスを解決するためのルートディレクトリ。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false">
    <x-field-desc markdown>独自のモデルを指定しないすべての Agent に対するグローバルなデフォルトチャットモデル。詳細は [モデル](./developer-guide-core-concepts-models.md) を参照してください。</x-field-desc>
  </x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="画像生成タスク用のグローバルなデフォルト画像モデル。"></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="初期化時にエンジンに登録する Agent インスタンスの配列。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="他の Agent が利用できるようにするスキル Agent の配列。"></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="すべての呼び出しに適用される、タイムアウトや最大トークン数などの実行制限。"></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="実行トレースを監視およびロギングするためのオブザーバーインスタンス。"></x-field>
</x-field-group>

## Agent とライフサイクル管理

インスタンスが作成されたら、Agent を管理し、アプリケーションのライフサイクルを制御できます。

### Agent の追加

Agent はコンストラクタで提供できますが、`addAgent` メソッドを使用して動的に追加することもできます。各 Agent は AIGNE インスタンスにアタッチされ、グローバルモデルのような共有リソースへのアクセス権を得ます。

```typescript Agent の動的追加 icon=logos:typescript
import { AIAgent } from "@aigne/core";
import { AIGNE } from "@aigne/core";

// 'aigne' が既存の AIGNE インスタンスであると仮定
const aigne = new AIGNE();

const myAgent = new AIAgent({
  instructions: "You are a helpful assistant.",
});

aigne.addAgent(myAgent);
```

### シャットダウン

クリーンな終了と適切なリソースのクリーンアップを確実にするには、`shutdown` メソッドを呼び出します。これは、リソースリークを防ぐために長時間実行されるアプリケーションにとって重要です。エンジンはまた、`SIGINT` のようなプロセスの終了シグナルも自動的に処理します。

```typescript 正常なシャットダウン icon=logos:typescript
// 'aigne' が既存の AIGNE インスタンスであると仮定
await aigne.shutdown();
```

## Agent の呼び出し

`invoke` メソッドは、Agent を実行するための主要なエントリーポイントです。これは、単純なリクエスト-レスポンスからリアルタイムストリーミングまで、いくつかのパターンをサポートするオーバーロードされたメソッドです。

### 標準的な呼び出し

最も一般的な使用例は、Agent と入力メッセージを提供することです。これは、Agent の最終的な出力で解決される Promise を返します。

```typescript 標準的な Agent の呼び出し icon=logos:typescript
// 'aigne' と 'myAgent' が設定済みであると仮定
const result = await aigne.invoke(myAgent, {
  message: "What is the AIGNE Framework?",
});

console.log(result.message);
// 期待される出力: フレームワークに関する説明的な回答。
```

### ストリーミングレスポンス

チャットボットのような対話型アプリケーションでは、ストリーミングを有効にして応答をインクリメンタルに受信できます。オプションで `streaming: true` を設定すると、`AgentResponseStream` が返されます。その後、ストリームを反復処理して、データチャンクが到着するたびに処理できます。

```typescript Agent レスポンスのストリーミング icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";

// 'aigne' と 'myAgent' が設定済みであると仮定
const stream = await aigne.invoke(
  myAgent,
  { message: "Tell me a short story." },
  { streaming: true }
);

let fullResponse = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const textDelta = chunk.delta.text?.message ?? "";
    fullResponse += textDelta;
    process.stdout.write(textDelta);
  }
}

console.log("\n--- End of Story ---");
```

### User Agent の作成

メッセージなしで Agent を呼び出すと、`UserAgent` が作成されます。これは、複数の呼び出しにわたって会話のコンテキストを維持するステートフルなラッパーであり、対話型の体験を構築するのに理想的です。

```typescript ステートフルな UserAgent の作成 icon=logos:typescript
// 'aigne' と 'myAgent' が設定済みであると仮定

// コンテキストを維持するために UserAgent を作成
const userAgent = aigne.invoke(myAgent);

// 最初のインタラクション
const response1 = await userAgent.invoke({ message: "My name is Bob." });
console.log(response1.message); // 例: 「はじめまして、ボブ！」

// 2回目のインタラクションではコンテキストが維持される
const response2 = await userAgent.invoke({ message: "What is my name?" });
console.log(response2.message); // 例: 「あなたの名前はボブです。」
```

`invoke` メソッドは、マルチ Agent チームで最終的にアクティブになった Agent を返すなど、高度なシナリオのための追加のオーバーロードを提供します。シグネチャの完全なリストについては、API リファレンスを参照してください。

---

`AIGNE` エンジンについて明確に理解できたので、次はアプリケーションの構成要素であるさまざまな種類の [Agent](./developer-guide-core-concepts-agents.md) を探る準備ができました。