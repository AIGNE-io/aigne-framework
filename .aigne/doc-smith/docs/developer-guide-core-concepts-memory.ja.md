# メモリ管理

Memory モジュールは、Agent が情報を永続化および想起できるようにするための堅牢なフレームワークを提供し、ステートフルでコンテキストを認識するシステムを構築します。これにより、Agent は対話の履歴を維持し、過去のイベントから学習し、より多くの情報に基づいた意思決定を行うことができます。

メモリシステムの中心にあるのは `MemoryAgent` であり、すべてのメモリ関連操作の中心的コーディネーターとして機能します。実際の書き込みと読み取りのタスクは、`MemoryRecorder` と `MemoryRetriever` という 2 つの特化したコンポーネントに委任されます。この関心の分離により、柔軟でスケーラブルなメモリソリューションが可能になります。

- **MemoryAgent**: メモリ操作の主要なエントリーポイント。記録および検索プロセスを調整します。
- **MemoryRecorder**: メモリを永続的なバックエンド（データベース、ファイルシステム、インメモリストアなど）に書き込むか保存する役割を担う Agent スキル。
- **MemoryRetriever**: ストレージバックエンドからメモリをクエリおよび取得する役割を担う Agent スキル。

このガイドでは、各コンポーネントについて順を追って説明し、それぞれの役割を解説し、Agent システムでそれらを実装して使用する方法の実用的な例を提供します。

## アーキテクチャ概要

以下の図は、主要なメモリコンポーネント間の関係を示しています。アプリケーションロジックは `MemoryAgent` と対話し、`MemoryAgent` は `MemoryRecorder` と `MemoryRetriever` スキルを使用して永続ストレージバックエンドと対話します。

```d2
direction: down

Agent-System: {
  label: "Agent システム\n(アプリケーション)"
  shape: rectangle
}

Memory-Module: {
  label: "Memory モジュール"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MemoryAgent: {
    label: "MemoryAgent\n(コーディネーター)"
  }

  MemoryRecorder: {
    label: "MemoryRecorder\n(Agent スキル)"
  }

  MemoryRetriever: {
    label: "MemoryRetriever\n(Agent スキル)"
  }
}

Persistent-Backend: {
  label: "永続バックエンド\n(DB、ファイルシステムなど)"
  shape: cylinder
}

Agent-System -> Memory-Module.MemoryAgent: "1. record() / retrieve()"

Memory-Module.MemoryAgent -> Memory-Module.MemoryRecorder: "2a. 書き込みを委任"
Memory-Module.MemoryRecorder -> Persistent-Backend: "3a. メモリを保存"

Memory-Module.MemoryAgent -> Memory-Module.MemoryRetriever: "2b. 読み取りを委任"
Memory-Module.MemoryRetriever -> Persistent-Backend: "3b. メモリをクエリ"
Persistent-Backend -> Memory-Module.MemoryRetriever: "4b. メモリを返す"
```

## コアコンポーネント

### MemoryAgent

`MemoryAgent` は、メモリの管理、保存、検索のための主要なインターフェースとして機能する特化した Agent です。他の Agent のようにメッセージ処理のために直接呼び出されるようには設計されておらず、代わりにシステムのメモリと対話するためのコアメソッド `record()` および `retrieve()` を提供します。

`MemoryAgent` を構成するには、`recorder` と `retriever` を提供します。これらは、事前に構築されたインスタンスでも、特定のストレージロジックを定義するカスタム関数でもかまいません。

**主な機能:**

- **一元管理**: メモリ操作の単一の窓口として機能します。
- **委任**: ストレージと検索のロジックを、専用の `MemoryRecorder` および `MemoryRetriever` Agent にオフロードします。
- **自動記録**: `autoUpdate` を設定することで、観測したすべてのメッセージを自動的に記録し、シームレスな対話履歴を作成できます。

**例: MemoryAgent の作成**

```typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@core/memory";
import { Agent, type AgentInvokeOptions, type Message } from "@core/agents";

// メモリの記録と検索のためのカスタムロジックを定義
const myRecorder = new MemoryRecorder({
  process: async (input, options) => {
    // データベースにメモリを保存するカスタムロジック
    console.log("Recording memories:", input.content);
    // ... 実装 ...
    return { memories: [] }; // 作成されたメモリを返す
  },
});

const myRetriever = new MemoryRetriever({
  process: async (input, options) => {
    // データベースからメモリを取得するカスタムロジック
    console.log("Retrieving memories with search:", input.search);
    // ... 実装 ...
    return { memories: [] }; // 見つかったメモリを返す
  },
});

// MemoryAgent を作成
const memoryAgent = new MemoryAgent({
  recorder: myRecorder,
  retriever: myRetriever,
  autoUpdate: true, // 購読しているトピックからのメッセージを自動的に記録
  subscribeTopic: "user-input",
});
```

### MemoryRecorder

`MemoryRecorder` は、メモリの保存を担当する抽象 Agent クラスです。これを使用するには、メモリデータをどのように、どこに永続化するかのロジックを含む `process` メソッドの具体的な実装を提供する必要があります。この設計により、単純なインメモリ配列から高度なベクトルデータベースまで、あらゆるストレージバックエンドに接続できます。

**入力 (`MemoryRecorderInput`)**

`process` 関数は、`content` 配列を含む入力オブジェクトを受け取ります。配列の各項目は保存されるべき情報の断片を表し、`input` メッセージ、`output` メッセージ、および `source` Agent の ID を含むことができます。

```typescript
interface MemoryRecorderInput extends Message {
  content: {
    input?: Message;
    output?: Message;
    source?: string;
  }[];
}
```

**出力 (`MemoryRecorderOutput`)**

この関数は、正常に作成された `memories` の配列を含むオブジェクトに解決されるプロミスを返す必要があります。

```typescript
interface MemoryRecorderOutput extends Message {
  memories: Memory[];
}
```

**例: シンプルなインメモリレコーダーの実装**

ここでは、ローカル配列にメモリを保存するシンプルなレコーダーを作成する方法を示します。

```typescript
import {
  MemoryRecorder,
  type MemoryRecorderInput,
  type MemoryRecorderOutput,
  type Memory,
  newMemoryId,
} from "@core/memory";
import { type AgentInvokeOptions, type AgentProcessResult } from "@core/agents";

// シンプルなインメモリ配列をデータベースとして使用
const memoryDB: Memory[] = [];

const inMemoryRecorder = new MemoryRecorder({
  process: async (
    input: MemoryRecorderInput,
    options: AgentInvokeOptions
  ): Promise<AgentProcessResult<MemoryRecorderOutput>> => {
    const newMemories: Memory[] = input.content.map((item) => ({
      id: newMemoryId(),
      content: item,
      createdAt: new Date().toISOString(),
    }));

    // 新しいメモリを「データベース」に追加
    memoryDB.push(...newMemories);
    console.log("Current memory count:", memoryDB.length);

    return { memories: newMemories };
  },
});
```

### MemoryRetriever

`MemoryRetriever` はレコーダーの対となる存在です。これは、ストレージからメモリを取得する役割を担う抽象 Agent クラスです。レコーダーと同様に、検索ロジックを定義するために `process` メソッドのカスタム実装が必要です。

**入力 (`MemoryRetrieverInput`)**

`process` 関数は、`search` クエリと結果の数を制御するための `limit` を含むことができる入力オブジェクトを受け取ります。検索の実行方法（キーワードマッチング、ベクトル類似性など）は実装によって決まります。

```typescript
interface MemoryRetrieverInput extends Message {
  limit?: number;
  search?: string | Message;
}
```

**出力 (`MemoryRetrieverOutput`)**

この関数は、クエリに一致する `memories` の配列を含むオブジェクトに解決されるプロミスを返す必要があります。

```typescript
interface MemoryRetrieverOutput extends Message {
  memories: Memory[];
}
```

**例: シンプルなインメモリリトリーバーの実装**

このリトリーバーは、上記の `inMemoryRecorder` の例と連携し、ローカル配列で一致するコンテンツを検索します。

```typescript
import {
  MemoryRetriever,
  type MemoryRetrieverInput,
  type MemoryRetrieverOutput,
  type Memory,
} from "@core/memory";
import { type AgentInvokeOptions, type AgentProcessResult } from "@core/agents";

// memoryDB はレコーダーが使用するのと同じ配列であると仮定
declare const memoryDB: Memory[];

const inMemoryRetriever = new MemoryRetriever({
  process: async (
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions
  ): Promise<AgentProcessResult<MemoryRetrieverOutput>> => {
    let results: Memory[] = [...memoryDB];

    // 検索クエリに基づいて結果をフィルタリング
    if (input.search && typeof input.search === "string") {
      const searchTerm = input.search.toLowerCase();
      results = results.filter((mem) =>
        JSON.stringify(mem.content).toLowerCase().includes(searchTerm)
      );
    }

    // limit を適用
    if (input.limit) {
      results = results.slice(-input.limit); // 最新の項目を取得
    }

    return { memories: results };
  },
});
```

## すべてをまとめる

では、これらのコンポーネントを組み合わせて、完全に機能するメモリシステムを作成しましょう。カスタムのインメモリレコーダーとリトリーバーを使用して `MemoryAgent` をインスタンス化し、それを使用して情報を記録および検索します。

```typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@core/memory";
import { Aigne, type Context } from "@core/aigne";

// --- inMemoryRecorder と inMemoryRetriever は上記で定義されているものと仮定 ---

// 1. MemoryAgent を初期化
const memoryAgent = new MemoryAgent({
  recorder: inMemoryRecorder,
  retriever: inMemoryRetriever,
});

// 2. Agent を実行するためのコンテキストを作成
const context = new Aigne().createContext();

// 3. 新しいメモリを記録
async function runMemoryExample(context: Context) {
  console.log("Recording a new memory...");
  await memoryAgent.record(
    {
      content: [
        {
          input: { text: "What is the capital of France?" },
          output: { text: "The capital of France is Paris." },
          source: "GeographyAgent",
        },
      ],
    },
    context
  );

  // 4. メモリを検索
  console.log("\nRetrieving memories about 'France'...");
  const retrieved = await memoryAgent.retrieve({ search: "France" }, context);

  console.log("Found memories:", retrieved.memories);
}

runMemoryExample(context);

/**
 * 期待される出力:
 *
 * Recording a new memory...
 * Current memory count: 1
 *
 * Retrieving memories about 'France'...
 * Found memories: [
 *   {
 *     id: '...',
 *     content: {
 *       input: { text: 'What is the capital of France?' },
 *       output: { text: 'The capital of France is Paris.' },
 *       source: 'GeographyAgent'
 *     },
 *     createdAt: '...'
 *   }
 * ]
 */
```

この完全な例は、カスタムストレージロジックの定義、それを `MemoryAgent` に組み込む、そしてその Agent を使用してシステムのメモリを管理するという、エンドツーエンドのフローを示しています。