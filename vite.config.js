import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: "**/*.glb",
  preview: {
    port: 8080,
    build: {
      sourcemap: true, // Kontrollera om källmappningsfiler ska genereras
      // Andra bygginställningar...
    },
  },
})
