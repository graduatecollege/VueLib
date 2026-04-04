# codex

Full d.ts definition:

```typescript
/**
 * Components of a C-FOAPAL accounting string.
 */
export interface CfopParts {
    /**
     * Chart: One-digit code for the applicable university or System Office.
     * 1 = UIUC, 2 = UIC, 4 = UIS, 9 = System Offices.
     */
    chart: string;
    /**
     * Fund: Six-digit code identifying the funding source.
     */
    fund: string;
    /**
     * Organization: Six-digit code representing the unit that owns the string.
     */
    org: string;
    /**
     * Account: Five-digit (general ledger) or six-digit (operating ledger) code.
     */
    account?: string;
    /**
     * Program: Six-digit code for financial reporting implications.
     */
    program: string;
    /**
     * Activity (Optional): Three-digit or six-digit code to track specific projects.
     */
    activity?: string;
    /**
     * Location (Optional): Six-digit code primarily used for fixed assets.
     */
    location?: string;
}
/**
 * Regular expression for parsing C-FOAPAL accounting strings.
 *
 * Format: C-FFFFFF-OOOOOO-(AAAAAA-)?PPPPPP-AAA-LLLLLL (Account, Activity and Location are optional)
 * Segments can be separated by dashes, periods, or spaces.
 *
 * Length notes (no separators):
 * - CFOP: 19 characters (no account)
 * - CFOAP: 25 characters
 * - CFOAPA: 31 characters
 * - CFOAPAL: 37 characters
 *
 * - Chart: 1 digit (1, 2, 4, or 9)
 * - Fund: 6 digits
 * - Organization: 6 digits
 * - Account: 5 or 6 digits (optional)
 * - Program: 6 digits
 * - Activity: 3 or 6 digits (optional)
 * - Location: 6 digits (optional)
 */
export declare const cfopRegex: RegExp;
/**
 * Validates and splits a C-FOAPAL accounting string into its component parts.
 *
 * @param cfop - The C-FOAPAL string to parse.
 * @returns An object containing the parsed components, or undefined if the string is invalid.
 */
export declare function splitCfop(cfop: string): CfopParts | undefined;
//# sourceMappingURL=cfop.d.ts.map
export {};
//# sourceMappingURL=cfop.test.d.ts.map
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
export { type Term, monthToGradMonthName, monthToTermName, termRegex, parseTermCode, generateTermCode, createTerm, getCurrentTerm, getCurrentTermCode } from './terms.ts';
export { type ProgramCodeParts, programRegex, splitProgramCode, } from './programs.ts';
export { type CfopParts, cfopRegex, splitCfop, } from './cfop.ts';
//# sourceMappingURL=index.d.ts.map
/**
 * Components of a program code.
 */
export interface ProgramCodeParts {
    /**
     * Campus code (2 characters, e.g., "1U" for Urbana)
     */
    programCampus?: string;
    /**
     * College code (2 characters, e.g., "LA" for Liberal Arts)
     */
    programCollege?: string;
    /**
     * Major code (4 digits, e.g., "0501" for History)
     */
    programMajor?: string;
    /**
     * Degree code (variable length, e.g., "MS" for Master of Science)
     */
    programDegree?: string;
}
/**
 * Regular expression for parsing program codes.
 * Format: (campus)(college)(major)(degree)
 * - Campus: 1 character "1" + 1 alphanumeric character
 * - College: 2 uppercase letters
 * - Major: 4 digits
 * - Degree: Variable length (remaining characters)
 *
 * @example "10KS0501MS" splits into:
 * - Campus: "10"
 * - College: "KS"
 * - Major: "0501"
 * - Degree: "MS"
 */
export declare const programRegex: RegExp;
/**
 * Split a program code into its component parts.
 *
 * A program code is made up of several parts:
 * - Campus code (2 characters, starts with "1")
 * - College code (2 uppercase letters)
 * - Major code (4 digits)
 * - Degree code (variable length)
 *
 * @param programCode - The program code to split (e.g., "1ULA0501MS")
 * @returns Object containing the parsed components, or empty object if parsing fails
 */
export declare function splitProgramCode(programCode: string): ProgramCodeParts;
//# sourceMappingURL=programs.d.ts.map
export {};
//# sourceMappingURL=programs.test.d.ts.map
/**
 * An object representing a term in the academic calendar.
 */
export interface Term {
    /**
     * Four digit year.
     */
    year: number;
    /**
     * Month of the term.
     * 1 for Spring, 5 for Summer, 8 for Fall.
     */
    month: number;
    /**
     * Name of the term.
     */
    name: "Spring" | "Summer" | "Fall" | "Unknown";
    /**
     * Month name for graduation.
     * "May" for Spring, "Aug" for Summer, "Dec" for Fall.
     */
    gradMonthName: "May" | "Aug" | "Dec" | "Unknown";
    /**
     * Term code string.
     * Format: "1YYYYX" where YYYY is the year and X is the term indicator.
     */
    code: string;
    /**
     * Academic year string.
     * @example "2023-2024"
     */
    academicYear: string;
    /**
     * Name of the term for display purposes that includes the name and year.
     * @example "Spring 2024"
     */
    termName: string;
    /**
     * Short term name for display purposes.
     * "SP" for Spring, "SU" for Summer, "FF" for Fall, and two digit year.
     * @example "SP 24"
     */
    shortTermName: string;
}
/**
 * Converts a month number to the graduation month name.
 *
 * @param month - Month number (1 for Spring, 5 for Summer, 8 for Fall)
 * @returns Graduation month name
 * @throws Error if month is not valid (1, 5, or 8)
 *
 * @example
 * \`\`\`typescript
 * monthToGradMonthName(1) // "May"
 * monthToGradMonthName(5) // "Aug"
 * monthToGradMonthName(8) // "Dec"
 * \`\`\`
 */
export declare function monthToGradMonthName(month: number): Term["gradMonthName"];
/**
 * Converts a month number to the term name.
 *
 * @param month - Month number (1 for Spring, 5 for Summer, 8 for Fall)
 * @returns Term name
 * @throws Error if month is not valid (1, 5, or 8)
 *
 * @example
 * \`\`\`typescript
 * monthToTermName(1) // "Spring"
 * monthToTermName(5) // "Summer"
 * monthToTermName(8) // "Fall"
 * \`\`\`
 */
export declare function monthToTermName(month: number): Term["name"];
/**
 * Regular expression for parsing term codes.
 * Matches format: "1YYYYX" where YYYY is year and X is term indicator (1, 5, or 8)
 */
export declare const termRegex: RegExp;
/**
 * Parse a term code string into a Term object.
 *
 * The term code format is "1YYYYX", where:
 * - "1" is a constant prefix for the Urbana campus
 * - "YYYY" is the 4-digit year
 * - "X" is the term indicator: 1 for Spring, 5 for Summer, and 8 for Fall
 *
 * @param code - Term code to parse (e.g., "120241" for Spring 2024)
 * @param returnDefault - If true, returns the current term if parsing fails
 * @returns Parsed Term object or "Unknown" term if parsing fails
 */
export declare function parseTermCode(code: string, returnDefault?: boolean): Term;
/**
 * Generate a term code from year and month.
 *
 * @param year - Four digit year
 * @param month - Month number (1, 5, or 8)
 * @returns Term code string in format "1YYYYX"
 */
export declare function generateTermCode(year: number, month: number): string;
/**
 * Create a Term object from year and month/name.
 *
 * @param year - Four digit year
 * @param monthInput - Month number (1, 5, 8), term name ("Spring", "Summer", "Fall"), or graduation month ("May", "Aug", "Dec")
 * @returns Complete Term object
 * @throws Error if monthInput is invalid
 */
export declare function createTerm(year: number, monthInput: number | Term["name"] | Term["gradMonthName"]): Term;
/**
 * Get the Term object for the term that matches the current date.
 *
 * Logic:
 * - Before June: Spring term
 * - June through September: Summer term
 * - October and later: Fall term
 *
 * @returns Term object for current term
 */
export declare function getCurrentTerm(): Term;
/**
 * Generate a term code that matches the current date.
 */
export declare function getCurrentTermCode(): string;
//# sourceMappingURL=terms.d.ts.map
export {};
//# sourceMappingURL=terms.test.d.ts.map
```
