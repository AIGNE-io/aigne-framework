# ストリーム

このセクションでは、AIGNE Core パッケージ内のストリーム処理ユーティリティに関する詳細なドキュメントを提供します。これらのユーティリティは、非同期データフローの処理、特に `Agent` の応答の管理や、`ReadableStream`、`AsyncGenerator`、Server-Sent Events (SSE) といった異なるフォーマット間のデータ変換に不可欠です。

## 概要

ストリームユーティリティは、さまざまなストリームタイプを扱うための堅牢で柔軟な方法を提供するように設計されています。主な機能は次のとおりです。

-   **変換**: オブジェクト、配列、文字列、および異なるストリームフォーマット間でデータをシームレスに変換します。
-   **操作**: 複数のストリームをマージし、チャンクを処理し、ストリームのライフサイクルイベントを処理します。
-   **イベント解析**: Server-Sent Events (SSE) を解析し、Agent の応答ストリームを変換します。
-   **データ抽出**: テキストストリーム内から構造化されたメタデータを抽出します。

これらのツールは、AI Agent と対話するレスポンシブなリアルタイムアプリケーションを構築するための基本となります。

## コアストリームユーティリティ

主要なストリームユーティリティは `packages/core/src/utils/stream-utils.ts` にあります。これらは、ストリームの作成、変換、管理の基盤を提供します。

### ストリーム変換

これらの関数を使用すると、ストリームベースのフォーマットとの間でデータを変換できます。

#### `objectToAgentResponseStream`

JSON オブジェクトを `AgentResponseStream` に変換します。これは、完全なオブジェクトを単一チャンクのストリームとして返し、Agent の応答フォーマットに準拠させるのに役立ちます。

**例**

```typescript
import { objectToAgentResponseStream } from '@aigene/core/utils';

const userMessage = { id: 'user-123', text: 'Hello, agent!' };
const stream = objectToAgentResponseStream(userMessage);

// このストリームは、完全なオブジェクトを含む1つのチャンクを発行してから閉じます。
```

#### `agentResponseStreamToObject`

`AgentResponseStream` または `AgentProcessAsyncGenerator` からすべてのチャンクを集約し、それらを単一のオブジェクトにマージします。

**例**

```typescript
import { agentResponseStreamToObject, objectToAgentResponseStream } from '@aigene/core/utils';

async function processStream() {
  const message = { result: 'This is the final object.' };
  const stream = objectToAgentResponseStream(message);

  const finalObject = await agentResponseStreamToObject(stream);
  console.log(finalObject); // { result: 'This is the final object.' }
}

processStream();
```

#### `asyncGeneratorToReadableStream`

`AgentProcessAsyncGenerator` を標準の `ReadableStream` (`AgentResponseStream`) に変換します。

**例**

```typescript
import { asyncGeneratorToReadableStream, type AgentProcessAsyncGenerator, type AgentResponseChunk } from '@aigene/core/utils';

async function* myGenerator(): AgentProcessAsyncGenerator<{ text: string }> {
  yield { delta: { text: { text: 'Hel' } } };
  yield { delta: { text: { text: 'lo' } } };
  return { text: 'Hello' };
}

const stream = asyncGeneratorToReadableStream(myGenerator());
// このストリームは、他の ReadableStream 互換 API で使用できるようになります。
```

#### `readableStreamToArray`

`ReadableStream` 全体を読み取り、すべてのチャンクを配列に収集します。オプションで、結果の配列にエラーをキャッチして含めることができます。

**例**

```typescript
import { readableStreamToArray, arrayToReadableStream } from '@aigene/core/utils';

async function streamToArrayExample() {
  const chunks = [1, 2, 3, new Error('Stream failed')];
  const stream = arrayToReadableStream(chunks);

  // エラーをキャッチしない場合 (スローされます)
  try {
    const result = await readableStreamToArray(stream);
  } catch (e) {
    console.error(e.message); // "Stream failed"
  }

  // エラーキャッチあり
  const stream2 = arrayToReadableStream(chunks);
  const resultWithErrors = await readableStreamToArray(stream2, { catchError: true });
  console.log(resultWithErrors); // [1, 2, 3, Error: Stream failed]
}

streamToArrayExample();
```

### ストリーム操作

これらの関数は、ストリームを変更および結合するためのツールを提供します。

#### `mergeReadableStreams`

複数の `ReadableStream` インスタンスを単一のストリームにマージします。結果のストリームは、入力ストリームからチャンクが利用可能になり次第、それらを転送します。すべての入力ストリームが閉じた後にのみ閉じます。

**例**

```typescript
import { mergeReadableStreams, arrayToReadableStream } from '@aigene/core/utils';

const stream1 = arrayToReadableStream(['A', 'B']);
const stream2 = arrayToReadableStream([1, 2]);

const mergedStream = mergeReadableStreams(stream1, stream2);

// mergedStream からのチャンクは 'A', 1, 'B', 2 のようになります (順序はタイミングに依存します)
```

#### `onAgentResponseStreamEnd`

`AgentResponseStream` にリスナーをアタッチして、チャンク処理、ストリーム完了 (`onResult`)、エラーなどのイベントを処理します。これにより、ストリームが閉じる前に最終結果を検査または変更できます。

**例**

```typescript
import { onAgentResponseStreamEnd, objectToAgentResponseStream } from '@aigene/core/utils';

async function monitorStream() {
  const stream = objectToAgentResponseStream({ count: 10 });

  const monitoredStream = onAgentResponseStreamEnd(stream, {
    onResult: (result) => {
      console.log('Stream finished. Final result:', result);
      // 必要に応じて最終結果を変更できます
      return { ...result, status: 'completed' };
    },
    onChunk: (chunk) => {
      console.log('Processing chunk...');
    },
    onError: (error) => {
      console.error('An error occurred:', error);
      return error;
    }
  });

  // ストリームを消費してハンドラをトリガーします
  for await (const chunk of monitoredStream) {
    // ...
  }
}

monitorStream();
```

## イベントストリーム処理

`packages/core/src/utils/event-stream.ts` にあるこれらのクラスは、Server-Sent Events (SSE) の処理と、Agent 固有のイベントストリームの解析のために設計されています。

### `AgentResponseStreamSSE`

`AgentResponseStream` をラップし、その出力を SSE 形式の文字列の `ReadableStream` に変換します。これは、Agent の応答を Web クライアントに直接送信するのに最適です。

**例**

```typescript
import { AgentResponseStreamSSE, objectToAgentResponseStream } from '@aigene/core/utils/event-stream';

// agentStream は Agent 呼び出しからの AgentResponseStream であると仮定します
const agentStream = objectToAgentResponseStream({ delta: { text: { content: 'Live update!' } } });

const sseStream = new AgentResponseStreamSSE(agentStream);

// sseStream は次のような文字列を生成します:
// 'data: {"delta":{"text":{"content":"Live update!"}}}\n\n'
```

### `AgentResponseStreamParser`

`AgentResponseStream` からのチャンクを処理する `TransformStream` です。`text` および `json` フィールドのデルタをインテリジェントにマージし、各ダウンストリームチャンクが JSON オブジェクトの完全な累積状態を含むようにします。

**例**

```typescript
import { AgentResponseStreamParser, arrayToReadableStream } from '@aigene/core/utils/event-stream';

const sourceStream = arrayToReadableStream([
  { delta: { json: { id: '123' } } },
  { delta: { json: { status: 'pending' } } },
  { delta: { text: { message: 'In progress...' } } }
]);

const parser = new AgentResponseStreamParser();
const processedStream = sourceStream.pipeThrough(parser);

// 出力チャンクは、各ステップで完全な JSON オブジェクトを持ちます:
// 1st chunk: { delta: { json: { id: '123' } } }
// 2nd chunk: { delta: { json: { id: '123', status: 'pending' } } }
// 3rd chunk: { delta: { json: { id: '123', status: 'pending' }, text: { message: '...' } } }
```

### `AgentResponseProgressStream`

指定された `Context` インスタンスのライフサイクルイベント (`agentStarted`、`agentSucceed`、`agentFailed`) をリッスンすることにより、`AgentResponseProgress` イベントの `ReadableStream` を作成します。これにより、Agent 実行フロー全体の進行状況を監視できます。

**例**

```typescript
import { AgentResponseProgressStream, Context } from '@aigene/core';

// context はアクティブな Agent 実行コンテキストであると仮定します
const context = new Context();
const progressStream = new AgentResponseProgressStream(context);

// progressStream から読み取ることで、Agent タスクのライブアップデートを取得できます。
progressStream.on('data', (progress) => {
  console.log(`Agent event: ${progress.event}`, progress.agent.name);
});
```

## 高度な機能: 構造化データの抽出

`ExtractMetadataTransform` クラスは、テキストストリーム内に埋め込まれた構造化データ (例: JSON メタデータ) を解析および抽出するための特殊なメカニズムを提供します。

### `ExtractMetadataTransform`

この `TransformStream` は、テキストストリームを開始マーカーと終了マーカーでスキャンし、それらの間のコンテンツを構造化データとして解析しようとします。抽出されたデータは、周囲のテキストとは別に `json` デルタとして発行されます。

**ユースケース**: Agent は、次のように構造化メタデータと混合されたテキストを出力する場合があります: `Here is some text... <metadata>{"key": "value"}</metadata> ...and the text continues.` この変換ストリームは、テキストをメタデータから分離できます。

**例**

```typescript
import { ExtractMetadataTransform } from '@aigene/core/utils/structured-stream-extractor';
import { arrayToReadableStream } from '@aigene/core/utils';

const stream = arrayToReadableStream([
  { delta: { text: { text: 'Some initial text ' } } },
  { delta: { text: { text: 'START_JSON{"id":1}END_JSON' } } },
  { delta: { text: { text: ' and some final text.' } } },
]);

const extractor = new ExtractMetadataTransform({
  start: 'START_JSON',
  end: 'END_JSON',
  parse: (raw) => JSON.parse(raw),
});

const processedStream = stream.pipeThrough(extractor);

// processedStream からのチャンクは次のようになります:
// 1. { delta: { text: { text: 'Some initial text' } } }
// 2. { delta: { json: { json: { id: 1 } } } }
// 3. { delta: { text: { text: ' and some final text.' } } }
```