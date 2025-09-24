# hub

The `hub` command is your gateway to managing connections with AIGNE Hub. It allows you to log in, switch between different Hub instances, view your account status, and more. Connecting to an AIGNE Hub simplifies API key management and gives you access to a wider range of AI models and features.

## Commands

### connect

Establishes a connection to an AIGNE Hub. When you run this command, it will open a new page in your web browser to authenticate your account. After you log in successfully, your credentials will be stored securely on your local machine.

**Usage**

```bash
aigne hub connect [url]
```

**Arguments**

*   `url` (optional): The URL of the AIGNE Hub you want to connect to. If you don't provide a URL, you'll be prompted to choose between the official AIGNE Hub and a custom one.

**Examples**

To connect via an interactive prompt:
```bash
aigne hub connect
```

You'll see a prompt like this:
```
? Choose a hub to connect: › - Use arrow-keys. Return to submit.
❯   Official Hub (https://hub.aigne.io)
    Custom Hub URL
```

To connect directly to a specific Hub instance:
```bash
aigne hub connect https://my-custom-hub.com
```

Upon successful connection, you'll see a confirmation message:
```bash
✓ Hub https://hub.aigne.io connected successfully.
```

### list

Lists all the AIGNE Hubs you have previously connected to on your machine. The currently active hub is marked with `YES`.

**Usage**

```bash
aigne hub list
# Alias
aigne hub ls
```

**Example**

```bash
$ aigne hub list

Connected AIGNE Hubs:

┌─────────────────────────────────────────┬────────┐
│ URL                                     │ ACTIVE │
├─────────────────────────────────────────┼────────┤
│ https://hub.aigne.io                    │ YES    │
├─────────────────────────────────────────┼────────┤
│ https://my-custom-hub.com               │ NO     │
└─────────────────────────────────────────┴────────┘
Use 'aigne hub use' to switch to a different hub.
```

### use

Switches the active connection to a different AIGNE Hub from your list of saved connections. This command will present an interactive list of your connected hubs to choose from.

**Usage**

```bash
aigne hub use
```

**Example**

```bash
$ aigne hub use

? Choose a hub to switch to: › https://my-custom-hub.com
✓ Switched active hub to https://my-custom-hub.com
```

### status

Displays detailed information for a connected hub, including your user profile, credit balance, and connection status. This is useful for checking your available credits and account details.

**Usage**

```bash
aigne hub status
# Alias
aigne hub st
```

**Example**

After selecting a hub from the interactive prompt, you'll see a detailed status report:
```
AIGNE Hub Connection
──────────────────────────────────────────────
Hub:       https://hub.aigne.io
Status:    Connected ✅

User:
  Name:      John Doe
  DID:       z1... (your DID)
  Email:     john.doe@example.com

Credits:
  Total:     100,000
  Used:      20,000
  Available: 80,000

Links:
  Payment:   https://hub.aigne.io/payment
  Credits:   https://hub.aigne.io/profile
```

### remove

Removes a previously saved AIGNE Hub connection from your local configuration. This action does not delete your account on the Hub, it only removes the local credentials.

**Usage**

```bash
aigne hub remove
# Alias
aigne hub rm
```

**Example**

This command will launch an interactive prompt asking you to select which hub connection to remove.

```bash
$ aigne hub remove

? Choose a hub to remove: › https://my-custom-hub.com
✓ Hub https://my-custom-hub.com removed
```