'use client'
import { useState, useEffect } from 'react'
import BucketList from './bucket-list'
import Pyramid from './pyramid'

const PAGES = [
  { key: 'bucket', label: '🪣 やりたいこと' },
  { key: 'pyramid', label: '🔺 目標ピラミッド' },
]

const STATS_KEY = 'questboard-stats'

export default function App() {
  const [page, setPage] = useState('bucket')

  useEffect(() => {
    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    try {
      const prev = JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
      const shareCount = prev.date === date ? (prev.shareCount ?? 0) : 0
      localStorage.setItem(STATS_KEY, JSON.stringify({ date, dau: true, shareCount }))
    } catch { /* silent */ }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>🪣 やりたいことボード</h1>
          <p className="app-subtitle">死ぬまでにやりたいことを、今日の行動に変えよう</p>
        </div>
        <nav className="app-nav">
          {PAGES.map((p) => (
            <button
              key={p.key}
              className={`app-nav-btn ${page === p.key ? 'active' : ''}`}
              onClick={() => setPage(p.key)}
            >
              {p.label}
            </button>
          ))}
        </nav>
      </header>

      {page === 'bucket' && (
        <div className="page-content page-content--full">
          <BucketList />
        </div>
      )}

      {page === 'pyramid' && (
        <div className="page-content">
          <Pyramid />
        </div>
      )}
    </div>
  )
}
