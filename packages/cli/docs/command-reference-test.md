# aigne test

The `aigne test` command executes automated tests for the agents and skills within your AIGNE project. The CLI automatically discovers and runs test files (e.g., `sandbox.test.js`) in the specified agents directory, allowing you to verify the functionality of your code.

This process is essential for ensuring your agents and their underlying skills behave as expected before deployment.

## Usage

```bash
aigne test [path]
```

## Arguments

| Argument | Description                                                                                    |
|----------|------------------------------------------------------------------------------------------------|
| `path`   | Optional. Specifies the path to the agents directory. If omitted, it defaults to the current directory. |

## Examples

### Test agents in the current directory

If you are in the root directory of your AIGNE project, you can run the tests without any additional arguments.

```bash
# Test the agents in the current directory
aigne test
```

### Test agents in a specific directory

If you want to run tests for a project located in a different directory, provide the path to that directory.

```bash
# Test the agents at the specified path
aigne test path/to/agents
```

After running the command, the CLI will output the test results to your console.