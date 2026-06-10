import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET(req) {
  const { searchParams } = new URL(req.url)
  const count = parseInt(searchParams.get('count') ?? '0', 10)
  const total = parseInt(searchParams.get('total') ?? '0', 10)

  const hasData = total > 0
  const pct = hasData ? Math.round((count / total) * 100) : 0
  const subtitle = hasData
    ? `${count} / ${total} 件達成 (${pct}%)`
    : 'あなたのやりたいことリストを作ろう'
  const barColor = pct === 100 ? '#10b981' : '#f43f5e'

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', background: 'linear-gradient(145deg,#1a0008,#1f0710,#0f0008)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* グロー装飾 */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(244,63,94,0.3) 0%,transparent 65%)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 65%)', display: 'flex' }} />

        {/* ロゴ */}
        <div style={{ fontSize: '52px', marginBottom: '8px', display: 'flex' }}>🪣</div>
        <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#fff', marginBottom: '24px', display: 'flex', letterSpacing: '2px' }}>QuestBoard</div>

        {/* 達成数 */}
        {hasData ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '96px', fontWeight: '800', color: pct === 100 ? '#10b981' : '#fff', lineHeight: '1', display: 'flex' }}>{count}</span>
              <span style={{ fontSize: '40px', color: '#9ca3af', display: 'flex' }}>/ {total} 達成</span>
              <span style={{ fontSize: '32px', fontWeight: '700', color: barColor, background: `${barColor}22`, padding: '6px 16px', borderRadius: '24px', display: 'flex', marginLeft: '8px' }}>
                {pct === 100 ? '🏆 ALL DONE' : `${pct}%`}
              </span>
            </div>
            {/* プログレスバー */}
            <div style={{ width: '600px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', display: 'flex' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${barColor},${barColor}cc)`, borderRadius: '6px', display: 'flex' }} />
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '40px', color: '#9ca3af', display: 'flex' }}>{subtitle}</div>
        )}

        <div style={{ position: 'absolute', bottom: '32px', fontSize: '24px', color: '#4b5563', display: 'flex', letterSpacing: '1px' }}>myquestboard.entaku.app</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
