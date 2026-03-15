import type { Task } from './boardTypes.ts'

export type BoardAction =
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'SET_TASKS'; payload: Task[] }
