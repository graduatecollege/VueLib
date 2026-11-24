import { nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';

import { apiWatch } from './apiWatch.ts';

describe('apiWatch', () => {
    it('calls exec immediately with the initial args', () => {
        const exec = vi.fn().mockResolvedValue(undefined);

        apiWatch(exec, () => [1] as [number]);

        expect(exec).toHaveBeenCalledOnce();
        expect(exec).toHaveBeenCalledWith(1);
    });

    it('does not call exec when the watcher returns undefined', () => {
        const exec = vi.fn().mockResolvedValue(undefined);

        apiWatch(exec, () => undefined);

        expect(exec).not.toHaveBeenCalled();
    });

    it('re-executes when reactive args change', async () => {
        const exec = vi.fn().mockResolvedValue(undefined);
        const id = ref(1);

        apiWatch(exec, () => [id.value] as [number]);
        expect(exec).toHaveBeenCalledTimes(1);
        expect(exec).toHaveBeenLastCalledWith(1);

        id.value = 2;
        await nextTick();

        expect(exec).toHaveBeenCalledTimes(2);
        expect(exec).toHaveBeenLastCalledWith(2);
    });

    it('does not re-execute when the watcher returns deeply equal args', async () => {
        const exec = vi.fn().mockResolvedValue(undefined);
        const trigger = ref(0);

        // The watcher always returns the same deeply-equal args regardless of trigger
        apiWatch(exec, () => (trigger.value >= 0 ? [{ id: 1 }] : undefined) as any);
        expect(exec).toHaveBeenCalledTimes(1);

        trigger.value += 1;
        await nextTick();

        // Args are deeply equal to the previous call – exec should not run again
        expect(exec).toHaveBeenCalledTimes(1);
    });

    it('re-executes with multiple arguments when they change', async () => {
        const exec = vi.fn().mockResolvedValue(undefined);
        const a = ref('foo');
        const b = ref(10);

        apiWatch(exec, () => [a.value, b.value] as [string, number]);
        expect(exec).toHaveBeenCalledWith('foo', 10);

        a.value = 'bar';
        await nextTick();

        expect(exec).toHaveBeenCalledWith('bar', 10);
    });

    it('compares typed array arguments by their elements, not by their buffer offset', async () => {
        const exec = vi.fn<(bytes: Uint8Array) => Promise<void>>().mockResolvedValue(undefined);
        const bytes = ref(new Uint8Array([0, 1, 2]).subarray(1));

        apiWatch(exec, () => [bytes.value]);
        expect(exec).toHaveBeenCalledOnce();

        bytes.value = new Uint8Array([1, 2]);
        await nextTick();
        expect(exec).toHaveBeenCalledOnce();

        bytes.value = new Uint8Array([1, 3]);
        await nextTick();
        expect(exec).toHaveBeenCalledTimes(2);
        expect(exec).toHaveBeenLastCalledWith(bytes.value);
    });
});
