import type {
  BoardState,
  BoardSnapshot,
  Task,
  TaskId,
} from './boardTypes.ts'
import { MAX_HISTORY_DEPTH } from './boardTypes.ts'
import type { BoardAction } from './boardActions.ts'
import { initialState } from './initialState.ts'

function getSnapshot(state: BoardState): BoardSnapshot {
  return { tasks: state.tasks, order: state.order }
}

function pushHistory(state: BoardState, nextSnapshot: BoardSnapshot): BoardState {
  const history = [getSnapshot(state), ...state.history].slice(
    0,
    MAX_HISTORY_DEPTH,
  )
  return {
    ...state,
    ...nextSnapshot,
    history,
    future: [],
  }
}

export function boardReducer(
  state: BoardState = initialState,
  action: BoardAction,
): BoardState {
  switch (action.type) {
    case 'ADD_TASK': {
      const { id, title, description, priority, status: targetStatus, insertIndex } = action.payload
      const status: keyof BoardState['order'] = targetStatus ?? 'todo'
      const now = Date.now()
      const task: Task = {
        id,
        title,
        description,
        status,
        priority,
        createdAt: now,
        updatedAt: now,
      }
      const tasks = { ...state.tasks, [id]: task }
      const current = state.order[status]
      const index = insertIndex !== undefined ? Math.max(0, Math.min(insertIndex, current.length)) : current.length
      const order = {
        ...state.order,
        [status]: [...current.slice(0, index), id, ...current.slice(index)],
      }
      return pushHistory(state, { tasks, order })
    }

    case 'UPDATE_TASK': {
      const { id, title, description, priority } = action.payload
      const existing = state.tasks[id]
      if (existing === undefined) return state
      const updated: Task = {
        ...existing,
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        updatedAt: Date.now(),
      }
      const tasks = { ...state.tasks, [id]: updated }
      return pushHistory(state, { tasks, order: state.order })
    }

    case 'DELETE_TASK': {
      const { id } = action.payload
      const { [id]: _, ...tasks } = state.tasks
      const order = {
        todo: state.order.todo.filter((tid) => tid !== id),
        'in-progress': state.order['in-progress'].filter((tid) => tid !== id),
        done: state.order.done.filter((tid) => tid !== id),
      }
      return pushHistory(state, { tasks, order })
    }

    case 'MOVE_TASK': {
      const {
        taskId,
        sourceStatus,
        sourceIndex,
        targetStatus,
        targetIndex,
      } = action.payload
      const sameColumn = sourceStatus === targetStatus

      const removeFrom = (arr: TaskId[], index: number): TaskId[] =>
        arr.slice(0, index).concat(arr.slice(index + 1))
      const insertAt = (arr: TaskId[], index: number, id: TaskId): TaskId[] =>
        arr.slice(0, index).concat(id, arr.slice(index))

      let order: BoardState['order']
      let tasks = state.tasks

      if (sameColumn) {
        const col = [...state.order[sourceStatus]]
        const without = removeFrom(col, sourceIndex)
        const reordered = insertAt(without, targetIndex, taskId)
        order = { ...state.order, [sourceStatus]: reordered }
      } else {
        const srcCol = removeFrom(state.order[sourceStatus], sourceIndex)
        const tgtCol = insertAt(state.order[targetStatus], targetIndex, taskId)
        order = {
          ...state.order,
          [sourceStatus]: srcCol,
          [targetStatus]: tgtCol,
        }
        const task = state.tasks[taskId]
        if (task !== undefined) {
          tasks = {
            ...state.tasks,
            [taskId]: {
              ...task,
              status: targetStatus,
              updatedAt: Date.now(),
            },
          }
        }
      }
      return pushHistory(state, { tasks, order })
    }

    case 'UNDO': {
      const prev = state.history[0]
      if (prev === undefined) return state
      const restHistory = state.history.slice(1)
      const currentSnap = getSnapshot(state)
      return {
        ...state,
        tasks: prev.tasks,
        order: prev.order,
        history: restHistory,
        future: [currentSnap, ...state.future],
      }
    }

    case 'REDO': {
      const next = state.future[0]
      if (next === undefined) return state
      const restFuture = state.future.slice(1)
      const currentSnap = getSnapshot(state)
      return {
        ...state,
        tasks: next.tasks,
        order: next.order,
        history: [currentSnap, ...state.history].slice(
          0,
          MAX_HISTORY_DEPTH,
        ),
        future: restFuture,
      }
    }

    case 'HYDRATE': {
      const payload = action.payload
      if (payload === undefined) return state
      const { tasks, order } = payload
      return {
        ...state,
        tasks,
        order,
        history: [],
        future: [],
      }
    }

    case 'SET_FILTER_TEXT':
      return { ...state, filters: { ...state.filters, text: action.payload } }

    case 'SET_FILTER_PRIORITY':
      return {
        ...state,
        filters: { ...state.filters, priority: action.payload },
      }

    default:
      return state
  }
}
