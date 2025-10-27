---
labels: ["Reference"]
---

---
labels: ["Reference"]
---

# カスタム Agent の作成

このガイドでは、新しい JavaScript Agent を作成し、それをスキルとして AIGNE プロジェクトに統合するためのステップバイステップのチュートリアルを提供します。Agent は、アプリケーションに独自の機能を与えるコア実行可能コンポーネントです。カスタム Agent を作成することで、AI の機能を拡張して、特殊なタスクを実行したり、外部 API と連携したり、ローカルデータを操作したりできます。

### 前提条件

開始する前に、AIGNE プロジェクトがセットアップされていることを確認してください。セットアップされていない場合は、まず [はじめに](./getting-started.md) ガイドに従って作成してください。

### ステップ 1: スキルファイルを作成する

AIGNE におけるスキルとは、主要な関数といくつかのメタデータをエクスポートする JavaScript モジュールです。この関数には、Agent が実行するロジックが含まれています。

挨拶を生成する簡単な Agent を作成してみましょう。AIGNE プロジェクトのルートに `greeter.js` という名前の新しいファイルを作成し、次のコードを追加します。

```javascript greeter.js icon=logos:javascript
export default async function greet({ name }) {
  const message = `Hello, ${name}!`;
  console.log(message);
  return { message };
}

greet.description = "挨拶メッセージを返すシンプルな Agent です。";

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

このファイルを詳しく見ていきましょう:

- **`export default async function greet({ name })`**: これは Agent のメイン関数です。`input_schema` で定義された入力を含む単一のオブジェクトを引数として受け取ります。`output_schema` で定義された制約に準拠するオブジェクトを返します。
- **`greet.description`**: Agent が何をするかの平文の説明です。メインの言語モデルがこの説明を使用して、いつ、どのようにツールを使用するかを理解するため、これは非常に重要です。
- **`greet.input_schema`**: Agent の期待される入力を定義する JSON スキーマオブジェクトです。これにより、関数に渡されるデータが有効であることが保証されます。
- **`greet.output_schema`**: Agent からの期待される出力を定義する JSON スキーマオブジェクトです。

### ステップ 2: スキルをプロジェクトに統合する

スキルを作成したら、メインのチャット Agent がそれを使用できるように、プロジェクトの設定ファイルに登録する必要があります。

1.  プロジェクトのルートにある `aigne.yaml` ファイルを開きます。
2.  新しい `greeter.js` ファイルを `skills` リストに追加します。

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

このリストにスクリプトを追加することで、プライマリチャット Agent が会話中に呼び出せるツールとして利用できるようになります。

### ステップ 3: Agent を直接テストする

スキルが作成され、登録されたので、テストしてみましょう。`aigne run` を使用して、コマンドラインから直接スキルファイルを実行できます。

ターミナルで次のコマンドを実行します:

```bash icon=mdi:console
aigne run ./greeter.js --input '{"name": "AIGNE Developer"}'
```

このコマンドは `greeter.js` スクリプトを実行し、`--input` フラグからの JSON 文字列をエクスポートされた関数への引数として渡します。次のような出力が表示され、Agent が期待どおりに動作していることを確認できます:

```json icon=mdi:code-json
{
  "result": {
    "message": "Hello, AIGNE Developer!"
  }
}
```

### ステップ 4: チャットモードで Agent を使用する

スキルの真価は、メインの AI Agent が動的にそれらを使用することを決定できるときに発揮されます。これを実際に確認するには、プロジェクトを対話型のチャットモードで実行します:

```bash icon=mdi:console
aigne run --chat
```

チャットセッションが開始されたら、AI に新しいツールを使用するように依頼します。例:

```
> greeter スキルを使って世界に挨拶してください。
```

AI はリクエストを認識し、その説明に基づいて `greeter` スキルを見つけ、正しいパラメータで実行します。そして、スキルからの出力を使用して応答を生成します。

### 次のステップ

おめでとうございます！これで、カスタム JavaScript Agent の作成、スキルとしての統合、そしてその機能のテストに成功しました。これからは、API への接続、ファイルの管理、その他スクリプト化できるあらゆるタスクを実行する、より複雑な Agent を構築できます。

プロジェクトを他の人と共有する方法については、[Agent のデプロイ](./guides-deploying-agents.md) に関するガイドをご覧ください。