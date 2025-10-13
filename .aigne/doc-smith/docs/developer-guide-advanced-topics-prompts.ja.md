# プロンプト

プロンプトの構築およびテンプレートシステムは、AI モデルとの動的で強力な対話を作成するためのコアコンポーネントです。これは主に 2 つの部分で構成されています。

1.  **プロンプトテンプレート**: 動的で再利用可能なプロンプトコンポーネントを作成するための、Nunjucks を使用した柔軟なシステム。
2.  **プロンプトビルダー**: テンプレート、コンテキスト、メモリ、ツール、および出力スキーマを、モデルに送信する準備ができた完全な `ChatModelInput` に組み立てる高レベルのオーケストレーター。

### `PromptBuilder` のワークフロー

`PromptBuilder` は、テンプレート、ユーザー入力、コンテキスト、メモリ、ツールといったさまざまな要素をすべて調整し、最終的なモデル対応の `ChatModelInput` オブジェクトを構築する中心的なクラスです。以下の図は、このプロセスを示しています。

```d2
direction: down

Inputs: {
  label: "ビルダー入力"
  shape: rectangle
  style.stroke-dash: 2
  grid-columns: 2

  User-Input: "ユーザー入力"
  Context: "コンテキスト"
  Memories: "メモリ"
  Tools: "ツール"
  Output-Schemas: "出力スキーマ"

  Templates: {
    label: "プロンプトテンプレート"
    shape: rectangle

    Nunjucks-Engine: {
      label: "Nunjucks エンジン"
      style.fill: "#f5f5f5"
    }

    PromptTemplate: {
      label: "PromptTemplate\n(文字列フォーマット用)"
    }

    ChatMessagesTemplate: {
      label: "ChatMessagesTemplate\n(会話用)"
      grid-columns: 2
      SystemMessageTemplate
      UserMessageTemplate
      AgentMessageTemplate
      ToolMessageTemplate
    }
  }
}

PromptBuilder: {
  label: "PromptBuilder"
  shape: rectangle
  style.fill: "#e6f7ff"
}

ChatModelInput: {
  label: "ChatModelInput"
  shape: rectangle
  style.fill: "#d9f7be"
}

AI-Model: {
  label: "AI モデル"
  shape: cylinder
}

Inputs.Templates.PromptTemplate -> Inputs.Templates.Nunjucks: "使用"
Inputs.Templates.ChatMessagesTemplate -> Inputs.Templates.Nunjucks: "使用"

Inputs -> PromptBuilder: ".build() で組み立て"
PromptBuilder -> ChatModelInput: "生成"
ChatModelInput -> AI-Model: "送信先"

```

## プロンプトテンプレート

プロンプトテンプレートを使用すると、変数を使用したり他のファイルを含めたりしてプロンプトや会話の構造を定義し、モジュール化され保守しやすいプロンプト指示を作成できます。

### `PromptTemplate`

`PromptTemplate` クラスは、Nunjucks テンプレート文字列のシンプルなラッパーです。これにより、文字列をフォーマットして変数を含めることができます。

**主な機能:**

*   **変数置換**: 動的なデータをプロンプトに挿入します。
*   **ファイルインクルード**: `{% raw %}{% include "path/to/file.md" %}{% endraw %}` 構文を使用して他のテンプレートファイルをインクルードし、複雑なプロンプトを構築します。

**例:**

2 つのテンプレートファイルがあるとします。

**`./main-prompt.md`**
```markdown
あなたはプロのチャットボットです。

{% raw %}{% include "./personality.md" %}{% endraw %}
```

**`./personality.md`**
```markdown
あなたの名前は {% raw %}{{ name }}{% endraw %} です。
```

`PromptTemplate` を使用して、相対インクルードパスを解決するための `workingDir` を提供することで、この構造をレンダリングできます。

```typescript
import { PromptTemplate } from "packages/core/src/prompt/template.ts";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";

// メインテンプレートファイルへのパス
const templatePath = '/path/to/your/prompts/main-prompt.md';
const workingDir = nodejs.path.dirname(templatePath);

// main-prompt.md の内容を読み取ったと仮定します
const templateContent = 'あなたはプロのチャットボットです。\n\n{% include "./personality.md" %}';

const template = PromptTemplate.from(templateContent);

const formattedPrompt = await template.format(
  { name: "Alice" },
  { workingDir: workingDir } // インクルードのために workingDir を提供します
);

console.log(formattedPrompt);
// 出力:
// あなたはプロのチャットボットです。
//
// あなたの名前は Alice です。
```

### チャットメッセージテンプレート

チャットベースのモデル向けに、このライブラリは会話におけるさまざまな役割を表すクラスのセットを提供し、複数ターンの対話を簡単に構築できるようにします。

*   `SystemMessageTemplate`: システムレベルの指示を表します。
*   `UserMessageTemplate`: ユーザーからのメッセージを表します。
*   `AgentMessageTemplate`: AI agent からのメッセージを表します。
*   `ToolMessageTemplate`: ツール呼び出しの出力を表します。
*   `ChatMessagesTemplate`: メッセージテンプレートの配列を格納するコンテナです。

**例:**

```typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate
} from "packages/core/src/prompt/template.ts";

const conversationTemplate = ChatMessagesTemplate.from([
  SystemMessageTemplate.from("あなたは海賊のように話す、役立つアシスタントです。"),
  UserMessageTemplate.from("私の名前は {% raw %}{{ name }}{% endraw %} です。私の名前は何ですか？"),
]);

const messages = await conversationTemplate.format({ name: "Captain Hook" });

console.log(messages);
// 出力:
// [
//   { role: 'system', content: 'あなたは海賊のように話す、役立つアシスタントです。' },
//   { role: 'user', content: '私の名前は Captain Hook です。私の名前は何ですか？' }
// ]
```

## `PromptBuilder`

`PromptBuilder` は、テンプレート、ユーザー入力、コンテキスト、メモリ、ツール、スキーマなど、すべてのコンポーネントを最終的なモデル対応の `ChatModelInput` オブジェクトに組み立てる高レベルのクラスです。

### 仕組み

ビルダーは、`build` メソッド内にカプセル化された明確なプロセスに従います。
1.  **指示の解決**: 文字列または `ChatMessagesTemplate` である基本の指示から開始します。
2.  **メモリの統合**: agent がメモリを使用するように設定されている場合、ビルダーはそれらを取得し、チャットメッセージにフォーマットします。
3.  **ユーザー入力の追加**: 現在のユーザーメッセージと添付ファイルを追加します。
4.  **ツールの設定**: agent と現在のコンテキストから利用可能なすべてのツール（スキル）を収集し、モデル用にフォーマットして、`toolChoice` 戦略を決定します。
5.  **レスポンス形式の設定**: `outputSchema` が提供されている場合、モデルの `responseFormat` を設定して、構造化された出力（例：JSON）を保証します。

### 例

以下は、`PromptBuilder` が完全なリクエストを組み立てる方法を示す包括的な例です。

```typescript
import { PromptBuilder } from "packages/core/src/prompt/prompt-builder.ts";
import { AIAgent } from "packages/core/src/agents/ai-agent.ts";
import { z } from "zod";

// 1. 指示と出力スキーマを持つエージェントを定義します
const myAgent = new AIAgent({
  name: "UserExtractor",
  description: "テキストからユーザーの詳細を抽出します。",
  instructions: "以下のテキストからユーザーの名前と年齢を抽出してください。",
  outputSchema: z.object({
    name: z.string().describe("ユーザーのフルネーム"),
    age: z.number().describe("ユーザーの年齢（年単位）"),
  }),
});

// 2. PromptBuilder インスタンスを作成します
const builder = new PromptBuilder();

// 3. ユーザーの入力メッセージを定義します
const userInput = {
  message: "私の名前は John Doe で、30歳です。",
};

// 4. 最終的な ChatModelInput を構築します
const chatModelInput = await builder.build({
  agent: myAgent,
  input: userInput,
});

console.log(JSON.stringify(chatModelInput, null, 2));
// 出力:
// {
//   "messages": [
//     {
//       "role": "system",
//       "content": "以下のテキストからユーザーの名前と年齢を抽出してください。"
//     },
//     {
//       "role": "user",
//       "content": [
//         {
//           "type": "text",
//           "text": "私の名前は John Doe で、30歳です。"
//         }
//       ]
//     }
//   ],
//   "responseFormat": {
//     "type": "json_schema",
//     "jsonSchema": {
//       "name": "output",
//       "schema": {
//         "type": "object",
//         "properties": {
//           "name": {
//             "type": "string",
//             "description": "ユーザーのフルネーム"
//           },
//           "age": {
//             "type": "number",
//             "description": "ユーザーの年齢（年単位）"
//           }
//         },
//         "required": ["name", "age"]
//       },
//       "strict": true
//     }
//   }
// }
```