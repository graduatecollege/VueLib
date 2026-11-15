// @vitest-environment jsdom
import { effectScope, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useVisiblePolling } from './useVisiblePolling.ts';
import { usefulApi } from './usefulApi.ts';

function setVisibility(state: DocumentVisibilityState) {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
    document.dispatchEvent(new Event('visibilitychange'));
}

describe('useVisiblePolling', () => {
    let scope: ReturnType<typeof effectScope>;

    beforeEach(() => {
        vi.useFakeTimers();
        setVisibility('visible');
        scope = effectScope();
    });

    afterEach(() => {
        scope.stop();
        vi.useRealTimers();
    });

    it('calls fn on every interval while visible', () => {
        const fn = vi.fn();
        scope.run(() => useVisiblePolling(fn, 1000));

        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(3000);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('pauses while hidden and calls fn immediately when visible again', async () => {
        const fn = vi.fn();
        scope.run(() => useVisiblePolling(fn, 1000));

        setVisibility('hidden');
        await nextTick();
        vi.advanceTimersByTime(5000);
        expect(fn).not.toHaveBeenCalled();

        setVisibility('visible');
        await nextTick();
        expect(fn).toHaveBeenCalledOnce();

        vi.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not start polling while initially hidden', () => {
        setVisibility('hidden');
        const fn = vi.fn();
        scope.run(() => useVisiblePolling(fn, 1000));

        vi.advanceTimersByTime(5000);
        expect(fn).not.toHaveBeenCalled();
    });

    it('stops when the scope is disposed', () => {
        const fn = vi.fn();
        scope.run(() => useVisiblePolling(fn, 1000));

        scope.stop();
        vi.advanceTimersByTime(5000);
        expect(fn).not.toHaveBeenCalled();
    });

    it('does not restart polling when the visibility callback disposes its scope', async () => {
        setVisibility('hidden');
        const fn = vi.fn(() => scope.stop());
        scope.run(() => useVisiblePolling(fn, 1000));
        await nextTick();

        setVisibility('visible');
        await nextTick();
        expect(fn).toHaveBeenCalledOnce();

        vi.advanceTimersByTime(5000);
        expect(fn).toHaveBeenCalledOnce();
    });

    it('allows guarded usefulApi requests slower than the interval to finish', async () => {
        const fetchComments = vi.fn(() => new Promise<string>((resolve) => {
            setTimeout(() => resolve('comments'), 6000);
        }));
        const comments = usefulApi(fetchComments)();
        scope.run(() => useVisiblePolling(() => {
            if (!comments.isLoading.value) {
                comments.execute();
            }
        }, 5000));

        await vi.advanceTimersByTimeAsync(10000);
        expect(fetchComments).toHaveBeenCalledOnce();
        expect(comments.response.value).toBeUndefined();
        expect(comments.isLoading.value).toBe(true);

        setVisibility('hidden');
        await nextTick();
        setVisibility('visible');
        await nextTick();
        expect(fetchComments).toHaveBeenCalledOnce();

        await vi.advanceTimersByTimeAsync(1000);
        expect(comments.response.value).toBe('comments');
        expect(comments.isLoading.value).toBe(false);

        await vi.advanceTimersByTimeAsync(4000);
        expect(fetchComments).toHaveBeenCalledTimes(2);
        expect(comments.isLoading.value).toBe(true);

        await vi.advanceTimersByTimeAsync(6000);
        expect(fetchComments).toHaveBeenCalledTimes(2);
        expect(comments.isLoading.value).toBe(false);
    });
});
