'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Space, Button } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';

const { Header } = Layout;

export default function AdminHeader() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    router.push('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'الملف الشخصي',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'الإعدادات',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'تسجيل الخروج',
      onClick: handleLogout,
    },
  ];

  return (
    <Header 
      className="bg-white shadow-sm border-b border-gray-200 px-6 flex items-center justify-between"
      style={{ height: '64px', lineHeight: '64px' }}
    >
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <h1 className="text-xl font-semibold text-gray-800 m-0">
          لوحة التحكم الإدارية
        </h1>
      </div>

      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* User Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomLeft">
          <Space className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg">
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#4b2e83' }}
            />
            <span className="text-gray-700 font-medium hidden sm:inline">
              {user?.name || 'المدير'}
            </span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
}
