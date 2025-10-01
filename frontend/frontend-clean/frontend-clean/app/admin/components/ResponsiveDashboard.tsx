'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Button } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  UserOutlined, 
  ShoppingCartOutlined,
  DollarOutlined,
  EyeOutlined
} from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  loading?: boolean;
}

interface ResponsiveDashboardProps {
  stats: StatCardProps[];
  recentItems?: {
    title: string;
    data: any[];
    renderItem: (item: any) => React.ReactNode;
  }[];
  charts?: React.ReactNode[];
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  color = '#1890ff',
  loading = false
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

  return (
    <Card 
      className={`stat-card ${isMobile ? 'mobile' : 'desktop'}`}
      loading={loading}
      style={{
        borderLeft: `4px solid ${color}`,
        height: '100%'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">{title}</div>
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} text-gray-900`}>
            {prefix && <span className="mr-1">{prefix}</span>}
            {value}
            {suffix && <span className="mr-1 text-sm font-normal text-gray-500">{suffix}</span>}
          </div>
          
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              <span className="mr-1">{Math.abs(trend.value)}%</span>
              <span className="text-gray-500">من الشهر الماضي</span>
            </div>
          )}
        </div>
        
        <div 
          className={`rounded-full flex items-center justify-center ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}
          style={{ backgroundColor: `${color}20` }}
        >
          {prefix && React.cloneElement(prefix as React.ReactElement, {
            style: { color, fontSize: isMobile ? '20px' : '24px' }
          })}
        </div>
      </div>
    </Card>
  );
};

const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  stats,
  recentItems = [],
  charts = [],
  className = ''
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

  const getStatColumns = () => {
    if (isMobile) return 24; // Full width on mobile
    return stats.length <= 2 ? 12 : stats.length === 3 ? 8 : 6;
  };

  return (
    <div className={`responsive-dashboard ${className}`}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={getStatColumns()} key={index}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      {charts.length > 0 && (
        <Row gutter={[16, 16]} className="mb-6">
          {charts.map((chart, index) => (
            <Col xs={24} lg={charts.length === 1 ? 24 : 12} key={index}>
              <Card className="chart-card">
                {chart}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Recent Items Section */}
      {recentItems.length > 0 && (
        <Row gutter={[16, 16]}>
          {recentItems.map((section, index) => (
            <Col 
              xs={24} 
              lg={recentItems.length === 1 ? 24 : recentItems.length === 2 ? 12 : 8} 
              key={index}
            >
              <Card 
                title={section.title}
                className="recent-items-card"
                extra={
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    size={isMobile ? 'large' : 'middle'}
                  >
                    عرض الكل
                  </Button>
                }
              >
                <List
                  dataSource={section.data.slice(0, isMobile ? 3 : 5)}
                  renderItem={section.renderItem}
                  size={isMobile ? 'large' : 'default'}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <style jsx>{`
        .responsive-dashboard .stat-card {
          transition: all 0.3s ease;
        }
        
        .responsive-dashboard .stat-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        
        .responsive-dashboard .chart-card {
          min-height: 300px;
        }
        
        .responsive-dashboard .recent-items-card {
          height: 100%;
        }
        
        .responsive-dashboard .recent-items-card .ant-card-body {
          padding: ${isMobile ? '16px' : '24px'};
        }
        
        @media (max-width: 768px) {
          .responsive-dashboard .stat-card.mobile {
            margin-bottom: 16px;
          }
          
          .responsive-dashboard .ant-card-head {
            padding: 16px 20px;
          }
          
          .responsive-dashboard .ant-card-head-title {
            font-size: 16px;
            font-weight: 600;
          }
          
          .responsive-dashboard .ant-list-item {
            padding: 12px 0;
          }
          
          .responsive-dashboard .ant-statistic-title {
            font-size: 14px;
          }
          
          .responsive-dashboard .ant-statistic-content {
            font-size: 20px;
          }
        }
        
        @media (hover: none) and (pointer: coarse) {
          .responsive-dashboard .stat-card:hover {
            transform: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
        }
      `}</style>
    </div>
  );
};

export { ResponsiveDashboard, StatCard };
export default ResponsiveDashboard;
