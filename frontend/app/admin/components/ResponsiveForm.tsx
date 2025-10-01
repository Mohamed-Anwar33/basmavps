'use client';

import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Space, Divider } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';

interface ResponsiveFormProps extends FormProps {
  children: React.ReactNode;
  onFinish: (values: any) => void;
  onReset?: () => void;
  submitText?: string;
  resetText?: string;
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  onFinish,
  onReset,
  submitText = 'حفظ',
  resetText = 'إعادة تعيين',
  loading = false,
  columns = 2,
  className = '',
  ...formProps
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getResponsiveColumns = () => {
    if (isMobile) return 24; // Full width on mobile
    
    switch (columns) {
      case 1: return 24;
      case 2: return 12;
      case 3: return 8;
      case 4: return 6;
      default: return 12;
    }
  };

  const wrapFormItems = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // If it's already wrapped in Row/Col, return as is
        if (child.type === Row || child.type === Col) {
          return child;
        }
        
        // If it's a Form.Item, wrap it in responsive Col
        if (child.type === Form.Item || 
            (child.type && typeof child.type === 'object' && child.type && 'displayName' in child.type && (child.type as any).displayName === 'FormItem')) {
          return (
            <Col xs={24} lg={getResponsiveColumns()} key={child.key || Math.random()}>
              {child}
            </Col>
          );
        }
        
        // If it has children, recursively process them
        if (child.props && child.props.children) {
          return React.cloneElement(child, {
            ...child.props,
            children: wrapFormItems(child.props.children)
          });
        }
      }
      
      return child;
    });
  };

  return (
    <div className={`responsive-form ${className}`}>
      <Form
        layout="vertical"
        onFinish={onFinish}
        className="admin-form"
        size={isMobile ? 'large' : 'middle'}
        {...formProps}
      >
        <Row gutter={[16, isMobile ? 16 : 24]}>
          {wrapFormItems(children)}
        </Row>
        
        <Divider />
        
        <div className={`form-actions ${isMobile ? 'mobile' : 'desktop'}`}>
          <Space size={isMobile ? 'middle' : 'large'} className={isMobile ? 'w-full' : ''}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size={isMobile ? 'large' : 'middle'}
              className={isMobile ? 'flex-1' : ''}
            >
              {submitText}
            </Button>
            
            {onReset && (
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={onReset}
                size={isMobile ? 'large' : 'middle'}
                className={isMobile ? 'flex-1' : ''}
              >
                {resetText}
              </Button>
            )}
          </Space>
        </div>
      </Form>
      
      <style jsx>{`
        .responsive-form .form-actions.mobile {
          position: sticky;
          bottom: 0;
          background: white;
          padding: 16px 0;
          margin: 16px -20px -20px;
          border-top: 1px solid #f0f0f0;
          z-index: 10;
        }
        
        .responsive-form .form-actions.mobile .ant-space {
          width: 100%;
          padding: 0 20px;
        }
        
        .responsive-form .form-actions.desktop {
          text-align: right;
          padding-top: 16px;
        }
        
        .responsive-form .ant-form-item-label > label {
          font-weight: 500;
          color: #374151;
        }
        
        @media (max-width: 768px) {
          .responsive-form .ant-form-item {
            margin-bottom: 20px;
          }
          
          .responsive-form .ant-form-item-label {
            padding-bottom: 8px;
          }
          
          .responsive-form .ant-input,
          .responsive-form .ant-select-selector,
          .responsive-form .ant-input-number {
            height: 44px;
            font-size: 16px;
          }
          
          .responsive-form .ant-btn {
            height: 44px;
            font-size: 16px;
            border-radius: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResponsiveForm;
