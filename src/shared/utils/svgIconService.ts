/**
 * Loads SVG icons from the public folder and returns them as data URLs.
 * Call on mount; use the returned URL in img src. Fallback if load fails.
 */

const OFFLINE_ICON_PATH = '/icons/offline.svg'
const UNDO_ICON_PATH = '/icons/undo.svg'
const REDO_ICON_PATH = '/icons/redo.svg'

const iconCache: Record<string, string | null> = {}

async function loadSvgIcon(path: string): Promise<string | null> {
  if (path in iconCache) return iconCache[path]
  try {
    const res = await fetch(path)
    if (!res.ok) {
      iconCache[path] = null
      return null
    }
    const svgText = await res.text()
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgText)}`
    iconCache[path] = dataUrl
    return dataUrl
  } catch {
    iconCache[path] = null
    return null
  }
}

let cachedOfflineIconDataUrl: string | null = null

export async function loadOfflineIcon(): Promise<string | null> {
  if (cachedOfflineIconDataUrl) return cachedOfflineIconDataUrl
  cachedOfflineIconDataUrl = await loadSvgIcon(OFFLINE_ICON_PATH)
  return cachedOfflineIconDataUrl
}

export async function loadUndoIcon(): Promise<string | null> {
  return loadSvgIcon(UNDO_ICON_PATH)
}

export async function loadRedoIcon(): Promise<string | null> {
  return loadSvgIcon(REDO_ICON_PATH)
}
