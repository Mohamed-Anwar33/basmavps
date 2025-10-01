'use client';

import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Modal, Radio, Drawer, message, Input, Select, Space } from 'antd';
import { EyeOutlined, EditOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined, DollarOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import { useAdminAuth } from '@/contexts/admin-auth-context';

// إضافة الأنماط المخصصة للجدول
const tableStyles = `
  .luxury-table .ant-table-thead > tr > th {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-bottom: 2px solid #e2e8f0;
    font-weight: 600;
    color: #374151;
    padding: 20px 16px;
    position: relative;
  }
  
  .luxury-table .ant-table-thead > tr > th::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
  }
  
  .luxury-table .ant-table-tbody > tr > td {
    padding: 20px 16px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }
  
  .luxury-table .ant-table-tbody > tr:hover > td {
    background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
    transform: scale(1.001);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .luxury-table .ant-table {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
  }
  
  .luxury-table .ant-table-pagination {
    margin-top: 24px;
    padding: 16px;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .luxury-table .ant-table-tbody > tr {
    transition: all 0.3s ease;
  }
  
  .luxury-table .ant-table-tbody > tr:nth-child(even) {
    background-color: rgba(248, 250, 252, 0.5);
  }
  
  .luxury-table .ant-table-tbody > tr:nth-child(odd) {
    background-color: rgba(255, 255, 255, 1);
  }
`;

// إضافة الأنماط إلى الصفحة
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = tableStyles;
  document.head.appendChild(styleElement);
}

const { Search } = Input;

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    isRegistered: boolean;
    userId?: string;
    userCreatedAt?: string;
    isEmailVerified?: boolean;
  };
  service: {
    _id: string;
    title: any;
    price: any;
  };
  totalAmount: number;
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
  status: string;
  paymentStatus?: string;
  description?: string;
  additionalNotes?: string;
  attachments?: any[];
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export default function OrdersManagement() {
  const { handleApiError, admin, token, loading: authLoading } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  // Modal-based status change flow
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusTargetOrder, setStatusTargetOrder] = useState<Order | null>(null);
  const [statusNewValue, setStatusNewValue] = useState<string | null>(null);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const statuses = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'in_progress', label: 'قيد التنفيذ' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
  ];

  const paymentStatuses = [
    { value: 'all', label: 'جميع حالات الدفع' },
    { value: 'pending', label: 'في انتظار الدفع' },
    { value: 'paid', label: 'مدفوع' },
    { value: 'failed', label: 'فشل الدفع' },
    { value: 'refunded', label: 'مسترد' },
  ];

  // حالة الدفع تعرض فقط (قراءة فقط) من النظام المالي ولا يمكن تعديلها من اللوحة

  useEffect(() => {
    if (!authLoading && admin && token) {
      fetchOrders();
    }
  }, [authLoading, admin, token, selectedStatus, selectedPaymentStatus, searchText, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusParam = selectedStatus === 'all' ? '' : selectedStatus;
      const paymentStatusParam = selectedPaymentStatus === 'all' ? '' : selectedPaymentStatus;
      const scopeQuery = (selectedStatus === 'all' && selectedPaymentStatus === 'all') ? '&scope=all' : '';
      
      // Build query parameters
      const statusQuery = statusParam ? `&status=${statusParam}` : '';
      const paymentQuery = paymentStatusParam ? `&paymentStatus=${paymentStatusParam}` : '';
      
      const response = await apiFetch(`/admin/orders?page=${currentPage}&limit=10${statusQuery}${paymentQuery}&search=${searchText}&t=${Date.now()}${scopeQuery}`, {
        auth: true
      }) as { data: { orders: Order[]; pagination: { total: number } } };
      
      
      // Debug payment status for each order
      // Orders data processed successfully
      
      setOrders(response.data?.orders || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      handleApiError(error, 'الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    console.log('🔄 Status change requested:', { orderId, newStatus });
    
    // Avoid no-op updates
    const current = orders.find(o => o._id === orderId)?.status;
    if (current === newStatus) {
      console.log('⚠️ No change needed, same status');
      return;
    }
    
    const currentOrder = orders.find(o => o._id === orderId);
    const orderNumber = currentOrder?.orderNumber;
    
    console.log('📋 Order details:', { orderNumber, currentStatus: current, newStatus });
    
    try {
      setLoading(true); // Disable selects during update
      
      const response = await apiFetch(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
        auth: true
      }) as { success: boolean; message?: string };
      
      console.log('📥 API Response:', response);
      
      if (response.success) {
        message.success(`تم تحديث حالة الطلب ${orderNumber} بنجاح`);
        
        // Optimistic UI update
        setOrders((prev) => prev.map((o) => o._id === orderId ? { 
          ...o, 
          status: newStatus,
          updatedAt: new Date().toISOString()
        } : o));
        
        setSelectedOrder((prev) => prev && prev._id === orderId ? { 
          ...prev, 
          status: newStatus,
          updatedAt: new Date().toISOString()
        } as any : prev);
        
        // Keep the item visible by switching filter to the new status and reset pagination
        setSelectedStatus(newStatus);
        setCurrentPage(1);
        
        // Then refresh from server
        await fetchOrders();
      } else {
        message.error(response.message || 'لم يتم تحديث حالة الطلب');
      }
    } catch (error: any) {
      handleApiError(error, 'تحديث حالة الطلب');
    } finally {
      setLoading(false); // Re-enable selects
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'completed': return 'cyan';
      case 'in_progress': return 'blue';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusColorHex = (status: string) => {
    switch (status) {
      case 'delivered': return '#52c41a';
      case 'completed': return '#13c2c2';
      case 'in_progress': return '#1890ff';
      case 'pending': return '#faad14';
      case 'cancelled': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'تم التسليم';
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'قيد الانتظار';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return 'default';
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'refunded': return 'purple';
      default: return 'default';
    }
  };

  const getPaymentStatusText = (status: string | undefined) => {
    if (!status) return 'غير محدد';
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'pending': return 'في الانتظار';
      case 'failed': return 'فشل';
      case 'refunded': return 'مسترد';
      default: return status;
    }
  };

  // Elegant pill components for a luxury look
  const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const text = getStatusText(status);
    const theme: Record<string, string> = {
      delivered: 'bg-green-50 text-green-700 ring-1 ring-green-200',
      completed: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
      in_progress: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
      default: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200',
    };
    const cls = theme[status] || theme.default;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{text}</span>
    );
  };

  const PaymentPill: React.FC<{ status?: string }> = ({ status }) => {
    const s = status || 'undefined';
    const text = getPaymentStatusText(status);
    const theme: Record<string, string> = {
      paid: 'bg-green-50 text-green-700 ring-1 ring-green-200',
      pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      failed: 'bg-red-50 text-red-700 ring-1 ring-red-200',
      refunded: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
      undefined: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200',
    };
    const cls = theme[s] || theme.undefined;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{text}</span>
    );
  };

  // لا توجد دالة لتعديل حالة الدفع من اللوحة بناءً على السياسة الجديدة

  const getServiceTitle = (title: any) => {
    if (typeof title === 'object' && title.ar) {
      return title.ar;
    }
    return title || 'غير محدد';
  };

  // 🗑️🗑️ حذف جماعي لجميع الطلبات غير المدفوعة
  const handleBulkDeleteUnpaidOrders = async () => {
    // العثور على جميع الطلبات غير المدفوعة
    const unpaidOrders = orders.filter(order => order.paymentStatus !== 'paid');
    
    if (unpaidOrders.length === 0) {
      message.info('لا توجد طلبات غير مدفوعة للحذف');
      return;
    }
    
    Modal.confirm({
      title: '⚠️ حذف جماعي للطلبات غير المدفوعة',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div className="space-y-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold mb-2">⚠️ تحذير هام:</p>
            <p className="text-red-700">أنت على وشك حذف <strong>{unpaidOrders.length}</strong> طلب غير مدفوع نهائياً!</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-gray-700 mb-2"><strong>الطلبات التي سيتم حذفها:</strong></p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {unpaidOrders.slice(0, 5).map(order => (
                <div key={order._id} className="text-xs text-gray-600 bg-white p-2 rounded border">
                  🔢 {order.orderNumber} - 👤 {order.customerInfo?.name} - 💳 {order.paymentStatus}
                </div>
              ))}
              {unpaidOrders.length > 5 && (
                <div className="text-xs text-gray-500 italic">
                  ... و {unpaidOrders.length - 5} طلب آخر
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-sm text-red-800">
              🚨 <strong>تحذير:</strong> هذه العملية لا يمكن التراجع عنها. سيتم حذف جميع الطلبات غير المدفوعة نهائياً من قاعدة البيانات.
            </p>
          </div>
        </div>
      ),
      okText: `نعم، احذف ${unpaidOrders.length} طلب`,
      okType: 'danger',
      cancelText: 'إلغاء',
      width: 600,
      onOk: async () => {
        try {
          const orderIds = unpaidOrders.map(order => order._id);
          
          // 🔍 Debug logging
          console.log('Bulk delete data:', {
            totalUnpaidOrders: unpaidOrders.length,
            orderIds: orderIds.length,
            sampleOrders: unpaidOrders.slice(0, 3).map(o => ({
              id: o._id,
              orderNumber: o.orderNumber || 'N/A'
            }))
          });
          
          const response = await apiFetch<{success: boolean, error?: string, data?: any}>('/admin/orders/bulk-delete', {
            method: 'POST',
            auth: true,
            body: JSON.stringify({ orderIds })
          });
          
          if (response.success) {
            const deletedCount = response.data?.deletedCount || 0;
            const totalRequested = response.data?.totalRequested || 0;
            const errors = response.data?.errors || [];
            
            if (errors.length > 0) {
              message.warning(`🗑️ تم حذف ${deletedCount} من أصل ${totalRequested} طلب. ${errors.length} طلب لم يحذف`);
            } else {
              message.success(`🗑️ تم حذف ${deletedCount} طلب غير مدفوع بنجاح`);
            }
            
            // إعادة تحميل الطلبات
            fetchOrders();
          } else {
            message.error('❌ فشل في الحذف الجماعي: ' + (response.error || 'خطأ غير معروف'));
          }
        } catch (error: any) {
          message.error('❌ خطأ في الاتصال بالخادم: ' + (error.message || 'خطأ غير معروف'));
        }
      }
    });
  };

  // 🗑️ حذف طلب معلق
  const handleDeleteOrder = async (order: Order) => {
    Modal.confirm({
      title: '⚠️ حذف الطلب',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div className="space-y-3 mt-4">
          <p>هل أنت متأكد من حذف هضا الطلب؟</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-gray-700">
              <div>🔢 <strong>رقم الطلب:</strong> {order.orderNumber}</div>
              <div>👤 <strong>العميل:</strong> {order.customerInfo?.name}</div>
              <div>💳 <strong>حالة الدفع:</strong> {order.paymentStatus}</div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              ⚠️ <strong>تحذير:</strong> هذه العملية لا يمكن التراجع عنها. سيتم حذف الطلب نهائياً من قاعدة البيانات.
            </p>
          </div>
        </div>
      ),
      okText: 'نعم، احذف',
      okType: 'danger',
      cancelText: 'إلغاء',
      width: 500,
      onOk: async () => {
        try {
          const response = await apiFetch<{success: boolean, error?: string, data?: any}>(`/admin/orders/${order._id}/delete`, {
            method: 'DELETE',
            auth: true  // 🔒 إضافة المصادقة الإدارية
          });
          
          if (response.success) {
            message.success('🗑️ تم حذف الطلب بنجاح');
            // إعادة تحميل الطلبات
            fetchOrders();
          } else {
            message.error('❌ فشل في حذف الطلب: ' + (response.error || 'خطأ غير معروف'));
          }
        } catch (error: any) {
          message.error('❌ خطأ في الاتصال بالخادم: ' + (error.message || 'خطأ غير معروف'));
        }
      }
    });
  };

  const formatCurrency = (amount: number | undefined, currency?: string) => {
    if (typeof amount !== 'number') return 'غير متاح';
    const symbol = currency === 'USD' ? '$' : 'ر.س';
    return `${amount} ${symbol}`;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customerInfo?.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-blue-500">🔢</span>
          رقم الطلب
        </div>
      ),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      render: (orderNumber: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">#</span>
          </div>
          <div className="font-mono text-blue-600 font-semibold">
            {orderNumber}
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-green-500">👤</span>
          العميل
        </div>
      ),
      dataIndex: 'customerInfo',
      key: 'customerInfo',
      width: 280,
      render: (_: any, record: Order) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {record.customerInfo?.name?.charAt(0)?.toUpperCase() || '؟'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-800 truncate">
                {record.customerInfo?.name || 'غير محدد'}
              </span>
              {record.customerInfo?.isRegistered ? (
                <Tag color="green" className="text-xs px-2 py-0.5 rounded-full">✓ مسجل</Tag>
              ) : (
                <Tag color="orange" className="text-xs px-2 py-0.5 rounded-full">ضيف</Tag>
              )}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              📧 {record.customerInfo?.email || 'غير محدد'}
            </div>
            {record.customerInfo?.phone && (
              <div className="text-xs text-gray-600 truncate">
                📱 {record.customerInfo.phone}
              </div>
            )}
            {record.customerInfo?.isRegistered && record.customerInfo?.userCreatedAt && (
              <div className="text-xs text-blue-500 mt-1">
                📅 عضو منذ: {new Date(record.customerInfo.userCreatedAt).toLocaleDateString('ar-SA')}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-purple-500">🎨</span>
          الخدمة
        </div>
      ),
      dataIndex: 'service',
      key: 'service',
      width: 220,
      render: (_: any, record: Order) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">🎨</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 text-sm leading-tight mb-2 line-clamp-2">
              {record.service?.title?.ar || record.service?.title || (record as any).serviceName || 'غير محدد'}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">💰</span>
              <span className="text-sm font-bold text-green-600">
                {record.service?.price?.SAR 
                  ? `${record.service.price.SAR} ر.س`
                  : record.service?.price 
                  ? `${record.service.price} ر.س`
                  : record.totalAmount
                  ? formatCurrency(record.totalAmount, record.currency)
                  : '0 ر.س'
                }
              </span>
            </div>
          </div>
        </div>
      ),
    },
    
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-blue-500">📊</span>
          حالة الطلب
        </div>
      ),
      dataIndex: 'status',
      key: 'status',
      width: 160,
      align: 'center' as const,
      render: (status: string, record: Order) => (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <StatusPill status={status} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-xs text-gray-500 text-center bg-gray-50 px-2 py-1 rounded-full">
            🕒 {new Date(record.updatedAt).toLocaleDateString('ar-SA')}
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-green-500">💳</span>
          حالة الدفع
        </div>
      ),
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 140,
      align: 'center' as const,
      render: (paymentStatus: string) => (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <PaymentPill status={paymentStatus} />
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <div className="text-xs text-gray-400 text-center bg-green-50 px-2 py-1 rounded-full border border-green-200">
            🤖 تلقائية
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-orange-500">📅</span>
          تاريخ الطلب
        </div>
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      align: 'center' as const,
      render: (date: string) => (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            <span className="text-xs">📅</span>
            <span className="text-sm font-medium text-orange-700">
              {new Date(date).toLocaleDateString('ar-SA')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>🕐</span>
            <span>{new Date(date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-red-500">⚙️</span>
          الإجراءات
        </div>
      ),
      key: 'actions',
      width: 200,
      align: 'center' as const,
      render: (_: any, record: Order) => (
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700 shadow-md"
            onClick={() => {
              setSelectedOrder(record);
              setDrawerVisible(true);
            }}
          >
            عرض التفاصيل
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white border-0 hover:from-green-600 hover:to-teal-700 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              setStatusTargetOrder(record);
              setStatusNewValue(record.status);
              setStatusModalVisible(true);
            }}
          >
            تغيير الحالة
          </Button>
          
          {/* 🗑️ زر الحذف - يظهر فقط للطلبات غير المدفوعة */}
          {record.paymentStatus !== 'paid' && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              className="bg-red-500 hover:bg-red-600 border-0 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteOrder(record);
              }}
              title="حذف الطلب المعلق"
            >
              حذف
            </Button>
          )}
          
          {/* رسالة للطلبات المحمية */}
          {record.paymentStatus === 'paid' && (
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200 text-center">
              🔒 محمي
            </div>
          )}
        </div>
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
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">📋</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                إدارة الطلبات
              </h2>
              <p className="text-gray-600 mt-1">إدارة حالة تنفيذ الطلبات - حالة الدفع تُدار تلقائياً من نظام المدفوعات</p>
              <div className="flex gap-3 mt-3">
                <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium shadow-sm">
                  ⚙️ حالة التنفيذ: قابلة للتعديل
                </span>
                <span className="text-xs bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-3 py-1.5 rounded-full font-medium shadow-sm">
                  🤖 حالة الدفع: تلقائية
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{orders.length}</div>
                  <div className="text-sm text-blue-600">إجمالي الطلبات</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">💰</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">{orders.filter(o => o.paymentStatus === 'paid').length}</div>
                  <div className="text-sm text-green-600">الطلبات المدفوعة</div>
                </div>
              </div>
            </div>
            
            {/* 🗑️ إحصائيات الطلبات غير المدفوعة وزر الحذف */}
            <div className="bg-gradient-to-br from-red-50 to-orange-100 border border-red-200 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">🗑️</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-700">{orders.filter(o => o.paymentStatus !== 'paid').length}</div>
                    <div className="text-sm text-red-600">طلبات غير مدفوعة</div>
                  </div>
                </div>
                
                {/* زر الحذف الجماعي */}
                {orders.filter(o => o.paymentStatus !== 'paid').length > 0 && (
                  <div className="flex flex-col gap-2">
                    <Button 
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleBulkDeleteUnpaidOrders}
                      className="bg-red-500 hover:bg-red-600 border-0 shadow-lg px-4 py-2 h-auto"
                      title="حذف جميع الطلبات غير المدفوعة (يتطلب صلاحيات admin)"
                    >
                      <span className="hidden sm:inline">حذف الكل</span>
                      <span className="sm:hidden">حذف</span>
                    </Button>
                    <div className="text-xs text-gray-500 text-center">
                      يتطلب admin
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">البحث والفلترة</h3>
          </div>
          
          <div className="flex flex-col gap-6">
            <Search
              placeholder="🔍 البحث في الطلبات (رقم الطلب، اسم العميل، البريد الإلكتروني)..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full"
              size="large"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-blue-500">📊</span>
                  حالة الطلب (التنفيذ)
                </label>
                <Radio.Group 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex flex-wrap gap-2"
                >
                  {statuses.map((s) => (
                    <Radio.Button 
                      key={s.value} 
                      value={s.value}
                      className="rounded-full border-2 font-medium"
                    >
                      {s.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-green-500">💳</span>
                  حالة الدفع (تلقائية)
                </label>
                <Radio.Group 
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="flex flex-wrap gap-2"
                >
                  {paymentStatuses.map((s) => (
                    <Radio.Button 
                      key={s.value} 
                      value={s.value}
                      className="rounded-full border-2 font-medium"
                    >
                      {s.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: total || filteredOrders.length,
            current: currentPage,
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (t, range) => (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  📊 عرض {range[0]}-{range[1]} من {t} طلب
                </span>
              </div>
            ),
            onChange: (page) => setCurrentPage(page),
            className: "mt-6",
          }}
          scroll={{ x: 1200 }}
          className="luxury-table"
          size="middle"
          rowClassName={(record, index) => 
            `hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ${
              index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
            }`
          }
        />
      </Card>

      {/* Modal: change status */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">✏️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">تغيير حالة الطلب</h3>
              <p className="text-sm text-gray-500">اختر الحالة الجديدة للطلب</p>
            </div>
          </div>
        }
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={async () => {
          if (!statusTargetOrder || !statusNewValue) return setStatusModalVisible(false);
          await handleStatusChange(statusTargetOrder._id, statusNewValue);
          setStatusModalVisible(false);
        }}
        okText="💾 حفظ التغييرات"
        cancelText="❌ إلغاء"
        confirmLoading={loading}
        className="luxury-modal"
        width={500}
        okButtonProps={{
          className: "bg-gradient-to-r from-green-500 to-teal-600 border-0 hover:from-green-600 hover:to-teal-700 h-10 px-6 font-medium"
        }}
        cancelButtonProps={{
          className: "h-10 px-6 font-medium"
        }}
      >
        <div className="space-y-6 pt-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span className="font-semibold">📋 رقم الطلب:</span>
              <span className="font-mono bg-blue-100 px-2 py-1 rounded">#{statusTargetOrder?.orderNumber}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              اختر الحالة الجديدة:
            </label>
            <Radio.Group 
              className="flex flex-col gap-3"
              value={statusNewValue || undefined}
              onChange={(e) => setStatusNewValue(e.target.value)}
            >
              {statuses.slice(1).map((s) => (
                <Radio 
                  key={s.value} 
                  value={s.value}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <span className="font-medium">{s.label}</span>
                </Radio>
              ))}
            </Radio.Group>
          </div>
        </div>
      </Modal>

      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📋</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">تفاصيل الطلب</h3>
              <p className="text-sm text-gray-500">معلومات شاملة عن الطلب</p>
            </div>
          </div>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
        className="luxury-drawer"
      >
        {selectedOrder && (
          <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">#</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">#{selectedOrder.orderNumber}</h4>
                    <p className="text-sm text-gray-600">رقم الطلب</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedOrder.total ?? selectedOrder.totalAmount, selectedOrder.currency)}
                  </div>
                  <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">حالة الطلب</p>
                  <Tag color={getStatusColor(selectedOrder.status)} className="px-3 py-1 text-sm font-medium">
                    {getStatusText(selectedOrder.status)}
                  </Tag>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">حالة الدفع</p>
                  <Tag color={getPaymentStatusColor(selectedOrder.paymentStatus)} className="px-3 py-1 text-sm font-medium">
                    {getPaymentStatusText(selectedOrder.paymentStatus)}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-green-500">💰</span>
                التفاصيل المالية
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">المبلغ قبل الضريبة</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">ضريبة القيمة المضافة (15%)</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(selectedOrder.tax, selectedOrder.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
                  <span className="font-semibold text-gray-800">الإجمالي المستحق</span>
                  <span className="font-bold text-xl text-green-600">
                    {formatCurrency(selectedOrder.total ?? selectedOrder.totalAmount, selectedOrder.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-500">👤</span>
                معلومات العميل
                {(selectedOrder.customerInfo as any)?.source === 'payment_form' && (
                  <Tag color="blue" className="text-xs">بيانات الدفع</Tag>
                )}
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {selectedOrder.customerInfo.name?.charAt(0)?.toUpperCase() || '؟'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800">{selectedOrder.customerInfo.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedOrder.customerInfo.isRegistered ? (
                        <Tag color="green" className="text-xs">عضو مسجل</Tag>
                      ) : (
                        <Tag color="orange" className="text-xs">عميل ضيف</Tag>
                      )}
                      {(selectedOrder.customerInfo as any)?.source === 'payment_form' && (
                        <Tag color="blue" className="text-xs">✓ بيانات الدفع</Tag>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{selectedOrder.customerInfo.email}</span>
                      {selectedOrder.customerInfo.isEmailVerified && (
                        <Tag color="blue" className="text-xs">موثق</Tag>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
                    <span className="font-medium text-gray-800">
                      {selectedOrder.customerInfo.phone || 'غير محدد'}
                    </span>
                  </div>
                </div>

                {selectedOrder.customerInfo.isRegistered && selectedOrder.customerInfo.userCreatedAt && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">تاريخ التسجيل</p>
                    <span className="font-medium text-blue-800">
                      {new Date(selectedOrder.customerInfo.userCreatedAt).toLocaleString('ar-SA')}
                    </span>
                  </div>
                )}

                {(selectedOrder.customerInfo as any)?.source === 'payment_form' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">مصدر البيانات</p>
                    <span className="font-medium text-green-800">البيانات المدخلة أثناء عملية الدفع</span>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-purple-500">🎨</span>
                تفاصيل الخدمة
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">اسم الخدمة</p>
                  <h5 className="font-semibold text-purple-800">
                    {getServiceTitle(selectedOrder.service?.title)}
                  </h5>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">سعر الخدمة</p>
                  <span className="font-semibold text-green-800">
                    {selectedOrder.service?.price && typeof selectedOrder.service.price === 'object' 
                      ? `${selectedOrder.service.price.SAR} ر.س`
                      : `${selectedOrder.service?.price || 0} ر.س`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-orange-500">📝</span>
                وصف المشروع
              </h4>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedOrder.description || 'لا يوجد وصف محدد'}
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-500">💬</span>
                ملاحظات إضافية
              </h4>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedOrder.additionalNotes || 'لا توجد ملاحظات إضافية'}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-red-500">📎</span>
                  الملفات المرفقة
                  <Tag color="red" className="text-xs">{selectedOrder.attachments.length} ملف</Tag>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedOrder.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">📄</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{file.originalName || `ملف ${index + 1}`}</p>
                        <p className="text-xs text-gray-500">ملف مرفق من العميل</p>
                      </div>
                      <Button type="primary" size="small" className="bg-red-500 hover:bg-red-600">
                        تحميل
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-indigo-500">⏰</span>
                التوقيتات المهمة
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📅</span>
                  </div>
                  <div>
                    <p className="font-medium text-indigo-800">تاريخ إنشاء الطلب</p>
                    <p className="text-sm text-indigo-600">
                      {new Date(selectedOrder.createdAt).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🔄</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">آخر تحديث</p>
                    <p className="text-sm text-blue-600">
                      {new Date(selectedOrder.updatedAt).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>

                {selectedOrder.deliveredAt && (
                  <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">✅</span>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">تاريخ التسليم</p>
                      <p className="text-sm text-green-600">
                        {new Date(selectedOrder.deliveredAt).toLocaleString('ar-SA')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
