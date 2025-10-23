# Agent タイプ

AIGNE フレームワークは、それぞれが特定の機能を実行するように設計された、専門的な Agent タイプのスイートを提供します。すべての Agent はベースの `Agent` クラスを継承しますが、これらの特殊な実装は、AI モデルとの対話から複雑なワークフローのオーケストレーションまで、一般的なタスクに対応する事前構築済みの機能を提供します。これらのタイプを理解することは、堅牢で効率的なアプリケーションを構築するための鍵となります。

このセクションでは、利用可能な Agent タイプの概要を説明します。詳細な実装、設定オプション、およびコード例については、各 Agent の特定のサブドキュメントを参照してください。

```d2
direction: down
style: {
  font-size: 14
  stroke-width: 2
  fill: "#f8f9fa"
  stroke: "#adb5bd"
}

Agent: {
  label: "ベース Agent"
  shape: class
  style: {
    fill: "#e9ecef"
    stroke: "#495057"
  }
}

sub_agents: {
  AIAgent: {
    label: "AIAgent"
    tooltip: "言語モデルと対話します"
    style: { fill: "#dbe4ff" }
  }
  TeamAgent: {
    label: "TeamAgent"
    tooltip: "複数の Agent をオーケストレートします"
    style: { fill: "#d1e7dd" }
  }
  ImageAgent: {
    label: "ImageAgent"
    tooltip: "画像を生成します"
    style: { fill: "#fff3cd" }
  }
  FunctionAgent: {
    label: "FunctionAgent"
    tooltip: "カスタムコードをラップします"
    style: { fill: "#f8d7da" }
  }
  TransformAgent: {
    label: "TransformAgent"
    tooltip: "データマッピングを実行します"
    style: { fill: "#e2d9f3" }
  }
  MCPAgent: {
    label: "MCPAgent"
    tooltip: "外部の MCP システムに接続します"
    style: { fill: "#cfe2ff" }
  }
}

Agent -> sub_agents.AIAgent: Inherits
Agent -> sub_agents.TeamAgent: Inherits
Agent -> sub_agents.ImageAgent: Inherits
Agent -> sub_agents.FunctionAgent: Inherits
Agent -> sub_agents.TransformAgent: Inherits
Agent -> sub_agents.MCPAgent: Inherits
```

## 利用可能な Agent タイプ

このフレームワークには、それぞれが異なる目的のために調整された、以下の特殊な Agent が含まれています。

<x-cards data-columns="2">
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/ai-agent">
    大規模言語モデル（LLM）と対話するための主要な Agent です。プロンプトの構築、モデルの呼び出し、ツール使用を含む AI 生成応答の処理を担当します。
  </x-card>
  <x-card data-title="Team Agent" data-icon="lucide:users" data-href="/developer-guide/agents/team-agent">
    Agent のグループを連携させて動作するようにオーケストレートします。シーケンシャルモードまたはパラレルモードでワークフローを管理でき、複雑なマルチステップの問題解決を可能にします。
  </x-card>
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agents/image-agent">
    画像生成モデルとのインターフェースに特化した Agent です。指示プロンプトを受け取り、ビジュアルコンテンツを生成します。
  </x-card>
  <x-card data-title="Function Agent" data-icon="lucide:function-square" data-href="/developer-guide/agents/function-agent">
    標準的な TypeScript または JavaScript 関数をラップし、カスタムコードやビジネスロジックを Agent ワークフローにシームレスに統合できます。
  </x-card>
  <x-card data-title="Transform Agent" data-icon="lucide:shuffle" data-href="/developer-guide/agents/transform-agent">
    JSONata 式を使用して宣言的なデータ変換を実行します。手続き型のコードを書かずに、異なるフォーマット間でデータのマッピング、再構築、変換を行うのに最適です。
  </x-card>
  <x-card data-title="MCP Agent" data-icon="lucide:plug-zap" data-href="/developer-guide/agents/mcp-agent">
    Model Context Protocol (MCP) を介して外部システムやツールに接続します。この Agent はブリッジとして機能し、アプリケーションが外部のリソースや機能を活用できるようにします。
  </x-card>
</x-cards>

## まとめ

特定のタスクに適した Agent タイプを選択することは、効果的な AIGNE アプリケーションを設計する上での基本的なステップです。各 Agent は、特定のジョブのために設計された専門的なツールです。これらの Agent を組み合わせることで、広範なタスクを処理できる高度なシステムを構築できます。

各 Agent の機能と設定をより深く理解するために、各タイプの詳細なドキュメントに進んでください。

- **次へ**: 言語モデルと対話するためのコアコンポーネントである [AI Agent](./developer-guide-agents-ai-agent.md) について学びます。