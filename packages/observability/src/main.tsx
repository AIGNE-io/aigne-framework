import {createRoot} from "react-dom/client"
import App from "./app.js"
import Blocklet from "./blocklet.js"

const container = document.getElementById("root")

if (container) {
  const root = createRoot(container)

  // @ts-ignore
  root.render((window.blocklet ? <Blocklet /> : <App />) as any)
}
