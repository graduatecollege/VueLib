/**
 * @graduatecollege/vue-useful-api
 * 
 * Vue 3 API integration utilities with reactive state management for Graduate College applications.
 * 
 * This package provides:
 * - usefulApi: Wraps API calls with reactive loading/error/response states
 * - applyUsefulApi: Applies usefulApi to all methods of an API class
 * - apiWatch: Automatically executes API calls when reactive dependencies change
 * - Error handling utilities with user-friendly messages
 */

export {
    usefulApi,
    applyUsefulApi,
    type UsefulApi,
    type UsefulApiProperties,
    type UsefulApiMethod
} from './usefulApi.ts';

export { apiWatch } from './apiWatch.ts';

export {
    getApiErrorMessage,
    isApiErrorResponse,
    isErrorResponseObject,
    ApiError,
    type ErrorResponse,
    type ErrorResponseObject
} from './errors.ts';
