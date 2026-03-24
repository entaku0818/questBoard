function calcProgress(todos) {
  if (!todos || todos.length === 0) return 0
  const done = todos.filter((t) => t.done).length
  return Math.round((done / todos.length) * 100)
}

export default function QuestList({ quests, selectedQuestId, onSelect, onDelete }) {
  if (quests.length === 0) {
    return <p className="quest-list-empty">クエストがまだありません</p>
  }

  return (
    <ul className="quest-list">
      {quests.map((quest) => {
        const progress = calcProgress(quest.todos)
        const isSelected = quest.id === selectedQuestId
        return (
          <li
            key={quest.id}
            className={`quest-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(quest.id)}
          >
            <div className="quest-item-header">
              <span className="quest-item-title">{quest.title}</span>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(quest.id)
                }}
                title="削除"
              >
                ×
              </button>
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
