import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { createBlockletPlugin } from "vite-plugin-blocklet";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), createBlockletPlugin(), svgr()],
  };
});
