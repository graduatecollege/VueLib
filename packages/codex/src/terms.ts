import { computed, type MaybeRefOrGetter, toValue } from "vue";

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
 * ```typescript
 * monthToGradMonthName(1) // "May"
 * monthToGradMonthName(5) // "Aug"
 * monthToGradMonthName(8) // "Dec"
 * ```
 */
export function monthToGradMonthName(month: number): Term["gradMonthName"] {
    switch (month) {
        case 1:
            return "May";
        case 5:
            return "Aug";
        case 8:
            return "Dec";
        default:
            throw new Error("Invalid month number");
    }
}

/**
 * Converts a month number to the term name.
 * 
 * @param month - Month number (1 for Spring, 5 for Summer, 8 for Fall)
 * @returns Term name
 * @throws Error if month is not valid (1, 5, or 8)
 * 
 * @example
 * ```typescript
 * monthToTermName(1) // "Spring"
 * monthToTermName(5) // "Summer"
 * monthToTermName(8) // "Fall"
 * ```
 */
export function monthToTermName(month: number): Term["name"] {
    switch (month) {
        case 1:
            return "Spring";
        case 5:
            return "Summer";
        case 8:
            return "Fall";
        default:
            throw new Error("Invalid month number");
    }
}

/**
 * Regular expression for parsing term codes.
 * Matches format: "1YYYYX" where YYYY is year and X is term indicator (1, 5, or 8)
 */
export const termRegex = /^1(\d{4})([158])$/;

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
export function parseTermCode(code: string, returnDefault = false): Term {
    const match = termRegex.exec(code);

    if (!match) {
        console.warn(`Could not parse term: ${code}`);
        if (returnDefault) {
            return getCurrentTerm();
        }
        return {
            year: 0,
            month: 0,
            name: "Unknown",
            gradMonthName: "Unknown",
            code: "Unknown",
            academicYear: "Unknown",
            termName: "Unknown",
            shortTermName: "Unknown",
        };
    }

    const year = parseInt(match[1]);
    const termIndicator = match[2];

    let name: Term["name"];
    let month: number;

    switch (termIndicator) {
        case "1":
            name = "Spring";
            month = 1; // January
            break;
        case "5":
            name = "Summer";
            month = 5; // May
            break;
        case "8":
            name = "Fall";
            month = 8; // August
            break;
        default:
            throw new Error("Invalid term code");
    }
    let academicYear: string;
    if (month === 8) {
        academicYear = `${year}-${year + 1}`;
    } else {
        academicYear = `${year - 1}-${year}`;
    }

    return {
        year,
        month,
        name,
        gradMonthName: monthToGradMonthName(month),
        code,
        academicYear,
        termName: `${name} ${year}`,
        shortTermName: `${name.slice(0, 2).toUpperCase()} ${year.toString().slice(-2)}`,
    };
}

/**
 * Generate a term code from year and month.
 * 
 * @param year - Four digit year
 * @param month - Month number (1, 5, or 8)
 * @returns Term code string in format "1YYYYX"
 */
export function generateTermCode(year: number, month: number): string {
    return `1${year}${month}`;
}

/**
 * Create a Term object from year and month/name.
 * 
 * @param year - Four digit year
 * @param monthInput - Month number (1, 5, 8), term name ("Spring", "Summer", "Fall"), or graduation month ("May", "Aug", "Dec")
 * @returns Complete Term object
 * @throws Error if monthInput is invalid
 */
export function createTerm(year: number, monthInput: number | Term["name"] | Term["gradMonthName"]): Term {
    let gradMonthName: Term["gradMonthName"];
    let name: Term["name"];
    let month: number;
    if (typeof monthInput === "string") {
        switch (monthInput) {
            case "Spring":
            case "May":
                month = 1;
                break;
            case "Summer":
            case "Aug":
                month = 5;
                break;
            case "Fall":
            case "Dec":
                month = 8;
                break;
            default:
                throw new Error("Invalid term name: " + monthInput);
        }
    } else {
        month = monthInput;
    }

    let academicYear: string;
    if (month === 8) {
        academicYear = `${year}-${year + 1}`;
    } else {
        academicYear = `${year - 1}-${year}`;
    }
    gradMonthName = monthToGradMonthName(month);
    name = monthToTermName(month);

    return {
        year,
        month,
        name,
        gradMonthName,
        code: generateTermCode(year, month),
        academicYear,
        termName: `${name} ${year}`,
        shortTermName: `${name.slice(0, 2).toUpperCase()} ${year.toString().slice(-2)}`,
    };
}

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
export function getCurrentTerm(): Term {
    const now = new Date();
    const year = now.getFullYear();
    const nowMonth = now.getMonth() + 1; // Months are 0-indexed in JavaScript
    let month;
    if (nowMonth < 6) {
        month = 1; // Spring
    } else if (nowMonth >= 6 && nowMonth <= 9) {
        month = 5; // Summer
    } else {
        month = 8; // Fall
    }

    return createTerm(year, month);
}

/**
 * Generate a term code that matches the current date.
 */
export function getCurrentTermCode(): string {
    return getCurrentTerm().code;
}

/**
 * A composable function that computes a parsed term code from a given term code reference or getter.
 */
export function useTerm(termCode: MaybeRefOrGetter<string>) {
    return computed(() => parseTermCode(toValue(termCode)));
}