---
labels: ["Reference"]
---

---
labels: ["リファレンス"]
---

# カスタムAgentの作成

このガイドでは、新しいJavaScript Agentを作成し、それをスキルとしてAIGNEプロジェクトに統合するためのステップバイステップのチュートリアルを提供します。Agentは、アプリケーションに独自の機能を与えるコアな実行可能コンポーネントです。カスタムAgentを作成することで、AIの機能を拡張して、特殊なタスクの実行、外部APIとの連携、またはローカルデータの操作を行うことができます。

### 前提条件

始める前に、AIGNEプロジェクトがセットアップされていることを確認してください。セットアップされていない場合は、まず[はじめに](./getting-started.md)ガイドに従ってプロジェクトを作成してください。

### ステップ1：スキルファイルの作成

AIGNEにおけるスキルとは、プライマリ関数といくつかのメタデータをエクスポートするJavaScriptモジュールです。この関数には、Agentが実行するロジックが含まれています。

挨拶を生成するシンプルなAgentを作成してみましょう。AIGNEプロジェクトのルートに`greeter.js`という名前の新しいファイルを作成し、以下のコードを追加します：

```javascript greeter.js icon=logos:javascript
export default async function greet({ name }) {
  const message = `Hello, ${name}!`;
  console.log(message);
  return { message };
}

greet.description = "挨拶メッセージを返すシンプルなAgentです。";

greet.input_schema = {
  type: "object",
  properties: {
    name: { type: "string", description: "挨拶に含める名前。" },
  },
  required: ["name"],
};

greet.output_schema = {
  type: "object",
  properties: {
    message: { type: "string", description: "完全な挨拶メッセージ。" },
  },
  required: ["message"],
};
```

このファイルを詳しく見ていきましょう：

- **`export default async function greet({ name })`**: これはAgentのメイン関数です。`input_schema`で定義された入力を含む単一のオブジェクトを引数として受け取ります。`output_schema`に準拠するオブジェクトを返します。
- **`greet.description`**: Agentが何をするかの平文の説明です。メインの言語モデルがこの説明を使って、いつ、どのようにツールを使用するかを理解するため、これは非常に重要です。
- **`greet.input_schema`**: Agentの期待される入力を定義するJSONスキーマオブジェクトです。これにより、関数に渡されるデータが有効であることが保証されます。
- **`greet.output_schema`**: Agentの期待される出力を定義するJSONスキーマオブジェクトです。

### ステップ2：スキルをプロジェクトに統合する

スキルを作成したら、プロジェクトの設定ファイルに登録して、メインのチャットAgentが使用できるようにする必要があります。

1.  プロジェクトのルートにある`aigne.yaml`ファイルを開きます。
2.  新しい`greeter.js`ファイルを`skills`リストに追加します。

```yaml aigne.yaml icon=mdi:file-cog-outline
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
skills:
  - sandbox.js
  - filesystem.yaml
  - greeter.js # ここに新しいスキルを追加します
```

このリストにスクリプトを追加することで、プライマリチャットAgentが会話中に呼び出せるツールとして利用可能になります。

### ステップ3：Agentを直接テストする

スキルを作成し、登録したら、テストをします。`aigne run`を使用して、コマンドラインから直接スキルファイルを実行できます。

ターミナルで次のコマンドを実行します：

```bash icon=mdi:console
aigne run ./greeter.js --input '{"name": "AIGNE Developer"}'
```

このコマンドは`greeter.js`スクリプトを実行し、`--input`フラグからのJSON文字列をエクスポートされた関数への引数として渡します。Agentが期待通りに動作することを確認する、以下の出力が表示されるはずです：

```json icon=mdi:code-json
{
  "result": {
    "message": "Hello, AIGNE Developer!"
  }
}
```

### ステップ4：チャットモードでAgentを使用する

スキルの真の力は、メインのAI Agentが動的にそれらを使用することを決定できるときに発揮されます。これを実際に確認するには、プロジェクトを対話型チャットモードで実行します：

```bash icon=mdi:console
aigne run --chat
```

チャットセッションが始まったら、AIに新しいツールを使用するように依頼します。例：

```
> greeterスキルを使って、世界に挨拶してください。
```

AIはリクエストを認識し、その説明に基づいて`greeter`スキルを見つけ、正しいパラメータで実行します。そして、スキルからの出力を使用して応答を生成します。

### 次のステップ

おめでとうございます！カスタムJavaScript Agentの作成、スキルとしての統合、そしてその機能のテストに成功しました。これで、APIへの接続、ファイルの管理、その他スクリプト化できるあらゆるタスクを実行するための、より複雑なAgentを構築できます。

プロジェクトを他の人と共有する方法については、[Agentのデプロイ](./guides-deploying-agents.md)に関するガイドをご覧ください。