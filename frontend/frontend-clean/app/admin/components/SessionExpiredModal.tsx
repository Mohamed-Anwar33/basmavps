'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { 
  ExclamationCircleOutlined, 
  LoginOutlined, 
  ClockCircleOutlined,
  LockOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface SessionExpiredModalProps {
  visible: boolean;
  onClose: () => void;
  isDataLoadError?: boolean;
  errorMessage?: string;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ 
  visible, 
  onClose,
  isDataLoadError = false,
  errorMessage = ''
}) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (visible && countdown > 0 && !isDataLoadError) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (visible && countdown === 0 && !isDataLoadError) {
      handleRedirect();
    }
  }, [visible, countdown, isDataLoadError]);

  const handleRedirect = () => {
    onClose();
    if (!isDataLoadError) {
      router.push('/admin/login');
    }
  };

  const handleRetry = () => {
    onClose();
    window.location.reload();
  };

  return (
    <Modal
      open={visible}
      centered
      closable={false}
      footer={null}
      width={500}
      className="session-expired-modal"
      styles={{
        mask: {
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
          backdropFilter: 'blur(10px)',
        }
      }}
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
      }}
    >
      <div className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-indigo-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          {/* Icon Section */}
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/30 animate-bounce">
                <LockOutlined className="text-white text-3xl" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <ExclamationCircleOutlined className="text-white text-sm" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            {isDataLoadError ? 'فشل في تحميل البيانات ❌' : 'انتهت صلاحية الجلسة 🔐'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            {isDataLoadError ? (
              <>
                {errorMessage || 'حدث خطأ أثناء تحميل البيانات من الخادم'}
                <br />
                <span className="text-purple-600 font-semibold">يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة</span>
              </>
            ) : (
              <>
                لأسباب أمنية، تم انتهاء صلاحية جلستك في لوحة التحكم
                <br />
                <span className="text-purple-600 font-semibold">يرجى تسجيل الدخول مرة أخرى للمتابعة</span>
              </>
            )}
          </p>

          {/* Security Message */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-purple-100">
            <div className="flex items-center justify-center space-x-2 space-x-reverse text-purple-700">
              <ClockCircleOutlined className="text-lg" />
              <span className="font-medium">هذا الإجراء يحمي حسابك وبياناتك الحساسة</span>
            </div>
          </div>

          {/* Countdown - Only for session expired */}
          {!isDataLoadError && (
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 space-x-reverse bg-white rounded-full px-4 py-2 shadow-lg border border-gray-100">
                <ClockCircleOutlined className="text-purple-600 animate-spin" />
                <span className="text-gray-700 font-medium">
                  سيتم التوجيه تلقائياً خلال 
                  <span className="text-purple-600 font-bold mx-1 text-lg">
                    {countdown}
                  </span>
                  ثانية
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isDataLoadError ? (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<ExclamationCircleOutlined />}
                  onClick={handleRetry}
                  className="bg-gradient-to-r from-orange-600 to-red-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl px-8 py-3 h-auto font-semibold"
                >
                  إعادة تحميل الصفحة
                </Button>
                
                <Button
                  size="large"
                  onClick={onClose}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl px-8 py-3 h-auto font-medium"
                >
                  إغلاق
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<LoginOutlined />}
                  onClick={handleRedirect}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl px-8 py-3 h-auto font-semibold"
                >
                  تسجيل الدخول الآن
                </Button>
                
                <Button
                  size="large"
                  onClick={onClose}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-xl px-8 py-3 h-auto font-medium"
                >
                  إغلاق
                </Button>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-xs text-gray-500">
            💡 نصيحة: احفظ عملك بانتظام لتجنب فقدان البيانات
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .session-expired-modal .ant-modal-content {
          border-radius: 24px !important;
          overflow: hidden !important;
          box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.25) !important;
          border: 1px solid rgba(124, 58, 237, 0.1) !important;
        }

        .session-expired-modal .ant-modal-body {
          padding: 0 !important;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.5); }
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </Modal>
  );
};

export default SessionExpiredModal;
