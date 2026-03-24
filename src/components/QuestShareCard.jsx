import { useState } from 'react'

function calcProgress(todos) {
  if (!todos || todos.length === 0) return 0
  const done = todos.filter((t) => t.done).length
  return Math.round((done / todos.length) * 100)
}

export default function QuestShareCard({ quest, onClose }) {
  const [copied, setCopied] = useState(false)

  const todos = quest.todos ?? []
  const pct = calcProgress(todos)
  const doneTodos = todos.filter((t) => t.done)
  const pendingTodos = todos.filter((t) => !t.done)

  // 表示: 完了→未完了の順に上位6件
  const topTodos = [...doneTodos, ...pendingTodos].slice(0, 6)

  function buildShareText() {
    const lines = topTodos.map((t) => `${t.done ? '✅' : '⬜'} ${t.text}`)
    return [
      `⚔️ ${quest.title}`,
      `進捗: ${pct}% (${doneTodos.length}/${todos.length} 完了)`,
      '',
      ...lines,
      todos.length > 6 ? `他 ${todos.length - 6} 件` : '',
      '',
      '#QuestBoard',
    ].filter((l) => l !== undefined).join('\n').trim()
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildShareText())
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
      .catch(() => {})
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>⚔️ クエストをシェア</h3>
          <button className="modal-close-btn" onClick={onClose} title="閉じる">✕</button>
        </div>

        {/* カード本体 */}
        <div className="quest-share-card">
          {/* グロー装飾 */}
          <div className="quest-share-card__glow quest-share-card__glow--top" />
          <div className="quest-share-card__glow quest-share-card__glow--bottom" />

          {/* ヘッダー */}
          <div className="quest-share-card__header">
            <span className="quest-share-card__icon">⚔️</span>
            <div>
              <div className="quest-share-card__title">{quest.title}</div>
              {quest.description && (
                <div className="quest-share-card__desc">{quest.description}</div>
              )}
            </div>
            <div className="quest-share-card__brand">QuestBoard</div>
          </div>

          {/* 進捗 */}
          <div className="quest-share-card__progress-box">
            <div className="quest-share-card__progress-nums">
              <span className="quest-share-card__pct-num">{pct}</span>
              <span className="quest-share-card__pct-unit">%</span>
              <span className="quest-share-card__done-label">
                {doneTodos.length}/{todos.length} 完了
              </span>
            </div>
            <div className="quest-share-card__bar-wrap">
              <div
                className="quest-share-card__bar"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? '#10b981' : 'linear-gradient(90deg, #aa3bff, #3b82f6)',
                }}
              />
            </div>
            {pct === 100 && (
              <div className="quest-share-card__complete-badge">🏆 クエスト完了！</div>
            )}
          </div>

          {/* TODOリスト */}
          {topTodos.length > 0 && (
            <ul className="quest-share-card__todos">
              {topTodos.map((t) => (
                <li key={t.id} className={`quest-share-card__todo ${t.done ? 'done' : ''}`}>
                  <span>{t.done ? '✅' : '⬜'}</span>
                  <span className="quest-share-card__todo-text">{t.text}</span>
                </li>
              ))}
              {todos.length > 6 && (
                <li className="quest-share-card__todo-more">他 {todos.length - 6} 件</li>
              )}
            </ul>
          )}

          {/* フッター */}
          <div className="quest-share-card__footer">#QuestBoard #やりたいことリスト</div>
        </div>

        {/* アクション */}
        <div className="share-card-actions">
          <button className="share-action-btn share-action-btn--primary" onClick={handleCopy}>
            {copied ? '✅ コピーしました！' : '📋 テキストをコピー'}
          </button>
          <a
            className="share-action-btn"
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            𝕏 ポストする
          </a>
        </div>
        <p className="share-hint">📸 カードをスクリーンショットして画像シェアも可能</p>
      </div>
    </div>
  )
}
