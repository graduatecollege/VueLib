import { NavigationClient, NavigationOptions } from "@azure/msal-browser";
import { Router } from "vue-router";

/**
 * Custom navigation client for integrating MSAL with Vue Router.
 * This prevents full page reloads on auth redirects and uses Vue Router for navigation.
 */
export class CustomNavigationClient extends NavigationClient{
    private router: Router;

    constructor(router: Router) {
        super();
        this.router = router;
    }

    /**
     * Navigates to other pages within the same web application
     * You can use the router to take advantage of client-side routing
     * @param url - The URL to navigate to
     * @param options - Navigation options
     */
    async navigateInternal(url: string, options: NavigationOptions) {
        const relativePath = url.replace(window.location.origin, '');
        if (options.noHistory) {
            this.router.replace(relativePath);
        } else {
            this.router.push(relativePath);
        }

        return false;
    }
}
