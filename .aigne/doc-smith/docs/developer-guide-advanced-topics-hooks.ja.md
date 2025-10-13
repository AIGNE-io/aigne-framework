# Agent フック

Agent フックは、Agent の実行ライフサイクルに介入するための強力なメカニズムを提供します。これにより、Agent のコア実装を変更することなく、Agent の開始前、成功後、またはエラー発生時などの主要なポイントにカスタムロジックを挿入できます。このため、フックはロギング、モニタリング、トレーシング、入力/出力の変更、カスタムエラー処理戦略の実装に最適です。

## コアコンセプト

### ライフサイクルイベント

Agent のさまざまなライフサイクルイベントにカスタムロジックをアタッチできます。各フックは実行プロセスの特定の時点でトリガーされ、入力、出力、エラーなどの関連コンテキストを受け取ります。

利用可能なライフサイクルフックは以下の通りです：

| フック | トリガー | 目的 |
| :------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onStart` | Agent の `process` メソッドが呼び出される前。 | 入力を前処理または検証し、実行開始をログに記録し、または必要なリソースをセットアップします。Agent が受け取る前に入力を変更することができます。 |
| `onSuccess` | Agent の `process` メソッドが正常に完了した後。 | 出力を後処理または検証し、成功した結果をログに記録し、またはクリーンアップを実行します。最終的な出力を変更することができます。 |
| `onError` | Agent の実行中にエラーがスローされたとき。 | エラーをログに記録し、通知を送信し、またはカスタムのリトライロジックを実装します。Agent に操作をリトライするよう信号を送ることができます。 |
| `onEnd` | `onSuccess` または `onError` が呼び出された後。 | 結果に関わらず、接続のクローズやリソースの解放などのクリーンアップ操作を実行します。最終的な出力を変更したり、リトライをトリガーしたりすることもできます。 |
| `onSkillStart` | 現在の Agent によってスキル（サブ Agent）が呼び出される前。 | スキルの呼び出しをインターセプトしてログに記録したり、スキルに渡される入力を変更したりします。 |
| `onSkillEnd` | スキルが（成功したかどうかにかかわらず）実行を完了した後。 | スキルからの結果やエラーをログに記録し、そのスキルに特化したクリーンアップを実行したり、スキル固有のエラーを処理したりします。 |
| `onHandoff` | ある Agent が別の Agent に制御を移譲するとき。 | マルチ Agent システムにおける制御の流れを追跡し、タスクが Agent 間でどのように委任されるかを監視します。 |

### フックの優先度

フックには `priority` を割り当てて、同じイベントに複数のフックが登録された場合の実行順序を制御できます。これは、認証や検証などの特定のフックが他のフックより先に実行されるようにするために役立ちます。

利用可能な優先度レベルは以下の通りです：
- `high`
- `medium`
- `low` (デフォルト)

フックは `high` から `low` の優先度順に実行されます。これは `sortHooks` ユーティリティによって処理され、予測可能な実行シーケンスを保証します。

```typescript
// From packages/core/src/utils/agent-utils.ts
const priorities: NonNullable<AgentHooks["priority"]>[] = ["high", "medium", "low"];

export function sortHooks(hooks: AgentHooks[]): AgentHooks[] {
  return hooks
    .slice(0)
    .sort(({ priority: a = "low" }, { priority: b = "low" }) =>
      a === b ? 0 : priorities.indexOf(a) - priorities.indexOf(b),
    );
}
```

## フックの実装

フックは、単純なコールバック関数として、または独立した再利用可能な `Agent` インスタンスとして、2つの方法で実装できます。

### 1. 関数フック

単純なロジックの場合、`AgentOptions` オブジェクト内でフックを関数として直接定義できます。これはフックを使用する最も一般的で直接的な方法です。

**例：単純なロギングフック**

この例は、Agent の実行開始と終了をログに記録する基本的なフックを示しています。

```typescript
import { Agent, AgentOptions, Message } from "./agent"; // Assuming path to agent.ts

// ロギングフックオブジェクトを定義
const loggingHook = {
  priority: "high",
  onStart: ({ agent, input }) => {
    console.log(`[INFO] Agent '${agent.name}' started with input:`, JSON.stringify(input));
  },
  onEnd: ({ agent, output, error }) => {
    if (error) {
      console.error(`[ERROR] Agent '${agent.name}' failed with error:`, error.message);
    } else {
      console.log(`[INFO] Agent '${agent.name}' succeeded with output:`, JSON.stringify(output));
    }
  }
};

// 新しい Agent を作成し、フックをアタッチ
const myAgent = new Agent({
  name: "DataProcessor",
  hooks: [loggingHook],
  // ... other agent options
});
```

### 2. Agent フック

より複雑または再利用可能なロジックの場合、フックをそれ自身の `Agent` として実装できます。これにより、フックのロジックをカプセル化し、その状態を管理し、複数の Agent 間で再利用できます。フック Agent への入力は、イベントペイロード（例：`{ agent, input, error }`）になります。

**例：Agent ベースのエラーハンドラ**

ここで、`ErrorHandlingAgent` は `onError` フックとして機能するように設計された Agent です。これには、監視サービスにアラートを送信するロジックが含まれている可能性があります。

```typescript
import { FunctionAgent, Agent, Message } from "./agent"; // Assuming path to agent.ts

// アラートを送信してエラーを処理する Agent
const errorHandlingAgent = new FunctionAgent({
  name: "ErrorAlerter",
  process: async ({ agent, error }) => {
    console.log(`Alert! Agent ${agent.name} encountered an error: ${error.message}`);
    // 実際のシナリオでは、ここで外部の監視 API を呼び出すことになるでしょう。
  }
});

// 失敗する可能性のある Agent
class RiskyAgent extends Agent<{ command: string }, { result: string }> {
  async process(input) {
    if (input.command === "fail") {
      throw new Error("This operation was designed to fail.");
    }
    return { result: "Success!" };
  }
}

// エラー処理 Agent をフックとしてアタッチ
const riskyAgent = new RiskyAgent({
  name: "RiskyOperation",
  hooks: [
    {
      onError: errorHandlingAgent,
    }
  ],
});
```

## 実行フローの変更

フックは単なる監視のためだけではありません。Agent の実行フローを積極的に変更することができます。

- **入力の変更**: `onStart` フックは、新しい `input` プロパティを持つオブジェクトを返すことができます。これにより、Agent の `process` メソッドに渡される元の入力が置き換えられます。
- **出力の変更**: `onSuccess` または `onEnd` フックは、新しい `output` プロパティを持つオブジェクトを返すことができます。これにより、Agent の元の結果が置き換えられます。
- **リトライのトリガー**: `onError` または `onEnd` フックは `{ retry: true }` を返すことで、Agent に `process` メソッドを再実行するように指示できます。これは、一時的なエラーを処理するのに役立ちます。

**例：入力変換とリトライロジック**

```typescript
import { Agent, AgentOptions, Message } from "./agent"; // Assuming path to agent.ts

const transformationAndRetryHook = {
  onStart: ({ input }) => {
    // 処理前に入力を標準化
    const transformedInput = { ...input, data: input.data.toLowerCase() };
    return { input: transformedInput };
  },
  onError: ({ error }) => {
    // ネットワークエラー時にリトライ
    if (error.message.includes("network")) {
      console.log("Network error detected. Retrying...");
      return { retry: true };
    }
  }
};

const myAgent = new Agent({
  name: "NetworkAgent",
  hooks: [transformationAndRetryHook],
  // ... other agent options
});
```

## 宣言的設定 (YAML)

フックは YAML 設定ファイルで宣言的に定義することもでき、これは AIGNE CLI を使用する場合に特に便利です。フックをインラインで定義したり、他のファイルから参照したりすることができます。

**`test-agent-with-hooks.yaml` の例**

この例は、インライン AI Agent や外部ファイル（`test-hooks.yaml`）で定義されたフックなど、さまざまなフックを使用するチーム Agent を示しています。

```yaml
# From: packages/core/test-agents/test-agent-with-hooks.yaml
type: team
name: test_agent_with_default_input
hooks:
  priority: high
  on_start:
    type: ai
    name: test_hooks_inline # フックとして機能するインライン Agent
  on_success: test-hooks.yaml # 外部フック定義への参照
  on_error: test-hooks.yaml
  on_end: test-hooks.yaml
  on_skill_start: test-hooks.yaml
  on_skill_end: test-hooks.yaml
  on_handoff: test-hooks.yaml
skills:
  - url: ./test-agent-with-default-input-skill.yaml
    hooks:
      # フックは特定のスキルにもアタッチできます
      on_start: test-hooks.yaml
  - type: ai
    name: test_agent_with_default_input_skill2.yaml
    hooks:
      on_start: test-hooks.yaml
```

この宣言的なアプローチにより、関心事のクリーンな分離が可能になり、Agent のロジックはロギング、セキュリティ、エラー処理などの横断的な関心事から切り離されます。