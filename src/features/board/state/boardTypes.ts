export type TaskStatus = 'todo' | 'in-progress' | 'done'

export type TaskPriority = 1 | 2 | 3 // 1: Low, 2: Medium, 3: High

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: number
  updatedAt: number
}

export interface BoardState {
  tasks: Task[]
}

// Column
export interface ColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
}

export const CARD_HEIGHT = 120
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
