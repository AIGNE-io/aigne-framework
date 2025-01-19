# Agent 的定义

`Agent` 是一个具有统一输入/输出机制的组件，为 `Agent` 的运行提供了统一的数据校验，此外，它也为多个 `Agent` 的组合提供了标准的数据传递规范。

## 通用定义

一个 `Agent` 的通用定义包括以下几个部分：

- **`context`**：`Agent` 运行时的上下文，用于管理多个 `Agent` 及其共享状态。
- **`name`**：`Agent` 的名称，用作 `Agent` 的唯一标识。可以通过使用 `context.resolve(name)` 方法来获取相应的 `Agent` 实例。
- **`inputs`**：`Agent` 的输入定义，描述在运行时所需的输入数据结构。
- **`outputs`**：`Agent` 的输出定义，描述在运行时返回的输出数据结构。

以 `FunctionAgent` 为例，其定义如下：

```typescript
import { FunctionAgent, Runtime } from "@aigne/core";

const context = new Runtime();

const agent = FunctionAgent.create({
  context,
  name: "plus",
  inputs: {
    a: {
      type: "number",
      required: true,
    },
    b: {
      type: "number",
      required: true,
    },
  },
  outputs: {
    sum: {
      type: "number",
      required: true,
    },
  },
  function: ({ a, b }) => {
    return { sum: a + b };
  },
});

const { sum } = await agent.run({ a: 1, b: 2 });

console.log("1 + 2 =", sum); // 输出: 3
```

在该示例中，`inputs` 和 `outputs` 分别定义了输入和输出的数据结构。其中，`key` 代表数据的名称，`value` 则是数据的定义，包括数据类型及其其他可选属性配置。

完整的配置属性如下：

```typescript
export interface DataTypeSchema {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  required?: boolean;
  properties?: { [key: string]: DataTypeSchema };
  items?: DataTypeSchema;
}
```

- **`type`**：数据类型，支持 `string`、`number`、`boolean`、`object` 和 `array` 五种类型。
- **`description`**：数据描述，用于解释数据的用途和含义。
- **`required`**：必填标记，指明该数据是否为必须传入参数。
- **`properties`**：用于定义对象类型的数据结构，如果数据类型为对象，则在此定义其属性类型。
- **`items`**：用于定义数组类型的数据结构，如果数据类型为数组，则在此定义其元素类型。

### 特性

- `object` 和 `array` 类型的数据结构支持嵌套定义，并且其下级数据结构也可遵循完整的数据定义规范。
- 在 TypeScript 中，`inputs` 和 `outputs` 的定义会自动生成相应的类型定义，从而有助于代码的静态检查和智能提示。
- 在运行时，框架会自动校验输入数据的结构和类型，以确保数据的正确性。
