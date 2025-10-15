# AI Agent

`AIAgent` は、大規模言語モデル (LLM) と対話するための主要なコンポーネントです。`ChatModel` への直接的なインターフェースとして機能し、高度な会話型 AI、関数呼び出し (ツールの使用)、構造化データ抽出を可能にします。この Agent は、プロンプトの構築、モデルの呼び出し、応答の解析、ツール実行ループといった複雑な処理を扱います。

このガイドでは、`AIAgent` の設定とそのコア機能について包括的に解説します。Agent が AIGNE フレームワークにどのように適合するかをより広く理解するには、[Agent のコアコンセプトガイド](./developer-guide-core-concepts-agents.md) を参照してください。

## 仕組み

`AIAgent` は、ユーザーの入力を処理して応答を生成するために、体系的なプロセスに従います。このプロセスには、特にツールが使用される場合に、LLM との複数回の対話が含まれることがよくあります。

```d2
direction: right
style {
  stroke-width: 2
}

# ユーザー入力から開始
input: ユーザー入力

# Agent コンポーネント
agent: AIAgent {
  shape: package
  style.fill: "#f0f4f8"

  builder: PromptBuilder
  model: ChatModel
  tools: "ツール (スキル)"
}

# 最終出力で終了
output: 最終応答

# プロセスフロー
input -> agent.builder: "1. プロンプトの構築"
agent.builder -> agent.model: "2. モデルの呼び出し"
agent.model -> agent: "3. 応答の受信"

subgraph "ツール実行ループ" {
  direction: down
  style {
    stroke-dash: 4
  }

  agent -> check_tool_call: "4. 応答の解析" {shape: diamond}
  check_tool_call -> output: "いいえ"
  check_tool_call -> agent.tools: "はい (ツール呼び出しを検出)"

  agent.tools -> agent.builder: "5. ツールの実行と結果のフォーマット"
}

agent -> output: "6. 最終出力のフォーマット"
```

上の図は、リクエストの典型的なライフサイクルを示しています。
1.  **プロンプトの構築**: `AIAgent` は `PromptBuilder` を使用して、その `instructions`、ユーザー入力、および以前のツール呼び出しの履歴から最終的なプロンプトを組み立てます。
2.  **モデルの呼び出し**: 完全に形成されたプロンプトが、設定された `ChatModel` に送信されます。
3.  **応答の解析**: Agent はモデルの生の出力を受け取ります。
4.  **ツール呼び出しの検出**: 応答にツールを呼び出すリクエストが含まれているかどうかを確認します。
    - **いいえ**の場合、Agent はテキスト応答をフォーマットして返します。
    - **はい**の場合、ツール実行ループに進みます。
5.  **ツールの実行**: Agent は要求されたツール (別の Agent) を特定して呼び出し、その出力をキャプチャし、モデル用のメッセージにフォーマットします。その後、プロセスはステップ 1 にループバックし、ツールの結果を次の生成ステップのためにモデルに送り返します。
6.  **最終出力**: モデルがツール呼び出しなしで最終的なテキスト応答を生成すると、Agent はそれをフォーマットし、ユーザーにストリーミングして返します。

## 設定

`AIAgent` は、そのコンストラクタオプションを通じて設定されます。以下は、利用可能なパラメータの詳細な内訳です。

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="false">
    <x-field-desc markdown>AI モデルの動作をガイドする中心的な指示。これは、単純な文字列または複雑で動的なプロンプトを作成するための `PromptBuilder` インスタンスにすることができます。詳細については、[プロンプト](./developer-guide-advanced-topics-prompts.md) ガイドを参照してください。</x-field-desc>
  </x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false">
    <x-field-desc markdown>入力メッセージオブジェクトのどのキーをメインのユーザークエリとして扱うかを指定します。設定されていない場合、`instructions` を提供する必要があります。</x-field-desc>
  </x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-required="false">
    <x-field-desc markdown>Agent の最終的なテキスト応答が出力オブジェクトのどのキーの下に配置されるかを定義します。デフォルトは `message` です。</x-field-desc>
  </x-field>
  <x-field data-name="inputFileKey" data-type="string" data-required="false">
    <x-field-desc markdown>モデルに送信されるファイルデータを含む入力メッセージのキーを指定します。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileKey" data-type="string" data-default="files" data-required="false">
    <x-field-desc markdown>モデルによって生成されたファイルが出力オブジェクトのどのキーの下に配置されるかを定義します。デフォルトは `files` です。</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-default="auto" data-required="false">
    <x-field-desc markdown>Agent が利用可能なツール (スキル) をどのように使用するかを制御します。詳細については、以下のツール使用のセクションを参照してください。</x-field-desc>
  </x-field>
  <x-field data-name="toolCallsConcurrency" data-type="number" data-default="1" data-required="false">
    <x-field-desc markdown>1 ターンで同時に実行できるツール呼び出しの最大数。</x-field-desc>
  </x-field>
  <x-field data-name="catchToolsError" data-type="boolean" data-default="true" data-required="false">
    <x-field-desc markdown>`true` の場合、Agent はツール実行からのエラーをキャッチし、エラーメッセージをモデルにフィードバックします。`false` の場合、エラーはプロセス全体を停止させます。</x-field-desc>
  </x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown>モデルのストリーミング応答から構造化 JSON データを抽出するモードを有効にします。詳細については、構造化出力のセクションを参照してください。</x-field-desc>
  </x-field>
  <x-field data-name="memoryAgentsAsTools" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown>`true` の場合、アタッチされた `MemoryAgent` インスタンスは呼び出し可能なツールとしてモデルに公開され、Agent が明示的にメモリから読み書きできるようになります。</x-field-desc>
  </x-field>
</x-field-group>

### 基本的な例

これは、役立つアシスタントとして機能するように設定された単純な `AIAgent` の例です。

```javascript 基本的なチャット Agent icon=logos:javascript
import { AIAgent } from "@aigne/core";
import { OpenAI } from "@aigne/openai";

// 使用するモデルを設定
const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
});

// AI Agent を作成
const chatAgent = new AIAgent({
  instructions: "You are a helpful assistant.",
  inputKey: "question",
  outputKey: "answer",
});

// Agent を実行するには、AIGNE の invoke メソッドを使用します
// const aigne = new AIGNE({ model });
// const response = await aigne.invoke(chatAgent, { question: "What is AIGNE?" });
// console.log(response.answer);
```

この Agent は `question` キーを持つ入力オブジェクトを受け取り、`answer` キーを持つ出力オブジェクトを生成します。

## ツールの使用

`AIAgent` の強力な機能は、他の Agent をツールとして使用する能力です。呼び出し時に `skills` のリストを提供することで、`AIAgent` はこれらのツールを呼び出して情報を収集したり、アクションを実行したりすることを決定できます。`toolChoice` オプションがこの動作を決定します。

| `toolChoice` の値 | 説明 |
| :--- | :--- |
| `auto` | (デフォルト) モデルが会話のコンテキストに基づいてツールを呼び出すかどうかを決定します。 |
| `none` | ツールの使用を完全に無効にします。モデルはどのツールも呼び出そうとしません。 |
| `required` | モデルに 1 つ以上のツールを強制的に呼び出させます。 |
| `router` | モデルが正確に 1 つのツールを選択することを強制される特殊なモード。Agent はリクエストをそのツールに直接ルーティングし、その応答を最終出力としてストリーミングします。これは、ディスパッチャー Agent を作成するのに非常に効率的です。 |

### ツール使用例

天気情報を取得できる `FunctionAgent` があるとします。これをスキルとして `AIAgent` に提供できます。

```javascript ツールを持つ Agent icon=logos:javascript
import { AIAgent, FunctionAgent } from "@aigne/core";
import { OpenAI } from "@aigne/openai";

// 天気を取得する単純な関数
function getCurrentWeather(location) {
  if (location.toLowerCase().includes("tokyo")) {
    return JSON.stringify({ location: "Tokyo", temperature: "15", unit: "celsius" });
  }
  return JSON.stringify({ location, temperature: "unknown" });
}

// 関数を FunctionAgent でラップしてツールにする
const weatherTool = new FunctionAgent({
  name: "get_current_weather",
  description: "Get the current weather in a given location",
  inputSchema: {
    type: "object",
    properties: { location: { type: "string", description: "The city and state" } },
    required: ["location"],
  },
  process: ({ location }) => getCurrentWeather(location),
});

// モデルを設定
const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
});

// 天気ツールを使用できる AI Agent を作成
const weatherAssistant = new AIAgent({
  instructions: "You are a helpful assistant that can provide weather forecasts.",
  inputKey: "query",
  outputKey: "response",
});

// 呼び出す際に、ツールをスキルとして提供する
// const aigne = new AIGNE({ model, skills: [weatherTool] });
// const result = await aigne.invoke(weatherAssistant, { query: "What's the weather like in Tokyo?" });
// console.log(result.response); // LLM はツールの出力を使用して応答します
```

このシナリオでは、`AIAgent` はクエリを受け取り、天気情報の必要性を認識し、`weatherTool` を呼び出し、その JSON 出力を受け取り、そのデータを使用して自然言語の応答を生成します。

## 構造化出力

感情分析、分類、エンティティ抽出など、特定の構造化情報を抽出する必要があるタスクには、`structuredStreamMode` が非常に役立ちます。有効にすると、Agent はモデルのストリーミング出力を積極的に解析して JSON オブジェクトを見つけて抽出します。

デフォルトでは、モデルは構造化データを YAML 形式で `<metadata>...</metadata>` タグ内に配置するように指示される必要があります。

### 構造化出力の例

この例では、ユーザーメッセージの感情を分析し、構造化された JSON オブジェクトを返すように Agent を設定します。

```javascript 構造化感情分析 icon=logos:javascript
import { AIAgent } from "@aigne/core";
import { OpenAI } from "@aigne/openai";

const sentimentAnalyzer = new AIAgent({
  instructions: `
    Analyze the sentiment of the user's message.
    Respond with a single word summary, followed by a structured analysis.
    Place the structured analysis in YAML format inside <metadata> tags.
    The structure should contain 'sentiment' (positive, negative, or neutral) and a 'score' from -1.0 to 1.0.
  `,
  inputKey: "message",
  outputKey: "summary",
  structuredStreamMode: true,
});

// 呼び出されると、出力にはテキストの要約と
// 解析された JSON オブジェクトの両方が含まれます。
// const aigne = new AIGNE({ model: new OpenAI(...) });
// const result = await aigne.invoke(sentimentAnalyzer, { message: "AIGNE is an amazing framework!" });
/*
  期待される結果:
  {
    summary: "Positive.",
    sentiment: "positive",
    score: 0.9
  }
*/
```

`customStructuredStreamInstructions` オプションを使用して、開始/終了タグや解析関数 (例: JSON を直接サポートするため) を含む解析ロジックをカスタマイズできます。

## まとめ

`AIAgent` は、高度な AI アプリケーションを作成するための基礎的な構成要素です。これは、ツールの使用、構造化データの抽出、メモリの統合を完全にサポートする、言語モデルへの堅牢で柔軟なインターフェースを提供します。

より複雑なワークフローでは、複数の Agent を連携させる必要があるかもしれません。その方法を学ぶには、[Team Agent](./developer-guide-agents-team-agent.md) のドキュメントに進んでください。高度なプロンプトテンプレート技術については、[プロンプト](./developer-guide-advanced-topics-prompts.md) ガイドを参照してください。