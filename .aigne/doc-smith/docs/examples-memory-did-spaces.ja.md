# DID Spaces メモリ

このガイドでは、DID Spaces を使用して永続的なメモリを持つチャットボットを構築する方法を説明します。AIGNE フレームワークの `DIDSpacesMemory` プラグインを活用することで、Agent は分散型かつ安全な方法で、複数のセッションにわたって会話履歴を保持できます。

## 前提条件

始める前に、以下がインストールされ、設定されていることを確認してください：

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js のインストールに含まれています。
*   **OpenAI API キー**: 言語モデルへの接続に必要です。[OpenAI Platform](https://platform.openai.com/api-keys) から取得できます。
*   **DID Spaces の認証情報**: メモリの永続化に必要です。

## クイックスタート

`npx` を使用すると、ローカルに何もインストールせずにこのサンプルを直接実行できます。

### 1. サンプルを実行する

ターミナルで次のコマンドを実行します：

```bash memory-did-spaces サンプルを実行する icon=lucide:terminal
npx -y @aigne/example-memory-did-spaces
```

### 2. AI モデルに接続する

初回実行時、API キーが設定されていないため、CLI は AI モデルへの接続を促します。

![run-example.png](../../../examples/memory-did-spaces/run-example.png)

続行するにはいくつかのオプションがあります：

*   **公式 AIGNE Hub を介して接続する（推奨）**
    これが最も簡単に始める方法です。このオプションを選択すると、ウェブブラウザで公式 AIGNE Hub の認証ページが開きます。画面の指示に従ってウォレットを接続してください。新規ユーザーは、ウェルカムボーナスとして 400,000 トークンを自動的に受け取ります。

    ![公式 AIGNE Hub に接続する](../../../examples/images/connect-to-aigne-hub.png)

*   **セルフホストの AIGNE Hub を介して接続する**
    独自の AIGNE Hub インスタンスをお持ちの場合は、このオプションを選択してください。接続を完了するために、セルフホスト Hub の URL を入力するよう求められます。[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) から独自の AIGNE Hub をデプロイできます。

    ![セルフホストの AIGNE Hub に接続する](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

*   **サードパーティのモデルプロバイダーを介して接続する**
    OpenAI、DeepSeek、Google Gemini などのサードパーティプロバイダーに直接接続することもできます。これを行うには、プロバイダーの API キーを環境変数として設定する必要があります。例えば、OpenAI を使用するには、`OPENAI_API_KEY` 変数を設定します：

    ```bash ここに OpenAI API キーを設定してください icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    環境変数を設定した後、再度 `npx` コマンドを実行してください。

## ローカルでのインストールと実行

ソースコードからサンプルを実行したい場合は、以下の手順に従ってください。

### 1. リポジトリをクローンする

まず、GitHub から AIGNE フレームワークのリポジトリをクローンします：

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

サンプルのディレクトリに移動し、`pnpm` を使用して必要な依存関係をインストールします：

```bash icon=lucide:terminal
cd aigne-framework/examples/memory-did-spaces
pnpm install
```

### 3. サンプルを実行する

最後に、サンプルを開始します：

```bash icon=lucide:terminal
pnpm start
```

スクリプトは、メモリ機能を実証するために3つのテストを実行します：ユーザープロファイルの保存、嗜好の想起、保存されたデータに基づくポートフォリオの作成。結果はコンソールに表示され、確認用にマークダウンレポートファイルに保存されます。

## 仕組み

このサンプルは `@aigne/agent-library` パッケージの `DIDSpacesMemory` プラグインを利用しています。このプラグインにより、Agent は会話履歴を分散型パーソナルデータストレージソリューションである DID Spaces に保存することで、永続化できます。

主な機能は次のとおりです：
*   **分散型の永続化**: 会話はユーザーの DID Space に安全に保存されます。
*   **セッションの継続性**: チャットボットは、再起動後でも以前のやり取りから情報を思い出すことができます。
*   **プライバシーとセキュリティ**: ユーザーデータは分散型識別子（DID）技術を使用して管理され、プライバシーとユーザーコントロールを保証します。

このサンプルでは、ユーザープロファイルの詳細を保存し、新しい対話でそれを思い出し、その記憶されたコンテキストを使用してパーソナライズされた推奨を提供することで、これを実証しています。

## 設定

このサンプルにはデモンストレーション目的で事前設定された DID Spaces エンドポイントが付属していますが、本番アプリケーションでは設定を更新する必要があります。これには、独自の DID Spaces インスタンスを設定し、コード内で正しい URL と認証情報を提供することが含まれます。

```typescript memory-config.ts
import { DIDSpacesMemory } from '@aigne/agent-library';

const memory = new DIDSpacesMemory({
  url: "YOUR_DID_SPACES_URL",
  auth: {
    authorization: "Bearer YOUR_TOKEN",
  },
});
```

`"YOUR_DID_SPACES_URL"` と `"Bearer YOUR_TOKEN"` を実際のエンドポイントと認証トークンに置き換えてください。

## AIGNE Observe を使用したデバッグ

Agent の実行を監視およびデバッグするには、`aigne observe` コマンドを使用できます。このツールは、Agent のトレースを詳細に表示するローカルウェブサーバーを起動し、その動作の理解、問題の診断、パフォーマンスの最適化に役立ちます。

観察サーバーを起動するには、次を実行します：

```bash icon=lucide:terminal
aigne observe
```

![AIGNE Observe サーバー起動中](../../../examples/images/aigne-observe-execute.png)

実行されると、提供された URL（デフォルトでは `http://localhost:7893`）をブラウザで開いて、最近の Agent 実行のリストを表示し、その詳細を検査できます。

![AIGNE Observe トレースリスト](../../../examples/images/aigne-observe-list.png)

## まとめ

このサンプルでは、`DIDSpacesMemory` プラグインを使用して、分散型の永続メモリを AI Agent に統合する方法を示しました。この機能により、セッションを越えてユーザーの対話を記憶する、より洗練されたコンテキスト認識型のチャットボットを作成できます。

関連する概念についてさらに学ぶには、以下のドキュメントを参照してください：
<x-cards data-columns="2">
  <x-card data-title="メモリ" data-href="/developer-guide/core-concepts/memory" data-icon="lucide:brain-circuit">
   AIGNE フレームワークにおける Agent メモリのコアコンセプトについて学びます。
  </x-card>
  <x-card data-title="ファイルシステムメモリ" data-href="/examples/memory" data-icon="lucide:folder">
   メモリの永続化にローカルファイルシステムを使用する別のサンプルをご覧ください。
  </x-card>
</x-cards>