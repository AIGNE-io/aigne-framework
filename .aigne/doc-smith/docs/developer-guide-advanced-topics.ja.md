# 高度なトピック

コアコンセプトをマスターし、基本的なアプリケーションを構築した後、AIGNEフレームワークのより洗練された機能を探求する準備ができました。このセクションは、複雑で堅牢、かつ高度にカスタマイズされたAIアプリケーションの構築を目指す開発者向けに設計されています。ここでは、エージェント定義、プロンプトエンジニアリング、実行ライフサイクル、データ処理に対するより高度な制御を提供する、高度なパターンとツールについて詳しく説明します。

以下のトピックでは、これらの高度な機能を活用するための詳細なガイドを提供します。これらを理解することで、単純なエージェントワークフローから、エンタープライズグレードのAIシステムを構築できるようになります。

<x-cards data-columns="2">
  <x-card data-title="YAMLによるエージェントの定義" data-icon="lucide:file-code" data-href="/developer-guide/advanced-topics/defining-agents-with-yaml">
    YAMLファイルを使用してエージェントを宣言的に定義および設定する方法を学びます。このアプローチは、設定をコードから分離し、エージェントシステムの管理、バージョン管理、デプロイを容易にします。
  </x-card>
  <x-card data-title="プロンプト" data-icon="lucide:terminal" data-href="/developer-guide/advanced-topics/prompts">
    PromptBuilderを使用して、動的なプロンプト管理を深く掘り下げます。このガイドでは、Nunjucksテンプレートを使用して、AIモデル用の柔軟で再利用可能、かつコンテキストを認識するプロンプトを作成する方法について説明します。
  </x-card>
  <x-card data-title="フック" data-icon="lucide:git-pull-request" data-href="/developer-guide/advanced-topics/hooks">
    エージェントの実行ライフサイクルと、フックでそれをインターセプトする方法を理解します。onStart、onEnd、onSkillStartなどのさまざまな段階で、カスタムロジック、ロギング、またはモニタリングを追加する方法を学びます。
  </x-card>
  <x-card data-title="ストリーミング" data-icon="lucide:fast-forward" data-href="/developer-guide/advanced-topics/streaming">
    エージェントからのリアルタイムのストリーミング応答を処理する方法を発見します。これは、情報が利用可能になったときにそれを配信する、応答性の高い対話型アプリケーションを作成するために不可欠です。
  </x-card>
</x-cards>

## まとめ

このセクションでは、AIアプリケーションを向上させるために必要なツールとテクニックを提供します。宣言的な定義、動的なプロンプト、ライフサイクルフック、ストリーミングを活用することで、より強力で、保守性が高く、効率的なエージェントシステムを構築できます。

詳細については、上記の特定のサブセクションに進んでください。これらのコンポーネントがより広範なアーキテクチャにどのように適合するかについては、[コアコンセプト](./developer-guide-core-concepts.md)のドキュメントを参照してください。