---
labels: ["Reference"]
---

# 組み込みアプリ

AIGNE CLIには、専門的な機能をすぐに利用できる、事前パッケージ化されたアプリケーションが付属しています。これらのアプリは完全なAIGNEプロジェクトであり、ローカルプロジェクトを最初に初期化する必要なく、直接実行できます。

組み込みアプリを初めて呼び出すと、CLIは自動的にnpmレジストリからそのパッケージを取得し、ローカルキャッシュ（`~/.aigne/`）にインストールして実行します。その後の実行では、キャッシュされたバージョンが使用されて起動が速くなり、定期的に新しいアップデートがチェックされるため、常に最新の機能を利用できます。

## 利用可能なアプリ

現在利用可能な組み込みアプリケーションは次のとおりです。

| コマンド | エイリアス | 説明 |
|---|---|---|
| `doc` | `docsmith` | Agent を利用して、プロジェクトドキュメントを生成・保守します。 |
| `web` | `websmith` | Agent を利用して、プロジェクトのウェブサイトページを生成・保守します。 |

## Doc Smith (`aigne doc`)

Doc Smithは、AI Agent を使用してプロジェクトドキュメントの生成と保守を自動化するために設計された強力なアプリケーションです。

### 使用方法

`aigne doc` コマンドを使用してDoc Smithと対話できます。Doc Smithアプリケーション内で定義された Agent は、サブコマンドとして利用できます。

たとえば、現在のプロジェクトのドキュメントを生成するには、その `generate` Agent を実行します。

```bash title="プロジェクトドキュメントの生成" icon=lucide:terminal
# 'generate' Agent を実行してドキュメントを作成または更新します
aigne doc generate
```

## Web Smith (`aigne web`)

Web Smithは、ランディングページ、機能紹介、ブログなど、プロジェクトのWebページを生成および保守することに特化したアプリケーションです。

### 使用方法

Doc Smithと同様に、`aigne web` コマンドに続けてWeb Smithアプリケーション内の Agent の名前を指定して使用します。

たとえば、新しいWebページを生成するには、次のようにします。

```bash title="新しいウェブページの生成" icon=lucide:terminal
# Agent を実行して新しいページを作成します
aigne web generate
```

## 共通コマンド

組み込みアプリは完全なAIGNEプロジェクトであるため、直接適用できる標準コマンドをサポートしています。

### アップグレード

アプリケーションの最新バージョンを確実に使用するには、`upgrade` コマンドを実行します。これにより、npmで新しいバージョンがチェックされ、利用可能な場合はインストールされます。

```bash title="Doc Smith のアップグレード" icon=lucide:terminal
aigne doc upgrade
```

### MCPサーバーとして提供

アプリケーションの Agent を標準のモデルコンテキストプロトコル（MCP）サービスとして公開し、他のシステムがHTTPを介してそれらと対話できるようにすることができます。

```bash title="Doc Smith Agent の提供" icon=lucide:terminal
aigne doc serve-mcp
```

サーバーオプションの完全なリストについては、[`aigne serve-mcp`](./command-reference-serve-mcp.md) コマンドリファレンスを参照してください。
