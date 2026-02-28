import { describe, expect, it } from 'vitest';

import { splitCfop } from './cfop.ts';

describe('splitCfop', () => {
    it('parses CFOP strings (no account) with various separators', () => {
        expect(splitCfop('1222222333333444444')).toEqual({
            chart: '1',
            fund: '222222',
            org: '333333',
            program: '444444',
        });

        expect(splitCfop('1-222222-333333-444444')).toEqual({
            chart: '1',
            fund: '222222',
            org: '333333',
            program: '444444',
        });

        expect(splitCfop('1.222222.333333.444444')).toEqual({
            chart: '1',
            fund: '222222',
            org: '333333',
            program: '444444',
        });
    });

    it('parses valid CFOP strings with various separators', () => {
        expect(splitCfop('1-123456-654321-55555-111111')).toEqual({
            chart: '1',
            fund: '123456',
            org: '654321',
            account: '55555',
            program: '111111',
        });

        expect(splitCfop('2.222222.333333.444444.555555')).toEqual({
            chart: '2',
            fund: '222222',
            org: '333333',
            account: '444444',
            program: '555555',
        });

        expect(splitCfop('4 111111 222222 33333 444444 555')).toEqual({
            chart: '4',
            fund: '111111',
            org: '222222',
            account: '33333',
            program: '444444',
            activity: '555',
        });

        expect(splitCfop('9-666666-555555-444444-333333-222222-111111')).toEqual({
            chart: '9',
            fund: '666666',
            org: '555555',
            account: '444444',
            program: '333333',
            activity: '222222',
            location: '111111',
        });
    });

    it('parses valid CFOP strings with no separators and trims whitespace', () => {
        expect(splitCfop('112345665432155555111111')).toEqual({
            chart: '1',
            fund: '123456',
            org: '654321',
            account: '55555',
            program: '111111',
        });

        expect(splitCfop('  1-123456-654321-55555-111111  ')).toEqual({
            chart: '1',
            fund: '123456',
            org: '654321',
            account: '55555',
            program: '111111',
        });
    });

    it('returns undefined for invalid CFOP strings', () => {
        // invalid chart
        expect(splitCfop('3-123456-654321-55555-111111')).toBeUndefined();

        // invalid CFOP (missing program)
        expect(splitCfop('1-222222-333333')).toBeUndefined();

        // invalid fund (too short)
        expect(splitCfop('1-12345-654321-55555-111111')).toBeUndefined();

        // invalid account (too long)
        expect(splitCfop('1-123456-654321-7777777-111111')).toBeUndefined();
    });
});
