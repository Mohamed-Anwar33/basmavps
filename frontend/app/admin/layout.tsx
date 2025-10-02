'use client';

import { AdminAuthProvider, useAdminAuth } from '../../contexts/admin-auth-context';
import { ConfigProvider, Layout, Menu, Avatar, Dropdown, Input, App, Drawer } from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  FileTextOutlined, 
  DashboardOutlined, 
  SettingOutlined, 
  QuestionCircleOutlined, 
  InfoCircleOutlined, 
  HomeOutlined, 
  CustomerServiceOutlined, 
  EditOutlined, 
  MessageOutlined,
  SearchOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CrownOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { LuxuryButton } from './components/ui/design-system';
import './components/ui/animations.css';
import './styles/responsive.css';
import { Toaster } from 'react-hot-toast';
import SessionExpiredModal from './components/SessionExpiredModal';
import { usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { 
    isAuthenticated, 
    loading, 
    logout, 
    showSessionExpired, 
    setShowSessionExpired,
    showDataLoadError,
    setShowDataLoadError,
    dataLoadErrorMessage
  } = useAdminAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login page, show simple layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30">
        <App>
          {children}
        </App>
        
        {/* Session Expired Modal */}
        <SessionExpiredModal
          visible={showSessionExpired}
          onClose={() => setShowSessionExpired(false)}
        />
        
        {/* Data Load Error Modal */}
        <SessionExpiredModal
          visible={showDataLoadError}
          onClose={() => setShowDataLoadError(false)}
          isDataLoadError={true}
          errorMessage={dataLoadErrorMessage}
        />
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </div>
    );
  }

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
    }
  };

  const menuItems = [
    {
      key: '/admin/admins',
      icon: <UserOutlined className="text-lg" />,
      label: <Link href="/admin/admins" className="font-medium">إدارة حسابات الأدمن</Link>,
    },
    {
      key: '/admin/orders',
      icon: <ShoppingOutlined className="text-lg" />,
      label: <Link href="/admin/orders" className="font-medium">إدارة الطلبات</Link>,
    },
    {
      key: '/admin/content/homepage',
      icon: <HomeOutlined className="text-lg" />,
      label: <Link href="/admin/content/homepage" className="font-medium">الصفحة الرئيسية</Link>,
    },
    {
      key: '/admin/content/about',
      icon: <InfoCircleOutlined className="text-lg" />,
      label: <Link href="/admin/content/about" className="font-medium">من نحن</Link>,
    },
    {
      key: '/admin/content/faq',
      icon: <QuestionCircleOutlined className="text-lg" />,
      label: <Link href="/admin/content/faq" className="font-medium">الأسئلة الشائعة</Link>,
    },
    {
      key: '/admin/content/how-to-order',
      icon: <QuestionCircleOutlined className="text-lg" />,
      label: <Link href="/admin/content/how-to-order" className="font-medium">كيف تطلب خدمتك</Link>,
    },
    {
      key: '/admin/content/contact',
      icon: <MessageOutlined className="text-lg" />,
      label: <Link href="/admin/content/contact" className="font-medium">صفحة التواصل</Link>,
    },
    {
      key: '/admin/services',
      icon: <CustomerServiceOutlined className="text-lg" />,
      label: <Link href="/admin/services" className="font-medium">إدارة الخدمات</Link>,
    },
    {
      key: '/admin/blog',
      icon: <EditOutlined className="text-lg" />,
      label: <Link href="/admin/blog" className="font-medium">إدارة المدونة</Link>,
    },
    {
      key: '/admin/banners',
      icon: <CrownOutlined className="text-lg" />,
      label: <Link href="/admin/banners" className="font-medium">إدارة البنرات</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
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
      danger: true,
    },
  ];

  return (
    <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#7c3aed',
            colorPrimaryHover: '#8b5cf6',
            colorPrimaryActive: '#6d28d9',
            colorText: '#1f2937',
            colorTextSecondary: '#6b7280',
            colorError: '#ef4444',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorInfo: '#3b82f6',
            colorBgLayout: '#fafbff',
            colorBgContainer: '#ffffff',
            colorLink: '#7c3aed',
            colorLinkActive: '#6d28d9',
            colorLinkHover: '#8b5cf6',
            borderRadius: 16,
            borderRadiusLG: 20,
            borderRadiusXS: 8,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          components: {
            Menu: {
              itemHeight: 52,
              itemMarginInline: 12,
              itemBorderRadius: 16,
              itemSelectedBg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              itemSelectedColor: '#ffffff',
              itemHoverBg: 'rgba(124, 58, 237, 0.08)',
              itemHoverColor: '#7c3aed',
              itemActiveBg: 'rgba(124, 58, 237, 0.12)',
              subMenuItemBg: 'rgba(255, 255, 255, 0.8)',
              groupTitleColor: '#6b7280',
            },
            Card: {
              borderRadiusLG: 24,
              paddingLG: 32,
              boxShadowTertiary: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
            Button: {
              borderRadius: 16,
              borderRadiusLG: 20,
              paddingContentHorizontal: 24,
              fontWeight: 600,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            Input: {
              borderRadius: 12,
              paddingBlock: 12,
              fontSize: 15,
            },
            Table: {
              borderRadiusLG: 16,
              headerBg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              headerColor: '#374151',
              rowHoverBg: 'rgba(124, 58, 237, 0.04)',
            },
            Modal: {
              borderRadiusLG: 24,
              paddingLG: 32,
            },
            Tabs: {
              borderRadius: 16,
              itemSelectedColor: '#7c3aed',
              itemHoverColor: '#8b5cf6',
              inkBarColor: '#7c3aed',
            }
          },
        }}
      >
        <App>
          <div className="min-h-screen relative overflow-hidden" dir="rtl">
          {/* Enhanced Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/40 to-indigo-50/40"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/20 via-transparent to-indigo-100/20"></div>
          
          {/* Floating Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/3 rounded-full blur-2xl animate-pulse delay-2000"></div>
          </div>

          <Layout className="min-h-screen bg-transparent relative z-10">
            {/* Desktop Sidebar */}
            {!isMobile && (
              <Sider 
                width={300} 
                collapsed={collapsed}
                onCollapse={setCollapsed}
                className="shadow-2xl shadow-purple-500/20 border-r-0 overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #fefbff 30%, #faf7ff 70%, #f3f0ff 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRight: '1px solid rgba(124, 58, 237, 0.1)',
                  boxShadow: '20px 0 40px -10px rgba(124, 58, 237, 0.15)',
                }}
              >
              {/* Logo Section */}
              <div className="p-6 text-center border-b border-purple-100/50 bg-gradient-to-r from-purple-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-2">
                    <CrownOutlined className="text-yellow-300 text-2xl ml-2" />
                    <h2 className="text-white font-bold text-xl">
                      {collapsed ? 'ب.ت' : 'بصمة تصميم'}
                    </h2>
                  </div>
                  {!collapsed && (
                    <p className="text-purple-100 text-sm font-medium">
                      لوحة التحكم الإدارية
                    </p>
                  )}
                </div>
              </div>

              {/* Collapse Button */}
              <div className="p-4 border-b border-purple-100/50">
                <LuxuryButton
                  type="secondary"
                  size="small"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                >
                  {!collapsed && 'طي القائمة'}
                </LuxuryButton>
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto">
                <Menu
                  mode="inline"
                  items={menuItems}
                  className="bg-transparent border-r-0 px-4 py-2 luxury-tabs"
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                  }}
                  theme="light"
                />
              </div>

              {/* Admin Info */}
              {!collapsed && (
                <div className="p-4 border-t border-purple-100/50 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Avatar 
                      size={40} 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                    >
                      أ
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold text-sm">المدير العام</p>
                      <p className="text-gray-500 text-xs">admin@basma.com</p>
                    </div>
                  </div>
                </div>
              )}
            </Sider>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
              <Drawer
                title={
                  <div className="flex items-center">
                    <CrownOutlined className="text-purple-600 text-xl ml-2" />
                    <span className="text-purple-800 font-bold">بصمة تصميم</span>
                  </div>
                }
                placement="right"
                onClose={() => setMobileMenuVisible(false)}
                open={mobileMenuVisible}
                width={280}
                className="mobile-admin-drawer"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #fefbff 30%, #faf7ff 70%, #f3f0ff 100%)',
                }}
              >
                <Menu
                  mode="inline"
                  items={menuItems}
                  className="bg-transparent border-r-0"
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: '16px',
                  }}
                  theme="light"
                  onClick={() => setMobileMenuVisible(false)}
                />
                
                {/* Mobile Admin Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-100/50 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Avatar 
                      size={40} 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                    >
                      أ
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold text-sm">المدير العام</p>
                      <p className="text-gray-500 text-xs">admin@basma.com</p>
                    </div>
                  </div>
                </div>
              </Drawer>
            )}

            <Layout className="bg-transparent">
              {/* Enhanced Header */}
              <Header 
                className={`border-b-0 flex items-center justify-between relative overflow-hidden ${
                  isMobile ? 'px-4' : 'px-8'
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderBottom: '1px solid rgba(124, 58, 237, 0.08)',
                  boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12)',
                  height: isMobile ? '70px' : '80px',
                }}
              >
                {/* Header Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-transparent to-indigo-500/3 pointer-events-none"></div>
                
                <div className="flex items-center space-x-4 space-x-reverse relative z-10">
                  {/* Mobile Menu Button */}
                  {isMobile && (
                    <LuxuryButton
                      type="secondary"
                      size="small"
                      icon={<MenuUnfoldOutlined />}
                      onClick={() => setMobileMenuVisible(true)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    >
                      القائمة
                    </LuxuryButton>
                  )}
                  
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 ${
                      isMobile ? 'w-8 h-8' : 'w-10 h-10'
                    }`}>
                      <CrownOutlined className={`text-white ${isMobile ? 'text-sm' : 'text-lg'}`} />
                    </div>
                    <div>
                      <h1 className={`font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 bg-clip-text text-transparent ${
                        isMobile ? 'text-lg' : 'text-2xl'
                      }`}>
                        {isMobile ? 'لوحة التحكم' : 'لوحة التحكم'}
                      </h1>
                      {!isMobile && (
                        <p className="text-sm text-gray-500 font-medium">إدارة شاملة ومتطورة</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`flex items-center relative z-10 ${
                  isMobile ? 'space-x-2 space-x-reverse' : 'space-x-6 space-x-reverse'
                }`}>
                  {/* Enhanced Search - Hide on mobile */}
                  {!isMobile && (
                    <div className="relative">
                      <Input
                        placeholder="البحث في النظام..."
                        prefix={<SearchOutlined className="text-purple-400" />}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-80 h-12 shadow-lg shadow-purple-100/50 border-0"
                        style={{ 
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(124, 58, 237, 0.1)',
                        }}
                      />
                    </div>
                  )}

                  {/* Status Indicators - Simplified on mobile */}
                  {!isMobile && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex items-center space-x-2 space-x-reverse px-3 py-2 bg-green-50 rounded-xl border border-green-100">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-700 text-sm font-medium">متصل</span>
                      </div>
                    </div>
                  )}

                  {/* Enhanced User Menu */}
                  <Dropdown
                    menu={{ items: userMenuItems, onClick: handleMenuClick }}
                    placement="bottomLeft"
                    trigger={['click']}
                    popupRender={(menu) => (
                      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-100/50 overflow-hidden">
                        {menu}
                      </div>
                    )}
                  >
                    <div className="flex items-center space-x-3 space-x-reverse cursor-pointer hover:bg-white/60 rounded-2xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100/50">
                      <div className="relative">
                        <Avatar 
                          size={44} 
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/25"
                        >
                          أ
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-800 font-bold text-sm">المدير العام</p>
                        <p className="text-purple-600 text-xs font-medium">متصل الآن</p>
                      </div>
                    </div>
                  </Dropdown>
                </div>
              </Header>

              {/* Enhanced Content */}
              <Content 
                className="overflow-y-auto relative admin-content"
                style={{
                  padding: isMobile ? '16px' : '32px',
                  background: 'transparent',
                  minHeight: isMobile ? 'calc(100vh - 70px)' : 'calc(100vh - 80px)',
                }}
              >
                {/* Content Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-purple-50/20 to-indigo-50/20 pointer-events-none"></div>
                
                <div className={`mx-auto relative z-10 admin-container ${isMobile ? 'max-w-full' : 'max-w-7xl'}`}>
                  <div className={`admin-space-y-responsive ${isMobile ? 'space-y-4' : 'space-y-8'}`}>
                    {children}
                  </div>
                </div>
              </Content>
            </Layout>
          </Layout>
        </div>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />

        {/* Enhanced Global Styles */}
        <style jsx global>{`
          /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(124, 58, 237, 0.05);
            border-radius: 8px;
          }
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #7c3aed, #8b5cf6);
            border-radius: 8px;
            border: 2px solid rgba(255, 255, 255, 0.2);
          }
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #6d28d9, #7c3aed);
          }

          /* Enhanced Menu Styles */
          .ant-menu-item-selected {
            background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%) !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3) !important;
            transform: translateX(-2px) !important;
            border-radius: 16px !important;
          }

          .ant-menu-item:hover {
            background: rgba(124, 58, 237, 0.08) !important;
            color: #7c3aed !important;
            transform: translateX(-1px) !important;
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1) !important;
          }

          .ant-menu-submenu-title:hover {
            background: rgba(124, 58, 237, 0.08) !important;
            color: #7c3aed !important;
          }

          /* Enhanced Card Styles */
          .ant-card {
            border: 1px solid rgba(124, 58, 237, 0.08) !important;
            box-shadow: 0 8px 32px rgba(124, 58, 237, 0.08) !important;
            transition: all 0.3s ease !important;
          }

          .ant-card:hover {
            box-shadow: 0 16px 48px rgba(124, 58, 237, 0.12) !important;
            transform: translateY(-2px) !important;
            border-color: rgba(124, 58, 237, 0.15) !important;
          }

          /* Enhanced Button Styles */
          .ant-btn-primary {
            background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%) !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3) !important;
            transition: all 0.3s ease !important;
          }

          .ant-btn-primary:hover {
            background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%) !important;
            box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4) !important;
            transform: translateY(-1px) !important;
          }

          /* Enhanced Table Styles */
          .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
            border-bottom: 2px solid rgba(124, 58, 237, 0.1) !important;
            font-weight: 600 !important;
            color: #374151 !important;
          }

          .ant-table-tbody > tr:hover > td {
            background: rgba(124, 58, 237, 0.04) !important;
          }

          /* Enhanced Input Styles */
          .ant-input:focus,
          .ant-input-focused {
            border-color: #7c3aed !important;
            box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1) !important;
          }

          /* Animation Classes */
          .delay-1000 {
            animation-delay: 1s;
          }
          .delay-2000 {
            animation-delay: 2s;
          }

          /* Glassmorphism Effects */
          .backdrop-blur-xl {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }

          /* Enhanced Transitions */
          * {
            transition-duration: 0.3s;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Enhanced Mobile Responsive Styles */
          @media (max-width: 768px) {
            .ant-layout-sider {
              display: none !important;
            }
            
            /* Menu Items */
            .ant-menu-item {
              height: 48px !important;
              line-height: 48px !important;
              font-size: 16px !important;
              margin: 8px 0 !important;
              padding: 0 16px !important;
            }
            
            .ant-menu-submenu-title {
              height: 48px !important;
              line-height: 48px !important;
              font-size: 16px !important;
              padding: 0 16px !important;
            }
            
            /* Cards */
            .ant-card {
              margin: 8px 0 !important;
              border-radius: 12px !important;
            }
            
            .ant-card-head {
              padding: 16px !important;
              min-height: auto !important;
            }
            
            .ant-card-head-title {
              font-size: 18px !important;
              font-weight: 600 !important;
              line-height: 1.4 !important;
            }
            
            .ant-card-body {
              padding: 16px !important;
            }
            
            /* Buttons */
            .ant-btn {
              height: 44px !important;
              font-size: 16px !important;
              border-radius: 12px !important;
              padding: 0 20px !important;
              min-width: 44px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .ant-btn-sm {
              height: 36px !important;
              font-size: 14px !important;
              padding: 0 16px !important;
              min-width: 36px !important;
            }
            
            /* Inputs */
            .ant-input {
              height: 44px !important;
              font-size: 16px !important;
              border-radius: 12px !important;
              padding: 12px 16px !important;
            }
            
            .ant-input-affix-wrapper {
              height: 44px !important;
              border-radius: 12px !important;
            }
            
            .ant-input-affix-wrapper .ant-input {
              height: 20px !important;
              padding: 0 !important;
            }
            
            .ant-select-selector {
              height: 44px !important;
              border-radius: 12px !important;
              padding: 8px 16px !important;
            }
            
            .ant-select-selection-item {
              line-height: 28px !important;
            }
            
            /* Tables */
            .ant-table-wrapper {
              overflow-x: auto !important;
              -webkit-overflow-scrolling: touch !important;
            }
            
            .ant-table {
              min-width: 700px !important;
              font-size: 14px !important;
            }
            
            .ant-table-thead > tr > th {
              font-size: 14px !important;
              padding: 12px 8px !important;
              white-space: nowrap !important;
              min-width: 100px !important;
            }
            
            .ant-table-tbody > tr > td {
              font-size: 14px !important;
              padding: 12px 8px !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              max-width: 150px !important;
            }
            
            .ant-table-tbody > tr > td:first-child {
              position: sticky !important;
              left: 0 !important;
              background: white !important;
              z-index: 1 !important;
              box-shadow: 2px 0 5px rgba(0,0,0,0.1) !important;
            }
            
            /* Forms */
            .ant-form-item {
              margin-bottom: 20px !important;
            }
            
            .ant-form-item-label {
              padding-bottom: 8px !important;
            }
            
            .ant-form-item-label > label {
              font-size: 16px !important;
              font-weight: 500 !important;
              height: auto !important;
            }
            
            .ant-row {
              margin: 0 !important;
            }
            
            .ant-col {
              padding: 0 8px !important;
            }
            
            /* Modals */
            .ant-modal {
              margin: 16px !important;
              max-width: calc(100vw - 32px) !important;
              width: calc(100vw - 32px) !important;
              top: 20px !important;
            }
            
            .ant-modal-content {
              border-radius: 16px !important;
            }
            
            .ant-modal-header {
              padding: 16px 20px !important;
              border-radius: 16px 16px 0 0 !important;
            }
            
            .ant-modal-body {
              padding: 20px !important;
              max-height: calc(100vh - 200px) !important;
              overflow-y: auto !important;
            }
            
            .ant-modal-footer {
              padding: 16px 20px !important;
              border-radius: 0 0 16px 16px !important;
            }
            
            /* Tabs */
            .ant-tabs {
              overflow: visible !important;
            }
            
            .ant-tabs-tab {
              font-size: 14px !important;
              padding: 12px 16px !important;
              margin: 0 4px !important;
            }
            
            .ant-tabs-content-holder {
              overflow: visible !important;
            }
            
            .ant-tabs-tabpane {
              padding: 16px 0 !important;
            }
            
            /* Pagination */
            .ant-pagination {
              text-align: center !important;
              margin-top: 20px !important;
            }
            
            .ant-pagination-item {
              min-width: 36px !important;
              height: 36px !important;
              line-height: 34px !important;
            }
            
            /* Space and Layout */
            .ant-space {
              flex-wrap: wrap !important;
            }
            
            .ant-space-item {
              margin-bottom: 8px !important;
            }
            
            /* Descriptions */
            .ant-descriptions-item-label {
              font-weight: 600 !important;
              color: #374151 !important;
            }
            
            .ant-descriptions-item-content {
              word-break: break-word !important;
            }
          }
          
          /* Tablet Responsive Styles */
          @media (min-width: 769px) and (max-width: 1024px) {
            .ant-table {
              font-size: 14px !important;
            }
            
            .ant-modal {
              width: 90vw !important;
              max-width: 800px !important;
            }
            
            .ant-card-body {
              padding: 20px !important;
            }
          }
          
          /* Large Screen Optimizations */
          @media (min-width: 1400px) {
            .ant-modal {
              max-width: 1200px !important;
            }
          }

          /* Mobile Drawer Styles */
          .mobile-admin-drawer .ant-drawer-body {
            padding: 16px 0 !important;
          }
          
          .mobile-admin-drawer .ant-menu-item {
            margin: 4px 16px !important;
            border-radius: 12px !important;
            height: 48px !important;
            line-height: 48px !important;
          }
          
          .mobile-admin-drawer .ant-menu-submenu-title {
            margin: 4px 16px !important;
            border-radius: 12px !important;
            height: 48px !important;
            line-height: 48px !important;
          }

          /* Touch-friendly styles */
          @media (hover: none) and (pointer: coarse) {
            .ant-btn:hover {
              transform: none !important;
            }
            
            .ant-card:hover {
              transform: none !important;
            }
            
            .ant-menu-item:hover {
              transform: none !important;
            }
          }
        `}</style>
        </App>
      </ConfigProvider>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AdminAuthProvider>
  );
}
