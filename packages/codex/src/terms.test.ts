import { describe, expect, it, vi } from 'vitest';

import {
    createTerm,
    generateTermCode,
    getCurrentTerm,
    getCurrentTermCode,
    monthToGradMonthName,
    monthToTermName,
    parseTermCode,
} from './terms.ts';

describe('term helpers', () => {
    it.each([
        { month: 1, expected: 'Spring' as const },
        { month: 5, expected: 'Summer' as const },
        { month: 8, expected: 'Fall' as const },
    ])('monthToTermName($month) -> $expected', ({ month, expected }) => {
        expect(monthToTermName(month)).toBe(expected);
    });

    it('monthToTermName throws on invalid month', () => {
        expect(() => monthToTermName(0)).toThrow('Invalid month number');
    });

    it.each([
        { month: 1, expected: 'May' as const },
        { month: 5, expected: 'Aug' as const },
        { month: 8, expected: 'Dec' as const },
    ])('monthToGradMonthName($month) -> $expected', ({ month, expected }) => {
        expect(monthToGradMonthName(month)).toBe(expected);
    });

    it('monthToGradMonthName throws on invalid month', () => {
        expect(() => monthToGradMonthName(12)).toThrow('Invalid month number');
    });
});

describe('parseTermCode', () => {
    it.each([
        {
            code: '120241',
            expected: {
                year: 2024,
                month: 1,
                name: 'Spring',
                gradMonthName: 'May',
                academicYear: '2023-2024',
                termName: 'Spring 2024',
                shortTermName: 'SP 24',
            },
        },
        {
            code: '120258',
            expected: {
                year: 2025,
                month: 8,
                name: 'Fall',
                gradMonthName: 'Dec',
                academicYear: '2025-2026',
                termName: 'Fall 2025',
                shortTermName: 'FA 25',
            },
        },
    ])('parses term code $code', ({ code, expected }) => {
        expect(parseTermCode(code)).toMatchObject(expected);
    });

    it('returns an Unknown term when parsing fails', () => {
        expect(parseTermCode('not-a-term')).toMatchObject({
            name: 'Unknown',
            code: 'Unknown',
        });
    });

    it('can return the current term when parsing fails and returnDefault=true', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-02-01T12:00:00Z'));

        const current = getCurrentTerm();
        expect(parseTermCode('bad', true)).toEqual(current);

        vi.useRealTimers();
    });
});

describe('generateTermCode', () => {
    it.each([
        { year: 2024, month: 1, expected: '120241' },
        { year: 2024, month: 5, expected: '120245' },
        { year: 2024, month: 8, expected: '120248' },
    ])('$year/$month -> $expected', ({ year, month, expected }) => {
        expect(generateTermCode(year, month)).toBe(expected);
    });
});

describe('createTerm', () => {
    it.each([
        {
            year: 2024,
            month: 1,
            expected: {
                year: 2024,
                month: 1,
                name: 'Spring',
                gradMonthName: 'May',
                code: '120241',
                academicYear: '2023-2024',
                termName: 'Spring 2024',
                shortTermName: 'SP 24',
            },
        },
    ])('creates term from numeric month $year/$month', ({ year, month, expected }) => {
        expect(createTerm(year, month)).toMatchObject(expected);
    });

    it.each([
        { input: 'Spring' as const, expectedMonth: 1 },
        { input: 'May' as const, expectedMonth: 1 },
        { input: 'Summer' as const, expectedMonth: 5 },
        { input: 'Aug' as const, expectedMonth: 5 },
        { input: 'Fall' as const, expectedMonth: 8 },
        { input: 'Dec' as const, expectedMonth: 8 },
    ])('creates term from input "$input" -> month $expectedMonth', ({ input, expectedMonth }) => {
        expect(createTerm(2024, input).month).toBe(expectedMonth);
    });

    it('throws for invalid inputs', () => {
        // @ts-expect-error runtime validation
        expect(() => createTerm(2024, 'Winter')).toThrow('Invalid term name');
        expect(() => createTerm(2024, 0)).toThrow('Invalid month number');
    });
});

describe("getCurrentTerm / getCurrentTermCode", () => {
    it.each([
        { at: new Date(2026, 4, 1, 12, 0, 0), expected: "Spring" as const },
        { at: new Date(2026, 5, 1, 12, 0, 0), expected: "Summer" as const },
        { at: new Date(2026, 8, 30, 12, 0, 0), expected: "Summer" as const },
        { at: new Date(2026, 9, 1, 12, 0, 0), expected: "Fall" as const },
    ])("at $at -> $expected", ({ at, expected }) => {
        vi.useFakeTimers();
        vi.setSystemTime(at);
        expect(getCurrentTerm().name).toBe(expected);
        vi.useRealTimers();
    });

    it("getCurrentTermCode matches getCurrentTerm().code", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 1, 12, 0, 0));
        expect(getCurrentTermCode()).toBe(getCurrentTerm().code);
        vi.useRealTimers();
    });
});
