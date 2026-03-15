import { useCallback, useContext, useMemo, useRef } from 'react'
import { BoardContext } from '../state/BoardContext.tsx'
import { Column } from './Column.tsx'
import { COLUMNS } from '../state/boardTypes.ts'
import type { Task, BoardFilters, DragMeta } from '../state/boardTypes.ts'

function getTasksForColumn(
  orderIds: string[],
  tasks: Record<string, Task>,
  filters: BoardFilters,
): Task[] {
  return orderIds
    .map((id) => tasks[id])
    .filter((t): t is Task => t !== undefined)
    .filter(
      (t) =>
        (!filters.text ||
          t.title.includes(filters.text) ||
          t.description.includes(filters.text)) &&
        (filters.priority == null || t.priority === filters.priority),
    )
}

export function Board() {
  const ctx = useContext(BoardContext)

  if (ctx === null) return null

  const { state, dispatch } = ctx
  const dragRef = useRef<DragMeta | null>(null)
  const canUndo = state.history.length > 0
  const canRedo = state.future.length > 0

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [dispatch])

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [dispatch])

  const columnTasks = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      tasks: getTasksForColumn(
        state.order[col.status],
        state.tasks,
        state.filters,
      ),
      orderIds: state.order[col.status],
    }))
  }, [state.order, state.tasks, state.filters])

  return (
    <div className="board-shell">
      <div className="board-toolbar" role="toolbar" aria-label="Board actions">
        <button
          type="button"
          className="board-toolbar__button"
          onClick={handleUndo}
          disabled={!canUndo}
        >
          Undo
        </button>
        <button
          type="button"
          className="board-toolbar__button"
          onClick={handleRedo}
          disabled={!canRedo}
        >
          Redo
        </button>
      </div>
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
