import { defineStore } from "pinia";
import { computed, getCurrentInstance, ref, type ShallowReactive, watch } from "vue";
import type { Auth } from "./Auth.ts";

export const useMsalStore = defineStore("msal", () => {

        const name = ref("");
        const email = ref("");
        const givenName = ref("");
        const accessToken = ref("");
        const accessTokenExpires = ref(0);
        const isAuthenticated = ref(false);

        const internalInstance = getCurrentInstance();

        if (!internalInstance) {
            throw "useMsalStore() cannot be called outside the setup() function of a component";
        }
        const auth: ShallowReactive<Auth> = internalInstance.appContext.config.globalProperties.$auth;

        watch(auth.account, (account) => {
            if (account && account.name) {
                name.value = account.name;
                email.value = account.username || "";
                givenName.value = (account.idTokenClaims?.given_name as string) || "";
                isAuthenticated.value = true;
            } else {
                name.value = "";
                email.value = "";
                givenName.value = "";
                isAuthenticated.value = false;
            }
        });

        const loading = computed(() => {
            return auth.inProgress;
        });

        const initPromise = auth.initialize();

        let accessTokenPromise: Promise<string | null> | null;

        async function getAccessToken() {
            if (accessToken.value && accessTokenExpires.value > Date.now() + 20000) {
                return accessToken.value;
            }

            if (accessTokenPromise) {
                return accessTokenPromise;
            }

            accessTokenPromise = new Promise(async (resolve) => {
                try {
                    const token = await auth.loadApiToken();

                    if (token?.expiresOn) {
                        accessToken.value = token.accessToken;
                        accessTokenExpires.value = token.expiresOn.getTime();
                    } else {
                        accessToken.value = "";
                        accessTokenExpires.value = 0;
                    }
                    resolve(accessToken.value);
                } catch (e) {
                    console.error("Failed to load access token", e);
                    resolve(null);
                }
            });
            return accessTokenPromise;
        }
        const allowedHosts = new Set(auth.msalConfig.allowedHosts || []);

        const authTokenProvider = async (url: string) => {
            const urlObj = new URL(url);
            const host = urlObj.host.toLowerCase();
            if (!allowedHosts.has(host)) {
                console.info("Skipping auth token for", host);
                return null;
            }

            let token = await getAccessToken();
            return token;
        };

        const netId = computed(() => {
            return email.value?.split("@")[0] || "";
        });

        const initial = computed(() => {
            return email.value?.slice(0, 1)?.toUpperCase() || "?";
        });

        return {
            name,
            email,
            netId,
            accessToken,
            accessTokenExpires,
            isAuthenticated,
            loading,
            getAccessToken,
            login: auth.loginRedirect,
            logout: () => auth.logout(),
            authTokenProvider,
            initial,
            handleRedirect: auth.handleRedirect,
            initPromise,
        };
});