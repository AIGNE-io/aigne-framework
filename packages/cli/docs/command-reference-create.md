---
labels: ["Reference"]
---

# aigne create

The `aigne create` command scaffolds a new AIGNE project from a template. It sets up the necessary directory structure and configuration files, allowing you to start developing your agent immediately.

## Usage

To create a project in a new directory, provide a path as an argument:

```bash
# Create a project in the 'my-aigne-project' directory
aigne create my-aigne-project
```

If you run the command without a path argument, it will prompt you for a project name and create the project in a new subdirectory within the current location.

```bash
# Create a project in the current working directory (interactive)
aigne create
```

## Interactive Process

When you run `aigne create` without a path, or if the target directory already contains files, the CLI guides you through an interactive process.

1.  **Project Name**: If you don't specify a path, you'll be prompted for a project name. The default is `my-aigne-project`.

    ![AIGNE CLI prompting for a project name during creation.](../assets/create/create-project-interactive-project-name-prompt.png)

2.  **Overwrite Confirmation**: If the target directory exists and is not empty, the CLI will ask for confirmation before proceeding to avoid accidental data loss.

    ```bash
    ? The directory "/path/to/your/my-aigne-project" is not empty. Do you want to remove its contents? › (y/N)
    ```

3.  **Template Selection**: You will be asked to choose a project template. Currently, a `default` template is provided.

    ```bash
    ? Select a template: › - Use arrow-keys. Return to submit.
    ❯   default
    ```

## Arguments

| Argument | Description                                  |
| :------- | :------------------------------------------- |
| `[path]` | Optional. The path where the project directory will be created. Defaults to the current directory (`.`), prompting for a project name if not provided. |

## Command Flow

The following diagram illustrates the process flow for the `aigne create` command.

```d2
direction: down

"start": "Start: aigne create"
"path_provided": "Is path provided?"
"prompt_name": "Prompt for Project Name"
"set_path": "Set project path"
"check_empty": "Directory not empty?"
"prompt_overwrite": "Prompt to overwrite?"
"cancel": "Cancel Operation"
"select_template": "Select Template"
"create_files": "Create Directory & Copy Files"
"success_msg": "Show Success Message"
"end": "End"

start -> path_provided

path_provided -- "No" --> prompt_name
prompt_name -> set_path
path_provided -- "Yes" --> set_path

set_path -> check_empty
check_empty -- "Yes" --> prompt_overwrite
check_empty -- "No" --> select_template

prompt_overwrite -- "No" --> cancel
prompt_overwrite -- "Yes" --> select_template

select_template -> create_files
create_files -> success_msg

success_msg -> end
cancel -> end
```

## Output

Upon successful creation, the CLI prints a confirmation message and provides the next command to run your agent.

![AIGNE CLI success message after creating a project.](../assets/create/create-project-using-default-template-success-message.png)

After creating your project, you can start the agent by navigating into the new directory and using the `aigne run` command.

For more details on running an agent, see the [aigne run](./command-reference-run.md) command reference.