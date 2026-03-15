import { useContext, useRef } from 'react'
import { BoardContext } from '../state/BoardContext.tsx'
import { Column } from './Column.tsx'
import type { DragMeta } from '../state/boardTypes.ts'
import { useTaskFilters } from '../hooks/useTaskFilters.ts'
import { useUndoRedo } from '../hooks/useUndoRedo.ts'
import { initialState } from '../state/initialState.ts'
import type { BoardAction } from '../state/boardActions.ts'

const noopDispatch: React.Dispatch<BoardAction> = () => undefined

export function Board() {
  const ctx = useContext(BoardContext)
  const state = ctx?.state ?? initialState
  const dispatch = ctx?.dispatch ?? noopDispatch
  const dragRef = useRef<DragMeta | null>(null)
  const { canUndo, canRedo, handleUndo, handleRedo } = useUndoRedo(
    state.history,
    state.future,
    dispatch,
  )
  const columnTasks = useTaskFilters(state.order, state.tasks, state.filters)

  if (ctx === null) return null

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
