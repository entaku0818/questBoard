import '../src/style.css'
import GoogleAnalytics from '../src/components/GoogleAnalytics'

export const metadata = {
  metadataBase: new URL('https://myquestboard.entaku.app'),
  title: 'QuestBoard — やりたいことリスト・バケツリスト管理アプリ',
  description: '死ぬまでにやりたいこと、全部書き出してみよう。夢リストと日常TODOを一緒に管理。達成したらシェアしよう。',
  keywords: 'やりたいことリスト,バケツリスト,TODO管理,目標管理,夢リスト,ライフリスト,人生目標,自己成長,タスク管理',
  openGraph: {
    title: 'QuestBoard — やりたいことリスト・バケツリスト管理',
    description: '死ぬまでにやりたいこと、全部書き出してみよう。夢リストと日常TODOを一緒に管理。達成したらシェアしよう。',
    type: 'website',
    url: 'https://myquestboard.entaku.app/',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: 'QuestBoard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuestBoard — やりたいことリスト・バケツリスト管理',
    description: '死ぬまでにやりたいこと、全部書き出してみよう。夢リストと日常TODOを一緒に管理。達成したらシェアしよう。',
    images: ['/api/og'],
  },
  alternates: {
    canonical: 'https://myquestboard.entaku.app/',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        {/* JSON-LD は <head> に置くと React の script ホイスティングが干渉するので <body> に置く */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'QuestBoard',
              alternateName: 'やりたいことボード',
              description: '死ぬまでにやりたいことを、今日の行動に変えよう。バケツリスト・やりたいことリスト・TODO管理を1アプリで完結。',
              url: 'https://myquestboard.entaku.app/',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web',
              browserRequirements: 'Requires JavaScript',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
              inLanguage: 'ja-JP',
              keywords: 'やりたいことリスト,バケツリスト,TODO管理,目標管理,夢リスト',
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
