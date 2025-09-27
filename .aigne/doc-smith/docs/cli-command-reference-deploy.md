# deploy

Use the `deploy` command to package and publish your agent application to a specified endpoint. This command streamlines the process of turning your local AIGNE project into a deployable application, leveraging the Blocklet ecosystem for packaging and distribution.

## Usage

```bash
aigne deploy --path <path_to_agent_project> --endpoint <deployment_url>
```

## Options

<x-field-group>
  <x-field data-name="--path" data-type="string" data-required="true">
    <x-field-desc markdown>The path to your AIGNE agent project directory. This can be an absolute path or a relative path from your current working directory.</x-field-desc>
  </x-field>
  <x-field data-name="--endpoint" data-type="string" data-required="true" data-desc="The URL of the Blocklet Server or similar service where the agent will be deployed."></x-field>
</x-field-group>

## How It Works

The `deploy` command automates several steps to prepare and publish your agent. It essentially wraps your AIGNE agent in a Blocklet, a standardized package format, and uses the `@blocklet/cli` to handle the deployment.

Here is a high-level overview of the deployment flow:

```d2 Deployment Flow icon=mdi:rocket-launch
direction: down

Developer: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Agent-Project: {
  label: "Your Agent Project"
  shape: rectangle
}

Blocklet-CLI: {
  label: "@blocklet/cli"
}

Deployment-Endpoint: {
  label: "Deployment Endpoint"
  shape: cylinder
}

Developer -> AIGNE-CLI: "1. aigne deploy"
AIGNE-CLI -> Agent-Project: "2. Read project files"
AIGNE-CLI -> AIGNE-CLI: "3. Prepare temp .deploy dir"
AIGNE-CLI -> Blocklet-CLI: "4. Configure & create DID"
AIGNE-CLI -> Blocklet-CLI: "5. Bundle agent as Blocklet"
AIGNE-CLI -> Blocklet-CLI: "6. Deploy bundle"
Blocklet-CLI -> Deployment-Endpoint: "7. Push bundle"
Deployment-Endpoint -> Blocklet-CLI: "8. Confirm deployment"
Blocklet-CLI -> AIGNE-CLI: "9. Report success"
AIGNE-CLI -> AIGNE-CLI: "10. Cleanup temp directory"
AIGNE-CLI -> Developer: "11. Show success message"
```

The key stages of the process include:

1.  **Environment Preparation**: A temporary `.deploy` directory is created in your project folder. Your agent's code and necessary Blocklet template files are copied into it.
2.  **Dependency Check**: The command checks if the `@blocklet/cli` is installed globally. If not, it will prompt you for permission to install it, as it's required for bundling and deploying.
3.  **Configuration**: The command reads your `aigne.yaml` to get the agent's name. It then configures a `blocklet.yml` file, creating a unique DID (Decentralized ID) for your application if it's the first deployment. This information is stored locally in your `~/.aigne` directory for future use.
4.  **Bundling**: It invokes `blocklet bundle` to package your application and its dependencies into a single, deployable file.
5.  **Deployment**: Finally, it calls `blocklet deploy` to push the bundled application to the specified `--endpoint`.
6.  **Cleanup**: After a successful deployment, the temporary `.deploy` directory is removed.

## Example

Deploy an agent located in the `my-story-agent` directory to your Blocklet Server instance.

```bash
aigne deploy --path ./my-story-agent --endpoint https://my-server.did.abtnet.io
```

Upon running the command, you will see a series of tasks being executed in your terminal. If this is the first time you are deploying this agent, you may be prompted to provide a name for the Blocklet.

```
✔ Prepare deploy environment
✔ Check Blocklet CLI
✔ Configure Blocklet
✔ Bundle Blocklet

... (output from blocklet deploy) ...

✅ Deploy completed: /path/to/my-story-agent -> https://my-server.did.abtnet.io
```