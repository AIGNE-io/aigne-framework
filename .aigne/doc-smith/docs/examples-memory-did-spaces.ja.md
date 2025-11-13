このドキュメントでは、DID Spaces と AIGNE フレームワークを使用して、永続的なメモリを持つチャットボットを構築する方法を説明します。`DIDSpacesMemory` プラグインを活用して、Agent が安全で分散化された方法で複数のセッションにわたって会話履歴を保持できるようにする方法を学びます。

# DID Spaces メモリ

## 概要

この例では、永続的なメモリを AI Agent に統合する方法を示します。過去の対話を忘れてしまうステートレスなチャットボットとは異なり、この例では、ユーザーのプロフィール情報を保存し、以前の会話から好みを思い出し、保存されたメモリに基づいてパーソナライズされた応答を提供できる Agent を紹介します。

この機能は、`@aigne/agent-library` の `DIDSpacesMemory` プラグインを使用して実現されます。このプラグインは DID Spaces インスタンスに接続して、会話履歴を保存および取得します。

## 前提条件

先に進む前に、以下がインストールされ、設定されていることを確認してください。

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js に含まれています。
*   **OpenAI API キー**: 言語モデルに必要です。[OpenAI プラットフォーム](https://platform.openai.com/api-keys)から取得してください。
*   **DID Spaces 認証情報**: メモリの永続化に必要です。

## クイックスタート

`npx` を使用すると、ローカルにインストールすることなく、ターミナルから直接この例を実行できます。

### 1. 例を実行する

ターミナルで次のコマンドを実行します。

```bash memory-did-spaces icon=lucide:terminal
npx -y @aigne/example-memory-did-spaces
```

### 2. AI モデルに接続する

Agent は大規模言語モデルへの接続を必要とします。初回実行時には、モデルプロバイダーに接続するよう求められます。

![AI モデルに接続する](https://static.AIGNE.io/aigne-docs/images/examples/run-example.png)

接続オプションはいくつかあります。

*   **AIGNE Hub (公式)**: これが最も簡単な方法です。ブラウザで公式の AIGNE Hub が開き、そこでログインできます。新規ユーザーは無料のトークンを受け取り、すぐに実験を開始できます。

    ![公式 AIGNE Hub に接続する](https://static.AIGNE.io/aigne-docs/images/examples/connect-to-aigne-hub.png)

*   **AIGNE Hub (セルフホスト)**: 独自の AIGNE Hub インスタンスを運用している場合は、このオプションを選択し、その URL を入力します。[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) からセルフホストの AIGNE Hub をデプロイできます。

    ![セルフホスト AIGNE Hub に接続する](https://static.AIGNE.io/aigne-docs/images/examples/connect-to-self-hosted-aigne-hub.png)

*   **サードパーティのモデルプロバイダー**: OpenAI などのプロバイダーに直接接続できます。そのためには、コマンドを実行する前に API キーを環境変数として設定します。

    ```bash OpenAI キーをエクスポート icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    DeepSeek や Google Gemini などのプロバイダーに関する追加の設定オプションについては、ソースリポジトリの `.env.local.example` ファイルを参照してください。

モデル接続を設定した後、再度 `npx` コマンドを実行してチャットボットを開始します。

## ローカルでのインストールと実行

ソースコードを確認したり、変更を加えたい開発者は、次の手順に従ってローカルで例を実行してください。

### 1. リポジトリをクローンする

まず、公式の AIGNE フレームワークリポジトリをクローンします。

```bash リポジトリをクローン icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

例のディレクトリに移動し、pnpm を使用して必要な依存関係をインストールします。

```bash 依存関係をインストール icon=lucide:terminal
cd aigne-framework/examples/memory-did-spaces
pnpm install
```

### 3. 例を実行する

`start` スクリプトを実行してアプリケーションを開始します。

```bash 例を実行 icon=lucide:terminal
pnpm start
```

スクリプトは一連のテストを実行してメモリ機能を示し、結果を Markdown ファイルに保存し、確認のためにコンソールにファイルパスを表示します。

## 仕組み

この例では、`DIDSpacesMemory` プラグインを利用して、Agent に永続的で分散化されたメモリを提供します。次の図は、このワークフローを示しています。

```d2
direction: down

User: {
  shape: c4-person
}

AI-Agent: {
  label: "AI Agent"
  shape: rectangle

  DIDSpacesMemory-Plugin: {
    label: "DIDSpacesMemory Plugin"
  }
}

DID-Spaces: {
  label: "DID Spaces"
  shape: cylinder
  icon: "https://www.arcblock.io/image-bin/uploads/fb3d25d6fcd3f35c5431782a35bef879.svg"
}

User -> AI-Agent: "2. ユーザーがメッセージを送信"
AI-Agent -> User: "7. Agent がコンテキストを認識した応答を送信"

AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "1. 認証情報で初期化"
AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "3. 会話履歴を取得"
DID-Spaces -> AI-Agent.DIDSpacesMemory-Plugin: "4. Agent にコンテキストを提供"
AI-Agent -> AI-Agent.DIDSpacesMemory-Plugin: "5. 新しい対話を処理"
AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "6. 更新された履歴を保存"

```

プロセスは次のとおりです。

1.  **初期化**: Agent は `DIDSpacesMemory` プラグインで初期化され、DID Spaces インスタンスの URL と認証情報で設定されます。
2.  **対話**: チャットボットと対話すると、各ユーザー入力と Agent の応答が記録されます。
3.  **保存**: `DIDSpacesMemory` プラグインは、会話履歴を指定した DID Space に自動的に保存します。
4.  **取得**: 後続のセッションでは、プラグインは過去の会話履歴を取得し、Agent が以前の対話を思い出すために必要なコンテキストを提供します。

この分散化された方法により、メモリは安全でプライベート、かつポータブルであり、ユーザーの DID の管理下に置かれます。

## 設定

この例には、デモンストレーション目的で事前に設定された DID Spaces エンドポイントが含まれています。本番環境では、独自インスタンスを指すように設定を更新する必要があります。

この設定は、`DIDSpacesMemory` プラグインをインスタンス化する際に適用されます。

```typescript memory-config.ts icon=logos:typescript
import { DIDSpacesMemory } from '@aigne/agent-library';

// ...

const memory = new DIDSpacesMemory({
  url: "YOUR_DID_SPACES_URL",
  auth: {
    authorization: "Bearer YOUR_AUTHENTICATION_TOKEN",
  },
});
```

`"YOUR_DID_SPACES_URL"` と `"Bearer YOUR_AUTHENTICATION_TOKEN"` を、ご自身の特定のエンドポイントと認証情報に置き換えてください。

## デバッグ

Agent の動作を監視および分析するには、`aigne observe` コマンドを使用します。このツールは、Agent の実行トレースの詳細なビューを提供するローカル Web サーバーを起動します。これは、デバッグ、情報フローの理解、およびパフォーマンスの最適化に不可欠なツールです。

監視サーバーを開始するには、次を実行します。

```bash aigne-observe icon=lucide:terminal
aigne observe
```

![AIGNE 監視実行](https://static.AIGNE.io/aigne-docs/images/examples/aigne-observe-execute.png)

Web インターフェースには最近の実行リストが表示され、各実行の入力、出力、ツール呼び出し、モデルの相互作用を検査できます。

![AIGNE 監視リスト](https://static.AIGNE.io/aigne-docs/images/examples/aigne-observe-list.png)

## まとめ

この例では、AIGNE フレームワークと DID Spaces を使用して、永続的で分散化されたメモリを AI Agent に統合する機能的なデモンストレーションを提供します。このガイドに従うことで、よりインテリジェントでコンテキストを認識できるチャットボットを作成できます。

さらに詳しく知りたい場合は、以下のセクションを参照してください。
<x-cards data-columns="2">
  <x-card data-title="メモリの概念" data-href="/developer-guide/core-concepts/memory" data-icon="lucide:book-open">AIGNE フレームワークにおけるメモリの仕組みについて詳しく学びます。</x-card>
  <x-card data-title="フレームワークの例" data-href="/examples" data-icon="lucide:layout-template">その他の実用的な例やユースケースを探ります。</x-card>
</x-cards>