import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// @ts-ignore
import { createBlockletPlugin } from "vite-plugin-blocklet";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), createBlockletPlugin()],
});
