---
labels: ["Reference"]
---

# aigne serve-mcp

AIGNEプロジェクト内のエージェントをModel Context Protocol (MCP) サーバーとして提供します。このコマンドは、ストリーム可能なHTTPエンドポイント経由でエージェントを公開し、MCP標準をサポートする外部システムやアプリケーションとのシームレスな統合を可能にします。

内部では、`aigne serve-mcp` は軽量のExpressサーバーを起動します。設定されたエンドポイントでPOSTリクエストを受信すると、対応するエージェントを呼び出し、MCP仕様に従って応答をストリームで返します。

![MCPサービスの実行](../assets/run-mcp-service.png)

## 使用法

```bash 基本的な使用法 icon=lucide:terminal
aigne serve-mcp [options]
```

## オプション

`serve-mcp` コマンドは、サーバーの動作をカスタマイズするために以下のオプションを受け入れます。

<x-field data-name="--path, --url" data-type="string" data-default="." data-desc="ローカルのエージェントディレクトリへのパス、またはリモートのAIGNEプロジェクトへのURL。"></x-field>

<x-field data-name="--host" data-type="string" data-default="localhost" data-desc="MCPサーバーを実行するホスト。`0.0.0.0` を使用して、サーバーをネットワークに公開します。"></x-field>

<x-field data-name="--port" data-type="number" data-default="3000" data-desc="MCPサーバーのポート。コマンドは、`PORT` 環境変数が設定されている場合はそれを尊重し、そうでなければデフォルトで3000になります。"></x-field>

<x-field data-name="--pathname" data-type="string" data-default="/mcp" data-desc="MCPサービスエンドポイントのURLパス。"></x-field>

<x-field data-name="--aigne-hub-url" data-type="string" data-desc="リモートのエージェント定義やモデルを取得するために使用される、カスタムのAIGNE HubサービスURL。"></x-field>

## 例

### ローカルプロジェクト用のサーバーを起動する

現在のディレクトリからエージェントを提供するには、オプションなしでコマンドを実行します。サーバーはデフォルトのホストとポートで起動します。

```bash 現在のディレクトリでサーバーを起動 icon=lucide:play-circle
aigne serve-mcp
```

**期待される出力:**

```text コンソール出力 icon=lucide:server
MCP server is running on http://localhost:3000/mcp
```

### 特定のポートとパスでエージェントを提供する

別のポートを指定し、AIGNEプロジェクトディレクトリへの明示的なパスを指定できます。

```bash カスタムポートとパスでサーバーを起動 icon=lucide:play-circle
aigne serve-mcp --path ./my-ai-project --port 8080
```

**期待される出力:**

```text コンソール出力 icon=lucide:server
MCP server is running on http://localhost:8080/mcp
```

### サーバーをネットワークに公開する

MCPサーバーをネットワーク上の他のマシンからアクセスできるようにするには、ホストを `0.0.0.0` に設定します。

```bash サーバーを公開 icon=lucide:play-circle
aigne serve-mcp --host 0.0.0.0
```

**期待される出力:**

```text コンソール出力 icon=lucide:server
MCP server is running on http://0.0.0.0:3000/mcp
```

## 次のステップ

MCPサーバー経由でエージェントを公開したら、本番環境用にデプロイすることを検討するとよいでしょう。

<x-cards>
  <x-card data-title="aigne deploy コマンド" data-icon="lucide:ship" data-href="/command-reference/deploy">
    AIGNEアプリケーションをBlockletとしてデプロイする方法を学びます。
  </x-card>
  <x-card data-title="Agentのデプロイガイド" data-icon="lucide:book-open-check" data-href="/guides/deploying-agents">
    エージェントをデプロイするためのステップバイステップのチュートリアルに従います。
  </x-card>
</x-cards>
