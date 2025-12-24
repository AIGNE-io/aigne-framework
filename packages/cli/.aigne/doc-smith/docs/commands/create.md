# Create Command

Creates a new AIGNE project with standard configuration and file structure.

## Usage

```bash
aigne create [path]
```

## Arguments

- `[path]`: (Optional) The directory path where the project should be created. If not provided, the CLI will prompt for the project name and create it in the current directory.

## Interactive Mode

If you run `aigne create` without arguments, it will verify:
1.  **Project Name**: Default is `my-aigne-project`.
2.  **Overwrite**: If the target directory is not empty, it asks for confirmation to clear it.
3.  **Template**: Allows selection of a starting template (currently supports `default`).

## Examples

Create a project in the current directory:
```bash
aigne create
```

Create a project named "chatbot":
```bash
aigne create chatbot
```

---
**Related:** [Getting Started](/getting-started.md)
