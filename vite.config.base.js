import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        '@azure/msal-browser',
        '@vueuse/core',
        'dayjs',
        'fast-equals',
        'remeda'
      ],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
