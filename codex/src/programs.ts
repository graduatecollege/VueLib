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
 * @example "1ULA0501MS" splits into:
 * - Campus: "1U"
 * - College: "LA"
 * - Major: "0501"
 * - Degree: "MS"
 */
export const programRegex = /(1[a-z0-9])([A-Z]{2})(\d{4})(.*)/i;

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
 * 
 * @example
 * ```typescript
 * splitProgramCode("1ULA0501MS")
 * // {
 * //   programCampus: "1U",
 * //   programCollege: "LA",
 * //   programMajor: "0501",
 * //   programDegree: "MS"
 * // }
 * 
 * splitProgramCode("invalid")
 * // {}
 * ```
 */
export function splitProgramCode(programCode: string): ProgramCodeParts {
    const match = programRegex.exec(programCode);
    if (match) {
        return {
            programCampus: match[1],
            programCollege: match[2],
            programMajor: match[3],
            programDegree: match[4],
        };
    }
    return {};
}

/**
 * Format a program code for display.
 * 
 * @param programCode - The program code to format
 * @param options - Formatting options
 * @returns Formatted program code string
 * 
 * @example
 * ```typescript
 * formatProgramCode("1ULA0501MS")
 * // "1U-LA-0501-MS"
 * 
 * formatProgramCode("1ULA0501MS", { separator: " " })
 * // "1U LA 0501 MS"
 * ```
 */
export function formatProgramCode(
    programCode: string,
    options: { separator?: string } = {}
): string {
    const { separator = "-" } = options;
    const parts = splitProgramCode(programCode);
    
    if (!parts.programCampus) {
        return programCode; // Return original if parsing fails
    }
    
    return [
        parts.programCampus,
        parts.programCollege,
        parts.programMajor,
        parts.programDegree
    ].filter(Boolean).join(separator);
}

/**
 * Validate if a program code is valid.
 * 
 * @param programCode - The program code to validate
 * @returns True if the program code matches the expected format
 * 
 * @example
 * ```typescript
 * isValidProgramCode("1ULA0501MS") // true
 * isValidProgramCode("invalid")     // false
 * ```
 */
export function isValidProgramCode(programCode: string): boolean {
    return programRegex.test(programCode);
}

/**
 * Build a program code from its component parts.
 * 
 * @param parts - The component parts of the program code
 * @returns Combined program code string
 * 
 * @example
 * ```typescript
 * buildProgramCode({
 *   programCampus: "1U",
 *   programCollege: "LA",
 *   programMajor: "0501",
 *   programDegree: "MS"
 * })
 * // "1ULA0501MS"
 * ```
 */
export function buildProgramCode(parts: ProgramCodeParts): string {
    return [
        parts.programCampus || "",
        parts.programCollege || "",
        parts.programMajor || "",
        parts.programDegree || ""
    ].join("");
}
