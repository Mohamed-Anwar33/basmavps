'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space } from 'antd';
import { 
  UserOutlined, 
  ShoppingCartOutlined,
  ToolOutlined,
  DollarOutlined,
  EyeOutlined,
  EditOutlined 
} from '@ant-design/icons';
// import { apiFetch } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalServices: number;
  totalRevenue: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
  };
  service: {
    title: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalServices: 0,
    totalRevenue: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth-token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard/stats', { headers });
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json() as any;
        const statsData = statsResult.data;
        
        setStats({
          totalUsers: statsData.overview?.totalUsers || 0,
          totalOrders: statsData.overview?.totalOrders || 0,
          totalServices: statsData.overview?.totalServices || 0,
          totalRevenue: statsData.payments?.totalRevenue || 0,
        });
      }

      // Fetch recent orders
      const ordersResponse = await fetch('/api/admin/orders?limit=10', { headers });
      if (ordersResponse.ok) {
        const ordersResult = await ordersResponse.json() as any;
        setOrders(ordersResult.data?.orders || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'processing': return 'قيد المعالجة';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'رقم الطلب',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'العميل',
      dataIndex: ['customerInfo', 'name'],
      key: 'customer',
    },
    {
      title: 'الخدمة',
      dataIndex: ['service', 'title'],
      key: 'service',
      render: (title: any) => {
        if (typeof title === 'object' && title.ar) {
          return title.ar;
        }
        return title || 'غير محدد';
      }
    },
    {
      title: 'المبلغ',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount} ر.س`,
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'التاريخ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ar-SA'),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} size="small">
            عرض
          </Button>
          <Button type="link" icon={<EditOutlined />} size="small">
            تعديل
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="إجمالي المستخدمين"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#4b2e83' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="إجمالي الطلبات"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#7a4db3' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="إجمالي الخدمات"
              value={stats.totalServices}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#bcbcbc' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="إجمالي الإيرادات"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="ر.س"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card title="الطلبات الأخيرة" className="w-full">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}
