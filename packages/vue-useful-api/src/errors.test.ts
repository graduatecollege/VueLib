import { describe, expect, it } from 'vitest';

import {
    ApiError,
    getApiErrorMessage,
    isApiErrorResponse,
    isErrorResponseObject,
    type ErrorResponse,
    type ErrorResponseObject,
} from './errors.ts';

describe('isApiErrorResponse', () => {
    it('returns true for a valid ErrorResponse object', () => {
        const err: ErrorResponse = { statusCode: 404, errors: ['not found'], message: 'Not Found' };
        expect(isApiErrorResponse(err)).toBe(true);
    });

    it('returns false for an object missing statusCode', () => {
        expect(isApiErrorResponse({ errors: [], message: 'oops' })).toBe(false);
    });

    it('returns false for an object missing errors', () => {
        expect(isApiErrorResponse({ statusCode: 500, message: 'oops' })).toBe(false);
    });

    it('returns false for an object missing message', () => {
        expect(isApiErrorResponse({ statusCode: 500, errors: [] })).toBe(false);
    });

    it('returns false for null', () => {
        expect(isApiErrorResponse(null)).toBe(false);
    });

    it('returns false for a string', () => {
        expect(isApiErrorResponse('error')).toBe(false);
    });

    it('returns false for a plain Error instance', () => {
        expect(isApiErrorResponse(new Error('oops'))).toBe(false);
    });
});

describe('isErrorResponseObject', () => {
    it('returns true for a valid ErrorResponseObject', () => {
        const err: ErrorResponseObject = { error: 'Not Found', message: 'Resource not found' };
        expect(isErrorResponseObject(err)).toBe(true);
    });

    it('returns false for an object missing the error field', () => {
        expect(isErrorResponseObject({ message: 'oops' })).toBe(false);
    });

    it('returns false for an object missing the message field', () => {
        expect(isErrorResponseObject({ error: 'Bad Request' })).toBe(false);
    });

    it('returns false for null', () => {
        expect(isErrorResponseObject(null)).toBe(false);
    });

    it('returns false for a string', () => {
        expect(isErrorResponseObject('error')).toBe(false);
    });
});

describe('ApiError', () => {
    it('sets the name to "ApiError"', () => {
        const err = new ApiError('Something went wrong');
        expect(err.name).toBe('ApiError');
    });

    it('sets the message', () => {
        const err = new ApiError('Something went wrong');
        expect(err.message).toBe('Something went wrong');
    });

    it('defaults statusCode to 500', () => {
        const err = new ApiError('Oops');
        expect(err.statusCode).toBe(500);
    });

    it('accepts a custom statusCode', () => {
        const err = new ApiError('Not found', 404);
        expect(err.statusCode).toBe(404);
    });

    it('accepts a context value', () => {
        const err = new ApiError('Oops', 500, { detail: 'extra info' });
        expect(err.context).toEqual({ detail: 'extra info' });
    });

    it('is an instance of Error', () => {
        const err = new ApiError('Oops');
        expect(err).toBeInstanceOf(Error);
    });
});

describe('getApiErrorMessage', () => {
    describe('ApiError', () => {
        it('returns the string context directly', () => {
            const err = new ApiError('Oops', 500, 'Custom context message');
            expect(getApiErrorMessage(err)).toBe('Custom context message');
        });

        it('returns context.message when context is an object with a message field', () => {
            const err = new ApiError('Oops', 400, { message: 'Object context message' });
            expect(getApiErrorMessage(err)).toBe('Object context message');
        });

        it.each([
            { statusCode: 400, expected: 'Bad request. Contact the Graduate College.' },
            { statusCode: 401, expected: 'Unauthorized. Please log in and try again.' },
            { statusCode: 403, expected: 'Forbidden. You do not have permission to perform this action.' },
            { statusCode: 404, expected: 'Not found. The requested resource could not be found.' },
            { statusCode: 500, expected: 'Internal server error. Contact the Graduate College.' },
            { statusCode: 418, expected: 'Error 418: Contact the Graduate College.' },
        ])('maps ApiError statusCode $statusCode -> "$expected"', ({ statusCode, expected }) => {
            const err = new ApiError('error', statusCode);
            expect(getApiErrorMessage(err)).toBe(expected);
        });
    });

    describe('ErrorResponse', () => {
        it.each([
            { statusCode: 400, expected: 'Bad request. Contact the Graduate College.' },
            { statusCode: 401, expected: 'Unauthorized. Please log in and try again.' },
            { statusCode: 403, expected: 'Forbidden. You do not have permission to perform this action.' },
            { statusCode: 404, expected: 'Not found. The requested resource could not be found.' },
            { statusCode: 500, expected: 'Internal server error. Contact the Graduate College.' },
        ])('maps statusCode $statusCode -> "$expected"', ({ statusCode, expected }) => {
            const err: ErrorResponse = { statusCode, errors: [], message: 'error' };
            expect(getApiErrorMessage(err)).toBe(expected);
        });
    });

    describe('ErrorResponseObject', () => {
        it.each([
            { error: 'Bad Request', expected: 'Bad request. Contact the Graduate College.' },
            { error: 'Unauthorized', expected: 'Unauthorized. Please log in and try again.' },
            { error: 'Forbidden', expected: 'Forbidden. You do not have permission to perform this action.' },
            { error: 'Not Found', expected: 'Not found. The requested resource could not be found.' },
            { error: 'Internal Server Error', expected: 'Internal server error. Contact the Graduate College.' },
        ])('maps error "$error" -> "$expected"', ({ error, expected }) => {
            const err: ErrorResponseObject = { error, message: 'error' };
            expect(getApiErrorMessage(err)).toBe(expected);
        });
    });

    describe('plain statusCode object', () => {
        it('maps a plain statusCode object to the correct message', () => {
            expect(getApiErrorMessage({ statusCode: 404 })).toBe(
                'Not found. The requested resource could not be found.',
            );
        });
    });

    describe('TypeError (network error)', () => {
        it('returns a network error message for a TypeError', () => {
            const err = new TypeError('Failed to fetch');
            expect(getApiErrorMessage(err)).toBe(
                'A network error occurred. Please check your internet connection and try again.',
            );
        });
    });

    describe('unknown error', () => {
        it('returns an unknown error message for an unrecognised error', () => {
            expect(getApiErrorMessage({ some: 'random object' })).toBe(
                'Unknown error, contact the Graduate College.',
            );
        });

        it('returns an unknown error message for a string', () => {
            expect(getApiErrorMessage('some string error')).toBe(
                'Unknown error, contact the Graduate College.',
            );
        });
    });
});
