---
labels: ["Reference"]
---

# はじめに

このガイドでは、AIGNE CLIのインストール、新規プロジェクトの作成、そして最初のAI Agentの実行という基本的な手順を説明します。このガイドを終える頃には、ローカルで動作するAgentが完成します。

## ステップ1：AIGNE CLIのインストール

まず、システムに `@aigne/cli` パッケージをグローバルにインストールする必要があります。お好みのJavaScriptパッケージマネージャーを使用できます。

### npmを使用する場合

```bash
npm install -g @aigne/cli
```

### yarnを使用する場合

```bash
yarn global add @aigne/cli
```

### pnpmを使用する場合

```bash
pnpm add -g @aigne/cli
```

## ステップ2：新規プロジェクトの作成

CLIがインストールされたら、`aigne create` コマンドを使用して新しいAIGNEプロジェクトを作成できます。このコマンドは、必要なすべての設定ファイルを含むデフォルトのAgentテンプレートで新しいディレクトリを生成します。

```bash
aigne create my-first-agent
```

その後、CLIは対話式のセットアッププロセスを案内します。プロジェクト名の確認とテンプレートの選択を求められます。このガイドでは、Enterキーを押してデフォルトのオプションを受け入れることができます。

![対話式のプロジェクト作成プロンプト](../assets/create/create-project-interactive-project-name-prompt.png)

プロセスが完了すると、新しいAgentの使用開始方法に関する指示とともに成功メッセージが表示されます。

![プロジェクト作成成功メッセージ](../assets/create/create-project-using-default-template-success-message.png)

## ステップ3：環境変数の設定

Agentを実行する前に、AIモデルプロバイダーのAPIキーを設定する必要があります。

まず、新しく作成したプロジェクトディレクトリに移動します：
```bash
cd my-first-agent
```

プロジェクトテンプレートには、`.env.local.example` という名前の環境ファイルの例が含まれています。これを `.env.local` という名前の新しいファイルにコピーして、ローカル設定を作成します。
```bash
cp .env.local.example .env.local
```

次に、エディタで `.env.local` ファイルを開きます。OpenAI APIキーを追加する必要があります。デフォルトのテンプレートは、OpenAIを使用するように事前設定されています。

```shell .env.local icon=mdi:file-document-edit-outline
# OpenAI
MODEL="openai:gpt-4o-mini"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

`"YOUR_OPENAI_API_KEY"` を実際のキーに置き換えてください。

## ステップ4：Agentの実行

設定が完了したら、Agentを実行できます。プロジェクトディレクトリ内から `aigne run` コマンドを実行してください。

```bash
aigne run
```

このコマンドは、プロジェクトで定義されたデフォルトのAgentとの対話型チャットセッションを開始します。ターミナルで直接AI Agentにメッセージを送信し、対話を開始できます。

![デフォルトAgentをチャットモードで実行中](../assets/run/run-default-template-project-in-chat-mode.png)

## 次のステップ

おめでとうございます！AIGNE CLIのインストール、プロジェクトの作成、そして最初のAgentの実行に成功しました。

作成したファイルとAIGNEプロジェクトの構造を理解するために、[コアコンセプト](./core-concepts.md)のセクションに進んでください。
