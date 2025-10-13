私は AIGNE フレームワークのアーキテクチャの概要を説明する図を生成しました。これから、「AIGNE のコアコンセプト」セクションの詳細なドキュメントを生成します。

# AIGNE のコアコンセプト

AIGNE フレームワークのコアコンセプトへようこそ。このドキュメントでは、AIGNE アーキテクチャを構成する基本的な構成要素について、開発者向けに概要を説明します。これらのコンセプトを理解することは、AIGNE を使用して堅牢でインテリジェントなアプリケーションを構築するために不可欠です。

このフレームワークは、モジュール式で拡張可能なアーキテクチャを中心に設計されており、開発者は多種多様なタスクに対応する高度な AI Agent を作成、構成、管理できます。このアーキテクチャの中心には、**Agents**、**モデル**、**スキル**、**メモリ** といういくつかの主要コンポーネントがあり、これらはすべて中央の **AIGNE Project** 設定を通じて統合管理されます。

```d2
direction: down

AIGNE-Project: {
  label: "AIGNE Project\n(オーケストレーションと設定)"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"

  Agent: {
    label: "Agent"
    shape: rectangle
  }

  Models: {
    label: "モデル"
    shape: rectangle
  }

  Skills: {
    label: "スキル"
    shape: rectangle
  }

  Memory: {
    label: "メモリ"
    shape: cylinder
  }
}

AIGNE-Project.Agent -> AIGNE-Project.Models: "使用"
AIGNE-Project.Agent -> AIGNE-Project.Skills: "実行"
AIGNE-Project.Agent -> AIGNE-Project.Memory: "アクセス"
```

## AIGNE Project

AIGNE プロジェクトは、AI アプリケーションの最上位コンテナです。これは `aigne.yaml` ファイルによって定義され、このファイルが設定とオーケストレーションの中心的なハブとして機能します。このファイルで、他のすべてのコアコンポーネントを定義し、接続します。

**`aigne.yaml` の主な責務:**

*   **プロジェクトの定義**: プロジェクトの名前と説明を設定します。
*   **モデルの設定**: デフォルトのチャットモデルと、Agent が使用する他のモデルを指定します。
*   **Agent の構成**: プロジェクトの一部であるすべての Agent をリストアップします。
*   **スキルの登録**: Agent が利用できるスキル（ツール）を登録します。
*   **サービス統合**: MCP (Message Control Protocol) サーバーなどのサービスへの接続を設定します。
*   **CLI の設定**: プロジェクトの Agent をコマンドラインインターフェースを通じてどのように公開するかを定義します。

### 例: `aigne.yaml`

以下は、これらのコンポーネントがどのようにまとめられるかを示す、典型的な `aigne.yaml` ファイルの例です。

```yaml
# ソース: packages/core/test-agents/aigne.yaml
name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
  - chat-with-prompt.yaml
  - team.yaml
  - image.yaml
  - agents/test-relative-prompt-paths.yaml
skills:
  - sandbox.js
mcp_server:
  agents:
    - chat.yaml
cli:
  agents:
    - chat.yaml
    - test-cli-agents/b.yaml
    - url: test-cli-agents/a.yaml
      name: a-renamed
      description: A agent from a.yaml
      alias: ["a", "a-agent"]
      agents:
        - url: test-cli-agents/a-1.yaml
          agents:
            - url: test-cli-agents/a-1-1.yaml
            - url: test-cli-agents/a-1-2.yaml
              name: a12-renamed
              description: A agent from a-1-2.yaml
        - test-cli-agents/a-2.yaml
```

## Agents

Agents は AIGNE フレームワークの主要なアクターです。タスクの実行、ユーザーとの対話、他の Agent との協調作業を行うように設計された特殊なエンティティです。各 Agent は特定の目的を持ち、独自のモデル、スキル、メモリを備えることができます。

このフレームワークは、それぞれが異なる役割を持ついくつかのタイプの Agent を提供します。

*   **`AIAgent`**: 最も基本的な Agent で、AI モデルと対話するように設計されています。ユーザーの入力を理解し、AI モデルを使用して処理し、応答を生成できます。また、特定のアクションを実行するためのスキル（ツール）を装備することもできます。
*   **`ChatModel`**: チャットベースの言語モデル（例：GPT-4、Claude）と直接連携する特殊な Agent です。
*   **`TeamAgent`**: 他の Agent のグループを管理するオーケストレーター Agent です。入力に基づいてチーム内で最も適した Agent にタスクを委任し、複雑なマルチステップのワークフローを可能にします。
*   **`UserAgent`**: システム内の人間のユーザーを表し、ユーザーの入力を取得して他の Agent に転送します。
*   **`ImageAgent`**: 画像関連のタスクを処理するための特殊な Agent で、画像生成または分析モデルと連携します。
*   **`GuideRailAgent`**: 検証レイヤーとして機能し、他の Agent の出力が事前定義されたスキーマまたは一連のルールに準拠していることを保証します。
*   **`TransformAgent`**: ある形式から別の形式へデータを処理および変換するユーティリティ Agent です。
*   **`MCPAgent`**: Message Control Protocol (MCP) サーバーとの通信を容易にし、Agent がより広範なサービスや Agent のネットワークと対話できるようにします。

これらの Agents は構成可能に設計されており、様々な構成で組み合わせることで、高度なシステムを構築できます。

## モデル

モデルは、Agent にインテリジェンスを提供するエンジンです。AIGNE はモデルに依存しないように設計されており、様々なプロバイダーの幅広い言語モデルや画像モデルをサポートしています。これにより、特定のタスクや予算に最適なモデルを選択できます。

Agent はモデルを使用して、言語を理解し、応答を生成し、データを分析し、または画像を生成します。`aigne.yaml` でプロジェクトレベルのデフォルトモデルを設定でき、また、より詳細な制御のために個々の Agent に特定のモデルを割り当てることもできます。

このフレームワークには、次のような多くの人気のあるモデルプロバイダー用のアダプターが含まれています。
*   OpenAI (GPT シリーズ)
*   Anthropic (Claude シリーズ)
*   Google (Gemini シリーズ)
*   Amazon Bedrock
*   その他...

## スキル

スキルは、Agent の能力を単純なチャット以上に拡張する再利用可能なツールや関数です。他の AI フレームワークにおける「ツール」に相当します。Agent にスキルを与えることで、外部システムとの対話、データベースへのアクセス、API の呼び出し、複雑な計算の実行などが可能になります。

スキルは通常、JavaScript または TypeScript の関数として定義され、`aigne.yaml` ファイルに登録されます。`AIAgent` がスキルを装備すると、基盤となる言語モデルがユーザーの要求を満たすためにいつスキルを使用するかを賢く判断できます。

例えば、次のようなスキルを作成できます。
*   天気 API から現在の天気を取得する。
*   CRM から顧客情報を取得する。
*   データベースクエリを実行する。
*   ファイルシステム操作を実行する。

## メモリ

メモリにより、Agent は情報を永続化し、複数の対話にわたってコンテキストを維持できます。これは、Agent が会話の過去の部分を記憶し、そこから学習できるステートフルな会話体験を作成するために不可欠です。

AIGNE は様々なメモリシステムをサポートしており、会話履歴やその他のデータをどのように、どこに保存するかを設定できます。これは、短期的なコンテキストのための単純なインメモリ ストレージから、長期的な記憶のためのより永続的なデータベースソリューションまで多岐にわたります。

メモリを活用することで、Agent は次のことが可能になります。
*   ユーザーの好みを記憶する。
*   関連性の高い応答を提供するために、会話履歴を追跡する。
*   将来のパフォーマンスを向上させるために、以前の対話から学習する。

## 全体の仕組み

1.  ユーザーがアプリケーションと対話すると、その入力は **UserAgent** によってキャプチャされます。
2.  入力は、**AIAgent** や **TeamAgent** などの適切な Agent にルーティングされます。
3.  Agent は、設定された **モデル** を使用して入力を処理し、次のステップを決定します。
4.  必要に応じて、Agent は1つ以上の **スキル** を実行して情報を収集したり、アクションを実行したりします。
5.  このプロセス中、Agent はコンテキストを維持するために **メモリ** の読み書きを行います。
6.  最後に、Agent は応答を生成し、ユーザーに返信します。

このワークフロー全体は **AIGNE Project** (`aigne.yaml`) 内で定義・設定され、AI アプリケーションを明確かつ一元的に管理する方法を提供します。