'use client';

import React from 'react';
import { Card, Button, Input, Select, Badge, Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

// Design System Colors
export const colors = {
  primary: {
    50: '#f8f6ff',
    100: '#f0ebff',
    200: '#e4d9ff',
    300: '#d1bfff',
    400: '#b899ff',
    500: '#9c6eff',
    600: '#8b5cf6',
    700: '#7c3aed',
    800: '#6d28d9',
    900: '#5b21b6',
    950: '#4b2e83'
  },
  secondary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  }
};

// Luxury Card Component
export const LuxuryCard: React.FC<{
  children: React.ReactNode;
  title?: string;
  extra?: React.ReactNode;
  className?: string;
  gradient?: boolean;
  hover?: boolean;
}> = ({ children, title, extra, className = '', gradient = false, hover = true }) => {
  const baseClasses = `
    ${gradient 
      ? 'bg-gradient-to-br from-white via-purple-50 to-indigo-50' 
      : 'bg-white'
    }
    border border-gray-200/60
    rounded-2xl
    shadow-lg shadow-purple-100/50
    ${hover ? 'hover:shadow-xl hover:shadow-purple-200/60 hover:-translate-y-1' : ''}
    transition-all duration-300 ease-out
    backdrop-blur-sm
    ${className}
  `;

  return (
    <Card
      title={title && (
        <div className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          <span>{title}</span>
          {extra}
        </div>
      )}
      className={baseClasses}
      variant="outlined"
      styles={{
        header: {
          borderBottom: '1px solid rgb(229 231 235 / 0.6)',
          padding: '20px 24px 16px',
          background: 'transparent'
        },
        body: {
          padding: '20px 24px'
        }
      }}
    >
      {children}
    </Card>
  );
};

// Luxury Button Component
export const LuxuryButton: React.FC<{
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  gradient?: boolean;
}> = ({ 
  children, 
  type = 'primary', 
  size = 'medium', 
  icon, 
  loading = false, 
  disabled = false, 
  onClick, 
  className = '',
  gradient = false
}) => {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const typeClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
      : 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    error: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <Button
      className={`
        ${sizeClasses[size]}
        ${typeClasses[type]}
        rounded-xl
        font-medium
        border-0
        shadow-lg shadow-purple-200/40
        hover:shadow-xl hover:shadow-purple-300/50
        hover:-translate-y-0.5
        transition-all duration-200 ease-out
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:transform-none disabled:hover:shadow-lg
        ${className}
      `}
      icon={icon}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

// Luxury Input Component
export const LuxuryInput: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  size?: 'small' | 'medium' | 'large';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}> = ({ 
  placeholder, 
  value, 
  onChange, 
  type = 'text', 
  size = 'medium', 
  prefix, 
  suffix, 
  disabled = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-5 py-4 text-lg'
  };

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
      prefix={prefix}
      suffix={suffix}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        border border-gray-200
        rounded-xl
        bg-white
        focus:border-purple-400
        focus:ring-4 focus:ring-purple-100
        hover:border-purple-300
        transition-all duration-200
        shadow-sm
        ${className}
      `}
    />
  );
};

// Luxury Select Component
export const LuxurySelect: React.FC<{
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
  options?: Array<{ label: string; value: any }>;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}> = ({ 
  placeholder, 
  value, 
  onChange, 
  options = [], 
  size = 'medium', 
  disabled = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'min-h-[36px]',
    medium: 'min-h-[44px]',
    large: 'min-h-[52px]'
  };

  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        borderRadius: '12px',
      }}
      dropdownStyle={{
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    />
  );
};

// Luxury Badge Component
export const LuxuryBadge: React.FC<{
  children: React.ReactNode;
  type?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}> = ({ children, type = 'primary', size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const typeClasses = {
    primary: 'bg-purple-100 text-purple-800 border border-purple-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200'
  };

  return (
    <Badge
      className={`
        ${sizeClasses[size]}
        ${typeClasses[type]}
        rounded-full
        font-medium
        inline-flex items-center
        ${className}
      `}
    >
      {children}
    </Badge>
  );
};

// Luxury Modal Component
export const LuxuryModal: React.FC<{
  title?: string;
  open?: boolean;
  onCancel?: () => void;
  onOk?: () => void;
  children: React.ReactNode;
  width?: number;
  footer?: React.ReactNode;
  className?: string;
}> = ({ title, open, onCancel, onOk, children, width = 600, footer, className = '' }) => {
  return (
    <Modal
      title={title && (
        <div className="text-xl font-semibold text-gray-800 pb-4 border-b border-gray-100">
          {title}
        </div>
      )}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      width={width}
      footer={footer}
      className={className}
      styles={{
        content: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        },
        header: {
          background: 'linear-gradient(135deg, #f8f6ff 0%, #f0ebff 100%)',
          borderBottom: 'none',
          padding: '24px 24px 0'
        },
        body: {
          padding: '24px'
        }
      }}
    >
      {children}
    </Modal>
  );
};

// Luxury Loading Component
export const LuxuryLoading: React.FC<{
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}> = ({ size = 'medium', text, className = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-10 w-10',
    large: 'h-16 w-16'
  };

  const customIcon = (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className="h-full w-full rounded-full border-4 border-purple-200 border-t-purple-600"></div>
    </div>
  );

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <Spin indicator={customIcon} />
      {text && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Luxury Stats Card Component
export const LuxuryStatsCard: React.FC<{
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
}> = ({ title, value, icon, trend, color = 'purple', className = '' }) => {
  const colorClasses = {
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      icon: 'text-purple-600 bg-purple-100',
      value: 'text-purple-700',
      trend: trend?.isPositive ? 'text-green-600' : 'text-red-600'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      icon: 'text-blue-600 bg-blue-100',
      value: 'text-blue-700',
      trend: trend?.isPositive ? 'text-green-600' : 'text-red-600'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      icon: 'text-green-600 bg-green-100',
      value: 'text-green-700',
      trend: trend?.isPositive ? 'text-green-600' : 'text-red-600'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      icon: 'text-yellow-600 bg-yellow-100',
      value: 'text-yellow-700',
      trend: trend?.isPositive ? 'text-green-600' : 'text-red-600'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-pink-50',
      icon: 'text-red-600 bg-red-100',
      value: 'text-red-700',
      trend: trend?.isPositive ? 'text-green-600' : 'text-red-600'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`
      ${colors.bg}
      rounded-2xl
      p-6
      border border-gray-100
      shadow-lg shadow-gray-100/50
      hover:shadow-xl hover:shadow-gray-200/60
      hover:-translate-y-1
      transition-all duration-300 ease-out
      ${className}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold ${colors.value} mb-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={`text-sm font-medium ${colors.trend}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`
            ${colors.icon}
            p-3
            rounded-xl
            shadow-sm
          `}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  LuxuryCard,
  LuxuryButton,
  LuxuryInput,
  LuxurySelect,
  LuxuryBadge,
  LuxuryModal,
  LuxuryLoading,
  LuxuryStatsCard,
  colors
};
