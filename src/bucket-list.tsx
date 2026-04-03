'use client'
import { useState, useEffect, useRef } from 'react'
import ShareCard from './components/ShareCard'

type Status = '未着手' | '進行中' | '完了'
type Action = { id: string; text: string; done: boolean }
type BucketItem = {
  id: string
  title: string
  category: string
  deadline: string
  notes: string
  status: Status
  createdAt: string
  actions?: Action[]
}
type CompletionBanner = { questName: string; count: number }

const STORAGE_KEY = 'questboard-bucket-list'

const CATEGORIES = ['旅行', '学習', '体験', '創作', '健康', 'その他']
const STATUSES = ['未着手', '進行中', '完了']

const GACHA_ITEMS: { title: string; category: string }[] = [
  { title: '富士山に登る', category: '体験' },
  { title: '海外一人旅をする', category: '旅行' },
  { title: 'フルマラソンを完走する', category: '健康' },
  { title: '自分のWebサービスをリリースする', category: '学習' },
  { title: '料理教室に通う', category: '体験' },
  { title: '外国語で日常会話をする', category: '学習' },
  { title: 'バンジージャンプをする', category: '体験' },
  { title: 'ダイビングのライセンスを取る', category: '体験' },
  { title: '小説を1冊書き上げる', category: '創作' },
  { title: 'オーロラを見る', category: '旅行' },
  { title: '自分でイラストを描いて展示する', category: '創作' },
  { title: '楽器を1曲弾けるようになる', category: '創作' },
  { title: '温泉地を10カ所以上めぐる', category: '旅行' },
  { title: '100冊本を読む', category: '学習' },
  { title: '肉体改造して6パックを作る', category: '健康' },
  { title: 'スカイダイビングをする', category: '体験' },
  { title: '自家製ワインを作る', category: '体験' },
  { title: '世界遺産を10カ所訪れる', category: '旅行' },
  { title: '人前でスピーチをする', category: '体験' },
  { title: '畑で野菜を育てる', category: '体験' },
  { title: 'ヨガインストラクターの資格を取る', category: '健康' },
  { title: '1ヶ月間SNSをやめる', category: '健康' },
  { title: 'キャンプで満天の星空を見る', category: '旅行' },
  { title: '手料理でコース料理を作る', category: '創作' },
  { title: '起業する', category: '学習' },
  { title: '映画を100本見る', category: '体験' },
  { title: '自転車で遠出する', category: '健康' },
  { title: '陶芸を体験する', category: '創作' },
  { title: '子どもの頃の夢をひとつ叶える', category: 'その他' },
  { title: '家族に手紙を書く', category: 'その他' },
  { title: 'ボランティア活動に参加する', category: 'その他' },
  { title: '写真集を作る', category: '創作' },
  { title: '友人と海外旅行に行く', category: '旅行' },
  { title: '朝5時に起きる生活を1ヶ月続ける', category: '健康' },
  { title: '自転車日本縦断に挑戦する', category: '体験' },
]

export default function BucketList() {
  const [items, setItems] = useState<BucketItem[]>(() => {
    try {
      if (typeof window === 'undefined') return []
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [filterStatus, setFilterStatus] = useState('すべて')
  const [filterCategory, setFilterCategory] = useState('すべて')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    category: 'その他',
    deadline: '',
    notes: '',
    status: '未着手',
  })
  const [showShareModal, setShowShareModal] = useState(false)
  const [userName, setUserName] = useState('あなた')
  const [avatarEmoji, setAvatarEmoji] = useState('⚔️')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionInputs, setActionInputs] = useState<Record<string, string>>({})
  const [onboarding, setOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('questboard-onboarding-done') !== 'true'
  })
  const [rapidInput, setRapidInput] = useState('')
  const [completionBanner, setCompletionBanner] = useState<CompletionBanner | null>(null)
  const [gachaSuggestion, setGachaSuggestion] = useState<{ title: string; category: string } | null>(null)
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Escキーでシェアカードモーダルを閉じる
  useEffect(() => {
    if (!showShareModal) return
    const handler = (e) => { if (e.key === 'Escape') setShowShareModal(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showShareModal])

  const resetForm = () => {
    setForm({ title: '', category: 'その他', deadline: '', notes: '', status: '未着手' })
    setEditingId(null)
  }

  const closeForm = () => { resetForm(); setShowForm(false) }

  // Escキーでフォームモーダルを閉じる
  useEffect(() => {
    if (!showForm) return
    const handler = (e) => { if (e.key === 'Escape') closeForm() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showForm])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = form.title.trim()
    if (!trimmed) return

    if (editingId !== null) {
      setItems(items.map((item) =>
        item.id === editingId ? { ...item, ...form, title: trimmed, status: form.status as Status } : item
      ))
    } else {
      const newItem: BucketItem = {
        id: crypto.randomUUID(),
        ...form,
        title: trimmed,
        status: form.status as Status,
        createdAt: new Date().toISOString(),
      }
      setItems([...items, newItem])
    }
    closeForm()
  }

  const handleEdit = (item) => {
    setForm({
      title: item.title,
      category: item.category,
      deadline: item.deadline || '',
      notes: item.notes || '',
      status: item.status,
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setDeletingId(id)
  }

  const confirmDelete = (id) => {
    setItems(items.filter((item) => item.id !== id))
    setDeletingId(null)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const showCompletionBanner = (questName, count) => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
    setCompletionBanner({ questName, count })
    bannerTimerRef.current = setTimeout(() => setCompletionBanner(null), 6000)
  }

  const toggleStatus = (id) => {
    const item = items.find((i) => i.id === id)
    const next: Record<Status, Status> = { '未着手': '進行中', '進行中': '完了', '完了': '未着手' }
    const newStatus = next[item.status]
    setItems(items.map((i) => i.id !== id ? i : { ...i, status: newStatus }))
    if (filterStatus !== 'すべて' && filterStatus !== newStatus) {
      showToast(`「${item.title}」を「${newStatus}」に変更しました（フィルターにより非表示）`)
    }
    if (newStatus === '完了') {
      const newCount = items.filter((i) => i.status === '完了').length + 1
      showCompletionBanner(item.title, newCount)
    }
  }

  // アクション（TODO）操作
  function addAction(itemId) {
    const text = (actionInputs[itemId] || '').trim()
    if (!text) return
    setItems(items.map((i) => i.id !== itemId ? i : {
      ...i,
      actions: [...(i.actions ?? []), { id: crypto.randomUUID(), text, done: false }],
    }))
    setActionInputs({ ...actionInputs, [itemId]: '' })
    // アクションが入ったら自動で「進行中」に
    setItems((prev) => prev.map((i) => {
      if (i.id !== itemId || i.status !== '未着手') return i
      return { ...i, status: '進行中' }
    }))
  }

  function toggleAction(itemId, actionId) {
    const updatedItems = items.map((i) => {
      if (i.id !== itemId) return i
      const actions = (i.actions ?? []).map((a) =>
        a.id !== actionId ? a : { ...a, done: !a.done }
      )
      const allDone = actions.length > 0 && actions.every((a) => a.done)
      return { ...i, actions, status: allDone ? '完了' : actions.some((a) => a.done) ? '進行中' : i.status }
    })
    setItems(updatedItems)

    const originalItem = items.find((i) => i.id === itemId)
    const updatedItem = updatedItems.find((i) => i.id === itemId)
    if (originalItem && updatedItem && originalItem.status !== '完了' && updatedItem.status === '完了') {
      const newCount = updatedItems.filter((i) => i.status === '完了').length
      showCompletionBanner(updatedItem.title, newCount)
    }
  }

  function deleteAction(itemId, actionId) {
    setItems(items.map((i) => i.id !== itemId ? i : {
      ...i,
      actions: (i.actions ?? []).filter((a) => a.id !== actionId),
    }))
  }

  const filtered = items.filter((item) => {
    const matchStatus = filterStatus === 'すべて' || item.status === filterStatus
    const matchCat = filterCategory === 'すべて' || item.category === filterCategory
    return matchStatus && matchCat
  })

  const completedCount = items.filter((i) => i.status === '完了').length

  function finishOnboarding() {
    localStorage.setItem('questboard-onboarding-done', 'true')
    setOnboarding(false)
  }

  function addRapidItem() {
    const title = rapidInput.trim()
    if (!title) return
    setItems((prev) => [...prev, {
      id: crypto.randomUUID(),
      title,
      category: 'その他',
      deadline: '',
      notes: '',
      status: '未着手',
      createdAt: new Date().toISOString(),
    }])
    setRapidInput('')
  }

  if (onboarding) {
    return (
      <div className="onboarding">
        <div className="onboarding__inner">
          <div className="onboarding__hero">
            <span className="onboarding__emoji">🪣</span>
            <h1 className="onboarding__title">死ぬまでにやりたいこと<br />100個書いてみよう</h1>
            <p className="onboarding__sub">
              細かいことは後で決めればいい。<br />まず思いつくままに書き出してみよう。
            </p>
          </div>

          <div className="onboarding__counter">
            <span className="onboarding__count-num">{items.length}</span>
            <span className="onboarding__count-label"> / 100</span>
          </div>

          <div className="onboarding__bar-wrap">
            <div
              className="onboarding__bar"
              style={{ width: `${Math.min((items.length / 100) * 100, 100)}%` }}
            />
          </div>

          <div className="onboarding__input-wrap">
            <input
              className="onboarding__input"
              type="text"
              placeholder="例: 富士山に登る、英語を話せるようになる..."
              value={rapidInput}
              onChange={(e) => setRapidInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRapidItem()}
              maxLength={100}
              autoFocus
            />
            <button className="onboarding__add-btn" onClick={addRapidItem}>追加</button>
          </div>
          <p className="onboarding__hint">Enterで次々追加できます</p>

          {items.length > 0 && (
            <ul className="onboarding__list">
              {[...items].reverse().slice(0, 10).map((item) => (
                <li key={item.id} className="onboarding__list-item">
                  <span>⬜</span> {item.title}
                </li>
              ))}
              {items.length > 10 && (
                <li className="onboarding__list-more">他 {items.length - 10} 件</li>
              )}
            </ul>
          )}

          <button
            className="onboarding__done-btn"
            onClick={finishOnboarding}
            disabled={items.length === 0}
          >
            {items.length >= 100
              ? '🏆 100個達成！リストを見る'
              : items.length > 0
              ? `${items.length}個書いた — リストへ進む →`
              : 'まず1つ書いてみよう'}
          </button>
          {items.length > 0 && items.length < 100 && (
            <p className="onboarding__encourage">
              あと{100 - items.length}個！思いついたものをどんどん書こう
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bucket-list">
      {toast && <div className="bucket-toast">{toast}</div>}
      {completionBanner && (
        <div className="completion-banner">
          <span className="completion-banner__text">
            {completionBanner.count >= 10
              ? `${completionBanner.count}個達成！シェアカードを更新しよう`
              : `「${completionBanner.questName}」を達成！✨ シェアしますか？`}
          </span>
          <button
            className="btn btn--primary completion-banner__cta"
            onClick={() => { setShowShareModal(true); setCompletionBanner(null) }}
          >
            🎴 シェアカードを見る
          </button>
          <button className="completion-banner__close" onClick={() => setCompletionBanner(null)}>✕</button>
        </div>
      )}
      <div className="bucket-list__header">
        <h2>やりたいことリスト</h2>
        <p className="bucket-list__progress">
          {completedCount} / {items.length} 達成
        </p>
      </div>

      <div className="bucket-list__filters">
        <div className="bucket-list__filter-tabs">
          {['すべて', ...STATUSES].map((s) => (
            <button
              key={s}
              className={`btn btn--filter${filterStatus === s ? ' btn--active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option>すべて</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn--primary" onClick={() => { resetForm(); setShowForm(true) }}>
          ＋ 追加
        </button>
        <button className="btn btn--gacha" onClick={() => {
          const unused = GACHA_ITEMS.filter(g => !items.some(i => i.title === g.title))
          const pool = unused.length > 0 ? unused : GACHA_ITEMS
          setGachaSuggestion(pool[Math.floor(Math.random() * pool.length)])
        }}>
          🎲 ガチャ
        </button>
        <button className="btn" onClick={() => setShowShareModal(true)}>
          🎴 シェアカード
        </button>
      </div>

      {gachaSuggestion && (
        <div className="gacha-suggestion">
          <span className="gacha-suggestion__label">🎲 こんなのどう？</span>
          <span className="gacha-suggestion__title">{gachaSuggestion.title}</span>
          <span className="gacha-suggestion__category">{gachaSuggestion.category}</span>
          <button className="btn btn--primary btn--sm" onClick={() => {
            setForm({ title: gachaSuggestion.title, category: gachaSuggestion.category, deadline: '', notes: '', status: '未着手' })
            setGachaSuggestion(null)
            setShowForm(true)
          }}>追加する</button>
          <button className="btn btn--ghost btn--sm" onClick={() => {
            const unused = GACHA_ITEMS.filter(g => !items.some(i => i.title === g.title) && g.title !== gachaSuggestion.title)
            const pool = unused.length > 0 ? unused : GACHA_ITEMS.filter(g => g.title !== gachaSuggestion.title)
            setGachaSuggestion(pool[Math.floor(Math.random() * pool.length)])
          }}>もう一回</button>
          <button className="btn btn--ghost btn--sm" onClick={() => setGachaSuggestion(null)}>✕</button>
        </div>
      )}

      {showForm && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm() }}
        >
          <div className="modal-content modal-content--form">
            <div className="modal-header">
              <h3>{editingId !== null ? '編集' : '新規追加'}</h3>
              <button className="modal-close-btn" onClick={closeForm} title="閉じる">✕</button>
            </div>
            <form className="bucket-list__form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="タイトル *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={100}
                autoFocus
              />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <textarea
                placeholder="メモ"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                maxLength={500}
                rows={3}
              />
              <div className="bucket-list__form-actions">
                <button type="submit" className="btn btn--primary">保存</button>
                <button type="button" className="btn" onClick={closeForm}>
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="bucket-list__empty">
          {items.length === 0 ? 'まだアイテムがありません。追加してみましょう！' : 'フィルター条件に一致するアイテムがありません。'}
        </p>
      ) : (
        <ul className="bucket-list__items">
          {filtered.map((item) => (
            <li key={item.id} className={`bucket-list__item bucket-list__item--${item.status === '完了' ? 'done' : 'active'}`}>
              <div className="bucket-list__item-main">
                <button className="bucket-list__status-btn" onClick={() => toggleStatus(item.id)} title="ステータスを変更">
                  {item.status === '完了' ? '✅' : item.status === '進行中' ? '🔄' : '⬜'}
                </button>
                <div className="bucket-list__item-body" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} style={{ cursor: 'pointer' }}>
                  <span className="bucket-list__item-title" style={item.status === '完了' ? { textDecoration: 'line-through' } : undefined}>{item.title}</span>
                  <div className="bucket-list__item-meta">
                    <span className="bucket-list__tag">{item.category}</span>
                    <span className={`bucket-list__tag bucket-list__tag--status-${item.status === '完了' ? 'done' : item.status === '進行中' ? 'wip' : 'todo'}`}>
                      {item.status}
                    </span>
                    {item.deadline && <span className="bucket-list__deadline">📅 {item.deadline}</span>}
                    {(item.actions ?? []).length > 0 && (
                      <span className="bucket-list__action-badge">
                        ⚡ {(item.actions ?? []).filter((a) => a.done).length}/{(item.actions ?? []).length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bucket-list__item-actions">
                  <button className="btn btn--icon" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} title="アクションを見る">
                    {expandedId === item.id ? '▲' : '▼'}
                  </button>
                  <button className="btn btn--icon" onClick={() => handleEdit(item)} title="編集">✏️</button>
                  {deletingId === item.id ? (
                    <span className="bucket-delete-confirm">
                      <button className="delete-confirm-yes" onClick={() => confirmDelete(item.id)}>削除</button>
                      <button className="delete-confirm-no" onClick={() => setDeletingId(null)}>戻る</button>
                    </span>
                  ) : (
                    <button className="btn btn--icon" onClick={() => handleDelete(item.id)} title="削除">🗑️</button>
                  )}
                </div>
              </div>

              {expandedId === item.id && (
                <div className="bucket-list__actions-panel">
                  <ul className="bucket-list__action-list">
                    {(item.actions ?? []).map((action) => (
                      <li key={action.id} className={`bucket-list__action-item ${action.done ? 'done' : ''}`}>
                        <button className="action-check-btn" onClick={() => toggleAction(item.id, action.id)}>
                          {action.done ? '✅' : '⬜'}
                        </button>
                        <span className="action-text">{action.text}</span>
                        <button className="action-delete-btn" onClick={() => deleteAction(item.id, action.id)}>×</button>
                      </li>
                    ))}
                  </ul>
                  <div className="bucket-list__action-input">
                    <input
                      type="text"
                      placeholder="アクションを追加... (Enter)"
                      value={actionInputs[item.id] || ''}
                      onChange={(e) => setActionInputs({ ...actionInputs, [item.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addAction(item.id)}
                      maxLength={100}
                    />
                    <button onClick={() => addAction(item.id)}>追加</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* シェアカードモーダル */}
      {showShareModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowShareModal(false) }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>🎴 シェアカード</h3>
              <button className="modal-close-btn" onClick={() => setShowShareModal(false)} title="閉じる">✕</button>
            </div>
            <div className="modal-settings">
              <label>
                表示名
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={20}
                  placeholder="あなたの名前"
                />
              </label>
              <label>
                アバター絵文字
                <input
                  type="text"
                  value={avatarEmoji}
                  onChange={(e) => setAvatarEmoji(e.target.value)}
                  maxLength={4}
                  placeholder="⚔️"
                  style={{ width: '64px' }}
                />
              </label>
            </div>
            <ShareCard
              userName={userName || 'あなた'}
              avatarEmoji={avatarEmoji || '⚔️'}
              items={items}
              completedCount={completedCount}
            />
          </div>
        </div>
      )}
    </div>
  )
}
