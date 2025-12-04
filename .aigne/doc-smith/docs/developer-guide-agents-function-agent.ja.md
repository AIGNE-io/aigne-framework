# Function Agent

`FunctionAgent` は、既存の TypeScript または JavaScript 関数をカプセル化し、AIGNE フレームワーク内でファーストクラスの Agent に昇格させるための簡単な方法を提供します。これにより、カスタムビジネスロジック、外部 API との連携、または任意のコードを Agent ワークフローにシームレスに統合でき、広範なボイラープレートの必要性をなくします。

関数をラップすることにより、`FunctionAgent` は Agent エコシステムに完全に参加できます。他の Agent と同様に呼び出すことができ、`AIAgent` または `TeamAgent` 内のスキルとして組み込むことができ、AIGNE のコンテキストやライフサイクルフックと対話できます。これにより、従来のプログラムロジックと AI 駆動プロセスを橋渡しするための不可欠なコンポーネントとして位置づけられます。

この図は、ソース関数の提供から最終的な出力の受信まで、`FunctionAgent` の作成と呼び出しのフローを示しています。

<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->
![Function Agent](assets/diagram/function-agent-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 主な概念

`FunctionAgent` は、`Agent` クラスの特殊な実装であり、そのコア処理ロジックをユーザー提供の関数に委任します。この Agent の主要なコンストラクタは静的メソッド `FunctionAgent.from()` であり、これによりインスタンス化が効率化されます。

`FunctionAgent` は 2 つの方法で作成できます:

1.  **関数から直接作成:** 同期または非同期関数を `FunctionAgent.from()` に渡します。Agent は関数定義から名前などのプロパティを推測します。
2.  **設定オブジェクトから作成:** より明示的な制御のために、`process` 関数と、`name`、`description`、`inputSchema`、`outputSchema` のような他の標準的な Agent 設定を指定するオプションオブジェクトを提供します。

この設計は、迅速なアドホックな統合と、堅牢で明確に定義された Agent コンポーネントの開発の両方に柔軟性を提供します。

## Function Agent の作成

`FunctionAgent` を作成する標準的な方法は、関数または設定オブジェクトのいずれかを受け入れる `FunctionAgent.from()` ファクトリメソッドを使用することです。

### 簡単な関数から作成

任意の標準関数を直接ラップできます。AIGNE フレームワークは、関数の名前を Agent の名前として使用します。このアプローチは、シンプルで自己完結型の操作に最適です。

```javascript 簡単な関数のラップ icon=logos:javascript
import { FunctionAgent } from "@aigne/core";

// 簡単な同期関数を定義する
function add({ a, b }) {
  return { result: a + b };
}

// 関数を Agent にラップする
const addAgent = FunctionAgent.from(add);

console.log(addAgent.name); // 出力: 'add'
```

この関数は、Agent の入力オブジェクトを最初の引数として受け取り、Agent の出力を構成するオブジェクトを返すことが期待されます。

### 完全な設定を使用

より複雑な統合のためには、完全な設定オブジェクトを提供する必要があります。これにより、検証のための入出力スキーマの定義、説明の追加、カスタム名の割り当てが可能になります。この方法は、堅牢で再利用可能な Agent を作成するために推奨されます。

```javascript 設定を持つ Function Agent icon=logos:javascript
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const fetchUserAgent = FunctionAgent.from({
  name: "FetchUser",
  description: "プレースホルダー API からユーザーデータを取得します。",
  inputSchema: z.object({
    userId: z.number().describe("取得するユーザーの ID。"),
  }),
  outputSchema: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
  process: async ({ userId }) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!response.ok) {
      throw new Error("ユーザーデータの取得に失敗しました。");
    }
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
    };
  },
});
```

この例では、`zod` スキーマが定義されており、入力 `userId` が数値であること、および出力が指定された構造に準拠していることを保証します。

## Function Agent の呼び出し

作成された `FunctionAgent` は、他のすべての Agent タイプと同様に、標準の `.invoke()` メソッドを使用して呼び出されます。

```javascript Agent の呼び出し icon=logos:javascript
async function main() {
  // 前の例の簡単な 'add' Agent を使用する
  const result = await addAgent.invoke({ a: 10, b: 5 });
  console.log(result); // { result: 15 }

  // 設定済みの 'FetchUser' Agent を使用する
  const user = await fetchUserAgent.invoke({ userId: 1 });
  console.log(user); 
  // { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz' }
}

main();
```

`invoke` メソッドは、スキーマに対する入力検証（提供されている場合）、基になる関数の実行、および出力スキーマに対する結果の検証を含む実行ライフサイクルを管理します。

## 高度な使用法

### ストリーミング応答

`FunctionAgent` は、非同期ジェネレーターを使用してストリーミング応答をサポートします。`process` 関数は `AgentResponseChunk` オブジェクトを `yield` する `async function*` として定義でき、増分的なデータ送信を可能にします。

```javascript 非同期ジェネレーターによるストリーミング icon=logos:javascript
import { FunctionAgent, jsonDelta, textDelta } from "@aigne/core";
import { z } from "zod";

const streamNumbersAgent = FunctionAgent.from({
  name: "StreamNumbers",
  inputSchema: z.object({
    count: z.number().int().positive(),
  }),
  outputSchema: z.object({
    finalCount: z.number(),
    message: z.string(),
  }),
  process: async function* ({ count }) {
    for (let i = 1; i <= count; i++) {
      yield textDelta({ message: `Processing number ${i}... ` });
      await new Promise((resolve) => setTimeout(resolve, 200)); // 作業をシミュレートする
    }
    yield jsonDelta({ finalCount: count });
    yield textDelta({ message: "Done." });
  },
});

async function runStream() {
  const stream = await streamNumbersAgent.invoke({ count: 5 }, { streaming: true });
  for await (const chunk of stream) {
    console.log(chunk);
  }
}

runStream();
```

この機能は、Agent の進行状況に関するリアルタイムのフィードバックを提供する必要がある長時間実行タスクに特に役立ちます。

## 設定

`FunctionAgent` は、`FunctionAgent.from` またはそのコンストラクタに渡される設定オブジェクトを介して初期化されます。以下のパラメータはその設定に固有のものです。

<x-field-group>
  <x-field data-name="process" data-type="FunctionAgentFn" data-required="true">
    <x-field-desc markdown>Agent のロジックを実装する関数。入力メッセージと呼び出しオプションを受け取り、処理結果を返します。これは同期関数、Promise を返す非同期関数、またはストリーミング用の非同期ジェネレーターにすることができます。</x-field-desc>
  </x-field>
  <x-field data-name="name" data-type="string" data-required="false">
    <x-field-desc markdown>Agent の一意の名前で、識別とログ記録に使用されます。指定しない場合、デフォルトで `process` 関数の名前になります。</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="false">
    <x-field-desc markdown>Agent が何をするかの人間が読める説明。これはドキュメントや他の Agent がその能力を理解するのに役立ちます。</x-field-desc>
  </x-field>
  <x-field data-name="inputSchema" data-type="ZodObject" data-required="false">
    <x-field-desc markdown>入力メッセージの構造と型を検証するための Zod スキーマ。検証が失敗した場合、`process` 関数が呼び出される前に Agent はエラーをスローします。</x-field-desc>
  </x-field>
  <x-field data-name="outputSchema" data-type="ZodObject" data-required="false">
    <x-field-desc markdown>`process` 関数によって返される出力メッセージの構造と型を検証するための Zod スキーマ。検証が失敗した場合、エラーがスローされます。</x-field-desc>
  </x-field>
</x-field-group>

ベースの `AgentOptions` からの他のすべてのプロパティも利用可能です。完全なリストについては、[Agent のドキュメント](./developer-guide-core-concepts-agents.md)を参照してください。

## まとめ

`FunctionAgent` は、従来のコードを AIGNE フレームワークに統合するための多用途なツールであり、任意の JavaScript または TypeScript 関数が標準の Agent として動作できるようにする橋渡しの役割を果たします。

-   **シンプルさ:** `FunctionAgent.from()` を使用して、最小限の労力で既存の関数をラップします。
-   **統合:** 従来のビジネスロジック、計算、または外部 API 呼び出しを Agent ワークフローにシームレスに組み込みます。
-   **検証:** Zod で入出力スキーマを定義することにより、データコントラクトを強制し、信頼性を向上させます。
-   **柔軟性:** 同期関数、非同期 Promise、および非同期ジェネレーターによるストリーミングをサポートします。

`FunctionAgent` を活用することで、開発者は従来のコードの決定的で信頼性の高い性質と、AI Agent の動的な能力を組み合わせて、より強力で堅牢なアプリケーションを構築できます。Function Agent を含む複数の Agent をオーケストレーションする方法については、[Team Agent](./developer-guide-agents-team-agent.md) に関するドキュメントを参照してください。