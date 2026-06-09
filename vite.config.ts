import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Pick a unique port for each site so multiple `npm run dev` instances coexist.
// Assigned ports live in ../readme.md (5500-5510). Bump the highest when adding a site.
const DEV_FRONTEND_PORT = 5511;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: DEV_FRONTEND_PORT,
    strictPort: true,
  },
});
