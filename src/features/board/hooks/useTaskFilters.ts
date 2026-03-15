import { useMemo } from 'react'
import type { BoardFilters, BoardOrder, Task, TaskId, TaskStatus } from '../state/boardTypes.ts'

export type FilteredTaskIdsByColumn = Record<TaskStatus, TaskId[]>

function filterIdsForColumn(
  orderIds: TaskId[],
  tasks: Record<TaskId, Task>,
  searchQuery: string,
  priority: BoardFilters['priority'],
): TaskId[] {
  const filtered: TaskId[] = []
  for (const id of orderIds) {
    const task = tasks[id]
    if (task === undefined) continue
    if (priority !== null && task.priority !== priority) continue
    if (
      searchQuery !== '' &&
      !task.title.toLowerCase().includes(searchQuery) &&
      !task.description.toLowerCase().includes(searchQuery)
    ) {
      continue
    }
    filtered.push(id)
  }
  return filtered
}

export function useTaskFilters(
  order: BoardOrder,
  tasks: Record<TaskId, Task>,
  filters: BoardFilters,
): FilteredTaskIdsByColumn {
  return useMemo(() => {
    const searchQuery = filters.text.trim().toLowerCase()
    return {
      todo: filterIdsForColumn(order.todo, tasks, searchQuery, filters.priority),
      'in-progress': filterIdsForColumn(
        order['in-progress'],
        tasks,
        searchQuery,
        filters.priority,
      ),
      done: filterIdsForColumn(order.done, tasks, searchQuery, filters.priority),
    }
  }, [order, tasks, filters])
}

