import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import {
    formatDate,
    fullDateFormat,
    fullDateTimeFormat,
    shortDateFormat,
    shortDateTimeFormat,
    shortTimeFormat,
    useDateFormat,
    useShortTimeFormat,
} from './dateFormat.ts';

describe('formatDate', () => {
    describe('null / undefined input', () => {
        it('returns "None" for null', () => {
            expect(formatDate(null)).toBe('None');
        });

        it('returns "None" for undefined', () => {
            expect(formatDate(undefined)).toBe('None');
        });

        it('returns custom nullText when provided', () => {
            expect(formatDate(null, { nullText: 'N/A' })).toBe('N/A');
        });
    });

    describe('invalid date', () => {
        it('returns "Invalid Date" for an invalid date string', () => {
            expect(formatDate('not-a-date')).toBe('Invalid Date');
        });

        it('returns custom invalidText when provided', () => {
            expect(formatDate('bad-date', { invalidText: 'N/A' })).toBe('N/A');
        });
    });

    describe('full format (default)', () => {
        it('includes the year in full format', () => {
            const result = formatDate('2024-01-15T12:00:00Z');
            expect(result).toContain('2024');
        });

        it('includes the abbreviated month in full format', () => {
            const result = formatDate('2024-01-15T12:00:00Z');
            expect(result).toMatch(/Jan/);
        });

        it('includes the time when includeTime is true', () => {
            const result = formatDate('2024-01-15T12:00:00Z', { includeTime: true });
            // Full format with time should contain the year and a time component
            expect(result).toContain('2024');
            expect(result).toMatch(/\d+:\d{2}/);
        });
    });

    describe('short format', () => {
        it('formats as M/D/YYYY when the year is not the current year', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

            expect(formatDate('2024-03-05T12:00:00Z', { shortFormat: true })).toBe('3/5/2024');

            vi.useRealTimers();
        });

        it('formats as M/D when the year is the current year (yearAware default)', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));

            expect(formatDate('2024-03-05T12:00:00Z', { shortFormat: true })).toBe('3/5');

            vi.useRealTimers();
        });

        it('includes the year even for the current year when yearAware is false', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));

            expect(formatDate('2024-03-05T12:00:00Z', { shortFormat: true, yearAware: false })).toBe('3/5/2024');

            vi.useRealTimers();
        });

        it('formats with time as M/D h:mm A when year is current year', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));

            const result = formatDate('2024-03-05T12:00:00Z', { shortFormat: true, includeTime: true });
            expect(result).toMatch(/^3\/5 \d+:\d{2} [AP]M$/);

            vi.useRealTimers();
        });

        it('formats with time as M/D/YYYY h:mm A when year is not current year', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

            const result = formatDate('2024-03-05T12:00:00Z', { shortFormat: true, includeTime: true });
            expect(result).toMatch(/^3\/5\/2024 \d+:\d{2} [AP]M$/);

            vi.useRealTimers();
        });
    });

    describe('Date object input', () => {
        it('accepts a Date object', () => {
            const date = new Date('2024-06-15T12:00:00Z');
            const result = formatDate(date);
            expect(result).toContain('2024');
        });
    });
});

describe('shortTimeFormat', () => {
    it('returns "None" for null', () => {
        expect(shortTimeFormat(null)).toBe('None');
    });

    it('returns "None" for undefined', () => {
        expect(shortTimeFormat(undefined)).toBe('None');
    });

    it('returns "Invalid Date" for an invalid date string', () => {
        expect(shortTimeFormat('not-a-date')).toBe('Invalid Date');
    });

    it('returns a time string in h:mm A format for a valid date', () => {
        const result = shortTimeFormat('2024-01-15T12:00:00Z');
        expect(result).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
    });
});

describe('useDateFormat', () => {
    it('returns a computed ref with the formatted date', () => {
        const formatted = useDateFormat('2024-01-15T12:00:00Z');
        expect(formatted.value).toContain('2024');
    });

    it('returns "None" for a null date', () => {
        const formatted = useDateFormat(null);
        expect(formatted.value).toBe('None');
    });

    it('reacts to a ref changing to null', () => {
        const date = ref<string | null>('2024-01-15T12:00:00Z');
        const formatted = useDateFormat(date);

        expect(formatted.value).toContain('2024');
        date.value = null;
        expect(formatted.value).toBe('None');
    });

    it('reacts to a ref changing to a new date', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

        const date = ref('2024-03-05T12:00:00Z');
        const formatted = useDateFormat(date, { shortFormat: true });

        expect(formatted.value).toBe('3/5/2024');

        date.value = '2023-07-10T12:00:00Z';
        expect(formatted.value).toBe('7/10/2023');

        vi.useRealTimers();
    });

    it('accepts a getter function', () => {
        let value: string | null = '2024-01-15T12:00:00Z';
        const formatted = useDateFormat(() => value);
        expect(formatted.value).toContain('2024');
    });
});

describe('useShortTimeFormat', () => {
    it('returns a computed ref with the formatted time', () => {
        const formatted = useShortTimeFormat('2024-01-15T12:00:00Z');
        expect(formatted.value).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
    });

    it('reacts to ref changes', () => {
        const date = ref<string | null>('2024-01-15T12:00:00Z');
        const formatted = useShortTimeFormat(date);

        expect(formatted.value).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
        date.value = null;
        expect(formatted.value).toBe('None');
    });
});

describe('convenience formatters', () => {
    describe('fullDateFormat', () => {
        it('returns a full date without time', () => {
            const result = fullDateFormat('2024-01-15T12:00:00Z');
            expect(result).toContain('2024');
            expect(result).toMatch(/Jan/);
            // Should not contain a colon (no time component)
            expect(result).not.toMatch(/\d+:\d{2}/);
        });

        it('returns "None" for null', () => {
            expect(fullDateFormat(null)).toBe('None');
        });
    });

    describe('shortDateFormat', () => {
        it('omits the year when the date is in the current year', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));

            expect(shortDateFormat('2024-03-05T12:00:00Z')).toBe('3/5');

            vi.useRealTimers();
        });

        it('includes the year when the date is not in the current year', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

            expect(shortDateFormat('2024-03-05T12:00:00Z')).toBe('3/5/2024');

            vi.useRealTimers();
        });

        it('returns "None" for null', () => {
            expect(shortDateFormat(null)).toBe('None');
        });
    });

    describe('fullDateTimeFormat', () => {
        it('returns a full date with a time component', () => {
            const result = fullDateTimeFormat('2024-01-15T12:00:00Z');
            expect(result).toContain('2024');
            expect(result).toMatch(/\d+:\d{2}/);
        });

        it('returns "None" for null', () => {
            expect(fullDateTimeFormat(null)).toBe('None');
        });
    });

    describe('shortDateTimeFormat', () => {
        it('omits the year and includes time when date is in the current year', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));

            const result = shortDateTimeFormat('2024-03-05T12:00:00Z');
            expect(result).toMatch(/^3\/5 \d+:\d{2} [AP]M$/);

            vi.useRealTimers();
        });

        it('includes the year and time when date is not in the current year', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

            const result = shortDateTimeFormat('2024-03-05T12:00:00Z');
            expect(result).toMatch(/^3\/5\/2024 \d+:\d{2} [AP]M$/);

            vi.useRealTimers();
        });

        it('returns "None" for null', () => {
            expect(shortDateTimeFormat(null)).toBe('None');
        });
    });
});
