import { useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react'

export interface ProgressiveListOptions<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  /** Extra items to load when sentinel is visible (default: viewport + viewport/2) */
  loadMoreChunkSize?: number
  /** Root margin for Intersection Observer (trigger load slightly before sentinel is visible) */
  rootMargin?: string
}

export interface ProgressiveListItem<T> {
  item: T
  index: number
  offsetTop: number
}

/**
 * Renders only an initial window of items (viewport + viewport/2) and loads more
 * when the user scrolls and a sentinel enters view (Intersection Observer).
 * DOM updates only when loading more items, not on every scroll.
 */
export function useProgressiveList<T>({
  items,
  itemHeight,
  containerHeight,
  loadMoreChunkSize,
  rootMargin = '200px',
}: ProgressiveListOptions<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const viewportCapacity = Math.max(1, Math.ceil(containerHeight / itemHeight))
  const halfViewportCapacity = Math.max(1, Math.ceil((containerHeight / 2) / itemHeight))
  const initialChunk = Math.max(5, viewportCapacity + halfViewportCapacity)
  const chunkSize = loadMoreChunkSize ?? initialChunk

  const [renderedCount, setRenderedCount] = useState(() =>
    Math.min(initialChunk, items.length),
  )

  const totalHeight = items.length * itemHeight

  const visibleItems = useMemo((): ProgressiveListItem<T>[] => {
    const end = Math.min(renderedCount, items.length)
    const result: ProgressiveListItem<T>[] = []
    for (let i = 0; i < end; i++) {
      const item = items[i]
      if (item !== undefined) {
        result.push({ item, index: i, offsetTop: i * itemHeight })
      }
    }
    return result
  }, [items, renderedCount, itemHeight])

  const loadMore = useCallback(() => {
    setRenderedCount((prev) => Math.min(items.length, prev + chunkSize))
  }, [items.length, chunkSize])

  useLayoutEffect(() => {
    const container = containerRef.current
    const sentinel = sentinelRef.current
    if (!container || !sentinel || renderedCount >= items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          loadMore()
        }
      },
      {
        root: container,
        rootMargin,
        threshold: 0,
      },
    )
    observer.observe(sentinel)
    return () => {
      observer.disconnect()
    }
  }, [renderedCount, items.length, loadMore, rootMargin])

  return {
    visibleItems,
    totalHeight,
    containerRef,
    sentinelRef,
    hasMore: renderedCount < items.length,
  }
}
