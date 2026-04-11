import { getAdminDb } from '@/lib/firebase-admin'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin — QuestBoard', robots: 'noindex' }

async function getStats() {
  try {
    const db = getAdminDb()

    // サマリー（累計DAU・シェア数）
    const summarySnap = await db.collection('appStats').doc('summary').get()
    const summary = summarySnap.exists ? summarySnap.data() ?? {} : {}

    // 直近7日のDAU
    const today = new Date()
    const dauDays: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const snap = await db.collection('appStats').doc('daily').collection(date).count().get()
      dauDays.push({ date, count: snap.data().count })
    }

    // 総ユーザー数
    const usersSnap = await db.collection('users').count().get()
    const totalUsers = usersSnap.data().count

    return {
      dauTotal: summary.dauTotal ?? 0,
      shareTotal: summary.shareTotal ?? 0,
      totalUsers,
      dauDays,
    }
  } catch (e) {
    return { error: String(e), dauTotal: 0, shareTotal: 0, totalUsers: 0, dauDays: [] }
  }
}

export default async function AdminPage() {
  const stats = await getStats()
  const maxDau = Math.max(...stats.dauDays.map((d) => d.count), 1)

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">📊 Admin Dashboard</h1>
      <p className="admin-page__updated">更新: {new Date().toLocaleString('ja-JP')}</p>

      {'error' in stats && (
        <p className="admin-page__error">{stats.error}</p>
      )}

      <div className="admin-cards">
        <div className="admin-card">
          <span className="admin-card__label">総ユーザー数</span>
          <span className="admin-card__value">{stats.totalUsers.toLocaleString()}</span>
        </div>
        <div className="admin-card">
          <span className="admin-card__label">累計DAU記録</span>
          <span className="admin-card__value">{stats.dauTotal.toLocaleString()}</span>
        </div>
        <div className="admin-card">
          <span className="admin-card__label">累計シェア数</span>
          <span className="admin-card__value">{stats.shareTotal.toLocaleString()}</span>
        </div>
      </div>

      <section className="admin-section">
        <h2 className="admin-section__title">直近7日のDAU</h2>
        <div className="admin-dau-chart">
          {stats.dauDays.map(({ date, count }) => (
            <div key={date} className="admin-dau-col">
              <span className="admin-dau-count">{count > 0 ? count : ''}</span>
              <div className="admin-dau-bar-wrap">
                <div
                  className="admin-dau-bar"
                  style={{ height: `${(count / maxDau) * 100}%` }}
                />
              </div>
              <span className="admin-dau-label">{date.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section__title">外部リンク</h2>
        <div className="admin-links">
          <a className="admin-link" href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
            📈 Google Analytics
          </a>
          <a className="admin-link" href="https://console.firebase.google.com/project/questboard-entaku/firestore" target="_blank" rel="noopener noreferrer">
            🔥 Firestore Console
          </a>
          <a className="admin-link" href="https://vercel.com/entaku0818s-projects/quest-board" target="_blank" rel="noopener noreferrer">
            ▲ Vercel Dashboard
          </a>
        </div>
      </section>
    </div>
  )
}
