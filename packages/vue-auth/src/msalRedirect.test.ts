import { afterEach, describe, expect, it, vi } from "vitest";
import { takeMsalRedirectHash } from "./msalRedirect.ts";

describe("takeMsalRedirectHash", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("takes an MSAL success response and removes it from the URL", () => {
        const replaceState = vi.fn();
        vi.stubGlobal("window", {
            location: {
                hash: "#code=authorization-code&state=redirect-state",
                pathname: "/callback",
                search: "?source=bookmark",
            },
            history: {
                state: { current: "/callback" },
                replaceState,
            },
        });
        vi.stubGlobal("document", { title: "Certification" });

        expect(takeMsalRedirectHash()).toBe("#code=authorization-code&state=redirect-state");
        expect(replaceState).toHaveBeenCalledWith(
            { current: "/callback" },
            "Certification",
            "/callback?source=bookmark",
        );
    });

    it("takes an MSAL error response", () => {
        const replaceState = vi.fn();
        vi.stubGlobal("window", {
            location: {
                hash: "#error=access_denied&state=redirect-state",
                pathname: "/",
                search: "",
            },
            history: {
                state: null,
                replaceState,
            },
        });
        vi.stubGlobal("document", { title: "Certification" });

        expect(takeMsalRedirectHash()).toBe("#error=access_denied&state=redirect-state");
        expect(replaceState).toHaveBeenCalledOnce();
    });

    it("leaves regular bookmarked fragments unchanged", () => {
        const replaceState = vi.fn();
        vi.stubGlobal("window", {
            location: {
                hash: "#requirements",
                pathname: "/about",
                search: "",
            },
            history: {
                state: null,
                replaceState,
            },
        });
        vi.stubGlobal("document", { title: "Certification" });

        expect(takeMsalRedirectHash()).toBeUndefined();
        expect(replaceState).not.toHaveBeenCalled();
    });
});
