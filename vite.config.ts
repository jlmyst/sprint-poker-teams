import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from /<repo-name>/; set by the Pages workflow.
  base: process.env.BASE_PATH ?? "/",
  server: { port: 5173 },
});
