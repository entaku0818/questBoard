import { useState } from 'react'

function calcProgress(todos) {
  if (!todos || todos.length === 0) return 0
  const done = todos.filter((t) => t.done).length
  return Math.round((done / todos.length) * 100)
}

export default function QuestList({ quests, selectedQuestId, onSelect, onDelete }) {
  const [confirmId, setConfirmId] = useState(null)

  if (quests.length === 0) {
    return <p className="quest-list-empty">クエストがまだありません</p>
  }

  function handleDeleteClick(e, questId) {
    e.stopPropagation()
    setConfirmId(questId)
  }

  function handleConfirm(e, questId) {
    e.stopPropagation()
    onDelete(questId)
    setConfirmId(null)
  }

  function handleCancel(e) {
    e.stopPropagation()
    setConfirmId(null)
  }

  return (
    <ul className="quest-list">
      {quests.map((quest) => {
        const progress = calcProgress(quest.todos)
        const isSelected = quest.id === selectedQuestId
        const isConfirming = confirmId === quest.id
        return (
          <li
            key={quest.id}
            className={`quest-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(quest.id)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && onSelect(quest.id)}
          >
            <div className="quest-item-header">
              <span className="quest-item-title">{quest.title}</span>
              {isConfirming ? (
                <span className="delete-confirm" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="delete-confirm-yes"
                    onClick={(e) => handleConfirm(e, quest.id)}
                    title="削除を確定"
                  >
                    削除
                  </button>
                  <button className="delete-confirm-no" onClick={handleCancel} title="キャンセル">
                    戻る
                  </button>
                </span>
              ) : (
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteClick(e, quest.id)}
                  aria-label={`${quest.title}を削除`}
                  title="削除"
                >
                  ×
                </button>
              )}
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">{progress}% 達成</span>
          </li>
        )
      })}
    </ul>
  )
}
