// Thin, safe wrapper around window.localStorage.
// All values are JSON-encoded and namespaced so they never clash with other apps
// on the same origin. Storage can be unavailable (private mode, quota exceeded),
// so every call is guarded and falls back to a default instead of crashing the UI.

const PREFIX = 'movieExplorer:';

export const STORAGE_KEYS = {
  LAST_SEARCH: 'lastSearch',
  FAVORITES: 'favorites',
  THEME: 'themeMode',
  USER: 'user',
};

export function getStoredValue(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    // Corrupt JSON or storage unavailable: behave as if nothing was stored.
    return fallback;
  }
}

export function setStoredValue(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Persistence is a nicety; the app keeps working from in-memory state.
  }
}

export function removeStoredValue(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // Ignored for the same reason as above.
  }
}
