'use client'

import { useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [])

  async function handleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await syncToCloud(result.user)
    } catch (e) {
      console.error(e)
    }
  }

  async function syncToCloud(u: User) {
    setSyncing(true)
    try {
      const uid = u.uid
      const ref = doc(db, 'users', uid)
      const snap = await getDoc(ref)

      const localBucket = localStorage.getItem('questboard-bucket-list')
      const localPyramid = localStorage.getItem('questboard-pyramid')

      if (!snap.exists()) {
        // 初回：localStorageをクラウドに保存
        await setDoc(ref, {
          bucketList: localBucket ? JSON.parse(localBucket) : [],
          pyramid: localPyramid ? JSON.parse(localPyramid) : {},
          updatedAt: Date.now(),
        })
      } else {
        // 既存：クラウドデータをlocalStorageに反映
        const data = snap.data()
        if (data.bucketList) localStorage.setItem('questboard-bucket-list', JSON.stringify(data.bucketList))
        if (data.pyramid) localStorage.setItem('questboard-pyramid', JSON.stringify(data.pyramid))
        window.location.reload()
      }
    } finally {
      setSyncing(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
  }

  if (user) {
    return (
      <div className="auth-user">
        <img src={user.photoURL || ''} alt="" className="auth-avatar" />
        <span className="auth-name">{user.displayName?.split(' ')[0]}</span>
        <button className="btn btn--ghost btn--sm" onClick={handleLogout}>ログアウト</button>
      </div>
    )
  }

  return (
    <button className="btn btn--sync" onClick={handleLogin} disabled={syncing}>
      {syncing ? '同期中…' : '☁ データを同期する'}
    </button>
  )
}
