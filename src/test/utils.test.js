import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── calcProgress (QuestDetail/QuestList と同じロジック) ──────────────
function calcProgress(todos) {
  if (!todos || todos.length === 0) return 0
  const done = todos.filter((t) => t.done).length
  return Math.round((done / todos.length) * 100)
}

// ── formatDue (QuestDetail と同じロジック) ────────────────────────────
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

// ── helper ────────────────────────────────────────────────────────────
function dateStr(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

// ─────────────────────────────────────────────────────────────────────
describe('calcProgress', () => {
  it('空配列は 0% を返す', () => {
    expect(calcProgress([])).toBe(0)
  })

  it('null/undefined は 0% を返す', () => {
    expect(calcProgress(null)).toBe(0)
    expect(calcProgress(undefined)).toBe(0)
  })

  it('全件未完了は 0%', () => {
    const todos = [
      { id: '1', done: false },
      { id: '2', done: false },
    ]
    expect(calcProgress(todos)).toBe(0)
  })

  it('全件完了は 100%', () => {
    const todos = [
      { id: '1', done: true },
      { id: '2', done: true },
    ]
    expect(calcProgress(todos)).toBe(100)
  })

  it('1/3 完了は 33%', () => {
    const todos = [
      { id: '1', done: true },
      { id: '2', done: false },
      { id: '3', done: false },
    ]
    expect(calcProgress(todos)).toBe(33)
  })

  it('2/3 完了は 67%', () => {
    const todos = [
      { id: '1', done: true },
      { id: '2', done: true },
      { id: '3', done: false },
    ]
    expect(calcProgress(todos)).toBe(67)
  })

  it('1件で完了は 100%', () => {
    expect(calcProgress([{ id: '1', done: true }])).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────────────
describe('formatDue', () => {
  it('null を渡すと null を返す', () => {
    expect(formatDue(null)).toBeNull()
    expect(formatDue(undefined)).toBeNull()
    expect(formatDue('')).toBeNull()
  })

  it('今日の日付は due-today', () => {
    const result = formatDue(dateStr(0))
    expect(result.cls).toBe('due-today')
    expect(result.text).toBe('今日が期日')
  })

  it('明日の日付は due-soon', () => {
    const result = formatDue(dateStr(1))
    expect(result.cls).toBe('due-soon')
    expect(result.text).toBe('明日が期日')
  })

  it('3日後は due-normal', () => {
    const result = formatDue(dateStr(3))
    expect(result.cls).toBe('due-normal')
    expect(result.text).toBe('3日後')
  })

  it('1日超過は due-overdue', () => {
    const result = formatDue(dateStr(-1))
    expect(result.cls).toBe('due-overdue')
    expect(result.text).toBe('1日超過')
  })

  it('5日超過は due-overdue かつ 5日超過', () => {
    const result = formatDue(dateStr(-5))
    expect(result.cls).toBe('due-overdue')
    expect(result.text).toBe('5日超過')
  })
})
