/**
 * Callback Registry Utility
 * Migrated from shared/utils/callbackRegistry.js
 * A tiny in-memory registry for passing callbacks without putting
 * non-serializable functions into React Navigation route params.
 */

const registry = new Map();

export function registerCallbacks(key, callbacks) {
  if (!key) throw new Error("callbackRegistry: key is required");
  registry.set(key, callbacks || {});
}

export function getCallbacks(key) {
  if (!key) return {};
  return registry.get(key) || {};
}

export function unregisterCallbacks(key) {
  if (!key) return;
  registry.delete(key);
}

export function hasCallbacks(key) {
  return key ? registry.has(key) : false;
}

export default {
  registerCallbacks,
  getCallbacks,
  unregisterCallbacks,
  hasCallbacks,
};
