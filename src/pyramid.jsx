import { useState, useEffect } from 'react'

const STORAGE_KEY = 'questboard-pyramid'
const DEFAULT_DATA = { dream: [], goal: [], task: [] }

const TIERS = [
  { id: 'dream', label: '夢', sublabel: '長期の夢・ビジョン', color: '#aa3bff', emoji: '✨' },
  { id: 'goal', label: '目標', sublabel: '1〜3年の目標', color: '#3b82f6', emoji: '🎯' },
  { id: 'task', label: 'タスク', sublabel: '今すぐできること', color: '#10b981', emoji: '📝' },
]

export default function Pyramid() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : DEFAULT_DATA
    } catch {
      return DEFAULT_DATA
    }
  })
  const [activeTier, setActiveTier] = useState(null)
  const [inputText, setInputText] = useState('')
  const [editTarget, setEditTarget] = useState(null) // { tier, id }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const handleAddClick = (tierId) => {
    setActiveTier(tierId)
    setInputText('')
    setEditTarget(null)
  }

  const handleEditClick = (tierId, item) => {
    setActiveTier(tierId)
    setInputText(item.text)
    setEditTarget({ tier: tierId, id: item.id })
  }

  const handleSave = () => {
    const trimmed = inputText.trim()
    if (!trimmed || !activeTier) return

    if (editTarget) {
      setData((prev) => ({
        ...prev,
        [editTarget.tier]: prev[editTarget.tier].map((item) =>
          item.id === editTarget.id ? { ...item, text: trimmed } : item
        ),
      }))
    } else {
      const newItem = { id: Date.now(), text: trimmed, createdAt: new Date().toISOString() }
      setData((prev) => ({
        ...prev,
        [activeTier]: [...prev[activeTier], newItem],
      }))
    }
    setActiveTier(null)
    setInputText('')
    setEditTarget(null)
  }

  const handleDelete = (tierId, itemId) => {
    if (!window.confirm('削除しますか？')) return
    setData((prev) => ({
      ...prev,
      [tierId]: prev[tierId].filter((item) => item.id !== itemId),
    }))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setActiveTier(null)
      setInputText('')
      setEditTarget(null)
    }
  }

  const totalItems = TIERS.reduce((sum, t) => sum + data[t.id].length, 0)

  return (
    <div className="pyramid">
      <div className="pyramid__header">
        <h2>目標ピラミッド</h2>
        <p className="pyramid__subtitle">夢を目標に、目標をタスクに分解しましょう</p>
        <span className="pyramid__count">合計 {totalItems} 件</span>
      </div>

      <div className="pyramid__tiers">
        {TIERS.map((tier, index) => {
          const isActive = activeTier === tier.id
          const items = data[tier.id]
          const widthPercent = 40 + index * 30 // dream=40%, goal=70%, task=100%

          return (
            <div
              key={tier.id}
              className="pyramid__tier"
              style={{ '--tier-color': tier.color, '--tier-width': `${widthPercent}%` }}
            >
              <div className="pyramid__tier-shape">
                <div className="pyramid__tier-header">
                  <span className="pyramid__tier-emoji">{tier.emoji}</span>
                  <div>
                    <strong className="pyramid__tier-label">{tier.label}</strong>
                    <span className="pyramid__tier-sublabel">{tier.sublabel}</span>
                  </div>
                  <span className="pyramid__tier-badge">{items.length}</span>
                  <button
                    className="btn btn--icon"
                    onClick={() => handleAddClick(tier.id)}
                    title={`${tier.label}を追加`}
                  >
                    ＋
                  </button>
                </div>

                {isActive && (
                  <div className="pyramid__input-area">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`${tier.label}を入力… (Enterで保存)`}
                      autoFocus
                      maxLength={200}
                    />
                    <button className="btn btn--primary btn--sm" onClick={handleSave}>保存</button>
                    <button className="btn btn--sm" onClick={() => { setActiveTier(null); setInputText('') }}>
                      ✕
                    </button>
                  </div>
                )}

                {items.length > 0 && (
                  <ul className="pyramid__items">
                    {items.map((item) => (
                      <li key={item.id} className="pyramid__item">
                        <span className="pyramid__item-text">{item.text}</span>
                        <div className="pyramid__item-actions">
                          <button
                            className="btn btn--icon btn--sm"
                            onClick={() => handleEditClick(tier.id, item)}
                            title="編集"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn--icon btn--sm"
                            onClick={() => handleDelete(tier.id, item.id)}
                            title="削除"
                          >
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
