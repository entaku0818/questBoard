import { useState, useEffect, useRef } from 'react'

const GROUPS = [
  { key: 'today', label: '📅 今日', color: '#e74c3c' },
  { key: 'week', label: '📆 今週', color: '#e67e22' },
  { key: 'someday', label: '🗂️ いつか', color: '#8e44ad' },
]

function calcProgress(todos) {
  if (!todos || todos.length === 0) return 0
  const done = todos.filter((t) => t.done).length
  return Math.round((done / todos.length) * 100)
}

function formatDue(dueDate) {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diff = Math.floor((due - today) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { text: `${Math.abs(diff)}日超過`, cls: 'due-overdue' }
  if (diff === 0) return { text: '今日が期日', cls: 'due-today' }
  if (diff === 1) return { text: '明日が期日', cls: 'due-soon' }
  return { text: `${diff}日後`, cls: 'due-normal' }
}

export default function QuestDetail({ quest, onUpdate }) {
  const [activeTab, setActiveTab] = useState('today')
  const [newTodoText, setNewTodoText] = useState('')
  const [newTodoDue, setNewTodoDue] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(quest.title)
  const [descInput, setDescInput] = useState(quest.description || '')
  const [titleError, setTitleError] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [editingTodoText, setEditingTodoText] = useState('')
  const newTodoInputRef = useRef(null)

  // B-01, B-04, B-08: クエスト切り替え時に全 state をリセット
  useEffect(() => {
    setTitleInput(quest.title)
    setDescInput(quest.description || '')
    setIsEditingTitle(false)
    setActiveTab('today')
    setNewTodoText('')
    setNewTodoDue('')
    setTitleError(false)
    setEditingTodoId(null)
  }, [quest.id])

  const todos = quest.todos ?? [] // B-07: null/undefined guard
  const totalProgress = calcProgress(todos)
  const tabTodos = todos.filter((t) => t.group === activeTab)
  const tabIncomplete = tabTodos.filter((t) => !t.done).length // E-09: 未完了のみカウント
  const tabDone = tabTodos.filter((t) => t.done).length
  const tabProgress = tabTodos.length === 0 ? 0 : Math.round((tabDone / tabTodos.length) * 100)
  const currentGroup = GROUPS.find((g) => g.key === activeTab)

  function addTodo() {
    const text = newTodoText.trim()
    if (!text) return
    const id = crypto.randomUUID()
    const todo = {
      id,
      text,
      group: activeTab,
      dueDate: newTodoDue || null,
      done: false,
      createdAt: new Date().toISOString(),
    }
    // B-06: functional updater でstale prop防止
    onUpdate(quest.id, (q) => ({ ...q, todos: [...(q.todos ?? []), todo] }))
    setNewTodoText('')
    setNewTodoDue('')
    // U-06: TODO追加後にフォーカスを戻す
    setTimeout(() => newTodoInputRef.current?.focus(), 0)
  }

  function toggleTodo(todoId) {
    onUpdate(quest.id, (q) => ({
      ...q,
      todos: (q.todos ?? []).map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)),
    }))
  }

  function deleteTodo(todoId) {
    onUpdate(quest.id, (q) => ({
      ...q,
      todos: (q.todos ?? []).filter((t) => t.id !== todoId),
    }))
  }

  function saveTodoText(todoId) {
    const text = editingTodoText.trim()
    if (!text) { setEditingTodoId(null); return }
    onUpdate(quest.id, (q) => ({
      ...q,
      todos: (q.todos ?? []).map((t) => (t.id === todoId ? { ...t, text } : t)),
    }))
    setEditingTodoId(null)
  }

  function updateTodoDue(todoId, dueDate) {
    onUpdate(quest.id, (q) => ({
      ...q,
      todos: (q.todos ?? []).map((t) => (t.id === todoId ? { ...t, dueDate: dueDate || null } : t)),
    }))
  }

  function updateTodoGroup(todoId, group) {
    onUpdate(quest.id, (q) => ({
      ...q,
      todos: (q.todos ?? []).map((t) => (t.id === todoId ? { ...t, group } : t)),
    }))
  }

  function saveTitle() {
    const title = titleInput.trim()
    if (!title) {
      setTitleError(true) // B-02: 空タイトルのフィードバック
      return
    }
    onUpdate(quest.id, (q) => ({ ...q, title, description: descInput }))
    setIsEditingTitle(false)
    setTitleError(false)
  }

  function cancelTitleEdit() {
    // U-08: キャンセルで元の値に戻す
    setTitleInput(quest.title)
    setDescInput(quest.description || '')
    setIsEditingTitle(false)
    setTitleError(false)
  }

  return (
    <div className="quest-detail">
      {/* タイトル・全体進捗 */}
      <div className="quest-detail-header">
        {isEditingTitle ? (
          <div className="title-edit">
            <input
              className={`title-input ${titleError ? 'input-error' : ''}`}
              value={titleInput}
              onChange={(e) => { setTitleInput(e.target.value); setTitleError(false) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle()
                if (e.key === 'Escape') cancelTitleEdit()
              }}
              maxLength={100}
              autoFocus
            />
            {titleError && <p className="field-error">タイトルは必須です</p>}
            <textarea
              className="desc-input"
              placeholder="クエストの説明（任意）"
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              rows={2}
              maxLength={500}
            />
            <div className="title-edit-actions">
              <button onClick={saveTitle}>保存</button>
              <button className="cancel-btn" onClick={cancelTitleEdit}>キャンセル</button>
            </div>
          </div>
        ) : (
          <div className="title-display" onClick={() => setIsEditingTitle(true)}>
            <h2>{quest.title}</h2>
            {quest.description && <p className="quest-desc">{quest.description}</p>}
            <span className="edit-hint">クリックして編集</span>
          </div>
        )}
        <div className="progress-section">
          <div className="progress-bar-large-wrap">
            <div
              className="progress-bar-large"
              style={{
                width: `${totalProgress}%`,
                backgroundColor: totalProgress === 100 ? '#27ae60' : '#3498db',
              }}
            />
          </div>
          <span className="progress-pct">{totalProgress}%</span>
        </div>
      </div>

      {/* タブヘッダー */}
      <div className="tab-header">
        {GROUPS.map((g) => {
          const incomplete = todos.filter((t) => t.group === g.key && !t.done).length
          return (
            <button
              key={g.key}
              className={`tab-btn ${activeTab === g.key ? 'active' : ''}`}
              style={{ '--tab-accent': g.color }}
              onClick={() => setActiveTab(g.key)}
              aria-selected={activeTab === g.key}
            >
              {g.label}
              {incomplete > 0 && (
                <span
                  className="tab-badge"
                  style={{ background: activeTab === g.key ? g.color : undefined }}
                >
                  {incomplete}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* タブ進捗バー */}
      <div className="tab-progress-wrap">
        <div
          className="tab-progress-bar"
          style={{
            width: `${tabProgress}%`,
            background: tabProgress === 100 ? '#27ae60' : currentGroup.color,
            transition: 'width 0.3s',
          }}
        />
      </div>
      <span className="tab-progress-label">
        {tabDone}/{tabTodos.length} 完了 ({tabProgress}%)
        {tabIncomplete > 0 && <span className="tab-remaining"> · 残り{tabIncomplete}件</span>}
      </span>

      {/* インライン追加フォーム */}
      <div className="add-todo-inline">
        <input
          ref={newTodoInputRef}
          type="text"
          placeholder={`${currentGroup.label} に追加...`}
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          maxLength={200}
        />
        <input
          type="date"
          value={newTodoDue}
          onChange={(e) => setNewTodoDue(e.target.value)}
          title="期日（任意）"
        />
        <button onClick={addTodo}>追加</button>
      </div>

      {/* TODOリスト */}
      {tabTodos.length === 0 ? (
        <div className="todo-empty-v2">
          <span>📭</span>
          <p>このグループにTODOはありません</p>
          <p className="todo-empty-hint">上のフォームから追加できます</p>
        </div>
      ) : (
        <ul className="todo-list-v2">
          {tabTodos.map((todo) => {
            const dueInfo = formatDue(todo.dueDate)
            const isEditing = editingTodoId === todo.id
            return (
              <li key={todo.id} className={`todo-item-v2 ${todo.done ? 'done' : ''}`}>
                <button
                  className="todo-check-btn"
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={todo.done ? '未完了に戻す' : '完了にする'}
                >
                  {todo.done ? '✅' : '⬜'}
                </button>
                <div className="todo-body">
                  {isEditing ? (
                    <input
                      className="todo-edit-input"
                      value={editingTodoText}
                      onChange={(e) => setEditingTodoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTodoText(todo.id)
                        if (e.key === 'Escape') setEditingTodoId(null)
                      }}
                      onBlur={() => saveTodoText(todo.id)}
                      maxLength={200}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="todo-text-v2"
                      onDoubleClick={() => {
                        setEditingTodoId(todo.id)
                        setEditingTodoText(todo.text)
                      }}
                      title="ダブルクリックで編集"
                    >
                      {todo.text}
                    </span>
                  )}
                  {dueInfo && (
                    <div className="todo-badges">
                      <span className={`badge badge--due ${dueInfo.cls}`}>📅 {dueInfo.text}</span>
                    </div>
                  )}
                </div>
                <div className="todo-actions">
                  <input
                    type="date"
                    className="due-input"
                    value={todo.dueDate || ''}
                    onChange={(e) => updateTodoDue(todo.id, e.target.value)}
                    title="期日変更"
                  />
                  <select
                    className="group-select"
                    value={todo.group}
                    onChange={(e) => updateTodoGroup(todo.id, e.target.value)}
                    title="移動"
                  >
                    {GROUPS.map((g) => (
                      <option key={g.key} value={g.key}>{g.label}</option>
                    ))}
                  </select>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTodo(todo.id)}
                    aria-label="TODOを削除"
                    title="削除"
                  >
                    ×
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
