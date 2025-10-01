'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Modal,
  Form,
  Switch,
  Tag,
  Typography,
  Space,
  message,
  Row,
  Col,
  Statistic,
  App,
  Select,
  Avatar,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  CrownOutlined,
  SafetyOutlined,
  EyeOutlined,
  KeyOutlined,
  UserAddOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import { useAdminAuth } from '@/contexts/admin-auth-context';

const { Title, Text } = Typography;
const { Search } = Input;

interface Admin {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

function AdminManagement() {
  const { message, modal } = App.useApp();
  const { handleApiError } = useAdminAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/admin/admins', {
        auth: true
      }) as { success: boolean; data: { admins: Admin[] } };
      
      if (response.success) {
        setAdmins(response.data.admins || []);
      }
    } catch (error) {
      handleApiError(error, 'حسابات الأدمن');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values: any) => {
    console.log('🚀 handleAdd called with values:', values);
    try {
      console.log('📡 Sending request to /admin/admins');
      const response = await apiFetch('/admin/admins', {
        method: 'POST',
        body: JSON.stringify(values),
        auth: true
      }) as { success: boolean; message?: string };
      
      console.log('📥 Response received:', response);
      
      if (response.success) {
        message.success('تم إضافة الأدمن بنجاح');
        setIsModalVisible(false);
        form.resetFields();
        fetchAdmins();
      } else {
        message.error(response.message || 'فشل في إضافة الأدمن');
      }
    } catch (error: any) {
      console.error('❌ Error in handleAdd:', error);
      
      // Show specific error messages
      if (error.message === 'Username or email already exists') {
        message.error('اسم المستخدم أو البريد الإلكتروني موجود بالفعل - جرب اسم مستخدم أو إيميل مختلف');
      } else if (error.message === 'Validation failed') {
        message.error('خطأ في البيانات المدخلة - تأكد من صحة جميع الحقول');
      } else {
        handleApiError(error, 'إضافة الأدمن');
      }
    }
  };

  const handleUpdate = async (values: any) => {
    if (!editingAdmin) return;
    
    try {
      const response = await apiFetch(`/admin/admins/${editingAdmin._id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
        auth: true
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        message.success('تم تحديث الأدمن بنجاح');
        setIsModalVisible(false);
        setEditingAdmin(null);
        form.resetFields();
        fetchAdmins();
      } else {
        message.error(response.message || 'فشل في تحديث الأدمن');
      }
    } catch (error: any) {
      handleApiError(error, 'تحديث الأدمن');
    }
  };

  const handleChangePassword = async (values: any) => {
    if (!editingAdmin) return;
    
    try {
      const response = await apiFetch(`/admin/admins/${editingAdmin._id}/password`, {
        method: 'PUT',
        body: JSON.stringify({
          newPassword: values.newPassword
        }),
        auth: true
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        message.success('تم تغيير كلمة المرور بنجاح');
        setIsPasswordModalVisible(false);
        setEditingAdmin(null);
        passwordForm.resetFields();
      } else {
        message.error(response.message || 'فشل في تغيير كلمة المرور');
      }
    } catch (error: any) {
      handleApiError(error, 'تغيير كلمة المرور');
    }
  };

  const handleToggleStatus = async (admin: Admin) => {
    try {
      const response = await apiFetch(`/admin/admins/${admin._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          isActive: !admin.isActive
        }),
        auth: true
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        message.success(`تم ${!admin.isActive ? 'تفعيل' : 'إلغاء تفعيل'} الأدمن بنجاح`);
        fetchAdmins();
      } else {
        message.error(response.message || 'فشل في تغيير حالة الأدمن');
      }
    } catch (error: any) {
      handleApiError(error, 'تغيير حالة الأدمن');
    }
  };

  const handleDelete = async (admin: Admin) => {
    try {
      const response = await apiFetch(`/admin/admins/${admin._id}`, {
        method: 'DELETE',
        auth: true
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        message.success('تم حذف الأدمن بنجاح');
        fetchAdmins();
      } else {
        message.error(response.message || 'فشل في حذف الأدمن');
      }
    } catch (error: any) {
      handleApiError(error, 'حذف الأدمن');
    }
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    form.setFieldsValue({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive
    });
    setIsModalVisible(true);
  };

  const openPasswordModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setIsPasswordModalVisible(true);
  };


  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchText.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchText.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'الأدمن',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Admin) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="relative">
            <Avatar 
              size={40} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
            >
              {name.charAt(0)}
            </Avatar>
            {record.role === 'super-admin' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <CrownOutlined className="text-xs text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">@{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Text className="text-gray-600">{email}</Text>
      ),
    },
    {
      title: 'الدور',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleConfig = {
          'super_admin': { color: 'gold', text: 'مدير عام', icon: <CrownOutlined /> },
          'admin': { color: 'blue', text: 'أدمن', icon: <UserOutlined /> },
          'moderator': { color: 'green', text: 'مشرف', icon: <SafetyOutlined /> },
        };
        const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', text: role, icon: <UserOutlined /> };
        
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'الحالة',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Badge 
          status={isActive ? 'success' : 'error'} 
          text={isActive ? 'نشط' : 'معطل'}
        />
      ),
    },
    {
      title: 'آخر دخول',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin: string) => (
        <Text className="text-gray-500">
          {lastLogin ? new Date(lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول'}
        </Text>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 200,
      render: (_: any, record: Admin) => (
        <div className="flex gap-1">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            type="primary"
            ghost
            onClick={() => openEditModal(record)}
            title="تعديل البيانات"
          />
          <Button 
            icon={<KeyOutlined />} 
            size="small" 
            onClick={() => openPasswordModal(record)}
            title="تغيير كلمة المرور"
          />
          <Button 
            icon={record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />} 
            size="small" 
            type={record.isActive ? "default" : "primary"}
            onClick={() => handleToggleStatus(record)}
            title={record.isActive ? 'إلغاء التفعيل' : 'تفعيل الحساب'}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => {
              modal.confirm({
                title: 'تأكيد الحذف',
                content: `هل أنت متأكد من حذف الأدمن "${record.name}"؟`,
                okText: 'حذف',
                cancelText: 'إلغاء',
                okType: 'danger',
                onOk: () => handleDelete(record),
              });
            }}
            title="حذف الحساب"
          />
        </div>
      ),
    },
  ];

  const activeAdmins = admins.filter(admin => admin.isActive).length;
  const inactiveAdmins = admins.filter(admin => admin.isActive === false).length;
  const superAdmins = admins.filter(admin => admin.role === 'super_admin').length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="إجمالي الأدمن"
              value={admins.length}
              prefix={<UserOutlined className="text-purple-600" />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="الحسابات النشطة"
              value={activeAdmins}
              prefix={<CheckCircleOutlined className="text-green-600" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="الحسابات المعطلة"
              value={inactiveAdmins}
              prefix={<CloseCircleOutlined className="text-red-600" />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="المديرين العامين"
              value={superAdmins}
              prefix={<CrownOutlined className="text-yellow-600" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Title level={2} className="text-gray-800 mb-2">إدارة حسابات الأدمن</Title>
            <Text type="secondary">إدارة وتحكم في حسابات المديرين والمشرفين</Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              console.log('🆕 إضافة أدمن جديد button clicked');
              setEditingAdmin(null);
              form.resetFields();
              setIsModalVisible(true);
              console.log('✅ Modal should now be visible');
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            إضافة أدمن جديد
          </Button>
        </div>

        <div className="mb-6">
          <Search
            placeholder="البحث في حسابات الأدمن..."
            allowClear
            enterButton
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredAdmins}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredAdmins.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} من ${total} أدمن`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Admin Modal */}
      <Modal
        title={editingAdmin ? 'تعديل بيانات الأدمن' : 'إضافة أدمن جديد'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingAdmin(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            console.log('📝 Form onFinish triggered with values:', values);
            console.log('🔄 editingAdmin:', editingAdmin);
            if (editingAdmin) {
              console.log('✏️ Calling handleUpdate');
              handleUpdate(values);
            } else {
              console.log('➕ Calling handleAdd');
              handleAdd(values);
            }
          }}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="الاسم الكامل"
                rules={[
                  { required: true, message: 'يرجى إدخال الاسم الكامل' },
                  { min: 2, message: 'الاسم يجب أن يكون حرفين على الأقل' }
                ]}
              >
                <Input placeholder="الاسم الكامل" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="اسم المستخدم"
                rules={[
                  { required: true, message: 'يرجى إدخال اسم المستخدم' },
                  { min: 3, message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' }
                ]}
              >
                <Input placeholder="اسم المستخدم" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[
              { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
              { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
            ]}
          >
            <Input placeholder="البريد الإلكتروني" />
          </Form.Item>

          {!editingAdmin && (
            <Form.Item
              name="password"
              label="كلمة المرور"
              rules={[
                { required: true, message: 'يرجى إدخال كلمة المرور' },
                { min: 8, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
              ]}
            >
              <Input.Password placeholder="كلمة المرور" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="الدور"
                rules={[{ required: true, message: 'يرجى اختيار الدور' }]}
              >
                <Select 
                  placeholder="اختر الدور"
                  defaultValue="super_admin"
                  getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                >
                  <Select.Option value="super_admin">مدير عام</Select.Option>
                  <Select.Option value="admin">أدمن</Select.Option>
                  <Select.Option value="moderator">مشرف</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="حالة الحساب"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="نشط" 
                  unCheckedChildren="معطل"
                  defaultChecked={true}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button onClick={() => {
              setIsModalVisible(false);
              setEditingAdmin(null);
              form.resetFields();
            }}>
              إلغاء
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              onClick={() => {
                console.log('🖱️ Submit button clicked!');
                console.log('🔍 Current editingAdmin:', editingAdmin);
                console.log('📋 Form values:', form.getFieldsValue());
              }}
            >
              {editingAdmin ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="تغيير كلمة المرور"
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          setEditingAdmin(null);
          passwordForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="mt-4"
        >
          <Form.Item
            name="newPassword"
            label="كلمة المرور الجديدة"
            rules={[
              { required: true, message: 'يرجى إدخال كلمة المرور الجديدة' },
              { min: 8, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
            ]}
          >
            <Input.Password placeholder="كلمة المرور الجديدة" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="تأكيد كلمة المرور"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'يرجى تأكيد كلمة المرور' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('كلمات المرور غير متطابقة'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="تأكيد كلمة المرور" />
          </Form.Item>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button onClick={() => {
              setIsPasswordModalVisible(false);
              setEditingAdmin(null);
              passwordForm.resetFields();
            }}>
              إلغاء
            </Button>
            <Button type="primary" htmlType="submit" icon={<LockOutlined />}>
              تغيير كلمة المرور
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default function AdminsManagementPage() {
  return (
    <App>
      <div className="min-h-screen bg-gray-50">
        <AdminManagement />
      </div>
    </App>
  );
}
