import type {
  Task,
  TaskId,
  TaskPriority,
  TaskStatus,
  BoardOrder,
} from './boardTypes.ts'

/** Create a new task. Pushes history, clears future. Caller must provide id. Optional status/insertIndex add to that column at index (default: todo, append). */
export type AddTaskAction = {
  type: 'ADD_TASK'
  payload: {
    id: TaskId
    title: string
    description: string
    priority: TaskPriority
    status?: TaskStatus
    insertIndex?: number
  }
}

/** Update existing task fields; does not move or change column order. */
export type UpdateTaskAction = {
  type: 'UPDATE_TASK'
  payload: {
    id: TaskId
    title?: string
    description?: string
    priority?: TaskPriority
  }
}

/** Remove task from board (tasks map and all column order arrays). */
export type DeleteTaskAction = {
  type: 'DELETE_TASK'
  payload: { id: TaskId }
}

/** Drag-and-drop: reorder within column or move between columns. */
export type MoveTaskAction = {
  type: 'MOVE_TASK'
  payload: {
    taskId: TaskId
    sourceStatus: TaskStatus
    sourceIndex: number
    targetStatus: TaskStatus
    targetIndex: number
  }
}

/** Revert to previous snapshot; current state goes to future. */
export type UndoAction = { type: 'UNDO' }

/** Reapply undone snapshot; current state goes to history. */
export type RedoAction = { type: 'REDO' }

/** Initialize from persisted localStorage (validated). No payload = read from storage. */
export type HydrateAction = {
  type: 'HYDRATE'
  payload?: { tasks: Record<TaskId, Task>; order: BoardOrder }
}

/** Filter by text (UI only; no history snapshot). */
export type SetFilterTextAction = { type: 'SET_FILTER_TEXT'; payload: string }

/** Filter by priority (UI only; no history snapshot). */
export type SetFilterPriorityAction = {
  type: 'SET_FILTER_PRIORITY'
  payload: TaskPriority | null
}

export type BoardAction =
  | AddTaskAction
  | UpdateTaskAction
  | DeleteTaskAction
  | MoveTaskAction
  | UndoAction
  | RedoAction
  | HydrateAction
  | SetFilterTextAction
  | SetFilterPriorityAction
