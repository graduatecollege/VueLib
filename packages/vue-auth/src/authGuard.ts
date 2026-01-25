import { RouteLocationNormalized, Router } from "vue-router";

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
 * Routes with `meta.requiresAuth = true` will require authentication.
 */
export function registerAuthGuard(router: Router, getAuthStore: () => AuthStoreInterface) {
    router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
        if (to.meta.requiresAuth) {
            const shouldProceed = await isAuthenticated(getAuthStore, to.fullPath);
            return shouldProceed || '/';
        }

        return true;
    });
}

/**
 * Checks if the user is authenticated and initiates login if not.
 * 
 * @param getAuthStore - Function that returns the auth store
 * @param redirectStartPage - Optional redirect path after login
 * @returns Promise<boolean> - True if authenticated, false otherwise
 */
export async function isAuthenticated(
    getAuthStore: () => AuthStoreInterface,
    redirectStartPage?: string
): Promise<boolean> {
    try {
        const authStore = getAuthStore();
        await authStore.initPromise;
        if (authStore.isAuthenticated) {
            return true;
        }
        await authStore.handleRedirect();
        if (authStore.isAuthenticated) {
            return true;
        }
        await authStore.login(redirectStartPage);
        if (authStore.isAuthenticated) {
            return true;
        }
    } catch (err) {
        console.warn(err);
    }
    return false;
}
