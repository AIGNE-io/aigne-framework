# @aigne/publish-docs

## Usage

```ts
import { publishDocs } from "@aigne/publish-docs";

await publishDocs({
  sidebarPath: "./docs/_sidebar.md", // Path to your docsify sidebar file
  boardId: "xxx",
  appUrl: "https://xxx",
  // Other parameters are optional
});
```

> **Note:** The `sidebarPath` should point to a file in [docsify sidebar format](https://docsify.js.org/#/sidebar?id=sidebar).

## Parameters

- `sidebarPath`: string (**required**) - Path to the docsify sidebar file.
- `boardId`: string (optional)
- `appUrl`: string (optional)
- `accessToken`: string (optional, takes precedence over OAuth)
- `scope`: string (optional, required if `accessToken` is not provided)
- `clientId`: string (optional, required if `accessToken` is not provided)
- `clientSecret`: string (optional, required if `accessToken` is not provided)
- `redirectUri`: string (optional, required if `accessToken` is not provided)

> If a parameter is not provided, it will be read from the corresponding environment variable if available. `accessToken` takes precedence over OAuth parameters.
