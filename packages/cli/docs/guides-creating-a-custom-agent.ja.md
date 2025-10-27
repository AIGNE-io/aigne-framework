---
labels: ["Reference"]
---

# カスタムAgentの作成

このガイドでは、新しいJavaScript Agentを作成し、スキルとしてAIGNEプロジェクトに統合するためのステップバイステップのチュートリアルを提供します。Agentは、アプリケーションに独自の機能を与える中核的な実行コンポーネントです。カスタムAgentを作成することで、AIの機能を拡張して、特殊なタスクを実行したり、外部APIと対話したり、ローカルデータを操作したりできます。

### 前提条件

開始する前に、AIGNEプロジェクトがセットアップされていることを確認してください。まだの場合は、まず[スタートガイド](./getting-started.md)に従って作成してください。

### ステップ1：スキルファイルの作成

AIGNEにおけるスキルとは、主要な関数といくつかのメタデータをエクスポートするJavaScriptモジュールです。この関数には、Agentが実行するロジックが含まれています。

挨拶を生成するシンプルなAgentを作成しましょう。AIGNEプロジェクトのルートに`greeter.js`という名前の新しいファイルを作成し、次のコードを追加します。

```javascript greeter.js icon=logos:javascript
export default async function greet({ name }) {
  const message = `Hello, ${name}!`;
  console.log(message);
  return { message };
}

greet.description = "挨拶メッセージを返すシンプルなAgent。";

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

このファイルを詳しく見ていきましょう。

- **`export default async function greet({ name })`**: これはAgentのメイン関数です。`input_schema`で定義された入力を含む単一のオブジェクトを引数として受け取ります。`output_schema`に準拠するオブジェクトを返す必要があります。
- **`greet.description`**: Agentが何をするかの平文の説明です。これは、メインの言語モデルがいつ、どのようにツールを使用するかを理解するために非常に重要です。
- **`greet.input_schema`**: Agentの期待される入力を定義するJSONスキーマオブジェクトです。これにより、関数に渡されるデータが有効であることが保証されます。
- **`greet.output_schema`**: Agentからの期待される出力を定義するJSONスキーマオブジェクトです。

### ステップ2：スキルをプロジェクトに統合する

スキルを作成したので、メインのチャットAgentがそれを使用できるように、プロジェクトの設定ファイルに登録する必要があります。

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
  - greeter.js # 新しいスキルをここに追加
```

このリストにスクリプトを追加することで、プライマリチャットAgentが会話中に呼び出すことができるツールとして利用可能になります。

### ステップ3：Agentを直接テストする

スキルが作成され、登録されたら、テストの時間です。`aigne run`を使用して、コマンドラインから直接任意のスキルファイルを実行できます。

ターミナルで次のコマンドを実行します。

```bash icon=mdi:console
aigne run ./greeter.js --input '{"name": "AIGNE Developer"}'
```

このコマンドは`greeter.js`スクリプトを実行し、`--input`フラグからのJSON文字列をエクスポートされた関数に引数として渡します。次の出力が表示され、Agentが期待どおりに動作することを確認できます。

```json icon=mdi:code-json
{
  "result": {
    "message": "Hello, AIGNE Developer!"
  }
}
```

### ステップ4：チャットモードでAgentを使用する

スキルの真価は、メインのAI Agentが動的にそれらを使用することを決定できるときに発揮されます。これを実際に確認するには、プロジェクトを対話型のチャットモードで実行します。

```bash icon=mdi:console
aigne run --chat
```

チャットセッションが始まったら、AIに新しいツールを使うように頼んでみましょう。例：

```
> greeterスキルを使って、世界に挨拶してください。
```

AIはリクエストを認識し、その説明に基づいて`greeter`スキルを見つけ、正しいパラメータで実行します。そして、スキルからの出力を使用して応答を生成します。

### 次のステップ

おめでとうございます！カスタムJavaScript Agentの作成、スキルとしての統合、そしてその機能のテストに成功しました。これで、APIに接続したり、ファイルを管理したり、スクリプト化できるその他のタスクを実行したりする、より複雑なAgentを構築できます。

プロジェクトを他の人と共有する方法については、[Agentのデプロイ](./guides-deploying-agents.md)に関するガイドをご覧ください。