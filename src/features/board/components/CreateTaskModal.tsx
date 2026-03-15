import { useState } from 'react'
import type { TaskPriority } from '../state/boardTypes.ts'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: {
    title: string
    description: string
    priority: TaskPriority
  }) => void
}

const DEFAULT_PRIORITY: TaskPriority = 2

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_PRIORITY)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const normalizedTitle = title.trim()
    if (normalizedTitle === '') {
      setError('Title is required.')
      return
    }
    onSubmit({
      title: normalizedTitle,
      description: description.trim(),
      priority,
    })
  }

  return (
    <div
      className="create-task-modal__overlay"
      onClick={() => {
        onClose()
      }}
      role="presentation"
    >
      <div
        className="create-task-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Create Task"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <h3 className="create-task-modal__title">Create Task</h3>
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
              onChange={(e) => {
                setDescription(e.target.value)
              }}
              placeholder="Task description"
              rows={3}
            />
          </label>

          <label className="create-task-modal__field">
            <span className="create-task-modal__label">Priority</span>
            <select
              className="create-task-modal__select"
              value={priority}
              onChange={(e) => {
                setPriority(Number(e.target.value) as TaskPriority)
              }}
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

