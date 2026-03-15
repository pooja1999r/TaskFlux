import { memo, useCallback } from 'react'
import { type TaskCardProps, PRIORITY_COLORS } from '../state/boardTypes.ts'

function TaskCardInner({ task, onDragStart }: TaskCardProps) {
  const color = PRIORITY_COLORS[task.priority]
  const secondsAgo = Math.max(0, Math.floor((Date.now() - task.updatedAt) / 1000))
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      onDragStart?.(e, task.id)
    },
    [task.id, onDragStart],
  )
  return (
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
        <p className="task-card__title">{task.title}</p>
        <p className="task-card__description">{task.description}</p>
        <p className="task-card__meta">Modified {secondsAgo} seconds ago.</p>
      </div>
    </div>
  )
}

export const TaskCard = memo(TaskCardInner)
