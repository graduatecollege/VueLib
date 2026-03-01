/**
 * @illinois-grad/codex
 * 
 * Domain-specific utilities for Graduate College applications.
 * 
 * This package provides:
 * - Term utilities: Parse, format, and work with academic terms
 * - Program utilities: Parse and work with program codes
 * - CFOP utilities: Parse and work with C-FOAPAL accounting strings
 * 
 * These utilities are specific to the Graduate College domain but are
 * general enough to be used across multiple Graduate College applications.
 */

// Term utilities
export {
    type Term,
    monthToGradMonthName,
    monthToTermName,
    termRegex,
    parseTermCode,
    generateTermCode,
    createTerm,
    getCurrentTerm,
    getCurrentTermCode,
    useTerm
} from './terms.ts';

// Program utilities
export {
    type ProgramCodeParts,
    programRegex,
    splitProgramCode,
} from './programs.ts';

// CFOP utilities
export {
    type CfopParts,
    cfopRegex,
    splitCfop,
} from './cfop.ts';
