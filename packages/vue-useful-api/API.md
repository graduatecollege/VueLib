# vue-useful-api

Full d.ts definition:

```typescript
import { App } from 'vue';
import { ComponentPublicInstance } from 'vue';
import { EventHookOn } from '@vueuse/core';
import { Ref } from 'vue';
import { WatchDebouncedOptions } from '@vueuse/core';

/**
 * Custom error class with additional context
 *
 * @example
 * \`\`\`typescript
 * throw new ApiError("Failed to save record", 500, "abc123")
 * \`\`\`
 */
export declare class ApiError extends Error {
    statusCode: number;
    context: any;
    constructor(message: string, statusCode?: number, context?: any);
}

/**
 * Automatically executes API calls when reactive dependencies change.
 */
export declare function apiWatch<Exec extends (arg?: any, arg2?: any, arg3?: any) => Promise<void>>(exec: Exec, watcher: () => Parameters<Exec> | undefined, options?: WatchDebouncedOptions<true>): void;

/**
 * Applies the usefulApi wrapper to all methods of the given API instance.
 *
 * This function automatically wraps all methods of an API class, making them reactive
 * with loading states, error handling, and event hooks.
 */
export declare function applyUsefulApi<T extends object>(apiInstance: T): UsefulApi<T>;

export declare class ErrorHandler {
    private readonly endpoint;
    private readonly agent;
    constructor(endpoint: string, agent: string);
    /**
     * Register global error handlers for Vue and browser events.
     * @param app Vue application instance
     * @param global Set to true to also register window.onerror and window.onunhandledrejection
     */
    readonly register: (app: App, global?: boolean) => void;
    readonly vueHandler: (err: unknown, instance: ComponentPublicInstance | null, info: string) => void;
    readonly jsHandler: (event: ErrorEvent) => void;
    readonly unhandledRejectionHandler: (event: PromiseRejectionEvent) => void;
    private sendError;
}

/**
 * Standard error response interface for API errors
 */
export declare interface ErrorResponse {
    statusCode: number;
    errors: string[];
    message: string;
}

/**
 * Alternative error response format
 */
export declare interface ErrorResponseObject {
    error: string;
    message: string;
}

/**
 * Extracts a user-friendly error message from an API error.
 *
 * This function handles various error formats and provides consistent,
 * user-friendly error messages based on HTTP status codes.
 *
 * @param error - The error to extract a message from
 * @returns User-friendly error message
 */
export declare function getApiErrorMessage(error: unknown): string;

/**
 * Type guard to check if an error is an ErrorResponse
 *
 * @param error - Unknown error object
 * @returns True if error is an ErrorResponse
 */
export declare function isApiErrorResponse(error: unknown): error is ErrorResponse;

/**
 * Type guard to check if an error is an ErrorResponseObject
 *
 * @param error - Unknown error object
 * @returns True if error is an ErrorResponseObject
 */
export declare function isErrorResponseObject(error: unknown): error is ErrorResponseObject;

/**
 * Maps all async methods of a type to UsefulApiProperties
 */
export declare type UsefulApi<Type> = {
    [Property in keyof Type]: Type[Property] extends (...args: infer A) => Promise<infer R> ? () => UsefulApiProperties<R, A, Type[Property]> : never;
};

/**
 * A utility function that wraps an API call in a structure that provides loading, error, and response states.
 *
 * This function is designed to be used with Vue.js 3 and the Composition API.
 * @param fn - The API function to wrap.
 * @returns An object containing the execute function and state properties.
 */
export declare function usefulApi<R, A extends any[], T extends (...args: A) => Promise<R>>(fn: T): () => UsefulApiProperties<R, A, T>;

/**
 * A utility type for the return value of a UsefulApi method.
 */
export declare type UsefulApiMethod<T extends object, K extends keyof T> = T[K] extends (...args: infer A) => Promise<infer R> ? UsefulApiProperties<R, A, T[K]> : never;

/**
 * Type for the return value of a usefulApi wrapper, following the Vue.js 3 Composition API pattern.
 */
export declare interface UsefulApiProperties<R, A extends any[], T extends (...args: A) => Promise<R>> {
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

export { }

```
