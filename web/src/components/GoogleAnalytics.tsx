// Server Component — 'use client' 不要
// React 18 の script ホイスティングを避けるため next/script は使わない
// JSON-LD など他の <script> は <head> に置かないこと（appendChild エラーの原因になる）

const GA_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? ''

export default function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: [
            'window.dataLayer=window.dataLayer||[];',
            'function gtag(){dataLayer.push(arguments);}',
            "gtag('js',new Date());",
            `gtag('config','${GA_ID}');`,
          ].join(''),
        }}
      />
    </>
  )
}
