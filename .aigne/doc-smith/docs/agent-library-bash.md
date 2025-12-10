# Bash

The Bash agent provides a secure and controlled method for executing shell scripts and command-line tools within an agentic workflow. This document details its functionality, configuration, and best practices for system-level operations. By following this guide, you will learn how to integrate and utilize the Bash agent for tasks like file manipulation, process management, and automation.

## Overview

The Bash agent is designed to run bash scripts in a controlled environment, leveraging [Anthropic's Sandbox Runtime](https://github.com/anthropic-experimental/sandbox-runtime) for enhanced security. It captures and streams standard output (`stdout`), standard error (`stderr`), and the final exit code, providing comprehensive feedback on the script's execution.

The following diagram illustrates how the Bash agent executes a script within the secure sandbox, controlling filesystem and network access while streaming output back to the user.

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Bash](assets/diagram/agent-library-bash-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

Key features include:
- **Sandboxed Execution**: Scripts are executed in an isolated environment with configurable security policies.
- **Network Control**: Whitelist or blacklist domains to manage network access.
- **Filesystem Control**: Define specific read and write permissions for files and directories.
- **Real-time Output**: Stream `stdout` and `stderr` as the script runs.
- **Exit Code Tracking**: Capture the script's exit code to verify success or handle errors.

## Input

The agent accepts a single required parameter in its input object.

<x-field-group>
  <x-field data-name="script" data-type="string" data-required="true" data-desc="The bash script to be executed."></x-field>
</x-field-group>

## Output

The agent returns an object containing the results of the script execution.

<x-field-group>
  <x-field data-name="stdout" data-type="string" data-required="false" data-desc="The standard output stream produced by the script."></x-field>
  <x-field data-name="stderr" data-type="string" data-required="false" data-desc="The standard error stream produced by the script."></x-field>
  <x-field data-name="exitCode" data-type="number" data-required="false" data-desc="The exit code returned after the script completes. A value of 0 typically indicates success."></x-field>
</x-field-group>

## Basic Usage

The most direct way to use the Bash agent is through a YAML configuration file. This allows for a declarative approach to defining the agent's behavior and security constraints.

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
# The sandbox is enabled by default with restrictive settings.
# See the Sandbox Configuration section for detailed options.
```

To execute this agent, you can use the AIGNE CLI, passing the script as an argument.

```bash icon=lucide:terminal
aigne run . Bash --script 'echo "Hello from the Bash Agent!"'
```

## Configuration

The Bash agent can be configured using several options to tailor its behavior, particularly concerning the execution environment.

### Agent Options

These options are specified at the top level of the agent's YAML definition.

<x-field-group>
  <x-field data-name="sandbox" data-type="object | boolean" data-required="false" data-default="true">
    <x-field-desc markdown>Controls the sandboxed execution environment. Set to `false` to disable the sandbox entirely, or provide a configuration object to customize its restrictions. By default, the sandbox is enabled.</x-field-desc>
  </x-field>
</x-field-group>

### Disabling the Sandbox

For trusted environments or on platforms where the sandbox is not supported (such as Windows), you can disable it.

:::warning
Disabling the sandbox removes all security protections provided by the agent. This should only be done in a fully trusted environment where the executed scripts are known to be safe.
:::

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox: false # Disables the sandbox
```

## Sandbox Configuration

When the `sandbox` option is enabled, you can provide a configuration object to define granular security policies for network and filesystem access.

### Network Configuration

Control the agent's network access by specifying allowed and denied domains.

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox:
  network:
    # A list of domains the script is allowed to contact. Wildcards (*) are supported.
    allowedDomains:
      - "*.example.com"
      - "api.github.com"
    # A list of domains the script is forbidden from contacting. This takes precedence over allowedDomains.
    deniedDomains:
      - "*.ads.com"
```

### Filesystem Configuration

Define which parts of the filesystem the script can read from and write to.

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox:
  filesystem:
    # A list of file paths or patterns that the script is permitted to write to.
    allowWrite:
      - "./output"
      - "/tmp"
    # A list of file paths or patterns that the script is forbidden from reading.
    denyRead:
      - "~/.ssh"
      - "*.key"
    # A list of file paths or patterns that the script is forbidden from writing to.
    denyWrite:
      - "/etc"
      - "/usr"
```

### Complete Example

Here is a comprehensive example demonstrating a complete sandbox configuration for running development tools.

```yaml bash-agent.yaml icon=lucide:file-code
type: "@aigne/agent-library/bash"
name: Bash
sandbox:
  network:
    allowedDomains:
      - "*.npmjs.org"
      - "registry.npmjs.org"
      - "github.com"
      - "api.github.com"
    deniedDomains:
      - "*.ads.com"
  filesystem:
    allowWrite:
      - "./output"
      - "./logs"
      - "/tmp"
    denyRead:
      - "~/.ssh"
      - "~/.aws"
      - "*.pem"
      - "*.key"
    denyWrite:
      - "/etc"
      - "/usr"
      - "/bin"
      - "/sbin"
```

## Platform Support

The Bash agent's capabilities vary depending on the operating system, primarily concerning sandbox availability.

| Platform | Sandbox Support | Direct Execution |
| :--- | :--- | :--- |
| **Linux** | ✅ Full support | ✅ Supported |
| **macOS** | ✅ Full support | ✅ Supported |
| **Windows** | ❌ Not supported | ✅ Supported |

:::info
On Windows, sandbox mode is not supported. You must set `sandbox: false` in your configuration to use the Bash agent. Direct execution on Windows may require an environment like Windows Subsystem for Linux (WSL) or Git Bash to be installed.
:::

## Best Practices

To ensure secure and effective use of the Bash agent, adhere to the following practices.

- **Apply the Principle of Least Privilege**: Grant only the minimum permissions required for a script to function. Avoid overly permissive rules like allowing writes to `/` or network access to `*`.
- **Handle Exit Codes**: Always check the `exitCode` in the agent's output. A non-zero value indicates an error, and the `stderr` stream should be inspected for details.
- **Protect Sensitive Files**: Explicitly deny read access to directories and files containing sensitive information, such as `~/.ssh`, `.env` files, or private keys.
- **Use Specific Wildcards**: When using wildcards for network or filesystem rules, make them as specific as possible (e.g., `api.example.com` instead of `*.com`).
- **Log and Audit**: For security-critical applications, log all script executions, including the input script and the resulting output, to maintain an audit trail.
