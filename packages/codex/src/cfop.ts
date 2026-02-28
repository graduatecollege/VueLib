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
    organization: string;
    /**
     * Account: Five-digit (general ledger) or six-digit (operating ledger) code.
     */
    account: string;
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
 * Format: C-FFFFFF-OOOOOO-AAAAAA-PPPPPP-AAA-LLLLLL (Activity and Location are optional)
 * Segments can be separated by dashes, periods, or spaces.
 * 
 * - Chart: 1 digit (1, 2, 4, or 9)
 * - Fund: 6 digits
 * - Organization: 6 digits
 * - Account: 5 or 6 digits
 * - Program: 6 digits
 * - Activity: 3 or 6 digits (optional)
 * - Location: 6 digits (optional)
 */
export const cfopRegex = /^([1249])[-. ]?(\d{6})[-. ]?(\d{6})[-. ]?(\d{5,6})[-. ]?(\d{6})(?:[-. ]?(\d{3}|\d{6}))?(?:[-. ]?(\d{6}))?$/;

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

    const parts: CfopParts = {
        chart: match[1],
        fund: match[2],
        organization: match[3],
        account: match[4],
        program: match[5],
    };

    if (match[6]) {
        parts.activity = match[6];
    }

    if (match[7]) {
        parts.location = match[7];
    }

    return parts;
}
