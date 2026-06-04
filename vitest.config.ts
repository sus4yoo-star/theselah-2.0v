import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Map the "@/..." import alias (used across src/) so tests can import the
// same modules the app does.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
