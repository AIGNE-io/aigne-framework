# test

The `aigne test` command is a crucial tool for ensuring your AI agent works as expected. It automatically runs checks on your agent's skills and configurations, helping you catch potential issues early and maintain a high-quality experience.

Running tests before deploying your agent or sharing it with others is a great way to confirm that everything is set up correctly and functions as intended.

## Usage

To run tests, you can execute the command from within your project directory or specify a path to it.

```bash Basic Syntax
aigne test [path]
```

### Arguments

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="false" data-desc="Optional. The path to your agent's project directory. If you don't provide a path, the command will run tests in the current directory."></x-field>
</x-field-group>

## Examples

### Test an Agent in the Current Directory

If your terminal's current location is inside your agent's project folder, you can run the command without any additional arguments.

```bash Run test from project folder icon=mdi:folder-open
aigne test
```

### Test an Agent in a Specific Directory

If you want to test an agent that is located in a different folder, simply provide the path to that folder.

```bash Run test with a specific path icon=mdi:folder-search
aigne test path/to/your-agent
```

When you run the command, AIGNE will look for test files within your project and execute them. The results will be displayed in your terminal, showing which tests passed and which failed, providing valuable feedback for improving your agent.