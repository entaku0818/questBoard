import { useState } from 'react'
import BucketList from './bucket-list.jsx'
import Pyramid from './pyramid.jsx'

const PAGES = [
  { key: 'bucket', label: '🪣 やりたいこと' },
  { key: 'pyramid', label: '🔺 目標ピラミッド' },
]

export default function App() {
  const [page, setPage] = useState('bucket')

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
