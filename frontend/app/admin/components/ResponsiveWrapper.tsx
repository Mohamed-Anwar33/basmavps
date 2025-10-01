'use client';

import React from 'react';
import { Card, Space, Divider } from 'antd';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  cardProps?: any;
  showDivider?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  cardProps = {},
  showDivider = true,
  padding = 'medium'
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'small': return isMobile ? 12 : 16;
      case 'medium': return isMobile ? 16 : 24;
      case 'large': return isMobile ? 20 : 32;
      default: return isMobile ? 16 : 24;
    }
  };

  const headerContent = (title || subtitle || actions) && (
    <div className={`responsive-header ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {(title || subtitle) && (
          <div className="flex-1">
            {title && (
              <h2 className={`font-bold text-gray-800 mb-2 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`text-gray-600 ${
                isMobile ? 'text-sm' : 'text-base'
              } ${title ? '' : 'hidden lg:block'}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {actions && (
          <div className={`${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
            <Space 
              size={isMobile ? 'middle' : 'large'} 
              className={isMobile ? 'w-full' : ''}
              wrap={isMobile}
            >
              {actions}
            </Space>
          </div>
        )}
      </div>
      
      {showDivider && (title || subtitle || actions) && (
        <Divider className={isMobile ? 'my-4' : 'my-6'} />
      )}
    </div>
  );

  return (
    <div className={`responsive-wrapper ${className}`}>
      <Card
        className={`admin-card ${isMobile ? 'mobile' : 'desktop'}`}
        bodyStyle={{
          padding: getPadding(),
        }}
        {...cardProps}
      >
        {headerContent}
        
        <div className="responsive-content">
          {children}
        </div>
      </Card>

      <style jsx>{`
        .responsive-wrapper {
          width: 100%;
        }
        
        .responsive-wrapper .admin-card {
          border-radius: ${isMobile ? '12px' : '16px'};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        
        .responsive-wrapper .admin-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        
        .responsive-wrapper .responsive-header.mobile h2 {
          line-height: 1.4;
        }
        
        .responsive-wrapper .responsive-header.desktop h2 {
          line-height: 1.3;
        }
        
        @media (max-width: 768px) {
          .responsive-wrapper .admin-card.mobile {
            margin-bottom: 16px;
            border-radius: 12px;
          }
          
          .responsive-wrapper .responsive-content {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
        
        @media (hover: none) and (pointer: coarse) {
          .responsive-wrapper .admin-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
        }
      `}</style>
    </div>
  );
};

// Specialized wrapper for forms
interface ResponsiveFormWrapperProps extends ResponsiveWrapperProps {
  formActions?: React.ReactNode;
  stickyActions?: boolean;
}

export const ResponsiveFormWrapper: React.FC<ResponsiveFormWrapperProps> = ({
  children,
  formActions,
  stickyActions = true,
  ...props
}) => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveWrapper {...props}>
      <div className="form-content">
        {children}
      </div>
      
      {formActions && (
        <div className={`form-actions ${
          isMobile && stickyActions ? 'sticky-mobile' : 'normal'
        }`}>
          <Divider />
          <Space 
            size={isMobile ? 'middle' : 'large'}
            className={isMobile ? 'w-full' : ''}
          >
            {formActions}
          </Space>
        </div>
      )}

      <style jsx>{`
        .form-actions.sticky-mobile {
          position: sticky;
          bottom: 0;
          background: white;
          padding: 16px 0;
          margin: 16px -${isMobile ? '16px' : '24px'} -${isMobile ? '16px' : '24px'};
          border-top: 1px solid #f0f0f0;
          z-index: 10;
        }
        
        .form-actions.sticky-mobile .ant-space {
          width: 100%;
          padding: 0 ${isMobile ? '16px' : '24px'};
        }
        
        .form-actions.normal {
          text-align: ${isMobile ? 'center' : 'right'};
          padding-top: 16px;
        }
      `}</style>
    </ResponsiveWrapper>
  );
};

// Specialized wrapper for tables
interface ResponsiveTableWrapperProps extends ResponsiveWrapperProps {
  tableActions?: React.ReactNode;
  filters?: React.ReactNode;
}

export const ResponsiveTableWrapper: React.FC<ResponsiveTableWrapperProps> = ({
  children,
  tableActions,
  filters,
  ...props
}) => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveWrapper {...props}>
      {(tableActions || filters) && (
        <div className={`table-controls ${isMobile ? 'mobile' : 'desktop'}`}>
          {filters && (
            <div className={`filters ${isMobile ? 'w-full mb-4' : 'flex-1'}`}>
              {filters}
            </div>
          )}
          
          {tableActions && (
            <div className={`actions ${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
              {tableActions}
            </div>
          )}
          
          <Divider className={isMobile ? 'my-4' : 'my-6'} />
        </div>
      )}
      
      <div className="table-container">
        {children}
      </div>

      <style jsx>{`
        .table-controls.mobile {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .table-controls.desktop {
          display: flex;
          flex-direction: row;
          gap: 24px;
          align-items: flex-end;
        }
        
        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        
        @media (max-width: 768px) {
          .table-container {
            margin: 0 -${isMobile ? '16px' : '24px'};
            border-left: none;
            border-right: none;
            border-radius: 0;
          }
        }
      `}</style>
    </ResponsiveWrapper>
  );
};

export default ResponsiveWrapper;
