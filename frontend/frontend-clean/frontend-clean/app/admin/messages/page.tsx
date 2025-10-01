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
  Descriptions,
  message
} from 'antd';
import { 
  EyeOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  MessageOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { apiFetch } from '@/lib/api';

const { Search } = Input;
const { Option } = Select;

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function MessagesManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const statuses = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'new', label: 'جديد' },
    { value: 'read', label: 'مقروء' },
    { value: 'replied', label: 'تم الرد' },
    { value: 'archived', label: 'مؤرشف' },
  ];

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const statusParam = selectedStatus === 'all' ? '' : selectedStatus;
      const response = await fetch(`/api/admin/contacts?page=${currentPage}&limit=10&status=${statusParam}&search=${searchText}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessages(result.data?.contacts || []);
        setTotal(result.data?.pagination?.total || 0);
      }
    } catch (error) {
      message.error('فشل في تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    try {
      const response = await apiFetch(`/admin/contacts/${messageId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }) as { success: boolean; message?: string };

      if (response.success) {
        message.success('تم تحديث حالة الرسالة بنجاح');
        fetchMessages();
      }
    } catch (error) {
      message.error('فشل في تحديث حالة الرسالة');
    }
  };

  const handleDelete = (messageId: string, senderName: string) => {
    Modal.confirm({
      title: 'هل أنت متأكد من حذف هذه الرسالة؟',
      content: `سيتم حذف رسالة "${senderName}" نهائياً`,
      okText: 'حذف',
      cancelText: 'إلغاء',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await apiFetch(`/admin/contacts/${messageId}`, {
            method: 'DELETE'
          }) as { success: boolean; message?: string };
          if (response.success) {
            message.success('تم حذف الرسالة بنجاح');
            fetchMessages();
          }
        } catch (error) {
          message.error('فشل في حذف الرسالة');
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'red';
      case 'read': return 'blue';
      case 'replied': return 'green';
      case 'archived': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'read': return 'مقروء';
      case 'replied': return 'تم الرد';
      case 'archived': return 'مؤرشف';
      default: return status;
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchText.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchText.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || msg.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'المرسل',
      key: 'sender',
      render: (_: any, record: ContactMessage) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <UserOutlined className="text-purple-600" />
          </div>
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
      title: 'الموضوع',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{subject}</div>
        </div>
      ),
    },
    {
      title: 'الرسالة',
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => (
        <div className="max-w-sm">
          <p className="text-gray-600 truncate">{text}</p>
        </div>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: ContactMessage) => (
        <Select
          value={status}
          size="small"
          style={{ width: 100 }}
          onChange={(value) => handleStatusUpdate(record._id, value)}
        >
          {statuses.slice(1).map(s => (
            <Option key={s.value} value={s.value}>
              <Tag color={getStatusColor(s.value)} className="m-0">
                {s.label}
              </Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'تاريخ الإرسال',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div>
          <div className="flex items-center text-sm">
            <CalendarOutlined className="ml-1" />
            {new Date(date).toLocaleDateString('ar-SA')}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(date).toLocaleTimeString('ar-SA')}
          </div>
        </div>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: ContactMessage) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedMessage(record);
              setModalVisible(true);
              if (record.status === 'new') {
                handleStatusUpdate(record._id, 'read');
              }
            }}
          >
            عرض
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

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">إدارة الرسائل</h2>
            <p className="text-sm text-gray-600 hidden lg:block">متابعة وإدارة رسائل التواصل من العملاء</p>
          </div>
          <div className="text-sm text-gray-600">
            إجمالي الرسائل: {messages.length}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Search
              placeholder="البحث في الرسائل..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="w-full"
            />
          </div>
          <div className="w-full lg:w-64">
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-full"
              size="large"
              placeholder="فلترة بالحالة"
            >
              {statuses.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <Table
            columns={columns}
            dataSource={filteredMessages}
            rowKey="_id"
            loading={loading}
            pagination={{
              total: filteredMessages.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} من ${total} رسالة`,
              responsive: true,
              showLessItems: true,
            }}
            scroll={{ x: 1000 }}
            className="messages-table"
            size="middle"
          />
        </div>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageOutlined className="text-purple-600" />
            </div>
            <span className="text-lg font-semibold">تفاصيل الرسالة</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedMessage(null);
        }}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)} size="large">
            إغلاق
          </Button>,
          selectedMessage && (
            <Button
              key="reply"
              type="primary"
              icon={<MailOutlined />}
              size="large"
              onClick={() => {
                window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
              }}
            >
              رد عبر البريد
            </Button>
          ),
        ]}
        width="90vw"
        style={{ 
          maxWidth: '800px',
          margin: '0 auto'
        }}
        styles={{
          body: {
            padding: '20px'
          },
          header: {
            padding: '20px 24px 16px'
          }
        }}
        destroyOnHidden
      >
        {selectedMessage && (
          <div className="space-y-4">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="المرسل">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <UserOutlined />
                  <span>{selectedMessage.name}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="البريد الإلكتروني">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <MailOutlined />
                  <span>{selectedMessage.email}</span>
                </div>
              </Descriptions.Item>
              {selectedMessage.phone && (
                <Descriptions.Item label="رقم الهاتف">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <PhoneOutlined />
                    <span>{selectedMessage.phone}</span>
                  </div>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="الموضوع">
                {selectedMessage.subject}
              </Descriptions.Item>
              <Descriptions.Item label="الحالة">
                <Tag color={getStatusColor(selectedMessage.status)}>
                  {getStatusText(selectedMessage.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="تاريخ الإرسال">
                {new Date(selectedMessage.createdAt).toLocaleString('ar-SA')}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4 className="font-medium mb-2">محتوى الرسالة:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
