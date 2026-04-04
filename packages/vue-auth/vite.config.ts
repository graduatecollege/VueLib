import { defineConfig } from "vite";
// @ts-ignore
import { resolve } from "path";
// @ts-ignore
import { fileURLToPath } from "url";import dts from "unplugin-dts/vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: [resolve(__dirname, "src/index.ts"), resolve(__dirname, "src/test.ts")],
            formats: ["es"],
        },
        rolldownOptions: {
            external: ["vue", "vue-router", "pinia", "@azure/msal-browser", "@vueuse/core"],
        },
        sourcemap: true,
        emptyOutDir: true,
    },
});
