# メモリ

このガイドでは、以前の会話を記憶するチャットボットを構築するためのステップバイステップのプロセスを説明します。これらの指示に従うことで、`FSMemory` プラグインを使用してセッションデータを永続化し、継続的で文脈を認識した対話を可能にするステートフルな Agent を作成します。

## 概要

この例では、AIGNE フレームワークを使用してチャットボットにメモリを実装する方法を実演します。Agent は `FSMemory` プラグインを活用し、会話履歴とユーザープロファイル情報をローカルファイルシステムに保存します。これにより、チャットボットはセッション内の過去の対話を思い出すことができ、よりパーソナライズされた一貫性のあるユーザーエクスペリエンスを提供します。

## 前提条件

先に進む前に、開発環境が以下の要件を満たしていることを確認してください：

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js のインストールに含まれています。
*   **OpenAI API キー**: OpenAI モデルに接続するために必要です。[OpenAI API keys](https://platform.openai.com/api-keys) ページからキーを取得できます。

## クイックスタート

この例は、ローカルにインストールせずに `npx` を使用して直接実行できます。

### 例を実行する

ターミナルで以下のコマンドを実行して、メモリ対応のチャットボットと対話します。最初のコマンドはボットにあなたの好みを伝え、2番目のコマンドはその情報を思い出す能力をテストします。

```bash メモリ付きチャットボットを実行する icon=lucide:terminal
# 最初のメッセージを送信して事実を確立する
npx -y @aigne/example-memory --input 'I like blue color'

# 2番目のメッセージを送信してチャットボットのメモリをテストする
npx -y @aigne/example-memory --input 'What is my favorite color?'
```

継続的な会話を行うには、チャットボットを対話モードで実行します：

```bash 対話型チャットモードで実行する icon=lucide:terminal
npx -y @aigne/example-memory --chat
```

### AIモデルへの接続

チャットボットが機能するには、大規模言語モデル（LLM）への接続が必要です。モデルプロバイダーを設定していない場合、初回実行時に CLI が接続方法を選択するように促します。

![AI モデルの初回接続プロンプト](../../../examples/memory/run-example.png)

AIモデルに接続するには、主に3つのオプションがあります：

#### 1. 公式 AIGNE Hub 経由で接続（推奨）

これが最も簡単な方法です。AIGNE Hub は、さまざまなモデルへのアクセスを提供し、新規ユーザー向けの無料クレジットも含まれているサービスです。

1.  最初のオプション `Connect to the Arcblock official AIGNE Hub` を選択します。
2.  ウェブブラウザが開き、AIGNE Hub の認証ページが表示されます。
3.  画面の指示に従って接続を承認します。新規ユーザーは40万トークンの無料グラントを受け取ります。

![AIGNE Hub に接続するために AIGNE CLI を承認する](../../../examples/images/connect-to-aigne-hub.png)

#### 2. セルフホストの AIGNE Hub 経由で接続

組織が AIGNE Hub のプライベートインスタンスを運用している場合、直接接続できます。

1.  2番目のオプション `Connect to your self-hosted AIGNE Hub` を選択します。
2.  プロンプトが表示されたら、セルフホストの AIGNE Hub インスタンスの URL を入力します。
3.  その後のプロンプトに従って接続を完了します。

セルフホストの AIGNE Hub のデプロイ手順については、[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) を参照してください。

![セルフホストの AIGNE Hub の URL を入力する](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. サードパーティのモデルプロバイダー経由で接続

適切な API キーを環境変数として設定することで、OpenAI などのサードパーティのモデルプロバイダーに直接接続できます。

例えば、OpenAI に接続するには、`OPENAI_API_KEY` 環境変数を設定します：

```bash OpenAI API キーを設定する icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key" # 実際のキーに置き換えてください
```

環境変数を設定した後、再度この例を実行してください。サポートされているプロバイダーとその対応する環境変数のリストについては、[`.env.local.example`](https://github.com/AIGNE-io/aigne-framework/blob/main/examples/memory/.env.local.example) ファイルを参照してください。

## メモリの仕組み

メモリ機能は、AIGNE フレームワークの Augmented File System（AFS）のコンポーネントである `history` および `UserProfileMemory` モジュールを使用して実装されています。

以下の図は、チャットボットが会話全体の文脈を維持するために情報を記録し、取得する方法を示しています。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  shape: rectangle

  AI-Agent: {
    label: "AI Agent"
  }

  UserProfileMemory: {
    label: "UserProfileMemory"
  }

  AFS: {
    label: "拡張ファイルシステム (AFS)"
    shape: rectangle
    style: {
      stroke: "#888"
      stroke-width: 2
      stroke-dash: 4
    }

    history: {
      label: "history"
      shape: cylinder
    }

    user-profile: {
      label: "user_profile"
      shape: cylinder
    }
  }
}

AI-Model: {
  label: "AI モデル (LLM)"
}

# 記録フロー
User -> AIGNE-Framework.AI-Agent: "1. メッセージを送信"
AIGNE-Framework.AI-Agent -> User: "2. 応答を受信"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.history: "3. 会話を保存"
AIGNE-Framework.UserProfileMemory -> AIGNE-Framework.AFS.history: "4. 履歴を分析"
AIGNE-Framework.UserProfileMemory -> AIGNE-Framework.AFS.user-profile: "5. 抽出したプロファイルを保存"

# 取得フロー
User -> AIGNE-Framework.AI-Agent: "6. 新しいメッセージを送信"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.user-profile: "7. ユーザープロファイルを読み込む"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.history: "8. チャット履歴を読み込む"
AIGNE-Framework.AI-Agent -> AI-Model: "9. コンテキスト付きのプロンプトを送信"
AI-Model -> AIGNE-Framework.AI-Agent: "10. 応答を生成"
AIGNE-Framework.AI-Agent -> User: "11. 情報に基づいた応答を配信"
```

### 会話の記録

1.  ユーザーがメッセージを送信し、応答を受け取った後、会話のペア（ユーザー入力とAI出力）がAFSの `history` モジュールに保存されます。
2.  同時に、`UserProfileMemory` モジュールが会話履歴を分析して、ユーザープロファイルの詳細（例：名前、好み）を抽出および推測します。この情報はAFSの `user_profile` モジュールに保存されます。

### 会話の取得

新しいユーザーメッセージが受信されると、フレームワークは保存された情報を取得してAIモデルにコンテキストを提供します。

1.  **ユーザープロファイルの読み込み**: Agent は `UserProfileMemory` からデータを読み込み、それをシステムプロンプトに挿入します。これにより、AIは最初からユーザーのプロファイルを認識できます。

    ```text メモリ付きシステムプロンプト
    You are a friendly chatbot

    <related-memories>
    - |
      name:
        - name: Bob
      interests:
        - content: likes blue color

    </related-memories>
    ```

2.  **会話履歴の挿入**: `history` モジュールからの最近の会話のターンがメッセージリストに追加され、直近の会話コンテキストが提供されます。

    ```json 履歴付きチャットメッセージ
    [
      {
        "role": "system",
        "content": "You are a friendly chatbot ..."
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "I'm Bob and I like blue color"
          }
        ]
      },
      {
        "role": "agent",
        "content": [
          {
            "type": "text",
            "text": "Nice to meet you, Bob! Blue is a great color.\n\nHow can I help you today?"
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is my favorite color?"
          }
        ]
      }
    ]
    ```

3.  **応答の生成**: AIモデルは、ユーザープロファイルを含むシステムプロンプトと最近のチャット履歴を含む完全なコンテキストを処理し、情報に基づいた応答を生成します。

    **AIの応答:**

    ```text
    You mentioned earlier that you like the color blue
    ```

## デバッグ

Agent の動作を監視および分析するには、`aigne observe` コマンドを使用できます。このツールは、実行トレース、呼び出しの詳細、およびその他のランタイムデータを検査するためのユーザーインターフェースを提供するローカルウェブサーバーを起動します。

1.  監視サーバーを起動します：

    ```bash AIGNE オブザーバーを起動する icon=lucide:terminal
    aigne observe
    ```

    ![観測可能性サーバーが実行中であることを示すターミナル出力](../../../examples/images/aigne-observe-execute.png)

2.  ブラウザを開き、提供されたローカルURL（通常は `http://localhost:7893`）に移動して、最近の Agent 実行のリストを表示し、そのトレースを検査します。

    ![トレースのリストを表示する Aigne 観測可能性ウェブインターフェース](../../../examples/images/aigne-observe-list.png)

## まとめ

この例では、AIGNE フレームワークを使用して永続的なメモリを持つチャットボットの実装を示しました。`FSMemory` プラグインを活用することで、チャットボットは会話履歴とユーザープロファイル情報を記録および取得でき、より文脈を認識したパーソナライズされた対話につながります。

より高度なメモリ永続化オプションについては、分散ストレージの使用法を示す [DID Spaces メモリ](./examples-memory-did-spaces.md) の例を参照してください。