import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import dts from "unplugin-dts/vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: "index",
        },
        rolldownOptions: {
            external: ["vue", "dayjs"],
        },
        sourcemap: true,
        emptyOutDir: true,
    },
});
