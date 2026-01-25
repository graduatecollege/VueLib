# vue-auth

Full d.ts definition:

```typescript
import { AccountInfo } from '@azure/msal-browser';
import { App } from 'vue';
import { AuthenticationResult } from '@azure/msal-browser';
import { InteractionStatus } from '@azure/msal-browser';
import { LogLevel } from '@azure/msal-browser';
import { NavigationClient } from '@azure/msal-browser';
import { NavigationOptions } from '@azure/msal-browser';
import { PublicClientApplication } from '@azure/msal-browser';
import { Ref } from 'vue';
import { Router } from 'vue-router';
import { ShallowReactive } from 'vue';
import { SilentRequest } from '@azure/msal-browser';

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
    protected initializing: boolean;
    static create(apiAccessScope: string, msalInstance: PublicClientApplication, msalConfig: MsalConfig): ShallowReactive<Auth>;
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

/**
 * Interface for the auth store used by the auth guard.
 * Your auth store should implement this interface.
 */
export declare interface AuthStoreInterface {
    initPromise: Promise<void>;
    isAuthenticated: boolean;
    handleRedirect: () => Promise<any>;
    login: (redirectStartPage?: string) => void;
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

/**
 * Formats user initials from their netID or username.
 * Returns "SYS" for system users.
 *
 * @param updater - Username or netID
 * @returns Formatted initials (uppercase)
 */
export declare function getUpdaterInitials(updater: string): string;

/**
 * Checks if the user is authenticated and initiates login if not.
 *
 * @param getAuthStore - Function that returns the auth store
 * @param redirectStartPage - Optional redirect path after login
 * @returns Promise<boolean> - True if authenticated, false otherwise
 */
export declare function isAuthenticated(getAuthStore: () => AuthStoreInterface, redirectStartPage?: string): Promise<boolean>;

/**
 * Configuration interface for MSAL
 */
export declare interface MsalConfig {
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
 * Vue plugin for integrating MSAL authentication
 */
export declare const msalPlugin: {
    install: (app: App, apiAccessScope: string, msalInstance: PublicClientApplication, msalConfig: MsalConfig, router: Router) => void;
};

/**
 * Generates a deterministic color for a user based on their netID.
 * Useful for displaying user avatars with consistent colors.
 *
 * @param netId - User's network ID
 * @returns Hex color string
 */
export declare function netIdToColor(netId: string): string;

/**
 * Registers the authentication guard with the Vue Router.
 * Routes with \`meta.requiresAuth = true\` will require authentication.
 */
export declare function registerAuthGuard(router: Router, getAuthStore: () => AuthStoreInterface): void;

export { }

```
