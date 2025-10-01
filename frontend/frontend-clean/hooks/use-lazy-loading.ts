'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseLazyLoadingReturn {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  isLoaded: boolean;
}

/**
 * Hook for implementing lazy loading with Intersection Observer
 * Optimizes performance by loading content only when it enters the viewport
 */
export function useLazyLoading(options: UseLazyLoadingOptions = {}): UseLazyLoadingReturn {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting) {
      setIsVisible(true);
      setIsLoaded(true);
      
      // If triggerOnce is true, disconnect observer after first intersection
      if (triggerOnce && observerRef.current && ref.current) {
        observerRef.current.unobserve(ref.current);
      }
    } else if (!triggerOnce) {
      setIsVisible(false);
    }
  }, [triggerOnce]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if Intersection Observer is supported
    if (!window.IntersectionObserver) {
      // Fallback for browsers without Intersection Observer support
      setIsVisible(true);
      setIsLoaded(true);
      return;
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  return {
    ref,
    isVisible,
    isLoaded
  };
}

/**
 * Hook for lazy loading images with placeholder support
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { ref, isVisible } = useLazyLoading({ threshold: 0.1 });

  useEffect(() => {
    if (!isVisible || !src) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    
    img.src = src;
  }, [isVisible, src]);

  return {
    ref,
    src: imageSrc,
    isLoading,
    hasError,
    isVisible
  };
}

export default useLazyLoading;