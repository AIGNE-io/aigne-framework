# プロンプト

AIモデルとの効果的なコミュニケーションは、提供されるプロンプトの品質と構造に左右されます。AIGNEフレームワークは、`PromptBuilder`クラスと統合されたNunjucksテンプレートエンジンを通じて、動的で再利用可能、かつ構造化されたプロンプトを作成するための堅牢なシステムを提供します。このガイドでは、これらのコンポーネントについて体系的に説明します。

プロンプトがAgent内でどのように利用されるかの詳細については、[AI Agent](./developer-guide-agents-ai-agent.md)のドキュメントを参照してください。

## Nunjucksによるプロンプトのテンプレート化

フレームワークは[Nunjucksテンプレートエンジン](https://mozilla.github.io/nunjucks/)を利用して、動的なプロンプトの作成を容易にします。これにより、変数や外部ファイルのインクルード、その他のプログラムロジックをプロンプトファイル内に直接組み込むことができます。

すべてのプロンプトテキストは`PromptTemplate`クラスによって処理され、Nunjucksを使用して最終的な文字列をレンダリングします。

### 変数置換

`{{ variable_name }}` 構文を使用して、プロンプトにプレースホルダーを定義できます。これらのプレースホルダーは、実行時に実際の値に置き換えられます。

```markdown title="analyst-prompt.md" icon=mdi:text-box
以下のデータを分析してください:

{{ data }}
```

このプロンプトでAgentを呼び出す際には、入力メッセージで`data`変数を提供します。

```typescript title="index.ts" icon=logos:typescript
import { AIGNE, AIAgent } from "@aigne/core";
import { OpenAI }s from "@aigne/openai";

const model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const aigne = new AIGNE({
  model,
  agents: {
    analyst: new AIAgent({
      instructions: { path: "./analyst-prompt.md" },
      inputKey: "data",
    }),
  },
});

const result = await aigne.invoke("analyst", {
  data: "User feedback scores: 8, 9, 7, 10, 6.",
});

console.log(result);
```

### ファイルのインクルード

Nunjucksでは、`{% include "path/to/file.md" %}` タグを使用して、複数のファイルからプロンプトを構成できます。これは、異なるプロンプト間で共通の指示やコンポーネントを再利用するのに非常に効果的です。パスは`include`タグを含むファイルからの相対パスで解決されます。

例えば、共通の指示セットを1つのファイルで定義し、それを別のファイルにインクルードすることができます。

```markdown title="common-instructions.md" icon=mdi:text-box
常にプロフェッショナルかつ事実に基づいた方法で応答してください。
憶測や意見の提供は避けてください。
```

```markdown title="main-prompt.md" icon=mdi:text-box
あなたは熟練の金融アナリストです。

{% include "./common-instructions.md" %}

提供された四半期収益報告書を分析してください。
```

このモジュラーなアプローチにより、プロンプトの管理が簡素化され、一貫性が確保されます。

## ChatMessageTemplateによるプロンプトの構造化

チャットベースのモデルでは、プロンプトはそれぞれが特定の役割を持つメッセージのシーケンスとして構造化されます。フレームワークは、これらのメッセージをプログラムで表現するためのクラスを提供します。

-   **`SystemMessageTemplate`**: AIモデルのコンテキストや高レベルの指示を設定します。
-   **`UserMessageTemplate`**: エンドユーザーからのメッセージを表します。
-   **`AgentMessageTemplate`**: AIモデルからの以前の応答を表し、フューショットプロンプティングや会話の継続に役立ちます。
-   **`ToolMessageTemplate`**: Agentによって行われたツール呼び出しの結果を表します。

これらのテンプレートを`ChatMessagesTemplate`に組み合わせることで、完全な会話プロンプトを定義できます。

```typescript title="structured-prompt.ts" icon=logos:typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";

const promptTemplate = new ChatMessagesTemplate([
  SystemMessageTemplate.from(
    "You are a helpful assistant that translates {{ input_language }} to {{ output_language }}."
  ),
  UserMessageTemplate.from("{{ text }}"),
]);

// このテンプレートは、AIAgentの `instructions` で使用できます。
```

## `PromptBuilder` クラス

`PromptBuilder`は、言語モデルに送信される最終的で完全なプロンプトを組み立てる役割を担う中心的なコンポーネントです。これはプロセス全体を統括し、さまざまな入力を一貫した構造に統合します。

次の図は、`PromptBuilder`への情報の流れを示しています。
<d2>
direction: right
style {
  stroke-width: 2
  font-size: 14
}
"ユーザー入力 (メッセージ)": {
  shape: document
  style.fill: "#D1E7DD"
}
"プロンプトテンプレート (.md)": {
  shape: document
  style.fill: "#D1E7DD"
}
"Agent設定": {
  shape: document
  style.fill: "#D1E7DD"
}
コンテキスト: {
  shape: document
  style.fill: "#D1E7DD"
}
PromptBuilder: {
  shape: hexagon
  style.fill: "#A9CCE3"
}
"ChatModelInput (LLMへ)": {
  shape: document
  style.fill: "#FADBD8"
}

"ユーザー入力 (メッセージ)" -> PromptBuilder
"プロンプトテンプレート (.md)" -> PromptBuilder
"Agent設定" -> PromptBuilder
コンテキスト -> PromptBuilder

PromptBuilder -> "ChatModelInput (LLMへ)"

"Agent設定".children: {
  "スキル/ツール"
  メモリ
  "出力スキーマ"
}

"ChatModelInput (LLMへ)".children: {
  "レンダリング済みメッセージ"
  "ツール定義"
  "レスポンス形式"
}
</d2>

`PromptBuilder`は`build`プロセス中に、以下の操作を自動的に実行します。

1.  **指示の読み込み**: 文字列、ファイルパス、またはMCP `GetPromptResult`オブジェクトからプロンプトテンプレートを読み込みます。
2.  **テンプレートのレンダリング**: Nunjucksを使用してプロンプトテンプレートをフォーマットし、ユーザーの入力メッセージから変数を注入します。
3.  **メモリの注入**: Agentがメモリを使用するように設定されている場合、`PromptBuilder`は関連するメモリを取得し、それらをシステム、ユーザー、またはAgentメッセージに変換して、会話のコンテキストを提供します。
4.  **ツール（スキル）の組み込み**: 利用可能なすべてのスキル（Agent設定と呼び出しコンテキストから）を収集し、モデルの`tools`および`tool_choice`パラメータにフォーマットします。
5.  **レスポンス形式の定義**: Agentが`outputSchema`を持っている場合、`PromptBuilder`はモデルの`responseFormat`を設定して、構造化されたJSON出力を強制します。

### インスタンス化

`PromptBuilder`を作成する最も一般的な方法は、静的な`PromptBuilder.from()`メソッドを使用することです。このメソッドはさまざまなソースを受け入れることができます。

-   **文字列から**:
    ```typescript
    const builder = PromptBuilder.from("You are a helpful assistant.");
    ```
-   **ファイルパスから**:
    ```typescript
    const builder = PromptBuilder.from({ path: "./prompts/my-prompt.md" });
    ```

`AIAgent`が`instructions`とともに定義されると、内部で`PromptBuilder.from()`を使用してプロンプト構築プロセスを作成および管理します。

## まとめ

AIGNEフレームワークは、プロンプトエンジニアリングのための階層的で強力なシステムを提供します。動的コンテンツのためにNunjucksとともに`PromptTemplate`を、そして最終的な構造を編成するために`PromptBuilder`を理解し活用することで、AI Agent用の洗練された、モジュラーで効果的なプロンプトを作成できます。

さらに詳しく知りたい場合は、[AIAgentドキュメント](./developer-guide-agents-ai-agent.md)を参照して、これらのプロンプトがAgentのライフサイクルにどのように統合されるかを確認してください。