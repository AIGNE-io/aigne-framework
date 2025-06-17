# MCPAgent: Interacting with Model Context Protocol Servers in AIGNE Framework

The MCPAgent module within the AIGNE framework is designed to facilitate interaction with Model Context Protocol (MCP) servers. It provides developers with the ability to connect to MCP servers using different transport methods such as HTTP, Server-Sent Events (SSE), and Stdio. The typical usage scenarios include managing connections to remote servers, accessing server-provided tools, prompts, and resources, and ensuring seamless integration of server functionalities within client applications.

## Creating an MCPAgent Using Stdio Transport

The creation of an MCPAgent with Stdio transport involves establishing a connection to an MCP server using inter-process communication. This approach is advantageous for scenarios where a direct process-to-process communication is required, offering a more secure and efficient data exchange without the need to expose services over the network. Developers can use this method to leverage server-provided tools, prompts, and resources directly from a local client setup, ensuring that the interaction remains within a controlled environment.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-create-agent"
spyOn(MCPAgent, "from").mockReturnValueOnce( new MCPAgent({ name: "ccxt", client: mock() as unknown as MCPAgent["client"], skills: [ FunctionAgent.from({ name: "get-ticker", process: () => ({}), }), ], }), ); const ccxt = await MCPAgent.from({ command: "npx", args: ["-y", "@mcpfun/mcp-server-ccxt"], }); console.log(ccxt.skills); const getTicker = ccxt.skills["get-ticker"]; assert(getTicker);
```

## Exploring and Invoking MCPAgent Skills

Once an MCPAgent has been instantiated, its skills, which correspond to various server capabilities, can be explored and utilized. By listing and invoking these skills, developers can interact with a wide range of functions provided by the MCP server, such as retrieving market data, trading operations, and more. This process not only optimizes the integration of server functionalities into the client environment but also streamlines workflow by allowing direct invocation of predefined server skills.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-basic-explore-skills"
console.log(ccxt.skills); const getTicker = ccxt.skills["get-ticker"]; assert(getTicker); const result = await getTicker.invoke({ exchange: "coinbase", symbol: "ABT/USD" }); console.log(result);
```

## Creating an MCPAgent Using Streamable HTTP Transport

Streamable HTTP transport offers a way to connect to an MCP server over HTTP, allowing for continuous data streaming between the client and server. This transport method is particularly useful in scenarios where real-time data exchange is necessary, such as financial markets or any domain requiring up-to-date information. By leveraging this transport, developers can integrate dynamic and responsive communication channels into their applications with minimal configuration.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/mcp-agent.test.ts" region="example-agent-streamable-http-create-agent"
spyOn(MCPAgent, "from").mockReturnValueOnce( new MCPAgent({ name: "ccxt", client: mock() as unknown as MCPAgent["client"], skills: [ FunctionAgent.from({ name: "get-ticker", process: () => ({}), }), ], }), ); const ccxt = await MCPAgent.from({ url: "http://api.example.com/mcp", transport: "streamableHttp", });
```

This document provided a detailed explanation of how to utilize the MCPAgent within the AIGNE framework to interact with MCP servers. By creating agents with various transport options, developers can effectively connect to and leverage the capabilities of MCP servers. Integration can be extended by exploring and invoking skills, ultimately enhancing application functionality. Whether using Stdio for direct communication or Streamable HTTP for real-time data exchanges, the infrastructure supports diverse integration needs while maintaining efficiency and connectivity.