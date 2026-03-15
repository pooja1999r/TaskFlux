import { memo, useCallback, useContext } from 'react'
import { BoardContext } from '../state/BoardContext.tsx'
import { initialState } from '../state/initialState.ts'
import type { BoardAction } from '../state/boardActions.ts'
import type { TaskPriority } from '../state/boardTypes.ts'
import { useUndoRedo } from '../hooks/useUndoRedo.ts'

const noopDispatch: React.Dispatch<BoardAction> = () => undefined

function HeaderInner() {
  const ctx = useContext(BoardContext)
  const state = ctx?.state ?? initialState
  const dispatch = ctx?.dispatch ?? noopDispatch
  const { canUndo, canRedo, handleUndo, handleRedo } = useUndoRedo(
    state.history,
    state.future,
    dispatch,
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'SET_FILTER_TEXT', payload: e.target.value })
    },
    [dispatch],
  )

  const handlePriorityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      dispatch({
        type: 'SET_FILTER_PRIORITY',
        payload: value === '' ? null : (Number(value) as TaskPriority),
      })
    },
    [dispatch],
  )

  if (ctx === null) return null

  return (
    <div className="board-toolbar" role="toolbar" aria-label="Board actions">

<div className="board-toolbar__filters">
        <label className="board-filter">
          <input
            className="board-filter__input"
            type="text"
            value={state.filters.text}
            onChange={handleSearchChange}
            placeholder="Search title or description"
          />
        </label>
        <label className="board-filter">
          <select
            className="board-filter__select"
            value={state.filters.priority ?? ''}
            onChange={handlePriorityChange}
          >
            <option value="">All Priorities</option>
            <option value="3">High Priority (3)</option>
            <option value="2">Medium Priority (2)</option>
            <option value="1">Low Priority (1)</option>
          </select>
        </label>
      </div>
      <div className="board-toolbar__left">
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
    </div>
  )
}

export const Header = memo(HeaderInner)

