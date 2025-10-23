# Agent を理解する

AIGNE フレームワークにおいて、「Agent」は作業を完了するための基本的な構成要素です。Agent を、特定のタスクを実行するために雇われた専門のデジタルワーカーだと考えてください。各 Agent には明確な役割と一連のスキルがあります。現実世界のチームと同様に、単一のタスクを1つの Agent に割り当てたり、複数の Agent からなるチームを編成してより複雑なプロジェクトに取り組んだりすることができます。

基本的な原則は、大きな問題を管理しやすい小さなタスクに分割し、各タスクをその仕事に最も適した Agent に割り当てることです。このアプローチにより、明確性、効率性、そして洗練された自動化ワークフローを構築する能力がもたらされます。

このセクションでは、Agent が果たすことができるさまざまな役割の概念的な概要を説明します。詳細な説明については、以下のページを参照してください。

-   **[基本的な Agent](./user-guide-understanding-agents-basic-agents.md):** スタンドアロンのワーカーとしての個々の Agent について学びます。
-   **[Agent チーム](./user-guide-understanding-agents-agent-teams.md):** 複数の Agent が協力して複雑な問題を解決する方法について学びます。

```d2
direction: down
style: {
  font-size: 14
  stroke: "#262626"
  fill: "#FAFAFA"
  stroke-width: 2
  border-radius: 8
}

Your_Request -> Manager_Agent

subgraph "専門 Agent" {
    direction: right
    Researcher
    Artist
    Calculator
}

Manager_Agent -> Researcher: "調査タスクを割り当てる"
Manager_Agent -> Artist: "画像作成を割り当てる"
Manager_Agent -> Calculator: "計算を割り当てる"

Researcher -> Manager_Agent: "調査結果を返す"
Artist -> Manager_Agent: "画像を返す"
Calculator -> Manager_Agent: "結果を返す"

Manager_Agent -> Completed_Task

Your_Request: {
  label: "あなたのリクエスト\n（例：「売上動向に関するチャート付きレポートを作成」）"
  shape: document
  style: {
    fill: "#E0F2FE"
    stroke: "#0EA5E9"
  }
}

Manager_Agent: {
  label: "マネージャー Agent\n（チーム Agent）"
  tooltip: "ワークフローを調整し、タスクを委任する"
  style: {
    fill: "#FEF3C7"
    stroke: "#FBBF24"
  }
}

Researcher: {
  label: "研究者\n（AI Agent）"
  tooltip: "データを分析し、傾向を要約する"
  style: {
    fill: "#D1FAE5"
    stroke: "#10B981"
  }
}

Artist: {
  label: "アーティスト\n（画像 Agent）"
  tooltip: "データに基づいてチャートを生成する"
  style: {
    fill: "#D1FAE5"
    stroke: "#10B981"
  }
}

Calculator: {
  label: "計算機\n（関数 Agent）"
  tooltip: "特定の計算を実行する"
  style: {
    fill: "#D1FAE5"
    stroke: "#10B981"
  }
}

Completed_Task: {
  label: "完了したタスク\n（最終レポート）"
  shape: document
  style: {
    fill: "#E0F2FE"
    stroke: "#0EA5E9"
  }
}
```

### Agent が果たすことができる役割

その機能をよりよく理解するために、アナロジー（類推）を用いて、一般的な Agent の種類と、それらがシステム内で果たす役割を説明します。

<x-cards data-columns="2">
  <x-card data-title="専門家" data-icon="lucide:user-cog">
    これは最も一般的なタイプの Agent で、多くの場合 AI モデルによって駆動されます。ライター、翻訳者、アナリストなど、特定の認知タスクのために雇う専門家のようなものです。指示と情報の一部を与えると、その専門知識に基づいて結果を生成します。例えば、長い記事を要約したり、プロフェッショナルなメールの下書きを作成したりするように依頼できます。
  </x-card>
  <x-card data-title="プロジェクトマネージャー" data-icon="lucide:users">
    この Agent はタスクを自ら実行するのではなく、他の Agent を調整することに長けています。実際のプロジェクトマネージャーのように、複雑な目標を受け取り、それをより小さなステップに分解し、それらのステップを適切な専門 Agent に委任します。作業が正しい順序で流れ、最終的な結果が正しく組み立てられることを保証します。
  </x-card>
  <x-card data-title="ツールユーザー" data-icon="lucide:wrench">
    一部の Agent は、特定のツールを操作するように設計されています。これは、数学的な演算を実行するための計算機、データベースを検索するツール、または天気予報 API のような外部サービスに接続するツールなどです。これらの Agent は信頼性が高く予測可能で、呼び出されるたびに正確な機能を実行します。
  </x-card>
  <x-card data-title="データクラーク" data-icon="lucide:file-cog">
    この Agent は、情報のフォーマットと再編成を専門としています。ある構造のデータを受け取り、それを別の構造に変換することができます。例えば、顧客のメールから特定の詳細を抽出し、それをデータベースに保存できる構造化されたレコードにフォーマットすることができます。これは、事務員が紙のフォームからスプレッドシートに情報を転記するのとよく似ています。
  </x-card>
</x-cards>

### まとめ

Agent を専門的な役割を持つデジタルワーカーとして理解することで、それらを組み合わせて複雑なプロセスを自動化する方法が見えてきます。単一の Agent は特定のタスクに対して強力なツールとなり得ますが、AIGNE フレームワークの真のポテンシャルは、各 Agent が共通の目標を達成するために独自のスキルを提供し、Agent のチームを編成したときに発揮されます。

これらの概念がどのように実践されるかについてさらに学ぶには、次のセクションに進んでください。

-   **[基本的な Agent](./user-guide-understanding-agents-basic-agents.md):** 個々の Agent がどのように機能するかを探ります。
-   **[Agent チーム](./user-guide-understanding-agents-agent-teams.md):** 複雑なワークフローのために複数の Agent をどのように調整するかを確認します。