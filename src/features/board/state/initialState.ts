import type { BoardState } from './boardTypes.ts'
import initialTasks from '../../../app/initial-tasks.json'

export const initialState: BoardState = {
  tasks: initialTasks as BoardState['tasks'],
}
