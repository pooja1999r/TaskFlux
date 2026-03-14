import { useState, useEffect } from 'react'
import { loadOfflineIcon } from '../../utils/svgIconService'

const BANNER_ANIMATION_MS = 300

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [isExiting, setIsExiting] = useState(false)
  const [iconDataUrl, setIconDataUrl] = useState<string | null>(null)
  const [iconError, setIconError] = useState(false)

  useEffect(() => {
    void loadOfflineIcon().then((url) => {
      if (url) setIconDataUrl(url)
    })
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setIsExiting(true)
    }
    const handleOffline = () => {
      setIsOffline(true)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!isExiting) return
    const id = setTimeout(() => {
      setIsOffline(false)
      setIsExiting(false)
    }, BANNER_ANIMATION_MS)
    return () => {
      clearTimeout(id)
    }
  }, [isExiting])

  const visible = isOffline || isExiting
  if (!visible) return null

  const showIcon = iconDataUrl !== null && !iconError

  return (
    <div
      className={`offline-banner${isExiting ? ' offline-banner--exiting' : ''}`}
      role="alert"
      aria-live="polite"
      aria-label="Offline"
    >
      {showIcon && (
        <img
          src={iconDataUrl}
          alt=""
          className="offline-banner__icon"
          onError={() => {
            setIconError(true)
          }}
        />
      )}
      <span className="offline-banner__text">Offline</span>
    </div>
  )
}
