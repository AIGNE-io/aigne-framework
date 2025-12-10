# Bash

Bash Agent は、Agent ワークフロー内でシェルスクリプトやコマンドラインツールを実行するための安全で制御されたメソッドを提供します。このドキュメントでは、その機能、構成、およびシステムレベルの操作に関するベストプラクティスについて詳しく説明します。このガイドに従うことで、ファイル操作、プロセス管理、自動化などのタスクに Bash Agent を統合して利用する方法を学びます。

## 概要

Bash Agent は、セキュリティを強化するために [Anthropic の Sandbox Runtime](https://github.com/anthropic-experimental/sandbox-runtime) を活用し、制御された環境で bash スクリプトを実行するように設計されています。標準出力 (`stdout`)、標準エラー (`stderr`)、および最終的な終了コードをキャプチャしてストリーミングし、スクリプトの実行に関する包括的なフィードバックを提供します。

以下の図は、Bash Agent が安全なサンドボックス内でスクリプトを実行し、ファイルシステムとネットワークアクセスを制御しながら、出力をユーザーにストリーミングする方法を示しています。

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Bash](assets/diagram/agent-library-bash-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

主な機能は次のとおりです。
- **サンドボックス実行**: スクリプトは、構成可能なセキュリティポリシーを持つ分離された環境で実行されます。
- **ネットワーク制御**: ドメインをホワイトリストまたはブラックリストに登録して、ネットワークアクセスを管理します。
- **ファイルシステム制御**: ファイルとディレクトリに対する特定の読み取りおよび書き込み権限を定義します。
- **リアルタイム出力**: スクリプトの実行中に `stdout` と `stderr` をストリーミングします。
- **終了コードの追跡**: スクリプトの終了コードをキャプチャして、成功を確認したり、エラーを処理したりします。

## 入力

Agent は、入力オブジェクトで必須の単一パラメータを受け入れます。

<x-field-group>
  <x-field data-name="script" data-type="string" data-required="true" data-desc="実行される bash スクリプト。"></x-field>
</x-field-group>

## 出力

Agent は、スクリプト実行の結果を含むオブジェクトを返します。

<x-field-group>
  <x-field data-name="stdout" data-type="string" data-required="false" data-desc="スクリプトによって生成された標準出力ストリーム。"></x-field>
  <x-field data-name="stderr" data-type="string" data-required="false" data-desc="スクリプトによって生成された標準エラーストリーム。"></x-field>
  <x-field data-name="exitCode" data-type="number" data-required="false" data-desc="スクリプト完了後に返される終了コード。通常、値 0 は成功を示します。"></x-field>
</x-field-group>

## 基本的な使用方法

Bash Agent を使用する最も直接的な方法は、YAML 構成ファイルを使用することです。これにより、Agent の動作とセキュリティ制約を宣言的に定義できます。

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
# サンドボックスは、制限の厳しい設定でデフォルトで有効になっています。
# 詳細なオプションについては、「サンドボックス構成」セクションを参照してください。
```

この Agent を実行するには、AIGNE CLI を使用して、スクリプトを引数として渡します。

```bash icon=lucide:terminal
aigne run . Bash --script 'echo "Hello from the Bash Agent!"'
```

## 構成

Bash Agent は、特に実行環境に関して、その動作を調整するためにいくつかのオプションを使用して構成できます。

### Agent オプション

これらのオプションは、Agent の YAML 定義のトップレベルで指定されます。

<x-field-group>
  <x-field data-name="sandbox" data-type="object | boolean" data-required="false" data-default="true">
    <x-field-desc markdown>サンドボックス化された実行環境を制御します。サンドボックスを完全に無効にするには `false` に設定するか、構成オブジェクトを提供してその制限をカスタマイズします。デフォルトでは、サンドボックスは有効になっています。</x-field-desc>
  </x-field>
</x-field-group>

### サンドボックスの無効化

信頼できる環境や、サンドボックスがサポートされていないプラットフォーム (Windows など) では、無効にすることができます。

:::warning
サンドボックスを無効にすると、Agent が提供するすべてのセキュリティ保護が解除されます。これは、実行されるスクリプトが安全であることがわかっている、完全に信頼された環境でのみ行うべきです。
:::

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox: false # サンドボックスを無効にします
```

## サンドボックス構成

`sandbox` オプションが有効になっている場合、構成オブジェクトを提供して、ネットワークおよびファイルシステムアクセスに対する詳細なセキュリティポリシーを定義できます。

### ネットワーク構成

許可および拒否されたドメインを指定して、Agent のネットワークアクセスを制御します。

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox:
  network:
    # スクリプトが接続を許可されているドメインのリスト。ワイルドカード (*) がサポートされています。
    allowedDomains:
      - "*.example.com"
      - "api.github.com"
    # スクリプトが接続を禁止されているドメインのリスト。これは allowedDomains よりも優先されます。
    deniedDomains:
      - "*.ads.com"
```

### ファイルシステム構成

スクリプトがファイルシステムのどの部分から読み取り、書き込みできるかを定義します。

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox:
  filesystem:
    # スクリプトが書き込みを許可されているファイルパスまたはパターンのリスト。
    allowWrite:
      - "./output"
      - "/tmp"
    # スクリプトが読み取りを禁止されているファイルパスまたはパターンのリスト。
    denyRead:
      - "~/.ssh"
      - "*.key"
    # スクリプトが書き込みを禁止されているファイルパスまたはパターンのリスト。
    denyWrite:
      - "/etc"
      - "/usr"
```

### 完全な例

これは、開発ツールを実行するための完全なサンドボックス構成を示す包括的な例です。

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox:
  network:
    allowedDomains:
      - "*.npmjs.org"
      - "registry.npmjs.org"
      - "github.com"
      - "api.github.com"
    deniedDomains:
      - "*.ads.com"
  filesystem:
    allowWrite:
      - "./output"
      - "./logs"
      - "/tmp"
    denyRead:
      - "~/.ssh"
      - "~/.aws"
      - "*.pem"
      - "*.key"
    denyWrite:
      - "/etc"
      - "/usr"
      - "/bin"
      - "/sbin"
```

## プラットフォームのサポート

Bash Agent の機能は、主にサンドボックスの可用性に関して、オペレーティングシステムによって異なります。

| プラットフォーム | サンドボックスのサポート | 直接実行 |
| :--- | :--- | :--- |
| **Linux** | ✅ フルサポート | ✅ サポート |
| **macOS** | ✅ フルサポート | ✅ サポート |
| **Windows** | ❌ サポートされていません | ✅ サポート |

:::info
Windows では、サンドボックスモードはサポートされていません。Bash Agent を使用するには、構成で `sandbox: false` を設定する必要があります。Windows での直接実行には、Windows Subsystem for Linux (WSL) や Git Bash などの環境がインストールされている必要がある場合があります。
:::

## ベストプラクティス

Bash Agent を安全かつ効果的に使用するために、以下のプラクティスに従ってください。

- **最小権限の原則を適用する**: スクリプトが機能するために必要な最小限の権限のみを付与します。 `/` への書き込み許可や `*` へのネットワークアクセス許可など、過度に寛容なルールは避けてください。
- **終了コードを処理する**: Agent の出力で常に `exitCode` を確認してください。ゼロ以外の値はエラーを示し、詳細については `stderr` ストリームを検査する必要があります。
- **機密ファイルを保護する**: `~/.ssh`、`.env` ファイル、または秘密鍵などの機密情報を含むディレクトリやファイルへの読み取りアクセスを明示的に拒否します。
- **具体的なワイルドカードを使用する**: ネットワークまたはファイルシステムのルールにワイルドカードを使用する場合は、できるだけ具体的にします (例: `*.com` の代わりに `api.example.com`)。
- **ログと監査**: セキュリティが重要なアプリケーションでは、監査証跡を維持するために、入力スクリプトと結果の出力を含むすべてのスクリプト実行をログに記録します。