import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

class WebSocketServer {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
    this.roomSubscriptions = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    return this.io;
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select('-password');
        
        if (!admin) {
          return next(new Error('Admin not found'));
        }

        socket.adminId = admin._id.toString();
        socket.adminData = admin;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      // Store client connection
      this.connectedClients.set(socket.id, {
        adminId: socket.adminId,
        adminData: socket.adminData,
        connectedAt: new Date()
      });

      // Handle room subscriptions
      socket.on('subscribe-to-content', (data) => {
        this.handleContentSubscription(socket, data);
      });

      socket.on('unsubscribe-from-content', (data) => {
        this.handleContentUnsubscription(socket, data);
      });

      // Handle content change events
      socket.on('content-change-start', (data) => {
        this.handleContentChangeStart(socket, data);
      });

      socket.on('content-change-end', (data) => {
        this.handleContentChangeEnd(socket, data);
      });

      // Handle optimistic updates
      socket.on('optimistic-update', (data) => {
        this.handleOptimisticUpdate(socket, data);
      });

      socket.on('rollback-update', (data) => {
        this.handleRollbackUpdate(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });

      // Send initial connection confirmation
      socket.emit('connection-confirmed', {
        adminId: socket.adminId,
        connectedAt: new Date(),
        activeConnections: this.connectedClients.size
      });
    });
  }

  handleContentSubscription(socket, data) {
    const { contentType, contentId } = data;
    const roomName = `${contentType}:${contentId}`;
    
    socket.join(roomName);
    
    // Track room subscriptions
    if (!this.roomSubscriptions.has(roomName)) {
      this.roomSubscriptions.set(roomName, new Set());
    }
    this.roomSubscriptions.get(roomName).add(socket.id);

    // Notify other clients in the room
    socket.to(roomName).emit('user-joined-editing', {
      adminId: socket.adminId,
      adminName: socket.adminData.name,
      contentType,
      contentId,
      timestamp: new Date()
    });

    // Send current active editors to the new subscriber
    const activeEditors = this.getActiveEditorsInRoom(roomName, socket.id);
    socket.emit('active-editors', {
      contentType,
      contentId,
      editors: activeEditors
    });
  }

  handleContentUnsubscription(socket, data) {
    const { contentType, contentId } = data;
    const roomName = `${contentType}:${contentId}`;
    
    socket.leave(roomName);
    
    // Remove from room subscriptions
    if (this.roomSubscriptions.has(roomName)) {
      this.roomSubscriptions.get(roomName).delete(socket.id);
      if (this.roomSubscriptions.get(roomName).size === 0) {
        this.roomSubscriptions.delete(roomName);
      }
    }

    // Notify other clients in the room
    socket.to(roomName).emit('user-left-editing', {
      adminId: socket.adminId,
      adminName: socket.adminData.name,
      contentType,
      contentId,
      timestamp: new Date()
    });
  }

  handleContentChangeStart(socket, data) {
    const { contentType, contentId, field } = data;
    const roomName = `${contentType}:${contentId}`;
    
    // Notify other clients that this user started editing a field
    socket.to(roomName).emit('field-edit-start', {
      adminId: socket.adminId,
      adminName: socket.adminData.name,
      contentType,
      contentId,
      field,
      timestamp: new Date()
    });
  }

  handleContentChangeEnd(socket, data) {
    const { contentType, contentId, field } = data;
    const roomName = `${contentType}:${contentId}`;
    
    // Notify other clients that this user finished editing a field
    socket.to(roomName).emit('field-edit-end', {
      adminId: socket.adminId,
      adminName: socket.adminData.name,
      contentType,
      contentId,
      field,
      timestamp: new Date()
    });
  }

  handleOptimisticUpdate(socket, data) {
    const { contentType, contentId, changes, updateId } = data;
    const roomName = `${contentType}:${contentId}`;
    
    // Broadcast optimistic update to other clients
    socket.to(roomName).emit('optimistic-update-received', {
      adminId: socket.adminId,
      adminName: socket.adminData.name,
      contentType,
      contentId,
      changes,
      updateId,
      timestamp: new Date()
    });
  }

  handleRollbackUpdate(socket, data) {
    const { contentType, contentId, updateId, reason } = data;
    const roomName = `${contentType}:${contentId}`;
    
    // Broadcast rollback to other clients
    socket.to(roomName).emit('update-rollback', {
      adminId: socket.adminId,
      contentType,
      contentId,
      updateId,
      reason,
      timestamp: new Date()
    });
  }

  handleDisconnection(socket) {
    // Remove from connected clients
    this.connectedClients.delete(socket.id);
    
    // Remove from all room subscriptions
    for (const [roomName, subscribers] of this.roomSubscriptions.entries()) {
      if (subscribers.has(socket.id)) {
        subscribers.delete(socket.id);
        
        // Notify other clients in the room
        socket.to(roomName).emit('user-disconnected', {
          adminId: socket.adminId,
          adminName: socket.adminData.name,
          timestamp: new Date()
        });
        
        // Clean up empty rooms
        if (subscribers.size === 0) {
          this.roomSubscriptions.delete(roomName);
        }
      }
    }
  }

  getActiveEditorsInRoom(roomName, excludeSocketId = null) {
    const subscribers = this.roomSubscriptions.get(roomName);
    if (!subscribers) return [];
    
    const editors = [];
    for (const socketId of subscribers) {
      if (socketId !== excludeSocketId) {
        const client = this.connectedClients.get(socketId);
        if (client) {
          editors.push({
            adminId: client.adminId,
            adminName: client.adminData.name,
            connectedAt: client.connectedAt
          });
        }
      }
    }
    
    return editors;
  }

  // Public methods for broadcasting content changes
  broadcastContentUpdate(contentType, contentId, updateData, excludeAdminId = null) {
    const roomName = `${contentType}:${contentId}`;
    
    if (excludeAdminId) {
      // Find socket to exclude
      const excludeSocket = Array.from(this.connectedClients.entries())
        .find(([_, client]) => client.adminId === excludeAdminId)?.[0];
      
      if (excludeSocket) {
        this.io.to(roomName).except(excludeSocket).emit('content-updated', {
          contentType,
          contentId,
          ...updateData,
          timestamp: new Date()
        });
      } else {
        this.io.to(roomName).emit('content-updated', {
          contentType,
          contentId,
          ...updateData,
          timestamp: new Date()
        });
      }
    } else {
      this.io.to(roomName).emit('content-updated', {
        contentType,
        contentId,
        ...updateData,
        timestamp: new Date()
      });
    }
  }

  broadcastContentDeleted(contentType, contentId, deletedBy) {
    const roomName = `${contentType}:${contentId}`;
    
    this.io.to(roomName).emit('content-deleted', {
      contentType,
      contentId,
      deletedBy,
      timestamp: new Date()
    });
  }

  broadcastVersionCreated(contentType, contentId, versionData) {
    const roomName = `${contentType}:${contentId}`;
    
    this.io.to(roomName).emit('version-created', {
      contentType,
      contentId,
      version: versionData,
      timestamp: new Date()
    });
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      activeRooms: this.roomSubscriptions.size,
      connectedAdmins: Array.from(this.connectedClients.values()).map(client => ({
        adminId: client.adminId,
        adminName: client.adminData.name,
        connectedAt: client.connectedAt
      }))
    };
  }
}

// Singleton instance
const websocketServer = new WebSocketServer();

export default websocketServer;
