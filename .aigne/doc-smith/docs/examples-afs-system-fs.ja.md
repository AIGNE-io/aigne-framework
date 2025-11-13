「AFS System FS」のサンプルドキュメントに必要なファイルを見つけました。主なソースは `/sources/examples/afs-system-fs/README.md` となり、これが構造、コードスニペット、概念的な説明を提供します。中心となるロジックの例は `/sources/examples/afs-system-fs/index.ts` から引用します。利用可能な画像 `/sources/examples/afs-system-fs/run-example.png` にも注目し、無効な画像パスに関するユーザーのフィードバックに対応するため、正しい場所を確認するか、有効な画像に置き換えます。次のステップは、ドキュメントの草稿作成を開始するために `README.md` を分析することです。# AFS System FS

ローカルファイルと直接かつ安全に対話できるチャットボットを構築したいと思ったことはありませんか？このガイドでは、まさにその方法を説明します。AIGNE File System (AFS) と `SystemFS` モジュールを使用して、AI Agentにサンドボックス化されたアクセス権を付与し、マシン上のファイルの読み取り、書き込み、検索を許可する方法を学びます。これにより、ローカルデータを扱う強力でコンテキスト認識型のアプリケーションを構築できます。

## 概要

この例の中核は `SystemFS` モジュールです。これは AIGNE フレームワークとコンピュータのファイルシステム間の橋渡しとして機能します。ローカルディレクトリを「マウント」することができ、その内容を `afs_list`、`afs_read`、`afs_write`、`afs_search` といった標準的なツールセットを通じて AI Agentがアクセスできるようになります。Agentはこれらのツールを使用して、自然言語のコマンドに基づいてファイル操作を実行できます。これにより、ドキュメントの要約、ファイルの整理、コードベースに関する質問への回答などのユースケースが可能になります。

以下の図は、ユーザー、AI Agent、AFS ツール、およびローカルファイルシステムの関係を示しています。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE フレームワーク"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  AI-Agent: {
    label: "AI Agent"
    shape: rectangle
  }

  AFS-Tools: {
    label: "AFS ツール"
    shape: rectangle
    grid-columns: 2
    afs_list: { label: "afs_list" }
    afs_read: { label: "afs_read" }
    afs_write: { label: "afs_write" }
    afs_search: { label: "afs_search" }
  }

  SystemFS-Module: {
    label: "SystemFS モジュール"
    shape: rectangle
  }
}

Local-File-System: {
  label: "ローカルファイルシステム\n（サンドボックス化）"
  shape: cylinder
}

User -> AIGNE-Framework.AI-Agent: "自然言語コマンド"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS-Tools: "適切なツールを選択"
AIGNE-Framework.AFS-Tools -> AIGNE-Framework.SystemFS-Module: "ツール操作を呼び出し"
AIGNE-Framework.SystemFS-Module -> Local-File-System: "ファイル I/O を実行"
Local-File-System -> AIGNE-Framework.SystemFS-Module: "ファイルの内容/ステータスを返す"
AIGNE-Framework.SystemFS-Module -> AIGNE-Framework.AI-Agent: "ツールの結果を返す"
AIGNE-Framework.AI-Agent -> User: "コンテキストに応じた応答"

```

## 前提条件

始める前に、お使いのシステムが以下の要件を満たしていることを確認してください：

*   **Node.js**: バージョン 20.0 以上。
*   **npm**: Node.js のインストールに含まれています。
*   **OpenAI API キー**: AI Agentが OpenAI のモデルに接続するために有効な API キーが必要です。キーは [OpenAI Platform](https://platform.openai.com/api-keys) から取得できます。

ソースコードからこの例を実行する予定がある場合は、以下も推奨されます：

*   **pnpm**: 効率的なパッケージ管理のため。
*   **Bun**: サンプルや単体テストの実行のため。

## クイックスタート

完全なリポジトリをクローンすることなく、`npx` を使用してターミナルから直接この例を実行できます。これが最も早く動作を確認する方法です。

### 例を実行する

ターミナルを開き、以下のいずれかのコマンドを選択してください。

カレントディレクトリをマウントし、対話型のチャットセッションを開始する場合：

```bash チャットモードで実行 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

特定のディレクトリをカスタム名と説明でマウントする場合：

```bash 特定のディレクトリをマウント icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat
```

対話型チャットを開始せずに単一の質問をする場合：

```bash 単一の質問をする icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

### AIモデルに接続する

初めてこの例を実行すると、AI モデルへの接続を求められます。

![AIモデルに接続する](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-aigne-hub.png)

主な選択肢は3つあります：

1.  **公式 AIGNE Hub を経由して接続する**: これが推奨オプションです。ブラウザで公式 AIGNE Hub が開き、サインインできます。新規ユーザーは、開始するための無料トークン割り当てを受け取ります。
2.  **セルフホストの AIGNE Hub を経由して接続する**: 独自の AIGNE Hub インスタンスを実行している場合は、このオプションを選択し、その URL を入力します。
3.  **サードパーティのモデルプロバイダー経由で接続する**: API キーを含む環境変数を設定することで、OpenAI のようなプロバイダーに直接接続できます。

OpenAI に接続するには、ターミナルで `OPENAI_API_KEY` 環境変数を設定します：

```bash OpenAI APIキーを設定 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

キーを設定した後、再度 `npx` コマンドを実行してください。サポートされているプロバイダーとその必要な環境変数の完全なリストについては、この例の `.env.local.example` ファイルを参照してください。

## ソースからのインストール

ソースコードを確認したり、変更を加えたい場合は、以下の手順に従ってローカルでこの例を実行してください。

### 1. リポジトリをクローンする

```bash リポジトリをクローンする icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

例のディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash 依存関係をインストールする icon=lucide:terminal
cd aigne-framework/examples/afs-system-fs
pnpm install
```

### 3. 例を実行する

`pnpm start` コマンドを目的のフラグ付きで実行します。

カレントディレクトリをマウントして実行する場合：

```bash カレントディレクトリで実行 icon=lucide:terminal
pnpm start --path .
```

対話型チャットモードで実行する場合：

```bash チャットモードで実行 icon=lucide:terminal
pnpm start --path . --chat
```

## 仕組み

この例では `AIAgent` を初期化し、`SystemFS` モジュールを使用してローカルファイルシステムへのアクセス権を付与します。

### ローカルディレクトリのマウント

`SystemFS` クラスは、ローカルの `path` を AFS 内の仮想 `mount` ポイントにマウントするために使用されます。この設定は新しい `AFS` インスタンスに渡され、それが `AIAgent` にアタッチされます。Agentは、マウントされたファイルシステムを使用してユーザーのクエリに答えるよう指示されます。

```typescript index.ts icon=logos:typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  name: "afs-system-fs-chatbot",
  instructions:
    "You are a friendly chatbot that can retrieve files from a virtual file system. You should use the provided functions to list, search, and read files as needed to answer user questions. The current folder points to the /fs mount point by default.",
  inputKey: "message",
  afs: new AFS().use(
    new SystemFS({
      mount: '/fs',
      path: './',
      description: 'Mounted file system'
    }),
  ),
  afsConfig: {
    injectHistory: true,
  },
});
```

### Agentの対話フロー

ユーザーが質問をすると、AI Agentは自律的にどの AFS ツールを使用して答えを見つけるかを決定します。

1.  **ユーザー入力**: ユーザーが「このプロジェクトの目的は何ですか？」のような質問をします。
2.  **ツール呼び出し（リスト）**: Agentはファイル構造を理解する必要があると判断し、`afs_list` ツールを呼び出してルートディレクトリ内のファイルを確認します。
3.  **ツール呼び出し（読み取り）**: `README.md` のような関連ファイルを特定した後、Agentは `afs_read` ツールを呼び出してその内容にアクセスします。
4.  **コンテキストに応じた応答**: ファイルの内容がAgentのコンテキストに追加されます。Agentはこの新しい情報を使用して、ユーザーの元の質問に対する詳細な回答を構築します。

このプロセス全体は自律的です。Agentは手動のガイダンスなしに、ツールの呼び出しを連鎖させ、コンテキストを収集し、応答を形成します。

## 使用例

チャットボットが実行されたら、様々なコマンドを発行してマウントされたファイルと対話できます。

### 基本的なファイル操作

```bash すべてのファイルをリスト表示 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "List all files in the root directory"
```

```bash 特定のファイルを読み取る icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Read the contents of package.json"
```

```bash コンテンツを検索 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Find all files containing the word 'example'"
```

### 対話型チャット

より会話的な体験を求める場合は、対話モードを開始してください。

```bash 対話型チャットを開始 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

チャット内に入ったら、次のような質問を試してみてください：

*   「このディレクトリにはどんなファイルがありますか？」
*   「READMEファイルの内容を見せてください。」
*   「すべてのTypeScriptファイルを見つけてください。」
*   「`notes.txt` という新しいファイルを作成し、内容は『プロジェクトのドキュメントを完成させる』にしてください。」
*   「深さ制限2ですべてのファイルを再帰的にリスト表示してください。」

## デバッグ

AIGNE CLI には、Agentの動作を分析およびデバッグするのに役立つ `observe` コマンドが含まれています。これは、ツール呼び出し、モデル入力、最終出力を含む実行トレースを検査するためのインターフェースを備えたローカルウェブサーバーを起動します。

まず、ターミナルで観測サーバーを起動します：

```bash 観測サーバーを起動 icon=lucide:terminal
aigne observe
```

![AIGNE観測サーバーを起動する](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-execute.png)

Agentタスクを実行した後、ウェブインターフェースを開いて最近の実行リストを表示し、各ステップの詳細を掘り下げることができます。

![最近の実行リストを表示する](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-list.png)

## まとめ

この例では、AI Agentの機能をローカルファイルシステムに拡張するための実践的なガイドを提供します。`SystemFS` を使用することで、ユーザーのローカルデータや環境と深く統合された高度なアプリケーションを構築できます。

その他の例や高度な機能については、以下のドキュメントを参照してください：

<x-cards data-columns="2">
  <x-card data-title="メモリ" data-icon="lucide:brain-circuit" data-href="/examples/memory">
  FSMemory プラグインを使用して永続的なメモリを持つチャットボットを作成する方法を学びます。
  </x-card>
  <x-card data-title="MCP サーバー" data-icon="lucide:server" data-href="/examples/mcp-server">
  AIGNE Agentを Model Context Protocol (MCP) サーバーとして実行する方法を発見します。
  </x-card>
</x-cards>