import {
  useLayoutEffect,
  useState,
  useContext,
  useCallback,
} from 'react'
import { TaskCard } from './TaskCard.tsx'
import { CreateTaskModal } from './CreateTaskModal.tsx'
import { useProgressiveList } from '../hooks/useProgressiveList.ts'
import { useTaskOperations } from '../hooks/useTaskOperations.ts'
import type { TaskPriority } from '../state/boardTypes.ts'
import { type ColumnProps, CARD_HEIGHT, ITEM_HEIGHT } from '../state/boardTypes.ts'
import { BoardContext } from '../state/BoardContext.tsx'
import { useBoardDnD } from '../hooks/useBoardDnD.ts'

export function Column({ title, status, tasks, orderIds, dragRef }: ColumnProps) {
  const ctx = useContext(BoardContext)
  const dispatch = ctx?.dispatch
  const { addTaskToColumn } = useTaskOperations(dispatch ?? (() => undefined))
  const [height, setHeight] = useState(400)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { visibleItems, totalHeight, containerRef, sentinelRef } = useProgressiveList({
    items: tasks,
    itemHeight: ITEM_HEIGHT,
    containerHeight: height,
  })

  const handleOpenAddModal = useCallback(() => {
    setIsAddModalOpen(true)
  }, [])

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false)
  }, [])

  const handleCreateTask = useCallback(
    (payload: { title: string; description: string; priority: TaskPriority }) => {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
      addTaskToColumn(status, 0, payload)
      setIsAddModalOpen(false)
    },
    [status, addTaskToColumn],
  )

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

  const {
    indicatorRef,
    cardsContainerRef,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragLeave,
  } = useBoardDnD({
    status,
    tasks,
    orderIds,
    dragRef,
    dispatch,
    containerRef,
    totalHeight,
  })

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
            <div
              ref={sentinelRef}
              className="column__sentinel"
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: visibleItems.length * ITEM_HEIGHT,
                height: 1,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
        <button
          type="button"
          className="column__add"
          onClick={handleOpenAddModal}
          aria-label={`Add a card to ${title}`}
        >
          + Add a card
        </button>
      </div>
      <CreateTaskModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleCreateTask}
      />
    </div>
  )
}
