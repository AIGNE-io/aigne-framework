[Documentation](../../README.md) / [@aigne/core](README.md) / server

# server

## Classes

### AIGNEServer

AIGNEServer provides HTTP API access to AIGNE capabilities.
It handles requests to invoke agents, manages response streaming,
and supports multiple HTTP server frameworks including Node.js http,
Express, and Fetch API compatible environments.

#### Examples

Here's a simple example of how to use AIGNEServer with express:

```ts
const model = new OpenAIChatModel();

const chat = AIAgent.from({
  name: "chat",
});

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model, agents: [chat] });

// Create an AIGNEServer instance
const aigneServer = new AIGNEServer(aigne);

// Setup the server to handle incoming requests
const server = express();

server.post("/aigne/invoke", async (req, res) => {
  await aigneServer.invoke(req, res);
});

const httpServer = server.listen(port);

// Create an AIGNEClient instance
const client = new AIGNEClient({ url });

// Invoke the agent by client
const response = await client.invoke("chat", { $message: "hello" });

console.log(response); // Output: {$message: "Hello world!"}
```

Here's an example of how to use AIGNEServer with Hono:

```ts
const model = new OpenAIChatModel();

const chat = AIAgent.from({
  name: "chat",
});

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model, agents: [chat] });

// Create an AIGNEServer instance
const aigneServer = new AIGNEServer(aigne);

// Setup the server to handle incoming requests
const honoApp = new Hono();

honoApp.post("/aigne/invoke", async (c) => {
  return aigneServer.invoke(c.req.raw);
});

const server = serve({ port, fetch: honoApp.fetch });

// Create an AIGNEClient instance
const client = new AIGNEClient({ url });

// Invoke the agent by client
const response = await client.invoke("chat", { $message: "hello" });

console.log(response); // Output: {$message: "Hello world!"}
```

#### Constructors

##### Constructor

> **new AIGNEServer**(`engine`, `options?`): [`AIGNEServer`](#aigneserver)

Creates a new AIGNEServer instance.

###### Parameters

| Parameter  | Type                                          | Description                                                   |
| ---------- | --------------------------------------------- | ------------------------------------------------------------- |
| `engine`   | [`AIGNE`](aigne.md#aigne)                     | The AIGNE engine instance that will process agent invocations |
| `options?` | [`AIGNEServerOptions`](#aigneserveroptions-1) | Configuration options for the server                          |

###### Returns

[`AIGNEServer`](#aigneserver)

#### Properties

| Property                        | Type                                          | Description                                                   |
| ------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| <a id="engine"></a> `engine`    | [`AIGNE`](aigne.md#aigne)                     | The AIGNE engine instance that will process agent invocations |
| <a id="options"></a> `options?` | [`AIGNEServerOptions`](#aigneserveroptions-1) | Configuration options for the server                          |

#### Methods

##### invoke()

###### Call Signature

> **invoke**(`request`): `Promise`\<`Response`\>

Invokes an agent with the provided input and returns a standard web Response.
This method serves as the primary API endpoint for agent invocation.

The request can be provided in various formats to support different integration scenarios:

- As a pre-parsed JavaScript object
- As a Fetch API Request instance (for modern web frameworks)
- As a Node.js IncomingMessage (for Express, Fastify, etc.)

###### Parameters

| Parameter | Type                                                              | Description                                          |
| --------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| `request` | `Record`\<`string`, `unknown`\> \| `Request` \| `IncomingMessage` | The agent invocation request in any supported format |

###### Returns

`Promise`\<`Response`\>

A web standard Response object that can be returned directly in frameworks
like Hono, Next.js, or any Fetch API compatible environment

###### Example

Here's a simple example of how to use AIGNEServer with Hono:

```ts
const model = new OpenAIChatModel();

const chat = AIAgent.from({
  name: "chat",
});

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model, agents: [chat] });

// Create an AIGNEServer instance
const aigneServer = new AIGNEServer(aigne);

// Setup the server to handle incoming requests
const honoApp = new Hono();

honoApp.post("/aigne/invoke", async (c) => {
  return aigneServer.invoke(c.req.raw);
});

const server = serve({ port, fetch: honoApp.fetch });

// Create an AIGNEClient instance
const client = new AIGNEClient({ url });

// Invoke the agent by client
const response = await client.invoke("chat", { $message: "hello" });

console.log(response); // Output: {$message: "Hello world!"}
```

###### Call Signature

> **invoke**(`request`, `response`): `Promise`\<`void`\>

Invokes an agent with the provided input and streams the response to a Node.js ServerResponse.
This overload is specifically designed for Node.js HTTP server environments.

The method handles both regular JSON responses and streaming Server-Sent Events (SSE)
responses based on the options specified in the request.

###### Parameters

| Parameter  | Type                                                              | Description                                                |
| ---------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `request`  | `Record`\<`string`, `unknown`\> \| `Request` \| `IncomingMessage` | The agent invocation request in any supported format       |
| `response` | `ServerResponse`                                                  | The Node.js ServerResponse object to write the response to |

###### Returns

`Promise`\<`void`\>

###### Example

Here's a simple example of how to use AIGNEServer with express:

```ts
const model = new OpenAIChatModel();

const chat = AIAgent.from({
  name: "chat",
});

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model, agents: [chat] });

// Create an AIGNEServer instance
const aigneServer = new AIGNEServer(aigne);

// Setup the server to handle incoming requests
const server = express();

server.post("/aigne/invoke", async (req, res) => {
  await aigneServer.invoke(req, res);
});

const httpServer = server.listen(port);

// Create an AIGNEClient instance
const client = new AIGNEClient({ url });

// Invoke the agent by client
const response = await client.invoke("chat", { $message: "hello" });

console.log(response); // Output: {$message: "Hello world!"}
```

---

### ServerError

Custom error class for AIGNEServer HTTP-related errors.
Extends the standard Error class with an HTTP status code property.
This allows error responses to include appropriate HTTP status codes.

#### Extends

- `Error`

#### Constructors

##### Constructor

> **new ServerError**(`status`, `message`): [`ServerError`](#servererror)

Creates a new ServerError instance.

###### Parameters

| Parameter | Type     | Description                                               |
| --------- | -------- | --------------------------------------------------------- |
| `status`  | `number` | The HTTP status code for this error (e.g., 400, 404, 500) |
| `message` | `string` | The error message describing what went wrong              |

###### Returns

[`ServerError`](#servererror)

###### Overrides

`Error.constructor`

#### Properties

| Property                                            | Type                            | Description                                                                                                        | Inherited from            |
| --------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| <a id="cause"></a> `cause?`                         | `unknown`                       | -                                                                                                                  | `Error.cause`             |
| <a id="message"></a> `message`                      | `string`                        | -                                                                                                                  | `Error.message`           |
| <a id="name"></a> `name`                            | `string`                        | -                                                                                                                  | `Error.name`              |
| <a id="stack"></a> `stack?`                         | `string`                        | -                                                                                                                  | `Error.stack`             |
| <a id="status"></a> `status`                        | `number`                        | The HTTP status code for this error (e.g., 400, 404, 500)                                                          | -                         |
| <a id="preparestacktrace"></a> `prepareStackTrace?` | (`err`, `stackTraces`) => `any` | Optional override for formatting stack traces **See** https://v8.dev/docs/stack-trace-api#customizing-stack-traces | `Error.prepareStackTrace` |
| <a id="stacktracelimit"></a> `stackTraceLimit`      | `number`                        | The maximum number of stack frames to capture.                                                                     | `Error.stackTraceLimit`   |

#### Methods

##### captureStackTrace()

###### Call Signature

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

###### Parameters

| Parameter         | Type       |
| ----------------- | ---------- |
| `targetObject`    | `object`   |
| `constructorOpt?` | `Function` |

###### Returns

`void`

###### Inherited from

`Error.captureStackTrace`

###### Call Signature

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

###### Parameters

| Parameter         | Type       |
| ----------------- | ---------- |
| `targetObject`    | `object`   |
| `constructorOpt?` | `Function` |

###### Returns

`void`

###### Inherited from

`Error.captureStackTrace`

##### isError()

> `static` **isError**(`value`): `value is Error`

###### Parameters

| Parameter | Type      |
| --------- | --------- |
| `value`   | `unknown` |

###### Returns

`value is Error`

###### Inherited from

`Error.isError`

## Interfaces

### AIGNEServerOptions

Configuration options for the AIGNEServer.
These options control various aspects of server behavior including
request parsing, payload limits, and response handling.

#### Properties

| Property                                        | Type     | Description                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="maximumbodysize"></a> `maximumBodySize?` | `string` | Maximum body size for incoming HTTP requests. This controls the upper limit of request payload size when parsing raw HTTP requests. Only used when working with Node.js IncomingMessage objects that don't already have a pre-parsed body property (e.g., when not using Express middleware). **Default** `"4mb"` |

## Variables

### invokePayloadSchema

> `const` **invokePayloadSchema**: `ZodObject`\<\{ `agent`: `ZodString`; `input`: `ZodRecord`\<`ZodString`, `ZodUnknown`\>; `options`: `ZodOptional`\<`ZodNullable`\<`ZodObject`\<\{ `streaming`: `ZodOptional`\<`ZodNullable`\<`ZodBoolean`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `streaming?`: `null` \| `boolean`; \}, \{ `streaming?`: `null` \| `boolean`; \}\>\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `agent`: `string`; `input`: `Record`\<`string`, `unknown`\>; `options?`: `null` \| \{ `streaming?`: `null` \| `boolean`; \}; \}, \{ `agent`: `string`; `input`: `Record`\<`string`, `unknown`\>; `options?`: `null` \| \{ `streaming?`: `null` \| `boolean`; \}; \}\>

Schema for validating agent invocation payloads.
Defines the expected structure for requests to invoke an agent.
