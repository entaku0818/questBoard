/**
 * ShareCard.jsx — SNSシェア用カード
 *
 * 仕様:
 *   - ユーザー名・アバター絵文字・やりたいことリスト上位5件・達成数/総数を表示
 *   - html2canvas / dom-to-image 不使用（スクリーンショット前提）
 *   - ダークグラデーション背景で SNS 映えするデザイン
 *
 * Props:
 *   userName    {string}  - 表示名 例: "田中太郎"
 *   avatarEmoji {string}  - アバター絵文字 例: "🧗"
 *   items       {Array}   - bucket-list の items 配列
 *                           各要素: { id, title, category, status('未着手'|'進行中'|'完了') }
 *
 * 使い方:
 *   <ShareCard userName="田中太郎" avatarEmoji="🧗" items={bucketItems} />
 */

const STATUS_ICON = {
  '完了':  { icon: '✅', color: '#10b981' },
  '進行中': { icon: '🔄', color: '#f59e0b' },
  '未着手': { icon: '⬜', color: '#6b7280' },
}

const CATEGORY_COLOR = {
  '旅行': '#3b82f6',
  '学習': '#8b5cf6',
  '体験': '#ec4899',
  '創作': '#f97316',
  '健康': '#10b981',
  'その他': '#6b7280',
}

// ── 進捗バー（純CSS、外部依存なし） ─────────────────────────────────
function ProgressBar({ pct }) {
  const color = pct === 100 ? '#10b981' : pct >= 50 ? '#aa3bff' : '#3b82f6'
  return (
    <div style={{
      width: '100%',
      height: '6px',
      background: 'rgba(255,255,255,0.12)',
      borderRadius: '3px',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        borderRadius: '3px',
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

// ── メインコンポーネント ─────────────────────────────────────────────
export default function ShareCard({ userName = 'あなた', avatarEmoji = '⚔️', items = [] }) {
  const totalCount    = items.length
  const achievedCount = items.filter((i) => i.status === '完了').length
  const pct           = totalCount === 0 ? 0 : Math.round((achievedCount / totalCount) * 100)

  // 表示優先順: 完了 → 進行中 → 未着手 の順に上位5件
  const topItems = [
    ...items.filter((i) => i.status === '完了'),
    ...items.filter((i) => i.status === '進行中'),
    ...items.filter((i) => i.status === '未着手'),
  ].slice(0, 5)

  // テキストシェア用
  function buildShareText() {
    const lines = topItems.map((i) => {
      const s = STATUS_ICON[i.status]?.icon ?? '⬜'
      return `${s} ${i.title}`
    })
    return [
      `${avatarEmoji} ${userName}のやりたいことリスト`,
      `達成: ${achievedCount}/${totalCount}件 (${pct}%)`,
      '',
      ...lines,
      '',
      '#QuestBoard #やりたいことリスト',
    ].join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildShareText())
      .then(() => alert('テキストをコピーしました！'))
      .catch(() => alert('コピーに失敗しました'))
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`

  // ── カード本体はすべてインラインスタイル（スクリーンショット時に確実に反映） ──
  return (
    <div className="share-card-wrapper">

      {/* ══════════════ カード本体（ここをスクリーンショット） ══════════════ */}
      <div
        className="share-card-body"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(145deg, #12002b 0%, #1e1b4b 45%, #0c1a35 100%)',
          borderRadius: '20px',
          padding: '28px 28px 24px',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          /* スクリーンショット撮影時に映える影 */
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(170,59,255,0.2)',
        }}
      >
        {/* 装飾: 右上グロー */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(170,59,255,0.35) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {/* 装飾: 左下グロー */}
        <div style={{
          position: 'absolute', bottom: '-30px', left: '-30px',
          width: '140px', height: '140px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* ── ヘッダー: アバター + ユーザー名 + ブランド ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* アバター */}
            <div style={{
              width: '44px', height: '44px',
              background: 'rgba(170,59,255,0.2)',
              border: '2px solid rgba(170,59,255,0.5)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px',
            }}>
              {avatarEmoji}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                {userName}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '0.5px' }}>
                やりたいことリスト
              </div>
            </div>
          </div>

          {/* ブランドロゴ */}
          <div style={{
            fontSize: '11px', color: '#6b7280',
            letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>
            ⚔️ QuestBoard
          </div>
        </div>

        {/* ── 達成カウンター ── */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '18px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: pct === 100 ? '#10b981' : '#fff', lineHeight: 1 }}>
                {achievedCount}
              </span>
              <span style={{ fontSize: '16px', color: '#9ca3af' }}>
                / {totalCount} 達成
              </span>
            </div>
            <span style={{
              fontSize: '14px', fontWeight: 700,
              color: pct === 100 ? '#10b981' : '#c084fc',
              background: pct === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(170,59,255,0.15)',
              padding: '3px 10px', borderRadius: '20px',
            }}>
              {pct === 100 ? '🏆 ALL DONE' : `${pct}%`}
            </span>
          </div>
          <ProgressBar pct={pct} />
        </div>

        {/* ── やりたいことリスト上位5件 ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', padding: '16px 0' }}>
              やりたいことを追加しましょう！
            </div>
          ) : (
            topItems.map((item, idx) => {
              const st = STATUS_ICON[item.status] ?? STATUS_ICON['未着手']
              const catColor = CATEGORY_COLOR[item.category] ?? CATEGORY_COLOR['その他']
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px',
                    background: idx === 0 && item.status !== '完了'
                      ? 'rgba(170,59,255,0.12)'   // 一番上（次の挑戦）を薄くハイライト
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${idx === 0 && item.status !== '完了'
                      ? 'rgba(170,59,255,0.3)'
                      : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '8px',
                  }}
                >
                  {/* ステータスアイコン */}
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{st.icon}</span>

                  {/* タイトル */}
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    color: item.status === '完了' ? '#9ca3af' : '#e5e7eb',
                    textDecoration: item.status === '完了' ? 'line-through' : 'none',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.title}
                  </span>

                  {/* カテゴリバッジ */}
                  <span style={{
                    fontSize: '10px', flexShrink: 0,
                    padding: '2px 7px', borderRadius: '4px',
                    background: `${catColor}22`,
                    color: catColor,
                    border: `1px solid ${catColor}44`,
                  }}>
                    {item.category}
                  </span>
                </div>
              )
            })
          )}

          {/* 残件数の表示 */}
          {totalCount > 5 && (
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              他 {totalCount - 5} 件
            </div>
          )}
        </div>

        {/* ── フッター ── */}
        <div style={{
          marginTop: '18px', paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'flex-end',
          fontSize: '11px', color: '#4b5563',
          gap: '8px',
        }}>
          <span>#QuestBoard</span>
          <span>#やりたいことリスト</span>
        </div>
      </div>

      {/* ══════════════ シェアアクション ══════════════ */}
      <div className="share-card-actions">
        <button className="share-action-btn share-action-btn--primary" onClick={handleCopy}>
          📋 テキストをコピー
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

      {/* ヒント */}
      <p className="share-hint">
        📸 カードをスクリーンショットして画像としてシェアできます
      </p>
    </div>
  )
}
