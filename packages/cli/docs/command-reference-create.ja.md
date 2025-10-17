---
labels: ["Reference"]
---

# aigne create

`aigne create` コマンドは、テンプレートから新しい AIGNE プロジェクトをスキャフォールディングします。必要なディレクトリ構造と設定ファイルをセットアップし、すぐに Agent の開発を開始できます。

## 使用法

```bash 基本的な使用法 icon=lucide:terminal
aigne create [path]
```

## 引数

<x-field data-name="path" data-type="string" data-default="." data-required="false" data-desc="新しいプロジェクトディレクトリが作成されるパス。省略された場合、現在のディレクトリがデフォルトとなり、プロジェクト名を尋ねる対話モードがトリガーされます。"></x-field>

## 対話モード

パスを指定せずに、または現在のディレクトリに `.` を使用して `aigne create` を実行すると、CLI はセットアッププロセスをガイドする対話モードに入ります。以下の情報を尋ねられます。

*   **プロジェクト名**: 新しいプロジェクトディレクトリの名前。
*   **テンプレート**: 使用するプロジェクトテンプレート。現在、`default` テンプレートのみが利用可能です。

![プロジェクト名の対話プロンプト](../assets/create/create-project-interactive-project-name-prompt.png)

### 上書き確認

安全のため、ターゲットディレクトリがすでに存在し、空でない場合、CLI はその内容を削除する前に確認を求めます。続行しないことを選択した場合、操作は安全にキャンセルされます。

```text 確認プロンプト
? ディレクトリ "/path/to/my-aigne-project" は空ではありません。その内容を削除しますか？ (y/N)
```

## 例

### 対話形式でプロジェクトを作成

作成プロセスをガイドしてもらうには、引数なしでコマンドを実行します。CLI はプロジェクト名を尋ねてきます。

```bash 現在のディレクトリで作成 icon=lucide:terminal
aigne create
```

### 特定のディレクトリにプロジェクトを作成

`my-awesome-agent` という名前の新しいディレクトリにプロジェクトを作成するには、引数として名前を指定します。

```bash 新しい 'my-awesome-agent' ディレクトリに作成 icon=lucide:terminal
aigne create my-awesome-agent
```

このコマンドは `my-awesome-agent` ディレクトリを作成し、その中にプロジェクトをスキャフォールディングします。テンプレートの選択を求められます。

## 成功時の出力

作成が成功すると、確認メッセージと、新しい Agent を実行するための次のステップの手順が表示されます。

![プロジェクト作成成功メッセージ](../assets/create/create-project-using-default-template-success-message.png)

---

プロジェクトを作成した後、次のステップは Agent を実行することです。詳細については、[`aigne run`](./command-reference-run.md) コマンドリファレンスを参照してください。
