本書は、AIGNE フレームワークの基本コンポーネントに関する開発者向けガイドです。これらの概念を理解することは、堅牢で洗練されたマルチ Agent システムを構築するために不可欠です。ここでは、`Agent`、`AIGNE コンテキスト`、そしてそれらが通信、記憶、能力拡張を可能にするメカニズムについて説明します。

### コアコンポーネント図

まず、AIGNE のコアコンポーネントがどのように相互作用するかを視覚化してみましょう。以下の図は、Agent、AIGNE コンテキスト、トピック、メモリ、スキルの関係を示しています。

```d2
direction: down

AIGNE-Context: {
  label: "AIGNE コンテキスト"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Agent: {
    label: "Agent"
    shape: rectangle
    style: {
      fill: "#e6f7ff"
      stroke: "#91d5ff"
    }
  }

  Topics: {
    label: "トピック\n(通信バス)"
    shape: rectangle
  }

  Memory: {
    label: "メモリ\n(状態と履歴)"
    shape: cylinder
  }

  Skills: {
    label: "スキル\n(拡張機能)"
    shape: rectangle
  }
}

AIGNE-Context.Agent <-> AIGNE-Context.Topics: "経由で通信"
AIGNE-Context.Agent <-> AIGNE-Context.Memory: "読み書き"
AIGNE-Context.Agent <-> AIGNE-Context.Skills: "使用"
```

---

## Agent クラス

`Agent` は、AIGNE フレームワークにおける基本的な構成要素です。タスクの実行、情報の処理、他の Agent との通信が可能な自律的なエンティティです。作成するすべてのカスタム Agent は、このベースクラスを拡張します。

### 主要な概念

*   **`name` と `description`**: 各 Agent には、識別用の `name` と、その目的を説明するオプションの `description` があります。これはデバッグや、他の Agent がその能力を理解するために非常に重要です。
*   **スキーマ (`inputSchema`, `outputSchema`)**: Agent は、Zod スキーマを使用して入力と出力の構造を定義します。これにより、Agent との間で受け渡されるすべてのデータが検証され、エラーを防ぎ、予測可能な相互作用が保証されます。
*   **`process` メソッド**: Agent のコアロジックは `process` メソッドにあります。これは抽象メソッドであり、サブクラスで実装する必要があります。このメソッドは、入力メッセージと呼び出しオプション（コンテキストを含む）を受け取り、結果を返します。結果には、直接のオブジェクト、データストリーム、あるいはタスクが引き渡される別の Agent を指定できます。

### 中核となる責務

`Agent` ベースクラスは、以下のための堅牢な基盤を提供します:
*   構造化された入力と出力の処理。
*   トピックベースのメッセージングシステムを介した他の Agent との通信。
*   過去の対話のメモリ維持。
*   `スキル`（他の Agent）を利用したタスクの委任と機能の拡張。
*   ストリーミングと非ストリーミングの両方の応答のサポート。

### 例: カスタム Agent の作成

以下は、名前を受け取って挨拶を返すカスタム Agent の基本的な例です。

```typescript
import { Agent, AgentInvokeOptions, Message } from "@aigne/core";
import { z } from "zod";

// 入力と出力のメッセージ型を定義します
interface GreetingInput extends Message {
  name: string;
}

interface GreetingOutput extends Message {
  greeting: string;
}

// カスタム Agent を作成します
class GreeterAgent extends Agent<GreetingInput, GreetingOutput> {
  constructor() {
    super({
      name: "GreeterAgent",
      description: "An agent that generates a personalized greeting.",
      inputSchema: z.object({
        name: z.string().describe("The name of the person to greet."),
      }),
      outputSchema: z.object({
        greeting: z.string().describe("The generated greeting message."),
      }),
    });
  }

  // process メソッドにコアロジックを実装します
  async process(input: GreetingInput, options: AgentInvokeOptions) {
    const { name } = input;
    return {
      greeting: `Hello, ${name}! Welcome to the AIGNE framework.`,
    };
  }
}
```

## AIGNE コンテキスト

`コンテキスト` (`AIGNEContext`) は、Agent が動作する実行環境です。これは呼び出し時に Agent に渡され、その実行に不可欠です。コンテキストは受動的なオブジェクトではなく、AIGNE エコシステム全体へのゲートウェイです。

### 主な責務

*   **Agent 間通信**: コンテキストは `publish` と `subscribe` メソッドを提供し、Agent が直接結合されることなく、名前付きトピックを通じて通信できるようにします。
*   **状態とメモリの管理**: 全体的な状態を管理し、メモリシステムへのアクセスを提供します。
*   **イベント管理**: コンテキストには、主要なライフサイクルイベント（例: `agentStarted`、`agentSucceed`、`agentFailed`）をブロードキャストするイベントエミッターが含まれています。これは、システムの監視、ロギング、デバッグに不可欠です。
*   **リソースと制限の強制**: Agent の呼び出し回数などのリソース使用量を追跡し、暴走プロセスを防ぐための制限を強制できます。

## トピックによる通信

AIGNE の Agent は、`コンテキスト` によって調整されるパブリッシュ/サブスクライブ（pub/sub）メッセージングモデルを使用して通信します。これにより、Agent が互いに分離され、柔軟でスケーラブルなアーキテクチャが可能になります。

*   **`subscribeTopic`**: Agent は、リッスンしたい1つ以上のトピックを宣言できます。サブスクライブしたトピックにメッセージがパブリッシュされると、コンテキストは自動的に Agent の `onMessage` ハンドラーをトリガーし、それが Agent を呼び出します。
*   **`publishTopic`**: 処理後、Agent はその出力を1つ以上のトピックにパブリッシュできます。これにより、関心のある他の Agent がその結果に反応できます。`publishTopic` は、静的な文字列、または出力メッセージに基づいて動的にトピックを決定する関数にすることができます。

このシステムにより、Agent が他の Agent によって生成されたイベントやデータに反応する複雑なワークフローを構築し、協調的なマルチ Agent システムを形成することができます。

## メモリ

Agent が真にインテリジェントであるためには、過去の対話を記憶する必要があります。AIGNE は、どの Agent にもアタッチできる `MemoryAgent` を提供します。

設定されると、Agent は自動的に以下のことを行います:
1.  **対話の記録**: メッセージの処理に成功した後、Agent は入力と出力のペアを関連するメモリに記録します。
2.  **メモリの取得**: 処理の前に、Agent はメモリを照会して関連する過去の対話を取得し、現在のタスクに役立つコンテキストを提供します。

これにより、Agent は経験から学び、会話の履歴を維持し、以前のイベントに関する知識を必要とするタスクを実行できるようになります。

## スキル

モジュール性と再利用性を促進するため、Agent の能力は **`スキル`** で拡張できます。スキルは単に別の `Agent` です。Agent にスキルを追加することで、特定のタスクをそのスキルに委任する能力を与えます。

例えば、複雑な「TripPlanner」Agent は、いくつかのスキルを使用するかもしれません:
*   フライトを検索するための `FlightSearchAgent`。
*   宿泊施設を予約するための `HotelBookingAgent`。
*   天気をチェックするための `WeatherAgent`。

`TripPlanner` Agent は、これらのタスクの実装詳細を知る必要はありません。スキルとしてそれらを呼び出し、その結果を調整して主要な目標を達成するだけです。「継承よりコンポジション」の原則に従っており、複雑で保守性の高い Agent システムを構築する上で重要です。

## Agent のライフサイクルとフック

すべての Agent 呼び出しは、定義されたライフサイクルを経ます。このライフサイクルには **`フック`** を使用して介入できます。フックを使用すると、Agent のコア実装を変更することなく、プロセスの主要な段階でカスタムロジックを実行できます。

主なライフサイクルイベントは次のとおりです:
*   **`onStart`**: Agent の `process` メソッドが呼び出される前。
*   **`onEnd`**: Agent が成功または失敗にかかわらず終了した後。
*   **`onSuccess`**: Agent が正常に完了した後。
*   **`onError`**: 処理中にエラーが発生したとき。
*   **`onSkillStart` / `onSkillEnd`**: スキルが呼び出される前と後。

フックは、ロギング、モニタリング、メトリクス収集、および認証やキャッシングなどの横断的関心事を実装するために非常に強力です。