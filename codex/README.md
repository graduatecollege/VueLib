# @graduatecollege/codex

Domain-specific utilities for Graduate College applications including terms and programs.

## Features

- 📅 **Term Management** - Parse, format, and work with academic terms
- 🎓 **Program Codes** - Parse and validate degree program codes
- 🔍 **Type Safe** - Written in TypeScript with full type definitions
- 📦 **Zero Dependencies** - Lightweight with no external dependencies
- 🎯 **Domain-Specific** - Designed for Graduate College applications

## Installation

```bash
npm install @graduatecollege/codex
```

## Usage

### Term Utilities

#### Parsing Term Codes

Term codes follow the format `1YYYYX` where:
- `1` = Urbana campus prefix
- `YYYY` = 4-digit year
- `X` = term indicator (1=Spring, 5=Summer, 8=Fall)

```typescript
import { parseTermCode } from '@graduatecollege/codex'

const term = parseTermCode('120241')
console.log(term)
// {
//   year: 2024,
//   month: 1,
//   name: "Spring",
//   gradMonthName: "May",
//   code: "120241",
//   academicYear: "2023-2024",
//   termName: "Spring 2024",
//   shortTermName: "SP 24"
// }

// Handle invalid codes
const invalid = parseTermCode('invalid')
// Returns "Unknown" term

// Or use current term as fallback
const fallback = parseTermCode('invalid', true)
// Returns current term
```

#### Creating Terms

```typescript
import { createTerm } from '@graduatecollege/codex'

// Create from year and month number
const spring = createTerm(2024, 1)

// Create from year and term name
const summer = createTerm(2024, "Summer")

// Create from year and graduation month
const fall = createTerm(2024, "Dec")
```

#### Getting Current Term

```typescript
import { getCurrentTerm, getCurrentTermCode } from '@graduatecollege/codex'

const term = getCurrentTerm()
console.log(term.termName) // "Spring 2024" (if current date is in spring)

const code = getCurrentTermCode()
console.log(code) // "120241"
```

#### Generating Term Codes

```typescript
import { generateTermCode } from '@graduatecollege/codex'

const code = generateTermCode(2024, 1)
console.log(code) // "120241"
```

#### Helper Functions

```typescript
import { monthToTermName, monthToGradMonthName } from '@graduatecollege/codex'

monthToTermName(1)       // "Spring"
monthToTermName(5)       // "Summer"
monthToTermName(8)       // "Fall"

monthToGradMonthName(1)  // "May"
monthToGradMonthName(5)  // "Aug"
monthToGradMonthName(8)  // "Dec"
```

### Program Code Utilities

#### Splitting Program Codes

Program codes follow the format: `(campus)(college)(major)(degree)`
- Campus: `1` + 1 alphanumeric (e.g., `1U` for Urbana)
- College: 2 uppercase letters (e.g., `LA` for Liberal Arts)
- Major: 4 digits (e.g., `0501` for History)
- Degree: Variable length (e.g., `MS` for Master of Science)

```typescript
import { splitProgramCode } from '@graduatecollege/codex'

const parts = splitProgramCode('1ULA0501MS')
console.log(parts)
// {
//   programCampus: "1U",
//   programCollege: "LA",
//   programMajor: "0501",
//   programDegree: "MS"
// }

// Invalid code returns empty object
const invalid = splitProgramCode('invalid')
// {}
```

#### Validating Program Codes

```typescript
import { isValidProgramCode } from '@graduatecollege/codex'

isValidProgramCode('1ULA0501MS')  // true
isValidProgramCode('invalid')      // false
```

#### Formatting Program Codes

```typescript
import { formatProgramCode } from '@graduatecollege/codex'

formatProgramCode('1ULA0501MS')
// "1U-LA-0501-MS"

formatProgramCode('1ULA0501MS', { separator: ' ' })
// "1U LA 0501 MS"

formatProgramCode('1ULA0501MS', { separator: '/' })
// "1U/LA/0501/MS"
```

#### Building Program Codes

```typescript
import { buildProgramCode } from '@graduatecollege/codex'

const code = buildProgramCode({
  programCampus: '1U',
  programCollege: 'LA',
  programMajor: '0501',
  programDegree: 'MS'
})
console.log(code) // "1ULA0501MS"
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

### Program Types and Interfaces

#### `ProgramCodeParts`

```typescript
interface ProgramCodeParts {
  programCampus?: string;    // 2 characters (e.g., "1U")
  programCollege?: string;   // 2 characters (e.g., "LA")
  programMajor?: string;     // 4 digits (e.g., "0501")
  programDegree?: string;    // Variable length (e.g., "MS")
}
```

### Program Functions

- `splitProgramCode(programCode: string): ProgramCodeParts`
- `formatProgramCode(programCode: string, options?: { separator?: string }): string`
- `isValidProgramCode(programCode: string): boolean`
- `buildProgramCode(parts: ProgramCodeParts): string`

## Examples

### Complete Term Example

```typescript
import { parseTermCode, getCurrentTerm, createTerm } from '@graduatecollege/codex'

// Parse a term from user input
const userTerm = parseTermCode('120241')
console.log(`Academic Year: ${userTerm.academicYear}`)
console.log(`Display: ${userTerm.termName}`)
console.log(`Short: ${userTerm.shortTermName}`)

// Get current term for defaults
const current = getCurrentTerm()
console.log(`Current term: ${current.termName}`)

// Create specific terms
const nextSpring = createTerm(2025, "Spring")
const thisFall = createTerm(2024, 8)
```

### Complete Program Example

```typescript
import { 
  splitProgramCode, 
  formatProgramCode, 
  isValidProgramCode,
  buildProgramCode 
} from '@graduatecollege/codex'

// Parse program from database
const programCode = '1ULA0501MS'

if (isValidProgramCode(programCode)) {
  const parts = splitProgramCode(programCode)
  console.log(`Campus: ${parts.programCampus}`)
  console.log(`College: ${parts.programCollege}`)
  console.log(`Major: ${parts.programMajor}`)
  console.log(`Degree: ${parts.programDegree}`)
  
  // Format for display
  const formatted = formatProgramCode(programCode)
  console.log(`Formatted: ${formatted}`)
  
  // Build from parts
  const rebuilt = buildProgramCode(parts)
  console.log(`Rebuilt: ${rebuilt}`)
}
```

### Using in a Vue Component

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseTermCode, splitProgramCode } from '@graduatecollege/codex'

const termCode = ref('120241')
const programCode = ref('1ULA0501MS')

const term = computed(() => parseTermCode(termCode.value))
const program = computed(() => splitProgramCode(programCode.value))
</script>

<template>
  <div>
    <h2>{{ term.termName }}</h2>
    <p>Academic Year: {{ term.academicYear }}</p>
    
    <h3>Program Details</h3>
    <ul>
      <li>Campus: {{ program.programCampus }}</li>
      <li>College: {{ program.programCollege }}</li>
      <li>Major: {{ program.programMajor }}</li>
      <li>Degree: {{ program.programDegree }}</li>
    </ul>
  </div>
</template>
```

## Term Code Reference

| Code   | Term         | Month | Grad Month | Academic Year |
|--------|--------------|-------|------------|---------------|
| 120241 | Spring 2024  | 1     | May        | 2023-2024     |
| 120245 | Summer 2024  | 5     | Aug        | 2023-2024     |
| 120248 | Fall 2024    | 8     | Dec        | 2024-2025     |
| 120251 | Spring 2025  | 1     | May        | 2024-2025     |

## Program Code Reference

Example: `1ULA0501MS`

| Component | Value | Description           |
|-----------|-------|-----------------------|
| Campus    | 1U    | Urbana campus         |
| College   | LA    | Liberal Arts          |
| Major     | 0501  | History major code    |
| Degree    | MS    | Master of Science     |

## TypeScript Support

This package is written in TypeScript and provides full type definitions:

```typescript
import type { Term, ProgramCodeParts } from '@graduatecollege/codex'
```

## License

MIT
