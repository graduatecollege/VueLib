# vue-datetime

Full d.ts definition:

```typescript
import { ComputedRef } from 'vue';
import { MaybeRefOrGetter } from 'vue';

/**
 * Options for date formatting
 */
export declare interface DateFormatOptions {
    /**
     * Include time in the output
     * @default false
     */
    includeTime?: boolean;
    /**
     * Use short format (M/D instead of full month name)
     * @default false
     */
    shortFormat?: boolean;
    /**
     * Omit year if it's the current year (only applies to short format)
     * @default true
     */
    yearAware?: boolean;
    /**
     * Text to display for null/undefined values
     * @default "None"
     */
    nullText?: string;
    /**
     * Text to display for invalid dates
     * @default "Invalid Date"
     */
    invalidText?: string;
}

/**
 * Formats a date with the given options.
 *
 * @param date - Date to format (string, Date, or null/undefined)
 * @param options - Formatting options
 * @returns Formatted date string
 *
 * @example
 * \`\`\`typescript
 * formatDate('2024-01-15T10:30:00Z')                          // "Jan 15, 2024"
 * formatDate('2024-01-15T10:30:00Z', { includeTime: true })   // "Jan 15, 2024 10:30 AM"
 * formatDate('2024-01-15T10:30:00Z', { shortFormat: true })   // "1/15" (if current year)
 * formatDate('2023-01-15T10:30:00Z', { shortFormat: true })   // "1/15/2023"
 * formatDate(null)                                            // "None"
 * formatDate('invalid', { invalidText: 'N/A' })               // "N/A"
 * \`\`\`
 */
export declare function formatDate(date: string | Date | undefined | null, options?: DateFormatOptions): string;

/**
 * Formats a date in full format (e.g., "Jan 15, 2024")
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export declare function fullDateFormat(date: string | Date | undefined | null): string;

/**
 * Formats a date with time in full format (e.g., "Jan 15, 2024 10:30 AM")
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export declare function fullDateTimeFormat(date: string | Date | undefined | null): string;

/**
 * Formats a date in short format (e.g., "1/15" or "1/15/2024")
 * Year is omitted if it's the current year.
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export declare function shortDateFormat(date: string | Date | undefined | null): string;

/**
 * Formats a date with time in short format (e.g., "1/15 10:30 AM" or "1/15/2024 10:30 AM")
 * Year is omitted if it's the current year.
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export declare function shortDateTimeFormat(date: string | Date | undefined | null): string;

/**
 * Vue composable for reactive date formatting.
 *
 * @param date - Reactive or static date value
 * @param options - Formatting options
 * @returns Computed ref with formatted date
 *
 * @example
 * \`\`\`typescript
 * const date = ref('2024-01-15T10:30:00Z')
 * const formatted = useDateFormat(date, { includeTime: true })
 * console.log(formatted.value) // "Jan 15, 2024 10:30 AM"
 * \`\`\`
 */
export declare function useDateFormat(date: MaybeRefOrGetter<string | Date | undefined | null>, options?: DateFormatOptions): ComputedRef<string>;

/**
 * Vue composable for full date formatting (e.g., "Jan 15, 2024")
 *
 * @param date - Reactive or static date value
 * @returns Computed ref with formatted date
 */
export declare function useFullDateFormat(date: MaybeRefOrGetter<string | Date | undefined | null>): ComputedRef<string>;

/**
 * Vue composable for full date and time formatting (e.g., "Jan 15, 2024 10:30 AM")
 *
 * @param date - Reactive or static date value
 * @returns Computed ref with formatted date
 */
export declare function useFullDateTimeFormat(date: MaybeRefOrGetter<string | Date | undefined | null>): ComputedRef<string>;

/**
 * Vue composable for short date formatting (e.g., "1/15" or "1/15/2024")
 *
 * @param date - Reactive or static date value
 * @returns Computed ref with formatted date
 */
export declare function useShortDateFormat(date: MaybeRefOrGetter<string | Date | undefined | null>): ComputedRef<string>;

/**
 * Vue composable for short date and time formatting (e.g., "1/15 10:30 AM" or "1/15/2024 10:30 AM")
 *
 * @param date - Reactive or static date value
 * @returns Computed ref with formatted date
 */
export declare function useShortDateTimeFormat(date: MaybeRefOrGetter<string | Date | undefined | null>): ComputedRef<string>;

export { }

```
