'use client'
import { useState, useEffect } from 'react'
import { trackEvent } from './lib/gtag'
import BucketList from './bucket-list'
import Pyramid from './pyramid'
import AuthButton from './components/AuthButton'

const PAGES = [
  { key: 'bucket', label: '🪣 やりたいこと' },
  { key: 'pyramid', label: '🔺 目標ピラミッド' },
]

export default function App() {
  const [page, setPage] = useState('bucket')

  useEffect(() => {
    trackEvent('page_view')
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1>🪣 やりたいことボード</h1>
            <p className="app-subtitle">死ぬまでにやりたいことを、今日の行動に変えよう</p>
          </div>
          <AuthButton />
        </div>
        <nav className="app-nav">
          {PAGES.map((p) => (
            <button
              key={p.key}
              className={`app-nav-btn ${page === p.key ? 'active' : ''}`}
              data-page={p.key}
              onClick={() => setPage(p.key)}
            >
              {p.label}
            </button>
          ))}
        </nav>
      </header>

      {page === 'bucket' && (
        <div className="page-content page-content--full page-content--bucket">
          <BucketList />
        </div>
      )}

      {page === 'pyramid' && (
        <div className="page-content page-content--pyramid">
          <Pyramid />
        </div>
      )}
    </div>
  )
}
