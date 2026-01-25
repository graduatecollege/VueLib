# @graduatecollege/vue-datetime

Vue 3 datetime formatting utilities for Graduate College applications.

## Features

- 📅 **Multiple Formats** - Full and short date/time formats
- 🌍 **Timezone Aware** - Automatic UTC to local timezone conversion
- 📆 **Year Aware** - Omits current year for brevity in short formats
- ⚡ **Reactive** - Vue composables for automatic updates
- 🎯 **Flexible** - Customizable options for any use case
- 📦 **Type Safe** - Written in TypeScript with full type definitions

## Installation

```bash
npm install @graduatecollege/vue-datetime
```

### Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "vue": "^3.0.0"
}
```

## Usage

### Basic Date Formatting

```typescript
import { formatDate } from '@graduatecollege/vue-datetime'

// Full format (default)
formatDate('2024-01-15T10:30:00Z')
// "Jan 15, 2024"

// With time
formatDate('2024-01-15T10:30:00Z', { includeTime: true })
// "Jan 15, 2024 10:30 AM"

// Short format
formatDate('2024-01-15T10:30:00Z', { shortFormat: true })
// "1/15" (if 2024 is the current year)

// Short format with year
formatDate('2023-01-15T10:30:00Z', { shortFormat: true })
// "1/15/2023"

// Handle null values
formatDate(null)
// "None"

// Custom null text
formatDate(null, { nullText: 'N/A' })
// "N/A"

// Invalid dates
formatDate('invalid-date', { invalidText: 'Unknown' })
// "Unknown"
```

### Preset Formatters

For convenience, the package provides preset formatters:

```typescript
import { 
  fullDateFormat,        // "Jan 15, 2024"
  shortDateFormat,       // "1/15" or "1/15/2024"
  fullDateTimeFormat,    // "Jan 15, 2024 10:30 AM"
  shortDateTimeFormat    // "1/15 10:30 AM" or "1/15/2024 10:30 AM"
} from '@graduatecollege/vue-datetime'

const date = '2024-01-15T10:30:00Z'

fullDateFormat(date)        // "Jan 15, 2024"
shortDateFormat(date)       // "1/15" (if current year)
fullDateTimeFormat(date)    // "Jan 15, 2024 10:30 AM"
shortDateTimeFormat(date)   // "1/15 10:30 AM" (if current year)
```

### Vue Composables

Use reactive composables in your Vue components:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { 
  useFullDateFormat, 
  useShortDateFormat,
  useFullDateTimeFormat,
  useShortDateTimeFormat,
  useDateFormat
} from '@graduatecollege/vue-datetime'

const date = ref('2024-01-15T10:30:00Z')

// Preset composables
const fullDate = useFullDateFormat(date)
const shortDate = useShortDateFormat(date)
const fullDateTime = useFullDateTimeFormat(date)
const shortDateTime = useShortDateTimeFormat(date)

// Custom composable with options
const customFormat = useDateFormat(date, {
  shortFormat: true,
  includeTime: true,
  yearAware: false  // Always show year
})
</script>

<template>
  <div>
    <p>Full Date: {{ fullDate }}</p>
    <!-- "Jan 15, 2024" -->
    
    <p>Short Date: {{ shortDate }}</p>
    <!-- "1/15" or "1/15/2024" -->
    
    <p>Full Date Time: {{ fullDateTime }}</p>
    <!-- "Jan 15, 2024 10:30 AM" -->
    
    <p>Short Date Time: {{ shortDateTime }}</p>
    <!-- "1/15 10:30 AM" or "1/15/2024 10:30 AM" -->
    
    <p>Custom: {{ customFormat }}</p>
    <!-- "1/15/2024 10:30 AM" (year always shown) -->
  </div>
</template>
```

### Complete Example

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFullDateTimeFormat, useShortDateFormat } from '@graduatecollege/vue-datetime'

// API data
const user = ref({
  name: 'John Doe',
  createdAt: '2023-06-15T14:30:00Z',
  lastLogin: '2024-01-15T10:30:00Z'
})

// Format dates
const createdDate = useShortDateFormat(() => user.value.createdAt)
const lastLoginDateTime = useFullDateTimeFormat(() => user.value.lastLogin)

// Dynamic date that updates
const now = ref(new Date().toISOString())
const currentTime = useFullDateTimeFormat(now)

// Update every minute
setInterval(() => {
  now.value = new Date().toISOString()
}, 60000)
</script>

<template>
  <div class="user-card">
    <h2>{{ user.name }}</h2>
    <p>Member since: {{ createdDate }}</p>
    <p>Last login: {{ lastLoginDateTime }}</p>
    <p>Current time: {{ currentTime }}</p>
  </div>
</template>
```

### With Computed Values

```typescript
import { ref, computed } from 'vue'
import { useShortDateFormat } from '@graduatecollege/vue-datetime'

const dates = ref([
  '2024-01-15T10:30:00Z',
  '2024-02-20T14:00:00Z',
  '2024-03-25T09:15:00Z'
])

// Format each date
const formattedDates = computed(() => 
  dates.value.map(date => {
    const formatted = useShortDateFormat(date)
    return formatted.value
  })
)
```

## API Reference

### `formatDate(date, options?)`

Formats a date with the given options.

**Parameters:**
- `date` (string | Date | undefined | null) - Date to format
- `options` (DateFormatOptions, optional) - Formatting options

**Returns:** string - Formatted date

### `DateFormatOptions`

```typescript
interface DateFormatOptions {
  includeTime?: boolean;    // Include time in output (default: false)
  shortFormat?: boolean;    // Use short format M/D (default: false)
  yearAware?: boolean;      // Omit year if current year (default: true)
  nullText?: string;        // Text for null/undefined (default: "None")
  invalidText?: string;     // Text for invalid dates (default: "Invalid Date")
}
```

### Preset Functions

#### `fullDateFormat(date)`
Formats date as "Jan 15, 2024"

#### `shortDateFormat(date)`
Formats date as "1/15" (current year) or "1/15/2024" (past year)

#### `fullDateTimeFormat(date)`
Formats date as "Jan 15, 2024 10:30 AM"

#### `shortDateTimeFormat(date)`
Formats date as "1/15 10:30 AM" (current year) or "1/15/2024 10:30 AM" (past year)

### Vue Composables

All preset functions have corresponding Vue composables:

#### `useFullDateFormat(date)`
Returns computed ref with full date format

#### `useShortDateFormat(date)`
Returns computed ref with short date format

#### `useFullDateTimeFormat(date)`
Returns computed ref with full date time format

#### `useShortDateTimeFormat(date)`
Returns computed ref with short date time format

#### `useDateFormat(date, options)`
Returns computed ref with custom format options

All composables accept `MaybeRefOrGetter<string | Date | undefined | null>` as input.

## Format Examples

| Input (UTC) | Format | Output (if current year is 2024) |
|-------------|--------|-----------------------------------|
| 2024-01-15T10:30:00Z | Full Date | Jan 15, 2024 |
| 2024-01-15T10:30:00Z | Short Date | 1/15 |
| 2023-01-15T10:30:00Z | Short Date | 1/15/2023 |
| 2024-01-15T10:30:00Z | Full Date Time | Jan 15, 2024 10:30 AM |
| 2024-01-15T10:30:00Z | Short Date Time | 1/15 10:30 AM |
| 2023-01-15T10:30:00Z | Short Date Time | 1/15/2023 10:30 AM |
| null | Any | None |
| invalid | Any | Invalid Date |

## Timezone Handling

All dates are automatically converted from UTC to the local timezone:

```typescript
import { formatDate } from '@graduatecollege/vue-datetime'

// Input is in UTC
const utcDate = '2024-01-15T18:30:00Z'

// Output is in local timezone
// For CST (UTC-6): "Jan 15, 2024 12:30 PM"
// For PST (UTC-8): "Jan 15, 2024 10:30 AM"
formatDate(utcDate, { includeTime: true })
```

## TypeScript Support

This package is written in TypeScript and provides full type definitions:

```typescript
import type { DateFormatOptions } from '@graduatecollege/vue-datetime'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'

// All types are exported
const options: DateFormatOptions = {
  includeTime: true,
  shortFormat: false
}
```

## License

MIT
