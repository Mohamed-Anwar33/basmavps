'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Card, 
  Input, 
  Select, 
  Modal, 
  Avatar,
  message
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import { useAdminAuth } from '@/contexts/admin-auth-context';

const { Search } = Input;
const { Option } = Select;

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { token, admin, loading: authLoading } = useAdminAuth();

  const roles = [
    { value: 'all', label: 'جميع الأدوار' },
    { value: 'user', label: 'مستخدم' },
    { value: 'admin', label: 'مدير' },
    { value: 'editor', label: 'محرر' },
  ];

  useEffect(() => {
    if (!authLoading && admin && token) {
      fetchUsers();
    }
  }, [authLoading, admin, token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const roleParam = selectedRole === 'all' ? '' : selectedRole;
      const response = await apiFetch(`/admin/users?page=${currentPage}&limit=10&search=${searchText}&role=${roleParam}`, {
        auth: true
      }) as { success: boolean; data: { users: User[]; pagination: { total: number } }; message?: string };
      
      
      if (response.success) {
        setUsers(response.data?.users || []);
        setTotal(response.data?.pagination?.total || 0);
      } else {
        message.error(response.message || 'فشل في تحميل المستخدمين');
      }
    } catch (error) {
      message.error('فشل في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await apiFetch(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus }),
        auth: true
      }) as any;

      if (response.success) {
        message.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`);
        fetchUsers();
      }
    } catch (error) {
      message.error('فشل في تحديث حالة المستخدم');
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    Modal.confirm({
      title: 'هل أنت متأكد من حذف هذا المستخدم؟',
      content: `سيتم حذف المستخدم "${userName}" نهائياً`,
      okText: 'حذف',
      cancelText: 'إلغاء',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await apiFetch(`/admin/users/${userId}`, {
            method: 'DELETE',
            auth: true
          }) as any;
          if (response.success) {
            message.success('تم حذف المستخدم بنجاح');
            fetchUsers();
          }
        } catch (error) {
          message.error('فشل في حذف المستخدم');
        }
      },
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'editor': return 'blue';
      case 'user': return 'green';
      default: return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'editor': return 'محرر';
      case 'user': return 'مستخدم';
      default: return role;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      title: 'المستخدم',
      key: 'user',
      render: (_: any, record: User) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Avatar 
            size="large" 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#4b2e83' }}
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MailOutlined className="ml-1" />
              {record.email}
            </div>
            {record.phone && (
              <div className="text-sm text-gray-500 flex items-center">
                <PhoneOutlined className="ml-1" />
                {record.phone}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'الدور',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: 'الحالة',
      key: 'status',
      render: (_: any, record: User) => (
        <div className="space-y-1">
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'نشط' : 'غير نشط'}
          </Tag>
          <br />
          <Tag color={record.isEmailVerified ? 'blue' : 'orange'}>
            {record.isEmailVerified ? 'مفعل' : 'غير مفعل'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'تاريخ التسجيل',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString('ar-SA')}</div>
          <div className="text-sm text-gray-500">
            {new Date(date).toLocaleTimeString('ar-SA')}
          </div>
        </div>
      ),
    },
    {
      title: 'آخر دخول',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => 
        date ? (
          <div>
            <div>{new Date(date).toLocaleDateString('ar-SA')}</div>
            <div className="text-sm text-gray-500">
              {new Date(date).toLocaleTimeString('ar-SA')}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">لم يسجل دخول</span>
        ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
          >
            عرض
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleStatusToggle(record._id, record.isActive)}
            className={record.isActive ? 'text-red-500' : 'text-green-500'}
          >
            {record.isActive ? 'إلغاء تفعيل' : 'تفعيل'}
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record._id, record.name)}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ];

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من صلاحية الوصول...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!admin || !token) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">يجب تسجيل الدخول للوصول لهذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h2>
          <div className="text-sm text-gray-600">
            إجمالي المستخدمين: {users.length}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="البحث في المستخدمين..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedRole}
            onChange={setSelectedRole}
            className="w-full sm:w-48"
          >
            {roles.map(role => (
              <Option key={role.value} value={role.value}>{role.label}</Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} مستخدم`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
