import type { BoardState, BoardOrder, Task, TaskId } from './boardTypes.ts'

import initialTasksArray from '../../../app/initial-tasks.json'

function normalize(tasksArray: Task[]): { tasks: Record<TaskId, Task>; order: BoardOrder } {
  const tasks: Record<TaskId, Task> = {}
  const order: BoardOrder = {
    todo: [],
    'in-progress': [],
    done: [],
  }
  for (const task of tasksArray) {
    tasks[task.id] = task
    order[task.status].push(task.id)
  }
  return { tasks, order }
}

const { tasks, order } = normalize(initialTasksArray as Task[])

export const initialState: BoardState = {
  tasks,
  order,
  history: [],
  future: [],
  filters: { text: '', priority: null },
}
