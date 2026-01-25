# Graduate College Vue Packages

This directory contains shared Vue 3 packages extracted from the GCP client codebase. These packages are designed to be reused across Graduate College applications.

## Packages

### [@graduatecollege/vue-auth](packages/vue-auth)

Vue 3 authentication utilities with MSAL integration.

**Features:**
- Auth class for MSAL integration
- Vue plugin for easy setup
- Router authentication guard
- Navigation client for Vue Router integration
- Utility functions for user display (avatars, colors)

**Dependencies:**
- `@azure/msal-browser` (peer)
- `vue` (peer)
- `vue-router` (peer)
- `pinia` (peer)

### [@graduatecollege/vue-useful-api](packages/vue-useful-api)

API integration utilities with reactive state management.

**Features:**
- `usefulApi` - Wraps API calls with reactive loading/error/response states
- `applyUsefulApi` - Applies usefulApi to all methods of an API class
- `apiWatch` - Automatically executes API calls when reactive dependencies change
- Error handling utilities with user-friendly messages

**Dependencies:**
- `vue` (peer)
- `@vueuse/core`
- `fast-equals`
- `remeda`

### [@graduatecollege/vue-datetime](packages/vue-datetime)

DateTime formatting utilities for Vue 3.

**Features:**
- Multiple format presets (full, short, with/without time)
- Timezone-aware formatting (UTC to local)
- Year-aware formatting (omits current year for brevity)
- Reactive Vue composables
- Flexible options for customization

**Dependencies:**
- `vue` (peer)
- `dayjs`

### [@graduatecollege/codex](packages/codex)

Domain-specific utilities for Graduate College applications.

**Features:**
- Term utilities (parse, format, and work with academic terms)
- Program code utilities (parse and validate degree program codes)
- Zero dependencies
- Type-safe TypeScript implementation

**Dependencies:**
- None (zero dependencies)

## Development

Each package is independently buildable and has its own:
- `package.json` - Package configuration and dependencies
- `tsconfig.json` - TypeScript configuration
- `src/` - Source files
- `README.md` - Documentation

### Using Packages Locally

To use these packages locally before publishing:

1. Build the package (see above)
2. In the consuming project, install from the local path:

```bash
npm install ../path/to/vue-auth
```

Or use `npm link`:

```bash
# In the package directory
cd vue-auth
npm link

# In the consuming project
npm link @graduatecollege/vue-auth
```
