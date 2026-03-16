import { memo, useCallback, useContext, useEffect, useState } from 'react'
import { type TaskCardProps, PRIORITY_COLORS } from '../state/boardTypes.ts'
import { BoardContext } from '../state/BoardContext.tsx'
import { useTaskOperations } from '../hooks/useTaskOperations.ts'
import { CreateTaskModal } from './CreateTaskModal.tsx'
import type { CreateTaskModalPayload, EditTaskModalPayload } from './CreateTaskModal.tsx'
import {
  loadMinusIcon,
  loadEditIcon,
} from '../../../shared/utils/svgIconService.ts'

function TaskCardInner({ task, onDragStart }: TaskCardProps) {
  const ctx = useContext(BoardContext)
  const dispatch = ctx?.dispatch
  const { deleteTask, updateTask } = useTaskOperations(dispatch ?? (() => undefined))
  const color = PRIORITY_COLORS[task.priority]
  const [now, setNow] = useState(() => Date.now())
  const secondsAgo = Math.max(0, Math.floor((now - task.updatedAt) / 1000))
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [minusIconUrl, setMinusIconUrl] = useState<string | null>(null)
  const [editIconUrl, setEditIconUrl] = useState<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => {
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void Promise.all([loadMinusIcon(), loadEditIcon()]).then(
      ([minus, edit]: (string | null)[]) => {
        if (!cancelled) {
          setMinusIconUrl(minus ?? null)
          setEditIconUrl(edit ?? null)
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      onDragStart?.(e, task.id)
    },
    [task.id, onDragStart],
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      deleteTask(task.id)
    },
    [task.id, deleteTask],
  )

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditModalOpen(true)
  }, [])

  const handleEditSubmit = useCallback(
    (payload: CreateTaskModalPayload | EditTaskModalPayload) => {
      if (!('id' in payload)) return
      updateTask({
        id: payload.id,
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
      })
      setIsEditModalOpen(false)
    },
    [updateTask],
  )

  return (
    <>
      <div
        className="task-card"
        data-task-id={task.id}
        draggable={!!onDragStart}
        onDragStart={handleDragStart}
      >
        <div
          className="task-card__priority"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <div className="task-card__content">
          <div className="task-card__header">
            <p className="task-card__title">{task.title}</p>
            <div className="task-card__actions" aria-label="Task actions">
              <button
                type="button"
                className="task-card__action"
                onClick={handleDelete}
                aria-label="Delete task"
              >
                {minusIconUrl ? (
                  <img src={minusIconUrl} alt="" width={12} height={12} className="task-card__action-icon" />
                ) : (
                  'Delete'
                )}
              </button>
              <button
                type="button"
                className="task-card__action"
                onClick={handleEditClick}
                aria-label="Edit task"
              >
                {editIconUrl ? (
                  <img src={editIconUrl} alt="" width={12} height={12} className="task-card__action-icon" />
                ) : (
                  'Edit'
                )}
              </button>
            </div>
          </div>
          <p className="task-card__description">{task.description}</p>
          <p className="task-card__meta">Modified {secondsAgo} seconds ago.</p>
        </div>
      </div>
      <CreateTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
        }}
        initialTask={task}
        onSubmit={handleEditSubmit}
      />
    </>
  )
}

export const TaskCard = memo(TaskCardInner)
