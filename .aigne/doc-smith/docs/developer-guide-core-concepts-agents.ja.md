# Agent

`Agent` クラスは AIGNE フレームワークの礎です。これはすべての Agent のベースクラスとして機能し、入出力スキーマの定義、処理ロジックの実装、Agent システム内のインタラクション管理のための堅牢なメカニズムを提供します。

`Agent` クラスを拡張することで、単純な関数ベースのユーティリティから複雑な AI 駆動のエンティティまで、幅広い機能を持つカスタム Agent を作成できます。Agent はモジュール式で再利用可能であり、メッセージパッシングシステムを通じて相互に通信できるように設計されています。

```d2
direction: down

Input-Message: {
  label: "入力メッセージ\n(subscribeTopic から)"
  shape: oval
}

Output-Message: {
  label: "出力メッセージ\n(publishTopic へ)"
  shape: oval
}

Agent: {
  label: "Agent インスタンス"
  shape: rectangle
  style: {
    stroke-width: 3
  }

  invoke-method: {
    label: "invoke()"
    shape: rectangle
    style.fill: "#d0e0f0"
  }

  Pre-Processing: {
    label: "前処理"
    shape: rectangle
    style.stroke-dash: 2

    GuideRails-Pre: "GuideRails (事前)"
    onStart-Hook: "onStart フック"
    Input-Schema-Validation: {
      label: "入力スキーマ検証\n(Zod)"
    }
  }

  process-method: {
    label: "process()\n(カスタムコアロジック)"
    shape: rectangle
    style.fill: "#e0f0d0"

    Skills: {
      label: "スキル\n(他の Agent)"
      shape: rectangle
    }
    Memory: {
      label: "メモリ"
      shape: cylinder
    }
  }

  Post-Processing: {
    label: "後処理"
    shape: rectangle
    style.stroke-dash: 2

    Output-Schema-Validation: {
      label: "出力スキーマ検証\n(Zod)"
    }
    onSuccess-onError-Hooks: "onSuccess / onError フック"
    GuideRails-Post: "GuideRails (事後)"
    onEnd-Hook: "onEnd フック"
  }
}

FunctionAgent: {
  label: "FunctionAgent\n(簡易 Agent)"
  shape: rectangle
}

Input-Message -> Agent.invoke-method: "1. 呼び出し"

Agent.invoke-method -> Agent.Pre-Processing.GuideRails-Pre: "2. 事前検証"
Agent.Pre-Processing.GuideRails-Pre -> Agent.Pre-Processing.onStart-Hook: "3. トリガー"
Agent.Pre-Processing.onStart-Hook -> Agent.Pre-Processing.Input-Schema-Validation: "4. 入力検証"
Agent.Pre-Processing.Input-Schema-Validation -> Agent.process-method: "5. 実行"

Agent.process-method -> Agent.process-method.Skills: "委任"
Agent.process-method <-> Agent.process-method.Memory: "アクセス"

Agent.process-method -> Agent.Post-Processing.Output-Schema-Validation: "6. 出力検証"
Agent.Post-Processing.Output-Schema-Validation -> Agent.Post-Processing.onSuccess-onError-Hooks: "7. トリガー"
Agent.Post-Processing.onSuccess-onError-Hooks -> Agent.Post-Processing.GuideRails-Post: "8. 事後検証"
Agent.Post-Processing.GuideRails-Post -> Agent.Post-Processing.onEnd-Hook: "9. トリガー"
Agent.Post-Processing.onEnd-Hook -> Output-Message: "10. 結果を公開"

FunctionAgent -> Agent.process-method: "関数を提供"
```

## コアコンセプト

- **メッセージ駆動型アーキテクチャ**: Agent は発行/購読モデルで動作します。特定のトピックを購読して入力メッセージを受信し、出力を他のトピックに発行することで、Agent 間のシームレスな通信を可能にします。
- **入出力スキーマ**: Zod スキーマを使用して `inputSchema` と `outputSchema` を定義し、Agent に出入りするすべてのデータが検証され、事前定義された構造に準拠するようにできます。
- **スキル**: Agent は `skills` (他の Agent や関数) を持つことができます。これにより、より専門的な Agent にタスクを委任する複雑な Agent を作成でき、モジュール式で階層的な設計を促進します。
- **ライフサイクルフック**: Agent のライフサイクルは `hooks` (例: `onStart`、`onEnd`、`onError`) でインターセプトできます。フックは、Agent の実行のさまざまな段階で、ロギング、モニタリング、トレーシング、カスタムロジックの実装に非常に役立ちます。
- **ストリーミング応答**: Agent はストリーミング形式で応答を返すことができます。これは、チャットボットのようなリアルタイムアプリケーションに最適で、結果が生成されると同時に段階的に表示できます。
- **GuideRails**: `guideRails` は、他の Agent の実行に対するバリデーターまたはコントローラーとして機能する特殊な Agent です。入力と期待される出力を検査して、ルール、ポリシー、またはビジネスロジックを強制し、必要に応じてプロセスを中止することもできます。
- **メモリ**: Agent は `memory` を備えることができ、状態を永続化し、過去のインタラクションから情報を思い出すことで、よりコンテキストを意識した振る舞いを可能にします。

## 主なプロパティ

`Agent` クラスは、コンストラクタに渡される `AgentOptions` オブジェクトを介して設定されます。以下は、最も重要なプロパティの一部です。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `name` | `string` | Agent の一意の名前で、識別とロギングに使用されます。デフォルトはクラス名です。 |
| `description` | `string` | Agent の目的と機能に関する人間が読める形式の説明。 |
| `subscribeTopic` | `string \| string[]` | Agent が受信メッセージをリッスンするトピック。 |
| `publishTopic` | `string \| string[] \| function` | Agent が出力メッセージを送信するトピック。 |
| `inputSchema` | `ZodType` | 入力メッセージの構造を検証するための Zod スキーマ。 |
| `outputSchema` | `ZodType` | 出力メッセージの構造を検証するための Zod スキーマ。 |
| `skills` | `(Agent \| FunctionAgentFn)[]` | この Agent がサブタスクを実行するために呼び出すことができる他の Agent または関数のリスト。 |
| `memory` | `MemoryAgent \| MemoryAgent[]` | 情報を保存および取得するための 1 つ以上のメモリ Agent。 |
| `hooks` | `AgentHooks[]` | Agent のライフサイクルイベントにカスタムロジックをアタッチするためのフックオブジェクトの配列。 |
| `guideRails` | `GuideRailAgent[]` | メッセージフローを検証、変換、または制御するための GuideRail Agent のリスト。 |
| `retryOnError` | `boolean \| object` | 失敗時の自動リトライの設定。 |

## 主なメソッド

### `invoke(input, options)`

これは Agent を実行するための主要なメソッドです。`input` メッセージと `options` オブジェクトを受け取ります。`invoke` メソッドは、フックの実行、スキーマの検証、`process` メソッドの実行、エラー処理など、ライフサイクル全体を処理します。

- **通常呼び出し**: デフォルトでは、`invoke` は最終的な出力オブジェクトで解決される Promise を返します。
- **ストリーミング呼び出し**: `options.streaming` を `true` に設定すると、`invoke` は応答のチャンクが利用可能になるたびにそれらを出力する `ReadableStream` を返します。

**例: 通常呼び出し**
```typescript
const result = await agent.invoke({ query: "What is AIGNE?" });
console.log(result);
```

**例: ストリーミング呼び出し**
```typescript
const stream = await agent.invoke(
  { query: "Tell me a story." },
  { streaming: true }
);

for await (const chunk of stream) {
  // 各チャンクが到着するたびに処理する
  if (chunk.delta.text) {
    process.stdout.write(chunk.delta.text.content);
  }
}
```

### `process(input, options)`

これは**抽象メソッド**であり、カスタム Agent サブクラスで実装する必要があります。これには Agent のコアロジックが含まれます。検証済みの入力を受け取り、出力を返す責任があります。`process` メソッドは、直接オブジェクト、`ReadableStream`、`AsyncGenerator`、あるいは制御を移譲するための別の `Agent` インスタンスを返すことができます。

**例: `process` の実装**
```typescript
import { Agent, type AgentInvokeOptions, type Message } from "@aigne/core";
import { z } from "zod";

class EchoAgent extends Agent {
  constructor() {
    super({
      name: "EchoAgent",
      description: "An agent that echoes the input message.",
      inputSchema: z.object({ message: z.string() }),
      outputSchema: z.object({ response: z.string() }),
    });
  }

  async process(input: { message: string }, options: AgentInvokeOptions) {
    // Agent のコアロジック
    return { response: `You said: ${input.message}` };
  }
}
```

### `shutdown()`

このメソッドは、トピックの購読やメモリ接続など、Agent が使用するリソースをクリーンアップします。メモリリークを防ぐために、Agent が不要になったときにこのメソッドを呼び出すことが重要です。

## Agent のライフサイクルとフック

Agent の実行ライフサイクルは、フックを使用して監視および変更できる明確に定義されたプロセスです。

1.  **`onStart`**: Agent の `process` メソッドが呼び出される直前にトリガーされます。このフックを使用して、入力を変更したり、セットアップタスクを実行したりできます。
2.  **`onSkillStart` / `onSkillEnd`**: スキル (別の Agent) が呼び出される前後にトリガーされます。
3.  **`onSuccess`**: `process` メソッドが正常に完了し、出力が処理された後にトリガーされます。
4.  **`onError`**: 処理中にエラーが発生した場合にトリガーされます。ここでカスタムエラー処理やリトライロジックを実装できます。
5.  **`onEnd`**: 呼び出しが成功したか失敗したかに関わらず、呼び出しの最後にトリガーされます。これは、クリーンアップ、ロギング、メトリクスに最適です。

**例: フックの使用**
```typescript
const loggingHook = {
  onStart: async ({ agent, input }) => {
    console.log(`Agent ${agent.name} が入力で開始されました:`, input);
  },
  onEnd: async ({ agent, error }) => {
    if (error) {
      console.error(`Agent ${agent.name} が失敗しました:`, error);
    } else {
      console.log(`Agent ${agent.name} は正常に終了しました。`);
    }
  },
};

const agent = new MyAgent({
  hooks: [loggingHook],
});
```

## `FunctionAgent`

よりシンプルなユースケースのために、AIGNE は `FunctionAgent` クラスを提供しています。これにより、単一の関数から Agent を作成でき、`Agent` を拡張する新しいクラスを作成する必要がなくなります。これは、シンプルでステートレスなユーティリティ Agent を作成するのに最適です。

**例: `FunctionAgent` の作成**
```typescript
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const multiplierAgent = new FunctionAgent({
  name: "Multiplier",
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  outputSchema: z.object({ result: z.number() }),
  process: async (input) => {
    return { result: input.a * input.b };
  },
});

const result = await multiplierAgent.invoke({ a: 5, b: 10 });
console.log(result); // { result: 50 }
```