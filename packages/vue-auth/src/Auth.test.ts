import {
    BrowserAuthError,
    EventType,
    InteractionRequiredAuthError,
    InteractionStatus,
    type EventCallbackFunction,
    type EventMessage,
} from "@azure/msal-browser";
import { describe, expect, it, vi } from "vitest";
import { Auth } from "./Auth.ts";
import { createMsalConfig } from "./msal.config.ts";

describe("Auth", () => {
    it("stores redirect failures from events and stops retrying redirects", async () => {
        let callback: EventCallbackFunction | undefined;
        const handleRedirectPromise = vi.fn().mockResolvedValue(null);
        const acquireTokenSilent = vi.fn().mockRejectedValue(new Error("silent failed"));
        const loginRedirect = vi.fn();
        const acquireTokenRedirect = vi.fn();

        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(null),
            getAllAccounts: vi.fn().mockReturnValue([]),
            handleRedirectPromise,
            loginRedirect,
            logoutRedirect: vi.fn(),
            acquireTokenSilent,
            acquireTokenRedirect,
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn((cb: EventCallbackFunction) => {
                callback = cb;
                return null;
            }),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        callback?.({
            eventType: EventType.ACQUIRE_TOKEN_FAILURE,
            interactionType: null,
            payload: null,
            error: {
                errorCode: "invalid_client",
                errorMessage: "bad scope",
                name: "ServerError",
            },
            correlationId: "test-correlation-id",
            timestamp: Date.now(),
        } as EventMessage);

        await expect(auth.loadApiToken()).rejects.toMatchObject({
            errorCode: "invalid_client",
        });

        expect(loginRedirect).not.toHaveBeenCalled();
        expect(acquireTokenRedirect).not.toHaveBeenCalled();
        expect(acquireTokenSilent).not.toHaveBeenCalled();
        expect(auth.error.value).toMatchObject({ errorCode: "invalid_client" });
    });

    it("only redirects when MSAL reports interaction is required", async () => {
        const interactionRequired = new InteractionRequiredAuthError(
            "interaction_required",
            "interaction required",
        );
        const account = {
            homeAccountId: "home-account-id",
            localAccountId: "local-account-id",
            username: "user@example.com",
            tenantId: "tenant-id",
            environment: "login.microsoftonline.com",
        };

        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(account),
            getAllAccounts: vi.fn().mockReturnValue([account]),
            handleRedirectPromise: vi.fn().mockResolvedValue(null),
            loginRedirect: vi.fn(),
            logoutRedirect: vi.fn(),
            acquireTokenSilent: vi.fn().mockRejectedValue(interactionRequired),
            acquireTokenRedirect: vi.fn().mockResolvedValue(undefined),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        auth.status = InteractionStatus.None;
        auth.ready = true;
        auth.account.value = account as any;

        await expect(auth.loadApiToken()).rejects.toBe(interactionRequired);

        expect(msalInstance.acquireTokenRedirect).toHaveBeenCalledTimes(1);
        expect(msalInstance.loginRedirect).not.toHaveBeenCalled();
        expect(auth.error.value).toBeNull();
    });

    it("falls back to interactive redirect when silent token renewal times out", async () => {
        const silentTimeout = new BrowserAuthError("timed_out", "");
        const account = {
            homeAccountId: "home-account-id",
            localAccountId: "local-account-id",
            username: "user@example.com",
            tenantId: "tenant-id",
            environment: "login.microsoftonline.com",
        };

        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(account),
            getAllAccounts: vi.fn().mockReturnValue([account]),
            handleRedirectPromise: vi.fn().mockResolvedValue(null),
            loginRedirect: vi.fn(),
            logoutRedirect: vi.fn(),
            acquireTokenSilent: vi.fn().mockRejectedValue(silentTimeout),
            acquireTokenRedirect: vi.fn().mockResolvedValue(undefined),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        auth.status = InteractionStatus.None;
        auth.ready = true;
        auth.account.value = account as any;

        await expect(auth.loadApiToken()).rejects.toBe(silentTimeout);

        expect(msalInstance.acquireTokenRedirect).toHaveBeenCalledTimes(1);
        expect(msalInstance.acquireTokenRedirect).toHaveBeenCalledWith(
            expect.objectContaining({
                scopes: ["api://scope"],
                account,
            }),
        );
        expect(auth.error.value).toBeNull();
    });

    it("does not latch recoverable token failures from MSAL events", async () => {
        let callback: EventCallbackFunction | undefined;
        const interactionRequired = new InteractionRequiredAuthError(
            "interaction_required",
            "interaction required",
        );
        const account = {
            homeAccountId: "home-account-id",
            localAccountId: "local-account-id",
            username: "user@example.com",
            tenantId: "tenant-id",
            environment: "login.microsoftonline.com",
        };

        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(account),
            getAllAccounts: vi.fn().mockReturnValue([account]),
            handleRedirectPromise: vi.fn().mockResolvedValue(null),
            loginRedirect: vi.fn(),
            logoutRedirect: vi.fn(),
            acquireTokenSilent: vi.fn().mockRejectedValue(interactionRequired),
            acquireTokenRedirect: vi.fn().mockResolvedValue(undefined),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn((cb: EventCallbackFunction) => {
                callback = cb;
                return null;
            }),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        auth.status = InteractionStatus.None;
        auth.ready = true;
        auth.account.value = account as any;

        callback?.({
            eventType: EventType.ACQUIRE_TOKEN_FAILURE,
            interactionType: null,
            payload: null,
            error: interactionRequired,
            correlationId: "test-correlation-id",
            timestamp: Date.now(),
        } as EventMessage);

        expect(auth.error.value).toBeNull();

        await expect(auth.loadApiToken()).rejects.toBe(interactionRequired);

        expect(msalInstance.acquireTokenSilent).toHaveBeenCalledTimes(1);
        expect(msalInstance.acquireTokenRedirect).toHaveBeenCalledTimes(1);
        expect(auth.error.value).toBeNull();
    });

    it("clears terminal errors before an explicit retry", () => {
        const loginRedirect = vi.fn();
        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(null),
            getAllAccounts: vi.fn().mockReturnValue([]),
            handleRedirectPromise: vi.fn().mockResolvedValue(null),
            loginRedirect,
            logoutRedirect: vi.fn(),
            acquireTokenSilent: vi.fn(),
            acquireTokenRedirect: vi.fn(),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        auth.error.value = { errorCode: "invalid_client" };

        auth.retry("/dashboard");

        expect(auth.error.value).toBeNull();
        expect(loginRedirect).toHaveBeenCalledWith(
            expect.objectContaining({
                scopes: ["User.Read"],
                redirectStartPage: "/dashboard",
            }),
        );
    });

    it("clears the local MSAL cache before re-authenticating", async () => {
        const account = {
            homeAccountId: "home-account-id",
            localAccountId: "local-account-id",
            username: "user@example.com",
            tenantId: "tenant-id",
            environment: "login.microsoftonline.com",
        };
        let cachedAccounts: typeof account[] = [account];
        let activeAccount: typeof account | null = account;
        const clearCache = vi.fn().mockImplementation(async () => {
            cachedAccounts = [];
            activeAccount = null;
        });
        const loginRedirect = vi.fn();
        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn(() => activeAccount),
            getAllAccounts: vi.fn(() => cachedAccounts),
            handleRedirectPromise: vi.fn().mockResolvedValue(null),
            loginRedirect,
            logoutRedirect: vi.fn(),
            clearCache,
            acquireTokenSilent: vi.fn(),
            acquireTokenRedirect: vi.fn(),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        auth.error.value = new Error("stale auth");
        auth.account.value = account as any;
        auth.accounts = [account as any];

        await auth.clearCacheAndLoginRedirect("/dashboard");

        expect(clearCache).toHaveBeenCalledTimes(1);
        expect(auth.error.value).toBeNull();
        expect(auth.account.value).toBeNull();
        expect(auth.accounts).toEqual([]);
        expect(loginRedirect).toHaveBeenCalledWith(
            expect.objectContaining({
                scopes: ["User.Read"],
                redirectStartPage: "/dashboard",
            }),
        );
    });

    it("identifies when manual recovery is required", async () => {
        const corruptedStateError = new BrowserAuthError("unable_to_load_token", "");
        const interactionRequired = new InteractionRequiredAuthError(
            "interaction_required",
            "interaction required",
        );
        const account = {
            homeAccountId: "home-account-id",
            localAccountId: "local-account-id",
            username: "user@example.com",
            tenantId: "tenant-id",
            environment: "login.microsoftonline.com",
        };

        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(account),
            getAllAccounts: vi.fn().mockReturnValue([account]),
            handleRedirectPromise: vi.fn().mockResolvedValue(null),
            loginRedirect: vi.fn(),
            logoutRedirect: vi.fn(),
            clearCache: vi.fn(),
            acquireTokenSilent: vi.fn().mockRejectedValue(corruptedStateError),
            acquireTokenRedirect: vi.fn(),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        auth.status = InteractionStatus.None;
        auth.ready = true;
        auth.account.value = account as any;

        await expect(auth.loadApiToken()).rejects.toBe(corruptedStateError);

        expect(auth.error.value).toBe(corruptedStateError);
        expect(auth.manualRecoveryRequired).toBe(true);
        expect(auth.manualRecoveryRequired).toBe(true);
        auth.error.value = interactionRequired;
        expect(auth.manualRecoveryRequired).toBe(false);
    });

    it("fails fast before silent token acquisition when no account is signed in", async () => {
        const acquireTokenSilent = vi.fn();
        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(null),
            getAllAccounts: vi.fn().mockReturnValue([]),
            handleRedirectPromise: vi.fn().mockResolvedValue(null),
            loginRedirect: vi.fn(),
            logoutRedirect: vi.fn(),
            acquireTokenSilent,
            acquireTokenRedirect: vi.fn(),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        await expect(auth.loadApiToken()).rejects.toThrow("Cannot acquire token without a signed-in account.");
        expect(acquireTokenSilent).not.toHaveBeenCalled();
        expect(msalInstance.acquireTokenRedirect).not.toHaveBeenCalled();
    });

    it("syncs the active account after redirect handling resolves", async () => {
        const redirectAccount = {
            homeAccountId: "redirect-home-account-id",
            localAccountId: "redirect-local-account-id",
            username: "redirect@example.com",
            tenantId: "tenant-id",
            environment: "login.microsoftonline.com",
        };

        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(redirectAccount),
            getAllAccounts: vi.fn().mockReturnValue([redirectAccount]),
            handleRedirectPromise: vi.fn().mockResolvedValue({ account: redirectAccount }),
            loginRedirect: vi.fn(),
            logoutRedirect: vi.fn(),
            acquireTokenSilent: vi.fn(),
            acquireTokenRedirect: vi.fn(),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        await auth.initialize();

        expect(msalInstance.setActiveAccount).toHaveBeenCalledWith(redirectAccount);
        expect(auth.account.value).toEqual(redirectAccount);
    });

    it("handles a redirect hash captured before router initialization", async () => {
        const handleRedirectPromise = vi.fn().mockResolvedValue(null);
        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(null),
            getAllAccounts: vi.fn().mockReturnValue([]),
            handleRedirectPromise,
            loginRedirect: vi.fn(),
            logoutRedirect: vi.fn(),
            acquireTokenSilent: vi.fn(),
            acquireTokenRedirect: vi.fn(),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };
        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );
        const redirectHash = "#code=authorization-code&state=redirect-state";

        await auth.initialize(redirectHash);

        expect(handleRedirectPromise).toHaveBeenCalledWith({ hash: redirectHash });
    });

    it("marks initialization complete when redirect promise resolves without events", async () => {
        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(null),
            getAllAccounts: vi.fn().mockReturnValue([]),
            handleRedirectPromise: vi.fn().mockResolvedValue(null),
            loginRedirect: vi.fn(),
            logoutRedirect: vi.fn(),
            acquireTokenSilent: vi.fn(),
            acquireTokenRedirect: vi.fn(),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        await auth.initialize();

        expect(auth.ready).toBe(true);
        expect(auth.inProgress).toBe(false);
        expect(auth.redirect).toBe(false);
        expect(auth.status).toBe(InteractionStatus.None);
    });

    it("does not mark initialization complete when redirect handling fails", async () => {
        const msalInstance = {
            initialize: vi.fn().mockResolvedValue(undefined),
            getActiveAccount: vi.fn().mockReturnValue(null),
            getAllAccounts: vi.fn().mockReturnValue([]),
            handleRedirectPromise: vi.fn().mockRejectedValue(new Error("redirect failed")),
            loginRedirect: vi.fn(),
            logoutRedirect: vi.fn(),
            acquireTokenSilent: vi.fn(),
            acquireTokenRedirect: vi.fn(),
            setActiveAccount: vi.fn(),
            addEventCallback: vi.fn(),
        };

        const auth = Auth.create(
            "api://scope",
            msalInstance as any,
            createMsalConfig("client-id", "tenant-id", "api://scope", ["example.com"]),
        );

        await expect(auth.initialize()).rejects.toThrow("redirect failed");

        expect(auth.ready).toBe(false);
        expect(auth.status).toBe(InteractionStatus.Startup);
    });

});