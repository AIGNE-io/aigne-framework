# MCP DID Spaces

このガイドでは、Model Context Protocol（MCP）を介してDID Spacesと統合されたチャットボットを構築する方法を説明します。これらの手順に従うことで、分散ストレージと対話し、事前定義されたスキルを使用してファイルの読み取り、書き込み、一覧表示などの操作を実行できるAgentを作成します。

## 概要

この例では、AIGNEフレームワークとDID SpacesサービスをModel Context Protocol（MCP）を介して統合する方法を紹介します。主な目標は、チャットボットAgentにユーザーのDID Space内でファイルやデータ操作を実行できる一連のスキルを装備させることです。これにより、Agentが外部の分散型サービスと安全に対話する方法を具体的に示します。

以下の図は、チャットボットAgent、MCPサーバー、およびDID Space間の相互作用を示しています。

```d2
direction: down

AIGNE-Framework: {
  label: "AIGNEフレームワーク"
  shape: rectangle

  MCPAgent: {
    label: "チャットボットAgent\n(MCPAgent)"
  }
}

MCP-Server: {
  label: "MCPサーバー"
  shape: rectangle
}

DID-Spaces: {
  label: "DID Spaces"
  shape: cylinder
  icon: "https://www.arcblock.io/image-bin/uploads/fb3d25d6fcd3f35c5431782a35bef879.svg"
}

AIGNE-Framework.MCPAgent -> MCP-Server: "1. 接続 & スキルの発見"
MCP-Server -> AIGNE-Framework.MCPAgent: "2. スキルの提供 (例: list_objects, write_object)"
AIGNE-Framework.MCPAgent -> MCP-Server: "3. スキルの実行 (例: 'report.md' を書き込む)"
MCP-Server -> DID-Spaces: "4. ファイル操作の実行"
DID-Spaces -> MCP-Server: "5. 結果の返却"
MCP-Server -> AIGNE-Framework.MCPAgent: "6. Agentへの結果送信"
```

実証される主な機能は次のとおりです。
- DID Spaces MCPサーバーへの接続。
- 利用可能なスキル（例：`list_objects`、`write_object`）の動的な読み込み。
- メタデータの確認、オブジェクトの一覧表示、新規ファイルの書き込みなどの基本的なファイル操作の実行。
- 結果をマークダウンレポートとして保存。

## 前提条件

始める前に、以下がインストールされ、設定されていることを確認してください。

*   **Node.js**: バージョン20.0以上。
*   **AIモデルプロバイダーのAPIキー**: OpenAIなどのプロバイダーからのAPIキーが必要です。
*   **DID Spaces MCPサーバーの認証情報**: DID SpacesインスタンスのURLと認証キーが必要です。

以下の依存関係は任意であり、クローンしたソースコードから例を実行する場合にのみ必要です。

*   **pnpm**: パッケージ管理用。
*   **Bun**: テストと例の実行用。

## クイックスタート

`npx` を使用して、ローカルにインストールすることなくこの例を直接実行できます。

### 1. 環境変数を設定する

まず、DID Spacesサーバーの認証情報を設定する必要があります。ターミナルを開き、以下の環境変数をエクスポートします。

`DID_SPACES_AUTHORIZATION`キーを取得するには：
1.  Blockletに移動します。
2.  **プロフィール -> 設定 -> アクセスキー** に進みます。
3.  **作成** をクリックし、**認証タイプ** を「シンプル」に設定します。
4.  生成されたキーをコピーします。

```bash 環境変数を設定 icon=lucide:terminal
# あなたのDID Spaces URLに置き換えてください
export DID_SPACES_URL="https://spaces.staging.arcblock.io/app"

# 生成されたアクセスキーに置き換えてください
export DID_SPACES_AUTHORIZATION="blocklet-xxx"
```

### 2. AIモデルに接続する

Agentが機能するためには、大規模言語モデル（LLM）への接続が必要です。初めて例を実行すると、いくつかのオプションでAIモデルに接続するよう求められます。

#### オプションA: AIGNE Hub経由で接続する（推奨）

公式のAIGNE Hub経由で接続することを選択できます。ブラウザが開き、プロセスを案内するページが表示されます。新規ユーザーは、開始するための無料トークン割り当てを受け取ります。または、自己ホスト型のAIGNE Hubインスタンスがある場合は、そのオプションを選択してURLを入力できます。

#### オプションB: サードパーティプロバイダー経由で接続する

OpenAIのようなサードパーティプロバイダーのAPIキーを、環境変数を介して直接設定できます。

```bash OpenAI APIキーを設定 icon=lucide:terminal
export OPENAI_API_KEY="sk-..." # ここにOpenAI APIキーを設定してください
```

異なるモデルプロバイダー（例：DeepSeek、Google Gemini）の設定例については、ソースコード内の `.env.local.example` ファイルを参照してください。

### 3. 例を実行する

環境が設定されたら、次のコマンドを実行してチャットボットを開始します。

```bash 例を実行する icon=lucide:terminal
npx -y @aigne/example-mcp-did-spaces
```

スクリプトは以下の手順を実行します：
1.  MCP DID Spacesサーバーへの接続をテストします。
2.  3つの操作を実行します：メタデータの確認、オブジェクトの一覧表示、ファイルの書き込み。
3.  コンソールに結果を表示します。
4.  完全なマークダウンレポートをローカルファイルシステムに保存し、ファイルパスを表示します。

## 仕組み

この例では、`MCPAgent` を利用してDID Spacesサーバーに接続します。Model Context Protocol（MCP）は標準化されたインターフェースとして機能し、Agentがサーバーによって提供されるスキルを発見し、利用できるようにします。

-   **動的スキル読み込み**: `MCPAgent` はMCPサーバーにクエリを送信し、利用可能なすべてのスキルを動的に読み込みます。これにより、コード内でAgentの能力を事前に定義する必要がなくなります。
-   **安全な認証**: DID Spacesへの接続は、提供された認証情報を使用して保護されます。
-   **リアルタイムな対話**: AgentはDID Spacesとリアルタイムで対話し、操作を実行します。

利用可能なスキルには通常、以下が含まれます。

| スキル | 説明 |
| :--- | :--- |
| `head_space` | DID Spaceに関するメタデータを取得します。 |
| `read_object` | DID Space内のオブジェクトからコンテンツを読み取ります。 |
| `write_object` | DID Space内のオブジェクトにコンテンツを書き込みます。 |
| `list_objects` | DID Space内のディレクトリにあるオブジェクトを一覧表示します。 |
| `delete_object` | DID Spaceからオブジェクトを削除します。 |

## 設定

本番環境では、通常、DID Spaces用に独自のMCPサーバーをホストします。`MCPAgent` は、カスタムエンドポイントを指し、特定の認証トークンを使用するように設定できます。

以下のコードスニペットは、`MCPAgent` をカスタムパラメータで初期化する方法を示しています。

```typescript MCPAgentの初期化
import { MCPAgent } from '@aigne/mcp-agent';

const mcpAgent = await MCPAgent.from({
  url: 'YOUR_MCP_SERVER_URL',
  transport: 'streamableHttp',
  opts: {
    requestInit: {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN',
      },
    },
  },
});
```

## ソースから実行する

リポジトリのローカルクローンから例を実行したい場合は、以下の手順に従ってください。

### 1. リポジトリをクローンする

```bash リポジトリをクローンする icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 依存関係をインストールする

例のディレクトリに移動し、`pnpm` を使用して必要なパッケージをインストールします。

```bash 依存関係をインストール icon=lucide:terminal
cd aigne-framework/examples/mcp-did-spaces
pnpm install
```

### 3. 例を実行する

`pnpm start` コマンドでアプリケーションを開始します。

```bash 例を実行する icon=lucide:terminal
pnpm start
```

## テストとデバッグ

### テストの実行

統合が正しく機能していることを確認するために、テストスイートを実行できます。テストはMCPサーバーに接続し、利用可能なスキルを一覧表示し、基本的なDID Spaces操作を実行します。

```bash テストスイートを実行 icon=lucide:terminal
pnpm test:llm
```

### Agentの動作を監視する

`aigne observe` コマンドは、Agentの実行データを監視および分析するためのローカルウェブサーバーを起動します。このツールは、デバッグ、パフォーマンスチューニング、およびAgentがモデルやツールとどのように相互作用するかを理解するために不可欠です。トレースを検査し、詳細な呼び出し情報を表示するための使いやすいインターフェースを提供します。

```bash 監視サーバーを起動 icon=lucide:terminal
aigne observe
```

## まとめ

この例では、Model Context Protocolを使用してAIGNE AgentをDID Spacesのような外部サービスと統合するための実践的なガイドを提供しました。分散ストレージ操作を実行できるAgentの設定、実行、テストの方法を学びました。

関連する概念の詳細については、以下のドキュメントを参照してください。

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-href="/developer-guide/agents/mcp-agent" data-icon="lucide:box">MCPAgentとそれが外部サービスとどのように相互作用するかについて詳しく学びます。</x-card>
  <x-card data-title="DID Spaces メモリ" data-href="/examples/memory-did-spaces" data-icon="lucide:database">永続的なAgentメモリとしてDID Spacesを使用する例をご覧ください。</x-card>
</x-cards>