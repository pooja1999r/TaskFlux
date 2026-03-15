export type TaskStatus = 'todo' | 'in-progress' | 'done'

export type TaskPriority = 1 | 2 | 3 // 1: Low, 2: Medium, 3: High

export type TaskId = string

export interface Task {
  id: TaskId
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: number
  updatedAt: number
}

/** Column order: array of task IDs per status. */
export type BoardOrder = Record<TaskStatus, TaskId[]>

/** Snapshot for undo/redo (no history/future inside). */
export interface BoardSnapshot {
  tasks: Record<TaskId, Task>
  order: BoardOrder
}

/** UI-only; not stored in history. */
export interface BoardFilters {
  text: string
  priority: TaskPriority | null
}

export const MAX_HISTORY_DEPTH = 15

export interface BoardState extends BoardSnapshot {
  history: BoardSnapshot[]
  future: BoardSnapshot[]
  filters: BoardFilters
}

// Column
export interface ColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
}

export const CARD_HEIGHT = 88
export const CARD_GAP = 8
export const ITEM_HEIGHT = CARD_HEIGHT + CARD_GAP

// TaskCard
export interface TaskCardProps {
  task: Task
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  1: '#22c55e', // Low - green
  2: '#eab308', // Medium - yellow
  3: '#ef4444', // High - red
}

// Board
export const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'Planning' },
  { status: 'in-progress', title: 'Delivery' },
  { status: 'done', title: 'Evaluation and learning' },
]
