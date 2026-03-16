import { useCallback } from 'react'
import type { BoardAction } from '../state/boardActions.ts'
import type { TaskId, TaskPriority, TaskStatus } from '../state/boardTypes.ts'

function createTaskId(): TaskId {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${String(Date.now())}-${Math.random().toString(36).slice(2)}`
}

export function useTaskOperations(dispatch: React.Dispatch<BoardAction>) {
  const addTask = useCallback(
    (
      payload: { title: string; description: string; priority: TaskPriority },
      options?: { status?: TaskStatus; insertIndex?: number },
    ) => {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          id: createTaskId(),
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          ...(options?.status !== undefined && { status: options.status }),
          ...(options?.insertIndex !== undefined && { insertIndex: options.insertIndex }),
        },
      })
    },
    [dispatch],
  )

  const updateTask = useCallback(
    (payload: {
      id: TaskId
      title?: string
      description?: string
      priority?: TaskPriority
    }) => {
      dispatch({ type: 'UPDATE_TASK', payload })
    },
    [dispatch],
  )

  const deleteTask = useCallback(
    (id: TaskId) => {
      dispatch({ type: 'DELETE_TASK', payload: { id } })
    },
    [dispatch],
  )

  const moveTask = useCallback(
    (payload: {
      taskId: TaskId
      sourceStatus: TaskStatus
      sourceIndex: number
      targetStatus: TaskStatus
      targetIndex: number
    }) => {
      dispatch({ type: 'MOVE_TASK', payload })
    },
    [dispatch],
  )

  return { addTask, updateTask, deleteTask, moveTask }
}

