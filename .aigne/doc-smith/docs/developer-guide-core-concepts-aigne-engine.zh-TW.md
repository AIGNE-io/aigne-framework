本文件為 `AIGNE` 類別提供了詳細指南，該類別是 AIGNE 框架中的核心協調器。您將學習如何初始化、設定和使用 `AIGNE` 類別來管理 Agent、處理訊息傳遞以及執行複雜的 AI 工作流程。

### 系統架構

為了理解 `AIGNE` 類別如何融入更廣泛的生態系統，讓我們將其核心元件及其互動視覺化。`AIGNE` 類別作為中心樞紐，管理 Agent、技能和通訊管道。

本文件為 `AIGNE` 類別提供了詳細指南，該類別是 AIGNE 框架中的核心協調器。您將學習如何初始化、設定和使用 `AIGNE` 類別來管理 Agent、處理訊息傳遞以及執行複雜的 AI 工作流程。

### 系統架構

為了理解 `AIGNE` 類別如何融入更廣泛的生態系統，讓我們將其核心元件及其互動視覺化。`AIGNE` 類別作為中心樞紐，管理 Agent、技能和通訊管道。

```d2
direction: down

AIGNE-Ecosystem: {
  label: "AIGNE 系統架構"
  shape: rectangle

  AIGNE-Class: {
    label: "AIGNE 類別\n(協調器)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Agents: {
    label: "Agents"
    shape: rectangle
    Agent-1: "Agent 1"
    Agent-2: "Agent 2"
    Agent-N: "..."
  }

  Skills: {
    label: "技能"
    shape: rectangle
    Skill-A: "技能 A"
    Skill-B: "技能 B"
  }

  Communication-Channels: {
    label: "通訊管道"
    shape: rectangle
    Messaging: {}
    API: {}
  }
}

AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Agents: "管理"
AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Skills: "利用"
AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Communication-Channels: "處理"

```

## 初始化與設定

`AIGNE` 類別可以直接實例化，也可以從設定檔載入。這為程式化和宣告式設定提供了靈活性。

### 建構函式

建構函式允許您使用指定的設定建立一個 `AIGNE` 實例。

**參數**

<x-field-group>
  <x-field data-name="options" data-type="AIGNEOptions" data-required="false" data-desc="AIGNE 實例的設定選項。"></x-field>
</x-field-group>

**`AIGNEOptions`**

<x-field-group>
  <x-field data-name="rootDir" data-type="string" data-required="false" data-desc="用於解析 Agent 和技能相對路徑的根目錄。"></x-field>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="AIGNE 實例的名稱。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="AIGNE 實例的描述。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="供未指定模型的 Agent 使用的全域聊天模型。"></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="用於影像處理任務的影像模型。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="AIGNE 實例將使用的技能列表。"></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="AIGNE 實例將使用的 Agent 列表。"></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="AIGNE 實例的使用限制，例如超時和 token 數量。"></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="用於監控 AIGNE 實例的觀察者。"></x-field>
</x-field-group>

**範例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

const travelAgent = new AIAgent({
  name: 'TravelAgent',
  description: 'An agent that helps with travel planning.',
  model: yourChatModel, // 假設 yourChatModel 是 ChatModel 的一個實例
});

const aigne = new AIGNE({
  name: 'MyAIGNE',
  description: 'A simple AIGNE instance.',
  agents: [travelAgent],
});

console.log('AIGNE instance created:', aigne.name);
```

### `load()`

靜態的 `load` 方法提供了一種便捷的方式，可以從包含 `aigne.yaml` 檔案和 Agent 定義的目錄中初始化一個 `AIGNE` 系統。

**參數**

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="true" data-desc="包含 aigne.yaml 檔案的目錄路徑。"></x-field>
  <x-field data-name="options" data-type="Omit<AIGNEOptions, keyof LoadOptions> & LoadOptions" data-required="false" data-desc="用於覆寫已載入設定的選項。"></x-field>
</x-field-group>

**回傳值**

<x-field data-name="Promise<AIGNE>" data-type="Promise" data-desc="一個完全初始化且已設定 Agent 和技能的 AIGNE 實例。"></x-field>

**範例**

```typescript
import { AIGNE } from '@aigne/core';

async function loadAIGNE() {
  try {
    const aigne = await AIGNE.load('./path/to/your/aigne/config');
    console.log('AIGNE instance loaded:', aigne.name);
  } catch (error) {
    console.error('Error loading AIGNE instance:', error);
  }
}

loadAIGNE();
```

## 核心元件

`AIGNE` 類別由幾個關鍵元件組成，這些元件共同協作，建立一個強大的 AI 系統。

### `agents`

`agents` 屬性是由 `AIGNE` 實例管理的主要 Agent 的集合。它提供按 Agent 名稱的索引存取。

<x-field data-name="agents" data-type="AccessorArray<Agent>" data-desc="主要 Agent 的集合。"></x-field>

### `skills`

`skills` 屬性是 `AIGNE` 實例可用的技能 Agent 的集合。它提供按技能名稱的索引存取。

<x-field data-name="skills" data-type="AccessorArray<Agent>" data-desc="技能 Agent 的集合。"></x-field>

### `model`

`model` 屬性是供所有未指定自身模型的 Agent 使用的全域聊天模型。

<x-field data-name="model" data-type="ChatModel" data-desc="全域聊天模型。"></x-field>

## Agent 管理

`AIGNE` 類別提供了管理系統內 Agent 的方法。

### `addAgent()`

`addAgent` 方法允許您將一個或多個 Agent 新增至 `AIGNE` 實例。每個 Agent 都會附加到 `AIGNE` 實例上，從而可以存取其資源。

**參數**

<x-field-group>
  <x-field data-name="...agents" data-type="Agent[]" data-required="true" data-desc="要新增的一個或多個 Agent 實例。"></x-field>
</x-field-group>

**範例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

const aigne = new AIGNE();

const weatherAgent = new AIAgent({
  name: 'WeatherAgent',
  description: 'An agent that provides weather forecasts.',
  model: yourChatModel, // 假設 yourChatModel 是 ChatModel 的一個實例
});

aigne.addAgent(weatherAgent);
console.log('Agent added:', aigne.agents[0].name);
```

## 調用

`invoke` 方法是與 Agent 互動的主要方式。它有多個多載以支援不同的調用模式。

### `invoke(agent)`

此多載會建立一個 `UserAgent`，它是圍繞一個 Agent 的包裝器，用於重複調用。

**參數**

<x-field-group>
  <x-field data-name="agent" data-type="Agent<I, O>" data-required="true" data-desc="要被包裝的目標 Agent。"></x-field>
</x-field-group>

**回傳值**

<x-field data-name="UserAgent<I, O>" data-type="UserAgent" data-desc="一個 User Agent 實例。"></x-field>

### `invoke(agent, message, options)`

這是使用訊息調用 Agent 並接收回應的標準方式。

**參數**

<x-field-group>
  <x-field data-name="agent" data-type="Agent<I, O>" data-required="true" data-desc="要調用的目標 Agent。"></x-field>
  <x-field data-name="message" data-type="I & Message" data-required="true" data-desc="要傳送給 Agent 的輸入訊息。"></x-field>
  <x-field data-name="options" data-type="InvokeOptions<U>" data-required="false" data-desc="調用的可選設定參數。"></x-field>
</x-field-group>

**回傳值**

<x-field data-name="Promise<O>" data-type="Promise" data-desc="一個解析為 Agent 完整回應的 promise。"></x-field>

**範例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

async function invokeAgent() {
  const travelAgent = new AIAgent({
    name: 'TravelAgent',
    description: 'An agent that helps with travel planning.',
    model: yourChatModel, // 假設 yourChatModel 是 ChatModel 的一個實例
  });

  const aigne = new AIGNE({
    agents: [travelAgent],
  });

  try {
    const response = await aigne.invoke(travelAgent, { content: 'Plan a trip to Paris.' });
    console.log('Agent response:', response.content);
  } catch (error) {
    console.error('Error invoking agent:', error);
  }
}

invokeAgent();
```

### 串流

`invoke` 方法也支援串流回應，只需將 `streaming` 選項設為 `true` 即可。

**範例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

async function invokeStreamingAgent() {
  const travelAgent = new AIAgent({
    name: 'TravelAgent',
    description: 'An agent that helps with travel planning.',
    model: yourChatModel, // 假設 yourChatModel 是 ChatModel 的一個實例
  });

  const aigne = new AIGNE({
    agents: [travelAgent],
  });

  try {
    const stream = await aigne.invoke(travelAgent, { content: 'Plan a trip to Paris.' }, { streaming: true });
    for await (const chunk of stream) {
      console.log('Stream chunk:', chunk.content);
    }
  } catch (error) {
    console.error('Error invoking agent:', error);
  }
}

invokeStreamingAgent();
```

## 訊息傳遞

`AIGNE` 類別為 Agent 間的通訊提供了一個訊息佇列。

### `publish()`

`publish` 方法會將訊息廣播給指定主題的所有訂閱者。

**參數**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="要發布訊息至的主題。"></x-field>
  <x-field data-name="payload" data-type="Omit<MessagePayload, 'context'> | Message" data-required="true" data-desc="訊息的負載。"></x-field>
  <x-field data-name="options" data-type="InvokeOptions<U>" data-required="false" data-desc="可選的設定參數。"></x-field>
</x-field-group>

### `subscribe()`

`subscribe` 方法允許您監聽特定主題上的訊息。它可以與一個監聽器回呼函式一起使用，也可以作為一個解析為下一條訊息的 promise 使用。

**參數**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="要訂閱的主題。"></x-field>
  <x-field data-name="listener" data-type="MessageQueueListener" data-required="false" data-desc="一個可選的回呼函式，用於處理傳入的訊息。"></x-field>
</x-field-group>

**回傳值**

<x-field data-name="Unsubscribe | Promise<MessagePayload>" data-type="Function | Promise" data-desc="如果提供了監聽器，則為一個取消訂閱的函式，否則為一個解析為下一條訊息的 promise。"></x-field>

### `unsubscribe()`

`unsubscribe` 方法會從主題中移除先前註冊的監聽器。

**參數**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="要取消訂閱的主題。"></x-field>
  <x-field data-name="listener" data-type="MessageQueueListener" data-required="true" data-desc="要移除的監聽器函式。"></x-field>
</x-field-group>

**範例**

```typescript
import { AIGNE } from '@aigne/core';

const aigne = new AIGNE();

const listener = (payload) => {
  console.log('Received message:', payload.content);
};

aigne.subscribe('news', listener);
aigne.publish('news', { content: 'AIGNE version 2.0 released!' });
aigne.unsubscribe('news', listener);
```

## 生命週期管理

`AIGNE` 類別提供了一個 `shutdown` 方法，用於優雅地終止實例及其所有的 Agent 和技能。

### `shutdown()`

`shutdown` 方法確保在終止前妥善清理資源。

**回傳值**

<x-field data-name="Promise<void>" data-type="Promise" data-desc="一個在關閉完成時解析的 promise。"></x-field>

**範例**

```typescript
import { AIGNE } from '@aigne/core';

async function shutdownAIGNE() {
  const aigne = new AIGNE();
  // ... your AIGNE logic ...
  await aigne.shutdown();
  console.log('AIGNE instance shut down.');
}

shutdownAIGNE();
```