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

## Testing Workflow

The `aigne test` command integrates into the development lifecycle to ensure code reliability. The process involves writing code, creating corresponding tests, running the test command, and then iterating based on the results.

```d2
direction: down

Dev-Cycle: {
  shape: package
  label: "Development Cycle"
  grid-columns: 1

  Write-Code: {
    shape: rectangle
    label: "1. Write/Update Code\n(e.g., sandbox.js)"
  }

  Write-Tests: {
    shape: rectangle
    label: "2. Write/Update Tests\n(e.g., sandbox.test.js)"
  }

  Execute-Command: {
    shape: rectangle
    label: "3. Run 'aigne test'"
  }

  Test-Runner: {
    shape: package
    label: "AIGNE Test Runner"
    Test-Discovery: {
      label: "Finds *.test.js files"
      shape: rectangle
    }
    Test-Execution: {
      label: "Executes tests against code"
      shape: rectangle
    }
  }
  
  Output: {
    shape: rectangle
    label: "4. Review Console Output"
  }

  Decision: {
    shape: diamond
    label: "Tests Pass?"
  }

  Success: {
    label: "✅ Pass"
    style: {
      fill: "#d4edda"
    }
  }

  Failure: {
    label: "❌ Fail"
    style: {
      fill: "#f8d7da"
    }
  }

  Write-Code -> Write-Tests: "Alongside development"
  Write-Tests -> Execute-Command: "To validate changes"
  Execute-Command -> Test-Runner: "Initiates"
  Test-Runner.Test-Discovery -> Test-Runner.Test-Execution: "Runs found tests"
  Test-Runner -> Output: "Reports results"
  Output -> Decision
  Decision -> Success: "Yes"
  Decision -> Failure: "No"
  Failure -> Write-Code: "Debug & Refactor"
}
```

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
