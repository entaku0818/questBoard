import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import QuestList from '../components/QuestList.jsx'

const sampleQuests = [
  { id: '1', title: 'クエストA', todos: [] },
  { id: '2', title: 'クエストB', todos: [{ id: 't1', done: true }, { id: 't2', done: false }] },
]

describe('QuestList', () => {
  it('クエストが空のときメッセージを表示', () => {
    render(<QuestList quests={[]} selectedQuestId={null} onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/クエストがまだありません/)).toBeInTheDocument()
  })

  it('クエスト一覧を表示する', () => {
    render(<QuestList quests={sampleQuests} selectedQuestId={null} onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('クエストA')).toBeInTheDocument()
    expect(screen.getByText('クエストB')).toBeInTheDocument()
  })

  it('クエストをクリックすると onSelect が呼ばれる', () => {
    const onSelect = vi.fn()
    render(<QuestList quests={sampleQuests} selectedQuestId={null} onSelect={onSelect} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('クエストA'))
    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('選択中クエストに selected クラスがつく', () => {
    const { container } = render(
      <QuestList quests={sampleQuests} selectedQuestId="1" onSelect={vi.fn()} onDelete={vi.fn()} />
    )
    const items = container.querySelectorAll('.quest-item')
    expect(items[0]).toHaveClass('selected')
    expect(items[1]).not.toHaveClass('selected')
  })

  it('進捗が正しく計算される（1/2 = 50%）', () => {
    render(<QuestList quests={sampleQuests} selectedQuestId={null} onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('50% 達成')).toBeInTheDocument()
  })

  it('削除ボタンを押すとインライン確認が表示される', () => {
    render(<QuestList quests={sampleQuests} selectedQuestId={null} onSelect={vi.fn()} onDelete={vi.fn()} />)
    const deleteButtons = screen.getAllByTitle('削除')
    fireEvent.click(deleteButtons[0])
    expect(screen.getByTitle('削除を確定')).toBeInTheDocument()
    expect(screen.getByTitle('キャンセル')).toBeInTheDocument()
  })

  it('削除確認→削除するで onDelete が呼ばれる', () => {
    const onDelete = vi.fn()
    render(<QuestList quests={sampleQuests} selectedQuestId={null} onSelect={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getAllByTitle('削除')[0])
    fireEvent.click(screen.getByTitle('削除を確定'))
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('削除確認→戻るで削除されない', () => {
    const onDelete = vi.fn()
    render(<QuestList quests={sampleQuests} selectedQuestId={null} onSelect={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getAllByTitle('削除')[0])
    fireEvent.click(screen.getByTitle('キャンセル'))
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getAllByTitle('削除')).toHaveLength(2)
  })
})
