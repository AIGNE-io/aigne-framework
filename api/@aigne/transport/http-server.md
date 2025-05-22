# http-server

## Classes

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

##### status

> **status**: `number`

The HTTP status code for this error (e.g., 400, 404, 500)

---

### AIGNEHTTPServer

AIGNEHTTPServer provides HTTP API access to AIGNE capabilities.
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
const aigneServer = new AIGNEHTTPServer(aigne);

// Setup the server to handle incoming requests
const server = express();
server.post("/aigne/invoke", async (req, res) => {
  await aigneServer.invoke(req, res);
});
const httpServer = server.listen(port);

// Create an AIGNEClient instance
const client = new AIGNEHTTPClient({ url });

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
const aigneServer = new AIGNEHTTPServer(aigne);

// Setup the server to handle incoming requests
const honoApp = new Hono();
honoApp.post("/aigne/invoke", async (c) => {
  return aigneServer.invoke(c.req.raw);
});
const server = serve({ port, fetch: honoApp.fetch });

// Create an AIGNEClient instance
const client = new AIGNEHTTPClient({ url });

// Invoke the agent by client
const response = await client.invoke("chat", { $message: "hello" });
console.log(response); // Output: {$message: "Hello world!"}
```

#### Constructors

##### Constructor

> **new AIGNEHTTPServer**(`engine`, `options?`): [`AIGNEHTTPServer`](#aignehttpserver)

Creates a new AIGNEServer instance.

###### Parameters

| Parameter  | Type                                                | Description                                                   |
| ---------- | --------------------------------------------------- | ------------------------------------------------------------- |
| `engine`   | [`AIGNE`](../core/aigne.md#aigne)                   | The AIGNE engine instance that will process agent invocations |
| `options?` | [`AIGNEHTTPServerOptions`](#aignehttpserveroptions) | Configuration options for the server                          |

###### Returns

[`AIGNEHTTPServer`](#aignehttpserver)

#### Properties

##### engine

> **engine**: [`AIGNE`](../core/aigne.md#aigne)

The AIGNE engine instance that will process agent invocations

##### options?

> `optional` **options**: [`AIGNEHTTPServerOptions`](#aignehttpserveroptions)

Configuration options for the server

#### Methods

##### invoke()

###### Call Signature

> **invoke**(`request`, `options?`): `Promise`\<`Response`\>

Invokes an agent with the provided input and returns a standard web Response.
This method serves as the primary API endpoint for agent invocation.

The request can be provided in various formats to support different integration scenarios:

- As a pre-parsed JavaScript object
- As a Fetch API Request instance (for modern web frameworks)
- As a Node.js IncomingMessage (for Express, Fastify, etc.)

###### Parameters

| Parameter  | Type                                                                                                                      | Description                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `request`  | `Record`\<`string`, `unknown`\> \| `Request` \| `IncomingMessage`                                                         | The agent invocation request in any supported format |
| `options?` | `ServerResponse`\<`IncomingMessage`\> \| [`AIGNEHTTPServerInvokeOptions`](#aignehttpserverinvokeoptions)\<`UserContext`\> | -                                                    |

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
const aigneServer = new AIGNEHTTPServer(aigne);

// Setup the server to handle incoming requests
const honoApp = new Hono();
honoApp.post("/aigne/invoke", async (c) => {
  return aigneServer.invoke(c.req.raw);
});
const server = serve({ port, fetch: honoApp.fetch });

// Create an AIGNEClient instance
const client = new AIGNEHTTPClient({ url });

// Invoke the agent by client
const response = await client.invoke("chat", { $message: "hello" });
console.log(response); // Output: {$message: "Hello world!"}
```

###### Call Signature

> **invoke**(`request`, `response`, `options?`): `Promise`\<`void`\>

Invokes an agent with the provided input and streams the response to a Node.js ServerResponse.
This overload is specifically designed for Node.js HTTP server environments.

The method handles both regular JSON responses and streaming Server-Sent Events (SSE)
responses based on the options specified in the request.

###### Parameters

| Parameter  | Type                                                                             | Description                                                |
| ---------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `request`  | `Record`\<`string`, `unknown`\> \| `Request` \| `IncomingMessage`                | The agent invocation request in any supported format       |
| `response` | `ServerResponse`                                                                 | The Node.js ServerResponse object to write the response to |
| `options?` | [`AIGNEHTTPServerInvokeOptions`](#aignehttpserverinvokeoptions)\<`UserContext`\> | -                                                          |

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
const aigneServer = new AIGNEHTTPServer(aigne);

// Setup the server to handle incoming requests
const server = express();
server.post("/aigne/invoke", async (req, res) => {
  await aigneServer.invoke(req, res);
});
const httpServer = server.listen(port);

// Create an AIGNEClient instance
const client = new AIGNEHTTPClient({ url });

// Invoke the agent by client
const response = await client.invoke("chat", { $message: "hello" });

console.log(response); // Output: {$message: "Hello world!"}
```

## Interfaces

### AIGNEHTTPServerOptions

Configuration options for the AIGNEHTTPServer.
These options control various aspects of server behavior including
request parsing, payload limits, and response handling.

#### Properties

| Property                                        | Type     | Description                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="maximumbodysize"></a> `maximumBodySize?` | `string` | Maximum body size for incoming HTTP requests. This controls the upper limit of request payload size when parsing raw HTTP requests. Only used when working with Node.js IncomingMessage objects that don't already have a pre-parsed body property (e.g., when not using Express middleware). **Default** `"4mb"` |

---

### AIGNEHTTPServerInvokeOptions\<U\>

#### Type Parameters

| Type Parameter              | Default type  |
| --------------------------- | ------------- |
| `U` _extends_ `UserContext` | `UserContext` |

#### Properties

| Property                                | Type |
| --------------------------------------- | ---- |
| <a id="usercontext"></a> `userContext?` | `U`  |
