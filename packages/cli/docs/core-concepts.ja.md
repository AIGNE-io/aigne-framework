---
labels: ["Reference"]
---

# コアコンセプト

AIGNEプロジェクトは、AI Agentを開発、テスト、デプロイするための構造化された環境を提供します。プロジェクトの核心は、Agent、Agentが使用できるスキル、そして接続する言語モデルを定義する設定ファイルを含むディレクトリです。このセクションでは、これらの基本的な構成要素を詳しく説明します。

## プロジェクト構造

`aigne create` を使用して新しいプロジェクトを作成すると、コンポーネントを整理するための標準的なディレクトリ構造が生成されます。典型的なプロジェクトは次のようになります：

```text Project Structure icon=mdi:folder-open
my-agent-project/
├── aigne.yaml        # メインのプロジェクト設定ファイル。
├── agents/           # Agent定義ファイル用のディレクトリ。
│   └── chat.yaml     # Agent定義の例。
└── skills/           # スキル実装ファイル用のディレクトリ。
    └── sandbox.js    # スキル実装の例。
```

この構造は、設定（`aigne.yaml`、`agents/`）と実装（`skills/`）を分離し、プロジェクトをモジュール化して管理しやすくします。

## すべてがどのように連携するか

以下の図は、AIGNEプロジェクトのコアコンポーネント間の関係を示しています。中心となる `aigne.yaml` ファイルがすべてを統括し、どのAgentが存在し、どのスキルを使用できるか、そしてどのAIモデルがその知能を支えるかを定義します。

```d2
direction: down

aigne-yaml: {
  label: "aigne.yaml"
  shape: rectangle
}

agent: {
  label: "Agent\n(例: chat.yaml)"
  shape: rectangle
}

skill: {
  label: "スキル\n(例: sandbox.js)"
  shape: rectangle
}

chat-model: {
  label: "チャットモデル\n(例: gpt-4o-mini)"
  shape: cylinder
}

aigne-yaml -> agent: "定義する"
aigne-yaml -> skill: "登録する"
aigne-yaml -> chat-model: "設定する"
agent -> skill: "使用する"
agent -> chat-model: "通信する"
```

AIGNEプロジェクトがどのように機能するかを理解するためには、その2つの主要コンポーネント、つまり中央のプロジェクト設定と実行可能なAgentおよびスキルを把握することが不可欠です。以下でそれらを詳しく見ていきましょう。

<x-cards>
  <x-card data-title="プロジェクト設定 (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    これはプロジェクトのメインマニフェストです。使用するチャットモデルを定義し、利用可能なAgentをリストアップし、それらのAgentがアクセスできるスキルを登録します。
  </x-card>
  <x-card data-title="Agentとスキル" data-icon="lucide:bot" data-href="/core-concepts/agents-and-skills">
    Agentはタスクを実行する中心的な役割を担い、その指示と能力によって定義されます。スキルはAgentが使用するツールであり、特定の機能を提供する関数（例：JavaScriptモジュール）として実装されます。
  </x-card>
</x-cards>

---

この基礎的な理解があれば、プロジェクトの設定方法についてさらに深く学ぶ準備ができました。

**次へ**：[プロジェクト設定 (aigne.yaml)](./core-concepts-project-configuration.md) ガイドで、メイン設定ファイルについて詳しく学びましょう。
