import { defineConfig } from "vite";

// A deliberately small local-only preview. It mounts the browser-safe lesson
// planner page directly, avoiding the experimental RSC/deployment toolchain
// while preserving the same React source, styling, and local browser storage.
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
});
