# @graduatecollege/codex

Domain-specific utilities for Graduate College applications including terms and programs.

## Installation

```bash
npm install @graduatecollege/codex
```

## API Reference

### Term Types and Interfaces

#### `Term`

```typescript
interface Term {
  year: number;                        // Four digit year
  month: number;                       // 1=Spring, 5=Summer, 8=Fall
  name: "Spring" | "Summer" | "Fall" | "Unknown";
  gradMonthName: "May" | "Aug" | "Dec" | "Unknown";
  code: string;                        // Format: "1YYYYX"
  academicYear: string;                // e.g., "2023-2024"
  termName: string;                    // e.g., "Spring 2024"
  shortTermName: string;               // e.g., "SP 24"
}
```

### Term Functions

- `parseTermCode(code: string, returnDefault?: boolean): Term`
- `generateTermCode(year: number, month: number): string`
- `createTerm(year: number, monthInput: number | Term["name"] | Term["gradMonthName"]): Term`
- `getCurrentTerm(): Term`
- `getCurrentTermCode(): string`
- `monthToTermName(month: number): Term["name"]`
- `monthToGradMonthName(month: number): Term["gradMonthName"]`

## Program Functions

- `splitProgramCode(programCode: string): ProgramCodeParts`
- `formatProgramCode(programCode: string, options?: { separator?: string }): string`
- `isValidProgramCode(programCode: string): boolean`
- `buildProgramCode(parts: ProgramCodeParts): string`
