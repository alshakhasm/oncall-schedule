import { defineConfig } from 'vite'

export default defineConfig({
  // minimal config — plugin removed for light dev setup
  server: {
    host: true,
    strictPort: true,
    port: 5173,
    open: false,
    fs: { strict: false },
  },
})
