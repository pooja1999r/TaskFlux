import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

export interface VirtualListOptions<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export interface VirtualItem<T> {
  item: T
  index: number
  offsetTop: number
}

export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: VirtualListOptions<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * itemHeight

  const { visibleItems } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2
    const end = Math.min(items.length, start + visibleCount)
    const visible: VirtualItem<T>[] = []
    for (let i = start; i < end; i++) {
      const item = items[i]
      if (item !== undefined) {
        visible.push({ item, index: i, offsetTop: i * itemHeight })
      }
    }
    return { visibleItems: visible }
  }, [items, itemHeight, scrollTop, containerHeight, overscan])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (el) {
      setScrollTop(el.scrollTop)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return { visibleItems, totalHeight, containerRef }
}
