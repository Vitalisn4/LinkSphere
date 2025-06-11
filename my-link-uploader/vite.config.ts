import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  esbuild: {
    loader: "tsx",
    include: [
      // Add visibility to the files you want to use JSX syntax in
      "src/**/*.tsx",
      "src/**/*.ts",
      "src/**/*.jsx",
      "src/**/*.js",
    ],
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
      },
    },
  },
})
