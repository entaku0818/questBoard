import { useState, useEffect } from 'react'
import ShareCard from './components/ShareCard.jsx'

const STORAGE_KEY = 'questboard-bucket-list'

const CATEGORIES = ['旅行', '学習', '体験', '創作', '健康', 'その他']
const STATUSES = ['未着手', '進行中', '完了']

export default function BucketList() {
  const [items, setItems] = useState(() => {
    try {
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
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [onboarding, setOnboarding] = useState(() => {
    return localStorage.getItem('questboard-onboarding-done') !== 'true'
  })
  const [rapidInput, setRapidInput] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Escキーでモーダルを閉じる
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = form.title.trim()
    if (!trimmed) return

    if (editingId !== null) {
      setItems(items.map((item) =>
        item.id === editingId ? { ...item, ...form, title: trimmed } : item
      ))
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        ...form,
        title: trimmed,
        createdAt: new Date().toISOString(),
      }
      setItems([...items, newItem])
    }
    resetForm()
    setShowForm(false)
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

  const toggleStatus = (id) => {
    const item = items.find((i) => i.id === id)
    const next = { '未着手': '進行中', '進行中': '完了', '完了': '未着手' }
    const newStatus = next[item.status]
    setItems(items.map((i) => i.id !== id ? i : { ...i, status: newStatus }))
    // E-07: フィルター中にステータス変更して消える場合にフィードバック
    if (filterStatus !== 'すべて' && filterStatus !== newStatus) {
      showToast(`「${item.title}」を「${newStatus}」に変更しました（フィルターにより非表示）`)
    }
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
      <div className="bucket-list__header">
        <h2>やりたいことリスト</h2>
        <p className="bucket-list__progress">
          {completedCount} / {items.length} 達成
        </p>
      </div>

      <div className="bucket-list__filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option>すべて</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option>すべて</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn--primary" onClick={() => { resetForm(); setShowForm(true) }}>
          ＋ 追加
        </button>
        <button className="btn" onClick={() => setShowShareModal(true)}>
          🎴 シェアカードを見る
        </button>
      </div>

      {showForm && (
        <form className="bucket-list__form" onSubmit={handleSubmit}>
          <h3>{editingId !== null ? '編集' : '新規追加'}</h3>
          <input
            type="text"
            placeholder="タイトル *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            maxLength={100}
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
            <button type="button" className="btn" onClick={() => { resetForm(); setShowForm(false) }}>
              キャンセル
            </button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <p className="bucket-list__empty">
          {items.length === 0 ? 'まだアイテムがありません。追加してみましょう！' : 'フィルター条件に一致するアイテムがありません。'}
        </p>
      ) : (
        <ul className="bucket-list__items">
          {filtered.map((item) => (
            <li key={item.id} className={`bucket-list__item bucket-list__item--${item.status === '完了' ? 'done' : 'active'}`}>
              <button className="bucket-list__status-btn" onClick={() => toggleStatus(item.id)} title="ステータスを変更">
                {item.status === '完了' ? '✅' : item.status === '進行中' ? '🔄' : '⬜'}
              </button>
              <div className="bucket-list__item-body">
                <span className="bucket-list__item-title">{item.title}</span>
                <div className="bucket-list__item-meta">
                  <span className="bucket-list__tag">{item.category}</span>
                  <span className={`bucket-list__tag bucket-list__tag--status-${item.status === '完了' ? 'done' : item.status === '進行中' ? 'wip' : 'todo'}`}>
                    {item.status}
                  </span>
                  {item.deadline && <span className="bucket-list__deadline">📅 {item.deadline}</span>}
                </div>
                {item.notes && <p className="bucket-list__notes">{item.notes}</p>}
              </div>
              <div className="bucket-list__item-actions">
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
            />
          </div>
        </div>
      )}
    </div>
  )
}
