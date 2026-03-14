const SW_URL = '/sw.js'
const SCOPE = '/'

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(undefined)
  }
  return navigator.serviceWorker
    .register(SW_URL, { scope: SCOPE })
    .then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('[FluxBoard] New content available; please refresh.')
            }
          })
        }
      })
      return registration
    })
    .catch((err: unknown) => {
      console.warn('[FluxBoard] Service worker registration failed:', err)
      return undefined
    })
}

export function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(false)
  }
  return navigator.serviceWorker.ready.then((registration) =>
    registration.unregister(),
  )
}
