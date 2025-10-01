/**
 * 🔍 سكريپت فحص أدوار المديرين
 */

import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
}

async function checkAdminRoles() {
  
  try {
    const admins = await Admin.find({}).select('username email role isActive');
    
    
    if (admins.length === 0) {
      return;
    }
    
    
    admins.forEach((admin, index) => {
      const status = admin.isActive ? '✅ نشط' : '❌ معطل';
      const roleIcon = admin.role === 'super_admin' ? '👑' : admin.role === 'admin' ? '🛡️' : '🔧';
      
    });
    
    // فحص الأدوار المتاحة
    const roleCount = {};
    admins.forEach(admin => {
      roleCount[admin.role] = (roleCount[admin.role] || 0) + 1;
    });
    
    Object.keys(roleCount).forEach(role => {
      const icon = role === 'super_admin' ? '👑' : role === 'admin' ? '🛡️' : '🔧';
    });
    
    // التحقق من وجود مدير نشط
    const activeAdmins = admins.filter(admin => admin.isActive);
    const activeAdminRoles = activeAdmins.filter(admin => ['admin', 'super_admin'].includes(admin.role));
    
    
    if (activeAdminRoles.length === 0) {
    } else {
      activeAdminRoles.forEach(admin => {
        const roleIcon = admin.role === 'super_admin' ? '👑' : '🛡️';
      });
    }
    
  } catch (error) {
  }
}

async function createTestAdmin() {
  
  try {
    // التحقق من وجود مدير تجريبي
    const existingAdmin = await Admin.findOne({ username: 'testadmin' });
    if (existingAdmin) {
      return;
    }
    
    // إنشاء مدير جديد
    const newAdmin = new Admin({
      username: 'testadmin',
      email: 'testadmin@basmadesign.com',
      password: 'admin123456',
      name: 'مدير تجريبي',
      role: 'admin',
      isActive: true
    });
    
    await newAdmin.save();
    
  } catch (error) {
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  
  await connectDB();
  
  switch (command) {
    case 'create':
      await createTestAdmin();
      break;
    case 'check':
    default:
      await checkAdminRoles();
      break;
  }
  
  await mongoose.connection.close();
}

main().catch(async (error) => {
  await mongoose.connection.close();
  process.exit(1);
});
