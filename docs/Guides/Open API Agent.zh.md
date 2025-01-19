# Open API Agent

`OpenAPIAgent` 是一个使用开放 API 实现的 `Agent`，可以调用任意开放 API，如天气查询、新闻查询，以及特定场景的数据查询如股票、加密货币的价格查询等。

## 定义

除了 `Agent` 的基本定义外，`OpenAPIAgent` 还需要定义 API 相关的 `url` 和 `method`，另外还可以在 `inputs` 中为各个参数定义 `in` 属性以指定参数的位置。

```ts
import { OpenAPIAgent, Runtime } from "@aigne/core";

const context = new Runtime();

const agent = OpenAPIAgent.create({
  context,
  name: "weather_forecast",
  inputs: {
    version: {
      type: "string",
      required: true,
      in: "path",
    },
    latitude: {
      type: "number",
      in: "query",
    },
    longitude: {
      type: "number",
      in: "query",
    },
  },
  outputs: {
    current_units: {
      type: "object",
      required: true,
      properties: {
        time: {
          type: "string",
          required: true,
        },
        temperature_2m: {
          type: "string",
          required: true,
        },
      },
    },
    current: {
      type: "object",
      required: true,
      properties: {
        time: {
          type: "string",
          required: true,
        },
        temperature_2m: {
          type: "number",
          required: true,
        },
      },
    },
  },
  url: "https://api.open-meteo.com/{version}/forecast?current=temperature_2m",
  method: "get",
});
```

## 配置说明

- `inputs` - 用于定义 API 请求时所需的输入数据结构
  - `in` - 参数的位置，支持 `path`、`query`、`header`、`cookie`、`body` 等位置（GET 请求默认为 `query`，POST 请求默认为 `body`）
- `url` - API 的 URL 地址，支持使用 `{xxx}` 语法引用输入参数（注意输入参数需要定义 `in` 为 `path`）
- `method` - API 的请求方法，支持 `get`、`post`、`put`、`delete`、`patch` 等方法
- `auth` - (可选) 定义 API 的认证信息
  - `type` - 认证类型，支持 `bearer`、`basic`、`custom`（custom 模式可以自定义 `auth` 方法获取下面的数据结构作为认证信息）
  - `token` - 认证 token
  - `in` - 认证 token 的位置，支持 `header`、`query`、`cookie`（默认为 `header`）
  - `key` - 认证 token 的 key（默认 header 中为 `Authorization`，query 和 cookie 中为 `token`）

## 运行示例

运行 `weather_forecast` `Agent`：

```ts
const result = await agent.run({
  version: "v1",
  latitude: 24.8797,
  longitude: 102.8332,
});

console.log(result);
```

输出：

```json
{
  "current_units": {
    "time": "iso8601",
    "temperature_2m": "°C"
  },
  "current": {
    "time": "2025-01-19T11:45",
    "temperature_2m": 13.2
  }
}
```
