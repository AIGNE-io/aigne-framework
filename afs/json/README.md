# @aigne/afs-json

AFS module for mounting JSON and YAML files as virtual file systems.

## Features

- Mount JSON and YAML files to AFS virtual filesystem
- Navigate JSON/YAML structure as directories and files
- Support for nested objects and arrays
- Read-only and read-write modes
- Path-based access to JSON/YAML properties
- Automatic format detection based on file extension (.json, .yaml, .yml)
- Unified YAML parser supports both JSON and YAML formats

## Installation

```bash
pnpm add @aigne/afs-json
```

## Usage

### Basic Usage

```typescript
import { AFS } from "@aigne/afs";
import { AFSJSON } from "@aigne/afs-json";

const afs = new AFS();

// Mount a JSON file
afs.mount(
  new AFSJSON({
    name: "config",
    jsonPath: "./config.json",
  })
);

// Or mount a YAML file
afs.mount(
  new AFSJSON({
    name: "app-config",
    jsonPath: "./config.yaml",
  })
);

// Read the entire JSON/YAML
const result = await afs.read("/config/");
console.log(result.data?.content);

// Access nested properties as paths
const result2 = await afs.read("/config/database/host");
console.log(result2.data?.content); // "localhost"
```

### YAML File Support

The module automatically detects file format based on extension and uses the appropriate parser:

```typescript
// Works with .yaml files
const yamlConfig = new AFSJSON({ jsonPath: "./app.yaml" });

// Works with .yml files
const ymlConfig = new AFSJSON({ jsonPath: "./settings.yml" });

// Works with .json files
const jsonConfig = new AFSJSON({ jsonPath: "./data.json" });
```

**YAML Example:**

```yaml
# config.yaml
database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret
features:
  - auth
  - api
  - ui
version: "1.0.0"
```

This YAML structure becomes:
```
/config/                              # Root object
/config/database/                     # Nested object (directory)
/config/database/host                 # String value (file): "localhost"
/config/database/port                 # Number value (file): 5432
/config/database/credentials/         # Nested object (directory)
/config/database/credentials/username # String value (file): "admin"
/config/features/                     # Array (directory)
/config/features/0                    # Array item (file): "auth"
/config/version                       # String value (file): "1.0.0"
```

**Format Detection and Persistence:**
- Format is detected automatically from file extension (.json, .yaml, .yml)
- When writing to a YAML file, changes are saved in YAML format
- When writing to a JSON file, changes are saved in JSON format
- The YAML parser can read both JSON and YAML formats

### JSON File Structure Examples

#### Example 1: Simple nested structure

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "credentials": {
      "username": "admin",
      "password": "secret"
    }
  },
  "features": ["auth", "api", "ui"],
  "version": "1.0.0"
}
```

This structure becomes:
```
/config/                    # Root object
/config/database/           # Nested object (directory)
/config/database/host       # String value (file)
/config/database/port       # Number value (file)
/config/database/credentials/  # Nested object (directory)
/config/features/           # Array (directory)
/config/features/0          # Array item (file)
/config/version             # String value (file)
```

#### Example 2: Array of objects

```json
{
  "users": [
    {
      "name": "Alice",
      "email": "alice@example.com",
      "profile": {
        "age": 30,
        "city": "Beijing"
      }
    },
    {
      "name": "Bob",
      "email": "bob@example.com",
      "profile": {
        "age": 25,
        "city": "Shanghai"
      }
    }
  ]
}
```

This structure becomes:
```
/users/                     # Array (directory)
/users/0/                   # First user object (directory)
/users/0/name               # String value (file): "Alice"
/users/0/email              # String value (file): "alice@example.com"
/users/0/profile/           # Nested object (directory)
/users/0/profile/age        # Number value (file): 30
/users/0/profile/city       # String value (file): "Beijing"
/users/1/                   # Second user object (directory)
/users/1/name               # String value (file): "Bob"
/users/1/email              # String value (file): "bob@example.com"
/users/1/profile/           # Nested object (directory)
/users/1/profile/age        # Number value (file): 25
/users/1/profile/city       # String value (file): "Shanghai"
```

**Working with array objects:**

```typescript
// Read a property from an array object
const { data } = await afs.read('/modules/users/0/name');
console.log(data?.content); // "Alice"

// Update a nested property in an array object
await afs.write('/modules/users/0/profile/age', { content: 31 });

// Add a new property to an array object
await afs.write('/modules/users/0/active', { content: true });

// List all properties of an array object
const result = await afs.list('/modules/users/0');

// Search within array objects
const results = await afs.search('/modules/users', 'Beijing');

// Delete from an array (shifts subsequent indices)
await afs.delete('/modules/users/1', { recursive: true });
// Now users/2 becomes users/1
```

### Options

```typescript
interface AFSJSONOptions {
  name?: string;              // Module name (default: basename of jsonPath without extension)
  jsonPath: string;           // Path to JSON or YAML file
  description?: string;       // Module description
  accessMode?: "readonly" | "readwrite";  // Access mode (default: "readwrite")
  agentSkills?: boolean;      // Enable agent skill scanning
}
```

**Note:** File format is automatically detected from the `jsonPath` extension:
- `.json` files are saved as JSON
- `.yaml` or `.yml` files are saved as YAML

### Read-only Mode

```typescript
afs.mount(
  new AFSJSON({
    name: "readonly-config",
    jsonPath: "./config.json",
    accessMode: "readonly",
  })
);

// Reading is allowed
await afs.read("/readonly-config/version");

// Writing will throw an error
await afs.write("/readonly-config/version", { content: "2.0.0" }); // Error!
```

### Writing to JSON/YAML

```typescript
// Mount a JSON file
afs.mount(
  new AFSJSON({
    name: "settings",
    jsonPath: "./settings.json",
    accessMode: "readwrite",
  })
);

// Or mount a YAML file
afs.mount(
  new AFSJSON({
    name: "config",
    jsonPath: "./config.yaml",
    accessMode: "readwrite",
  })
);

// Update a value
await afs.write("/settings/theme", { content: "dark" });

// Add a new property
await afs.write("/settings/notifications/email", { content: true });

// Changes are persisted to the file in its original format
// - JSON files are saved as JSON with 2-space indentation
// - YAML files are saved as YAML
```

## API

### `list(path: string, options?: AFSListOptions): Promise<AFSListResult>`

List entries at a given path. Objects and arrays are treated as directories.

### `read(path: string, options?: AFSReadOptions): Promise<AFSReadResult>`

Read content at a given path. Returns the JSON/YAML value at that path.

### `write(path: string, entry: AFSWriteEntryPayload, options?: AFSWriteOptions): Promise<AFSWriteResult>`

Write content to a path. Updates are persisted to the file in its original format (JSON or YAML).

### `delete(path: string, options?: AFSDeleteOptions): Promise<AFSDeleteResult>`

Delete a property from the JSON/YAML structure.

### `search(path: string, query: string, options?: AFSSearchOptions): Promise<AFSSearchResult>`

Search for values within the JSON/YAML structure.

## Use Cases

- **Configuration Management**: Mount config files (JSON/YAML) and access settings via paths
- **Data Exploration**: Navigate complex JSON/YAML structures as a file system
- **API Testing**: Mount API responses and explore structure
- **State Management**: Persist application state in JSON or YAML format
- **Documentation**: Access structured documentation from JSON/YAML files
- **Kubernetes Config**: Navigate and query YAML configuration files
- **CI/CD Pipelines**: Access and modify YAML pipeline configurations

## License

Elastic-2.0
