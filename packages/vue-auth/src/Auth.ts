import {
    AccountInfo,
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
    status: InteractionStatus = InteractionStatus.Startup;
    inProgress: boolean = false;
    ready: boolean = false;
    redirect: boolean = false;

    protected initializing = false;

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

    async initialize() {
        if (!this.inProgress && !this.ready && !this.initializing) {
            this.initializing = true;
            await this.msalInstance.initialize().then(() => {
                const acc = this.msalInstance.getActiveAccount();
                if (acc) {
                    this.accounts = this.msalInstance.getAllAccounts();
                    this.account.value = acc;
                }
                return this.msalInstance.handleRedirectPromise().catch(() => {
                    // Errors should be handled by listening to the LOGIN_FAILURE event
                    return;
                });
            });
        }
    }

    loginRedirect = (redirectStartPage?: string) => {
        this.msalInstance.loginRedirect({
            ...this.msalConfig.loginRequest,
            redirectStartPage
        });
    }

    logout = () => {
        return this.msalInstance.logoutRedirect({
            onRedirectNavigate: (url) => {
                // Prevent navigation to logout page
                return false;
            }
        });
    };

    handleRedirect: () => Promise<AuthenticationResult | null>  = async () => {
        return await this.msalInstance.handleRedirectPromise();
    };

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
            }

            const stopWatcher = watch(toRef(this.status), (st) => {
                execute();
            });

            const acquireToken = async () => {
                await this.msalInstance.initialize();
                if (this.redirect) {
                    return await this.handleRedirect();
                }
                try {
                    const response = await this.msalInstance.acquireTokenSilent(request);
                    return response;
                } catch (e) {
                    if (e instanceof InteractionRequiredAuthError) {
                        await this.msalInstance.acquireTokenRedirect(request);
                        throw e;
                    }
                    if (!this.ready) {
                        return null;
                    }

                    await this.msalInstance.loginRedirect(request);
                    console.error("loadToken reached unexpected state");
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
                const payload = event.payload as AuthenticationResult;
                const account = payload.account;
                this.msalInstance.setActiveAccount(account);
            }

            switch (event.eventType) {
                case EventType.ACCOUNT_ADDED:
                case EventType.ACCOUNT_REMOVED:
                case EventType.LOGIN_SUCCESS:
                case EventType.SSO_SILENT_SUCCESS:
                case EventType.HANDLE_REDIRECT_END:
                case EventType.LOGIN_FAILURE:
                case EventType.SSO_SILENT_FAILURE:
                case EventType.LOGOUT_END:
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
                    case "startup":
                        this.inProgress = false;
                        this.ready = false;
                        this.redirect = false;
                        break;
                    case "login":
                    case "logout":
                    case "acquireToken":
                    case "ssoSilent":
                        this.inProgress = true;
                        this.ready = false;
                        break;
                    case "handleRedirect":
                        this.inProgress = true;
                        this.ready = false;
                        this.redirect = true;
                        break;
                    case "none":
                        this.inProgress = false;
                        this.ready = true;
                        this.redirect = false;
                        break;
                }
                this.status = status;
            }
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
