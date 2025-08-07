<p align="center">
  <picture>
    <source srcset="./screenshots/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="./screenshots/logo.svg" media="(prefers-color-scheme: light)">
    <img src="./screenshots/logo.svg" alt="AIGNE Logo" width="400"/>
  </picture>
</p>


# AIGNE Observability

A visual tool for monitoring Agent data flow, built on OpenTelemetry. Supports collection of both Trace and Log data. Can be used as a standalone service or integrated into the AIGNE runtime (AIGNE has this module integrated by default).

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/refs/heads/chore-readme-arch/assets/aigne-observability-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/refs/heads/chore-readme-arch/assets/aigne-observability.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/refs/heads/chore-readme-arch/aigne-observability.png" alt="AIGNE Arch" />
</picture>

![](./screenshots/list.png)
![](./screenshots/detail.png)


## Observability UI

AIGNE Observability UI component

```jsx
import List from "@aigne/observability-ui/list";

function App () {
  return <List/>
}
```
