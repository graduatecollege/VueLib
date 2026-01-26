# Graduate College Vue Packages

This is an npm workspaces monorepo containing shared Vue 3 packages
that don't contain components. Components are in the [grad-vue](https://github.com/graduatecollege/grad-vue)
project.

## Build System

This monorepo uses:
- **npm workspaces** for package management and dependency hoisting
- **Vite** for fast, modern building and bundling
- **TypeScript** for type-safe code

## Packages

- [`@graduatecollege/vue-auth`](packages/vue-auth)
- [`@graduatecollege/vue-useful-api`](packages/vue-useful-api)
- [`@graduatecollege/vue-datetime`](packages/vue-datetime)
- [`@graduatecollege/codex`](packages/codex)

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

### Using Packages Locally

To use these packages locally before publishing:

1. Build all packages from the root:
   ```bash
   npm run build
   ```

2. Use `npm link`:
   
   ```bash
   # In the package directory
   cd packages/vue-auth
   npm link
   
   # In the consuming project
   npm link @graduatecollege/vue-auth
   ```

### Publishing Packages

Packages are automatically published to GitHub Packages (https://npm.pkg.github.com) when a new tag starting with "v" is pushed:

```bash
# Create and push a new version tag
git tag v0.1.1
git push origin v0.1.1
```

The GitHub Actions workflow will:
1. Build all packages
2. Publish all 4 packages to the GitHub npm registry

## Copyright

Copyright © 2026 University of Illinois Board of Trustees
