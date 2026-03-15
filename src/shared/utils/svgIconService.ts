/**
 * Loads SVG icons from the public folder and returns them as data URLs.
 * Call on mount; use the returned URL in img src. Fallback if load fails.
 */

const OFFLINE_ICON_PATH = '/icons/offline.svg'

let cachedOfflineIconDataUrl: string | null = null

export async function loadOfflineIcon(): Promise<string | null> {
  if (cachedOfflineIconDataUrl) return cachedOfflineIconDataUrl
  try {
    const res = await fetch(OFFLINE_ICON_PATH)
    if (!res.ok) return null
    const svgText = await res.text()
    cachedOfflineIconDataUrl = `data:image/svg+xml,${encodeURIComponent(svgText)}`
    return cachedOfflineIconDataUrl
  } catch {
    return null
  }
}
