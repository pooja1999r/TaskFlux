import { useContext, useMemo, useRef } from 'react'
import { BoardContext } from '../state/BoardContext.tsx'
import { Column } from './Column.tsx'
import { Header } from './Header.tsx'
import { COLUMNS } from '../state/boardTypes.ts'
import type { DragMeta, Task } from '../state/boardTypes.ts'
import { useTaskFilters } from '../hooks/useTaskFilters.ts'
import { initialState } from '../state/initialState.ts'

export function Board() {
  const ctx = useContext(BoardContext)
  const state = ctx?.state ?? initialState
  const dragRef = useRef<DragMeta | null>(null)
  const filteredIdsByColumn = useTaskFilters(state.order, state.tasks, state.filters)

  const columnTasks = useMemo(() => {
    return COLUMNS.map((col) => {
      const filteredIds = filteredIdsByColumn[col.status]
      return {
        ...col,
        tasks: filteredIds
          .map((id) => state.tasks[id])
          .filter((task): task is Task => task !== undefined),
        orderIds: state.order[col.status],
      }
    })
  }, [filteredIdsByColumn, state.order, state.tasks])

  if (ctx === null) return null

  return (
    <div className="board-shell">
      <Header />
      <div className="board">
        {columnTasks.map((col) => (
          <Column
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={col.tasks}
            orderIds={col.orderIds}
            dragRef={dragRef}
          />
        ))}
      </div>
    </div>
  )
}
