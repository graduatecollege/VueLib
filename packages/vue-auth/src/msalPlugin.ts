import { type App, markRaw } from "vue";
import { PublicClientApplication } from "@azure/msal-browser";
import { CustomNavigationClient } from "./NavigationClient.ts";
import type { Router } from "vue-router";
import { Auth } from "./Auth.ts";
import { type MsalConfig } from "./msal.config.ts";

/**
 * Vue plugin for integrating MSAL authentication
 * 
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { createRouter } from 'vue-router'
 * import { PublicClientApplication } from '@azure/msal-browser'
 * import { msalPlugin, createMsalConfig } from '@graduatecollege/vue-auth'
 * 
 * const msalConfig = createMsalConfig(
 *   import.meta.env.VITE_AZURE_CLIENT_ID,
 *   import.meta.env.VITE_AZURE_AUTHORITY
 * )
 * 
 * const msalInstance = new PublicClientApplication(msalConfig)
 * const router = createRouter({ ... })
 * 
 * const app = createApp(App)
 * app.use(msalPlugin, msalInstance, msalConfig, router)
 * app.use(router)
 * app.mount('#app')
 * ```
 */
export const msalPlugin = {
    install: (app: App, msalInstance: PublicClientApplication, msalConfig: MsalConfig, router: Router) => {
        const navigationClient = new CustomNavigationClient(router);
        msalInstance.setNavigationClient(navigationClient);

        const auth = Auth.create(msalInstance, msalConfig);

        app.config.globalProperties.$msalInstance = markRaw(msalInstance);
        app.config.globalProperties.$auth = auth;
    },
};
