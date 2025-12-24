# Deploy Command

Deploys an AIGNE application to a specified endpoint, typically as a [Blocklet](https://github.com/blocklet).

## Usage

```bash
aigne deploy [options]
```

## Options

| Option | Description | Required |
| :--- | :--- | :--- |
| `--path` | Path to the project to deploy. | Yes |
| `--endpoint` | Target endpoint for deployment. | Yes |

## Description

The `deploy` command packages your AIGNE agent into a Blocklet and deploys it to the specified Blocklet Server endpoint. It handles:
1.  Preparing the deploy environment.
2.  Checking and installing Blocklet CLI if needed.
3.  Configuring the Blocklet (name, DID).
4.  Bundling the application.
5.  Deploying to the target endpoint.

## Examples

Deploy a project to a local Blocklet Server:
```bash
aigne deploy --path ./my-agent --endpoint http://localhost:8080
```

---
**Related:** [Create Command](/commands/create.md)
