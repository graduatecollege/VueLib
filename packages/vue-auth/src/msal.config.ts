import { LogLevel } from "@azure/msal-browser";

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
export function createMsalConfig(
    clientId: string,
    authority: string,
    apiAccessScope: string,
    allowedHosts: string[],
    additionalScopes: string[] = [],
): MsalConfig {
    return {
        auth: {
            clientId,
            authority: `https://login.microsoftonline.com/${authority}`,
            redirectUri: "/",
            postLogoutRedirectUri: "/",
        },
        cache: {
            cacheLocation: "localStorage",
        },
        system: {
            loggerOptions: {
                loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
                    if (containsPii) {
                        return;
                    }
                    switch (level) {
                        case LogLevel.Error:
                            console.error(message);
                            return;
                        case LogLevel.Info:
                            console.info(message);
                            return;
                        case LogLevel.Verbose:
                            console.debug(message);
                            return;
                        case LogLevel.Warning:
                            console.warn(message);
                            return;
                        default:
                            return;
                    }
                },
                logLevel: LogLevel.Warning,
            },
        },
        loginRequest: {
            scopes: ["User.Read", ...additionalScopes],
        },
        apiAccessScope,
        allowedHosts,
        graphConfig: {
            graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
        },
    };
}
