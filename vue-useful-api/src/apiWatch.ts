import { watchDebounced, WatchDebouncedOptions } from "@vueuse/core";
import { watch, WatchCallback } from "vue";
import { deepEqual } from "fast-equals";
import { clone } from "remeda";

/**
 * Automatically executes API calls when reactive dependencies change.
 * 
 * This composable is a shorthand for watching reactive values and executing an API call
 * when they change. It includes:
 * - Deep equality checking (uses fast-equals) to prevent unnecessary re-execution
 * - Debouncing support for expensive operations
 * - Immediate execution option
 *
 * The API call won't re-execute if the same arguments are passed as the last execution.
 * If a new execution is needed regardless, call the execute function directly.
 *
 * @param exec - The execute function from a usefulApi instance
 * @param watcher - Function that returns the arguments for the execute function, or undefined to skip execution
 * @param options - Optional options for debouncing
 *
 * @example
 * ```typescript
 * import { ref } from 'vue'
 * import { usefulApi, apiWatch } from '@graduatecollege/vue-useful-api'
 *
 * const userId = ref('123')
 * const includeDetails = ref(true)
 *
 * const api = {
 *   async getUser(id: string, details: boolean) {
 *     const response = await fetch(`/api/users/${id}?details=${details}`)
 *     return response.json()
 *   }
 * }
 *
 * const getUser = usefulApi(api.getUser.bind(api))()
 *
 * // Watch userId and includeDetails, execute when they change
 * apiWatch(getUser.execute, () => {
 *   return userId.value ? [userId.value, includeDetails.value] : undefined
 * })
 *
 * // Handle success
 * getUser.onSuccess((user) => {
 *   console.log('User loaded:', user)
 * })
 *
 * // Now whenever userId or includeDetails changes, the API is called automatically
 * userId.value = '456' // Triggers API call
 * ```
 *
 * @example
 * ```typescript
 * // With debouncing for search
 * const searchTerm = ref('')
 *
 * const search = usefulApi(api.search.bind(api))()
 *
 * apiWatch(
 *   search.execute,
 *   () => searchTerm.value ? [searchTerm.value] : undefined,
 *   { debounce: 300 } // Wait 300ms after last change
 * )
 * ```
 */
export function apiWatch<Exec extends (arg?: any, arg2?: any, arg3?: any) => Promise<void>>(
    exec: Exec,
    watcher: () => Parameters<Exec> | undefined,
    options?: WatchDebouncedOptions<true>,
) {
    // If we've already executed and the same arguments are passed, don't execute again
    let hasExecuted = false;
    let lastArgs: Parameters<Exec> | undefined;

    const run: WatchCallback = (arg) => {
        if (arg) {
            if (!hasExecuted || !deepEqual(arg, lastArgs)) {
                exec.call(null, ...arg);
                hasExecuted = true;
                lastArgs = clone(arg);
            }
        }
    };

    if (options?.debounce) {
        watchDebounced(watcher, run, { immediate: true, ...options });
    } else {
        watch(watcher, run, { immediate: true });
    }
}
