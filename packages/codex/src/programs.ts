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
