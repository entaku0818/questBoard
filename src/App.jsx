import { useState } from 'react'
import QuestList from './components/QuestList.jsx'
import QuestDetail from './components/QuestDetail.jsx'
import BucketList from './bucket-list.jsx'
import Pyramid from './pyramid.jsx'

const QUESTS_KEY = 'quests'

function loadQuests() {
  try {
    const raw = localStorage.getItem(QUESTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const PAGES = [
  { key: 'bucket', label: '🪣 やりたいこと' },
  { key: 'quests', label: '⚔️ クエスト' },
  { key: 'pyramid', label: '🔺 目標ピラミッド' },
]

export default function App() {
  const [page, setPage] = useState('bucket')
  const [quests, setQuests] = useState(loadQuests)
  const [selectedQuestId, setSelectedQuestId] = useState(null)
  const [newQuestTitle, setNewQuestTitle] = useState('')

  const selectedQuest = quests.find((q) => q.id === selectedQuestId) || null

  function saveQuests(updater) {
    setQuests((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem(QUESTS_KEY, JSON.stringify(next))
      return next
    })
  }

  function addQuest() {
    const title = newQuestTitle.trim()
    if (!title) return
    const id = crypto.randomUUID()
    const quest = {
      id,
      title,
      description: '',
      todos: [],
      createdAt: new Date().toISOString(),
    }
    saveQuests((prev) => [...prev, quest])
    setNewQuestTitle('')
    setSelectedQuestId(id)
  }

  // functional updater インターフェース — stale prop spread を防ぐ (B-06)
  function updateQuest(questId, updater) {
    saveQuests((prev) => prev.map((q) => (q.id === questId ? updater(q) : q)))
  }

  function deleteQuest(questId) {
    saveQuests((prev) => prev.filter((q) => q.id !== questId))
    if (selectedQuestId === questId) setSelectedQuestId(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>⚔️ QuestBoard</h1>
          <p className="app-subtitle">やりたいことをクエストに変えよう</p>
        </div>
        <nav className="app-nav">
          {PAGES.map((p) => (
            <button
              key={p.key}
              className={`app-nav-btn ${page === p.key ? 'active' : ''}`}
              onClick={() => setPage(p.key)}
            >
              {p.label}
            </button>
          ))}
        </nav>
      </header>

      {page === 'quests' && (
        <div className="app-body">
          <aside className="sidebar">
            <div className="add-quest-form">
              <input
                type="text"
                placeholder="新しいクエストを入力..."
                value={newQuestTitle}
                onChange={(e) => setNewQuestTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addQuest()}
              />
              <button onClick={addQuest}>追加</button>
            </div>
            <QuestList
              quests={quests}
              selectedQuestId={selectedQuestId}
              onSelect={setSelectedQuestId}
              onDelete={deleteQuest}
            />
          </aside>
          <main className="main-content">
            {selectedQuest ? (
              <QuestDetail quest={selectedQuest} onUpdate={updateQuest} />
            ) : (
              <div className="empty-state">
                <p>👈 クエストを選択するか、新しいクエストを追加してください</p>
              </div>
            )}
          </main>
        </div>
      )}

      {page === 'bucket' && (
        <div className="page-content page-content--full">
          <BucketList />
        </div>
      )}

      {page === 'pyramid' && (
        <div className="page-content">
          <Pyramid />
        </div>
      )}
    </div>
  )
}
