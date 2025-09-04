---
labels: ["Reference"]
---

# aigne hub

The `aigne hub` command provides a suite of tools for managing your connections to AIGNE Hub. This allows you to easily connect to the official AIGNE Hub or self-hosted instances, switch between them, and check your account status and credit balance directly from your terminal.

Your connections are stored locally in the `~/.aigne/aigne-hub-connected.yaml` file.

```d2
direction: down

"Developer Machine": {
  shape: rectangle

  "aigne CLI": {
    shape: rectangle
  }

  "Local Config (~/.aigne/)": {
    shape: document
  }

  "aigne CLI" <-> "Local Config (~/.aigne/)": "Reads/Writes Connections"
}

"AIGNE Hubs": {
  shape: package
  grid-columns: 2

  "Official Hub (hub.aigne.io)": {
    shape: cylinder
  }

  "Self-Hosted Hub": {
    shape: cylinder
  }
}

"Developer Machine"."aigne CLI" -> "AIGNE Hubs"."Official Hub (hub.aigne.io)": {
  label: "Active Connection"
  style.stroke-width: 2
}

"Developer Machine"."aigne CLI" -> "AIGNE Hubs"."Self-Hosted Hub": {
  label: "Inactive Connection"
  style.stroke-dash: 2
}
```

## Subcommands

### `hub list`

Lists all the AIGNE Hubs you have previously connected to and indicates which one is currently active.

**Usage**

```bash
aigne hub list
# Alias
aigne hub ls
```

**Example Output**

```text
Connected AIGNE Hubs:

┌────────────────────────────────────────────────────────────────────┬──────────┐
│ URL                                                                │ ACTIVE   │
├────────────────────────────────────────────────────────────────────┼──────────┤
│ https://hub.aigne.io                                               │ YES      │
├────────────────────────────────────────────────────────────────────┼──────────┤
│ https://my-custom-hub.example.com                                  │ NO       │
└────────────────────────────────────────────────────────────────────┴──────────┘
Use 'aigne hub use' to switch to a different hub.
```

### `hub connect`

Establishes a new connection to an AIGNE Hub instance. This command will open a web browser for authentication and, upon success, save the credentials to your local configuration.

**Usage**

```bash
# Start an interactive prompt to choose a hub
aigne hub connect

# Connect directly to a specific hub URL
aigne hub connect <hub-url>
```

**Interactive Mode**

Running `aigne hub connect` without a URL provides an interactive prompt to select between the official AIGNE Hub or a custom one.

```text
? Choose a hub to connect: › 
❯   Official Hub (https://hub.aigne.io)
    Custom Hub URL
```

**Direct Mode**

To connect to a self-hosted or specific AIGNE Hub instance, provide its URL as an argument.

```bash
aigne hub connect https://my-custom-hub.example.com
```

Upon successful authentication in the browser, a confirmation message will be displayed in the terminal:

```text
✓ Hub https://hub.aigne.io connected successfully.
```

### `hub use`

Switches the active AIGNE Hub to another previously connected instance. The active hub is used by default for operations that require Hub services, such as utilizing Hub-provided models.

**Usage**

```bash
aigne hub use
```

This command will present an interactive list of your saved connections to choose from.

```text
? Choose a hub to switch to: › 
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

Upon selection, you'll receive a confirmation:

```text
✓ Switched active hub to https://my-custom-hub.example.com
```

### `hub status`

Displays the URL of the currently active AIGNE Hub and its connection status.

**Usage**

```bash
aigne hub status
# Alias
aigne hub st
```

**Example Output**

```text
Active hub: https://hub.aigne.io - online
```

### `hub remove`

Removes a saved AIGNE Hub connection from your local configuration file.

**Usage**

```bash
aigne hub remove
# Alias
aigne hub rm
```

This command prompts you to select which of your saved connections you wish to delete.

```text
? Choose a hub to remove: › 
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

After selection, the connection is removed:

```text
✓ Hub https://my-custom-hub.example.com removed
```

### `hub info`

Fetches and displays detailed account information for a selected hub, including user details, credit balance, and relevant links.

**Usage**

```bash
aigne hub info
# Alias
aigne hub i
```

After selecting a hub from the interactive prompt, you will see a detailed status report.

**Example Output**

```text
AIGNE Hub Connection
──────────────────────────────────────────────
Hub:        https://hub.aigne.io
Status:     Connected ✅

User:
  Name:     John Doe
  DID:      z2qA...p9Y
  Email:    john.doe@example.com

Credits:
  Used:     15,000
  Total:    1,000,000

Links:
  Payment:  https://hub.aigne.io/billing
  Profile:  https://hub.aigne.io/profile
```