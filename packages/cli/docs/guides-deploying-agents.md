---
labels: ["Reference"]
---

# Deploying Agents

You can package and deploy your AIGNE project as a Blocklet, a self-contained application format that runs on a Blocklet Server. This guide walks you through using the `aigne deploy` command to prepare, configure, and publish your agent for production use.

For a detailed breakdown of all available options for the deploy command, see the [`aigne deploy` command reference](./command-reference-deploy.md).

## Prerequisites

Before you begin, ensure you have the following:

- An existing AIGNE project containing an `aigne.yaml` file.
- The URL of a target Blocklet Server endpoint where you have deployment permissions.
- The Blocklet CLI (`@blocklet/cli`). If you do not have it installed, the deployment process will offer to install it for you.

## The Deployment Command

The primary tool for deployment is the `aigne deploy` command. Its basic syntax requires specifying the project path and the target endpoint.

```bash
aigne deploy --path <project-path> --endpoint <deployment-endpoint>
```

**Parameters**

| Parameter  | Description                                                 |
|------------|-------------------------------------------------------------|
| `--path`   | Required. The local path to your AIGNE project directory.     |
| `--endpoint` | Required. The URL of the Blocklet Server to deploy to.      |

## Deployment Workflow

When you run `aigne deploy`, the CLI performs a series of automated steps to package and publish your agent. The process is interactive on the first run for a new project and non-interactive for subsequent updates. The diagram below illustrates the high-level workflow.

```d2
direction: down

start: {
  label: "Start: aigne deploy"
  shape: oval
}

prep-env: {
  label: "1. Prepare Environment"
  shape: package
  grid-columns: 1
  copy-files: "Copy project files to .deploy"
  npm-install: "Run npm install in .deploy"
}

check-cli: {
  label: "2. Check Blocklet CLI"
  shape: diamond
}

prompt-install: {
  label: "Prompt to install\n@blocklet/cli"
  shape: parallelogram
}

install-cli: {
  label: "npm install -g @blocklet/cli"
}

configure-blocklet: {
  label: "3. Configure Blocklet"
  shape: package
  grid-columns: 1

  check-config: {
    label: "Config exists in\n~/.aigne/deployed.yaml?"
    shape: diamond
  }

  interactive-setup: {
    label: "First-Time Setup"
    grid-columns: 1
    prompt-name: "Prompt for Blocklet Name"
    create-did: "Create new DID"
    save-config: "Save Name & DID to config"
  }

  update-yml: {
    label: "Update blocklet.yml\nwith Name & DID"
  }

  check-config -> interactive-setup: "No"
  check-config -> update-yml: "Yes"
  interactive-setup -> update-yml
}

bundle: {
  label: "4. Bundle Blocklet\n(blocklet bundle)"
}

deploy: {
  label: "5. Deploy to Endpoint\n(blocklet deploy)"
}

cleanup: {
  label: "6. Clean Up\n(.deploy directory)"
}

success: {
  label: "✅ Deployment Succeeded"
  shape: oval
  style.fill: "#D4EDDA"
}

failure: {
  label: "❌ Deployment Failed"
  shape: oval
  style.fill: "#F8D7DA"
}

start -> prep-env
prep-env -> check-cli

check-cli -> configure-blocklet: "Found"
check-cli -> prompt-install: "Not Found"

prompt-install -> install-cli: "User Agrees"
prompt-install -> failure: "User Declines"
install-cli -> configure-blocklet

configure-blocklet -> bundle -> deploy -> cleanup -> success

# Failure paths from any step
prep-env -> failure: "Error"
configure-blocklet -> failure: "Error"
bundle -> failure: "Error"
deploy -> failure: "Error"
```

### Step-by-Step Guide

1.  **Initiate Deployment**

    From your project's root directory, execute the `deploy` command. For a project in the current directory, you can use `.` for the path.

    ```bash
    aigne deploy --path . --endpoint https://my-blocklet-server.com
    ```

2.  **First-Time Configuration (Interactive)**

    If this is the first time you are deploying this specific project from your machine, the CLI will guide you through a one-time setup:

    -   **Blocklet CLI Installation**: If `@blocklet/cli` is not found in your environment, you will be prompted to install it globally.
    -   **Blocklet Name**: You will be asked to provide a name for your agent Blocklet. This name will be used on the Blocklet Server. A default name based on your project folder or `aigne.yaml` configuration is suggested, which you can accept or override.

3.  **Bundling and Publishing**

    The CLI will then proceed with the automated tasks shown in the workflow diagram: preparing files, bundling the application, and uploading it to the specified endpoint. You will see progress indicators for each major step in your terminal.

4.  **Subsequent Deployments**

    After the first successful deployment, the CLI saves your chosen Blocklet name and its unique DID (Decentralized Identifier) to a configuration file located at `~/.aigne/deployed.yaml`. For all future deployments of the same project (identified by its absolute path), the CLI will use this saved information, making the process non-interactive and suitable for CI/CD pipelines.

Upon completion, a success message will confirm that the deployment is finished.

```bash
✅ Deploy completed: /path/to/your/project -> https://my-blocklet-server.com
```

If the process fails, an error message will indicate the cause of the failure to help diagnose the issue.