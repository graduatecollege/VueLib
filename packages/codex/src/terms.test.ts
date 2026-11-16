import { describe, expect, it, vi } from 'vitest';

import {
    createTerm,
    generateTermCode,
    getCurrentTerm,
    getCurrentTermCode,
    monthToGradMonthName,
    monthToTermName,
    parseTermCode,
    termRegex,
    type Term,
} from './terms.ts';

const historicalTerms: Term[] = [
    {
        year: 2018,
        month: 0,
        name: 'Winter',
        gradMonthName: 'Unknown',
        code: '120180',
        academicYear: '2017-2018',
        termName: 'Winter 2018',
        shortTermName: 'WI 18',
    },
    {
        year: 2018,
        month: 6,
        name: 'Summer2',
        gradMonthName: 'Aug',
        code: '120186',
        academicYear: '2017-2018',
        termName: 'Summer2 2018',
        shortTermName: 'SU2 18',
    },
    {
        year: 2018,
        month: 2,
        name: 'Spring (Global Campus)',
        gradMonthName: 'May',
        code: '120182',
        academicYear: '2017-2018',
        termName: 'Spring (Global Campus) 2018',
        shortTermName: 'SP GC 18',
    },
    {
        year: 2018,
        month: 9,
        name: 'Fall (Global Campus)',
        gradMonthName: 'Dec',
        code: '120189',
        academicYear: '2018-2019',
        termName: 'Fall (Global Campus) 2018',
        shortTermName: 'FA GC 18',
    },
    {
        year: 2015,
        month: 7,
        name: 'Academic Year',
        gradMonthName: 'Unknown',
        code: '120157',
        academicYear: '2014-2015',
        termName: 'Academic Year 2014-2015',
        shortTermName: 'AY 14-15',
    },
];

describe('term helpers', () => {
    it.each([
        { month: 1, expected: 'Spring' as const },
        { month: 5, expected: 'Summer' as const },
        { month: 8, expected: 'Fall' as const },
    ])('monthToTermName($month) -> $expected', ({ month, expected }) => {
        expect(monthToTermName(month)).toBe(expected);
    });

    it('monthToTermName throws on invalid month', () => {
        expect(() => monthToTermName(3)).toThrow('Invalid month number');
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

    it.each(historicalTerms)('maps historical indicator $month', ({ month, name, gradMonthName }) => {
        expect(monthToTermName(month)).toBe(name);
        expect(monthToGradMonthName(month)).toBe(gradMonthName);
    });
});

describe('termRegex', () => {
    it.each([0, 1, 2, 5, 6, 7, 8, 9])('accepts indicator %i', (indicator) => {
        expect(termRegex.exec(`12018${indicator}`)?.slice(1)).toEqual(['2018', `${indicator}`]);
    });

    it.each(['120183', '120184', '220180', '12018', '1201800', '1201a0'])('rejects %s', (code) => {
        expect(termRegex.test(code)).toBe(false);
    });
});

describe('parseTermCode', () => {
    it.each(historicalTerms)('parses historical code $code', (expected) => {
        expect(parseTermCode(expected.code)).toEqual(expected);
        expect(parseTermCode(expected.code, true)).toEqual(expected);
    });

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

    it.each(['not-a-term', '120183', '120184'])('returns an Unknown term for %s', (code) => {
        expect(parseTermCode(code)).toMatchObject({
            name: 'Unknown',
            code: 'Unknown',
        });
    });

    it('preserves the original code when the year has leading zeros', () => {
        expect(parseTermCode('100010').code).toBe('100010');
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
    it.each(historicalTerms)('creates historical term $code by indicator and name', (expected) => {
        expect(createTerm(expected.year, expected.month)).toEqual(expected);
        expect(createTerm(expected.year, expected.name)).toEqual(expected);
    });

    it('formats an academic year spanning a century', () => {
        expect(createTerm(2000, 'Academic Year')).toMatchObject({
            academicYear: '1999-2000',
            termName: 'Academic Year 1999-2000',
            shortTermName: 'AY 99-00',
        });
    });

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
        expect(() => createTerm(2024, 'Autumn')).toThrow('Invalid term name');
        expect(() => createTerm(2024, 'Unknown')).toThrow('Invalid term name');
        expect(() => createTerm(2024, 3)).toThrow('Invalid month number');
        expect(() => createTerm(2024, 4)).toThrow('Invalid month number');
    });
});

describe("getCurrentTerm / getCurrentTermCode", () => {
    it.each([
        { at: new Date(2026, 4, 1, 12, 0, 0), expected: "Spring" as const },
        { at: new Date(2026, 5, 1, 12, 0, 0), expected: "Summer" as const },
        // These are 0-indexed months in JavaScript (July is 6, August is 7, September is 8)
        { at: new Date(2026, 7, 30, 12, 0, 0), expected: "Summer" as const },
        { at: new Date(2026, 8, 1, 12, 0, 0), expected: "Fall" as const },
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
