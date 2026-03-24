/**
 * TodoTabs.jsx — デザイン提案
 *
 * 変更点:
 *   - 今日 / 今週 / いつか を縦積みセクション → タブに変更
 *   - アクティブタブに「グループ進捗バー」を表示
 *   - 各TODOに「やりたいこと（クエスト）」への紐づけバッジを表示
 *   - タブヘッダーにTODO残数バッジ
 *
 * 受け取る props:
 *   todos        - このクエストのtodo配列
 *   questTitle   - 親クエストのタイトル（紐づけ表示用）
 *   onToggle     - (todoId) => void
 *   onDelete     - (todoId) => void
 *   onChangeGroup- (todoId, group) => void
 *   onChangeDue  - (todoId, dueDate) => void
 *   onAdd        - (text, group, dueDate) => void
 */

import { useState } from 'react'

const TABS = [
  { key: 'today',   label: '今日',  emoji: '🔴', accent: '#e74c3c' },
  { key: 'week',    label: '今週',  emoji: '🟠', accent: '#e67e22' },
  { key: 'someday', label: 'いつか', emoji: '🟣', accent: '#aa3bff' },
]

function calcTabProgress(todos, tabKey) {
  const group = todos.filter((t) => t.group === tabKey)
  if (group.length === 0) return { total: 0, done: 0, pct: 0 }
  const done = group.filter((t) => t.done).length
  return { total: group.length, done, pct: Math.round((done / group.length) * 100) }
}

function formatDue(dueDate) {
  if (!dueDate) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diff = Math.floor((due - today) / 86400000)
  if (diff < 0)  return { text: `${Math.abs(diff)}日超過`, cls: 'due-overdue' }
  if (diff === 0) return { text: '今日',   cls: 'due-today' }
  if (diff === 1) return { text: '明日',   cls: 'due-soon' }
  return { text: `${diff}日後`, cls: 'due-normal' }
}

// ── TODOアイテム（紐づけバッジ付き） ──────────────────────────────────
function TodoItemV2({ todo, questTitle, onToggle, onDelete, onChangeGroup, onChangeDue }) {
  const dueInfo = formatDue(todo.dueDate)

  return (
    <li className={`todo-item-v2 ${todo.done ? 'done' : ''}`}>
      {/* チェックボックス */}
      <button
        className="todo-check-btn"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.done ? '未完了に戻す' : '完了にする'}
      >
        {todo.done ? '✅' : '⬜'}
      </button>

      {/* テキスト本体 */}
      <div className="todo-body">
        <span className="todo-text-v2">{todo.text}</span>

        {/* ── 紐づけバッジ & 期日 ── */}
        <div className="todo-badges">
          {/* やりたいこと紐づけ */}
          <span className="badge badge--quest" title="紐づいているやりたいこと">
            ⚔️ {questTitle}
          </span>

          {/* 期日バッジ */}
          {dueInfo && (
            <span className={`badge badge--due ${dueInfo.cls}`}>{dueInfo.text}</span>
          )}
        </div>
      </div>

      {/* アクション（期日変更 / グループ移動 / 削除） */}
      <div className="todo-actions">
        <input
          type="date"
          className="due-input"
          value={todo.dueDate || ''}
          onChange={(e) => onChangeDue(todo.id, e.target.value)}
          title="期日"
        />
        <select
          className="group-select"
          value={todo.group}
          onChange={(e) => onChangeGroup(todo.id, e.target.value)}
          title="グループ変更"
        >
          {TABS.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
        <button className="delete-btn" onClick={() => onDelete(todo.id)} title="削除">×</button>
      </div>
    </li>
  )
}

// ── メインコンポーネント ─────────────────────────────────────────────
export default function TodoTabs({ todos = [], questTitle, onToggle, onDelete, onChangeGroup, onChangeDue, onAdd }) {
  const [activeTab, setActiveTab]   = useState('today')
  const [inputText, setInputText]   = useState('')
  const [inputDue,  setInputDue]    = useState('')

  const activeTabDef = TABS.find((t) => t.key === activeTab)
  const progress     = calcTabProgress(todos, activeTab)
  const visibleTodos = todos.filter((t) => t.group === activeTab)

  function handleAdd() {
    const text = inputText.trim()
    if (!text) return
    onAdd(text, activeTab, inputDue || null)
    setInputText('')
    setInputDue('')
  }

  return (
    <div className="todo-tabs">
      {/* ── タブヘッダー ── */}
      <div className="tab-header" role="tablist">
        {TABS.map((tab) => {
          const { total, done } = calcTabProgress(todos, tab.key)
          const remaining = total - done
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              style={{ '--tab-accent': tab.accent }}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-emoji">{tab.emoji}</span>
              <span className="tab-label">{tab.label}</span>
              {remaining > 0 && (
                <span className="tab-badge">{remaining}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── アクティブタブの進捗バー ── */}
      <div className="tab-progress-wrap">
        <div
          className="tab-progress-bar"
          style={{
            width: `${progress.pct}%`,
            backgroundColor: activeTabDef.accent,
            transition: 'width 0.4s ease',
          }}
        />
        <span className="tab-progress-label">
          {progress.done} / {progress.total} 完了 ({progress.pct}%)
        </span>
      </div>

      {/* ── TODO追加フォーム（タブ内） ── */}
      <div className="add-todo-inline">
        <input
          type="text"
          placeholder={`「${activeTabDef.label}」のTODOを追加…`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="date"
          value={inputDue}
          onChange={(e) => setInputDue(e.target.value)}
          title="期日"
        />
        <button
          className="btn btn--primary btn--sm"
          onClick={handleAdd}
          style={{ '--btn-bg': activeTabDef.accent }}
        >
          ＋
        </button>
      </div>

      {/* ── TODOリスト ── */}
      <ul className="todo-list-v2">
        {visibleTodos.length === 0 ? (
          <li className="todo-empty-v2">
            <span>{activeTabDef.emoji}</span>
            <p>「{activeTabDef.label}」のTODOはありません</p>
            <p className="todo-empty-hint">上の入力欄から追加しましょう</p>
          </li>
        ) : (
          visibleTodos.map((todo) => (
            <TodoItemV2
              key={todo.id}
              todo={todo}
              questTitle={questTitle}
              onToggle={onToggle}
              onDelete={onDelete}
              onChangeGroup={onChangeGroup}
              onChangeDue={onChangeDue}
            />
          ))
        )}
      </ul>
    </div>
  )
}
