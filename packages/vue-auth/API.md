# vue-auth

Full d.ts definition:

```typescript
import { AccountInfo, AuthenticationResult, InteractionStatus, PublicClientApplication, SilentRequest } from '@azure/msal-browser';
import { MsalConfig } from './msal.config.ts';
import { Ref } from 'vue';
export declare class Auth {
    private apiAccessScope;
    private msalInstance;
    readonly msalConfig: MsalConfig;
    accounts: AccountInfo[];
    account: Ref<AccountInfo | null>;
    status: InteractionStatus;
    inProgress: boolean;
    ready: boolean;
    redirect: boolean;
    protected initializing: Promise<any> | undefined;
    static create(apiAccessScope: string, msalInstance: PublicClientApplication, msalConfig: MsalConfig): import('vue').ShallowReactive<Auth>;
    private constructor();
    initialize(): Promise<void>;
    loginRedirect: (redirectStartPage?: string) => void;
    logout: () => Promise<void>;
    handleRedirect: () => Promise<AuthenticationResult | null>;
    loadToken(request: SilentRequest): Promise<AuthenticationResult>;
    loadGraphToken(): Promise<AuthenticationResult>;
    loadApiToken(): Promise<AuthenticationResult>;
    private addEventListeners;
}
//# sourceMappingURL=Auth.d.ts.map
import { Router } from 'vue-router';
/**
 * Interface for the auth store used by the auth guard.
 * Your auth store should implement this interface.
 */
export interface AuthStoreInterface {
    initPromise: Promise<void>;
    isAuthenticated: boolean;
    handleRedirect: () => Promise<any>;
    login: (redirectStartPage?: string) => void;
}
/**
 * Registers the authentication guard with the Vue Router.
 * Routes with \`meta.requiresAuth = true\` will require authentication.
 */
export declare function registerAuthGuard(router: Router, getAuthStore: () => AuthStoreInterface): void;
/**
 * Checks if the user is authenticated and initiates login if not.
 *
 * @param getAuthStore - Function that returns the auth store
 * @param redirectStartPage - Optional redirect path after login
 * @returns Promise<boolean> - True if authenticated, false otherwise
 */
export declare function isAuthenticated(getAuthStore: () => AuthStoreInterface, redirectStartPage?: string): Promise<boolean>;
//# sourceMappingURL=authGuard.d.ts.map
/**
 * Generates a deterministic color for a user based on their netID.
 * Useful for displaying user avatars with consistent colors.
 *
 * @param netId - User's network ID
 * @returns Hex color string
 */
export declare function netIdToColor(netId: string): string;
/**
 * Formats user initials from their netID or username.
 * Returns "SYS" for system users.
 *
 * @param updater - Username or netID
 * @returns Formatted initials (uppercase)
 */
export declare function getUpdaterInitials(updater: string): string;
//# sourceMappingURL=authUtils.d.ts.map
/**
 * @illinois-grad/vue-auth
 *
 * Vue 3 authentication utilities with MSAL integration for Graduate College applications.
 *
 * This package provides:
 * - Auth class for MSAL integration
 * - Vue plugin for easy setup
 * - Router authentication guard
 * - Navigation client for Vue Router integration
 * - Utility functions for user display
 */
export { Auth } from './Auth.ts';
export { type MsalConfig, createMsalConfig } from './msal.config.ts';
export { msalPlugin } from './msalPlugin.ts';
export { CustomNavigationClient } from './NavigationClient.ts';
export { registerAuthGuard, isAuthenticated, type AuthStoreInterface } from './authGuard.ts';
export { netIdToColor, getUpdaterInitials } from './authUtils.ts';
export { useMsalStore } from './msal.store.ts';
//# sourceMappingURL=index.d.ts.map
import { LogLevel } from '@azure/msal-browser';
/**
 * Configuration interface for MSAL
 */
export interface MsalConfig {
    auth: {
        clientId: string;
        authority: string;
        redirectUri: string;
        postLogoutRedirectUri: string;
    };
    cache: {
        cacheLocation: "localStorage" | "sessionStorage";
        storeAuthStateInCookie?: boolean;
    };
    system?: {
        loggerOptions?: {
            loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => void;
            logLevel?: LogLevel;
        };
    };
    loginRequest: {
        scopes: string[];
    };
    apiAccessScope: string;
    allowedHosts: string[];
    graphConfig?: {
        graphMeEndpoint: string;
    };
}
/**
 * Helper function to create a standard MSAL configuration
 * @param clientId - Azure AD application client ID
 * @param authority - Azure AD authority (tenant ID)
 * @param apiAccessScope - API access scope for authentication
 * @param allowedHosts - List of allowed hosts for API access
 * @param additionalScopes - Additional scopes beyond User.Read
 * @returns Complete MSAL configuration
 */
export declare function createMsalConfig(clientId: string, authority: string, apiAccessScope: string, allowedHosts: string[], additionalScopes?: string[]): MsalConfig;
//# sourceMappingURL=msal.config.d.ts.map
import { App } from 'vue';
import { Router } from 'vue-router';
import { MsalConfig } from './msal.config.ts';
/**
 * Vue plugin for integrating MSAL authentication
 */
export declare const msalPlugin: {
    install: (app: App, apiAccessScope: string, msalConfig: MsalConfig, router: Router) => void;
};
//# sourceMappingURL=msalPlugin.d.ts.map
export declare const useMsalStore: import('pinia').StoreDefinition<"msal", Pick<{
    name: import('vue').Ref<string, string>;
    email: import('vue').Ref<string, string>;
    netId: import('vue').ComputedRef<string>;
    accessToken: import('vue').Ref<string, string>;
    accessTokenExpires: import('vue').Ref<number, number>;
    isAuthenticated: import('vue').Ref<boolean, boolean>;
    loading: import('vue').ComputedRef<boolean>;
    getAccessToken: () => Promise<string | null>;
    login: (redirectStartPage?: string) => void;
    logout: () => Promise<void>;
    authTokenProvider: (url: string) => Promise<string | null>;
    initial: import('vue').ComputedRef<string>;
    handleRedirect: () => Promise<import('@azure/msal-browser').AuthenticationResult | null>;
    initPromise: Promise<void>;
}, "name" | "email" | "accessToken" | "accessTokenExpires" | "isAuthenticated" | "initPromise">, Pick<{
    name: import('vue').Ref<string, string>;
    email: import('vue').Ref<string, string>;
    netId: import('vue').ComputedRef<string>;
    accessToken: import('vue').Ref<string, string>;
    accessTokenExpires: import('vue').Ref<number, number>;
    isAuthenticated: import('vue').Ref<boolean, boolean>;
    loading: import('vue').ComputedRef<boolean>;
    getAccessToken: () => Promise<string | null>;
    login: (redirectStartPage?: string) => void;
    logout: () => Promise<void>;
    authTokenProvider: (url: string) => Promise<string | null>;
    initial: import('vue').ComputedRef<string>;
    handleRedirect: () => Promise<import('@azure/msal-browser').AuthenticationResult | null>;
    initPromise: Promise<void>;
}, "netId" | "loading" | "initial">, Pick<{
    name: import('vue').Ref<string, string>;
    email: import('vue').Ref<string, string>;
    netId: import('vue').ComputedRef<string>;
    accessToken: import('vue').Ref<string, string>;
    accessTokenExpires: import('vue').Ref<number, number>;
    isAuthenticated: import('vue').Ref<boolean, boolean>;
    loading: import('vue').ComputedRef<boolean>;
    getAccessToken: () => Promise<string | null>;
    login: (redirectStartPage?: string) => void;
    logout: () => Promise<void>;
    authTokenProvider: (url: string) => Promise<string | null>;
    initial: import('vue').ComputedRef<string>;
    handleRedirect: () => Promise<import('@azure/msal-browser').AuthenticationResult | null>;
    initPromise: Promise<void>;
}, "login" | "logout" | "handleRedirect" | "getAccessToken" | "authTokenProvider">>;
//# sourceMappingURL=msal.store.d.ts.map
import { NavigationClient, NavigationOptions } from '@azure/msal-browser';
import { Router } from 'vue-router';
/**
 * Custom navigation client for integrating MSAL with Vue Router.
 * This prevents full page reloads on auth redirects and uses Vue Router for navigation.
 */
export declare class CustomNavigationClient extends NavigationClient {
    private router;
    constructor(router: Router);
    /**
     * Navigates to other pages within the same web application
     * You can use the router to take advantage of client-side routing
     * @param url - The URL to navigate to
     * @param options - Navigation options
     */
    navigateInternal(url: string, options: NavigationOptions): Promise<boolean>;
}
//# sourceMappingURL=NavigationClient.d.ts.map
import { App } from 'vue';
import { Router } from 'vue-router';
import { MsalConfig } from './msal.config.ts';
/**
 * Test authentication bypass that simulates authentication without MSAL.
 * This is used during Playwright tests to bypass the Azure AD authentication.
 */
export declare class TestAuth {
    readonly msalConfig: MsalConfig;
    account: import('vue').Ref<any, any>;
    accounts: {
        name: string;
        username: string;
        idTokenClaims: {
            given_name: string;
        };
    }[];
    status: any;
    inProgress: boolean;
    ready: boolean;
    redirect: boolean;
    constructor(msalConfig: MsalConfig);
    initialize(): Promise<void>;
    loginRedirect: (_redirectStartPage?: string) => void;
    logout: () => Promise<void>;
    handleRedirect: () => Promise<null>;
    loadToken(_request: any): Promise<{
        accessToken: string;
        expiresOn: Date;
    }>;
    loadGraphToken(): Promise<{
        accessToken: string;
        expiresOn: Date;
    }>;
    loadApiToken(): Promise<{
        accessToken: string;
        expiresOn: Date;
    }>;
}
/**
 * Test authentication plugin that bypasses MSAL for Playwright tests.
 */
export declare const testAuthPlugin: {
    install: (app: App, router: Router, host: string) => void;
};
//# sourceMappingURL=test.d.ts.map
```
