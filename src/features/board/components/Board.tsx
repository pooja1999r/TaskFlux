import { useContext } from 'react'
import { BoardContext } from '../state/BoardContext.tsx'
import { Column } from './Column.tsx'
import { COLUMNS } from '../state/boardTypes.ts'

export function Board() {
  const ctx = useContext(BoardContext)

  if (ctx === null) return null

  const { state } = ctx

  return (
    <div className="board">
      {COLUMNS.map((col) => {
        const tasks = state.tasks.filter((t) => t.status === col.status)
        return (
          <Column
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={tasks}
          />
        )
      })}
    </div>
  )
}
