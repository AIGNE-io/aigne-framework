---
labels: ["Reference"]
---

# aigne test

`aigne test` コマンドは、Agent とスキルの自動テストを実行します。これは、ユニットテストと統合テストのための組み込みメカニズムを提供し、Agent とそれが依存するツールがデプロイ前に正しく機能することを確認します。

## 使用法

```bash Basic Syntax icon=lucide:terminal
aigne test [path]
```

## 引数

| 引数      | 説明                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------|
| `[path]`      | オプション。Agent とそれに対応するテストファイルを含むディレクトリへのパス。省略した場合、コマンドは現在のディレクトリでテストを検索します。 |

## 説明

このコマンドは、プロジェクト内のテストファイルを自動的に検出して実行します。例えば、デフォルトの AIGNE プロジェクトテンプレートには、「sandbox.js」スキルの機能を検証するために設計された「sandbox.test.js」ファイルが含まれています。`aigne test` コマンドは、このようなファイルを実行して、Agent の能力を検証します。

## 例

### 現在のディレクトリでテストを実行する

現在の作業ディレクトリにある AIGNE プロジェクトのテストケースを実行するには、引数を指定せずにコマンドを実行します:

```bash icon=lucide:terminal
aigne test
```

### 特定のディレクトリでテストを実行する

Agent が別のディレクトリにある場合は、そのディレクトリへのパスを指定できます:

```bash icon=lucide:terminal
aigne test path/to/agents
```

---

## 次のステップ

Agent がすべてのテストに合格したことを確認したら、統合のためにそれらを提供するか、サービスとしてデプロイすることができます。

<x-cards>
  <x-card data-title="aigne serve-mcp" data-icon="lucide:server" data-href="/command-reference/serve-mcp">
    Agent を外部統合用の MCP サーバーとして提供する方法を学びます。
  </x-card>
  <x-card data-title="aigne deploy" data-icon="lucide:rocket" data-href="/command-reference/deploy">
    AIGNE アプリケーションを Blocklet としてデプロイする方法を学びます。
  </x-card>
</x-cards>
