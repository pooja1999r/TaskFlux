import { useState } from 'react'
import type { TaskPriority } from '../state/boardTypes.ts'
import type { Task } from '../state/boardTypes.ts'

export type CreateTaskModalPayload = {
  title: string
  description: string
  priority: TaskPriority
}
export type EditTaskModalPayload = CreateTaskModalPayload & { id: Task['id'] }

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  /** When set, modal is in edit mode: prefilled and submit button "Update Task". */
  initialTask?: Pick<Task, 'id' | 'title' | 'description' | 'priority'> | null
  onSubmit: (payload: CreateTaskModalPayload | EditTaskModalPayload) => void
}

const DEFAULT_PRIORITY: TaskPriority = 2

/** Keyed by task id or 'new' so form remounts with correct initial state when opening. */
function CreateTaskForm({
  initialTask,
  onClose,
  onSubmit,
}: {
  initialTask: Pick<Task, 'id' | 'title' | 'description' | 'priority'> | null | undefined
  onClose: () => void
  onSubmit: (payload: CreateTaskModalPayload | EditTaskModalPayload) => void
}) {
  const isEdit = Boolean(initialTask)
  const [title, setTitle] = useState(initialTask?.title ?? '')
  const [description, setDescription] = useState(initialTask?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority ?? DEFAULT_PRIORITY)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const normalizedTitle = title.trim()
    if (normalizedTitle === '') {
      setError('Title is required.')
      return
    }
    if (isEdit && initialTask) {
      onSubmit({
        id: initialTask.id,
        title: normalizedTitle,
        description: description.trim(),
        priority,
      })
    } else {
      onSubmit({
        title: normalizedTitle,
        description: description.trim(),
        priority,
      })
    }
  }

  return (
    <form className="create-task-modal__form" onSubmit={handleSubmit}>
      <label className="create-task-modal__field">
        <span className="create-task-modal__label">Title</span>
        <input
          className="create-task-modal__input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (error !== '') setError('')
          }}
          placeholder="Task title"
        />
      </label>

      <label className="create-task-modal__field">
        <span className="create-task-modal__label">Description</span>
        <textarea
          className="create-task-modal__textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
          rows={3}
        />
      </label>

      <label className="create-task-modal__field">
        <span className="create-task-modal__label">Priority</span>
        <select
          className="create-task-modal__select"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
        >
          <option value="1">Low (1)</option>
          <option value="2">Medium (2)</option>
          <option value="3">High (3)</option>
        </select>
      </label>

      {error !== '' && <p className="create-task-modal__error">{error}</p>}

      <div className="create-task-modal__actions">
        <button
          type="button"
          className="create-task-modal__button create-task-modal__button--ghost"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="create-task-modal__button create-task-modal__button--primary"
        >
          {isEdit ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}

export function CreateTaskModal({
  isOpen,
  onClose,
  initialTask,
  onSubmit,
}: CreateTaskModalProps) {
  if (!isOpen) return null
  const isEdit = Boolean(initialTask)
  const formKey = initialTask?.id ?? 'new'

  return (
    <div
      className="create-task-modal__overlay"
      onClick={() => onClose()}
      role="presentation"
    >
      <div
        className="create-task-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit Task' : 'Create Task'}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="create-task-modal__title">{isEdit ? 'Edit Task' : 'Create Task'}</h3>
        <CreateTaskForm
          key={formKey}
          initialTask={initialTask ?? null}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}

