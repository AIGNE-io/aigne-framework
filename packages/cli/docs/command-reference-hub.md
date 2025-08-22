# aigne hub

The `aigne hub` command provides a suite of tools for managing your connections to AIGNE Hub. This allows you to easily switch between different Hub instances (like the official Arcblock hub and self-hosted ones), check your account status, view credit balances, and more, directly from your terminal.

### `hub list`

Lists all the AIGNE Hubs you have previously connected to.

**Usage**

```bash
aigne hub list
# Alias
aigne hub ls
```

**Example Output**

This command displays a table of all saved connections, indicating which one is currently active.

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

Establishes a connection to an AIGNE Hub instance and saves the credentials locally. This process involves authenticating through your web browser.

**Usage**

```bash
# Interactive mode to choose between official and custom hub
aigne hub connect

# Direct mode with a specific URL
aigne hub connect <hub-url>
```

**Interactive Mode**

Running `aigne hub connect` without a URL will present an interactive prompt:

```text
? Choose a hub to connect: › - Use arrow-keys. Return to submit.
❯   Official Hub (https://hub.aigne.io)
    Custom Hub URL
```

After selection and successful browser authentication, you will see a confirmation message:

```text
✓ Hub https://hub.aigne.io connected successfully.
```

**Direct Mode**

Provide the URL as an argument to connect to a specific, often self-hosted, hub.

```bash
aigne hub connect https://my-custom-hub.example.com
```

### `hub use`

Switches the active AIGNE Hub to one of your previously connected instances. The active hub is used for operations that require Hub services, such as running models provided by the Hub.

**Usage**

```bash
aigne hub use
```

**Example**

This command will prompt you to select from your list of saved connections.

```text
? Choose a hub to switch to: › - Use arrow-keys. Return to submit.
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

Upon selection, the active hub is changed.

```text
✓ Switched active hub to https://my-custom-hub.example.com
```

### `hub status`

Displays the URL of the currently active AIGNE Hub.

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

Deletes a saved AIGNE Hub connection from your local configuration file.

**Usage**

```bash
aigne hub remove
# Alias
aigne hub rm
```

**Example**

You'll be prompted to choose which saved connection to remove.

```text
? Choose a hub to remove: › - Use arrow-keys. Return to submit.
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

After confirming, the connection is deleted.

```text
✓ Hub https://my-custom-hub.example.com removed
```

### `hub info`

Fetches and displays detailed account information for a selected hub, including user details and credit balance.

**Usage**

```bash
aigne hub info
# Alias
aigne hub i
```

**Example Output**

After selecting a hub from the interactive prompt, detailed information is displayed.

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