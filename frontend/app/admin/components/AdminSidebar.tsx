'use client';

import React, { useState } from 'react';
import { Menu, Layout, Button } from 'antd';
import { 
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  MessageOutlined,
  SettingOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';

const { Sider } = Layout;

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/admin">لوحة التحكم</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link href="/admin/users">المستخدمين</Link>,
    },
    {
      key: '/admin/orders',
      icon: <ShoppingCartOutlined />,
      label: <Link href="/admin/orders">الطلبات</Link>,
    },
    {
      key: '/admin/services',
      icon: <ToolOutlined />,
      label: <Link href="/admin/services">الخدمات</Link>,
    },
    {
      key: '/admin/messages',
      icon: <MessageOutlined />,
      label: <Link href="/admin/messages">الرسائل</Link>,
    },
    {
      key: '/admin/blog',
      icon: <FileTextOutlined />,
      label: <Link href="/admin/blog">المدونة</Link>,
    },
    {
      key: '/admin/content/homepage',
      icon: <HomeOutlined />,
      label: <Link href="/admin/content/homepage">الصفحة الرئيسية</Link>,
    },
    {
      key: '/admin/content/about',
      icon: <InfoCircleOutlined />,
      label: <Link href="/admin/content/about">من نحن</Link>,
    },
    {
      key: '/admin/content/how-to-order',
      icon: <QuestionCircleOutlined />,
      label: <Link href="/admin/content/how-to-order">كيف تطلب خدمتك</Link>,
    },
    {
      key: '/admin/content/faq',
      icon: <QuestionCircleOutlined />,
      label: <Link href="/admin/content/faq">الأسئلة الشائعة</Link>,
    },
    {
      key: '/admin/content/contact',
      icon: <MessageOutlined />,
      label: <Link href="/admin/content/contact">صفحة التواصل</Link>,
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: <Link href="/admin/settings">الإعدادات</Link>,
    },
  ];

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem('auth-token');
    router.push('/login');
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="min-h-screen"
      theme="light"
      style={{
        background: 'linear-gradient(135deg, #4b2e83 0%, #7a4db3 100%)',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      }}
    >
      <div className="p-4 text-center border-b border-white/20">
        <h2 className="text-white font-bold text-lg">
          {collapsed ? 'ب' : 'بصمة تصميم'}
        </h2>
      </div>

      <div className="p-4">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/10 w-full mb-4"
        />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
        }}
        className="admin-sidebar-menu"
      />

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="text-white hover:bg-white/10 w-full"
          block
        >
          {!collapsed && 'تسجيل الخروج'}
        </Button>
      </div>

      <style jsx global>{`
        .admin-sidebar-menu .ant-menu-item {
          margin: 0 !important;
          border-radius: 8px !important;
          margin-bottom: 4px !important;
        }
        
        .admin-sidebar-menu .ant-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        .admin-sidebar-menu .ant-menu-item-selected {
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        .admin-sidebar-menu .ant-menu-item a {
          color: white !important;
        }
        
        .admin-sidebar-menu .ant-menu-item-icon {
          color: white !important;
        }
      `}</style>
    </Sider>
  );
}
