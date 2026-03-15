import { useContext, useMemo } from 'react'
import { BoardContext } from '../state/BoardContext.tsx'
import { Column } from './Column.tsx'
import { COLUMNS } from '../state/boardTypes.ts'
import type { Task, BoardFilters } from '../state/boardTypes.ts'

function getTasksForColumn(
  orderIds: string[],
  tasks: Record<string, Task>,
  filters: BoardFilters,
): Task[] {
  return orderIds
    .map((id) => tasks[id])
    .filter((t): t is Task => t !== undefined)
    .filter(
      (t) =>
        (!filters.text ||
          t.title.includes(filters.text) ||
          t.description.includes(filters.text)) &&
        (filters.priority == null || t.priority === filters.priority),
    )
}

export function Board() {
  const ctx = useContext(BoardContext)

  if (ctx === null) return null

  const { state } = ctx

  const columnTasks = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      tasks: getTasksForColumn(
        state.order[col.status],
        state.tasks,
        state.filters,
      ),
    }))
  }, [state.order, state.tasks, state.filters])

  return (
    <div className="board">
      {columnTasks.map((col) => (
        <Column
          key={col.status}
          title={col.title}
          status={col.status}
          tasks={col.tasks}
        />
      ))}
    </div>
  )
}
