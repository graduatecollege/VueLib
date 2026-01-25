/**
 * @graduatecollege/vue-auth
 * 
 * Vue 3 authentication utilities with MSAL integration for Graduate College applications.
 * 
 * This package provides:
 * - Auth class for MSAL integration
 * - Vue plugin for easy setup
 * - Router authentication guard
 * - Navigation client for Vue Router integration
 * - Utility functions for user display
 */

export { Auth } from './Auth.ts';
export { type MsalConfig, createMsalConfig } from './msal.config.ts';
export { msalPlugin } from './msalPlugin.ts';
export { CustomNavigationClient } from './NavigationClient.ts';
export { registerAuthGuard, isAuthenticated, type AuthStoreInterface } from './authGuard.ts';
export { netIdToColor, getUpdaterInitials } from './authUtils.ts';
