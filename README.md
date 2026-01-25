# Graduate College Vue Packages

This is an npm workspaces monorepo containing shared Vue 3 packages extracted from the GCP client codebase. These packages are designed to be reused across Graduate College applications.

## Build System

This monorepo uses:
- **npm workspaces** for package management and dependency hoisting
- **Vite** for fast, modern building and bundling
- **TypeScript** for type-safe code

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

### Initial Setup

Install all dependencies for all packages:

```bash
npm install
```

### Building Packages

Build all packages at once from the root:

```bash
npm run build
```

Build a specific package:

```bash
cd packages/vue-auth
npm run build
```

### Development Mode

Watch mode for all packages (rebuilds on file changes):

```bash
npm run dev
```

Watch mode for a specific package:

```bash
cd packages/vue-auth
npm run dev
```

### Cleaning Build Artifacts

Clean all packages:

```bash
npm run clean
```

Clean a specific package:

```bash
cd packages/vue-auth
npm run clean
```

### Package Structure

Each package is independently buildable and has its own:
- `package.json` - Package configuration and dependencies
- `vite.config.js` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `src/` - Source files
- `README.md` - Documentation

### Using Packages Locally

To use these packages locally before publishing:

1. Build all packages from the root:
   ```bash
   npm run build
   ```

2. In the consuming project, install from the local path:
   ```bash
   npm install ../path/to/VueLib/packages/vue-auth
   ```

Or use `npm link`:

```bash
# In the package directory
cd packages/vue-auth
npm link

# In the consuming project
npm link @graduatecollege/vue-auth
```

### Publishing Packages

To publish all packages (requires npm access):

```bash
# Build all packages first
npm run build

# Publish each package
cd packages/codex && npm publish
cd ../vue-auth && npm publish
cd ../vue-datetime && npm publish
cd ../vue-useful-api && npm publish
```
