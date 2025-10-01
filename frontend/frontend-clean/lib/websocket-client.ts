import { io, Socket } from 'socket.io-client';

export interface ContentChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

export interface ContentUpdate {
  contentType: string;
  contentId: string;
  content?: any;
  changes?: ContentChange[];
  updatedBy?: string;
  updateId?: string;
  status?: 'committed' | 'rolled_back';
  error?: string;
}

export interface ActiveEditor {
  adminId: string;
  adminName: string;
  connectedAt: Date;
}

export interface WebSocketEvents {
  'connection-confirmed': (data: { adminId: string; connectedAt: Date; activeConnections: number }) => void;
  'content-updated': (data: ContentUpdate) => void;
  'content-deleted': (data: { contentType: string; contentId: string; deletedBy: string; timestamp: Date }) => void;
  'version-created': (data: { contentType: string; contentId: string; version: any; timestamp: Date }) => void;
  'user-joined-editing': (data: { adminId: string; adminName: string; contentType: string; contentId: string; timestamp: Date }) => void;
  'user-left-editing': (data: { adminId: string; adminName: string; contentType: string; contentId: string; timestamp: Date }) => void;
  'user-disconnected': (data: { adminId: string; adminName: string; timestamp: Date }) => void;
  'field-edit-start': (data: { adminId: string; adminName: string; contentType: string; contentId: string; field: string; timestamp: Date }) => void;
  'field-edit-end': (data: { adminId: string; adminName: string; contentType: string; contentId: string; field: string; timestamp: Date }) => void;
  'optimistic-update-received': (data: { adminId: string; adminName: string; contentType: string; contentId: string; changes: ContentChange[]; updateId: string; timestamp: Date }) => void;
  'update-rollback': (data: { adminId: string; contentType: string; contentId: string; updateId: string; reason: string; timestamp: Date }) => void;
  'active-editors': (data: { contentType: string; contentId: string; editors: ActiveEditor[] }) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventListeners = new Map<string, Set<Function>>();

  constructor() {
    this.setupEventListeners();
  }

  async connect(token: string): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      
      this.socket = io(backendUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      await new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket not initialized'));
          return;
        }

        this.socket.on('connect', () => {
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.isConnecting = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          this.handleDisconnection();
        });

        // Setup event forwarding
        this.setupEventForwarding();
      });

    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Content subscription methods
  subscribeToContent(contentType: string, contentId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('subscribe-to-content', { contentType, contentId });
  }

  unsubscribeFromContent(contentType: string, contentId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('unsubscribe-from-content', { contentType, contentId });
  }

  // Content editing events
  startEditingField(contentType: string, contentId: string, field: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('content-change-start', { contentType, contentId, field });
  }

  stopEditingField(contentType: string, contentId: string, field: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('content-change-end', { contentType, contentId, field });
  }

  // Optimistic updates
  sendOptimisticUpdate(contentType: string, contentId: string, changes: ContentChange[], updateId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('optimistic-update', { contentType, contentId, changes, updateId });
  }

  rollbackUpdate(contentType: string, contentId: string, updateId: string, reason: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('rollback-update', { contentType, contentId, updateId, reason });
  }

  // Event listener management
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private setupEventListeners(): void {
    // This will be called when socket is created
  }

  private setupEventForwarding(): void {
    if (!this.socket) return;

    // Forward all WebSocket events to registered listeners
    const events: (keyof WebSocketEvents)[] = [
      'connection-confirmed',
      'content-updated',
      'content-deleted',
      'version-created',
      'user-joined-editing',
      'user-left-editing',
      'user-disconnected',
      'field-edit-start',
      'field-edit-end',
      'optimistic-update-received',
      'update-rollback',
      'active-editors'
    ];

    events.forEach(event => {
      this.socket!.on(event, (data: any) => {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
          listeners.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
            }
          });
        }
      });
    });
  }

  private async handleDisconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, delay);
    } else {
    }
  }

  // Utility methods
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Singleton instance
const websocketClient = new WebSocketClient();

export default websocketClient;