# Create Project

Use AIGNE CLI to create new AIGNE projects.

## `aigne create` Command

Creates a new AIGNE project with the required configuration files. This command will interactively prompt for the project name.

```bash
aigne create [path]
```

### Parameters

* `path`: Optional project directory path (will be used as the default project name in the prompt)

### Examples

#### Create project with interactive prompt

```bash
aigne create
# Will prompt you to enter a project name
```

#### Create project with suggested name

```bash
aigne create my-new-agent
# Will prompt with "my-new-agent" as the default project name
```

### Project Structure

The created project will include the following basic structure and configuration files to help you quickly start developing AIGNE agents.
