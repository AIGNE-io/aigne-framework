# ワークフローリフレクション

リフレクションワークフローパターンは、Agent の出力の自己改善と反復的な改良を可能にします。このパターンでは、初期出力が生成され、評価のために別の `reviewer` Agent に渡されます。出力が必要な基準を満たしていない場合、フィードバックとともに再度処理に送られ、次のイテレーションが行われます。このサイクルは、出力が承認されるか、最大反復回数に達するまで続きます。

このパターンは、高品質で検証済みの出力が必要なシナリオで特に効果的です。例えば、以下のようなケースが挙げられます。
- **コード生成とレビュー**: coder Agent がコードを書き、reviewer Agent がその正確性、効率性、安全性を検査します。
- **コンテンツの品質管理**: writer Agent がコンテンツを生成し、editor Agent がスタイル、文法、正確性をチェックします。
- **自己修正システム**: Agent はフィードバックから学習し、特定のタスクにおけるパフォーマンスを反復的に向上させることができます。

## 仕組み

リフレクションプロセスは、1つ以上の Agent が解決策を生成し、reviewer Agent がフィードバックを提供するというループに従います。その後、初期の Agent はこのフィードバックを使用して、次の試みを改良します。

# ワークフローリフレクション

リフレクションワークフローパターンは、Agent の出力の自己改善と反復的な改良を可能にします。このパターンでは、初期出力が生成され、評価のために別の `reviewer` Agent に渡されます。出力が必要な基準を満たしていない場合、フィードバックとともに再度処理に送られ、次のイテレーションが行われます。このサイクルは、出力が承認されるか、最大反復回数に達するまで続きます。

このパターンは、高品質で検証済みの出力が必要なシナリオで特に効果的です。例えば、以下のようなケースが挙げられます。
- **コード生成とレビュー**: coder Agent がコードを書き、reviewer Agent がその正確性、効率性、安全性を検査します。
- **コンテンツの品質管理**: writer Agent がコンテンツを生成し、editor Agent がスタイル、文法、正確性をチェックします。
- **自己修正システム**: Agent はフィードバックから学習し、特定のタスクにおけるパフォーマンスを反復的に向上させることができます。

## 仕組み

リフレクションプロセスは、1つ以上の Agent が解決策を生成し、reviewer Agent がフィードバックを提供するというループに従います。その後、初期の Agent はこのフィードバックを使用して、次の試みを改良します。

```d2
direction: down

start: { 
  label: "開始"
  shape: oval 
}

generator: {
  label: "Generator Agent\n初期出力を生成"
  shape: rectangle
}

reviewer: {
  label: "Reviewer Agent\n出力を評価"
  shape: rectangle
}

decision: {
  label: "出力は\n基準を満たしているか？"
  shape: diamond
}

end: {
  label: "終了\n(承認された出力)"
  shape: oval
}

start -> generator
generator -> reviewer: "レビューのために提出"
reviewer -> decision
decision -> end: "はい"
decision -> generator: "いいえ (フィードバックを提供)"
```

## 設定

リフレクションパターンを有効にするには、`TeamAgentOptions` 内の `reflection` プロパティを設定します。このプロパティは、レビューと承認のプロセスを定義する `ReflectionMode` オブジェクトを受け取ります。

**ReflectionMode パラメータ**

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="出力のレビューとフィードバックの提供を担当する Agent。"></x-field>
  <x-field data-name="isApproved" data-type="((output: Message) => PromiseOrValue<boolean | unknown>) | string" data-required="true" data-desc="結果が承認されたかどうかを判断する、reviewer の出力内の関数またはフィールド名。関数の場合、reviewer の出力を受け取り、承認には truthy な値を返す必要があります。文字列の場合、出力内の対応するフィールドが truthy かどうかがチェックされます。"></x-field>
  <x-field data-name="maxIterations" data-type="number" data-required="false" data-default="3" data-desc="プロセスが終了するまでのレビューとフィードバックのサイクルの最大数。これにより、無限ループを防ぎます。"></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-required="false" data-default="false" data-desc="`true` に設定すると、`maxIterations` に達したときに、承認されていなくても最後に生成された出力が返されます。`false` の場合、エラーがスローされます。"></x-field>
</x-field-group>

## 例: コード生成とレビュー

この例では、`coder` Agent が Python 関数を書き、`reviewer` Agent がそれを評価するリフレクションワークフローを示します。このプロセスは、`reviewer` がコードを承認するまで続きます。

### 1. Coder Agent の定義

`coder` Agent は、ユーザーのリクエストに基づいて初期コードを作成する責任を負います。後続のイテレーションで解決策を改善するために、reviewer からのフィードバックを受け取るように設計されています。

```typescript
import { TeamAgent, AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const coder = AIAgent.from({
  name: "Coder",
  instructions: `
あなたは熟練したコーダーです。問題を解決するために Python コードを作成します。
reviewer と協力してコードを改善してください。
完成したコードはすべて、単一の Markdown コードブロックにまとめてください。

次の形式を使用して応答してください:
思考: <あなたのコメント>
コード: <あなたのコード>

前回のレビュー結果:
{{feedback}}

ユーザーの質問:
{{question}}
`,
  outputSchema: z.object({
    code: z.string().describe("あなたのコード"),
  }),
  inputKey: "question",
});
```

### 2. Reviewer Agent の定義

`reviewer` Agent は、`coder` によって生成されたコードを評価します。正確性、効率性、安全性をチェックし、構造化されたフィードバックを提供します。その出力には、リフレクションループを制御するブール値の `approval` フィールドが含まれます。

```typescript
const reviewer = AIAgent.from({
  name: "Reviewer",
  instructions: `
あなたはコードレビュアーです。コードの正確性、効率性、安全性に重点を置いています。

問題提起は次のとおりです: {{question}}
コードは次のとおりです:
\`\`\`
{{code}}
\`\`\`

コードをレビューしてください。以前のフィードバックが提供されている場合は、それに対応しているか確認してください。
`,
  outputSchema: z.object({
    approval: z.boolean().describe("承認するには true、修正するには false に設定してください"),
    feedback: z.object({
      correctness: z.string().describe("正確性に関するあなたのコメント"),
      efficiency: z.string().describe("効率性に関するあなたのコメント"),
      safety: z.string().describe("安全性に関するあなたのコメント"),
      suggested_changes: z
        .string()
        .describe("提案された変更に関するあなたのコメント"),
    }),
  }),
});
```

### 3. TeamAgent の作成と呼び出し

`TeamAgent` は、ワークフローを調整するために設定されます。`coder` は主要な Agent (スキル) として設定され、`reviewer` は `reflection` プロパティで設定されます。`isApproved` 条件は、`reviewer` の出力内の `approval` フィールドを指します。

```typescript
const reflectionTeam = TeamAgent.from({
  skills: [coder],
  reflection: {
    reviewer,
    isApproved: "approval",
    maxIterations: 3,
  },
});

async function run() {
  const result = await reflectionTeam.invoke(
    {
      question: "リスト内のすべての偶数の合計を求める関数を書いてください。",
    },
    { model }
  );
  
  console.log(JSON.stringify(result, null, 2));
}

run();
```

### 出力例

1回以上のイテレーションの後、`reviewer` Agent がコードを承認し、`coder` Agent からの最終的な出力が返されます。

```json
{
  "code": "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)"
}
```