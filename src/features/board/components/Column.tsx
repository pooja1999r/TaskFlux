import {
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react'
import { TaskCard } from './TaskCard.tsx'
import { useVirtualList } from '../../../shared/hooks/useVirtualList.ts'
import {
  type ColumnProps,
  type Task,
  CARD_HEIGHT,
  ITEM_HEIGHT,
} from '../state/boardTypes.ts'
import { BoardContext } from '../state/BoardContext.tsx'
import type { MoveTaskAction } from '../state/boardActions.ts'

/** Convert filtered-list drop slot (insert before this filtered index) to master order index. */
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
    const top = (compactedIdx < dropSlot ? compactedIdx : compactedIdx + 1) * ITEM_HEIGHT
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

export function Column({ title, status, tasks, orderIds, dragRef }: ColumnProps) {
  const ctx = useContext(BoardContext)
  const [height, setHeight] = useState(400)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const baseHeightRef = useRef(0)
  const dropIndexRef = useRef(0)

  const { visibleItems, totalHeight, containerRef } = useVirtualList({
    items: tasks,
    itemHeight: ITEM_HEIGHT,
    containerHeight: height,
    overscan: 2,
  })

  useLayoutEffect(() => {
    baseHeightRef.current = totalHeight
  }, [totalHeight])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setHeight(el.clientHeight)
    })
    ro.observe(el)
    setHeight(el.clientHeight)
    return () => {
      ro.disconnect()
    }
  }, [containerRef])

  const handleDragStart = useCallback(
    (e: React.DragEvent, taskId: string) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', taskId)
      const candidateWrapperEl = e.currentTarget.closest('.column__card-wrapper')
      const sourceWrapperEl =
        candidateWrapperEl instanceof HTMLDivElement
          ? candidateWrapperEl
          : null
      dragRef.current = {
        taskId,
        sourceStatus: status,
        sourceIndex: orderIds.indexOf(taskId),
        sourceWrapperEl,
      }
      // Hide source card after drag image is captured by the browser.
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
      shiftCardsForPlaceholder(cardsEl, dropSlot, sameColumnDrag ? meta.taskId : undefined)
    },
    [tasks.length, containerRef, dragRef, status],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const meta = dragRef.current
      if (!meta || !ctx) return
      const targetIndex = getMasterIndex(
        dropIndexRef.current,
        tasks,
        orderIds,
      )
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
      ctx.dispatch(action)
      restoreDraggedSource(meta)
      dragRef.current = null
      hideIndicator(indicatorRef)
      resetCardPositions(cardsContainerRef.current, baseHeightRef)
    },
    [status, tasks, orderIds, dragRef, ctx],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const scrollEl = containerRef.current
    const related = e.relatedTarget as Node | null
    if (scrollEl && related && !scrollEl.contains(related)) {
      hideIndicator(indicatorRef)
      resetCardPositions(cardsContainerRef.current, baseHeightRef)
    }
  }, [containerRef])

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

  return (
    <div className="column" data-status={status}>
      <div className="column__header">
        <h3 className="column__title">{title}</h3>
        <button type="button" className="column__menu" aria-label="Options">
          ⋮
        </button>
      </div>
      <div className="column__body">
        <div
          className="column__scroll"
          ref={containerRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          <div
            ref={cardsContainerRef}
            className="column__cards"
            style={{
              height: totalHeight,
              position: 'relative',
            }}
          >
            <div
              ref={indicatorRef}
              className="column__drop-indicator"
              aria-hidden
            />
            {visibleItems.map(({ item, offsetTop, index }) => (
              <div
                key={item.id}
                className="column__card-wrapper"
                data-drop-index={index}
                data-task-id={item.id}
                style={{
                  position: 'absolute',
                  top: offsetTop,
                  left: 0,
                  right: 0,
                  height: CARD_HEIGHT,
                }}
              >
                <TaskCard task={item} onDragStart={handleDragStart} />
              </div>
            ))}
          </div>
        </div>
        <button type="button" className="column__add">
          + Add a card
        </button>
      </div>
    </div>
  )
}
