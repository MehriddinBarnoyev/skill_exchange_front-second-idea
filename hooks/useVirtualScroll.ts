"use client"

import { useRef, useEffect, useState, useCallback } from "react"

interface UseVirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  overscan?: number
  loadMoreItems?: () => Promise<void>
  isReverse?: boolean
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  overscan = 5,
  loadMoreItems,
  isReverse = false,
}: UseVirtualScrollProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const prevScrollHeightRef = useRef<number>(0)
  const prevItemsLengthRef = useRef<number>(0)
  const lastRangeRef = useRef({ start: 0, end: 20 })

  // Remove visibleRange from dependencies - it's not needed here
  const handleLoadMore = useCallback(async () => {
    if (!loadMoreItems || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    prevScrollHeightRef.current = containerRef.current?.scrollHeight || 0
    prevItemsLengthRef.current = items.length

    try {
      await loadMoreItems()
    } catch (error) {
      console.error("Failed to load more items:", error)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [loadMoreItems, isLoadingMore, hasMore, items.length])

  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const { scrollTop, clientHeight, scrollHeight } = container

    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan)

    // Only update state if the range has changed
    if (lastRangeRef.current.start !== startIndex || lastRangeRef.current.end !== endIndex) {
      lastRangeRef.current = { start: startIndex, end: endIndex }
      setVisibleRange({ start: startIndex, end: endIndex })
    }

    // Check if we need to load more items (when scrolling to top in reverse mode)
    if (isReverse && loadMoreItems && hasMore && !isLoadingMore) {
      const scrolledToTop = scrollTop < itemHeight * 2
      if (scrolledToTop) {
        handleLoadMore()
      }
    }

    // Check if we need to load more items (when scrolling to bottom in normal mode)
    if (!isReverse && loadMoreItems && hasMore && !isLoadingMore) {
      const scrolledToBottom = scrollHeight - scrollTop - clientHeight < itemHeight * 2
      if (scrolledToBottom) {
        handleLoadMore()
      }
    }
  }, [items.length, itemHeight, overscan, loadMoreItems, hasMore, isLoadingMore, isReverse, handleLoadMore])

  // Maintain scroll position when new items are loaded in reverse mode
  useEffect(() => {
    if (isReverse && containerRef.current && items.length > prevItemsLengthRef.current) {
      const newItems = items.length - prevItemsLengthRef.current
      const newScrollHeight = containerRef.current.scrollHeight
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current

      if (scrollDiff > 0) {
        containerRef.current.scrollTop = scrollDiff
      }
    }
  }, [items.length, isReverse])

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId: number | null = null

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        calculateVisibleRange()
        rafId = null
      })
    }

    // Initial calculation
    calculateVisibleRange()

    // Add event listener
    container.addEventListener("scroll", handleScroll)

    return () => {
      container.removeEventListener("scroll", handleScroll)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [calculateVisibleRange])

  // Calculate visible items
  const visibleItems = items.slice(visibleRange.start, visibleRange.end + 1)

  // Calculate padding to maintain scroll area size
  const topPadding = visibleRange.start * itemHeight
  const bottomPadding = (items.length - visibleRange.end - 1) * itemHeight

  return {
    containerRef,
    visibleItems,
    topPadding,
    bottomPadding,
    isLoadingMore,
    hasMore,
    loadMore: handleLoadMore,
  }
}

