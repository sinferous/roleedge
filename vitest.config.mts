import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // `server-only` throws outside a React Server environment; tests import server modules directly.
    alias: { "server-only": new URL("./tests/unit/server-only-stub.ts", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1") },
  },
});
