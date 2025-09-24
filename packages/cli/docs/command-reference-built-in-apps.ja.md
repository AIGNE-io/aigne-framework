---
labels: ["Reference"]
---

---
labels: ["リファレンス"]
---

# 組み込みアプリ

AIGNE CLIには、専門的ですぐに使える機能を提供する、プリパッケージされたアプリケーションが付属しています。これらのアプリは完全なAIGNEプロジェクトであり、ローカルプロジェクトを最初に初期化する必要なく、直接実行できます。

組み込みアプリを初めて呼び出すと、CLIは自動的にnpmレジストリからそのパッケージを取得し、ローカルキャッシュ（`~/.aigne/`）にインストールしてから実行します。次回以降の実行では、キャッシュされたバージョンを使用して起動を高速化し、定期的に新しいアップデートを確認して、最新の機能を利用できるようにします。

## 利用可能なアプリ

現在利用可能な組み込みアプリケーションは以下の通りです：

| コマンド | エイリアス | 説明 |
|---|---|---|
| `doc` | `docsmith` | プロジェクトのドキュメントを生成・保守します — Agentを利用。 |
| `web` | `websmith` | プロジェクトのウェブサイトページを生成・保守します — Agentを利用。 |

## Doc Smith (`aigne doc`)

Doc Smithは、AI Agentを使用してプロジェクトのドキュメントの生成と保守を自動化するために設計された強力なアプリケーションです。

### 使用方法

`aigne doc` コマンドを使用してDoc Smithと対話できます。Doc Smithアプリケーション内で定義されたAgentは、サブコマンドとして利用できます。

例えば、現在のプロジェクトのドキュメントを生成するには、その `generate` Agentを実行します：

```bash title="プロジェクトドキュメントの生成" icon=lucide:terminal
# 'generate' Agentを実行してドキュメントを作成または更新します
aigne doc generate
```

## Web Smith (`aigne web`)

Web Smithは、ランディングページ、機能紹介、ブログなど、プロジェクトのウェブページを生成・保守することに特化したアプリケーションです。

### 使用方法

Doc Smithと同様に、`aigne web` コマンドに続けてWeb Smithアプリケーション内のAgentの名前を指定して使用します。

例えば、ウェブサイトに新しい機能ページを生成するには：

```bash title="新しい機能ページの生成" icon=lucide:terminal
# プロンプトに基づいて新しいページを作成するためにAgentを実行します
aigne web create-page --prompt "新しいAI搭載検索機能を説明するページ"
```

## 共通コマンド

組み込みアプリは完全なAIGNEプロジェクトであるため、直接適用できる標準コマンドをサポートしています。

### アップグレード

アプリケーションの最新バージョンを使用していることを確認するために、`upgrade` コマンドを実行できます。これにより、npmで新しいバージョンが利用可能かどうかを確認し、利用可能であればインストールします。

```bash title="Doc Smithのアップグレード" icon=lucide:terminal
aigne doc upgrade
```

### MCPサーバーとして提供

アプリケーションのAgentを標準のModel Context Protocol (MCP) サービスとして公開し、他のシステムがHTTP経由でそれらと対話できるようにすることができます。

```bash title="Doc SmithのAgentを提供" icon=lucide:terminal
aigne doc serve-mcp --port 8080
```

サーバーオプションの完全なリストについては、[`aigne serve-mcp`](./command-reference-serve-mcp.md)コマンドリファレンスを参照してください。