# AFS System FS

このガイドでは、ローカルファイルシステムと対話できるチャットボットを構築する方法を説明します。これらの手順に従うことで、AIGNE File System (AFS) と `SystemFS` モジュールを使用して、お使いのマシン上のファイルをリスト表示、読み取り、書き込み、検索できる Agent を作成します。

## 概要

この例では、AIGNE フレームワークを介してローカルファイルシステムと AI Agent の統合を紹介します。`SystemFS` モジュールはブリッジとして機能し、指定されたローカルディレクトリを AIGNE File System (AFS) にマウントします。これにより、AI Agent は標準化されたツールセットを使用してファイル操作を実行でき、ローカルファイルの内容に基づいて質問に答えたり、タスクを完了したりすることが可能になります。

以下の図は、`SystemFS` モジュールがローカルファイルシステムを AI Agent に接続する方法を示しています。

```d2
direction: down

AI-Agent: {
  label: "AI Agent"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  shape: rectangle

  AFS: {
    label: "AIGNE File System (AFS)"
    shape: rectangle

    SystemFS-Module: {
      label: "SystemFS モジュール"
      shape: rectangle
    }
  }
}

Local-File-System: {
  label: "ローカルファイルシステム"
  shape: rectangle

  Local-Directory: {
    label: "ローカルディレクトリ\n(/path/to/your/project)"
    shape: cylinder
  }
}

AI-Agent <-> AIGNE-Framework.AFS: "3. ファイル操作を実行\n(リスト、読み取り、書き込み、検索)"
AIGNE-Framework.AFS.SystemFS-Module <-> Local-File-System.Local-Directory: "2. ディレクトリをマウント"

```

## 前提条件

次に進む前に、開発環境が以下の要件を満たしていることを確認してください。

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js に含まれています。
*   **OpenAI API キー**: 言語モデルに接続するために必要です。[OpenAI API キーページ](https://platform.openai.com/api-keys)から取得できます。

## クイックスタート

`npx` を使用して、ローカルにインストールすることなくこの例を直接実行できます。

### 例を実行する

ターミナルで以下のコマンドを実行して、ディレクトリをマウントし、チャットボットと対話します。

現在のディレクトリをマウントし、対話型のチャットセッションを開始します。

```bash aigne の依存関係をインストール icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

ドキュメントフォルダなど、特定のディレクトリをマウントします。

```bash aigne の依存関係をインストール icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat
```

対話モードに入らずに、一度だけの質問をします。

```bash aigne の依存関係をインストール icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

### AI モデルに接続する

この例を初めて実行すると、API キーが設定されていないため、CLI は AI モデルへの接続を促します。

![AIGNE Hub への初回接続プロンプト](../../../examples/afs-system-fs/run-example.png)

続行するには3つのオプションがあります。

1.  **公式 AIGNE Hub に接続する**
    これは新規ユーザーに推奨されるオプションです。ブラウザで AIGNE Hub が開き、そこで接続を承認できます。新規ユーザーは、すぐに始められるように無料のトークンが付与されます。

    ![AIGNE Hub での AIGNE CLI の承認ダイアログ](../../../examples/images/connect-to-aigne-hub.png)

2.  **セルフホストの AIGNE Hub 経由で接続する**
    セルフホストの AIGNE Hub インスタンスをお持ちの場合は、このオプションを選択し、その URL を入力して接続を完了します。[Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) から独自の AIGNE Hub をデプロイできます。

    ![セルフホスト AIGNE Hub の URL を入力するプロンプト](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **サードパーティのモデルプロバイダー経由で接続する**
    OpenAI などのプロバイダーから直接 API キーを設定できます。ターミナルで適切な環境変数を設定し、再度この例を実行してください。

    ```bash OpenAI API キーを設定 icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    DeepSeek や Google Gemini などの他のプロバイダーとの設定については、プロジェクトソース内の `.env.local.example` ファイルを参照してください。

### AIGNE Observe でのデバッグ

Agent の動作を監視および分析するには、`aigne observe` コマンドを使用します。これにより、実行トレース、ツール呼び出し、モデルの相互作用の詳細なビューを提供するローカル Web サーバーが起動され、デバッグやパフォーマンスチューニングに非常に役立ちます。

まず、監視サーバーを起動します。

```bash 監視サーバーを起動 icon=lucide:terminal
aigne observe
```

ターミナルはサーバーが実行中であることを確認し、ローカル URL を提供します。

![AIGNE Observe サーバーが起動したことを示すターミナル出力](../../../examples/images/aigne-observe-execute.png)

Agent を実行した後、Web インターフェースで最近の実行リストを表示できます。

![トレースのリストを示す AIGNE Observability Web インターフェース](../../../examples/images/aigne-observe-list.png)

## ローカルインストール

開発目的で、リポジトリをクローンしてローカルでこの例を実行できます。

1.  **リポジトリをクローンする**

    ```bash リポジトリをクローン icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **依存関係をインストールする**
    例のディレクトリに移動し、pnpm を使用して必要なパッケージをインストールします。

    ```bash 依存関係をインストール icon=lucide:terminal
    cd aigne-framework/examples/afs-system-fs
    pnpm install
    ```

3.  **例を実行する**
    `pnpm start` コマンドに必要なフラグを付けて使用します。

    現在のディレクトリで実行します。
    ```bash 現在のディレクトリで実行 icon=lucide:terminal
    pnpm start --path .
    ```

    対話型チャットモードで実行します。
    ```bash チャットモードで実行 icon=lucide:terminal
    pnpm start --path . --chat
    ```

## 仕組み

この例では、`SystemFS` モジュールを使用して、AIGNE File System (AFS) を介してローカルディレクトリを AI Agent に公開します。このサンドボックス化された環境により、Agent は標準化されたインターフェースを使用してファイルと対話し、安全性と制御を確保できます。

### コアロジック

1.  **ディレクトリのマウント**: `SystemFS` クラスは、ローカルの `path` と AFS 内の仮想的な `mount` ポイントでインスタンス化されます。
2.  **Agent の初期化**: `AIAgent` は AFS インスタンスで設定され、`afs_list`、`afs_read`、`afs_write`、`afs_search` などのファイルシステムツールへのアクセス権が与えられます。
3.  **ツール呼び出し**: ユーザーが質問（例：「このプロジェクトの目的は何ですか？」）をすると、Agent は使用する AFS ツールを決定します。最初に `afs_list` を呼び出してディレクトリの内容を確認し、次に `afs_read` を呼び出して `README.md` のような関連ファイルを調べることがあります。
4.  **コンテキストの構築**: ファイルシステムから取得したコンテンツが Agent のコンテキストに追加されます。
5.  **応答の生成**: Agent は、充実したコンテキストを使用して、ユーザーの元の質問に対する包括的な回答を作成します。

以下のコードスニペットは、ローカルディレクトリが AFS にマウントされ、`AIAgent` に提供される方法を示しています。

```typescript index.ts icon=logos:typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { AIAgent } from "@aigne/core";

AIAgent.from({
  // ... 他の設定
  afs: new AFS().use(
    new SystemFS({ mount: '/source', path: '/PATH/TO/YOUR/PROJECT', description: 'プロジェクトのコードベース' }),
  ),
  afsConfig: {
    injectHistory: true,
  },
});
```

### SystemFS の主な機能

*   **ファイル操作**: 標準のリスト、読み取り、書き込み、検索機能。
*   **再帰的トラバーサル**: 深さ制御付きでネストされたディレクトリをナビゲート。
*   **高速コンテンツ検索**: 高性能なテキスト検索のために `ripgrep` を活用。
*   **メタデータアクセス**: ファイルサイズ、タイプ、タイムスタンプなどのファイル詳細を提供。
*   **パスの安全性**: ファイルアクセスをマウントされたディレクトリのみに制限。

## 使用例

チャットボットが実行されたら、自然言語コマンドを発行してファイルと対話できます。

### 基本コマンド

これらのコマンドを試して、簡単なファイル操作を実行してください。

マウントされたディレクトリ内のすべてのファイルをリスト表示します。
```bash ファイルをリスト表示 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "List all files in the root directory"
```

特定のファイルの内容を読み取ります。
```bash ファイルを読み取る icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Read the contents of package.json"
```

すべてのファイルでコンテンツを検索します。
```bash コンテンツを検索 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Find all files containing the word 'example'"
```

### 対話型チャットプロンプト

より会話的な体験のために、対話セッションを開始します。

```bash 対話モードを開始 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

チャットモードに入ったら、次のように尋ねてみてください。

*   「このディレクトリにはどんなファイルがありますか？」
*   「READMEファイルの内容を見せてください。」
*   「すべてのTypeScriptファイルを見つけてください。」
*   「コードベース内の関数を検索してください。」
*   「`notes.txt` という名前の新しいファイルに何かコンテンツを書いて作成してください。」
*   「深さ制限2で、すべてのファイルを再帰的にリスト表示してください。」

## まとめ

この例では、AI Agent の機能を拡張してローカルファイルシステムの対話を含める方法を実践的に示します。`SystemFS` モジュールを使用することで、自然言語コマンドに基づいてタスクを自動化し、情報を取得し、ファイルを整理する強力なチャットボットを作成できます。

より高度な例やワークフローについては、他のドキュメントセクションをご覧ください。

<x-cards data-columns="2">
  <x-card data-title="メモリ" data-href="/examples/memory" data-icon="lucide:brain-circuit">
  チャットボットに永続的なメモリを与える方法を学びます。
  </x-card>
  <x-card data-title="ワークフローオーケストレーション" data-href="/examples/workflow-orchestration" data-icon="lucide:milestone">
  複雑なワークフローで複数の Agent を調整する方法を発見します。
  </x-card>
</x-cards>