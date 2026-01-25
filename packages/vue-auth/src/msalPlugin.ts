import { type App, markRaw } from "vue";
import { PublicClientApplication } from "@azure/msal-browser";
import { CustomNavigationClient } from "./NavigationClient.ts";
import type { Router } from "vue-router";
import { Auth } from "./Auth.ts";
import { type MsalConfig } from "./msal.config.ts";

/**
 * Vue plugin for integrating MSAL authentication
 */
export const msalPlugin = {
    install: (app: App, apiAccessScope: string, msalInstance: PublicClientApplication, msalConfig: MsalConfig, router: Router) => {
        const navigationClient = new CustomNavigationClient(router);
        msalInstance.setNavigationClient(navigationClient);

        const auth = Auth.create(apiAccessScope, msalInstance, msalConfig);

        app.config.globalProperties.$msalInstance = markRaw(msalInstance);
        app.config.globalProperties.$auth = auth;
    },
};
