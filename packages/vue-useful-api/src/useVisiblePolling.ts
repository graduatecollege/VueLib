import { watch } from 'vue';
import { useDocumentVisibility, useIntervalFn } from '@vueuse/core';

/**
 * Calls `fn` every `intervalMs` while the tab is visible. Polling pauses while the tab is hidden
 * and catches up with an immediate call when it becomes visible again.
 * Callbacks are not awaited; guard against overlapping requests when needed.
 *
 * Stops when the calling component or effect scope is disposed. Does nothing during SSR.
 */
export function useVisiblePolling(fn: () => unknown, intervalMs: number) {
    if (typeof document === 'undefined') {
        return;
    }

    const visibility = useDocumentVisibility();
    const { pause, resume } = useIntervalFn(fn, intervalMs, { immediate: visibility.value === 'visible' });

    watch(visibility, (state) => {
        if (state === 'visible') {
            resume();
            fn();
        } else {
            pause();
        }
    });
}
