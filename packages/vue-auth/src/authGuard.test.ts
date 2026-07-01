import { describe, expect, it, vi } from "vitest";
import { isAuthenticated } from "./authGuard.ts";

describe("authGuard", () => {
    it("logs in after initialization when unauthenticated", async () => {
        const initialize = vi.fn().mockResolvedValue(undefined);
        const login = vi.fn().mockResolvedValue(undefined);

        const result = await isAuthenticated(
            () => ({
                initialize,
                isAuthenticated: false,
                login,
            }),
            "/record/123",
        );

        expect(result).toBe(false);
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(login).toHaveBeenCalledWith("/record/123");
    });

    it("returns true after initialization when already authenticated", async () => {
        const initialize = vi.fn().mockResolvedValue(undefined);
        const login = vi.fn();

        const result = await isAuthenticated(() => ({
            initialize,
            isAuthenticated: true,
            login,
        }));

        expect(result).toBe(true);
        expect(login).not.toHaveBeenCalled();
    });
});
