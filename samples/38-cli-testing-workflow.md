# CLI Testing Workflow

Validate your AI agents with built-in testing capabilities using AIGNE CLI.

```bash
# Run tests in current directory
aigne test

# Test agents in specific directory
aigne test --path ./my-agents

# Create a test file alongside your agent
# Example: if you have chat.yaml, create chat.test.js

# Run tests with verbose output
NODE_OPTIONS="--test-reporter=spec" aigne test

# Test specific agent configuration
aigne test --path ./production-agents

# Combine with CI/CD pipeline
#!/bin/bash
export OPENAI_API_KEY=$OPENAI_KEY
aigne test --path ./agents
if [ $? -eq 0 ]; then
  echo "All tests passed!"
  aigne serve-mcp --path ./agents --port 3000
else
  echo "Tests failed!"
  exit 1
fi
```

## Twitter Post #1

🧪 Built-in testing for AI agents with AIGNE CLI!

Quality assurance made simple:
✅ Node.js test runner integration 🎯 Agent-specific test files 🔄 CI/CD pipeline ready 📊 Detailed test reporting

Ship confident AI applications!

#AIGNE #ArcBlock #CLI

## Twitter Post #2

This example shows CLI testing workflow:

• Use aigne test command to run tests
• Create test files alongside agents
• Integration with CI/CD pipelines
• Detailed test reporting

Quality AI applications! 🧪

## Twitter Post #3

📚 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #CLI
