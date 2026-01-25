import { defineConfig } from "vite";
// @ts-ignore
import { resolve } from "path";
// @ts-ignore
import { fileURLToPath } from "url";
import dts from "vite-plugin-dts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            // Codex has zero dependencies - no externals needed
            external: [],
        },
        sourcemap: true,
        emptyOutDir: true,
    },
});
