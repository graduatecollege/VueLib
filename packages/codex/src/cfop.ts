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
export const cfopRegex = /^(?<chart>[1249])[-. ]?(?<fund>\d{6})[-. ]?(?<org>\d{6})(?:[-. ]?(?<account>\d{5,6}))?[-. ]?(?<program>\d{6})(?:[-. ]?(?<activity>\d{3}|\d{6}))?(?:[-. ]?(?<location>\d{6}))?$/;

/**
 * Validates and splits a C-FOAPAL accounting string into its component parts.
 * 
 * @param cfop - The C-FOAPAL string to parse.
 * @returns An object containing the parsed components, or undefined if the string is invalid.
 */
export function splitCfop(cfop: string): CfopParts | undefined {
    const match = cfopRegex.exec(cfop.trim());
    if (!match) {
        return undefined;
    }

    const g = match.groups;
    if (!g) {
        return undefined;
    }

    const parts: CfopParts = {
        chart: g.chart,
        fund: g.fund,
        org: g.org,
        program: g.program,
    };

    if (g.account) {
        parts.account = g.account;
    }

    if (g.activity) {
        parts.activity = g.activity;
    }

    if (g.location) {
        parts.location = g.location;
    }

    return parts;
}
