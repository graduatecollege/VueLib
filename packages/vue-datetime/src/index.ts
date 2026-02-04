/**
 * @illinois-grad/vue-datetime
 * 
 * Vue 3 datetime formatting utilities for Graduate College applications.
 * 
 * This package provides:
 * - Flexible date formatting with multiple options
 * - Timezone-aware formatting (UTC to local conversion)
 * - Year-aware formatting (omits current year for brevity)
 * - Reactive Vue composables for automatic updates
 * - Convenient preset formatters for common formats
 */

export {
    formatDate,
    useDateFormat,
    fullDateFormat,
    useFullDateFormat,
    shortDateFormat,
    useShortDateFormat,
    fullDateTimeFormat,
    useFullDateTimeFormat,
    shortDateTimeFormat,
    useShortDateTimeFormat,
    type DateFormatOptions
} from './dateFormat.ts';
