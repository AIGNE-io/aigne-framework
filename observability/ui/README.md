<p align="center">
  <img src="./screenshots/logo.svg" alt="AIGNE Logo" width="400"/>
</p>


# AIGNE Observability

A visual tool for monitoring Agent data flow, built on OpenTelemetry. Supports collection of both Trace and Log data. Can be used as a standalone service or integrated into the AIGNE runtime (AIGNE has this module integrated by default).

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
