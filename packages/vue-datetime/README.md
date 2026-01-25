# @graduatecollege/vue-datetime

Vue 3 datetime formatting utilities for Graduate College applications.

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
