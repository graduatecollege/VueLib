import { watchDebounced, WatchDebouncedOptions } from "@vueuse/core";
import { watch, WatchCallback } from "vue";
import { deepEqual } from "fast-equals";
import { clone } from "remeda";

/**
 * Automatically executes API calls when reactive dependencies change.
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
