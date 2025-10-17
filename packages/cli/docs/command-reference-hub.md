---
labels: ["Reference"]
---

# aigne hub

The `aigne hub` command is your central tool for managing connections to the AIGNE Hub. The Hub provides access to managed large language models, handles API key management, and tracks your credit usage. Properly configuring your Hub connection is essential for running agents that utilize Hub-provided models.

This command set allows you to connect to new Hubs (both the official Arcblock Hub and self-hosted instances), list your existing connections, switch between them, and monitor your account status.

## Usage

```bash Basic Command Structure
aigne hub <subcommand>
```

## Commands

The `aigne hub` command includes several subcommands to manage different aspects of your Hub connections.

| Command | Alias | Description |
|---|---|---|
| `connect [url]` | | Connect to a new AIGNE Hub. |
| `list` | `ls` | List all configured AIGNE Hub connections. |
| `use` | | Switch the active AIGNE Hub. |
| `status` | `st` | Display the currently active AIGNE Hub. |
| `remove` | `rm` | Remove a configured AIGNE Hub connection. |
| `info` | `i` | Show detailed information for a specific Hub connection. |

---

### `connect [url]`

Connects your local CLI to an AIGNE Hub instance. This process authenticates your machine and stores an API key for future requests in the `~/.aigne/aigne-hub-connected.yaml` file.

**Usage**

```bash Connect to a Hub
aigne hub connect [url]
```

**Behavior**

- **Interactive Mode**: If you run the command without a URL, an interactive prompt will appear, allowing you to choose between the official AIGNE Hub or a custom, self-hosted Hub URL.

  ```bash Interactive Connection icon=mdi:console
  $ aigne hub connect
  ? Choose a hub to connect: › - Use arrow-keys. Return to submit.
  ❯   Official Hub (https://hub.aigne.io)
      Custom Hub URL
  ```

- **Direct Mode**: If you provide a URL, the CLI will attempt to connect to that specific Hub directly.

  ```bash Direct Connection icon=mdi:console
  $ aigne hub connect https://my-hub.example.com
  ```

In both cases, a browser window will open for you to authenticate and authorize the CLI connection. Once completed, the credentials will be saved locally.

### `list`

Displays a table of all AIGNE Hubs you have previously connected to. It also indicates which Hub is currently active.

**Usage**

```bash List Connections
aigne hub list
# or using the alias
aigne hub ls
```

**Example Output**

```bash icon=mdi:table
$ aigne hub ls
Connected AIGNE Hubs:

┌───────────────────────────────────────────────────┬────────┐
│ URL                                               │ ACTIVE │
├───────────────────────────────────────────────────┼────────┤
│ https://hub.aigne.io                              │ YES    │
├───────────────────────────────────────────────────┼────────┤
│ https://my-hub.example.com                        │ NO     │
└───────────────────────────────────────────────────┴────────┘
Use 'aigne hub use' to switch to a different hub.
```

### `use`

Switches the active AIGNE Hub. This command is useful when you have multiple Hub connections (e.g., a personal account and a team account) and need to change which one is used by default for commands like `aigne run`.

**Usage**

```bash Switch Active Hub
aigne hub use
```

**Behavior**

Running this command will present an interactive list of your saved Hub connections. Select the one you wish to make active.

```bash Interactive Switch icon=mdi:console
$ aigne hub use
? Choose a hub to switch to: › - Use arrow-keys. Return to submit.
    https://hub.aigne.io
❯   https://my-hub.example.com

✓ Switched active hub to https://my-hub.example.com
```

### `status`

Quickly shows the URL of the currently active AIGNE Hub and its connection status.

**Usage**

```bash Check Status
aigne hub status
# or using the alias
aigne hub st
```

**Example Output**

```bash icon=mdi:console
$ aigne hub status
Active hub: https://hub.aigne.io - online
```

### `remove`

Removes a saved AIGNE Hub connection from your local configuration file.

**Usage**

```bash Remove a Hub
aigne hub remove
# or using the alias
aigne hub rm
```

**Behavior**

This command will interactively prompt you to select which of your saved Hub connections you want to remove.

```bash Interactive Removal icon=mdi:console
$ aigne hub remove
? Choose a hub to remove: › https://my-hub.example.com

✓ Hub https://my-hub.example.com removed
```

### `info`

Fetches and displays detailed account information for a selected Hub connection. This includes user details, credit balance, and important links.

**Usage**

```bash Get Hub Info
aigne hub info
# or using the alias
aigne hub i
```

**Behavior**

First, you will be prompted to select a configured Hub. Then, the CLI will display its connection status and your account details.

**Example Output**

```bash icon=mdi:information-outline
$ aigne hub info

AIGNE Hub Connection
──────────────────────────────────────────────
Hub:       https://hub.aigne.io
Status:    Connected ✅

User:
  Name:    John Doe
  DID:     z2qa...w9vM
  Email:   john.doe@example.com

Credits:
  Used:    1,234
  Total:   100,000

Links:
  Payment: https://hub.aigne.io/payment/...
  Profile: https://hub.aigne.io/profile/...
```