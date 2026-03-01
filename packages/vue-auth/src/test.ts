import { type App, markRaw, ref, shallowReactive } from "vue";
import type { Router } from "vue-router";
import { createMsalConfig, type MsalConfig } from "./msal.config.ts";

/**
 * Test authentication bypass that simulates authentication without MSAL.
 * This is used during Playwright tests to bypass the Azure AD authentication.
 */
export class TestAuth {
    account = ref<any>({
        name: "Test User",
        username: "testuser@illinois.edu",
        idTokenClaims: {
            given_name: "Test",
        },
    });

    accounts = [
        {
            name: "Test User",
            username: "testuser@illinois.edu",
            idTokenClaims: {
                given_name: "Test",
            },
        },
    ];

    status = "none" as any;
    inProgress = false;
    ready = true;
    redirect = false;

    constructor(public readonly msalConfig: MsalConfig) {}

    async initialize() {
        // Already initialized, set account immediately
        this.account.value = this.accounts[0];
        return Promise.resolve();
    }

    loginRedirect = (_redirectStartPage?: string) => {
        // No-op for tests - already authenticated
    };

    logout = () => {
        return Promise.resolve();
    };

    handleRedirect = async () => {
        return null;
    };

    async loadToken(_request: any) {
        return {
            accessToken: "User",
            expiresOn: new Date(Date.now() + 3600000),
        };
    }

    loadGraphToken() {
        return this.loadToken({});
    }

    loadApiToken() {
        return this.loadToken({});
    }
}

/**
 * Test authentication plugin that bypasses MSAL for Playwright tests.
 */
export const testAuthPlugin = {
    install: (app: App, router: Router, host: string) => {
        const auth = shallowReactive(new TestAuth(createMsalConfig(
            "test-client-id",
            "test-tenant-id",
            "test-api-scope",
            [host],
            ["test-scope"],
        )));
        // @ts-ignore
        app.config.globalProperties.$msalInstance = markRaw({});
        // @ts-ignore
        app.config.globalProperties.$auth = auth;
    },
};
