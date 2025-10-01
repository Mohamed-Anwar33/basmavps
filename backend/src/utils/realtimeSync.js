import ContentVersion from '../models/ContentVersion.js';
import PageContent from '../models/PageContent.js';
import HomepageSection from '../models/HomepageSection.js';
import Service from '../models/Service.js';
import Media from '../models/Media.js';
import AuditLog from '../models/AuditLog.js';
import websocketServer from './websocketServer.js';

class RealtimeSyncService {
  constructor() {
    this.modelMap = {
      'PageContent': PageContent,
      'HomepageSection': HomepageSection,
      'Service': Service,
      'Media': Media
    };
    
    this.pendingUpdates = new Map(); // For optimistic updates
    this.conflictResolution = new Map(); // For handling conflicts
  }

  /**
   * Sync content update with real-time broadcasting and versioning
   */
  async syncContentUpdate(contentType, contentId, updateData, adminId, req = null) {
    try {
      const Model = this.modelMap[contentType];
      if (!Model) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      // Get current content for comparison
      const currentContent = await Model.findById(contentId);
      if (!currentContent) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Create content snapshot before update
      const previousContent = currentContent.toObject();
      
      // Apply update
      const updatedContent = await Model.findByIdAndUpdate(
        contentId,
        updateData,
        { new: true, runValidators: true }
      );

      // Calculate changes for versioning
      const changes = this.calculateChanges(previousContent, updatedContent.toObject());
      
      // Create new version if there are significant changes
      if (changes.length > 0) {
        await ContentVersion.createVersion(
          contentId,
          contentType,
          updatedContent.toObject(),
          changes,
          adminId,
          { syncedAt: new Date() }
        );
      }

      // Log the action
      await AuditLog.logAction(
        adminId,
        'update',
        contentType,
        contentId,
        { before: previousContent, after: updatedContent.toObject() },
        req
      );

      // Broadcast update to connected clients
      websocketServer.broadcastContentUpdate(
        contentType,
        contentId,
        {
          content: updatedContent,
          changes,
          updatedBy: adminId
        },
        adminId // Exclude the admin who made the change
      );

      return {
        success: true,
        content: updatedContent,
        version: changes.length > 0 ? await ContentVersion.findOne(
          { contentId, contentType },
          {},
          { sort: { version: -1 } }
        ) : null,
        changes
      };

    } catch (error) {
      // Broadcast error to clients
      websocketServer.broadcastContentUpdate(
        contentType,
        contentId,
        {
          error: error.message,
          updatedBy: adminId
        }
      );

      throw error;
    }
  }

  /**
   * Handle optimistic updates with rollback capability
   */
  async handleOptimisticUpdate(contentType, contentId, changes, adminId, updateId) {
    try {
      // Store pending update
      const pendingKey = `${contentType}:${contentId}:${updateId}`;
      this.pendingUpdates.set(pendingKey, {
        contentType,
        contentId,
        changes,
        adminId,
        timestamp: new Date(),
        status: 'pending'
      });

      // Apply optimistic update
      const Model = this.modelMap[contentType];
      const currentContent = await Model.findById(contentId);
      
      if (!currentContent) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Apply changes optimistically
      const optimisticContent = this.applyChanges(currentContent.toObject(), changes);
      
      // Validate the optimistic update
      const validationResult = await this.validateOptimisticUpdate(
        contentType,
        contentId,
        optimisticContent,
        adminId
      );

      if (validationResult.valid) {
        // Commit the optimistic update
        const updatedContent = await Model.findByIdAndUpdate(
          contentId,
          optimisticContent,
          { new: true, runValidators: true }
        );

        // Update pending status
        const pendingUpdate = this.pendingUpdates.get(pendingKey);
        if (pendingUpdate) {
          pendingUpdate.status = 'committed';
          pendingUpdate.committedAt = new Date();
        }

        // Create version
        await ContentVersion.createVersion(
          contentId,
          contentType,
          updatedContent.toObject(),
          changes,
          adminId,
          { optimistic: true, updateId }
        );

        // Broadcast successful commit
        websocketServer.broadcastContentUpdate(
          contentType,
          contentId,
          {
            content: updatedContent,
            changes,
            updateId,
            status: 'committed',
            updatedBy: adminId
          },
          adminId
        );

        return { success: true, content: updatedContent, updateId };

      } else {
        // Rollback optimistic update
        await this.rollbackOptimisticUpdate(contentType, contentId, updateId, validationResult.reason);
        throw new Error(`Optimistic update failed: ${validationResult.reason}`);
      }

    } catch (error) {
      // Rollback on error
      await this.rollbackOptimisticUpdate(contentType, contentId, updateId, error.message);
      throw error;
    }
  }

  /**
   * Rollback optimistic update
   */
  async rollbackOptimisticUpdate(contentType, contentId, updateId, reason) {
    const pendingKey = `${contentType}:${contentId}:${updateId}`;
    const pendingUpdate = this.pendingUpdates.get(pendingKey);
    
    if (pendingUpdate) {
      pendingUpdate.status = 'rolled_back';
      pendingUpdate.rolledBackAt = new Date();
      pendingUpdate.rollbackReason = reason;
    }

    // Broadcast rollback to clients
    websocketServer.io.emit('update-rollback', {
      contentType,
      contentId,
      updateId,
      reason,
      timestamp: new Date()
    });

    // Clean up pending update after a delay
    setTimeout(() => {
      this.pendingUpdates.delete(pendingKey);
    }, 30000); // Keep for 30 seconds for debugging
  }

  /**
   * Validate optimistic update for conflicts
   */
  async validateOptimisticUpdate(contentType, contentId, optimisticContent, adminId) {
    try {
      // Check for concurrent modifications
      const latestVersion = await ContentVersion.findOne(
        { contentId, contentType },
        {},
        { sort: { version: -1 } }
      );

      if (latestVersion) {
        const timeDiff = new Date() - latestVersion.createdAt;
        const isRecentUpdate = timeDiff < 5000; // 5 seconds
        const isDifferentUser = latestVersion.createdBy.toString() !== adminId;

        if (isRecentUpdate && isDifferentUser) {
          return {
            valid: false,
            reason: 'Concurrent modification detected',
            conflictingVersion: latestVersion.version
          };
        }
      }

      // Validate content structure
      const Model = this.modelMap[contentType];
      const tempDoc = new Model(optimisticContent);
      const validationError = tempDoc.validateSync();
      
      if (validationError) {
        return {
          valid: false,
          reason: `Validation error: ${validationError.message}`
        };
      }

      return { valid: true };

    } catch (error) {
      return {
        valid: false,
        reason: `Validation failed: ${error.message}`
      };
    }
  }

  /**
   * Handle content deletion with real-time sync
   */
  async syncContentDeletion(contentType, contentId, adminId, req = null) {
    try {
      const Model = this.modelMap[contentType];
      const content = await Model.findById(contentId);
      
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Create final version before deletion
      await ContentVersion.createVersion(
        contentId,
        contentType,
        content.toObject(),
        [{ field: 'deleted', oldValue: false, newValue: true, timestamp: new Date() }],
        adminId,
        { deleted: true }
      );

      // Soft delete or hard delete based on model
      let deletedContent;
      if (content.schema.paths.isDeleted) {
        deletedContent = await Model.findByIdAndUpdate(
          contentId,
          { isDeleted: true, deletedAt: new Date(), deletedBy: adminId },
          { new: true }
        );
      } else {
        deletedContent = await Model.findByIdAndDelete(contentId);
      }

      // Log the action
      await AuditLog.logAction(
        adminId,
        'delete',
        contentType,
        contentId,
        { before: content.toObject(), after: null },
        req
      );

      // Broadcast deletion
      websocketServer.broadcastContentDeleted(contentType, contentId, adminId);

      return { success: true, deletedContent };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get content with version history
   */
  async getContentWithHistory(contentType, contentId, options = {}) {
    try {
      const Model = this.modelMap[contentType];
      const content = await Model.findById(contentId);
      
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      const history = await ContentVersion.getHistory(contentId, contentType, options);
      const activeVersion = await ContentVersion.getActiveVersion(contentId, contentType);

      return {
        content,
        history,
        activeVersion,
        totalVersions: await ContentVersion.countDocuments({ contentId, contentType })
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Restore content to specific version
   */
  async restoreContentVersion(contentType, contentId, version, adminId, req = null) {
    try {
      const restoredVersion = await ContentVersion.restoreVersion(
        contentId,
        contentType,
        version,
        adminId
      );

      // Update the actual content
      const Model = this.modelMap[contentType];
      const updatedContent = await Model.findByIdAndUpdate(
        contentId,
        restoredVersion.content,
        { new: true, runValidators: true }
      );

      // Log the action
      await AuditLog.logAction(
        adminId,
        'update',
        contentType,
        contentId,
        { action: 'restore', restoredFrom: version },
        req
      );

      // Broadcast version restoration
      websocketServer.broadcastContentUpdate(
        contentType,
        contentId,
        {
          content: updatedContent,
          action: 'restored',
          restoredFrom: version,
          updatedBy: adminId
        }
      );

      websocketServer.broadcastVersionCreated(contentType, contentId, restoredVersion);

      return { success: true, content: updatedContent, version: restoredVersion };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate changes between two content objects
   */
  calculateChanges(oldContent, newContent) {
    const changes = [];
    
    const compareObjects = (obj1, obj2, path = '') => {
      const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
      
      for (const key of keys) {
        // Skip internal mongoose fields
        if (key.startsWith('_') || key === '__v') continue;
        
        const currentPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];
        
        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          changes.push({
            field: currentPath,
            oldValue: val1,
            newValue: val2,
            timestamp: new Date()
          });
        }
      }
    };
    
    compareObjects(oldContent, newContent);
    return changes;
  }

  /**
   * Apply changes to content object
   */
  applyChanges(content, changes) {
    const updatedContent = { ...content };
    
    for (const change of changes) {
      const { field, newValue } = change;
      const keys = field.split('.');
      
      let current = updatedContent;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = newValue;
    }
    
    return updatedContent;
  }

  /**
   * Get sync statistics
   */
  getSyncStats() {
    return {
      pendingUpdates: this.pendingUpdates.size,
      activeConflicts: this.conflictResolution.size,
      connectionStats: websocketServer.getConnectionStats()
    };
  }

  /**
   * Clean up old pending updates
   */
  cleanupPendingUpdates() {
    const now = new Date();
    const expiredKeys = [];
    
    for (const [key, update] of this.pendingUpdates.entries()) {
      const age = now - update.timestamp;
      if (age > 300000) { // 5 minutes
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.pendingUpdates.delete(key));
    
    return expiredKeys.length;
  }
}

// Singleton instance
const realtimeSyncService = new RealtimeSyncService();

// Cleanup old pending updates every 5 minutes
setInterval(() => {
  const cleaned = realtimeSyncService.cleanupPendingUpdates();
  if (cleaned > 0) {
    }
}, 300000);

export default realtimeSyncService;
