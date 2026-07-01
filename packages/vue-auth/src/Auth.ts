import {
    AccountInfo,
    BrowserAuthError,
    BrowserAuthErrorCodes,
    type AuthenticationResult,
    type EventMessage,
    EventMessageUtils,
    EventType,
    InteractionRequiredAuthError,
    InteractionStatus,
    type PublicClientApplication,
    type SilentRequest,
} from "@azure/msal-browser";
import { type MsalConfig } from "./msal.config.ts";
import { Ref, ref, shallowReactive, toRef, watch } from "vue";

export class Auth {
    accounts: AccountInfo[] = [];
    account: Ref<AccountInfo | null> = ref<AccountInfo | null>(null);
    error: Ref<unknown | null> = ref(null);
    status: InteractionStatus = InteractionStatus.Startup;
    inProgress: boolean = false;
    ready: boolean = false;
    redirect: boolean = false;
    private interactiveRecoveryInProgress = false;

    protected initializing: Promise<any> | undefined = undefined;

    static create(apiAccessScope: string, msalInstance: PublicClientApplication, msalConfig: MsalConfig) {
        let auth = shallowReactive(new Auth(apiAccessScope, msalInstance, msalConfig));
        auth.addEventListeners();
        return auth;
    }

    private constructor(
        private apiAccessScope: string,
        private msalInstance: PublicClientApplication,
        public readonly msalConfig: MsalConfig,
    ) {}

    clearError() {
        this.error.value = null;
        this.initializing = undefined;
    }

    async initialize() {
        if (!this.ready) {
            if (!this.initializing) {
                this.initializing = this.msalInstance.initialize().then(() => {
                    const acc = this.msalInstance.getActiveAccount();
                    if (acc) {
                        this.accounts = this.msalInstance.getAllAccounts();
                        this.account.value = acc;
                    }
                    return this.msalInstance.handleRedirectPromise();
                });
            }

            try {
                await this.initializing;
            } catch (error) {
                this.error.value = error;
                this.initializing = undefined;
                throw error;
            }
        }
    }

    loginRedirect = (redirectStartPage?: string) => {
        this.clearError();
        this.msalInstance.loginRedirect({
            ...this.msalConfig.loginRequest,
            redirectStartPage,
        });
    };

    retry = (redirectStartPage?: string) => {
        this.loginRedirect(redirectStartPage);
    };

    logout = () => {
        this.clearError();
        return this.msalInstance.logoutRedirect();
    };

    handleRedirect: () => Promise<AuthenticationResult | null> = async () => {
        try {
            return await this.msalInstance.handleRedirectPromise();
        } catch (error) {
            this.error.value = error;
            throw error;
        }
    };

    private getTokenAccount(request: SilentRequest) {
        return request.account ?? this.account.value ?? this.msalInstance.getActiveAccount() ?? this.msalInstance.getAllAccounts()[0] ?? null;
    }

    loadToken(request: SilentRequest) {
        return new Promise<AuthenticationResult>((resolve, reject) => {
            const execute = () => {
                acquireToken()
                    .then((res) => {
                        if (res) {
                            stopWatcher();
                            resolve(res);
                        }
                    })
                    .catch((e) => {
                        console.warn(e);
                        stopWatcher();
                        reject(e);
                    });
            };

            const stopWatcher = watch(toRef(this.status), (st) => {
                execute();
            });

            const acquireToken = async () => {
                await this.initialize();

                if (this.error.value) {
                    throw this.error.value;
                }

                if (this.redirect) {
                    return await this.handleRedirect();
                }

                const account = this.getTokenAccount(request);
                if (!account) {
                    throw new Error("Cannot acquire token without a signed-in account.");
                }

                try {
                    const response = await this.msalInstance.acquireTokenSilent({
                        ...request,
                        account,
                        redirectUri: this.msalConfig.auth.silentRedirectUri,
                    });
                    this.interactiveRecoveryInProgress = false;
                    return response;
                } catch (e) {
                    if (shouldRecoverWithRedirect(e)) {
                        await this.acquireTokenRedirectOnce(request);
                        throw e;
                    }

                    this.error.value = e;
                    throw e;
                }
            };

            execute();
        });
    }

    loadGraphToken() {
        return this.loadToken(this.msalConfig.loginRequest);
    }

    loadApiToken() {
        return this.loadToken({
            scopes: [this.apiAccessScope],
        });
    }

    private addEventListeners() {
        this.msalInstance.addEventCallback((event: EventMessage) => {
            if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
                const account = event.payload as AccountInfo;
                this.msalInstance.setActiveAccount(account);
                this.error.value = null;
            }

            if (event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS && event.payload) {
                const payload = event.payload as AuthenticationResult;
                const account = payload.account;
                this.msalInstance.setActiveAccount(account);
                this.error.value = null;
            }

            if (
                (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE ||
                    event.eventType === EventType.BROKERED_REQUEST_FAILURE) &&
                event.error
            ) {
                this.error.value = event.error;
            }

            switch (event.eventType) {
                case EventType.LOGIN_SUCCESS:
                case EventType.LOGOUT_SUCCESS:
                case EventType.HANDLE_REDIRECT_END:
                case EventType.ACQUIRE_TOKEN_SUCCESS:
                case EventType.ACQUIRE_TOKEN_FAILURE: {
                    const currentAccounts = this.msalInstance.getAllAccounts();
                    if (!accountArraysAreEqual(currentAccounts, this.accounts)) {
                        this.accounts = currentAccounts;
                        this.account.value = currentAccounts.length > 0 ? currentAccounts[0] : null;
                    }
                    break;
                }
            }

            const status = EventMessageUtils.getInteractionStatusFromEvent(event, this.status);

            if (status !== null) {
                switch (status) {
                    case InteractionStatus.Startup:
                        this.inProgress = false;
                        this.ready = false;
                        this.redirect = false;
                        this.interactiveRecoveryInProgress = false;
                        break;
                    case InteractionStatus.Logout:
                    case InteractionStatus.AcquireToken:
                        this.inProgress = true;
                        this.ready = false;
                        break;
                    case InteractionStatus.HandleRedirect:
                        this.inProgress = true;
                        this.ready = false;
                        this.redirect = true;
                        break;
                    case InteractionStatus.None:
                        this.inProgress = false;
                        this.ready = true;
                        this.redirect = false;
                        this.interactiveRecoveryInProgress = false;
                        break;
                }
                this.status = status;
            }
        });
    }

    private async acquireTokenRedirectOnce(request: SilentRequest) {
        if (this.inProgress || this.interactiveRecoveryInProgress) {
            return;
        }

        this.interactiveRecoveryInProgress = true;
        await this.msalInstance.acquireTokenRedirect({
            ...request,
            account: this.getTokenAccount(request) ?? undefined,
        });
    }
}

type AccountIdentifiers = Partial<Pick<AccountInfo, "homeAccountId" | "localAccountId" | "username">>;

/**
 * Helper function to determine whether 2 arrays are equal
 * Used to avoid unnecessary state updates
 * @param arrayA
 * @param arrayB
 */
function accountArraysAreEqual(arrayA: Array<AccountIdentifiers>, arrayB: Array<AccountIdentifiers>): boolean {
    if (arrayA.length !== arrayB.length) {
        return false;
    }

    const comparisonArray = [...arrayB];

    return arrayA.every((elementA) => {
        const elementB = comparisonArray.shift();
        if (!elementA || !elementB) {
            return false;
        }

        return (
            elementA.homeAccountId === elementB.homeAccountId &&
            elementA.localAccountId === elementB.localAccountId &&
            elementA.username === elementB.username
        );
    });
}

function shouldRecoverWithRedirect(error: unknown) {
    return error instanceof InteractionRequiredAuthError || isRecoverableSilentAuthError(error);
}

function isRecoverableSilentAuthError(error: unknown) {
    if (!(error instanceof BrowserAuthError)) {
        return false;
    }

    return new Set([
        BrowserAuthErrorCodes.timedOut,
        BrowserAuthErrorCodes.hashEmptyError,
        BrowserAuthErrorCodes.hashDoesNotContainKnownProperties,
        BrowserAuthErrorCodes.blockIframeReload,
    ]).has(error.errorCode);
}
