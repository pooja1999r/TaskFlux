import { useEffect, useRef } from 'react'
import type {
  BoardOrder,
  BoardSnapshot,
  BoardState,
  Task,
  TaskId,
  TaskPriority,
  TaskStatus,
} from '../state/boardTypes.ts'

const BOARD_STORAGE_KEY = 'fluxboard.board-state.v1'
const DEBOUNCE_MS = 800

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === 'todo' || value === 'in-progress' || value === 'done'
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === 1 || value === 2 || value === 3
}

function isTask(value: unknown): value is Task {
  if (!isObject(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    isTaskStatus(value.status) &&
    isTaskPriority(value.priority) &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number'
  )
}

function isTaskRecord(value: unknown): value is Record<TaskId, Task> {
  if (!isObject(value)) return false
  return Object.values(value).every((task) => isTask(task))
}

function isTaskIdArray(value: unknown): value is TaskId[] {
  return Array.isArray(value) && value.every((id) => typeof id === 'string')
}

function isBoardOrder(value: unknown): value is BoardOrder {
  if (!isObject(value)) return false
  return (
    isTaskIdArray(value.todo) &&
    isTaskIdArray(value['in-progress']) &&
    isTaskIdArray(value.done)
  )
}

function isBoardSnapshot(value: unknown): value is BoardSnapshot {
  if (!isObject(value)) return false
  return isTaskRecord(value.tasks) && isBoardOrder(value.order)
}

function isBoardState(value: unknown): value is BoardState {
  if (!isObject(value)) return false
  if (!isTaskRecord(value.tasks) || !isBoardOrder(value.order)) return false
  if (!Array.isArray(value.history) || !value.history.every(isBoardSnapshot)) {
    return false
  }
  if (!Array.isArray(value.future) || !value.future.every(isBoardSnapshot)) {
    return false
  }
  if (!isObject(value.filters)) return false
  return (
    typeof value.filters.text === 'string' &&
    (value.filters.priority === null || isTaskPriority(value.filters.priority))
  )
}

function writeBoardState(state: BoardState): void {
  try {
    window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(state))
  } catch {
    const reduced: BoardState = {
      tasks: state.tasks,
      order: state.order,
      filters: state.filters,
      history: [],
      future: [],
    }
    try {
      window.localStorage.setItem(
        BOARD_STORAGE_KEY,
        JSON.stringify(reduced),
      )
    } catch {
      // Give up silently; app continues without persisting
    }
  }
}

export function getInitialBoardState(defaultState: BoardState): BoardState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = window.localStorage.getItem(BOARD_STORAGE_KEY)
    if (raw === null) return defaultState
    const parsed: unknown = JSON.parse(raw)
    if (!isBoardState(parsed)) {
      window.localStorage.removeItem(BOARD_STORAGE_KEY)
      return defaultState
    }
    return parsed
  } catch {
    window.localStorage.removeItem(BOARD_STORAGE_KEY)
    return defaultState
  }
}

export function useDebouncedLocalStorage(state: BoardState) {
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(() => {
      writeBoardState(state)
      timerRef.current = null
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state])
}

