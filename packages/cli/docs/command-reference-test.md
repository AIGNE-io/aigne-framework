---
labels: ["Reference"]
---

# aigne test

The `aigne test` command runs automated tests for the agents and skills within your project. It discovers and executes test files, helping to verify the functionality and correctness of your code.

This command is essential for maintaining code quality and ensuring that your agents behave as expected before deployment.

## Usage

To execute tests, navigate to your project's root directory or specify the path to it.

```bash
# Run tests for the project in the current directory
aigne test

# Run tests for a project at a specific path
aigne test [path]
```

## Arguments

| Argument | Description                                                                 |
|----------|-----------------------------------------------------------------------------|
| `path`   | Optional. The path to the directory containing the agents you want to test. Defaults to the current directory if not specified. |

## How It Works

The test runner automatically discovers test files within the specified directory. By convention, test files should be named with a `.test.js` suffix. For example, the default project template includes a test file `sandbox.test.js` to verify the functionality of the code execution tool defined in `sandbox.js`.

## Examples

### Run Tests in the Current Directory

If you are in the root directory of your AIGNE project, you can run all tests with a single command:

```bash
aigne test
```

### Run Tests in a Specific Directory

If your project is located elsewhere, you can provide the path to its directory:

```bash
aigne test path/to/my-agents
```

This command will navigate to the `path/to/my-agents` directory and execute the tests found there.

---

After verifying your agents with tests, you can proceed to execute them using the [`aigne run`](./command-reference-run.md) command or deploy them as a service with [`aigne serve-mcp`](./command-reference-serve-mcp.md).