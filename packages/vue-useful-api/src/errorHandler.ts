import type { ComponentPublicInstance } from "vue";

/**
 * Configuration options for the ErrorHandler
 */
export interface ErrorHandlerConfig {
    /**
     * The endpoint URL to send error reports to
     */
    endpoint: string;
    /**
     * An identifier for the application/agent sending the error
     */
    agent: string;
    /**
     * Whether to also log errors to the console (default: true)
     */
    logToConsole?: boolean;
}

/**
 * Global error handler utility for Vue applications.
 * Provides handlers for Vue errors, window errors, and generic error reporting.
 *
 * @example
 * ```typescript
 * const errorHandler = new ErrorHandler({
 *   endpoint: 'https://api.example.com/errors',
 *   agent: 'my-app',
 *   logToConsole: true
 * });
 *
 * // Use with Vue
 * app.config.errorHandler = errorHandler.vueHandler;
 *
 * // Use with window.onerror
 * window.onerror = errorHandler.windowErrorHandler;
 *
 * // Report errors manually
 * errorHandler.reportError(new Error('Something went wrong'));
 * ```
 */
export class ErrorHandler {
    private readonly endpoint: string;
    private readonly agent: string;
    private readonly logToConsole: boolean;

    constructor(config: ErrorHandlerConfig) {
        this.endpoint = config.endpoint;
        this.agent = config.agent;
        this.logToConsole = config.logToConsole ?? true;
    }

    /**
     * Vue error handler that can be assigned to app.config.errorHandler.
     * Captures and reports errors from Vue components.
     *
     * @param err - The error that occurred
     * @param instance - The component instance where the error occurred
     * @param info - Information about where the error was captured (e.g., 'render', 'setup')
     */
    readonly vueHandler = (err: unknown, instance: ComponentPublicInstance | null, info: string) => {
        let errorType: string;
        let message: string;
        let stack: string | undefined;

        if (err instanceof Error) {
            errorType = err.name;
            message = err.message;
            stack = err.stack;
        } else if (err instanceof Object && "name" in err && typeof err.name === "string") {
            errorType = err.name;
            if ("message" in err && typeof err.message === "string") {
                message = err.message;
            } else {
                message = err.toString();
            }
            if ("stack" in err && typeof err.stack === "string") {
                stack = err.stack;
            }
        } else if (typeof err === "string") {
            errorType = "string";
            message = err;
            stack = undefined;
        } else {
            errorType = "unknown";
            message = err?.toString() || typeof err || "unknown";
            stack = undefined;
        }

        this.sendError(errorType, message, stack, { instance, info });
    };

    /**
     * Window error handler that can be assigned to window.onerror.
     * Captures and reports unhandled JavaScript errors.
     *
     * @param message - Error message
     * @param source - URL of the script where the error occurred
     * @param lineno - Line number where the error occurred
     * @param colno - Column number where the error occurred
     * @param error - The Error object (if available)
     * @returns false to prevent default browser error handling
     */
    readonly windowErrorHandler = (
        message: string | Event,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error,
    ): boolean => {
        let errorType: string;
        let errorMessage: string;
        let stack: string | undefined;

        if (error instanceof Error) {
            errorType = error.name;
            errorMessage = error.message;
            stack = error.stack;
        } else if (typeof message === "string") {
            errorType = "Error";
            errorMessage = message;
            stack = undefined;
        } else {
            errorType = "Event";
            errorMessage = message.toString();
            stack = undefined;
        }

        this.sendError(errorType, errorMessage, stack, {
            source,
            lineno,
            colno,
        });

        return false;
    };

    /**
     * Generic error reporting method for manually reporting errors from application code.
     * Can be used to report any error, including custom error conditions.
     *
     * @param error - The error to report (Error object, string, or any other value)
     * @param context - Optional additional context to include with the error report
     *
     * @example
     * ```typescript
     * try {
     *   // some code
     * } catch (err) {
     *   errorHandler.reportError(err, { userId: '123', action: 'saveData' });
     * }
     * ```
     */
    reportError(error: unknown, context?: Record<string, unknown>): void {
        let errorType: string;
        let message: string;
        let stack: string | undefined;

        if (error instanceof Error) {
            errorType = error.name;
            message = error.message;
            stack = error.stack;
        } else if (error instanceof Object && "name" in error && typeof error.name === "string") {
            errorType = error.name;
            if ("message" in error && typeof error.message === "string") {
                message = error.message;
            } else {
                message = error.toString();
            }
            if ("stack" in error && typeof error.stack === "string") {
                stack = error.stack;
            }
        } else if (typeof error === "string") {
            errorType = "string";
            message = error;
            stack = undefined;
        } else {
            errorType = "unknown";
            message = error?.toString() || typeof error || "unknown";
            stack = undefined;
        }

        this.sendError(errorType, message, stack, context);
    }

    /**
     * Internal method to send error reports to the configured endpoint.
     *
     * @param errorType - Type/name of the error
     * @param message - Error message
     * @param stack - Stack trace (if available)
     * @param context - Additional context information
     */
    private sendError(
        errorType: string,
        message: string,
        stack?: string,
        context: Record<string, unknown> = {},
    ): void {
        if (this.logToConsole) {
            console.error(`[${this.agent}] ${errorType}: ${message}`, {
                stack,
                context,
            });
        }

        fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                errorType,
                message,
                stack,
                agent: this.agent,
                context,
            }),
            keepalive: true,
        }).catch((err) => {
            console.error("Error sending error report:", err);
        });
    }
}
