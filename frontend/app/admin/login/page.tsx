'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Alert, App } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, SafetyOutlined, StarOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';

const { Title, Text } = Typography;

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading: authLoading } = useAdminAuth();
  
  const redirectMessage = searchParams.get('message');

  useEffect(() => {
    // Only redirect if auth is loaded and user is actually authenticated
    if (!authLoading && isAuthenticated) {
      router.push('/admin');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const success = await login(values.username, values.password);
      
      if (success) {
        message.success('تم تسجيل الدخول بنجاح');
        router.push('/admin');
      } else {
        message.error('بيانات الدخول غير صحيحة');
      }
    } catch (error) {
      message.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    );
  }

  return (
    <App>
      <div className="min-h-screen relative overflow-hidden">
        {/* Luxury Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-indigo-600/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                {/* Luxury Logo Container */}
                <div className="relative w-32 h-32 mx-auto mb-6 transform hover:scale-110 transition-all duration-500 animate-float">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
                  
                  {/* Logo Background */}
                  <div className="relative w-full h-full bg-white rounded-3xl border border-gray-200 shadow-2xl shadow-purple-500/30 flex items-center justify-center overflow-hidden animate-glow-pulse">
                    {/* Animated Background Pattern - Removed for white background */}
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute top-2 left-2 w-4 h-4 bg-purple-400/60 rounded-full animate-ping delay-300"></div>
                      <div className="absolute bottom-3 right-3 w-3 h-3 bg-indigo-400/60 rounded-full animate-ping delay-700"></div>
                      <div className="absolute top-1/2 right-2 w-2 h-2 bg-pink-400/60 rounded-full animate-ping delay-1000"></div>
                    </div>
                    
                    {/* Main Logo */}
                    <div className="relative z-10 p-4">
                      <img 
                        src="/LOGO.png" 
                        alt="بصمة تصميم" 
                        className="w-full h-full object-contain"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                        }}
                      />
                    </div>
                    
                    {/* Inner Shine Effect */}
                    <div className="absolute inset-2 bg-gradient-to-tr from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Premium Badge */}
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 animate-bounce">
                  <CrownOutlined className="text-sm text-white" />
                </div>
                
                {/* Floating Stars */}
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center opacity-80 animate-pulse">
                  <StarOutlined className="text-xs text-white" />
                </div>
                <div className="absolute -bottom-2 -right-4 w-5 h-5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center opacity-60 animate-pulse delay-500">
                  <StarOutlined className="text-xs text-white" style={{ fontSize: '10px' }} />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-5xl font-black bg-gradient-to-r from-white via-purple-100 via-white to-purple-200 bg-clip-text text-transparent tracking-wider drop-shadow-2xl">
                  بصمة تصميم
                </h1>
                <div className="relative">
                  <p className="text-purple-100 text-xl font-semibold tracking-wide">
                    لوحة التحكم الإدارية
                  </p>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                </div>
                <div className="flex items-center justify-center space-x-3 space-x-reverse mt-6 bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
                  <SafetyOutlined className="text-emerald-400 text-lg animate-pulse" />
                  <span className="text-emerald-300 text-sm font-medium">دخول آمن ومشفر</span>
                </div>
              </div>
            </div>

            {/* Login Card */}
            <Card 
              className="backdrop-blur-xl bg-white/10 border-0 shadow-2xl shadow-black/20"
              style={{
                borderRadius: '24px',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >

              {redirectMessage && (
                <Alert
                  message="تحتاج إلى تسجيل الدخول للوصول لهذه الصفحة"
                  type="warning"
                  showIcon
                  className="mb-6 bg-orange-500/10 border-orange-500/20 text-orange-200"
                />
              )}

              <Form
                form={form}
                name="admin-login"
                onFinish={handleLogin}
                layout="vertical"
                size="large"
                className="space-y-6"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: 'يرجى إدخال اسم المستخدم' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-purple-300" />}
                    placeholder="اسم المستخدم"
                    size="large"
                    className="bg-white/5 border-white/20 text-white placeholder-purple-200 rounded-xl h-12 hover:bg-white/10 focus:bg-white/10 focus:border-purple-400"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white'
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'يرجى إدخال كلمة المرور' },
                    { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-purple-300" />}
                    placeholder="كلمة المرور"
                    size="large"
                    className="bg-white/5 border-white/20 text-white placeholder-purple-200 rounded-xl h-12 hover:bg-white/10 focus:bg-white/10 focus:border-purple-400"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white'
                    }}
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="h-14 rounded-xl font-bold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)',
                      border: 'none',
                      boxShadow: '0 20px 40px rgba(124, 58, 237, 0.3)',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2 space-x-reverse">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>جاري تسجيل الدخول...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2 space-x-reverse">
                        <LoginOutlined />
                        <span>تسجيل الدخول</span>
                      </span>
                    )}
                  </Button>
                </Form.Item>
              </Form>

              {/* Security Badge */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <SafetyOutlined className="text-green-400" />
                  <span className="text-green-300 text-sm font-medium">محمي بتشفير SSL</span>
                </div>
              </div>
            </Card>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-purple-300/60 text-sm">
                © 2024 بصمة تصميم - جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(124, 58, 237, 0.5);
          border-radius: 4px;
        }

        /* Ant Design overrides */
        .ant-input::placeholder,
        .ant-input-password input::placeholder {
          color: rgba(196, 181, 253, 0.6) !important;
        }

        .ant-input:focus,
        .ant-input-password:focus,
        .ant-input-focused {
          border-color: rgba(124, 58, 237, 0.8) !important;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2) !important;
        }

        .ant-form-item-explain-error {
          color: rgba(248, 113, 113, 0.9) !important;
        }

        .ant-alert-warning {
          background: rgba(251, 146, 60, 0.1) !important;
          border: 1px solid rgba(251, 146, 60, 0.2) !important;
        }

        .ant-alert-warning .ant-alert-message {
          color: rgba(254, 215, 170, 0.9) !important;
        }

        /* Animation delays */
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }

        /* Custom keyframes for floating logo */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
          75% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        /* Glow pulse effect */
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 40px rgba(124, 58, 237, 0.6), 0 0 60px rgba(79, 70, 229, 0.4); }
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        /* Glassmorphism effect */
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </App>
  );
}
