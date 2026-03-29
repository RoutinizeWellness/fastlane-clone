// ============================================================
// Content Sync — fetches fresh content from backend, caches in localStorage
// Falls back to hardcoded VIRAL_CONTENT if sync fails or offline
// ============================================================

import { VIRAL_CONTENT } from './viralContent';

const SYNC_KEY = 'fastlane_content_cache';
const SYNC_TS_KEY = 'fastlane_content_sync_ts';
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Returns true if the last successful sync was more than 24 hours ago
 * (or if no sync has ever been performed).
 */
function isSyncStale() {
  const lastSync = localStorage.getItem(SYNC_TS_KEY);
  if (!lastSync) return true;
  return Date.now() - Number(lastSync) > SYNC_INTERVAL_MS;
}

/**
 * Fetches the content catalog from the backend.
 * @param {string} [baseUrl] - API base URL, defaults to '/api'
 * @returns {Promise<Array>} content array
 */
async function fetchCatalog(baseUrl = '/api') {
  const res = await fetch(`${baseUrl}/content/catalog`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  const data = await res.json();
  return data.content;
}

/**
 * Sync content from the backend.
 *
 * - If fewer than 24 hours since last sync, returns the cached content
 *   (or VIRAL_CONTENT if nothing cached).
 * - If stale, fetches fresh content from GET /content/catalog.
 * - On success, stores the content + timestamp in localStorage.
 * - On failure, falls back to cached content or VIRAL_CONTENT.
 *
 * @param {object} [opts]
 * @param {string} [opts.baseUrl] - API base, defaults to '/api'
 * @param {boolean} [opts.force]  - bypass the 24-hour check
 * @returns {Promise<Array>} the content array to use
 */
export async function syncContent({ baseUrl = '/api', force = false } = {}) {
  // If not stale and not forced, return what we already have
  if (!force && !isSyncStale()) {
    return getCachedContent();
  }

  try {
    const content = await fetchCatalog(baseUrl);

    if (Array.isArray(content) && content.length > 0) {
      localStorage.setItem(SYNC_KEY, JSON.stringify(content));
      localStorage.setItem(SYNC_TS_KEY, String(Date.now()));
      return content;
    }
    // Empty / invalid response — fall back
    return getCachedContent();
  } catch (_err) {
    // Network error, server down, etc. — fall back silently
    return getCachedContent();
  }
}

/**
 * Returns cached content from localStorage, or the hardcoded fallback.
 */
export function getCachedContent() {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // corrupt cache — ignore
  }
  return VIRAL_CONTENT;
}

/**
 * Clears the sync cache so the next call to syncContent() will re-fetch.
 */
export function clearContentCache() {
  localStorage.removeItem(SYNC_KEY);
  localStorage.removeItem(SYNC_TS_KEY);
}
