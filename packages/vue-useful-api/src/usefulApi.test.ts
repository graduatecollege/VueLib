import { describe, expect, it, vi } from 'vitest';

import { applyUsefulApi, usefulApi } from './usefulApi.ts';

/** Flush all pending microtasks so the inner promise chain in execute() can settle. */
const flushPromises = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('usefulApi', () => {
    describe('initial state', () => {
        it('isFinished starts as false', () => {
            const api = usefulApi(async () => 'value')();
            expect(api.isFinished.value).toBe(false);
        });

        it('isLoading starts as false', () => {
            const api = usefulApi(async () => 'value')();
            expect(api.isLoading.value).toBe(false);
        });

        it('response starts as undefined', () => {
            const api = usefulApi(async () => 'value')();
            expect(api.response.value).toBeUndefined();
        });

        it('error starts as undefined', () => {
            const api = usefulApi(async () => 'value')();
            expect(api.error.value).toBeUndefined();
        });
    });

    describe('execute – success path', () => {
        it('sets isLoading to true while the request is pending', async () => {
            let resolve!: (v: string) => void;
            const fn = vi.fn(() => new Promise<string>((r) => (resolve = r)));
            const api = usefulApi(fn)();

            api.execute();
            expect(api.isLoading.value).toBe(true);

            resolve('done');
            await flushPromises();
        });

        it('sets isLoading to false and isFinished to true after success', async () => {
            const api = usefulApi(vi.fn().mockResolvedValue('result'))();

            await api.execute();
            await flushPromises();

            expect(api.isLoading.value).toBe(false);
            expect(api.isFinished.value).toBe(true);
        });

        it('stores the resolved value in response', async () => {
            const api = usefulApi(vi.fn().mockResolvedValue({ id: 1 }))();

            await api.execute();
            await flushPromises();

            expect(api.response.value).toEqual({ id: 1 });
        });

        it('passes arguments to the wrapped function', async () => {
            const fn = vi.fn().mockResolvedValue('ok');
            const api = usefulApi(fn)();

            await api.execute('arg1', 42);
            await flushPromises();

            expect(fn).toHaveBeenCalledWith('arg1', 42);
        });

        it('clears any previous error on a new call', async () => {
            const fn = vi.fn().mockRejectedValueOnce(new Error('first')).mockResolvedValueOnce('ok');
            const api = usefulApi(fn)();

            await api.execute();
            await flushPromises();
            expect(api.error.value).toBeDefined();

            await api.execute();
            await flushPromises();
            expect(api.error.value).toBeUndefined();
        });

        it('triggers the onSuccess callback with the result and args', async () => {
            const fn = vi.fn().mockResolvedValue({ data: 'payload' });
            const api = usefulApi(fn)();
            const onSuccessCb = vi.fn();
            api.onSuccess(onSuccessCb);

            await api.execute('myArg');
            await flushPromises();

            expect(onSuccessCb).toHaveBeenCalledOnce();
            expect(onSuccessCb).toHaveBeenCalledWith({ data: 'payload' }, ['myArg']);
        });

        it('triggers the onFinally callback after a successful call', async () => {
            const api = usefulApi(vi.fn().mockResolvedValue('ok'))();
            const onFinallyCb = vi.fn();
            api.onFinally(onFinallyCb);

            await api.execute();
            await flushPromises();

            expect(onFinallyCb).toHaveBeenCalledOnce();
        });
    });

    describe('execute – error path', () => {
        it('sets error when the wrapped function rejects', async () => {
            const boom = new Error('boom');
            const api = usefulApi(vi.fn().mockRejectedValue(boom))();

            await api.execute();
            await flushPromises();

            expect(api.error.value).toBe(boom);
        });

        it('sets isLoading to false after an error', async () => {
            const api = usefulApi(vi.fn().mockRejectedValue(new Error('oops')))();

            await api.execute();
            await flushPromises();

            expect(api.isLoading.value).toBe(false);
        });

        it('triggers the onError callback with the error', async () => {
            const boom = new Error('boom');
            const api = usefulApi(vi.fn().mockRejectedValue(boom))();
            const onErrorCb = vi.fn();
            api.onError(onErrorCb);

            await api.execute();
            await flushPromises();

            expect(onErrorCb).toHaveBeenCalledWith(boom);
        });

        it('triggers the onFinally callback after an error', async () => {
            const api = usefulApi(vi.fn().mockRejectedValue(new Error('oops')))();
            const onFinallyCb = vi.fn();
            api.onFinally(onFinallyCb);

            await api.execute();
            await flushPromises();

            expect(onFinallyCb).toHaveBeenCalledOnce();
        });
    });

    describe('stale response cancellation', () => {
        it('ignores the response of a superseded call', async () => {
            let resolveFirst!: (v: string) => void;
            let resolveSecond!: (v: string) => void;

            const fn = vi.fn()
                .mockImplementationOnce(() => new Promise<string>((r) => (resolveFirst = r)))
                .mockImplementationOnce(() => new Promise<string>((r) => (resolveSecond = r)));

            const api = usefulApi(fn)();

            // Start two calls in succession without awaiting the first
            api.execute();
            api.execute();

            // Resolve in reverse order: second first, then first
            resolveSecond('second');
            await flushPromises();
            resolveFirst('first');
            await flushPromises();

            // Only the response from the second (latest) call should be stored
            expect(api.response.value).toBe('second');
        });
    });

    describe('executeDirect', () => {
        it('calls the wrapped function and returns the result directly', async () => {
            const fn = vi.fn().mockResolvedValue({ direct: true });
            const api = usefulApi(fn)();

            const result = await api.executeDirect('argA');

            expect(fn).toHaveBeenCalledWith('argA');
            expect(result).toEqual({ direct: true });
        });

        it('does not modify reactive state', async () => {
            const api = usefulApi(vi.fn().mockResolvedValue('data'))();

            await api.executeDirect();

            expect(api.isLoading.value).toBe(false);
            expect(api.isFinished.value).toBe(false);
            expect(api.response.value).toBeUndefined();
        });
    });

    describe('factory behaviour', () => {
        it('each call to the factory returns an independent instance', async () => {
            const factory = usefulApi(vi.fn().mockResolvedValue('value'));
            const a = factory();
            const b = factory();

            await a.execute();
            await flushPromises();

            expect(a.response.value).toBe('value');
            expect(b.response.value).toBeUndefined();
        });
    });
});

describe('applyUsefulApi', () => {
    it('wraps all prototype methods of the given instance', () => {
        class MyApi {
            async getUser(id: number) {
                return { id };
            }
            async createUser(name: string) {
                return { name };
            }
        }

        const wrapped = applyUsefulApi(new MyApi());

        expect(typeof wrapped.getUser).toBe('function');
        expect(typeof wrapped.createUser).toBe('function');
    });

    it('does not wrap the constructor as a method', () => {
        class MyApi {
            async fetch() {
                return 'data';
            }
        }

        const wrapped = applyUsefulApi(new MyApi());
        // The constructor must not be present as an own property on the wrapped object
        expect(Object.hasOwn(wrapped as any, 'constructor')).toBe(false);
    });

    it('each wrapped method returns a UsefulApiProperties object', () => {
        class MyApi {
            async fetch() {
                return 'data';
            }
        }

        const wrapped = applyUsefulApi(new MyApi());
        const instance = wrapped.fetch();

        expect(typeof instance.execute).toBe('function');
        expect(typeof instance.executeDirect).toBe('function');
        expect(instance.isLoading).toBeDefined();
        expect(instance.isFinished).toBeDefined();
        expect(instance.response).toBeDefined();
        expect(instance.error).toBeDefined();
    });

    it('calls the original method with the correct context', async () => {
        class MyApi {
            private prefix = 'Hello';
            async greet(name: string) {
                return `${this.prefix}, ${name}!`;
            }
        }

        const wrapped = applyUsefulApi(new MyApi());
        const instance = wrapped.greet();

        await instance.execute('World');
        await flushPromises();

        expect(instance.response.value).toBe('Hello, World!');
    });
});
