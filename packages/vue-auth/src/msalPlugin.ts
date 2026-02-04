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
    install: (app: App, apiAccessScope: string, msalConfig: MsalConfig, router: Router) => {
        const instance = new PublicClientApplication(msalConfig);
        const navigationClient = new CustomNavigationClient(router);
        instance.setNavigationClient(navigationClient);

        const auth = Auth.create(apiAccessScope, instance, msalConfig);

        app.config.globalProperties.$msalInstance = markRaw(instance);
        app.config.globalProperties.$auth = auth;
    },
};
