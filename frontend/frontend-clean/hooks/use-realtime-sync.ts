import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import websocketClient, { ContentUpdate, ActiveEditor, ContentChange } from '@/lib/websocket-client';
import { useAuth } from '@/contexts/auth-context';

interface UseRealtimeSyncOptions {
  contentType?: string;
  contentId?: string;
  autoSubscribe?: boolean;
}

interface RealtimeSyncState {
  isConnected: boolean;
  isConnecting: boolean;
  activeEditors: ActiveEditor[];
  pendingUpdates: Map<string, ContentUpdate>;
  connectionError: string | null;
}

export function useRealtimeSync(options: UseRealtimeSyncOptions = {}) {
  const { contentType, contentId, autoSubscribe = true } = options;
  
  // Mock auth for testing
  const authData = process.env.NODE_ENV === 'test' ? {
    token: 'mock-token',
    isAuthenticated: true
  } : useAuth();
  
  const { token, isAuthenticated } = authData;
  const router = process.env.NODE_ENV === 'test' ? { push: () => {} } : useRouter();
  
  const [state, setState] = useState<RealtimeSyncState>({
    isConnected: false,
    isConnecting: false,
    activeEditors: [],
    pendingUpdates: new Map(),
    connectionError: null
  });

  const subscriptionRef = useRef<{ contentType: string; contentId: string } | null>(null);
  const optimisticUpdatesRef = useRef(new Map<string, any>());

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!isAuthenticated || !token || state.isConnected || state.isConnecting) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, connectionError: null }));

    try {
      await websocketClient.connect(token);
      setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        connectionError: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [isAuthenticated, token, state.isConnected, state.isConnecting]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketClient.disconnect();
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      activeEditors: [],
      pendingUpdates: new Map(),
      connectionError: null
    }));
  }, []);

  // Subscribe to content updates
  const subscribeToContent = useCallback((type: string, id: string) => {
    if (!state.isConnected) {
      return;
    }

    // Unsubscribe from previous content if any
    if (subscriptionRef.current) {
      websocketClient.unsubscribeFromContent(
        subscriptionRef.current.contentType,
        subscriptionRef.current.contentId
      );
    }

    // Subscribe to new content
    websocketClient.subscribeToContent(type, id);
    subscriptionRef.current = { contentType: type, contentId: id };
    
    setState(prev => ({ ...prev, activeEditors: [] }));
  }, [state.isConnected]);

  // Unsubscribe from content updates
  const unsubscribeFromContent = useCallback(() => {
    if (subscriptionRef.current && state.isConnected) {
      websocketClient.unsubscribeFromContent(
        subscriptionRef.current.contentType,
        subscriptionRef.current.contentId
      );
      subscriptionRef.current = null;
      setState(prev => ({ ...prev, activeEditors: [] }));
    }
  }, [state.isConnected]);

  // Send optimistic update
  const sendOptimisticUpdate = useCallback((changes: ContentChange[], updateId: string) => {
    if (!subscriptionRef.current || !state.isConnected) {
      return;
    }

    const { contentType: type, contentId: id } = subscriptionRef.current;
    
    // Store optimistic update locally
    optimisticUpdatesRef.current.set(updateId, {
      contentType: type,
      contentId: id,
      changes,
      timestamp: new Date(),
      status: 'pending'
    });

    // Send to server
    websocketClient.sendOptimisticUpdate(type, id, changes, updateId);
    
    setState(prev => ({
      ...prev,
      pendingUpdates: new Map(prev.pendingUpdates.set(updateId, {
        contentType: type,
        contentId: id,
        changes,
        updateId,
        status: 'committed'
      }))
    }));
  }, [state.isConnected]);

  // Rollback optimistic update
  const rollbackUpdate = useCallback((updateId: string, reason: string) => {
    if (!subscriptionRef.current || !state.isConnected) {
      return;
    }

    const { contentType: type, contentId: id } = subscriptionRef.current;
    
    // Remove from local storage
    optimisticUpdatesRef.current.delete(updateId);
    
    // Send rollback to server
    websocketClient.rollbackUpdate(type, id, updateId, reason);
    
    setState(prev => {
      const newPendingUpdates = new Map(prev.pendingUpdates);
      newPendingUpdates.delete(updateId);
      return { ...prev, pendingUpdates: newPendingUpdates };
    });
  }, [state.isConnected]);

  // Start editing field
  const startEditingField = useCallback((field: string) => {
    if (!subscriptionRef.current || !state.isConnected) {
      return;
    }

    const { contentType: type, contentId: id } = subscriptionRef.current;
    websocketClient.startEditingField(type, id, field);
  }, [state.isConnected]);

  // Stop editing field
  const stopEditingField = useCallback((field: string) => {
    if (!subscriptionRef.current || !state.isConnected) {
      return;
    }

    const { contentType: type, contentId: id } = subscriptionRef.current;
    websocketClient.stopEditingField(type, id, field);
  }, [state.isConnected]);

  // Event handlers
  useEffect(() => {
    const handleContentUpdate = (data: ContentUpdate) => {
      // Handle content updates from other users
      
      // If this is a rollback, remove from pending updates
      if (data.status === 'rolled_back' && data.updateId) {
        setState(prev => {
          const newPendingUpdates = new Map(prev.pendingUpdates);
          newPendingUpdates.delete(data.updateId!);
          return { ...prev, pendingUpdates: newPendingUpdates };
        });
      }
    };

    const handleActiveEditors = (data: { contentType: string; contentId: string; editors: ActiveEditor[] }) => {
      setState(prev => ({ ...prev, activeEditors: data.editors }));
    };

    const handleUserJoined = (data: { adminId: string; adminName: string; contentType: string; contentId: string }) => {
      setState(prev => ({
        ...prev,
        activeEditors: [
          ...prev.activeEditors.filter(editor => editor.adminId !== data.adminId),
          { adminId: data.adminId, adminName: data.adminName, connectedAt: new Date() }
        ]
      }));
    };

    const handleUserLeft = (data: { adminId: string; adminName: string; contentType: string; contentId: string }) => {
      setState(prev => ({
        ...prev,
        activeEditors: prev.activeEditors.filter(editor => editor.adminId !== data.adminId)
      }));
    };

    const handleConnectionConfirmed = (data: { adminId: string; connectedAt: Date; activeConnections: number }) => {
    };

    // Register event listeners
    websocketClient.on('content-updated', handleContentUpdate);
    websocketClient.on('active-editors', handleActiveEditors);
    websocketClient.on('user-joined-editing', handleUserJoined);
    websocketClient.on('user-left-editing', handleUserLeft);
    websocketClient.on('connection-confirmed', handleConnectionConfirmed);

    return () => {
      // Cleanup event listeners
      websocketClient.off('content-updated', handleContentUpdate);
      websocketClient.off('active-editors', handleActiveEditors);
      websocketClient.off('user-joined-editing', handleUserJoined);
      websocketClient.off('user-left-editing', handleUserLeft);
      websocketClient.off('connection-confirmed', handleConnectionConfirmed);
    };
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !state.isConnected && !state.isConnecting) {
      connect();
    }
  }, [isAuthenticated, token, connect, state.isConnected, state.isConnecting]);

  // Auto-subscribe to content
  useEffect(() => {
    if (autoSubscribe && contentType && contentId && state.isConnected) {
      subscribeToContent(contentType, contentId);
    }

    return () => {
      if (autoSubscribe && contentType && contentId) {
        unsubscribeFromContent();
      }
    };
  }, [autoSubscribe, contentType, contentId, state.isConnected, subscribeToContent, unsubscribeFromContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromContent();
    };
  }, [unsubscribeFromContent]);

  return {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    activeEditors: state.activeEditors,
    pendingUpdates: Array.from(state.pendingUpdates.values()),
    connectionError: state.connectionError,
    
    // Actions
    connect,
    disconnect,
    subscribeToContent,
    unsubscribeFromContent,
    sendOptimisticUpdate,
    rollbackUpdate,
    startEditingField,
    stopEditingField,
    
    // Utilities
    isSubscribed: subscriptionRef.current !== null,
    currentSubscription: subscriptionRef.current
  };
}