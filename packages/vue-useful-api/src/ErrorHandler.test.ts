// @vitest-environment jsdom
import { type App, type ComponentPublicInstance } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorHandler } from './ErrorHandler.ts';

describe('ErrorHandler', () => {
    let handler: ErrorHandler;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        handler = new ErrorHandler('https://example.com/errors', 'test-agent');
        fetchMock = vi.fn().mockResolvedValue({ ok: true });
        // @ts-ignore
        global.fetch = fetchMock;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Helper to extract the JSON payload sent to fetch
    const getPayload = (callIndex = 0) => JSON.parse(fetchMock.mock.calls[callIndex][1].body);

    describe('vueHandler', () => {
        it('sends a POST request to the configured endpoint', () => {
            handler.vueHandler(new Error('oops'), null, 'lifecycle hook');
            expect(fetchMock).toHaveBeenCalledOnce();
            expect(fetchMock.mock.calls[0][0]).toBe('https://example.com/errors');
            expect(fetchMock.mock.calls[0][1].method).toBe('POST');
        });

        it('includes errorType and message from an Error instance', () => {
            handler.vueHandler(new TypeError('bad value'), null, 'render');
            const payload = getPayload();
            expect(payload.errorType).toBe('TypeError');
            expect(payload.message).toBe('bad value');
        });

        it('includes the stack trace for an Error instance', () => {
            const err = new Error('with stack');
            handler.vueHandler(err, null, 'render');
            const payload = getPayload();
            expect(payload.stack).toBeDefined();
        });

        it('handles an error-like object with name and message', () => {
            const errLike = { name: 'CustomError', message: 'something failed', stack: 'trace…' };
            handler.vueHandler(errLike, null, 'setup');
            const payload = getPayload();
            expect(payload.errorType).toBe('CustomError');
            expect(payload.message).toBe('something failed');
            expect(payload.stack).toBe('trace…');
        });

        it('handles an error-like object without a message', () => {
            const errLike = { name: 'WeirdError', toString: () => 'WeirdError{}' };
            handler.vueHandler(errLike, null, 'setup');
            const payload = getPayload();
            expect(payload.errorType).toBe('WeirdError');
        });

        it('handles a string error', () => {
            handler.vueHandler('something went wrong', null, 'mounted');
            const payload = getPayload();
            expect(payload.errorType).toBe('string');
            expect(payload.message).toBe('something went wrong');
        });

        it('handles an unknown (non-object) error type', () => {
            handler.vueHandler(42, null, 'watch');
            const payload = getPayload();
            expect(payload.errorType).toBe('unknown');
        });

        it('includes the agent identifier', () => {
            handler.vueHandler(new Error('oops'), null, 'render');
            expect(getPayload().agent).toBe('test-agent');
        });

        it('includes the Vue info string in context', () => {
            handler.vueHandler(new Error('oops'), null, 'created hook');
            expect(getPayload().context.info).toBe('created hook');
        });

        it('includes a timestamp', () => {
            handler.vueHandler(new Error('oops'), null, 'render');
            const { timestamp } = getPayload();
            expect(typeof timestamp).toBe('string');
            expect(new Date(timestamp).getTime()).toBeGreaterThan(0);
        });
    });

    describe('jsHandler', () => {
        it('sends a POST request on a browser ErrorEvent', () => {
            const event = new ErrorEvent('error', {
                message: 'Script error',
                filename: 'app.js',
                lineno: 10,
                colno: 5,
                error: new Error('Script error'),
            });
            handler.jsHandler(event);
            expect(fetchMock).toHaveBeenCalledOnce();
        });

        it('includes the error message and location', () => {
            const event = new ErrorEvent('error', {
                message: 'Script error',
                filename: 'app.js',
                lineno: 10,
                colno: 5,
                error: new Error('Script error'),
            });
            handler.jsHandler(event);
            const payload = getPayload();
            expect(payload.message).toBe('Script error');
            expect(payload.context.filename).toBe('app.js');
            expect(payload.context.lineno).toBe(10);
            expect(payload.context.colno).toBe(5);
        });

        it('falls back to "Error" errorType when the event has no error object', () => {
            const event = new ErrorEvent('error', { message: 'Unknown script error' });
            handler.jsHandler(event);
            expect(getPayload().errorType).toBe('Error');
        });
    });

    describe('unhandledRejectionHandler', () => {
        it('sends a POST request for an unhandled promise rejection', () => {
            const rejectedPromise = Promise.reject(new Error('rejected'));
            rejectedPromise.catch(() => {}); // suppress unhandled rejection warning
            const event = new PromiseRejectionEvent('unhandledrejection', {
                promise: rejectedPromise,
                reason: new Error('rejected'),
            });
            handler.unhandledRejectionHandler(event);
            expect(fetchMock).toHaveBeenCalledOnce();
        });

        it('extracts errorType and message from an Error reason', () => {
            const reason = new RangeError('out of range');
            const rejectedPromise = Promise.reject(reason);
            rejectedPromise.catch(() => {}); // suppress unhandled rejection warning
            const event = new PromiseRejectionEvent('unhandledrejection', {
                promise: rejectedPromise,
                reason,
            });
            handler.unhandledRejectionHandler(event);
            const payload = getPayload();
            expect(payload.errorType).toBe('RangeError');
            expect(payload.message).toBe('out of range');
        });

        it('handles a non-Error rejection reason', () => {
            const rejectedPromise = Promise.reject('string reason');
            rejectedPromise.catch(() => {}); // suppress unhandled rejection warning
            const event = new PromiseRejectionEvent('unhandledrejection', {
                promise: rejectedPromise,
                reason: 'string reason',
            });
            handler.unhandledRejectionHandler(event);
            const payload = getPayload();
            expect(payload.errorType).toBe('unhandledrejection');
            expect(payload.message).toBe('string reason');
        });
    });

    describe('register', () => {
        it('assigns vueHandler to app.config.errorHandler', () => {
            const app = { config: {} } as App;
            handler.register(app, false);
            expect((app.config as any).errorHandler).toBe(handler.vueHandler);
        });

        it('adds window event listeners when global=true', () => {
            const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
            const app = { config: {} } as App;

            handler.register(app, true);

            const types = addEventListenerSpy.mock.calls.map((c) => c[0]);
            expect(types).toContain('error');
            expect(types).toContain('unhandledrejection');
        });

        it('does not add window event listeners when global=false', () => {
            const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
            const app = { config: {} } as App;

            handler.register(app, false);

            expect(addEventListenerSpy).not.toHaveBeenCalled();
        });
    });
});
