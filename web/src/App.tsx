'use client'
import { useState, useEffect } from 'react'
import BucketList from './bucket-list'
import Pyramid from './pyramid'
import AuthButton from './components/AuthButton'
import { auth, db } from './lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, increment } from 'firebase/firestore'

const STATS_KEY = 'questboard-stats'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const PAGES = [
  { key: 'bucket', label: '🪣 やりたいこと' },
  { key: 'pyramid', label: '🔺 目標ピラミッド' },
]

export default function App() {
  const [page, setPage] = useState('bucket')

  // DAU記録: localStorage + Firestore（ログイン時）
  useEffect(() => {
    const today = todayStr()
    try {
      const prev = JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
      const shareCount = prev.shareCount ?? 0
      const activeDays = prev.date === today ? (prev.activeDays ?? 1) : (prev.activeDays ?? 0) + 1
      localStorage.setItem(STATS_KEY, JSON.stringify({ date: today, shareCount, activeDays }))
    } catch { /* silent */ }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return
      const ref = doc(db, 'appStats', 'daily', today, user.uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, { uid: user.uid, visitedAt: Date.now() })
        // 累計DAUカウンター
        await setDoc(doc(db, 'appStats', 'summary'), { dauTotal: increment(1) }, { merge: true })
      }
    })
    return unsub
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
