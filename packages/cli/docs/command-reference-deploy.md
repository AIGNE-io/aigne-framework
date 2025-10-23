---
labels: ["Reference"]
---

# aigne deploy

The `aigne deploy` command packages and deploys your AIGNE application as a [Blocklet](https://www.blocklet.dev/) to a specified Blocklet Server endpoint. This is the standard way to publish your agent for production use, making it accessible as a self-contained, executable service.

## Usage

```bash Basic Usage icon=mdi:console
aigne deploy --path <path-to-project> --endpoint <deploy-endpoint>
```

## Options

<x-field data-name="--path" data-type="string" data-required="true" data-desc="Specifies the path to the AIGNE project directory that contains the aigne.yaml file."></x-field>

<x-field data-name="--endpoint" data-type="string" data-required="true" data-desc="The URL of the Blocklet Server endpoint where the application will be deployed."></x-field>

## Deployment Process

The `deploy` command automates several steps to package your agent correctly and deploy it to the target environment. The process is interactive on the first run for a given project and non-interactive for subsequent updates.

```d2 Deployment Workflow
direction: down

Developer: { 
  shape: c4-person 
}

CLI: {
  label: "`aigne deploy`"
  
  task-1: { label: "1. Prepare Environment" }
  task-2: { label: "2. Check Blocklet CLI" }
  task-3: { label: "3. Configure Blocklet\n(Name & DID)" }
  task-4: { label: "4. Bundle Project" }
  task-5: { label: "5. Deploy to Server" }

  task-1 -> task-2 -> task-3 -> task-4 -> task-5
}

Blocklet-Server: {
  label: "Blocklet Server"
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

Deployed-Blocklet: {
  label: "Deployed Agent\n(as Blocklet)"
}

Developer -> CLI: "Run command with path & endpoint"
CLI.task-5 -> Blocklet-Server: "Upload bundle"
Blocklet-Server -> Deployed-Blocklet: "Host agent"
```

Here is a step-by-step breakdown of what happens when you run the command:

1.  **Environment Preparation**: A temporary `.deploy` directory is created in your project root. The command copies your agent's source files and a standard Blocklet template into this directory to prepare for packaging.

2.  **Dependency Installation**: If a `package.json` file is present, it runs `npm install` within the temporary directory to fetch all necessary dependencies.

3.  **Blocklet CLI Check**: The command verifies that the `@blocklet/cli` is installed globally. If it's missing, you will be prompted to install it automatically, as it is required for packaging and deploying Blocklets.

4.  **Configuration (First-Time Deploy)**: On the first deployment of a project, the CLI will guide you through a brief interactive setup:
    *   **Blocklet Name**: You will be asked to provide a name for your Blocklet. It suggests a default based on the `name` field in your `aigne.yaml` or the project's directory name.
    *   **DID Generation**: A new Decentralized Identifier (DID) is automatically generated for your Blocklet using `blocklet create --did-only`, giving it a unique, verifiable identity.
    *   This configuration (name and DID) is saved locally in `~/.aigne/deployed.yaml`. For subsequent deployments of the same project, these saved values are used automatically, making the process non-interactive.

5.  **Bundling**: The CLI executes `blocklet bundle --create-release` to package all your application files into a single, deployable artifact.

6.  **Deployment**: The final bundle is uploaded to the `--endpoint` you specified using `blocklet deploy`.

7.  **Cleanup**: After a successful deployment, the temporary `.deploy` directory is automatically removed.

## Example

To deploy an AIGNE project located in the current directory to your Blocklet Server:

```bash Deploying a project icon=mdi:console
aigne deploy --path . --endpoint https://my-node.abtnode.com
```

If this is the first time you are deploying this project, you will see a prompt to name your agent Blocklet:

```text First-time deployment prompt
✔ Prepare deploy environment
✔ Check Blocklet CLI
ℹ Configure Blocklet
? Please input agent blocklet name: › my-awesome-agent
✔ Bundle Blocklet
...
✅ Deploy completed: /path/to/your/project -> https://my-node.abtnode.com
```

For a more detailed walkthrough on setting up a deployment target and managing your deployed agents, refer to the [Deploying Agents](./guides-deploying-agents.md) guide.