# Creating a Project

An AIGNE project is a folder that holds all the necessary files for your AI agent. This includes its configuration, personality, and any special skills it might have. The simplest way to get started is by using the `aigne create` command, which sets up a ready-to-use project structure for you.

## The `create` Command

This command initializes a new directory with all the basic files your agent needs to run. You can run it in two ways.

1.  **Interactive Mode**: Simply run the command without any arguments, and it will guide you through the process.
2.  **Direct Mode**: Specify a folder name directly after the command.

Let's walk through the interactive mode, which is perfect for beginners.

### Step-by-Step Guide

1.  **Run the Create Command**

    Open your terminal or command prompt and type the following command, then press Enter.

    ```bash
    aigne create
    ```

2.  **Enter a Project Name**

    The CLI will prompt you to name your project. This will also be the name of the folder it creates. Let's call it `my-first-agent`.

    ```text
    ? Project name: my-first-agent
    ```

3.  **Select a Template**

    Next, you'll be asked to select a template. For now, the `default` template is all you need. Simply press Enter to continue.

    ```text
    ? Select a template: (Use arrow keys)
    ❯ default
    ```

After these steps, the CLI will create the project folder and files. You should see a success message confirming that everything is set up.

```text
✅ AIGNE project created successfully!

To use your new agent, run:
  cd my-first-agent && aigne run
```

### What's Inside the Project?

The `create` command generates a few key files inside your new project folder. Here's a quick look at what they do:

| File             | Description                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `aigne.yaml`     | The main configuration file. It tells AIGNE which AI model to use and lists all the agents and skills in the project. |
| `chat.yaml`      | Defines the personality of your agent. This is where you write its instructions and define its core behavior.       |
| `sandbox.js`     | An example of a "skill." Skills are tools the agent can use. This one allows it to evaluate JavaScript code.      |
| `filesystem.yaml`| A skill that gives the agent the ability to interact with files on your computer.                                  |


With your project created, you're now ready to bring your agent to life.

### Next Steps

Now that you have a project, the next step is to start a conversation with your agent. 

- [Running an Agent](./cli-getting-started-running-an-agent.md)
