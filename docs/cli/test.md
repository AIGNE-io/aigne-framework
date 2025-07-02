# Testing

**English** | [中文](test.zh.md)

Use AIGNE CLI to run agent tests.

## `aigne test` Command

Run tests in the specified agent directory.

```bash
aigne test [options]
```

### Options

* `--path <path>`: Path to the agent directory (defaults to current directory `.`)
* `--help`: Show command help

### Examples

#### Run tests in current directory

```bash
aigne test
```

#### Run tests in specific directory

```bash
aigne test --path ./my-agents
```

### Test File Structure

The AIGNE testing system automatically finds and runs test files in your project. Make sure your test files follow the correct naming conventions and structure.

### Best Practices

1. **Organize test files**: Place test files in appropriate directory structures
2. **Write clear test cases**: Ensure each test case has a clear purpose and expected outcome
3. **Use descriptive test names**: Make test names clearly express what the test covers
4. **Run tests regularly**: Run tests regularly during development to ensure code quality
