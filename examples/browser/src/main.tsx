import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

Object.assign(globalThis, { AIGNEHTTPClient, DefaultMemory });

createRoot(document.getElementById("root") as Element).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
