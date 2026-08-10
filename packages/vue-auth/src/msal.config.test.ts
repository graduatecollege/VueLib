import { describe, expect, it } from "vitest";
import { createMsalConfig } from "./msal.config.ts";

describe("createMsalConfig", () => {
    it("defaults cacheLocation to sessionStorage", () => {
        const config = createMsalConfig(
            "client-id",
            "tenant-id",
            "api://scope",
            ["example.com"],
        );

        expect(config.cache.cacheLocation).toBe("sessionStorage");
    });

    it("uses the provided cacheLocation", () => {
        const config = createMsalConfig(
            "client-id",
            "tenant-id",
            "api://scope",
            ["example.com"],
            [],
            "localStorage",
        );

        expect(config.cache.cacheLocation).toBe("localStorage");
    });
});
