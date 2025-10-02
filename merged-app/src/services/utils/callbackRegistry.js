export const registerCallbacks = (key, callbacks) => {
  global.callbackRegistry = global.callbackRegistry || {};
  global.callbackRegistry[key] = callbacks;
};

export const unregisterCallbacks = (key) => {
  if (global.callbackRegistry) {
    delete global.callbackRegistry[key];
  }
};

export const getCallbacks = (key) => {
  return global.callbackRegistry?.[key] || {};
};