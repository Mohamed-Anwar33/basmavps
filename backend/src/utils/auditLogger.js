import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry
 * @param {Object} logData - The audit log data
 * @param {string} logData.adminId - ID of the admin performing the action
 * @param {string} logData.action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {string} logData.resource - Resource type (User, Service, Blog, etc.)
 * @param {string} [logData.resourceId] - ID of the affected resource
 * @param {string} logData.details - Description of the action
 * @param {Object} [logData.metadata] - Additional metadata
 * @param {string} [logData.ipAddress] - IP address of the admin
 * @param {string} [logData.userAgent] - User agent string
 */
export const createAuditLog = async (logData) => {
  try {
    const auditLog = new AuditLog({
      actorId: logData.adminId,
      action: logData.action,
      collectionName: logData.resource || 'Unknown',
      documentId: logData.resourceId,
      meta: {
        details: logData.details,
        ...logData.metadata
      },
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      timestamp: new Date()
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    // Don't throw error to avoid breaking the main operation
    return null;
  }
};

/**
 * Get audit logs with filtering and pagination
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Items per page
 * @param {string} [options.adminId] - Filter by admin ID
 * @param {string} [options.action] - Filter by action
 * @param {string} [options.resource] - Filter by resource type
 * @param {Date} [options.startDate] - Filter by start date
 * @param {Date} [options.endDate] - Filter by end date
 */
export const getAuditLogs = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      adminId,
      action,
      resource,
      startDate,
      endDate
    } = options;

    const filter = {};

    if (adminId) filter.adminId = adminId;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(filter)
      .populate('adminId', 'username email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(filter);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Delete old audit logs (for cleanup)
 * @param {number} daysToKeep - Number of days to keep logs
 */
export const cleanupAuditLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return result.deletedCount;
  } catch (error) {
    throw error;
  }
};
