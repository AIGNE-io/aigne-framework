---
labels: ["Reference"]
---

# aigne test

The `aigne test` command executes automated tests for your agents and skills, providing a built-in mechanism for unit and integration testing. This ensures that your agents and the tools they rely on function correctly before deployment.

## Usage

```bash Basic Syntax
aigne test [path]
```

## Arguments

| Argument      | Description                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------|
| `[path]`      | Optional. The path to the directory containing your agents and their corresponding test files. If omitted, the command searches for tests in the current directory. |

## Description

The command automatically discovers and runs test files within your project. For example, the default AIGNE project template includes a `sandbox.test.js` file designed to verify the functionality of the `sandbox.js` skill. `aigne test` will execute such files to validate your agent's capabilities.

## Examples

### Run tests in the current directory

To execute test cases for the AIGNE project located in your current working directory, run the command without any arguments:

```bash icon=lucide:terminal
aigne test
```

### Run tests in a specific directory

If your agents are located in a different directory, you can specify the path to that directory:

```bash icon=lucide:terminal
aigne test path/to/agents
```

---

## Next Steps

After ensuring your agents pass all tests, you can proceed to deploy them or integrate them into larger systems.

<x-cards>
  <x-card data-title="aigne serve-mcp" data-icon="lucide:server" data-href="/command-reference/serve-mcp">
    Learn how to serve your agents as an MCP server for external integrations.
  </x-card>
  <x-card data-title="aigne deploy" data-icon="lucide:rocket" data-href="/command-reference/deploy">
    Learn how to deploy your AIGNE application as a Blocklet.
  </x-card>
</x-cards>