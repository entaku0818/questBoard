import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import QuestDetail from '../components/QuestDetail.jsx'

const makeQuest = (overrides = {}) => ({
  id: 'q1',
  title: 'テストクエスト',
  description: '',
  todos: [],
  ...overrides,
})

describe('QuestDetail', () => {
  it('クエストタイトルを表示する', () => {
    render(<QuestDetail quest={makeQuest()} onUpdate={vi.fn()} />)
    expect(screen.getByText('テストクエスト')).toBeInTheDocument()
  })

  it('タイトルをクリックすると編集モードになる', () => {
    render(<QuestDetail quest={makeQuest()} onUpdate={vi.fn()} />)
    fireEvent.click(screen.getByText('テストクエスト'))
    expect(screen.getByDisplayValue('テストクエスト')).toBeInTheDocument()
    expect(screen.getByText('保存')).toBeInTheDocument()
    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })

  it('キャンセルで編集モードを抜ける', () => {
    render(<QuestDetail quest={makeQuest()} onUpdate={vi.fn()} />)
    fireEvent.click(screen.getByText('テストクエスト'))
    fireEvent.click(screen.getByText('キャンセル'))
    expect(screen.getByText('テストクエスト')).toBeInTheDocument()
    expect(screen.queryByText('保存')).not.toBeInTheDocument()
  })

  it('空タイトルで保存するとエラーメッセージ', () => {
    render(<QuestDetail quest={makeQuest()} onUpdate={vi.fn()} />)
    fireEvent.click(screen.getByText('テストクエスト'))
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(screen.getByText('保存'))
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument()
  })

  it('空タイトルで保存しても onUpdate は呼ばれない', () => {
    const onUpdate = vi.fn()
    render(<QuestDetail quest={makeQuest()} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('テストクエスト'))
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('タイトル保存で onUpdate が呼ばれる', () => {
    const onUpdate = vi.fn()
    render(<QuestDetail quest={makeQuest()} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('テストクエスト'))
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '新しいタイトル' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onUpdate).toHaveBeenCalledWith('q1', expect.any(Function))
  })

  it('TODO を追加すると onUpdate が呼ばれる', () => {
    const onUpdate = vi.fn()
    render(<QuestDetail quest={makeQuest()} onUpdate={onUpdate} />)
    const input = screen.getByPlaceholderText(/に追加/)
    fireEvent.change(input, { target: { value: 'テストTODO' } })
    fireEvent.click(screen.getByText('追加'))
    expect(onUpdate).toHaveBeenCalledWith('q1', expect.any(Function))
  })

  it('空テキストでTODO追加しても onUpdate は呼ばれない', () => {
    const onUpdate = vi.fn()
    render(<QuestDetail quest={makeQuest()} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('追加'))
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('todos が null でもクラッシュしない (B-07)', () => {
    const quest = makeQuest({ todos: null })
    expect(() => render(<QuestDetail quest={quest} onUpdate={vi.fn()} />)).not.toThrow()
  })

  it('クエスト切り替えでタイトルがリセットされる (B-01)', () => {
    const questA = makeQuest({ id: 'a', title: 'クエストA' })
    const questB = makeQuest({ id: 'b', title: 'クエストB' })
    const { rerender } = render(<QuestDetail quest={questA} onUpdate={vi.fn()} />)
    // 編集モードを開く
    fireEvent.click(screen.getByText('クエストA'))
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '書きかけ' } })
    // クエストBに切り替え
    rerender(<QuestDetail quest={questB} onUpdate={vi.fn()} />)
    // 編集モードが閉じてBのタイトルが表示される
    expect(screen.getByText('クエストB')).toBeInTheDocument()
    expect(screen.queryByText('保存')).not.toBeInTheDocument()
  })

  it('TODOリストを表示する', () => {
    const quest = makeQuest({
      todos: [
        { id: 't1', text: 'タスク1', group: 'today', done: false, dueDate: null },
        { id: 't2', text: 'タスク2', group: 'today', done: true, dueDate: null },
      ],
    })
    render(<QuestDetail quest={quest} onUpdate={vi.fn()} />)
    expect(screen.getByText('タスク1')).toBeInTheDocument()
    expect(screen.getByText('タスク2')).toBeInTheDocument()
  })

  it('タブバッジは未完了件数のみ表示する (E-09)', () => {
    const quest = makeQuest({
      todos: [
        { id: 't1', text: 'タスク1', group: 'today', done: true, dueDate: null },
        { id: 't2', text: 'タスク2', group: 'today', done: true, dueDate: null },
      ],
    })
    render(<QuestDetail quest={quest} onUpdate={vi.fn()} />)
    // 全件完了なのでバッジは表示されない
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  it('全体進捗が正しく表示される', () => {
    const quest = makeQuest({
      todos: [
        { id: 't1', text: 'タスク1', group: 'today', done: true, dueDate: null },
        { id: 't2', text: 'タスク2', group: 'today', done: false, dueDate: null },
      ],
    })
    render(<QuestDetail quest={quest} onUpdate={vi.fn()} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })
})
