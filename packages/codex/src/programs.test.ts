import { describe, expect, it } from 'vitest';

import { splitProgramCode } from './programs.ts';

describe('splitProgramCode', () => {
    it('splits a valid program code into its component parts', () => {
        expect(splitProgramCode('1ULA0501MS')).toEqual({
            programCampus: '1U',
            programCollege: 'LA',
            programMajor: '0501',
            programDegree: 'MS',
        });
    });

    it('is case-insensitive for letters', () => {
        expect(splitProgramCode('1uLa0501Ms')).toEqual({
            programCampus: '1u',
            programCollege: 'La',
            programMajor: '0501',
            programDegree: 'Ms',
        });
    });

    it('returns an empty object when parsing fails', () => {
        expect(splitProgramCode('')).toEqual({});
        expect(splitProgramCode('XYZ')).toEqual({});
        expect(splitProgramCode('2ULA0501MS')).toEqual({});
    });
});
