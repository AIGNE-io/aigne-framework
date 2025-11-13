# メモリ

あなたのことを記憶するチャットボットを構築したいですか？このガイドでは、AIGNE フレームワークと `FSMemory` プラグインを使用して、永続的なメモリを持つチャットボットを作成する方法を実演します。Agent が以前の会話から情報を思い出すことを可能にし、より連続的で文脈を意識した対話につながる方法を学びます。

## 概要

チャットボットが真に効果的であるためには、過去の対話を記憶する必要があります。この例では、`FSMemory` プラグインを使用してこれを実現する方法を紹介します。このプラグインは会話データをローカルファイルシステムに保存します。これにより、チャットボットは異なるセッション間で状態を維持し、よりパーソナライズされたユーザーエクスペリエンスを提供できます。

このドキュメントでは、この例を実行し、AI モデルに接続し、メモリがどのように記録され、取得されるかのメカニズムを理解するためのガイドを提供します。分散ストレージを使用した代替の永続化方法については、[DID スペースメモリ](./examples-memory-did-spaces.md)の例を参照してください。

## 前提条件

始める前に、以下のものがあることを確認してください：

*   **Node.js**: バージョン 20.0 以上。
*   **OpenAI API キー**: OpenAI モデルに接続するには API キーが必要です。[OpenAI Platform](https://platform.openai.com/api-keys) から取得できます。

## クイックスタート

`npx` のおかげで、ローカルにインストールすることなく、ターミナルから直接この例を実行できます。

### 例を実行する

以下のコマンドを実行してください。最初のコマンドはチャットボットに情報の一部を与え、2番目のコマンドはその情報を思い出す能力をテストします。

```sh メモリ付きでチャットボットを実行 icon=lucide:terminal
npx -y @aigne/example-memory --input 'I like blue color'
npx -y @aigne/example-memory --input 'What is my favorite color?'
```

より自然な、双方向の会話を行うには、インタラクティブモードでチャットボットを起動できます。

```sh インタラクティブチャットモードで実行 icon=lucide:terminal
npx -y @aigne/example-memory --chat
```

### AI モデルに接続する

Agent は機能するために AI モデルに接続する必要があります。初めてこの例を実行すると、接続方法を選択するよう求められます。

#### 1. AIGNE Hub (推奨)

最も簡単な方法は、公式の AIGNE Hub を介して接続することです。最初のオプションを選択すると、認証のためにブラウザが開きます。新規ユーザーは、開始するために自動的に十分なトークン割り当てを受け取ります。

![AIGNE Hub に接続](../images/connect-to-aigne-hub.png)

#### 2. セルフホストの AIGNE Hub

組織がセルフホストの AIGNE Hub を使用している場合は、2番目のオプションを選択し、接続するためにインスタンスの URL を提供してください。

![セルフホストの AIGNE Hub に接続](../images/connect-to-self-hosted-aigne-hub.png)

#### 3. サードパーティのモデルプロバイダー

OpenAI のようなサードパーティプロバイダーに直接接続することもできます。これを行うには、例を実行する前に API キーを環境変数として設定します。

```sh OpenAI API キーを設定 icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

キーを設定した後、再度 `npx` コマンドを実行してください。その他の設定例については、プロジェクトソースの `.env.local.example` ファイルを参照してください。

## ローカルへのインストール

コードを調べたり、変更を加えたい場合は、プロジェクトをローカルにセットアップできます。

### 1. リポジトリをクローンする

まず、GitHub から `aigne-framework` リポジトリをクローンします。

```sh リポジトリをクローン icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

例のディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```sh 依存関係をインストール icon=lucide:terminal
cd aigne-framework/examples/memory
pnpm install
```

### 3. 例を実行する

依存関係がインストールされたら、`start` スクリプトで例を実行できます。

```sh 例をローカルで実行 icon=lucide:terminal
pnpm start
```

## メモリの仕組み

メモリ機能は、AIGNE フレームワークの Augmented File System (AFS) 内の2つのコアモジュール、`history` と `UserProfileMemory` によって実現されています。

### 会話の記録

1.  **履歴のロギング**: ユーザーがメッセージを送信し、AI が応答すると、この会話のペアは AFS の `history` モジュールに保存されます。
2.  **プロファイルの抽出**: `UserProfileMemory` モジュールは会話を分析し、ユーザーの名前や好みなどの主要な詳細を抽出します。この情報は、AFS の `user_profile` モジュールに別途保存されます。

### 会話の取得

ユーザーが新しいメッセージを送信すると、フレームワークは保存された情報を取得して、AI モデルに必要なコンテキストを提供します。

1.  **ユーザープロファイルの注入**: システムはまずユーザーのプロファイルをロードし、`<related-memories>` ブロック内のシステムプロンプトに直接注入します。これにより、Agent は主要な事実をすぐに認識できます。

    ```text メモリ付きのシステムプロンプト
    You are a friendly chatbot
    
    <related-memories>
    - |
      name:
        - name: Bob
      interests:
        - content: likes blue color
    
    </related-memories>
    ```

2.  **会話履歴の注入**: 次に、最近の会話履歴が一連のメッセージにフォーマットされます。この履歴はシステムプロンプトと組み合わされて、AI モデルに送信されます。

    ```json 注入されたチャットメッセージ
    [
      {
        "role": "system",
        "content": "You are a friendly chatbot ..." 
      },
      {
        "role": "user",
        "content": [{ "type": "text", "text": "I'm Bob and I like blue color" }]
      },
      {
        "role": "agent",
        "content": [{ "type": "text", "text": "Nice to meet you, Bob! Blue is a great color.\n\nHow can I help you today?" }]
      },
      {
        "role": "user",
        "content": [{ "type": "text", "text": "What is my favorite color?" }]
      }
    ]
    ```

3.  **応答の生成**: AI モデルは、システムプロンプト、ユーザープロファイル、チャット履歴のペイロード全体を処理して、文脈的に適切な応答を生成します。

    **AI の応答：**
    ```text
    You mentioned earlier that you like the color blue
    ```

## デバッグ

Agent の動作を検査するには、`aigne observe` コマンドを使用します。これにより、実行トレースを詳細かつユーザーフレンドリーなインターフェースで表示するためのローカルウェブサーバーが起動します。これは、デバッグ、パフォーマンスチューニング、および Agent が情報をどのように処理するかを理解するための不可欠なツールです。

![aigne observe を実行](../images/aigne-observe-execute.png)

実行されると、Web UI にアクセスして最近の実行リストを表示し、各コールの詳細をドリルダウンできます。

![aigne observe の最近の実行リスト](../images/aigne-observe-list.png)

## まとめ

この例では、AIGNE フレームワークを使用して永続的なメモリを持つチャットボットを構築する方法を示しました。`FSMemory` プラグインを利用することで、Agent は会話履歴とユーザープロファイルを保存および呼び出し、よりインテリジェントでパーソナライズされた対話を作成できます。

さらに詳しく知るには、これらの関連トピックをご覧ください：

<x-cards data-columns="2">
  <x-card data-title="DID スペースメモリ" data-icon="lucide:database" data-href="/examples/memory-did-spaces">
    DID スペースを使用してメモリの永続化に分散ストレージを使用する方法を学びます。
  </x-card>
  <x-card data-title="コアコンセプト：メモリ" data-icon="lucide:brain-circuit" data-href="/developer-guide/core-concepts/memory">
    AIGNE フレームワークにおけるメモリの背後にあるアーキテクチャの概念を深く掘り下げます。
  </x-card>
</x-cards>