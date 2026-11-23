import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      input: {
        home: path.resolve(__dirname, 'index.html'),
        directory: path.resolve(__dirname, 'directory/index.html'),
        workbench: path.resolve(__dirname, 'workbench/index.html'),
        observatory: path.resolve(__dirname, 'observatory/index.html'),
        architecture: path.resolve(__dirname, 'architecture/index.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('comparison-data.json')) {
            return 'comparison-dataset'
          }
        }
      }
    }
  }
})
