'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export default function GtagInit({ gaId }: { gaId: string }) {
  useEffect(() => {
    if (!gaId) return

    window.dataLayer = window.dataLayer || []
    // eslint-disable-next-line prefer-rest-params
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
    window.gtag('consent', 'default', { analytics_storage: 'granted' })
    window.gtag('js', new Date())
    window.gtag('config', gaId)

    // gtag.js を動的ロード（next/script を使わない）
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)
  }, [gaId])

  return null
}
