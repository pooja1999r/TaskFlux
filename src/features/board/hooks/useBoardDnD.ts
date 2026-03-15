import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import type { MoveTaskAction } from '../state/boardActions.ts'
import type { DragMeta, Task, TaskStatus } from '../state/boardTypes.ts'
import { CARD_HEIGHT, ITEM_HEIGHT } from '../state/boardTypes.ts'

function getMasterIndex(
  dropSlot: number,
  filteredTasks: Task[],
  orderIds: string[],
): number {
  if (dropSlot <= 0) return 0
  if (dropSlot >= filteredTasks.length) return orderIds.length
  const taskId = filteredTasks[dropSlot]?.id
  if (taskId === undefined) return orderIds.length
  const idx = orderIds.indexOf(taskId)
  return idx === -1 ? orderIds.length : idx
}

function hideIndicator(indicatorRef: React.RefObject<HTMLDivElement | null>) {
  const el = indicatorRef.current
  if (el) el.style.display = 'none'
}

function restoreDraggedSource(meta: { sourceWrapperEl?: HTMLDivElement | null }) {
  const sourceEl = meta.sourceWrapperEl
  if (sourceEl) {
    sourceEl.style.visibility = ''
  }
}

function shiftCardsForPlaceholder(
  cardsEl: HTMLDivElement | null,
  dropSlot: number,
  sourceTaskId?: string,
) {
  if (!cardsEl) return
  const wrappers = Array.from(cardsEl.querySelectorAll<HTMLDivElement>(
    '.column__card-wrapper[data-drop-index]',
  ))
  let sourceVisibleIndex = -1
  if (sourceTaskId) {
    const sourceEl = wrappers.find((el) => el.dataset.taskId === sourceTaskId)
    if (sourceEl) {
      sourceVisibleIndex = parseInt(sourceEl.dataset.dropIndex ?? '', 10)
    }
  }
  wrappers.forEach((el) => {
    if (sourceTaskId && el.dataset.taskId === sourceTaskId) return
    const idx = parseInt(el.dataset.dropIndex ?? '', 10)
    if (Number.isNaN(idx)) return
    const compactedIdx =
      sourceVisibleIndex !== -1 && idx > sourceVisibleIndex ? idx - 1 : idx
    const top =
      (compactedIdx < dropSlot ? compactedIdx : compactedIdx + 1) * ITEM_HEIGHT
    el.style.top = `${String(top)}px`
  })
}

function resetCardPositions(
  cardsEl: HTMLDivElement | null,
  baseHeightRef: React.RefObject<number>,
) {
  if (!cardsEl) return
  const wrappers = cardsEl.querySelectorAll<HTMLDivElement>(
    '.column__card-wrapper[data-drop-index]',
  )
  wrappers.forEach((el) => {
    const idx = parseInt(el.dataset.dropIndex ?? '', 10)
    if (Number.isNaN(idx)) return
    el.style.top = `${String(idx * ITEM_HEIGHT)}px`
  })
  cardsEl.style.height = `${String(baseHeightRef.current)}px`
}

interface UseBoardDnDOptions {
  status: TaskStatus
  tasks: Task[]
  orderIds: string[]
  dragRef: React.RefObject<DragMeta | null>
  dispatch?: React.Dispatch<MoveTaskAction>
  containerRef: React.RefObject<HTMLDivElement | null>
  totalHeight: number
}

export function useBoardDnD({
  status,
  tasks,
  orderIds,
  dragRef,
  dispatch,
  containerRef,
  totalHeight,
}: UseBoardDnDOptions) {
  const indicatorRef = useRef<HTMLDivElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const baseHeightRef = useRef(0)
  const dropIndexRef = useRef(0)

  useLayoutEffect(() => {
    baseHeightRef.current = totalHeight
  }, [totalHeight])

  const handleDragStart = useCallback(
    (e: React.DragEvent, taskId: string) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', taskId)
      const candidateWrapperEl = e.currentTarget.closest('.column__card-wrapper')
      const sourceWrapperEl =
        candidateWrapperEl instanceof HTMLDivElement ? candidateWrapperEl : null
      dragRef.current = {
        taskId,
        sourceStatus: status,
        sourceIndex: orderIds.indexOf(taskId),
        sourceWrapperEl,
      }
      requestAnimationFrame(() => {
        const meta = dragRef.current
        const sourceEl = meta?.sourceWrapperEl
        if (meta && meta.taskId === taskId && sourceEl instanceof HTMLDivElement) {
          sourceEl.style.visibility = 'hidden'
        }
      })
    },
    [status, orderIds, dragRef],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      const el = containerRef.current
      const ind = indicatorRef.current
      if (!el || !ind) return
      const meta = dragRef.current
      const sameColumnDrag = meta?.sourceStatus === status
      const rect = el.getBoundingClientRect()
      const scrollTop = el.scrollTop
      const relativeY = e.clientY - rect.top + scrollTop
      const maxDropSlot = sameColumnDrag
        ? Math.max(0, tasks.length - 1)
        : tasks.length
      const dropSlot = Math.min(
        maxDropSlot,
        Math.max(0, Math.floor(relativeY / ITEM_HEIGHT)),
      )
      dropIndexRef.current = dropSlot
      ind.style.display = 'block'
      ind.style.top = `${String(dropSlot * ITEM_HEIGHT)}px`
      ind.style.height = `${String(CARD_HEIGHT)}px`
      const cardsEl = cardsContainerRef.current
      if (cardsEl) {
        const slots = sameColumnDrag ? tasks.length : tasks.length + 1
        cardsEl.style.height = `${String(slots * ITEM_HEIGHT)}px`
      }
      shiftCardsForPlaceholder(
        cardsEl,
        dropSlot,
        sameColumnDrag ? meta.taskId : undefined,
      )
    },
    [containerRef, dragRef, status, tasks.length],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const meta = dragRef.current
      if (!meta || !dispatch) return
      const targetIndex = getMasterIndex(dropIndexRef.current, tasks, orderIds)
      const action: MoveTaskAction = {
        type: 'MOVE_TASK',
        payload: {
          taskId: meta.taskId,
          sourceStatus: meta.sourceStatus,
          sourceIndex: meta.sourceIndex,
          targetStatus: status,
          targetIndex,
        },
      }
      dispatch(action)
      restoreDraggedSource(meta)
      dragRef.current = null
      hideIndicator(indicatorRef)
      resetCardPositions(cardsContainerRef.current, baseHeightRef)
    },
    [dispatch, dragRef, orderIds, status, tasks],
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      const scrollEl = containerRef.current
      const related = e.relatedTarget as Node | null
      if (scrollEl && related && !scrollEl.contains(related)) {
        hideIndicator(indicatorRef)
        resetCardPositions(cardsContainerRef.current, baseHeightRef)
      }
    },
    [containerRef],
  )

  useEffect(() => {
    const onDragEnd = () => {
      const meta = dragRef.current
      if (meta) {
        restoreDraggedSource(meta)
      }
      dragRef.current = null
      hideIndicator(indicatorRef)
      resetCardPositions(cardsContainerRef.current, baseHeightRef)
    }
    document.addEventListener('dragend', onDragEnd)
    return () => {
      document.removeEventListener('dragend', onDragEnd)
    }
  }, [dragRef])

  return {
    indicatorRef,
    cardsContainerRef,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragLeave,
  }
}

