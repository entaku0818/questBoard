export const GA_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? ''

export const existsGaId = GA_ID !== ''

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

export const trackEvent = (action: string, params?: Record<string, string>) => {
  if (!existsGaId) return
  window.gtag?.('event', action, params)
}
