import '../src/style.css'

export const metadata = {
  metadataBase: new URL('https://myquestboard.entaku.app'),
  title: 'QuestBoard — やりたいことリスト・バケツリスト管理アプリ',
  description: '死ぬまでにやりたいことを、今日の行動に変えよう。バケツリスト・やりたいことリスト・TODO管理を1アプリで完結。目標ピラミッドで夢を日常に落とし込む無料Webアプリ。',
  keywords: 'やりたいことリスト,バケツリスト,TODO管理,目標管理,夢リスト,ライフリスト,人生目標,自己成長,タスク管理',
  openGraph: {
    title: 'QuestBoard — やりたいことリスト・バケツリスト管理',
    description: '死ぬまでにやりたいことを、今日の行動に変えよう。バケツリスト×TODO管理で「いつか」を「今」に変える無料Webアプリ。',
    type: 'website',
    url: 'https://myquestboard.entaku.app/',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: 'QuestBoard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuestBoard — やりたいことリスト・バケツリスト管理',
    description: '死ぬまでにやりたいことを、今日の行動に変えよう。バケツリスト×TODO管理で「いつか」を「今」に変える無料Webアプリ。',
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
      </head>
      <body>{children}</body>
    </html>
  )
}
