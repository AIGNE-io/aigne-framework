# MCPAgent

`MCPAgent`は、モデルコンテキストプロトコル（MCP）を実装するサーバーと対話するために設計された特殊なAgentです。アプリケーションとMCPサーバーの間のブリッジとして機能し、シームレスに接続し、サーバーの機能を検出し、そのツール、プロンプト、リソースを利用することができます。

このAgentは、サーバーがローカルのコマンドラインプロセスとして実行されているか、HTTP経由でネットワーク上で利用可能であるかに関わらず、通信のための標準化されたインターフェースを提供することで、外部サービスの統合を簡素化します。

## アーキテクチャ概要

`MCPAgent`は、ベースの`Agent`クラスを拡張し、MCP `Client`をカプセル化してリモートサーバーとの接続と通信を管理します。サーバーが提供するものを自動的に検出し、スキル、プロンプト、リソースなどのネイティブなAIGNEコンポーネントとして表現します。

# MCPAgent

`MCPAgent`は、モデルコンテキストプロトコル（MCP）を実装するサーバーと対話するために設計された特殊なAgentです。アプリケーションとMCPサーバーの間のブリッジとして機能し、シームレスに接続し、サーバーの機能を検出し、そのツール、プロンプト、リソースを利用することができます。

このAgentは、サーバーがローカルのコマンドラインプロセスとして実行されているか、HTTP経由でネットワーク上で利用可能であるかに関わらず、通信のための標準化されたインターフェースを提供することで、外部サービスの統合を簡素化します。

## アーキテクチャ概要

`MCPAgent`は、ベースの`Agent`クラスを拡張し、MCP `Client`をカプセル化してリモートサーバーとの接続と通信を管理します。サーバーが提供するものを自動的に検出し、スキル、プロンプト、リソースなどのネイティブなAIGNEコンポーネントとして表現します。
```d2
direction: down

Application: {
  label: "あなたのアプリケーション"
  shape: rectangle
}

MCPAgent: {
  label: "MCPAgent"
  shape: rectangle

  MCP-Client: {
    label: "MCPクライアント\n(接続を管理)"
  }
}

Agent-Base: {
  label: "Agent (ベースクラス)"
}

MCP-Server: {
  label: "MCPサーバー\n(ローカルCLIまたはリモートHTTP)"
  shape: rectangle
  style.stroke-dash: 4

  Server-Offerings: {
    label: "サーバーが提供するもの"
    grid-columns: 3
    Skills: {label: "スキル"}
    Prompts: {label: "プロンプト"}
    Resources: {label: "リソース"}
  }
}

Application -> MCPAgent: "1. 使用する"
MCPAgent -> Agent-Base: "拡張" {
  style.stroke-dash: 2
}
MCPAgent.MCP-Client -> MCP-Server: "2. 接続 & 通信"
MCP-Server.Server-Offerings -> MCPAgent: "3. 発見する" {
  style.stroke-dash: 2
}
MCPAgent -> Application: "4. コンポーネントを提供\n(スキル, プロンプト, リソース)"

```

## MCPAgentの作成

`MCPAgent`を作成するには、主に2つの方法があります。MCPサーバーへの新しい接続を確立する方法と、事前設定済みのMCPクライアントインスタンスを使用する方法です。

### 1. サーバー接続から

静的メソッド`MCPAgent.from()`は、Agentを作成する最も一般的な方法です。接続プロセスを処理し、サーバーの機能を自動的に検出します。

#### SSEトランスポートの使用

サーバーサイドイベント（SSE）を使用してリモートMCPサーバーに接続できます。これは、URLが提供された場合のデフォルトのトランスポートメカニズムです。

**パラメータ**

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true" data-desc="リモートMCPサーバーのURL。"></x-field>
  <x-field data-name="transport" data-type="'sse' | 'streamableHttp'" data-default="'sse'" data-desc="トランスポートプロトコルを指定します。デフォルトは 'sse' です。"></x-field>
  <x-field data-name="timeout" data-type="number" data-default="60000" data-desc="リクエストのタイムアウト（ミリ秒）。"></x-field>
  <x-field data-name="maxReconnects" data-type="number" data-default="10" data-desc="接続が失われた場合の自動再接続試行の最大数。0に設定すると無効になります。"></x-field>
  <x-field data-name="shouldReconnect" data-type="(error: Error) => boolean" data-desc="受信したエラーに基づいて再接続を試みるべきかどうかを判断する関数。デフォルトではすべてのエラーに対して true となります。"></x-field>
  <x-field data-name="opts" data-type="SSEClientTransportOptions" data-desc="基礎となるSSEClientTransportに渡す追加オプション。"></x-field>
</x-field-group>

**例**

```typescript
import { MCPAgent } from "@aigne/core";

// SSEトランスポートを使用してMCPAgentを作成する例
const agent = await MCPAgent.from({
  url: "http://example.com/mcp-server",
});

console.log("MCPAgent created from SSE server:", agent.name);
```

#### StreamableHTTPトランスポートの使用

対応しているサーバーでは、パフォーマンス上の利点がある`streamableHttp`トランスポートを使用できます。

**例**

```typescript
import { MCPAgent } from "@aigne/core";

// StreamableHTTPトランスポートを使用してMCPAgentを作成する例
const agent = await MCPAgent.from({
  url: "http://example.com/mcp-server",
  transport: "streamableHttp",
});

console.log("MCPAgent created from StreamableHTTP server:", agent.name);
```

#### Stdioトランスポートの使用

標準入出力（stdio）を介して通信するローカルMCPサーバーに接続するには、実行するコマンドを指定できます。

**パラメータ**

<x-field-group>
    <x-field data-name="command" data-type="string" data-required="true" data-desc="MCPサーバープロセスを開始するために実行するコマンド。"></x-field>
    <x-field data-name="args" data-type="string[]" data-desc="コマンドに渡す文字列引数の配列。"></x-field>
    <x-field data-name="env" data-type="Record<string, string>" data-desc="プロセスに設定する環境変数。"></x-field>
</x-field-group>

**例**

```typescript
import { MCPAgent } from "@aigne/core";

// Stdioトランスポートを使用してMCPAgentを作成する例
const agent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});

console.log("MCPAgent created from stdio server:", agent.name);
```

### 2. 事前設定済みクライアントから

既存のMCP `Client`インスタンスがある場合は、それを直接`MCPAgent`コンストラクタに渡すことができます。これは、クライアントのライフサイクルや設定を個別に管理する必要があるシナリオで役立ちます。

**パラメータ**

<x-field-group>
    <x-field data-name="client" data-type="Client" data-required="true" data-desc="事前設定済みのMCPクライアントインスタンス。"></x-field>
    <x-field data-name="prompts" data-type="MCPPrompt[]" data-desc="事前定義されたMCPプロンプトのオプション配列。"></x-field>
    <x-field data-name="resources" data-type="MCPResource[]" data-desc="事前定義されたMCPリソースのオプション配列。"></x-field>
</x-field-group>

**例**

```typescript
import { MCPAgent } from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// 直接クライアントインスタンスを使用してMCPAgentを作成する例
const client = new Client({ name: "MyClient", version: "1.0.0" });
await client.connect(new SSEClientTransport(new URL("http://example.com/mcp-server")));

const agent = new MCPAgent({
  name: "MyDirectAgent",
  client,
});

console.log("MCPAgent created from direct client:", agent.name);
```

## プロパティ

`MCPAgent`インスタンスは、いくつかのプロパティを通じてサーバーの機能へのアクセスを提供します。

### `client`

MCPサーバーとのすべての通信に使用される、基礎となる`Client`インスタンスです。

<x-field data-name="client" data-type="Client" data-desc="MCPクライアントインスタンス。"></x-field>

### `skills`

MCPサーバーによって公開されたツールは自動的に検出され、`skills`プロパティ内の`Agent`インスタンスの配列として利用可能になります。スキルにはインデックスまたは名前でアクセスできます。

<x-field data-name="skills" data-type="Agent[]" data-desc="サーバーから検出された呼び出し可能なスキルの配列。"></x-field>

**例：スキルへのアクセス**

```typescript
// 利用可能なすべてのスキル名をリストアップ
const skillNames = agent.skills.map(skill => skill.name);
console.log("Available skills:", skillNames);

// 名前で特定のスキルにアクセス
const getTickerSkill = agent.skills["get-ticker"];
if (getTickerSkill) {
  console.log("Found skill:", getTickerSkill.description);
}
```

### `prompts`

サーバーから利用可能なプロンプトには、`prompts`配列を介してアクセスできます。

<x-field data-name="prompts" data-type="MCPPrompt[]" data-desc="サーバーから利用可能なMCPプロンプトの配列。"></x-field>

**例：プロンプトへのアクセス**

```typescript
// 名前でプロンプトにアクセス
const examplePrompt = agent.prompts['example-prompt'];

if (examplePrompt) {
    const result = await examplePrompt.invoke({
        variable1: "value1"
    });
    console.log(result.content);
}
```

### `resources`

リソーステンプレートを含むリソースは、`resources`配列で利用できます。

<x-field data-name="resources" data-type="MCPResource[]" data-desc="サーバーから利用可能なMCPリソースの配列。"></x-field>

**例：リソースへのアクセス**

```typescript
// 名前でリソースにアクセス
const userDataResource = agent.resources['user-data'];

if (userDataResource) {
    const result = await userDataResource.invoke({
        userId: "123"
    });
    console.log(result.content);
}
```

## メソッド

### `shutdown()`

このメソッドは、MCPサーバーへの接続を閉じることで、Agentをクリーンにシャットダウンします。Agentの使用が終了したら、リソースを解放するためにこのメソッドを呼び出すことが重要です。

**例：Agentのシャットダウン**

```typescript
// shutdownが確実に呼び出されるように、finallyブロックを使用することを推奨します
try {
  // Agentを使用...
  const ticker = await agent.skills['get-ticker'].invoke({
    exchange: "coinbase",
    symbol: "BTC/USD",
  });
  console.log(ticker);
} finally {
  await agent.shutdown();
  console.log("Agent has been shut down.");
}
```

`MCPAgent`は`Symbol.asyncDispose`メソッドもサポートしており、`using`ステートメントを使用して自動的なリソース管理を行うことができます。

**例：`await using`を使用した自動シャットダウン**

```typescript
import { MCPAgent } from "@aigne/core";

async function main() {
    await using agent = await MCPAgent.from({
        url: "http://example.com/mcp-server",
    });
    
    // このブロックの終わりにAgentは自動的にシャットダウンされます
    const skills = agent.skills.map(s => s.name);
    console.log("Available skills:", skills);
}

main();
```