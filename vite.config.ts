import { defineConfig } from 'vite'

// If deploying to GitHub Pages at https://<user>.github.io/oncall-schedule/
// we need base to be '/oncall-schedule/'. Allow override via env for flexibility.
const repoBase = process.env.VITE_BASE || '/oncall-schedule/';

export default defineConfig({
  base: repoBase,
  server: {
    host: true,
    strictPort: true,
    port: 5173,
    open: false,
    fs: { strict: false },
  },
  build: {
    outDir: 'dist'
  }
})
