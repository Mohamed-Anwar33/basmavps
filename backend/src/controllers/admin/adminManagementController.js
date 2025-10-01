import Admin from '../../models/Admin.js';
import AuditLog from '../../models/AuditLog.js';

// Get all admin users
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({})
    .select('-password')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        admins
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin users',
      details: error.message
    });
  }
};

// Get admin by ID
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found'
      });
    }

    res.json({
      success: true,
      data: { admin }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin user',
      details: error.message
    });
  }
};

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { username, name, email, password, role, permissions, isActive } = req.body;
    
    // Check if username or email already exists
    const existingUser = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    // Create new admin user (password will be hashed by the model's pre-save middleware)
    const newAdmin = new Admin({
      username,
      name,
      email,
      password, // Don't hash here - let the model handle it
      role: role || 'admin',
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
      isEmailVerified: true // Auto-verify admin emails
    });

    await newAdmin.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'create', 'admins', newAdmin._id, {
      adminCreated: {
        username: newAdmin.username,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    }, req);

    // Return admin without password
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: { admin: adminResponse }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({
      success: false,
      error: error.name === 'ValidationError' ? 'Validation failed' : 'Failed to create admin user',
      details: error.message,
      validation: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, email, role, permissions, isActive } = req.body;
    
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found'
      });
    }

    // Store old data for audit log
    const oldData = {
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive
    };

    // Check if username or email already exists (excluding current admin)
    if (username !== admin.username || email !== admin.email) {
      const existingUser = await Admin.findOne({
        _id: { $ne: id },
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username or email already exists'
        });
      }
    }

    // Update admin data with proper validation
    if (username) admin.username = username;
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role) admin.role = role;
    if (permissions !== undefined) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;

    await admin.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'admins', admin._id, {
      before: oldData,
      after: {
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive
      }
    }, req);

    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.json({
      success: true,
      message: 'Admin user updated successfully',
      data: { admin: adminResponse }
    });

  } catch (error) {
    console.error('Admin update error:', error);
    res.status(500).json({
      success: false,
      error: error.name === 'ValidationError' ? 'Validation failed' : 'Failed to update admin user',
      details: error.message,
      validation: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
};

// Change admin password
export const changeAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found'
      });
    }

    // Set new password (will be hashed by the model's pre-save middleware)
    admin.password = newPassword;
    await admin.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'admins', admin._id, {
      action: 'password_changed',
      targetAdmin: admin.username
    }, req);

    res.json({
      success: true,
      message: 'Admin password changed successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to change admin password',
      details: error.message
    });
  }
};

// Toggle admin status (activate/deactivate)
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found'
      });
    }

    // Prevent deactivating the last super-admin
    if (admin.role === 'super_admin' && isActive === false) {
      const activeSuperAdmins = await Admin.countDocuments({
        role: 'super_admin',
        isActive: true,
        _id: { $ne: id }
      });

      if (activeSuperAdmins === 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot deactivate the last super admin'
        });
      }
    }

    const oldStatus = admin.isActive;
    admin.isActive = isActive;
    await admin.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'admins', admin._id, {
      action: 'status_changed',
      targetAdmin: admin.username,
      from: oldStatus,
      to: isActive
    }, req);

    res.json({
      success: true,
      message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to toggle admin status',
      details: error.message
    });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found'
      });
    }

    // Prevent deleting the last super-admin
    if (admin.role === 'super_admin') {
      const superAdminCount = await Admin.countDocuments({
        role: 'super_admin',
        _id: { $ne: id }
      });

      if (superAdminCount === 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete the last super admin'
        });
      }
    }

    // Prevent self-deletion
    if (admin._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    // Log admin action before deletion
    await AuditLog.logAction(req.user._id, 'delete', 'admins', admin._id, {
      deletedAdmin: {
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }, req);

    await Admin.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete admin user',
      details: error.message
    });
  }
};

// Get admin statistics
export const getAdminStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Admin.countDocuments({}),
      Admin.countDocuments({ isActive: true }),
      Admin.countDocuments({ isActive: false }),
      Admin.countDocuments({ role: 'super_admin' }),
      Admin.countDocuments({ role: 'admin' }),
      Admin.countDocuments({ role: 'moderator' })
    ]);

    const [total, active, inactive, superAdmins, admins, moderators] = stats;

    res.json({
      success: true,
      data: {
        totalAdmins: total,
        activeAdmins: active,
        inactiveAdmins: inactive,
        superAdmins,
        admins,
        moderators
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics',
      details: error.message
    });
  }
};

