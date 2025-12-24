# Test Command

Executes tests defined for agents within the project.

## Usage

```bash
aigne test [options]
```

## Options

| Option | Alias | Description | Default |
| :--- | :--- | :--- | :--- |
| `--path` | `--url` | Path to the agents directory or URL to an AIGNE project. | `.` |
| `--aigne-hub-url` | | Custom AIGNE Hub service URL for fetching remote definitions. | |

## Description

The `test` command loads the AIGNE configuration from the specified path and executes the Node.js test runner (`node --test`) in the project's root directory. This allows you to run unit and integration tests defined in your project.

## Examples

Run tests in the current directory:
```bash
aigne test
```

Run tests for a project in a specific path:
```bash
aigne test --path ./my-agent
```

---
**Related:** [Run Command](/commands/run.md)
