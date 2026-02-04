# @illinois-grad/vue-useful-api

Vue 3 API integration utilities with reactive state management for Graduate College applications.

## Features

- **Reactive State** - Automatic loading, error, and response state management
- **Event Hooks** - onSuccess, onError, and onFinally callbacks
- **Request Deduplication** - Ignores stale responses automatically
- **Auto-execution** - apiWatch composable for reactive API calls
- **Error Handling** - User-friendly error messages with type guards
- **Type Safe** - Written in TypeScript with full type definitions

## Installation

```bash
npm install @illinois-grad/vue-useful-api
```

### Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "vue": "^3.0.0"
}
```

## Usage

### Automatic Execution with apiWatch

The `apiWatch` composable automatically executes API calls when reactive dependencies change:

```typescript
import { ref } from 'vue'
import { usefulApi, apiWatch } from '@illinois-grad/vue-useful-api'
import { useUsersApi } from './users'

const userId = ref('123')
const includeDetails = ref(true)

const users = useUsersApi();
const me = users.getMe();

apiWatch(me.execute, () => {
    if (auth.isAuthenticated) {
        return [userId.value, includeDetails.value];
    }
    // Return undefined to skip execution
    return undefined;
});

// The response is reactive
const profile = computed(() => {
    return me.response.value?.userInfo;
});

// You can also use event hooks
me.onSuccess((user) => {
  console.log('User loaded:', user)
})

// Now whenever userId or includeDetails changes, the API is called automatically
userId.value = '456' // Triggers API call with new ID
includeDetails.value = false // Triggers API call with new details flag

// The error state is also reactive
me.error.value // null if no error

// And errors have events
me.onError((error) => {
  console.error('Failed to load user:', error)
});

// The loading state is also reactive
me.isLoading.value // false if finished
```
