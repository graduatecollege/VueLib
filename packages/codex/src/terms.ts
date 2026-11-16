/**
 * An object representing a term in the academic calendar.
 */
export interface Term {
    /**
     * Four digit year.
     */
    year: number;
    /**
     * Term indicator (the final digit of the code), not a calendar month.
     * 0=Winter, 1=Spring, 2=Spring (Global Campus), 5=Summer,
     * 6=Summer2, 7=Academic Year, 8=Fall, 9=Fall (Global Campus).
     */
    month: number;
    /**
     * Name of the term.
     */
    name:
        | "Winter"
        | "Spring"
        | "Spring (Global Campus)"
        | "Summer"
        | "Summer2"
        | "Academic Year"
        | "Fall"
        | "Fall (Global Campus)"
        | "Unknown";
    /**
     * Month name for graduation.
     * "May" for Spring, "Aug" for Summer/Summer2, "Dec" for Fall.
     * "Unknown" for Winter and the whole academic year.
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
     * WI/SP/SU/SU2/FA and a two digit year; GC marks Global Campus.
     * Whole academic years use "AY" and a two digit year range.
     * @example "SP 24"
     */
    shortTermName: string;
}

/**
 * Converts a term indicator to the graduation month name.
 *
 * @param month - Term indicator (0, 1, 2, 5, 6, 7, 8, or 9)
 * @returns Graduation month name, or "Unknown" for Winter/Academic Year
 * @throws Error if the term indicator is invalid
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
        case 0:
        case 7:
            return "Unknown";
        case 1:
        case 2:
            return "May";
        case 5:
        case 6:
            return "Aug";
        case 8:
        case 9:
            return "Dec";
        default:
            throw new Error("Invalid month number");
    }
}

/**
 * Converts a term indicator to the term name.
 *
 * @param month - Term indicator (0, 1, 2, 5, 6, 7, 8, or 9)
 * @returns Term name
 * @throws Error if the term indicator is invalid
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
        case 0:
            return "Winter";
        case 1:
            return "Spring";
        case 2:
            return "Spring (Global Campus)";
        case 5:
            return "Summer";
        case 6:
            return "Summer2";
        case 7:
            return "Academic Year";
        case 8:
            return "Fall";
        case 9:
            return "Fall (Global Campus)";
        default:
            throw new Error("Invalid month number");
    }
}

/**
 * Regular expression for parsing term codes.
 * Matches format: "1YYYYX" where YYYY is year and X is a supported term indicator.
 */
export const termRegex = /^1(\d{4})([01256789])$/;

/**
 * Parse a term code string into a Term object.
 *
 * The term code format is "1YYYYX", where:
 * - "1" is a constant prefix for the Urbana campus
 * - "YYYY" is the 4-digit year
 * - "X" is the term indicator: 0=Winter, 1=Spring, 2=Spring (Global Campus),
 *   5=Summer, 6=Summer2, 7=Academic Year, 8=Fall, 9=Fall (Global Campus)
 * Winter and Academic Year use YYYY as the ending year of the academic year.
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

    return {
        ...createTerm(parseInt(match[1]), parseInt(match[2])),
        code,
    };
}

/**
 * Generate a term code from year and term indicator.
 *
 * @param year - Four digit year
 * @param month - Term indicator (0, 1, 2, 5, 6, 7, 8, or 9)
 * @returns Term code string in format "1YYYYX"
 */
export function generateTermCode(year: number, month: number): string {
    return `1${year}${month}`;
}

/**
 * Create a Term object from year and term indicator/name.
 *
 * @param year - Four digit year
 * @param monthInput - Supported term indicator/name, or graduation month ("May", "Aug", "Dec")
 * @returns Complete Term object
 * @throws Error if monthInput is invalid
 */
export function createTerm(year: number, monthInput: number | Term["name"] | Term["gradMonthName"]): Term {
    let month: number;
    if (typeof monthInput === "string") {
        switch (monthInput) {
            case "Winter":
                month = 0;
                break;
            case "Spring":
            case "May":
                month = 1;
                break;
            case "Spring (Global Campus)":
                month = 2;
                break;
            case "Summer":
            case "Aug":
                month = 5;
                break;
            case "Summer2":
                month = 6;
                break;
            case "Academic Year":
                month = 7;
                break;
            case "Fall":
            case "Dec":
                month = 8;
                break;
            case "Fall (Global Campus)":
                month = 9;
                break;
            default:
                throw new Error("Invalid term name: " + monthInput);
        }
    } else {
        month = monthInput;
    }

    let academicYear: string;
    if (month === 8 || month === 9) {
        academicYear = `${year}-${year + 1}`;
    } else {
        academicYear = `${year - 1}-${year}`;
    }
    const gradMonthName = monthToGradMonthName(month);
    const name = monthToTermName(month);
    const shortYear = year.toString().slice(-2);
    let shortTermName = `${name.slice(0, 2).toUpperCase()} ${shortYear}`;
    if (month === 6) {
        shortTermName = `SU2 ${shortYear}`;
    } else if (month === 7) {
        shortTermName = `AY ${(year - 1).toString().slice(-2)}-${shortYear}`;
    } else if (month === 2 || month === 9) {
        shortTermName = `${name.slice(0, 2).toUpperCase()} GC ${shortYear}`;
    }

    return {
        year,
        month,
        name,
        gradMonthName,
        code: generateTermCode(year, month),
        academicYear,
        termName: `${name} ${month === 7 ? academicYear : year}`,
        shortTermName,
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
    } else if (nowMonth >= 6 && nowMonth <= 8) {
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
