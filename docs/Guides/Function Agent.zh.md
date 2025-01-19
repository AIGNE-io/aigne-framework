# Function Agent

`FunctionAgent` 是一个使用 JavaScript 函数实现的 Agent，可以进行精确计算，如数学计算、逻辑判断等。

## 定义

除了 `Agent` 的基本定义外，`FunctionAgent` 支持通过 `function` 属性定义一个 JavaScript 函数来处理运行逻辑。

```ts
import { FunctionAgent, Runtime } from "@aigne/core";

const context = new Runtime();

const agent = FunctionAgent.create({
  context,
  name: "getUserInfo",
  inputs: {
    userId: {
      type: "string",
      required: true,
    },
  },
  outputs: {
    name: {
      type: "string",
      required: true,
    },
    country: {
      type: "string",
      required: true,
    },
    hobbies: {
      type: "array",
      items: {
        type: "string",
      },
      required: true,
    },
  },
  function: async ({ userId }) => {
    return {
      name: "Alice",
      country: "USA",
      hobbies: ["reading", "swimming"],
    };
  },
});
```

## 配置说明

- `function` - 用于定义 `Agent` 运行时的处理函数，接收一个符合 `inputs` 定义的参数对象，该函数需要返回一个符合 `outputs` 定义的结果对象。

## 流式输出

`FunctionAgent` 的 `function` 函数可以返回一个 `ReadableStream` 或 `AsyncIterable` 对象，用于流式输出数据。

### ReadableStream

返回一个 `ReadableStream` 对象，用于流式输出数据。

注意在使用 `ReadableStream` 时，需要使用 `try-catch-finally` 来处理异常和关闭流，否则可能因为流未被关闭导致客户端一直得不到响应。

```ts
const agent = FunctionAgent.create({
  // ...,
  function: async ({ userId }) => {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 执行一些异步操作

          controller.enqueue({ name: "Alice" });
          controller.enqueue({ country: "USA" });
          controller.enqueue({ hobbies: ["reading", "swimming"] });
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return stream;
  },
});
```

### AsyncIterable

可以使用 `async function*` 异步生成器函数简化流式输出的逻辑。

```ts
const agent = FunctionAgent.create({
  // ...,
  function: async function* ({ userId }) {
    // 执行一些异步操作

    yield { name: "Alice" };
    yield { country: "USA" };
    yield { hobbies: ["reading", "swimming"] };
  },
});
```

### 流式输出示例

```ts
const result = await agent.run({ userId: "123" }, { stream: true });

for await (const { name, country, hobbies } of result) {
  console.log(name, country, hobbies);
}
```

上面的代码会输出：

```
{ name: "Alice" }
{ country: "USA" }
{ hobbies: ["reading", "swimming"] }
```

### 以非流式模式运行一个返回 `ReadableStream` 或 `AsyncIterable` 的 `FunctionAgent`

如果 `FunctionAgent` 的 `function` 函数返回了一个 `ReadableStream` 或 `AsyncIterable` 对象，但是在运行时没有传入 `stream: true` 参数，`FunctionAgent` 会自动将返回的 `ReadableStream` 或 `AsyncIterable` 对象合并为一个对象返回。

```ts
const result = await agent.run({ userId: "123" });

console.log(result);
```

上面的代码会输出：

```
{
  name: "Alice",
  country: "USA",
  hobbies: ["reading", "swimming"],
}
```
