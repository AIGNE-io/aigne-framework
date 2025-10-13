# TeamAgent

TeamAgent は、Agent のグループが協力してタスクを達成するように調整します。Agent のコレクション（そのスキル）を管理し、指定された処理モードに従ってそれらの実行を編成します。これにより、複数の Agent が連携する複雑なワークフローを作成できます。

TeamAgent は、特に次のような場合に役立ちます。
- ある Agent の出力が別の Agent に入力される Agent ワークフローを作成する。
- 複数の Agent を同時に実行し、その結果を結合する。
- 専門的なコンポーネントが連携して動作する複雑な Agent システムを構築する。
- リフレクションを使用して、反復的で自己修正的なワークフローを実装する。
- 定義された Agent パイプラインを通じてデータ項目をバッチ処理する。

## 仕組み

`TeamAgent` は、定義された `ProcessMode` に基づいて、メンバー Agent（スキル）を通じて入力をルーティングして処理します。逐次的、並列的に動作したり、反復的なリフレクションプロセスを使用して結果を改良したりできます。以下の図は、高レベルの処理ロジックを示しています。

```d2
direction: down

入力: { shape: oval }

モード選択: {
  label: "処理モード?"
  shape: diamond
}

逐次実行: {
  label: "逐次実行"
  Agent-1: "Agent 1"
  Agent-2: "Agent 2"
  Agent-N: "..."
  Agent-1 -> Agent-2 -> Agent-N
}

並列実行: {
  label: "並列実行"
  p-agent-1: "Agent 1"
  p-agent-2: "Agent 2"
  p-agent-n: "..."
}

結果の結合: "結果を結合"

リフレクションチェック: {
  label: "リフレクション?"
  shape: diamond
}

レビュー担当: {
  label: "レビュー担当 Agent"
}

承認チェック: {
  label: "承認済み?"
  shape: diamond
}

出力: { shape: oval }

入力 -> モード選択

モード選択 -> 逐次実行: "sequential"
モード選択 -> 並列実行: "parallel"

逐次実行.Agent-N -> リフレクションチェック
並列実行 -> 結果の結合
結果の結合 -> リフレクションチェック

リフレクションチェック -> 出力: "No"
リフレクションチェック -> レビュー担当: "Yes"

レビュー担当 -> 承認チェック
承認チェック -> 出力: "Yes"
承認チェック -> モード選択: "No (フィードバック & 再試行)" {
  style.stroke-dash: 2
}
```

## 主要な概念

### 処理モード

`TeamAgentOptions` の `mode` プロパティは、チーム内の Agent がどのように実行されるかを決定します。

- **`ProcessMode.sequential`**: Agent は提供された順序で 1 つずつ処理されます。各 Agent の出力はマージされ、シーケンス内の次の Agent への入力として渡されます。これは、マルチステップのパイプラインを作成するのに役立ちます。
- **`ProcessMode.parallel`**: すべての Agent が同時に処理され、それぞれが同じ初期入力を受け取ります。最終的な出力は、すべての Agent からの結果を組み合わせたものになります。これは、独立したサブタスクに分割できるタスクに最適です。

### リフレクションモード

リフレクションモードは、反復的な改良と検証のワークフローを可能にします。設定すると、チームの出力は `reviewer` Agent に渡されます。レビュー担当は、特定の条件（`isApproved`）に対して出力を評価します。出力が承認されない場合、プロセスは繰り返し、前の出力とレビュー担当のフィードバックをチームにフィードバックして別の反復を行います。このループは、出力が承認されるか、`maxIterations` の制限に達するまで続きます。

これは、品質管理、自己修正、または反復的な改善を必要とするタスクに強力です。

### 反復処理 (`iterateOn`)

`iterateOn` オプションを使用すると、`TeamAgent` は項目の配列をバッチ形式で処理できます。配列を含む入力キーを指定すると、チームはその配列内の各項目に対してワークフローを実行します。これは、同じ一連の操作を複数のデータエントリに適用する必要があるバッチ処理シナリオで非常に効率的です。`concurrency` オプションを使用して並列処理のレベルを制御できます。

## TeamAgent の作成

`TeamAgent.from()` 静的メソッドを使用して `TeamAgent` を作成し、一連のスキル（他の Agent）と設定オプションを提供できます。

### 逐次モードの例

この例では、`translator` Agent の出力が直接 `sentiment` Agent に供給されます。

```typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// テキストを英語に翻訳する Agent
const translator = new AIAgent({
  name: "Translator",
  model,
  instructions: "Translate the following text to English.",
  inputKey: "text",
  outputKey: "translated_text",
});

// テキストの感情を分析する Agent
const sentiment = new AIAgent({
  name: "SentimentAnalyzer",
  model,
  instructions: "Analyze the sentiment of the following text. Is it positive, negative, or neutral?",
  inputKey: "translated_text",
  outputKey: "sentiment",
});

// 感情分析の前に翻訳が行われる逐次チーム
const sequentialTeam = TeamAgent.from({
  name: "SequentialTranslatorTeam",

  // Agent (スキル) はこの順序で実行されます
  skills: [translator, sentiment],
  
  // モードを逐次に設定
  mode: ProcessMode.sequential, 
});

const result = await sequentialTeam.invoke({
  text: "Me encanta este producto, es fantástico.",
});

console.log(result);
// 期待される出力:
// {
//   translated_text: "I love this product, it's fantastic.",
//   sentiment: "positive" 
// }
```

### 並列モードの例

ここでは、2 つの独立した Agent が同時に実行され、同じ入力テキストから異なる情報を収集します。

```typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// 主要なトピックを抽出する Agent
const topicExtractor = new AIAgent({
  name: "TopicExtractor",
  model,
  instructions: "Identify the main topic of the text.",
  inputKey: "text",
  outputKey: "topic",
});

// テキストを要約する Agent
const summarizer = new AIAgent({
  name: "Summarizer",
  model,
  instructions: "Provide a one-sentence summary of the text.",
  inputKey: "text",
  outputKey: "summary",
});

// 両方の Agent が同時に実行される並列チーム
const parallelTeam = TeamAgent.from({
  name: "ParallelAnalysisTeam",
  skills: [topicExtractor, summarizer],
  mode: ProcessMode.parallel, // モードを並列に設定
});

const result = await parallelTeam.invoke({
  text: "The new AI model shows remarkable improvements in natural language understanding and can be applied to various industries, from healthcare to finance.",
});

console.log(result);
// 期待される出力:
// {
//   topic: "AI Model Improvements",
//   summary: "A new AI model has significantly advanced in natural language understanding, with broad industry applications."
// }
```

### リフレクションモードの例

この例は、コンテンツを生成する `writer` Agent と、コンテンツが特定の単語数を満たしているかを確認する `reviewer` Agent を示しています。チームは条件が満たされるまで再実行されます。

```typescript
import { AIAgent, TeamAgent, FunctionAgent } from "@aigne/core";
import { z } from "zod";

const writer = new AIAgent({
  name: "Writer",
  model,
  instructions: "Write a short paragraph about the benefits of teamwork. If you receive feedback, use it to revise the text.",
  inputKey: "request",
  outputKey: "paragraph",
});

const reviewer = new FunctionAgent({
  name: "Reviewer",
  inputSchema: z.object({ paragraph: z.string() }),
  outputSchema: z.object({
    approved: z.boolean(),
    feedback: z.string().optional(),
  }),
  process: ({ paragraph }) => {
    if (paragraph.split(" ").length >= 50) {
      return { approved: true };
    } else {
      return {
        approved: false,
        feedback: "The paragraph is too short. Please expand it to at least 50 words.",
      };
    }
  },
});

const reflectionTeam = TeamAgent.from({
  name: "ReflectiveWriterTeam",
  skills: [writer],
  reflection: {
    reviewer: reviewer,
    isApproved: "approved", // レビュー担当の出力の 'approved' フィールドを確認
    maxIterations: 3,
  },
});

const result = await reflectionTeam.invoke({
  request: "Write about teamwork.",
});

console.log(result);
// 出力は、少なくとも 50 ワードのチームワークに関する段落になります。
```

## 設定オプション (`TeamAgentOptions`)

`TeamAgent` は、次のオプションで設定できます。

<x-field-group>
  <x-field data-name="mode" data-type="ProcessMode" data-required="false" data-desc="Agent の処理モード。`ProcessMode.sequential` または `ProcessMode.parallel` を指定できます。デフォルトは `sequential` です。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="チームを構成する Agent インスタンスの配列。"></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="リフレクションモードの設定。反復的なレビューと改良を可能にします。">
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="チームの出力をレビューする責任を持つ Agent。"></x-field>
    <x-field data-name="isApproved" data-type="string | (output: Message) => boolean" data-required="true" data-desc="結果が承認されたかどうかを判断する、レビュー担当の出力内のブール値フィールドの名前または関数。"></x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="停止するまでのレビューと改良の反復の最大数。"></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false" data-desc="true の場合、最大反復回数に達したときに、承認されていなくても最後の出力を返します。それ以外の場合は、エラーをスローします。"></x-field>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false" data-desc="配列を含む入力フィールドのキー。チームは配列内の各項目に対してワークフローを実行します。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="`iterateOn` を使用する場合の最大同時操作数。"></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="true の場合、反復からの出力は項目にマージされ、後続の反復で利用できるようになります。`concurrency` が 1 の場合にのみ機能します。"></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false" data-desc="逐次モードで true の場合、出力ストリームには最終ステップだけでなく、すべての中間ステップからのチャンクが含まれます。"></x-field>
</x-field-group>