'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDebouncedCallback } from './use-debounced-state';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  compareFunction?: (a: any, b: any) => boolean;
}

interface UseAutoSaveReturn {
  save: () => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  retryCount: number;
  hasUnsavedChanges: boolean;
}

/**
 * Optimized auto-save hook with retry logic, custom comparison, and performance optimizations
 */
export const useAutoSave = ({
  data,
  onSave,
  delay = 3000,
  enabled = true,
  maxRetries = 3,
  retryDelay = 1000,
  compareFunction
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const lastDataRef = useRef<any>(data);
  const savePromiseRef = useRef<Promise<void> | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Default comparison function with deep equality check optimization
  const defaultCompare = useCallback((a: any, b: any): boolean => {
    // Fast reference check
    if (a === b) return true;
    
    // Type check
    if (typeof a !== typeof b) return false;
    
    // Null/undefined check
    if (a == null || b == null) return a === b;
    
    // For objects, use JSON comparison (can be overridden with compareFunction)
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }, []);

  const compare = compareFunction || defaultCompare;

  // Optimized save function with retry logic
  const save = useCallback(async (): Promise<void> => {
    // Prevent concurrent saves
    if (savePromiseRef.current) {
      return savePromiseRef.current;
    }

    const performSave = async (): Promise<void> => {
      try {
        setIsSaving(true);
        setError(null);
        
        await onSave(data);
        
        // Update state on successful save
        setLastSaved(new Date());
        setRetryCount(0);
        setHasUnsavedChanges(false);
        lastDataRef.current = structuredClone ? structuredClone(data) : JSON.parse(JSON.stringify(data));
        
      } catch (saveError) {
        const errorMessage = saveError instanceof Error ? saveError.message : 'حدث خطأ أثناء الحفظ';
        setError(errorMessage);
        
        // Retry logic
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          
          // Schedule retry with exponential backoff
          const backoffDelay = retryDelay * Math.pow(2, retryCount);
          retryTimeoutRef.current = setTimeout(() => {
            savePromiseRef.current = null;
            save();
          }, backoffDelay);
          
          throw new Error(`Save failed, retrying in ${backoffDelay}ms... (${retryCount + 1}/${maxRetries})`);
        } else {
          throw saveError;
        }
      } finally {
        setIsSaving(false);
        savePromiseRef.current = null;
      }
    };

    savePromiseRef.current = performSave();
    return savePromiseRef.current;
  }, [data, onSave, retryCount, maxRetries, retryDelay]);

  // Debounced save to prevent excessive calls
  const debouncedSave = useDebouncedCallback(save, delay);

  // Check for changes and trigger auto-save
  useEffect(() => {
    if (!enabled) return;

    const hasChanged = !compare(data, lastDataRef.current);
    setHasUnsavedChanges(hasChanged);
    
    if (hasChanged && !isSaving) {
      debouncedSave();
    }
  }, [data, enabled, compare, isSaving, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    save,
    isSaving,
    lastSaved,
    error,
    retryCount,
    hasUnsavedChanges
  };
};

export default useAutoSave;