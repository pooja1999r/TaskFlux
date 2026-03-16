/**
 * Loads SVG icons from the public folder and returns them as data URLs.
 * After first load, stores each icon in localStorage and serves from there on
 * subsequent visits (no network). Call on mount; use the returned URL in img src.
 */

const STORAGE_PREFIX = 'fluxboard.svg.v1.'

const OFFLINE_ICON_PATH = '/icons/offline.svg'
const UNDO_ICON_PATH = '/icons/undo.svg'
const REDO_ICON_PATH = '/icons/redo.svg'
const MINUS_ICON_PATH = '/icons/minus.svg'
const EDIT_ICON_PATH = '/icons/edit.svg'
const DRAG_ICON_PATH = '/icons/drag.svg'
const COPY_ICON_PATH = '/icons/copy.svg'

const iconCache: Record<string, string | null> = {}

function getStorageKey(path: string): string {
  return `${STORAGE_PREFIX}${path}`
}

function readFromStorage(path: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(getStorageKey(path))
    return stored && stored.startsWith('data:image/svg+xml,') ? stored : null
  } catch {
    return null
  }
}

function writeToStorage(path: string, dataUrl: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getStorageKey(path), dataUrl)
  } catch {
    // QuotaExceeded or disabled; ignore
  }
}

async function loadSvgIcon(path: string): Promise<string | null> {
  if (path in iconCache) return iconCache[path] ?? null
  const fromStorage = readFromStorage(path)
  if (fromStorage !== null) {
    iconCache[path] = fromStorage
    return fromStorage
  }
  try {
    const res = await fetch(path)
    if (!res.ok) {
      iconCache[path] = null
      return null
    }
    const svgText = await res.text()
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgText)}`
    iconCache[path] = dataUrl
    writeToStorage(path, dataUrl)
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

export async function loadMinusIcon(): Promise<string | null> {
  return loadSvgIcon(MINUS_ICON_PATH)
}

export async function loadEditIcon(): Promise<string | null> {
  return loadSvgIcon(EDIT_ICON_PATH)
}

export async function loadDragIcon(): Promise<string | null> {
  return loadSvgIcon(DRAG_ICON_PATH)
}

export async function loadCopyIcon(): Promise<string | null> {
  return loadSvgIcon(COPY_ICON_PATH)
}
