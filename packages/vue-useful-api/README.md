# @illinois-grad/vue-useful-api

Vue 3 API integration utilities with reactive state management for Graduate College applications.

## Features

- **Reactive State** - Automatic loading, error, and response state management
- **Event Hooks** - onSuccess, onError, and onFinally callbacks
- **Request Deduplication** - Ignores stale responses automatically
- **Auto-execution** - apiWatch composable for reactive API calls
- **Visible Polling** - useVisiblePolling pauses recurring calls in hidden tabs
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

### Polling While the Tab Is Visible

`useVisiblePolling` calls a function on an interval, but only while the browser tab
is visible. Polling pauses while the tab is hidden and calls the function right away
when the user returns, so data is fresh without wasting requests in background tabs:

```typescript
import { useVisiblePolling } from '@illinois-grad/vue-useful-api'

// Reload comments every 5 seconds while the tab is visible
useVisiblePolling(() => {
    if (!comments.isLoading.value) {
        comments.execute()
    }
}, 5000)
```

Callbacks are not awaited. The loading guard skips polls while a request is pending,
so slow responses are not continually superseded and discarded by `usefulApi`.

Like other composables, call it from a component's `setup`, a Pinia setup store, or an
effect scope; polling stops when that is disposed.
