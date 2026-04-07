'use client'

type Status = '未着手' | '進行中' | '完了'
type BucketItem = {
  id: string
  title: string
  category: string
  status: Status
  createdAt: string
}

const CATEGORIES = ['旅行', '学習', '体験', '創作', '健康', 'その他']

export default function StatsCard({ items }: { items: BucketItem[] }) {
  if (items.length === 0) return null

  const total = items.length
  const done = items.filter((i) => i.status === '完了').length
  const wip = items.filter((i) => i.status === '進行中').length
  const todo = items.filter((i) => i.status === '未着手').length

  // カテゴリ別達成数
  const catStats = CATEGORIES.map((cat) => {
    const catItems = items.filter((i) => i.category === cat)
    return {
      cat,
      total: catItems.length,
      done: catItems.filter((i) => i.status === '完了').length,
    }
  }).filter((c) => c.total > 0)

  // 直近6ヶ月の完了数
  const now = new Date()
  const months: { label: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = `${d.getMonth() + 1}月`
    const count = items.filter((item) => {
      if (item.status !== '完了') return false
      const created = new Date(item.createdAt)
      return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth()
    }).length
    months.push({ label, count })
  }
  const maxMonthCount = Math.max(...months.map((m) => m.count), 1)

  return (
    <div className="stats-card">
      <h3 className="stats-card__title">📊 進捗グラフ</h3>

      {/* ステータス別 */}
      <section className="stats-section">
        <h4 className="stats-section__label">ステータス別</h4>
        <div className="stats-status-rows">
          {[
            { label: '完了', count: done, cls: 'done' },
            { label: '進行中', count: wip, cls: 'wip' },
            { label: '未着手', count: todo, cls: 'todo' },
          ].map(({ label, count, cls }) => (
            <div key={label} className="stats-status-row">
              <span className="stats-status-row__label">{label}</span>
              <div className="stats-bar-wrap">
                <div
                  className={`stats-bar stats-bar--${cls}`}
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                />
              </div>
              <span className="stats-status-row__count">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* カテゴリ別棒グラフ */}
      <section className="stats-section">
        <h4 className="stats-section__label">カテゴリ別達成数</h4>
        <div className="stats-cat-bars">
          {catStats.map(({ cat, total: ct, done: cd }) => (
            <div key={cat} className="stats-cat-bar">
              <span className="stats-cat-bar__label">{cat}</span>
              <div className="stats-bar-wrap">
                <div className="stats-bar stats-bar--bg" style={{ width: '100%' }} />
                <div
                  className="stats-bar stats-bar--done"
                  style={{ width: ct > 0 ? `${(cd / ct) * 100}%` : '0%' }}
                />
              </div>
              <span className="stats-cat-bar__count">{cd}/{ct}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 月別完了数 */}
      <section className="stats-section">
        <h4 className="stats-section__label">月別完了数（直近6ヶ月）</h4>
        <div className="stats-monthly">
          {months.map(({ label, count }) => (
            <div key={label} className="stats-monthly__col">
              <div className="stats-monthly__bar-wrap">
                <div
                  className="stats-monthly__bar"
                  style={{ height: `${(count / maxMonthCount) * 100}%` }}
                />
              </div>
              <span className="stats-monthly__count">{count > 0 ? count : ''}</span>
              <span className="stats-monthly__label">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
