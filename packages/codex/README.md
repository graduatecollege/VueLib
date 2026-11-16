# @illinois-grad/codex

Domain-specific utilities for Graduate College applications including terms and programs.

## Installation

```bash
npm install @illinois-grad/codex
```

## API Reference

### Term Types and Interfaces

#### `Term`

```typescript
interface Term {
  year: number;                        // Four digit year
  month: number;                       // Final term-code digit; see table below
  name: "Winter" | "Spring" | "Spring (Global Campus)" | "Summer" | "Summer2" | "Academic Year" | "Fall" | "Fall (Global Campus)" | "Unknown";
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

The `month` argument/property is a term indicator, not necessarily a calendar month.
Parsing, creation (by indicator or exact term name), and both `monthTo*` helpers
support these indicators. `generateTermCode` appends the indicator unchanged.

| Indicator | Name | Academic year for code year `YYYY` | Graduation month | Short name example |
|-----------|------|-----------------------------------|------------------|--------------------|
| 0 | Winter | `YYYY-1` to `YYYY` | Unknown | WI 18 |
| 1 | Spring | `YYYY-1` to `YYYY` | May | SP 18 |
| 2 | Spring (Global Campus) | `YYYY-1` to `YYYY` | May | SP GC 18 |
| 5 | Summer | `YYYY-1` to `YYYY` | Aug | SU 18 |
| 6 | Summer2 | `YYYY-1` to `YYYY` | Aug | SU2 18 |
| 7 | Academic Year | `YYYY-1` to `YYYY` | Unknown | AY 17-18 |
| 8 | Fall | `YYYY` to `YYYY+1` | Dec | FA 18 |
| 9 | Fall (Global Campus) | `YYYY` to `YYYY+1` | Dec | FA GC 18 |

For example, `parseTermCode("120180")` returns Winter 2018 in academic year
2017-2018. `parseTermCode("120157")` returns `name: "Academic Year"`,
`termName: "Academic Year 2014-2015"`, and `academicYear: "2014-2015"`.
Winter and whole-academic-year terms have no mapped graduation month.
Graduation-month inputs (`"May"`, `"Aug"`, `"Dec"`) still create standard Spring,
Summer, and Fall terms. Current-term detection still returns only those standard terms.

## Program Functions

- `splitProgramCode(programCode: string): ProgramCodeParts`
- `formatProgramCode(programCode: string, options?: { separator?: string }): string`
- `isValidProgramCode(programCode: string): boolean`
- `buildProgramCode(parts: ProgramCodeParts): string`
