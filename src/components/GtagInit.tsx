'use client'
import { useEffect } from 'react'

export default function GtagInit({ gaId }: { gaId: string }) {
  useEffect(() => {
    if (!gaId) return

    // dataLayer と gtag 関数を標準仕様通りに初期化
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      ;(window as any).dataLayer.push(arguments)
    }
    ;(window as any).gtag('consent', 'default', { analytics_storage: 'granted' })
    ;(window as any).gtag('js', new Date())
    ;(window as any).gtag('config', gaId, { debug_mode: true })

    // next/script を使わず直接 DOM に追加
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)
  }, [gaId])

  return null
}
