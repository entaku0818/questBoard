import { Metadata } from 'next'

type BucketItem = {
  id: string
  title: string
  category: string
  status: '未着手' | '進行中' | '完了'
  deadline?: string
  notes?: string
  createdAt: string
}

async function fetchShareData(uid: string): Promise<{ bucketList: BucketItem[]; updatedAt: number | null } | null> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://myquestboard.entaku.app'
    const res = await fetch(`${base}/api/share/${uid}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ uid: string }> }): Promise<Metadata> {
  return {
    title: 'やりたいことリスト — QuestBoard',
    description: 'QuestBoardでシェアされたやりたいことリスト',
  }
}

export default async function SharePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params
  const data = await fetchShareData(uid)

  if (!data) {
    return (
      <div className="share-page share-page--notfound">
        <h1>リストが見つかりませんでした</h1>
        <p>このリンクは無効か、ユーザーがログインしていない可能性があります。</p>
        <a href="/" className="btn btn--primary">QuestBoardを使ってみる →</a>
      </div>
    )
  }

  const { bucketList } = data
  const completedCount = bucketList.filter((i) => i.status === '完了').length
  const totalCount = bucketList.length

  return (
    <div className="share-page">
      <div className="share-page__header">
        <h1 className="share-page__title">🪣 やりたいことリスト</h1>
        <p className="share-page__progress">
          {completedCount} / {totalCount} 達成
        </p>
        {totalCount > 0 && (
          <div className="share-page__bar-wrap">
            <div
              className="share-page__bar"
              style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {totalCount === 0 ? (
        <p className="share-page__empty">まだアイテムがありません。</p>
      ) : (
        <ul className="share-page__list">
          {bucketList.map((item) => (
            <li key={item.id} className={`share-page__item share-page__item--${item.status === '完了' ? 'done' : 'active'}`}>
              <span className="share-page__item-icon">
                {item.status === '完了' ? '✅' : item.status === '進行中' ? '🔄' : '⬜'}
              </span>
              <span className="share-page__item-title" style={item.status === '完了' ? { textDecoration: 'line-through', opacity: 0.6 } : undefined}>
                {item.title}
              </span>
              <span className="share-page__item-category">{item.category}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="share-page__footer">
        <a href="/" className="btn btn--primary">自分のリストを作る →</a>
      </div>
    </div>
  )
}
