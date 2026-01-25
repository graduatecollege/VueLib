# @graduatecollege/vue-auth

Vue 3 authentication utilities with MSAL (Microsoft Authentication Library) integration for Graduate College applications.

## Features

- 🔐 **MSAL Integration** - Complete Azure AD/Microsoft authentication support
- ⚡ **Reactive** - Built with Vue 3 Composition API
- 🛡️ **Router Guards** - Protect routes with authentication
- 🎨 **User Utilities** - Helper functions for user display and avatars
- 📦 **Type Safe** - Written in TypeScript with full type definitions

## Installation

```bash
npm install @graduatecollege/vue-auth
```

### Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "@azure/msal-browser": "^4.0.0",
  "pinia": "^2.0.0 || ^3.0.0",
  "vue": "^3.0.0",
  "vue-router": "^4.0.0"
}
```

## Usage

### 1. Setup MSAL Plugin

```typescript
import { createApp } from 'vue'
import { createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import { PublicClientApplication } from '@azure/msal-browser'
import { msalPlugin, createMsalConfig } from '@graduatecollege/vue-auth'
import App from './App.vue'

// Create MSAL configuration
const msalConfig = createMsalConfig(
  import.meta.env.VITE_AZURE_CLIENT_ID,
  import.meta.env.VITE_AZURE_AUTHORITY
)

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

// Create router
const router = createRouter({
  // ... your routes
})

const app = createApp(App)
const pinia = createPinia()

// Install plugins
app.use(pinia)
app.use(msalPlugin, msalInstance, msalConfig, router)
app.use(router)

app.mount('#app')
```

### 2. Create Auth Store

Create a Pinia store that uses the Auth instance:

```typescript
import { defineStore } from 'pinia'
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { Auth } from '@graduatecollege/vue-auth'

export const useAuthStore = defineStore('auth', () => {
  const name = ref('')
  const email = ref('')
  const isAuthenticated = ref(false)
  
  // Get Auth instance from Vue app
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('useAuthStore must be called in setup()')
  }
  const auth: Auth = instance.appContext.config.globalProperties.$auth
  
  // Watch for account changes
  watch(auth.account, (account) => {
    if (account?.name) {
      name.value = account.name
      email.value = account.username || ''
      isAuthenticated.value = true
    } else {
      name.value = ''
      email.value = ''
      isAuthenticated.value = false
    }
  })
  
  const initPromise = auth.initialize()
  
  return {
    name,
    email,
    isAuthenticated,
    initPromise,
    login: auth.loginRedirect,
    logout: auth.logout,
    handleRedirect: auth.handleRedirect,
  }
})
```

### 3. Setup Router Guard

Protect routes that require authentication:

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { registerAuthGuard } from '@graduatecollege/vue-auth'
import { useAuthStore } from './stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/protected',
      component: ProtectedView,
      meta: { requiresAuth: true } // This route requires authentication
    }
  ]
})

// Register the auth guard
registerAuthGuard(router, () => useAuthStore())

export default router
```

### 4. Use in Components

```vue
<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { netIdToColor, getUpdaterInitials } from '@graduatecollege/vue-auth'
import { computed } from 'vue'

const authStore = useAuthStore()

const netId = computed(() => authStore.email.split('@')[0])
const userColor = computed(() => netIdToColor(netId.value))
const initials = computed(() => getUpdaterInitials(netId.value))
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    <div 
      class="user-avatar"
      :style="{ backgroundColor: userColor }"
    >
      {{ initials }}
    </div>
    <p>Welcome, {{ authStore.name }}!</p>
    <button @click="authStore.logout()">Logout</button>
  </div>
  <div v-else>
    <button @click="authStore.login()">Login</button>
  </div>
</template>
```

## API Reference

### `createMsalConfig(clientId, authority, additionalScopes?)`

Creates a standard MSAL configuration object.

**Parameters:**
- `clientId` (string) - Azure AD application client ID
- `authority` (string) - Azure AD authority/tenant ID
- `additionalScopes` (string[], optional) - Additional scopes beyond 'User.Read'

**Returns:** `MsalConfig`

### `Auth`

Main authentication class that wraps MSAL functionality.

**Static Methods:**
- `create(msalInstance, msalConfig)` - Create a reactive Auth instance

**Instance Properties:**
- `account` (Ref<AccountInfo | null>) - Current authenticated account
- `accounts` (AccountInfo[]) - All authenticated accounts
- `status` (InteractionStatus) - Current authentication status
- `inProgress` (boolean) - Whether authentication is in progress
- `ready` (boolean) - Whether auth is ready to use

**Instance Methods:**
- `initialize()` - Initialize MSAL
- `loginRedirect(redirectStartPage?)` - Redirect to login
- `logout()` - Logout the current user
- `handleRedirect()` - Handle redirect after authentication
- `loadToken(request)` - Load a token with given scopes
- `loadGraphToken()` - Load Microsoft Graph token
- `loadGcpToken()` - Load GCP-specific token

### `registerAuthGuard(router, getAuthStore)`

Registers authentication guard with Vue Router.

**Parameters:**
- `router` (Router) - Vue Router instance
- `getAuthStore` (() => AuthStoreInterface) - Function that returns the auth store

### Utility Functions

#### `netIdToColor(netId: string): string`

Generates a deterministic color for a user based on their netID. Useful for displaying user avatars with consistent colors.

#### `getUpdaterInitials(updater: string): string`

Formats user initials from their netID or username. Returns "SYS" for system users.

## TypeScript Support

This package is written in TypeScript and provides full type definitions.

```typescript
import type { MsalConfig, AuthStoreInterface } from '@graduatecollege/vue-auth'
```

## License

MIT
