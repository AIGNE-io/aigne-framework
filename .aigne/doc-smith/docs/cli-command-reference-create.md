# create

The `aigne create` command is your starting point for building a new AI agent. It automatically generates a complete project structure for you, including all the necessary configuration files and folders, so you can begin developing your agent's skills right away.

## Usage

To create a new project, run the `create` command from your terminal. You can either specify a folder name directly or run the command without any arguments to be guided through an interactive setup.

```bash Basic Usage icon=material-symbols:terminal
aigne create [path]
```

## Arguments

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="false" data-desc="The name of the folder where the project will be created. If you omit this, the CLI will ask you for a project name."></x-field>
</x-field-group>

## Interactive Setup

When you run the command, it will guide you through a few simple questions to set up your project:

1.  **Project Name**: If you don't provide a path, it will first ask for your project's name. This will also be the name of the folder it creates.
2.  **Template Selection**: You'll be asked to choose a project template. For most cases, the `default` template is the perfect starting point.
3.  **Directory Not Empty**: If the target folder already exists and contains files, the command will ask for your confirmation before proceeding to avoid accidentally overwriting your work.

## Examples

### Create a Project in a New Folder

This is the most common way to start. This command will create a new folder named `my-first-agent` and set up the project inside it.

```bash icon=material-symbols:terminal
aigne create my-first-agent
```

After running the command, you will see a success message:

```text Output
✅ AIGNE project created successfully!

To use your new agent, run:
  cd my-first-agent && aigne run
```

### Create a Project in the Current Folder

If you are already inside the folder where you want to create the project, you can run the command without any arguments.

```bash icon=material-symbols:terminal
aigne create
```

The CLI will then prompt you for the project name interactively.

```text Interactive Prompt
? Project name: (my-aigne-project)
```

## Next Steps

Once your project is created, the next step is to start a conversation with your agent. Navigate into your new project directory and use the [run command](./cli-command-reference-run.md) to bring it to life.