import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

export default function handler(req) {
  const { searchParams } = new URL(req.url)
  const count = searchParams.get('count')
  const subtitle = count
    ? `${count}個のやりたいことを達成中！`
    : 'あなたのやりたいことリストを作ろう'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#1a1a2e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* ゴールドライン 上 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '8px',
          background: '#f0c040', display: 'flex',
        }} />
        {/* ゴールドライン 下 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px',
          background: '#f0c040', display: 'flex',
        }} />

        {/* エンブレム */}
        <div style={{ fontSize: '72px', marginBottom: '16px', display: 'flex' }}>⚔</div>

        {/* タイトル */}
        <div style={{
          fontSize: '96px',
          fontWeight: 'bold',
          color: '#f0c040',
          marginBottom: '28px',
          display: 'flex',
          letterSpacing: '4px',
        }}>
          QuestBoard
        </div>

        {/* サブタイトル */}
        <div style={{
          fontSize: '40px',
          color: '#c0c0d0',
          display: 'flex',
        }}>
          {subtitle}
        </div>

        {/* フッターURL */}
        <div style={{
          position: 'absolute',
          bottom: '28px',
          fontSize: '22px',
          color: '#5050a0',
          display: 'flex',
        }}>
          quest-board.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
