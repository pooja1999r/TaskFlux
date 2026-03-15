import { memo, useCallback, useContext, useEffect, useState } from 'react'
import { BoardContext } from '../state/BoardContext.tsx'
import { initialState } from '../state/initialState.ts'
import type { BoardAction } from '../state/boardActions.ts'
import type { TaskPriority } from '../state/boardTypes.ts'
import { useUndoRedo } from '../hooks/useUndoRedo.ts'
import { useTaskOperations } from '../hooks/useTaskOperations'
import { CreateTaskModal } from './CreateTaskModal.tsx'
import {
  loadUndoIcon,
  loadRedoIcon,
} from '../../../shared/utils/svgIconService.ts'

const noopDispatch: React.Dispatch<BoardAction> = () => undefined

function HeaderInner() {
  const ctx = useContext(BoardContext)
  const state = ctx?.state ?? initialState
  const dispatch = ctx?.dispatch ?? noopDispatch
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [modalVersion, setModalVersion] = useState(0)

  const { canUndo, canRedo, handleUndo, handleRedo } = useUndoRedo(
    state.history,
    state.future,
    dispatch,
  )
  const { addTask } = useTaskOperations(dispatch)

  const [undoIconUrl, setUndoIconUrl] = useState<string | null>(null)
  const [redoIconUrl, setRedoIconUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    // Load SVG icons via service; fallback to text in UI if null
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    void Promise.all([loadUndoIcon(), loadRedoIcon()]).then(
      ([undo, redo]: (string | null)[]) => {
        if (!cancelled) {
          setUndoIconUrl(undo ?? null)
          setRedoIconUrl(redo ?? null)
        }
      },
    )
    /* eslint-enable @typescript-eslint/no-unsafe-call */
    return () => {
      cancelled = true
    }
  }, [])

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

  const handleOpenCreateModal = useCallback(() => {
    setModalVersion((v) => v + 1)
    setIsCreateModalOpen(true)
  }, [])

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false)
  }, [])

  const handleCreateTask = useCallback(
    (payload: { title: string; description: string; priority: TaskPriority }) => {
      addTask(payload)
      setIsCreateModalOpen(false)
    },
    [addTask],
  )

  if (ctx === null) return null

  return (
    <>
      <div className="board-toolbar" role="toolbar" aria-label="Board actions">

        {/* Search and Priority filters */}
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

        {/* Undo, Redo, and Add Task */}
        <div className="board-toolbar__right">
          <button
            type="button"
            className="board-toolbar__button"
            onClick={handleUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            {undoIconUrl ? (
              <img src={undoIconUrl} alt="" width={16} height={16} className="board-toolbar__icon" />
            ) : (
              'Undo'
            )}
          </button>
          <button
            type="button"
            className="board-toolbar__button"
            onClick={handleRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            {redoIconUrl ? (
              <img src={redoIconUrl} alt="" width={16} height={16} className="board-toolbar__icon" />
            ) : (
              'Redo'
            )}
          </button>
          <button
            type="button"
            className="board-toolbar__button board-toolbar__button--primary"
            onClick={handleOpenCreateModal}
          >
            + Add Task
          </button>
        </div>
      </div>

      <CreateTaskModal
        key={modalVersion}
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateTask}
      />
    </>
  )
}

export const Header = memo(HeaderInner)

