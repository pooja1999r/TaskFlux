import { useLayoutEffect, useState } from 'react'
import { TaskCard } from './TaskCard.tsx'
import { useVirtualList } from '../../../shared/hooks/useVirtualList.ts'
import { type ColumnProps, CARD_HEIGHT, ITEM_HEIGHT } from '../state/boardTypes.ts'

export function Column({ title, status, tasks }: ColumnProps) {
  const [height, setHeight] = useState(400)
  const { visibleItems, totalHeight, containerRef } = useVirtualList({
    items: tasks,
    itemHeight: ITEM_HEIGHT,
    containerHeight: height,
    overscan: 2,
  })

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

  return (
    <div className="column" data-status={status}>
      <div className="column__header">
        <h3 className="column__title">{title}</h3>
        <button type="button" className="column__menu" aria-label="Options">
          ⋮
        </button>
      </div>
      <div className="column__body">
        <div className="column__scroll" ref={containerRef}>
          <div
            className="column__cards"
            style={{
              height: totalHeight,
              position: 'relative',
            }}
          >
            {visibleItems.map(({ item, offsetTop }) => (
              <div
                key={item.id}
                className="column__card-wrapper"
                style={{
                  position: 'absolute',
                  top: offsetTop,
                  left: 0,
                  right: 0,
                  height: CARD_HEIGHT,
                }}
              >
                <TaskCard task={item} />
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
