/**
 * Service worker entry.
 *
 * The live service worker that runs in the browser is built from
 * public/sw.js (plain JS, served as-is). It handles:
 * - Caching /offline.html on install
 * - On fetch (navigate): network first, fallback to cached offline.html when offline
 *
 * Registration is done via registerServiceWorker.ts.
 */

export const SERVICE_WORKER_URL = '/sw.js'
export const OFFLINE_FALLBACK_URL = '/offline.html'
