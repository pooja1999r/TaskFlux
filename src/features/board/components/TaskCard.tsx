import { memo } from 'react'
import { type TaskCardProps, PRIORITY_COLORS } from '../state/boardTypes.ts'

function TaskCardInner({ task }: TaskCardProps) {
  const color = PRIORITY_COLORS[task.priority]
  return (
    <div className="task-card" data-task-id={task.id}>
      <div
        className="task-card__priority"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <div className="task-card__content">
        <p className="task-card__title">{task.title}</p>
        <p className="task-card__description">{task.description}</p>
      </div>
    </div>
  )
}

export const TaskCard = memo(TaskCardInner)
