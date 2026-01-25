/**
 * Standard error response interface for API errors
 */
export interface ErrorResponse {
    statusCode: number;
    errors: string[];
    message: string;
}

/**
 * Alternative error response format
 */
export interface ErrorResponseObject {
    error: string;
    message: string;
}

/**
 * Type guard to check if an error is an ErrorResponse
 * 
 * @param error - Unknown error object
 * @returns True if error is an ErrorResponse
 */
export function isApiErrorResponse(error: unknown): error is ErrorResponse {
    return (
        error !== null &&
        typeof error === "object" &&
        "statusCode" in error &&
        "errors" in error &&
        "message" in error
    );
}

/**
 * Type guard to check if an error is an ErrorResponseObject
 * 
 * @param error - Unknown error object
 * @returns True if error is an ErrorResponseObject
 */
export function isErrorResponseObject(error: unknown): error is ErrorResponseObject {
    return (
        error !== null &&
        typeof error === "object" &&
        "error" in error &&
        "message" in error
    );
}

/**
 * Extracts a user-friendly error message from an API error.
 * 
 * This function handles various error formats and provides consistent,
 * user-friendly error messages based on HTTP status codes.
 * 
 * @param error - The error to extract a message from
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * try {
 *   await api.getUser('123')
 * } catch (error) {
 *   const message = getApiErrorMessage(error)
 *   console.error(message) // "Not found. The requested resource could not be found."
 * }
 * ```
 */
export function getApiErrorMessage(error: unknown): string {
    console.log("getApiErrorMessage:", error);
    let statusCode = 0;
    if (isApiErrorResponse(error)) {
        statusCode = error.statusCode;
    } else if (isErrorResponseObject(error)) {
        switch (error.error) {
            case "Bad Request":
                statusCode = 400;
                break;
            case "Unauthorized":
                statusCode = 401;
                break;
            case "Forbidden":
                statusCode = 403;
                break;
            case "Not Found":
                statusCode = 404;
                break;
            case "Internal Server Error":
                statusCode = 500;
                break;
        }
    }

    if (statusCode !== 0) {
        switch (statusCode) {
            case 400:
                return "Bad request. Contact the Graduate College.";
            case 401:
                return "Unauthorized. Please log in and try again.";
            case 403:
                return "Forbidden. You do not have permission to perform this action.";
            case 404:
                return "Not found. The requested resource could not be found.";
            case 500:
                return "Internal server error. Contact the Graduate College.";
            default:
                return `Error ${statusCode}: Contact the Graduate College.`;
        }
    }

    if (error instanceof Error && error.name === "TypeError") {
        return "A network error occurred. Please check your internet connection and try again.";
    }

    return "Unknown error, contact the Graduate College.";
}

/**
 * Custom error class with additional context
 * 
 * @example
 * ```typescript
 * throw new ApiError("Failed to save record", 500, "abc123")
 * ```
 */
export class ApiError extends Error {
    statusCode: number;
    context: any;

    constructor(message: string, statusCode: number = 500, context?: any) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.context = context;
    }
}
