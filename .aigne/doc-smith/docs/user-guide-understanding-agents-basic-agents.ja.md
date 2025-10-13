```d2
direction: down

Invocation: {
  label: "呼び出し\n(ユーザー入力、履歴)"
  shape: oval
}

AIAgent: {
  label: "AIAgent コアロジック"
  shape: rectangle
  style: {
    stroke-width: 2
    stroke-dash: 4
  }

  PromptBuilder: {
    label: "1. プロンプトの構築"
    shape: rectangle
  }

  Response-Handler: {
    label: "3. レスポンスの処理"
    shape: diamond
  }

  Tool-Executor: {
    label: "4a. ツールの実行"
    shape: rectangle
  }

  Output-Processor: {
    label: "4b. 最終回答の処理\n(構造化データ抽出)"
    shape: rectangle
  }
}

Language-Model: {
  label: "言語モデル"
  shape: cylinder
}

Tools: {
  label: "利用可能なツール"
  shape: rectangle
  Tool-A: "ツール A"
  Tool-B: "ツール B"
}

Final-Response: {
  label: "ストリーム応答"
  shape: oval
}

Invocation -> AIAgent.PromptBuilder
AIAgent.PromptBuilder -> Language-Model: "2. プロンプトの送信"
Language-Model -> AIAgent.Response-Handler: "LLM の生出力"
AIAgent.Response-Handler -> AIAgent.Tool-Executor: "ツール呼び出し"
AIAgent.Tool-Executor -> Tools
Tools -> AIAgent.PromptBuilder: "ツール結果をコンテキストに返す" {
  style.stroke-dash: 2
}
AIAgent.Response-Handler -> AIAgent.Output-Processor: "最終回答"
AIAgent.Output-Processor -> Final-Response
```

## AIAgent の作成

`AIAgent` インスタンスは、`AIAgent.from()` ファクトリメソッドを使用するか、コンストラクタを直接使用して作成できます。最低限、エージェントが機能するには、指示または `inputKey` が必要です。

以下は、チャットエージェントを作成する基本的な例です：

```typescript
import { AIAgent } from "@core/agents/ai-agent";
import { GoogleChatModel } from "@core/models/google";

// モデルが他の場所（例：中央コンテキスト）で設定されていることを前提とします
const model = new GoogleChatModel({ model: "gemini-1.5-flash" });

const chatAgent = AIAgent.from({
  name: "chat-bot",
  description: "A helpful assistant that can answer questions.",
  instructions: "You are a helpful assistant. Your goal is to assist users in finding the information they need and to engage in friendly conversation.",
  inputKey: "message",
  model: model,
});

async function runChat() {
  const responseStream = await chatAgent.invoke({ message: "Hello, world!" });
  for await (const chunk of responseStream) {
    if (chunk.delta.text?.message) {
      process.stdout.write(chunk.delta.text.message);
    }
  }
}

runChat();
```

この例では、提供された指示を使用して `message` フィールドで渡されたユーザー入力に応答するシンプルなエージェントを作成します。

## 設定オプション (`AIAgentOptions`)

`AIAgentOptions` インターフェースは、エージェントの動作を調整するための広範な設定可能性を提供します。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="エージェントの一意の名前。"></x-field>
  <x-field data-name="description" data-type="string" data-required="true" data-desc="エージェントの目的と機能の説明。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="エージェントが使用する言語モデルのインスタンス。これは呼び出し時に提供することもできます。"></x-field>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="false" data-desc="AI モデルの動作をガイドする指示。単純な文字列、または複雑なテンプレート用の `PromptBuilder` インスタンスにすることができます。"></x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false" data-desc="入力メッセージのどのキーをプライマリユーザーメッセージとして扱うかを指定します。"></x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-desc="レスポンスオブジェクトのテキスト出力に使用するカスタムキー。デフォルトは `message` です。"></x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-default="auto" data-desc="エージェントがツールをどのように使用するかを制御します。「ツールの使用」セクションで詳細を確認してください。"></x-field>
  <x-field data-name="keepTextInToolUses" data-type="boolean" data-required="false" data-desc="true の場合、ツール呼び出しと同時にモデルによって生成されたテキストが最終出力に保持されます。"></x-field>
  <x-field data-name="catchToolsError" data-type="boolean" data-default="true" data-desc="false の場合、ツールの実行が失敗するとエージェントはエラーをスローします。デフォルトは true で、エージェントがエラーを処理できるようになります。"></x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-default="false" data-desc="モデルのストリーミング応答から構造化メタデータ（例：JSON）を抽出するモードを有効にします。"></x-field>
  <x-field data-name="customStructuredStreamInstructions" data-type="object" data-required="false" data-desc="プロンプトの指示やメタデータ解析ロジックなど、構造化ストリームの動作を完全にカスタマイズできます。"></x-field>
  <x-field data-name="memoryAgentsAsTools" data-type="boolean" data-default="false" data-desc="true の場合、メモリ エージェントがツールとして利用可能になり、モデルが情報を明示的に取得または保存するために呼び出すことができます。"></x-field>
</x-field-group>

## ツールの使用

`AIAgent` の主な特徴は、他のエージェントをツールとして使用する機能です。これにより、AI エージェントが特定のアクションを実行するために特化したエージェントにタスクを委任する複雑なシステムを構築できます。`toolChoice` オプションがこの動作を制御します。

### `AIAgentToolChoice` Enum

-   **`auto` (デフォルト)**: 言語モデルが会話のコンテキストに基づいてツールを呼び出すかどうかを決定します。これは最も柔軟なオプションです。
-   **`none`**: エージェントのすべてのツール使用を無効にし、自身の知識のみに依存するように強制します。
-   **`required`**: エージェントに利用可能なツールのいずれかを使用するように強制します。モデルはツール呼び出しを行う必要があります。
-   **`router`**: エージェントの唯一の目的が、最も適切なツールを選択し、ユーザーの入力を直接それにルーティングすることである特殊なモード。`AIAgent` 自体は応答せず、選択されたツールの出力が最終的な応答になります。

### 例：ツールの使用

```typescript
import { Agent } from "@core/agents/agent";
import { AIAgent, AIAgentToolChoice } from "@core/agents/ai-agent";

// 天気情報を取得するシンプルなツール (Agent)
const weatherTool = new Agent({
  name: "get_weather",
  description: "Get the current weather for a specific location.",
  inputSchema: {
    type: "object",
    properties: {
      location: { type: "string", description: "The city and state, e.g., San Francisco, CA" },
    },
    required: ["location"],
  },
  async *process(input) {
    yield {
      delta: {
        json: {
          weather: `The weather in ${input.location} is sunny.`,
        },
      },
    };
  },
});

// ツールを使用するように設定された AIAgent
const weatherAssistant = AIAgent.from({
  name: "weather-assistant",
  description: "An assistant that can provide weather forecasts.",
  instructions: "You are a weather assistant. Use the available tools to answer questions about the weather.",
  tools: [weatherTool],
  toolChoice: AIAgentToolChoice.auto,
});

async function getWeather() {
  const responseStream = await weatherAssistant.invoke({
    message: "What's the weather like in New York?",
  });

  for await (const chunk of responseStream) {
    // 最終出力はツール結果の統合になります
    console.log(chunk);
  }
}

getWeather();
```

## 構造化データ抽出

`structuredStreamMode` は、プレーンテキストに加えて、言語モデルの応答から構造化情報（JSON など）を抽出する必要があるシナリオで強力な機能です。有効にすると、エージェントはモデルの出力で特別なメタデータタグを探し、その中のコンテンツを解析します。

### 構造化ストリームモードの有効化

この機能を使用するには、以下を行う必要があります：
1.  エージェントのオプションで `structuredStreamMode: true` を設定します。
2.  モデルに（`instructions` プロンプトを介して）特定のタグ（デフォルトは `<metadata>...</metadata>`）内に構造化出力をフォーマットするように指示します。

### 例：JSON の抽出

```typescript
import { AIAgent } from "@core/agents/ai-agent";

const sentimentAnalyzer = AIAgent.from({
  name: "sentiment-analyzer",
  description: "Analyzes the sentiment of a message and provides a rating.",
  instructions: `
    Analyze the sentiment of the user's message.
    Respond with a brief explanation, and then provide a structured sentiment analysis in a <metadata> tag.
    The metadata should be a YAML object with 'sentiment' (positive, negative, or neutral) and 'score' (0-1) fields.
  `,
  structuredStreamMode: true,
});

async function analyzeSentiment() {
  const responseStream = await sentimentAnalyzer.invoke({
    message: "I am absolutely thrilled with the new update! It's fantastic.",
  });

  for await (const chunk of responseStream) {
    if (chunk.delta.text?.message) {
      // レスポンスのテキスト部分をストリーミングします
      process.stdout.write(chunk.delta.text.message);
    }
    if (chunk.delta.json) {
      // 解析された JSON オブジェクトはここに表示されます
      console.log("\n[METADATA]:", chunk.delta.json);
    }
  }
}

// 予想される出力は、テキストの説明をストリーミングし、
// その後に解析された JSON オブジェクトが続きます：
// [METADATA]: { sentiment: 'positive', score: 0.95 }

analyzeSentiment();
```

YAML 以外の形式（JSON など）の場合、`customStructuredStreamInstructions` オプションを使用して、メタデータタグと解析ロジックをさらにカスタマイズできます。