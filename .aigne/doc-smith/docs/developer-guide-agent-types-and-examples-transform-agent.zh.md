# Transform Agent

`TransformAgent` 是一个专门的 Agent，它使用 [JSONata](https://jsonata.org/) 表达式来重塑和操作 JSON 数据。它充当其他 Agent 之间的数据转换层，这使得它在工作流中将数据格式转换、字段重命名或重构 API 响应等任务传递给另一个 Agent 之前，显得非常宝贵。

该 Agent 提供了一种通过简单表达式处理复杂数据操作的声明式方法，无需在 JavaScript 或 TypeScript 中编写自定义处理逻辑。

## 核心概念：JSONata

`TransformAgent` 利用了 JSONata 的强大功能，这是一种专为 JSON 数据设计的轻量级查询和转换语言。通过 JSONata，您可以定义如何将输入数据映射、过滤、聚合和重构为所需的输出格式。

JSONata 的主要功能包括：
- **字段映射**：`{ "newField": oldField }`
- **数组转换**：`items.{ "name": product_name, "price": price }`
- **计算**：`$sum(items.price)`、`$count(items)`
- **条件逻辑**：`is_active ? "Active" : "Inactive"`
- **字符串和数字函数**：`$uppercase(name)`、`$round(price, 2)`

要了解更多关于其语法和功能的信息，请参阅官方 [JSONata 文档](https://jsonata.org/) 或在交互式 [JSONata Playground](https://try.jsonata.org/) 中试验表达式。

## 配置示例

您可以使用 YAML 声明式地定义一个 `TransformAgent`。此示例演示了一个常见的用例：将对象键从 `snake_case` 转换为 `camelCase`。

```yaml transform.yaml icon=mdi:file-yaml
type: transform
name: transform-agent
description: |
  一个使用 JSONata 表达式处理输入数据的 Transform Agent。
input_schema:
  type: object
  properties:
    user_id:
      type: string
      description: 用户的 ID。
    user_name:
      type: string
      description: 用户的名称。
    created_at:
      type: string
      description: 用户的创建日期。
  required:
    - user_id
    - user_name
    - created_at
output_schema:
  type: object
  properties:
    userId:
      type: string
      description: 用户的 ID。
    userName:
      type: string
      description: 用户的名称。
    createdAt:
      type: string
      description: 用户的创建日期。
  required:
    - userId
    - userName
    - createdAt
jsonata: |
  {
    "userId": user_id,
    "userName": user_name,
    "createdAt": created_at
  }
```

在此配置中：
- `input_schema` 定义了预期的输入数据结构。
- `output_schema` 定义了期望的输出数据结构。
- `jsonata` 表达式提供了将输入字段转换为输出字段的映射逻辑。

## 编程式用法

您也可以在代码中直接创建和使用 `TransformAgent`。`TransformAgent.from()` 工厂方法提供了一种便捷的方式来实例化该 Agent。

```typescript icon=logos:typescript-icon
import { TransformAgent } from "@aigne/core";

// 为清晰起见，定义输入和输出消息类型
interface UserInput {
  user_id: string;
  user_name: string;
  created_at: string;
}

interface UserOutput {
  userId: string;
  userName: string;
  createdAt: string;
}

async function runTransform() {
  // 1. 创建一个 TransformAgent 实例
  const snakeToCamelAgent = TransformAgent.from<UserInput, UserOutput>({
    name: "snake-to-camel-case-transformer",
    description: "将用户数据键从 snake_case 转换为 camelCase。",
    jsonata: `{
      "userId": user_id,
      "userName": user_name,
      "createdAt": created_at
    }`,
  });

  // 2. 定义输入数据
  const inputData: UserInput = {
    user_id: "usr_12345",
    user_name: "Jane Doe",
    created_at: "2023-10-27T10:00:00Z",
  };

  // 3. 通过 Agent 处理数据
  const result = await snakeToCamelAgent.process(inputData);

  // 4. 记录转换后的输出
  console.log(result);
  // 预期输出：
  // {
  //   userId: 'usr_12345',
  //   userName: 'Jane Doe',
  //   createdAt: '2023-10-27T10:00:00Z'
  // }
}

runTransform();
```

## Agent 选项

创建 `TransformAgent` 时，您可以提供以下选项。

<x-field-group>
  <x-field data-name="jsonata" data-type="string" data-required="true">
    <x-field-desc markdown>用于数据转换的 JSONata 表达式字符串。此表达式定义了如何将输入数据转换为输出数据。有关完整语法，请参阅 [JSONata 文档](https://jsonata.org/)。</x-field-desc>
  </x-field>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="Agent 实例的唯一名称。"></x-field>
  <x-field data-name="description" data-type="string" data-required="true" data-desc="对 Agent 用途的简要描述。"></x-field>
  <x-field data-name="input_schema" data-type="object" data-required="false" data-desc="定义预期输入消息结构的 JSON 模式。"></x-field>
  <x-field data-name="output_schema" data-type="object" data-required="false" data-desc="定义预期输出消息结构的 JSON 模式。"></x-field>
</x-field-group>

## 总结

`TransformAgent` 是一个强大而高效的工具，用于处理 AI 工作流中的数据操作。通过将数据重构任务交由专门的 Agent 处理，您可以让其他 Agent（例如 [AI Agent](./developer-guide-agent-types-and-examples-ai-agent.md) 或 [Function Agent](./developer-guide-agent-types-and-examples-function-agent.md)）专注于其核心逻辑。这种关注点分离的设计能够让 Agent 设计更清晰、更易于维护和重用。