# MCPAgent

`MCPAgent` 是一個專門的 agent，旨在與實作模型情境協議 (MCP) 的伺服器互動。它作為您的應用程式和 MCP 伺服器之間的橋樑，讓您能無縫地連接到它們、探索其功能，並利用其工具、提示和資源。

無論伺服器是作為本機命令列程序執行，還是透過 HTTP 在網路上可用，此 agent 都能透過提供標準化的通訊介面來簡化外部服務的整合。

## 架構概覽

`MCPAgent` 擴充了基礎的 `Agent` 類別，並封裝了一個 MCP `Client` 來管理與遠端伺服器的連線和通訊。它會自動探索伺服器提供的項目，並將它們表示為原生的 AIGNE 元件，例如技能、提示和資源。

# MCPAgent

`MCPAgent` 是一個專門的 agent，旨在與實作模型情境協議 (MCP) 的伺服器互動。它作為您的應用程式和 MCP 伺服器之間的橋樑，讓您能無縫地連接到它們、探索其功能，並利用其工具、提示和資源。

無論伺服器是作為本機命令列程序執行，還是透過 HTTP 在網路上可用，此 agent 都能透過提供標準化的通訊介面來簡化外部服務的整合。

## 架構概覽

`MCPAgent` 擴充了基礎的 `Agent` 類別，並封裝了一個 MCP `Client` 來管理與遠端伺服器的連線和通訊。它會自動探索伺服器提供的項目，並將它們表示為原生的 AIGNE 元件，例如技能、提示和資源。
```d2
direction: down

Application: {
  label: "您的應用程式"
  shape: rectangle
}

MCPAgent: {
  label: "MCPAgent"
  shape: rectangle

  MCP-Client: {
    label: "MCP 客戶端\n(管理連線)"
  }
}

Agent-Base: {
  label: "Agent (基礎類別)"
}

MCP-Server: {
  label: "MCP 伺服器\n(本機 CLI 或遠端 HTTP)"
  shape: rectangle
  style.stroke-dash: 4

  Server-Offerings: {
    label: "伺服器提供的項目"
    grid-columns: 3
    Skills: {}
    Prompts: {}
    Resources: {}
  }
}

Application -> MCPAgent: "1. 使用"
MCPAgent -> Agent-Base: "extends" {
  style.stroke-dash: 2
}
MCPAgent.MCP-Client -> MCP-Server: "2. 連線與通訊"
MCP-Server.Server-Offerings -> MCPAgent: "3. 探索" {
  style.stroke-dash: 2
}
MCPAgent -> Application: "4. 提供元件\n(技能、提示、資源)"

```

## 建立 MCPAgent

有兩種主要方式可以建立 `MCPAgent`：與 MCP 伺服器建立新連線，或使用預先設定的 MCP 客戶端實例。

### 1. 從伺服器連線

靜態 `MCPAgent.from()` 方法是建立 agent 最常見的方式。它會處理連線過程並自動探索伺服器的功能。

#### 使用 SSE 傳輸

您可以使用伺服器發送事件 (SSE) 連接到遠端的 MCP 伺服器。這是提供 URL 時的預設傳輸機制。

**參數**

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true" data-desc="遠端 MCP 伺服器的 URL。"></x-field>
  <x-field data-name="transport" data-type="'sse' | 'streamableHttp'" data-default="'sse'" data-desc="指定傳輸協定。預設為 'sse'。"></x-field>
  <x-field data-name="timeout" data-type="number" data-default="60000" data-desc="請求逾時時間（毫秒）。"></x-field>
  <x-field data-name="maxReconnects" data-type="number" data-default="10" data-desc="連線中斷時自動重新連線的最大嘗試次數。設為 0 可停用。"></x-field>
  <x-field data-name="shouldReconnect" data-type="(error: Error) => boolean" data-desc="一個函式，用於根據收到的錯誤決定是否應嘗試重新連線。預設對所有錯誤皆為 true。"></x-field>
  <x-field data-name="opts" data-type="SSEClientTransportOptions" data-desc="傳遞給底層 SSEClientTransport 的額外選項。"></x-field>
</x-field-group>

**範例**

```typescript
import { MCPAgent } from "@aigne/core";

// 使用 SSE 傳輸建立 MCPAgent 的範例
const agent = await MCPAgent.from({
  url: "http://example.com/mcp-server",
});

console.log("MCPAgent created from SSE server:", agent.name);
```

#### 使用 StreamableHTTP 傳輸

對於支援此功能的伺服器，您可以使用 `streamableHttp` 傳輸，這可以提供效能優勢。

**範例**

```typescript
import { MCPAgent } from "@aigne/core";

// 使用 StreamableHTTP 傳輸建立 MCPAgent 的範例
const agent = await MCPAgent.from({
  url: "http://example.com/mcp-server",
  transport: "streamableHttp",
});

console.log("MCPAgent created from StreamableHTTP server:", agent.name);
```

#### 使用 Stdio 傳輸

若要連接到透過標準輸入/輸出 (stdio) 進行通訊的本機 MCP 伺服器，您可以指定要執行的命令。

**參數**

<x-field-group>
    <x-field data-name="command" data-type="string" data-required="true" data-desc="執行以啟動 MCP 伺服器程序的命令。"></x-field>
    <x-field data-name="args" data-type="string[]" data-desc="要傳遞給命令的字串參數陣列。"></x-field>
    <x-field data-name="env" data-type="Record<string, string>" data-desc="為程序設定的環境變數。"></x-field>
</x-field-group>

**範例**

```typescript
import { MCPAgent } from "@aigne/core";

// 使用 Stdio 傳輸建立 MCPAgent 的範例
const agent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});

console.log("MCPAgent created from stdio server:", agent.name);
```

### 2. 從預先設定的客戶端

如果您有現有的 MCP `Client` 實例，可以直接將其傳遞給 `MCPAgent` 的建構函式。這在您需要分開管理客戶端的生命週期或設定的情境中很有用。

**參數**

<x-field-group>
    <x-field data-name="client" data-type="Client" data-required="true" data-desc="一個預先設定的 MCP Client 實例。"></x-field>
    <x-field data-name="prompts" data-type="MCPPrompt[]" data-desc="一個可選的預先定義 MCP 提示陣列。"></x-field>
    <x-field data-name="resources" data-type="MCPResource[]" data-desc="一個可選的預先定義 MCP 資源陣列。"></x-field>
</x-field-group>

**範例**

```typescript
import { MCPAgent } from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// 使用直接客戶端實例建立 MCPAgent 的範例
const client = new Client({ name: "MyClient", version: "1.0.0" });
await client.connect(new SSEClientTransport(new URL("http://example.com/mcp-server")));

const agent = new MCPAgent({
  name: "MyDirectAgent",
  client,
});

console.log("MCPAgent created from direct client:", agent.name);
```

## 屬性

`MCPAgent` 實例透過幾個屬性提供了存取伺服器功能的途徑。

### `client`

用於與 MCP 伺服器進行所有通訊的底層 `Client` 實例。

<x-field data-name="client" data-type="Client" data-desc="MCP 客戶端實例。"></x-field>

### `skills`

MCP 伺服器公開的工具會被自動探索，並作為 `Agent` 實例的陣列在 `skills` 屬性中提供。您可以透過索引或名稱來存取技能。

<x-field data-name="skills" data-type="Agent[]" data-desc="從伺服器探索到的可呼叫技能陣列。"></x-field>

**範例：存取技能**

```typescript
// 列出所有可用的技能名稱
const skillNames = agent.skills.map(skill => skill.name);
console.log("Available skills:", skillNames);

// 透過名稱存取特定技能
const getTickerSkill = agent.skills["get-ticker"];
if (getTickerSkill) {
  console.log("Found skill:", getTickerSkill.description);
}
```

### `prompts`

從伺服器可用的提示可以透過 `prompts` 陣列存取。

<x-field data-name="prompts" data-type="MCPPrompt[]" data-desc="從伺服器可用的 MCP 提示陣列。"></x-field>

**範例：存取提示**

```typescript
// 透過名稱存取提示
const examplePrompt = agent.prompts['example-prompt'];

if (examplePrompt) {
    const result = await examplePrompt.invoke({
        variable1: "value1"
    });
    console.log(result.content);
}
```

### `resources`

資源，包括資源範本，可在 `resources` 陣列中取得。

<x-field data-name="resources" data-type="MCPResource[]" data-desc="從伺服器可用的 MCP 資源陣列。"></x-field>

**範例：存取資源**

```typescript
// 透過名稱存取資源
const userDataResource = agent.resources['user-data'];

if (userDataResource) {
    const result = await userDataResource.invoke({
        userId: "123"
    });
    console.log(result.content);
}
```

## 方法

### `shutdown()`

此方法透過關閉與 MCP 伺服器的連線來乾淨地關閉 agent。當您使用完 agent 後，呼叫此方法以釋放資源至關重要。

**範例：關閉 Agent**

```typescript
// 建議使用 finally 區塊以確保 shutdown 被呼叫
try {
  // 使用 agent...
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

`MCPAgent` 也支援 `Symbol.asyncDispose` 方法，讓您可以使用 `using` 陳述式來進行自動資源管理。

**範例：使用 `await using` 自動關閉**

```typescript
import { MCPAgent } from "@aigne/core";

async function main() {
    await using agent = await MCPAgent.from({
        url: "http://example.com/mcp-server",
    });
    
    // 在此區塊結束時，agent 將會自動關閉
    const skills = agent.skills.map(s => s.name);
    console.log("Available skills:", skills);
}

main();
```