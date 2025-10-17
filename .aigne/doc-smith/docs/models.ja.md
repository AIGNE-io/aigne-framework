# モデル

AIGNE フレームワークはモデルに依存しないように設計されており、さまざまなサードパーティの AI モデルプロバイダーに接続できます。この柔軟性は、モデルアダプターのシステムによって実現されています。各アダプターは、OpenAI、Anthropic、Google Gemini などの特定のサービスに対して標準化されたインターフェースを提供します。

このセクションでは、公式にサポートされている各モデルプロバイダーのインストール、設定、および使用に関する詳細なガイドを提供します。強力な言語モデル、特化した画像生成、またはローカルでホストされるモデルのプライバシーが必要な場合でも、ここで適切な統合を見つけることができます。

## サポートされているモデルプロバイダー

以下は、サポートされているプロバイダーの厳選されたリストです。各カードは、インストール手順、設定詳細、および実践的なコード例を含む専用ガイドにリンクしています。

### 基盤モデル

これらは、主要な AI モデルプロバイダーとの直接的な統合です。

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    強力な GPT-4o を含む OpenAI のモデルスイートと統合し、チャット補完や関数呼び出しに利用できます。
  </x-card>
  <x-card data-title="Anthropic" data-icon="simple-icons:anthropic" data-href="/models/anthropic">
    複雑な推論と会話における高いパフォーマンスで知られる Anthropic の Claude モデルを活用します。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    Google の Gemini ファミリーのマルチモーダルモデルに接続し、高度なテキストおよび画像理解を実現します。
  </x-card>
  <x-card data-title="AWS Bedrock" data-icon="simple-icons:amazonaws" data-href="/models/bedrock">
    AWS Bedrock を通じて、Anthropic、Cohere、Amazon などのプロバイダーが提供するさまざまな基盤モデルにアクセスします。
  </x-card>
  <x-card data-title="DeepSeek" data-icon="lucide:brain-circuit" data-href="/models/deepseek">
    DeepSeek の強力で効率的な言語モデルを、さまざまな自然言語処理タスクに活用します。
  </x-card>
    <x-card data-title="Doubao" data-icon="lucide:bot" data-href="/models/doubao">
    Doubao の言語モデルと統合し、対話型 AI やその他のテキストベースのアプリケーションを構築します。
  </x-card>
  <x-card data-title="xAI" data-icon="lucide:sparkles" data-href="/models/xai">
    リアルタイムの情報処理とユニークな会話スタイルを実現するために設計された xAI の Grok モデルに接続します。
  </x-card>
</x-cards>

### 画像生成モデル

ビジュアルコンテンツを作成するための専用の統合です。

<x-cards data-columns="2">
  <x-card data-title="Ideogram" data-icon="lucide:image" data-href="/models/ideogram">
    Ideogram の高度な画像合成モデルを使用して、テキストプロンプトから高品質の画像を生成します。
  </x-card>
    <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    Gemini と Imagen モデルを使用して、その言語機能に加えて、多目的な画像生成機能を利用します。
  </x-card>
</x-cards>

### ローカルおよびアグリゲーターサービス

ローカルインスタンスや、単一の API を通じて複数のモデルへのアクセスを提供するサービスに接続します。

<x-cards data-columns="2">
  <x-card data-title="Ollama" data-icon="lucide:server" data-href="/models/ollama">
    Llama 3 などのオープンソースモデルを自身のハードウェア上でローカルに実行し、最大限のプライバシーとオフラインアクセスを実現します。
  </x-card>
  <x-card data-title="LMStudio" data-icon="lucide:laptop" data-href="/models/lmstudio">
    LMStudio アプリケーションを介してローカルで実行されているモデルに接続し、オープンソース AI を試す簡単な方法を提供します。
  </x-card>
  <x-card data-title="OpenRouter" data-icon="lucide:route" data-href="/models/open-router">
    単一の統一された API を通じて、さまざまなプロバイダーが提供する多種多様なモデルに、フォールバックオプション付きでアクセスします。
  </x-card>
  <x-card data-title="Poe" data-icon="lucide:message-square-plus" data-href="/models/poe">
    Poe プラットフォームで利用可能なさまざまなモデルと統合し、多様な AI 機能を提供します。
  </x-card>
  <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    AIGNE Hub を統一プロキシとして使用し、クライアント側のコードを変更することなく、複数の LLM プロバイダー間をシームレスに切り替えます。
  </x-card>
</x-cards>

## まとめ

AIGNE フレームワークのモジュラー設計により、特定のニーズに最適な AI モデルと簡単に統合できます。各プロバイダーには、基盤となる API の複雑さを処理する専用のパッケージがあり、一貫性のある簡単なインターフェースを提供します。

始めるには、上のリストからプロバイダーを選択し、リンク先のガイドに従って詳細な手順を確認してください。フレームワーク内でのモデルアダプターの動作に関する高レベルの概要については、[概要](./models-overview.md)ページを参照してください。