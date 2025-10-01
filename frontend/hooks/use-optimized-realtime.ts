'use client';

import { useCallback, useRef, useMemo } from 'react';
import { useRealtimeSync } from './use-realtime-sync';
import { useDebouncedCallback, useThrottledCallback } from './use-debounced-state';

interface OptimizedRealtimeOptions {
  contentType: string;
  contentId: string;
  updateDebounceDelay?: number;
  conflictResolutionDelay?: number;
  maxPendingUpdates?: number;
}

interface OptimizedUpdate {
  id: string;
  field: string;
  value: any;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Optimized real-time sync hook that batches updates and manages conflicts efficiently
 */
export function useOptimizedRealtime(options: OptimizedRealtimeOptions) {
  const {
    contentType,
    contentId,
    updateDebounceDelay = 500,
    conflictResolutionDelay = 1000,
    maxPendingUpdates = 10
  } = options;

  const pendingUpdatesRef = useRef<Map<string, OptimizedUpdate>>(new Map());
  const updateQueueRef = useRef<OptimizedUpdate[]>([]);
  const lastSyncTimestampRef = useRef<number>(Date.now());

  // Base real-time sync functionality
  const {
    isConnected,
    activeEditors,
    subscribeToContent,
    unsubscribeFromContent,
    sendOptimisticUpdate,
    rollbackUpdate,
    startEditingField,
    stopEditingField,
    pendingUpdates
  } = useRealtimeSync({
    contentType,
    contentId,
    autoSubscribe: true
  });

  // Batch and send updates efficiently
  const processPendingUpdates = useCallback(async () => {
    const updates = Array.from(pendingUpdatesRef.current.values());
    if (updates.length === 0) return;

    // Sort by priority and timestamp
    updates.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Batch updates by field to avoid conflicts
    const batchedUpdates = new Map<string, OptimizedUpdate>();
    updates.forEach(update => {
      const existing = batchedUpdates.get(update.field);
      if (!existing || update.timestamp > existing.timestamp) {
        batchedUpdates.set(update.field, update);
      }
    });

    // Send batched updates
    const changes = Array.from(batchedUpdates.values()).map(update => ({
      field: update.field,
      oldValue: null, // Will be determined by server
      newValue: update.value,
      timestamp: new Date(update.timestamp)
    }));

    if (changes.length > 0) {
      const updateId = `batch-${Date.now()}`;
      sendOptimisticUpdate(changes, updateId);
      
      // Clear processed updates
      batchedUpdates.forEach((_, field) => {
        pendingUpdatesRef.current.delete(field);
      });
      
      lastSyncTimestampRef.current = Date.now();
    }
  }, [sendOptimisticUpdate]);

  // Debounced update processor
  const debouncedProcessUpdates = useDebouncedCallback(
    processPendingUpdates,
    updateDebounceDelay
  );

  // Throttled field editing notifications
  const throttledStartEditing = useThrottledCallback(
    startEditingField,
    1000
  );

  const throttledStopEditing = useThrottledCallback(
    stopEditingField,
    500
  );

  // Optimized update function
  const sendUpdate = useCallback((
    field: string, 
    value: any, 
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    const updateId = `${field}-${Date.now()}`;
    const update: OptimizedUpdate = {
      id: updateId,
      field,
      value,
      timestamp: Date.now(),
      priority
    };

    // Add to pending updates (replace existing for same field)
    pendingUpdatesRef.current.set(field, update);

    // Limit pending updates to prevent memory issues
    if (pendingUpdatesRef.current.size > maxPendingUpdates) {
      const oldestField = Array.from(pendingUpdatesRef.current.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      pendingUpdatesRef.current.delete(oldestField);
    }

    // Process updates based on priority
    if (priority === 'high') {
      // High priority updates are processed immediately
      processPendingUpdates();
    } else {
      // Medium and low priority updates are debounced
      debouncedProcessUpdates();
    }
  }, [processPendingUpdates, debouncedProcessUpdates, maxPendingUpdates]);

  // Optimized field editing management
  const startFieldEditing = useCallback((field: string) => {
    throttledStartEditing(field);
  }, [throttledStartEditing]);

  const stopFieldEditing = useCallback((field: string) => {
    throttledStopEditing(field);
  }, [throttledStopEditing]);

  // Conflict resolution
  const resolveConflict = useCallback((field: string, resolution: 'local' | 'remote' | 'merge') => {
    const pendingUpdate = pendingUpdatesRef.current.get(field);
    if (!pendingUpdate) return;

    switch (resolution) {
      case 'local':
        // Keep local changes, send as high priority
        sendUpdate(field, pendingUpdate.value, 'high');
        break;
      case 'remote':
        // Discard local changes
        pendingUpdatesRef.current.delete(field);
        break;
      case 'merge':
        // Custom merge logic would go here
        // For now, just keep local changes
        sendUpdate(field, pendingUpdate.value, 'high');
        break;
    }
  }, [sendUpdate]);

  // Performance metrics
  const metrics = useMemo(() => {
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTimestampRef.current;
    const pendingCount = pendingUpdatesRef.current.size;
    const queuedCount = updateQueueRef.current.length;

    return {
      isHealthy: isConnected && timeSinceLastSync < 30000, // 30 seconds
      pendingUpdates: pendingCount,
      queuedUpdates: queuedCount,
      timeSinceLastSync,
      activeEditors: activeEditors.length,
      connectionStatus: isConnected ? 'connected' : 'disconnected'
    };
  }, [isConnected, activeEditors.length]);

  // Cleanup function
  const cleanup = useCallback(() => {
    pendingUpdatesRef.current.clear();
    updateQueueRef.current = [];
    unsubscribeFromContent();
  }, [unsubscribeFromContent]);

  return {
    // State
    isConnected,
    activeEditors,
    pendingUpdates: Array.from(pendingUpdatesRef.current.values()),
    metrics,

    // Actions
    sendUpdate,
    startFieldEditing,
    stopFieldEditing,
    resolveConflict,
    processPendingUpdates,
    cleanup,

    // Utilities
    subscribeToContent,
    unsubscribeFromContent,
    rollbackUpdate
  };
}

export default useOptimizedRealtime;