# @graduatecollege/vue-useful-api

Vue 3 API integration utilities with reactive state management for Graduate College applications.

## Features

- 🔄 **Reactive State** - Automatic loading, error, and response state management
- 🎣 **Event Hooks** - onSuccess, onError, and onFinally callbacks
- 🚫 **Request Deduplication** - Ignores stale responses automatically
- ⚡ **Auto-execution** - apiWatch composable for reactive API calls
- 🛡️ **Error Handling** - User-friendly error messages with type guards
- 📦 **Type Safe** - Written in TypeScript with full type definitions

## Installation

```bash
npm install @graduatecollege/vue-useful-api
```

### Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "vue": "^3.0.0"
}
```

## Usage

### Basic API Wrapping

The `usefulApi` function wraps any async function to provide reactive state management:

```typescript
import { usefulApi } from '@graduatecollege/vue-useful-api'

// Your API function
const api = {
  async getUser(id: string) {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  }
}

// Wrap it with usefulApi
const getUser = usefulApi(api.getUser.bind(api))()

// Execute the API call
await getUser.execute('123')

// Access reactive state
console.log(getUser.isLoading.value)  // false
console.log(getUser.response.value)   // { id: '123', name: 'John' }
console.log(getUser.error.value)      // undefined

// Handle success
getUser.onSuccess((result, args) => {
  console.log('User loaded:', result)
  console.log('Called with ID:', args[0])
})

// Handle errors
getUser.onError((error) => {
  console.error('Failed to load user:', error)
})
```

### Using in Vue Components

```vue
<script setup lang="ts">
import { usefulApi } from '@graduatecollege/vue-useful-api'
import { onMounted } from 'vue'

const api = {
  async getUser(id: string) {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  }
}

const getUser = usefulApi(api.getUser.bind(api))()

onMounted(() => {
  getUser.execute('123')
})
</script>

<template>
  <div>
    <div v-if="getUser.isLoading.value">Loading...</div>
    <div v-else-if="getUser.error.value">Error: {{ getUser.error.value }}</div>
    <div v-else-if="getUser.response.value">
      <h1>{{ getUser.response.value.name }}</h1>
      <p>{{ getUser.response.value.email }}</p>
    </div>
  </div>
</template>
```

### Wrapping Entire API Classes

The `applyUsefulApi` function wraps all methods of an API class:

```typescript
import { applyUsefulApi } from '@graduatecollege/vue-useful-api'

class UserApi {
  async getUser(id: string) {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  }
  
  async updateUser(id: string, data: any) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    return response.json()
  }
  
  async deleteUser(id: string) {
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
  }
}

const api = new UserApi()
const usefulUserApi = applyUsefulApi(api)

// Now all methods are wrapped and return UsefulApiProperties
const getUser = usefulUserApi.getUser()
const updateUser = usefulUserApi.updateUser()
const deleteUser = usefulUserApi.deleteUser()

await getUser.execute('123')
console.log(getUser.response.value)
```

### Automatic Execution with apiWatch

The `apiWatch` composable automatically executes API calls when reactive dependencies change:

```typescript
import { ref } from 'vue'
import { usefulApi, apiWatch } from '@graduatecollege/vue-useful-api'

const userId = ref('123')
const includeDetails = ref(true)

const api = {
  async getUser(id: string, details: boolean) {
    const response = await fetch(`/api/users/${id}?details=${details}`)
    return response.json()
  }
}

const getUser = usefulApi(api.getUser.bind(api))()

// Watch userId and includeDetails, execute when they change
apiWatch(getUser.execute, () => {
  // Return undefined to skip execution (e.g., when userId is empty)
  return userId.value ? [userId.value, includeDetails.value] : undefined
})

// Handle success
getUser.onSuccess((user) => {
  console.log('User loaded:', user)
})

// Now whenever userId or includeDetails changes, the API is called automatically
userId.value = '456' // Triggers API call with new ID
includeDetails.value = false // Triggers API call with new details flag
```

### Debouncing with apiWatch

For expensive operations like search, you can add debouncing:

```typescript
import { ref } from 'vue'
import { usefulApi, apiWatch } from '@graduatecollege/vue-useful-api'

const searchTerm = ref('')

const api = {
  async search(term: string) {
    const response = await fetch(`/api/search?q=${term}`)
    return response.json()
  }
}

const search = usefulApi(api.search.bind(api))()

// Debounce search by 300ms
apiWatch(
  search.execute,
  () => searchTerm.value ? [searchTerm.value] : undefined,
  { debounce: 300 }
)

search.onSuccess((results) => {
  console.log('Search results:', results)
})
```

### Error Handling

The package provides utilities for handling API errors:

```typescript
import { getApiErrorMessage, isApiErrorResponse, ApiError } from '@graduatecollege/vue-useful-api'

const getUser = usefulApi(api.getUser.bind(api))()

getUser.onError((error) => {
  // Get user-friendly error message
  const message = getApiErrorMessage(error)
  console.error(message)
  
  // Type-safe error checking
  if (isApiErrorResponse(error)) {
    console.error('Status:', error.statusCode)
    console.error('Errors:', error.errors)
  }
})

// You can also throw custom errors
throw new ApiError('Failed to save user', 500, { userId: '123' })
```

Error messages by status code:
- **400**: "Bad request. Contact the Graduate College."
- **401**: "Unauthorized. Please log in and try again."
- **403**: "Forbidden. You do not have permission to perform this action."
- **404**: "Not found. The requested resource could not be found."
- **500**: "Internal server error. Contact the Graduate College."
- **Network errors**: "A network error occurred. Please check your internet connection and try again."

### Complete Example

Here's a complete example combining all features:

```typescript
import { ref } from 'vue'
import { applyUsefulApi, apiWatch, getApiErrorMessage } from '@graduatecollege/vue-useful-api'

// Define your API
class GraduationApi {
  async getGraduation(term: string, department: string) {
    const response = await fetch(`/api/graduations?term=${term}&dept=${department}`)
    if (!response.ok) throw new Error('Failed to fetch')
    return response.json()
  }
  
  async updateGraduation(id: string, data: any) {
    const response = await fetch(`/api/graduations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update')
    return response.json()
  }
}

// Wrap the API
const api = applyUsefulApi(new GraduationApi())

// Use in component
const term = ref('120241')
const department = ref('GRAD')
const graduationData = ref(null)
const errorMessage = ref('')

const graduation = api.getGraduation()

// Auto-fetch when term or department changes
apiWatch(graduation.execute, () => {
  return term.value && department.value 
    ? [term.value, department.value] 
    : undefined
})

graduation.onSuccess((data) => {
  graduationData.value = data
  errorMessage.value = ''
})

graduation.onError((error) => {
  errorMessage.value = getApiErrorMessage(error)
  graduationData.value = null
})
```

## API Reference

### `usefulApi<R, A, T>(fn: T)`

Wraps an API function with reactive state management.

**Returns:** A function that returns `UsefulApiProperties<R, A, T>`

### `UsefulApiProperties<R, A, T>`

The object returned by a wrapped API function:

- `execute(...args: A): Promise<void>` - Execute the API call
- `executeDirect(...args: A): Promise<R>` - Execute without reactivity
- `onSuccess(fn: (result: R, args: A) => any): void` - Success callback
- `onError: EventHookOn<Error>` - Error event hook
- `onFinally: EventHookOn<void>` - Finally event hook
- `isLoading: Ref<boolean>` - Loading state
- `isFinished: Ref<boolean>` - Finished state
- `response: Ref<R | undefined>` - API response
- `error: Ref<unknown>` - Error object

### `applyUsefulApi<T>(apiInstance: T): UsefulApi<T>`

Wraps all methods of an API class instance.

### `apiWatch<Exec>(exec, watcher, options?)`

Automatically executes API calls when reactive dependencies change.

**Parameters:**
- `exec` - The execute function from a UsefulApiProperties object
- `watcher` - Function that returns the arguments for execute, or undefined to skip
- `options` - Optional debounce options

### Error Handling Functions

- `getApiErrorMessage(error: unknown): string` - Get user-friendly error message
- `isApiErrorResponse(error: unknown): error is ErrorResponse` - Type guard
- `isErrorResponseObject(error: unknown): error is ErrorResponseObject` - Type guard
- `ApiError` - Custom error class with status code and context

## TypeScript Support

This package is written in TypeScript and provides full type definitions:

```typescript
import type { 
  UsefulApi, 
  UsefulApiProperties,
  UsefulApiMethod,
  ErrorResponse,
  ErrorResponseObject
} from '@graduatecollege/vue-useful-api'
```

## License

MIT
