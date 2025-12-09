# Bash

The `BashAgent` enables the execution of shell commands and scripts within an AIGNE workflow. This guide details its configuration and usage, allowing for direct interaction with the underlying operating system for tasks such as file manipulation, process management, and automating command-line tools.

## Overview

The `BashAgent` acts as a bridge between the AIGNE framework and a standard Bash shell. It is designed to run shell scripts, capture their standard output (`stdout`), standard error (`stderr`), and exit code, and return this information as a structured output.

For security, the agent executes commands within an isolated sandbox environment by default. This prevents scripts from accessing unauthorized network resources or modifying the file system unexpectedly. The sandbox behavior is configurable, allowing for both secure, isolated execution and unrestricted execution when necessary.

The following diagram illustrates the workflow of the `BashAgent`, from receiving a script to returning the output, including the optional sandboxing layer.

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![Bash](assets/diagram/agent-library-bash-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

## Input

The agent accepts a single `script` property containing the Bash commands to be executed.

<x-field-group>
  <x-field data-name="script" data-type="string" data-required="true" data-desc="The bash script or command to execute."></x-field>
</x-field-group>

## Output

Upon completion, the agent returns an object containing the output streams and the final exit code of the script.

<x-field-group>
  <x-field data-name="stdout" data-type="string" data-required="false" data-desc="The standard output produced by the script."></x-field>
  <x-field data-name="stderr" data-type="string" data-required="false" data-desc="The standard error output produced by the script."></x-field>
  <x-field data-name="exitCode" data-type="number" data-required="false" data-desc="The exit code returned by the script upon completion."></x-field>
</x-field-group>

## Configuration

The `BashAgent` is instantiated with an optional `options` object to control its execution environment.

```typescript agent.ts
import { BashAgent } from "@aigne/agent-library/bash";

// Default behavior: runs in a secure sandbox
const secureAgent = new BashAgent({});

// Disable the sandbox for unrestricted execution
const insecureAgent = new BashAgent({
  sandbox: false,
});

// Configure the sandbox to allow specific network access
const configuredAgent = new BashAgent({
  sandbox: {
    network: {
      allowedDomains: ["api.example.com"],
    },
  },
});
```

### Options

<x-field-group>
  <x-field data-name="sandbox" data-type="boolean | object" data-required="false">
    <x-field-desc markdown>Controls the sandboxed execution environment. If `false`, the sandbox is disabled. If an `object`, it configures the sandbox rules. By default, the sandbox is enabled with restrictive settings.</x-field-desc>
    <x-field data-name="network" data-type="object" data-required="false" data-desc="Configures network access rules.">
      <x-field data-name="allowedDomains" data-type="string[]" data-required="false" data-desc="A list of domains the script is permitted to access."></x-field>
      <x-field data-name="deniedDomains" data-type="string[]" data-required="false" data-desc="A list of domains the script is explicitly forbidden from accessing."></x-field>
    </x-field>
    <x-field data-name="filesystem" data-type="object" data-required="false" data-desc="Configures filesystem access rules.">
      <x-field data-name="allowWrite" data-type="string[]" data-required="false" data-desc="A list of file paths or directories the script is permitted to write to."></x-field>
      <x-field data-name="denyRead" data-type="string[]" data-required="false" data-desc="A list of file paths or directories the script is forbidden from reading."></x-field>
      <x-field data-name="denyWrite" data-type="string[]" data-required="false" data-desc="A list of file paths or directories the script is forbidden from writing to."></x-field>
    </x-field>
  </x-field>
</x-field-group>

:::warning
Disabling the sandbox by setting `sandbox: false` allows the script to execute with the same permissions as the parent Node.js process. This should only be done in trusted environments, as it can introduce security risks.
:::

## Examples

### Basic Script Execution

This example demonstrates executing a simple script that prints to both `stdout` and `stderr` and then exits.

```typescript example.ts
import { BashAgent } from "@aigne/agent-library/bash";

const bashAgent = new BashAgent({});

const script = `
  echo "Hello, World!"
  echo "This is an error message" >&2
  exit 0
`;

const result = await bashAgent.invoke({ script });
console.log(result);
```

The execution will produce the following output, capturing the streams and the successful exit code.

```json
{
  "stdout": "Hello, World!\n",
  "stderr": "This is an error message\n",
  "exitCode": 0
}
```

### Disabling the Sandbox

This example shows how to disable the sandbox to execute a command, such as `curl`, that requires unrestricted network access.

```typescript example-no-sandbox.ts
import { BashAgent } from "@aigne/agent-library/bash";

const bashAgent = new BashAgent({
  sandbox: false,
});

const script = `curl https://bing.com`;
const result = await bashAgent.invoke({ script });

console.log(result.stdout);
console.log(result.exitCode);
```

The output will contain the HTML content from the webpage and an exit code of `0`.

```html
<html><head><title>Object moved</title></head><body>
<h2>Object moved to <a href="https://www.bing.com:443/?toWww=1&amp;redig=D26DC3A15DA244F9AB9D1A420426F9E5">here</a>.</h2>
</body></html>
```

```
0
```

### Configuring Network Access in Sandbox

This example demonstrates how to grant sandboxed scripts access to specific domains. An attempt to access an unauthorized domain will fail.

```typescript example-sandbox-network.ts
import { BashAgent } from "@aigne/agent-library/bash";

const bashAgent = new BashAgent({
  sandbox: {
    network: {
      allowedDomains: ["bing.com"],
    },
  },
});

// This command will succeed because bing.com is an allowed domain.
const resultAuthorized = await bashAgent.invoke({ script: "curl https://bing.com" });
console.log("Authorized request exit code:", resultAuthorized.exitCode); // 0

// This command will fail because google.com is not in the allowed list.
const resultUnauthorized = await bashAgent.invoke({ script: "curl https://google.com" });
console.log("Unauthorized request exit code:", resultUnauthorized.exitCode); // 56
console.error(resultUnauthorized.stderr); // curl: (56) CONNECT tunnel failed, response 403
```

The first command succeeds, returning an exit code of `0`. The second command fails because the sandbox blocks the network request, resulting in a non-zero exit code and an error message from `curl`.
