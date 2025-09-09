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

| Option | Description | Required |
| --- | --- | --- |
| `--path <string>` | Specifies the path to the AIGNE project directory that contains the `aigne.yaml` file. | Yes |
| `--endpoint <string>` | The URL of the Blocklet Server endpoint where the application will be deployed. | Yes |

## Deployment Process

The `deploy` command automates several steps to ensure your agent is packaged correctly and deployed to the target environment. The process is designed to be interactive on the first run and non-interactive for subsequent updates.

```d2 Deployment Workflow
direction: down

Developer: { 
  shape: c4-person 
}

AIGNE-Project: {
  label: "Local AIGNE Project"
  shape: rectangle
}

CLI: {
  label: "`aigne deploy`"
}

Blocklet-Server: {
  label: "Blocklet Server"
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

Deployed-Blocklet: {
  label: "Deployed Agent\n(as Blocklet)"
}

Developer -> CLI: "1. Run command with path & endpoint"
CLI -> AIGNE-Project: "2. Prepare & package"
CLI -> Blocklet-Server: "3. Deploy bundle"
Blocklet-Server -> Deployed-Blocklet: "4. Host agent"
```

Here is a step-by-step breakdown of what happens when you run the command:

1.  **Environment Preparation**: A temporary `.deploy` directory is created in your project root. The command copies your agent's source files and a standard Blocklet template into this directory.

2.  **Dependency Installation**: It runs `npm install` within the temporary directory to fetch all necessary dependencies listed in your project's `package.json`.

3.  **Blocklet CLI Check**: The command verifies that the `@blocklet/cli` is installed globally. If it's missing, you will be prompted to install it automatically, as it is required for packaging and deploying Blocklets.

4.  **Configuration (First-Time Deploy)**: On the first deployment of a project, the CLI will guide you through a brief interactive setup:
    *   **Blocklet Name**: You will be asked to provide a name for your Blocklet. It suggests a default based on the `name` field in your `aigne.yaml` or the project's directory name.
    *   **DID Generation**: A new Decentralized Identifier (DID) is automatically generated for your Blocklet, giving it a unique, verifiable identity.
    *   This configuration (name and DID) is saved locally in `~/.aigne/deployed.yaml`. For subsequent deployments of the same project, these saved values will be used, making the process non-interactive.

5.  **Bundling**: The CLI executes `blocklet bundle --create-release` to package all your application files into a single, deployable artifact.

6.  **Deployment**: The final bundle is uploaded to the `--endpoint` you specified.

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