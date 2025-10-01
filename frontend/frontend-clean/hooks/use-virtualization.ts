'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseVirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  totalItems: number;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

interface UseVirtualizationReturn {
  virtualItems: VirtualItem[];
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  handleScroll: (event: React.UIEvent<HTMLElement>) => void;
}

/**
 * Hook for implementing virtual scrolling to handle large lists efficiently
 * Only renders visible items plus a small buffer, dramatically improving performance
 */
export function useVirtualization(options: UseVirtualizationOptions): UseVirtualizationReturn {
  const { itemHeight, containerHeight, overscan = 5, totalItems } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const virtualItems = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      totalItems - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(totalItems - 1, visibleEnd + overscan);

    const items: VirtualItem[] = [];
    for (let i = start; i <= end; i++) {
      items.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight
      });
    }

    return items;
  }, [scrollTop, itemHeight, containerHeight, overscan, totalItems]);

  const totalHeight = totalItems * itemHeight;

  const scrollToIndex = useCallback((index: number) => {
    const scrollTop = index * itemHeight;
    setScrollTop(scrollTop);
  }, [itemHeight]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    handleScroll
  };
}

/**
 * Hook for implementing windowing for grid layouts
 */
interface UseGridVirtualizationOptions {
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
}

interface GridVirtualItem {
  index: number;
  row: number;
  col: number;
  x: number;
  y: number;
}

export function useGridVirtualization(options: UseGridVirtualizationOptions) {
  const { 
    itemWidth, 
    itemHeight, 
    containerWidth, 
    containerHeight, 
    totalItems, 
    overscan = 2 
  } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const columnsPerRow = Math.floor(containerWidth / itemWidth);
  const totalRows = Math.ceil(totalItems / columnsPerRow);

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
    setScrollLeft(event.currentTarget.scrollLeft);
  }, []);

  const virtualItems = useMemo(() => {
    const visibleRowStart = Math.floor(scrollTop / itemHeight);
    const visibleRowEnd = Math.min(
      visibleRowStart + Math.ceil(containerHeight / itemHeight),
      totalRows - 1
    );

    const rowStart = Math.max(0, visibleRowStart - overscan);
    const rowEnd = Math.min(totalRows - 1, visibleRowEnd + overscan);

    const items: GridVirtualItem[] = [];
    
    for (let row = rowStart; row <= rowEnd; row++) {
      for (let col = 0; col < columnsPerRow; col++) {
        const index = row * columnsPerRow + col;
        if (index >= totalItems) break;

        items.push({
          index,
          row,
          col,
          x: col * itemWidth,
          y: row * itemHeight
        });
      }
    }

    return items;
  }, [scrollTop, scrollLeft, itemHeight, itemWidth, containerHeight, columnsPerRow, totalRows, totalItems, overscan]);

  return {
    virtualItems,
    totalHeight: totalRows * itemHeight,
    totalWidth: columnsPerRow * itemWidth,
    handleScroll,
    columnsPerRow
  };
}

export default useVirtualization;