import { defineConfig } from "vite";

export default defineConfig({
  base: "/lesson-planner-program/",
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
  },
});
