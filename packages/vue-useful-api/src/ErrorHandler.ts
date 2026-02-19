import type { App, ComponentPublicInstance } from "vue";

export class ErrorHandler {
    constructor(
        private readonly endpoint: string,
        private readonly agent: string,
    ) {}

    /**
     * Register global error handlers for Vue and browser events.
     * @param app Vue application instance
     * @param global Set to true to also register window.onerror and window.onunhandledrejection
     */
    readonly register = (app: App, global: boolean = true) => {
        app.config.errorHandler = this.vueHandler;
        if (global && typeof window !== "undefined") {
            window.addEventListener("error", this.jsHandler);
            window.addEventListener("unhandledrejection", this.unhandledRejectionHandler);
        }
    };

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

    readonly jsHandler = (event: ErrorEvent) => {
        this.sendError(event.error?.name || "Error", event.message, event.error?.stack, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });
    };

    readonly unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
        const reason = event.reason;
        let errorType: string;
        let message: string;
        let stack: string | undefined;

        if (reason instanceof Error) {
            errorType = reason.name;
            message = reason.message;
            stack = reason.stack;
        } else {
            errorType = "unhandledrejection";
            message = reason?.toString() || typeof reason || "unknown";
        }

        this.sendError(errorType, message, stack, { promise: "unhandledrejection" });
    };

    private sendError(errorType: string, message: string, stack?: string, context: Record<string, unknown> = {}) {
        const payload = {
            errorType,
            message,
            stack,
            agent: this.agent,
            url: typeof window !== "undefined" ? window.location.href : undefined,
            timestamp: new Date().toISOString(),
            context,
        };

        fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
        }).catch((err) => {
            console.error("Error sending error report:", err);
        });
    }
}
