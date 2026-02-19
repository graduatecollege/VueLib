import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";

// Enable dayjs plugins
dayjs.extend(utc);
dayjs.extend(localizedFormat);

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
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
 * ```typescript
 * formatDate('2024-01-15T10:30:00Z')                          // "Jan 15, 2024"
 * formatDate('2024-01-15T10:30:00Z', { includeTime: true })   // "Jan 15, 2024 10:30 AM"
 * formatDate('2024-01-15T10:30:00Z', { shortFormat: true })   // "1/15" (if current year)
 * formatDate('2023-01-15T10:30:00Z', { shortFormat: true })   // "1/15/2023"
 * formatDate(null)                                            // "None"
 * formatDate('invalid', { invalidText: 'N/A' })               // "N/A"
 * ```
 */
export function formatDate(
    date: string | Date | undefined | null,
    options: DateFormatOptions = {}
): string {
    const {
        includeTime = false,
        shortFormat = false,
        yearAware = true,
        nullText = "None",
        invalidText = "Invalid Date"
    } = options;

    if (!date) {
        return nullText;
    }

    const d = dayjs.utc(date).local();
    if (!d.isValid()) {
        return invalidText;
    }

    const currentYear = dayjs().year();
    const isCurrentYear = d.year() === currentYear;

    if (shortFormat) {
        // Short format: M/D or M/D/YYYY
        if (includeTime) {
            const format = (yearAware && isCurrentYear) ? "M/D h:mm A" : "M/D/YYYY h:mm A";
            return d.format(format);
        } else {
            const format = (yearAware && isCurrentYear) ? "M/D" : "M/D/YYYY";
            return d.format(format);
        }
    } else {
        // Full format using dayjs localized formats
        if (includeTime) {
            return d.format("lll"); // "Jan 15, 2024 10:30 AM"
        } else {
            return d.format("ll");  // "Jan 15, 2024"
        }
    }
}

/**
 * Vue composable for reactive date formatting.
 * 
 * @param date - Reactive or static date value
 * @param options - Formatting options
 * @returns Computed ref with formatted date
 * 
 * @example
 * ```typescript
 * const date = ref('2024-01-15T10:30:00Z')
 * const formatted = useDateFormat(date, { includeTime: true })
 * console.log(formatted.value) // "Jan 15, 2024 10:30 AM"
 * ```
 */
export function useDateFormat(
    date: MaybeRefOrGetter<string | Date | undefined | null>,
    options: DateFormatOptions = {}
): ComputedRef<string> {
    return computed(() => formatDate(toValue(date), options));
}

/**
 * Formats a date in full format (e.g., "Jan 15, 2024")
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function fullDateFormat(date: string | Date | undefined | null): string {
    return formatDate(date, { shortFormat: false, includeTime: false });
}

/**
 * Vue composable for full date formatting (e.g., "Jan 15, 2024")
 * 
 * @param date - Reactive or static date value
 * @returns Computed ref with formatted date
 */
export function useFullDateFormat(date: MaybeRefOrGetter<string | Date | undefined | null>): ComputedRef<string> {
    return useDateFormat(date, { shortFormat: false, includeTime: false });
}

/**
 * Formats a date in short format (e.g., "1/15" or "1/15/2024")
 * Year is omitted if it's the current year.
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function shortDateFormat(date: string | Date | undefined | null): string {
    return formatDate(date, { shortFormat: true, includeTime: false, yearAware: true });
}

/**
 * Vue composable for short date formatting (e.g., "1/15" or "1/15/2024")
 * 
 * @param date - Reactive or static date value
 * @returns Computed ref with formatted date
 */
export function useShortDateFormat(date: MaybeRefOrGetter<string | Date | undefined | null>): ComputedRef<string> {
    return useDateFormat(date, { shortFormat: true, includeTime: false, yearAware: true });
}

/**
 * Formats a date with time in full format (e.g., "Jan 15, 2024 10:30 AM")
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function fullDateTimeFormat(date: string | Date | undefined | null): string {
    return formatDate(date, { shortFormat: false, includeTime: true });
}

/**
 * Vue composable for full date and time formatting (e.g., "Jan 15, 2024 10:30 AM")
 * 
 * @param date - Reactive or static date value
 * @returns Computed ref with formatted date
 */
export function useFullDateTimeFormat(date: MaybeRefOrGetter<string | Date | undefined | null>): ComputedRef<string> {
    return useDateFormat(date, { shortFormat: false, includeTime: true });
}

/**
 * Formats a date with time in short format (e.g., "1/15 10:30 AM" or "1/15/2024 10:30 AM")
 * Year is omitted if it's the current year.
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function shortDateTimeFormat(date: string | Date | undefined | null): string {
    return formatDate(date, { shortFormat: true, includeTime: true, yearAware: true });
}

/**
 * Vue composable for short date and time formatting (e.g., "1/15 10:30 AM" or "1/15/2024 10:30 AM")
 * 
 * @param date - Reactive or static date value
 * @returns Computed ref with formatted date
 */
export function useShortDateTimeFormat(date: MaybeRefOrGetter<string | Date | undefined | null>): ComputedRef<string> {
    return useDateFormat(date, { shortFormat: true, includeTime: true, yearAware: true });
}

/**
 * Formats a given date into a short time format (e.g., "h:mm A").
 * If the input is undefined, null, or invalid, it returns a default string.
 *
 * @param {string | Date | undefined | null} date - The date to format. Can be a string, Date object, or null/undefined.
 * @return {string} The formatted time string, "None" if the input is null or undefined, or "Invalid Date" if the input is not a valid date.
 */
export function shortTimeFormat(date: string | Date | undefined | null): string {
    if (!date) {
        return "None";
    }
    const d = dayjs.utc(date).local();
    if (!d.isValid()) {
        return "Invalid Date";
    }
    const currentYear = dayjs().year();
    let format = "h:mm A";
    return d.format(format);
}

/**
 * Formats a given date into a short time format using reactive computation.
 *
 * @param {MaybeRefOrGetter<string | Date | undefined | null>} date - The date to be formatted. Can be a string, Date object, or reactive reference.
 * @return {ComputedRef<string>} A computed reference containing the formatted short time string.
 */
export function useShortTimeFormat(date: MaybeRefOrGetter<string | Date | undefined | null>) {
    return computed(() => shortTimeFormat(toValue(date)));
}
