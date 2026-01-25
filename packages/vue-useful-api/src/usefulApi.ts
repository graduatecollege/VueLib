import { createEventHook, EventHookOn } from "@vueuse/core";
import { readonly, Ref, ref, shallowRef } from "vue";

/**
 * Type for the return value of a usefulApi wrapper, following the Vue.js 3 Composition API pattern.
 */
export interface UsefulApiProperties<R, A extends any[], T extends (...args: A) => Promise<R>> {
    /**
     * The execute function that triggers the API call.
     * @param args - Arguments for the API call
     */
    execute: (...args: A) => Promise<void>;
    /**
     * Event hook for handling successful API calls.
     */
    onSuccess: (fn: (result: R, args: A) => any) => void;
    /**
     * Event hook for handling errors.
     */
    onError: EventHookOn<Error>;
    /**
     * Event hook called after the API call is finished, regardless of success or failure.
     */
    onFinally: EventHookOn<void>;
    /**
     * A reactive reference indicating whether the API call has finished.
     */
    isFinished: Ref<boolean>;
    /**
     * A reactive reference indicating whether the API call is currently in progress.
     */
    isLoading: Ref<boolean>;
    /**
     * A reactive reference containing the API response.
     */
    response: Ref<R | undefined>;
    /**
     * A reactive reference containing any error that occurred during the API call.
     */
    error: Ref<unknown>;

    /**
     * Executes the API call directly without any reactivity.
     */
    executeDirect: (...args: A) => Promise<R>;
}

/**
 * Maps all async methods of a type to UsefulApiProperties
 */
export type UsefulApi<Type> = {
    [Property in keyof Type]: Type[Property] extends (...args: infer A) => Promise<infer R>
        ? () => UsefulApiProperties<R, A, Type[Property]>
        : never;
};

/**
 * A utility function that wraps an API call in a structure that provides loading, error, and response states.
 *
 * This function is designed to be used with Vue.js 3 and the Composition API. It provides:
 * - Reactive loading/error/response state management
 * - Event hooks (onSuccess, onError, onFinally)
 * - Request deduplication (ignores stale responses)
 * - Direct execution without reactivity
 *
 * @param fn - The API function to wrap.
 * @returns A function that returns an object containing the execute function and state properties.
 *
 * @example
 * ```typescript
 * const api = {
 *   async getUser(id: string) {
 *     const response = await fetch(`/api/users/${id}`)
 *     return response.json()
 *   }
 * }
 *
 * const getUser = usefulApi(api.getUser.bind(api))
 * const user = getUser()
 *
 * // Execute the API call
 * await user.execute('123')
 *
 * // Access reactive state
 * console.log(user.isLoading.value) // false
 * console.log(user.response.value)  // { id: '123', name: 'John' }
 *
 * // Handle success
 * user.onSuccess((result, args) => {
 *   console.log('User loaded:', result)
 * })
 * ```
 */
export function usefulApi<R, A extends any[], T extends (...args: A) => Promise<R>>(fn: T) {
    return () => {
        let executeCounter = 0;

        // Event hooks that may sometimes be needed, but mostly the state value should
        // be preferred.
        const apiError = createEventHook<Error>();
        const apiFinally = createEventHook<any>();
        const apiSuccess = createEventHook<{ result: R; args: A }>();

        const isFinished = ref(false);
        const isLoading = ref(false);

        // The actual API response as a reactive reference.
        const response = shallowRef<R | undefined>(undefined);

        // The error object as a reactive reference.
        const error = shallowRef<any>(undefined);

        const loading = (state: boolean) => {
            isLoading.value = state;
            isFinished.value = !state;
        };

        // The execute function that users of the API can call to trigger the API request.
        const execute = async (...args: A) => {
            executeCounter += 1;
            const currentExecuteCounter = executeCounter;
            loading(true);
            error.value = undefined;
            const originalArgs = [...args] as A;

            fn(...args)
                .then(async (res) => {
                    if (currentExecuteCounter !== executeCounter) {
                        // If the execute counter has changed, we ignore this response.
                        return;
                    }
                    response.value = res;

                    // @ts-ignore Bad type inference from vueuse
                    apiSuccess.trigger({ result: res, args: originalArgs });
                    return res;
                })
                .catch(async (err) => {
                    console.error(err);
                    apiError.trigger(err);
                    error.value = err;
                    return err;
                })
                .finally(() => {
                    if (currentExecuteCounter === executeCounter) {
                        loading(false);
                    }
                    apiFinally.trigger(undefined);
                });
        };

        // Call directly without reactivity
        const executeDirect = async (...args: A) => {
            return await fn(...args);
        };

        const properties: UsefulApiProperties<R, A, T> = {
            execute,
            onError: apiError.on,
            onFinally: apiFinally.on,
            onSuccess: ((fn: (result: R, args: A) => any) => {
                return apiSuccess.on((payload) => fn(payload.result, payload.args));
            }),
            isFinished: readonly(isFinished),
            isLoading: readonly(isLoading),
            response,
            error,
            executeDirect,
        };
        return properties;
    };
}

/**
 * Applies the usefulApi wrapper to all methods of the given API instance.
 * 
 * This function automatically wraps all methods of an API class, making them reactive
 * with loading states, error handling, and event hooks.
 * 
 * @param apiInstance - API class instance
 * @returns UsefulApi-wrapped API instance
 *
 * @example
 * ```typescript
 * class UserApi {
 *   async getUser(id: string) {
 *     const response = await fetch(`/api/users/${id}`)
 *     return response.json()
 *   }
 *   
 *   async updateUser(id: string, data: any) {
 *     const response = await fetch(`/api/users/${id}`, {
 *       method: 'PUT',
 *       body: JSON.stringify(data)
 *     })
 *     return response.json()
 *   }
 * }
 *
 * const api = new UserApi()
 * const usefulUserApi = applyUsefulApi(api)
 *
 * // Now all methods are wrapped
 * const getUser = usefulUserApi.getUser()
 * await getUser.execute('123')
 * console.log(getUser.response.value)
 * ```
 */
export function applyUsefulApi<T extends object>(apiInstance: T): UsefulApi<T> {
    const proto = Object.getPrototypeOf(apiInstance);
    const methodNames = Object.getOwnPropertyNames(proto).filter((name) => {
        return name !== "constructor" && typeof (proto as any)[name] === "function";
    });

    const api: any = {};
    for (const methodName of methodNames) {
        const method = (apiInstance as any)[methodName];
        api[methodName] = usefulApi(method.bind(apiInstance));
    }

    return api as UsefulApi<T>;
}

/**
 * A utility type for the return value of a UsefulApi method.
 */
export type UsefulApiMethod<
    T extends object,
    K extends keyof T,
> = T[K] extends (...args: infer A) => Promise<infer R>
    ? UsefulApiProperties<R, A, T[K]>
    : never;
