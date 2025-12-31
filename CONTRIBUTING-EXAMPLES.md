# Contributing Examples to AIGNE Framework

We welcome community contributions of examples to showcase the capabilities of AIGNE Framework! Examples help other developers understand how to implement various AI workflows and integrations.

## Examples Structure Overview

All examples are located in the [examples/](./examples/README.md) directory and fall into these categories:

* **Basic Examples**: Simple demonstrations (e.g., `chat-bot`)
* **MCP Integration Examples**: Model Context Protocol server integrations (e.g., `mcp-github`, `mcp-sqlite`)
* **Memory Examples**: Demonstrations of memory systems (e.g., `memory`, `memory-did-spaces`)
* **Workflow Examples**: Multi-agent workflow patterns (e.g., `workflow-handoff`, `workflow-sequential`)

Each example is listed in the main [`examples/README.md`](./examples/README.md) using relative paths like:

```markdown
- [@aigne/example-your-name: Description](./your-example-name/README.md)
```

## Submission Requirements

### 1. Package Structure

Your example package must follow this standard structure:

```
examples/your-example-name/
├── README.md              # Required: Comprehensive documentation
├── package.json           # Required: Package configuration
├── CHANGELOG.md           # Required: Version history
├── index.ts              # Required: Main entry point (for TypeScript examples)
├── index.test.ts         # Required: Test file
├── tsconfig.json         # Required for TypeScript examples
├── .env.local.example    # Optional: Environment variable template
```

### 2. README.md Requirements

Your README must include comprehensive documentation following the standard format used by existing examples. See any example in the [`examples/`](./examples/) directory for the expected structure and style.

### 3. Implementation Requirements

#### TypeScript Support

* Use TypeScript for all examples
* Include proper type definitions
* Include `tsconfig.json` configuration

#### CLI Support

* Implement command-line argument parsing
* Support `--interactive` flag for interactive mode
* Support `--model` for different AI providers
* Support pipeline input (stdin)

#### Testing

* Include comprehensive tests in `*.test.ts` files
* Use `@aigne/test-utils` for testing utilities
* Tests should be runnable with `bun test`

#### Error Handling

* Implement proper error handling
* Provide helpful error messages
* Validate environment variables and configuration

### 4. Documentation Standards

#### Code Comments

* Add meaningful comments to complex logic
* Document function parameters and return types
* Include JSDoc comments for public APIs

#### Environment Variables

* Provide `.env.local.example` with all required variables
* Document each environment variable in README
* Support multiple AI model providers

#### Examples and Usage

* Include practical usage examples
* Show different configuration options
* Demonstrate error scenarios and handling

## Common Issues to Avoid

Based on review of community contributions, avoid these common problems:

### Package Structure Issues

* ❌ Missing required files (README.md, package.json, CHANGELOG.md)
* ❌ Incorrect naming conventions
* ❌ Missing or incomplete TypeScript configuration

### Documentation Issues

* ❌ Insufficient or unclear README documentation
* ❌ Missing prerequisites section
* ❌ No quick start instructions
* ❌ Missing environment variable documentation

### Code Issues

* ❌ Hardcoded API keys or sensitive data
* ❌ Missing error handling
* ❌ No CLI argument support
* ❌ Inconsistent code style

### Testing Issues

* ❌ Missing test files
* ❌ Tests that don't run properly
* ❌ No integration with framework test utilities

### 5. Adding Your Example to the Index

After creating your example, you must add it to the main examples index:

1. **Update [`examples/README.md`](./examples/README.md)**:
   Add your example to the "Example List" section using relative path:
   ```markdown
   - [@aigne/example-your-name: Brief description](./your-example-name/README.md)
   ```

2. **Maintain Alphabetical Order**: Insert your example in the appropriate category, maintaining alphabetical order within each section.

## Review Process

1. **Automated Checks**: Your PR will be automatically checked for:
   * Package structure compliance
   * Code style and linting
   * Test execution
   * Build success

2. **Manual Review**: Maintainers will review:
   * Code quality and best practices
   * Documentation completeness
   * Example usefulness and clarity
   * Integration with existing examples
   * Proper addition to examples index

3. **Testing**: Examples will be tested to ensure:
   * They run successfully
   * Documentation is accurate
   * All features work as described

## Getting Help

* Check existing examples for patterns and best practices
* Open an issue for questions before starting large contributions
* Join the [AIGNE Community](https://community.arcblock.io/discussions/boards/aigne) for discussions
* Reference the main [Contributing Guidelines](./CONTRIBUTING.md) for general contribution rules

## Example Checklist

Before submitting your example, verify:

* \[ ] Package follows standard structure
* \[ ] README includes all required sections with proper logo format
* \[ ] Code includes proper error handling
* \[ ] Tests are included and pass
* \[ ] Environment variables are documented
* \[ ] CLI arguments are supported
* \[ ] Example is well-documented with comments
* \[ ] CHANGELOG.md is included
* \[ ] No sensitive data is committed
* \[ ] Example added to main [`examples/README.md`](./examples/README.md) index with relative path
* \[ ] Entry maintains alphabetical order within appropriate category

Following these guidelines ensures your example will be valuable to the community and can be reviewed efficiently by maintainers.
