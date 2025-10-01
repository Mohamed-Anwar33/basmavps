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
  Form, 
  InputNumber,
  Switch,
  Upload,
  message,
  Tabs,
  Row,
  Col,
  Divider,
  Typography,
  Badge,
  Tooltip,
  Image
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  UploadOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  ClockCircleOutlined,
  DollarOutlined,
  TagOutlined,
  FileTextOutlined,
  LinkOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { apiFetch } from '@/lib/api';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface Service {
  _id: string;
  title: { ar: string; en: string } | string;
  slug: string;
  description: { ar: string; en: string } | string;
  price: { SAR: number; USD: number } | number;
  originalPrice?: { SAR: number; USD: number };
  deliveryTime: { min: number; max: number };
  revisions: number;
  category: string;
  features: { ar: string[]; en: string[] } | string[];
  deliveryFormats: string[];
  digitalDelivery?: {
    title: string;
    url: string;
    image?: string;
    language: string;
    tags: string[];
  }[];
  uiTexts?: {
    quality?: { title: string; subtitle: string };
    details?: { title: string; content: string };
    notice?: { title: string; content: string };
    detailsTitle?: string;
    detailsPoints?: string[];
  };
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();

  const categories = [
    { value: 'all', label: 'جميع الفئات' },
    { value: 'social-media', label: 'وسائل التواصل الاجتماعي' },
    { value: 'branding', label: 'الهوية التجارية' },
    { value: 'web-design', label: 'تصميم المواقع' },
    { value: 'print-design', label: 'التصميم الطباعي' },
    { value: 'cv-templates', label: 'قوالب السيرة الذاتية' },
    { value: 'marketing', label: 'التسويق' },
    { value: 'consulting', label: 'الاستشارات' },
    { value: 'linkedin', label: 'لينكد إن' },
    { value: 'banners', label: 'البانرات' },
    { value: 'content', label: 'المحتوى' },
    { value: 'resumes', label: 'السير الذاتية' },
    { value: 'logos', label: 'الشعارات' },
    { value: 'consultation', label: 'الاستشارة' },
    { value: 'management', label: 'الإدارة' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/admin/services?page=${currentPage}&limit=50&search=${searchText}&category=${selectedCategory === 'all' ? '' : selectedCategory}`, {
        auth: true
      }) as { data: { services: Service[]; pagination: { total: number } } };
      
      setServices(response.data?.services || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      message.error('فشل في تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    
    // Normalize service data for form
    const serviceData = service as any;
    
    // Log the actual structure we're receiving
    if (serviceData.uiTexts) {
    }
    
    const getUiTextValue = (field: any) => {
      if (typeof field === 'object' && field !== null && field.ar) {
        return field.ar;
      }
      return field || '';
    };

    const getNestedValue = (obj: any, path: string, lang: 'ar' | 'en' | null = null) => {
      try {
        const direct = path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
        let value = direct;
        if (value === undefined && obj && obj.uiTexts) {
          const u = obj.uiTexts;
          switch (path) {
            case 'uiTexts.quality.title':
              value = u.quality?.title ?? u.qualityTitle;
              break;
            case 'uiTexts.quality.subtitle':
              value = u.quality?.subtitle ?? u.qualitySubtitle;
              break;
            case 'uiTexts.details.title':
              value = u.details?.title ?? u.detailsTitle;
              break;
            case 'uiTexts.details.content':
              value = u.details?.content ?? u.details;
              break;
            case 'uiTexts.notice.title':
              value = u.notice?.title ?? u.noticeTitle;
              break;
            case 'uiTexts.notice.content':
              value = u.notice?.content ?? u.notice;
              break;
            default:
              value = undefined;
          }
        }
        if (value && typeof value === 'object' && lang) {
          return value[lang] ?? '';
        }
        return value ?? '';
      } catch (e) {
        return '';
      }
    };

    form.setFieldsValue({
      title: {
        ar: getNestedValue(serviceData, 'title', 'ar'),
        en: getNestedValue(serviceData, 'title', 'en'),
      },
      description: {
        ar: getNestedValue(serviceData, 'description', 'ar'),
        en: getNestedValue(serviceData, 'description', 'en'),
      },
      price: {
        SAR: getNestedValue(serviceData, 'price.SAR', null),
        USD: getNestedValue(serviceData, 'price.USD', null),
      },
      originalPrice: serviceData.originalPrice || {},
      deliveryTime: serviceData.deliveryTime || { min: 1, max: 4 },
      revisions: serviceData.revisions || 2,
      category: serviceData.category,
      features: {
        ar: getNestedValue(serviceData, 'features.ar', null) || (Array.isArray(serviceData.features) ? serviceData.features : []),
      },
      deliveryFormats: Array.isArray(serviceData.deliveryFormats) ? serviceData.deliveryFormats : [],
      digitalDelivery: Array.isArray(serviceData.digitalDelivery) ? serviceData.digitalDelivery : [],
      uiTexts: {
        quality: {
          title: getNestedValue(serviceData, 'uiTexts.qualityTitle', 'ar') || serviceData.uiTexts?.qualityTitle?.ar || '',
          subtitle: getNestedValue(serviceData, 'uiTexts.qualitySubtitle', 'ar') || serviceData.uiTexts?.qualitySubtitle?.ar || '',
        },
        details: {
          title: getNestedValue(serviceData, 'uiTexts.detailsTitle', 'ar') || serviceData.uiTexts?.detailsTitle?.ar || '',
          content: getNestedValue(serviceData, 'uiTexts.details', 'ar') || serviceData.uiTexts?.details?.ar || '',
        },
        notice: {
          title: getNestedValue(serviceData, 'uiTexts.noticeTitle', 'ar') || serviceData.uiTexts?.noticeTitle?.ar || '',
          content: getNestedValue(serviceData, 'uiTexts.notice', 'ar') || serviceData.uiTexts?.notice?.ar || '',
        },
        detailsTitle: serviceData.uiTexts?.detailsTitle?.ar || '',
        detailsPoints: serviceData.uiTexts?.detailsPoints || [],
        qualityPoints: serviceData.uiTexts?.qualityPoints || [],
        noticePoints: serviceData.uiTexts?.noticePoints || [],
      },
      order: serviceData.order || 1,
      isActive: serviceData.isActive,
      isFeatured: serviceData.isFeatured,
    });
    
    console.log('🔍 Form values set:', {
      qualityTitle: serviceData.uiTexts?.qualityTitle?.ar,
      qualitySubtitle: serviceData.uiTexts?.qualitySubtitle?.ar,
      detailsTitle: serviceData.uiTexts?.detailsTitle?.ar,
      details: serviceData.uiTexts?.details?.ar,
      noticeTitle: serviceData.uiTexts?.noticeTitle?.ar,
      notice: serviceData.uiTexts?.notice?.ar
    });
    
    setIsModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    try {
      if (!editingService) return;
      
      // Transform form data to match backend schema
      const transformedData = {
        ...values,
        uiTexts: {
          // Convert flat form fields to nested multilingual objects
          detailsTitle: {
            ar: values.uiTexts?.detailsTitle || '',
            en: values.uiTexts?.detailsTitle || ''
          },
          qualityTitle: {
            ar: values.uiTexts?.quality?.title || '',
            en: values.uiTexts?.quality?.title || ''
          },
          qualitySubtitle: {
            ar: values.uiTexts?.quality?.subtitle || '',
            en: values.uiTexts?.quality?.subtitle || ''
          },
          noticeTitle: {
            ar: values.uiTexts?.notice?.title || '',
            en: values.uiTexts?.notice?.title || ''
          },
          notice: {
            ar: values.uiTexts?.notice?.content || '',
            en: values.uiTexts?.notice?.content || ''
          },
          // Keep arrays as they are
          detailsPoints: values.uiTexts?.detailsPoints || [],
          qualityPoints: values.uiTexts?.qualityPoints || [],
          noticePoints: values.uiTexts?.noticePoints || []
        }
      };
      
      
      const response = await apiFetch(`/admin/services/${editingService._id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
        auth: true
      }) as { success: boolean; message?: string };
      
      
      if (response.success) {
        message.success('تم تحديث الخدمة بنجاح');
        setIsModalVisible(false);
        setEditingService(null);
        form.resetFields();
        fetchServices();
      } else {
        message.error(response.message || 'فشل في تحديث الخدمة');
      }
    } catch (error) {
      message.error('فشل في تحديث الخدمة');
    }
  };

  const handleDelete = (serviceId: string) => {
    Modal.confirm({
      title: 'هل أنت متأكد من حذف هذه الخدمة؟',
      content: 'لا يمكن التراجع عن هذا الإجراء',
      okText: 'حذف',
      cancelText: 'إلغاء',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await apiFetch(`/admin/services/${serviceId}`, {
            method: 'DELETE'
          }) as { success: boolean; message?: string };
          if (response.success) {
            message.success('تم حذف الخدمة بنجاح');
            fetchServices();
          }
        } catch (error) {
          message.error('فشل في حذف الخدمة');
        }
      },
    });
  };

  const handleAdd = async (values: any) => {
    try {
      // Transform form data to match backend schema (same as handleUpdate)
      const transformedData = {
        ...values,
        // Ensure price is properly structured
        price: {
          SAR: values.price?.SAR || 0,
          USD: values.price?.USD || 0
        },
        uiTexts: {
          // Convert flat form fields to nested multilingual objects
          detailsTitle: {
            ar: values.uiTexts?.detailsTitle || '',
            en: values.uiTexts?.detailsTitle || ''
          },
          qualityTitle: {
            ar: values.uiTexts?.quality?.title || '',
            en: values.uiTexts?.quality?.title || ''
          },
          qualitySubtitle: {
            ar: values.uiTexts?.quality?.subtitle || '',
            en: values.uiTexts?.quality?.subtitle || ''
          },
          noticeTitle: {
            ar: values.uiTexts?.notice?.title || '',
            en: values.uiTexts?.notice?.title || ''
          },
          notice: {
            ar: values.uiTexts?.notice?.content || '',
            en: values.uiTexts?.notice?.content || ''
          },
          // Keep arrays as they are
          detailsPoints: values.uiTexts?.detailsPoints || [],
          qualityPoints: values.uiTexts?.qualityPoints || [],
          noticePoints: values.uiTexts?.noticePoints || []
        }
      };

      
      const response = await apiFetch('/admin/services', {
        method: 'POST',
        body: JSON.stringify(transformedData),
        auth: true
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        message.success('تم إضافة الخدمة بنجاح');
        setIsModalVisible(false);
        setEditingService(null);
        form.resetFields();
        fetchServices();
      } else {
        message.error(response.message || 'فشل في إضافة الخدمة');
      }
    } catch (error) {
      message.error('فشل في إضافة الخدمة');
          // Convert flat form fields to nested multilingual objects
          detailsTitle: {
            ar: values.uiTexts?.detailsTitle || '',
            en: values.uiTexts?.detailsTitle || ''
          },
          qualityTitle: {
            ar: values.uiTexts?.quality?.title || '',
            en: values.uiTexts?.quality?.title || ''
          },
          qualitySubtitle: {
            ar: values.uiTexts?.quality?.subtitle || '',
            en: values.uiTexts?.quality?.subtitle || ''
          },
          noticeTitle: {
            ar: values.uiTexts?.notice?.title || '',
            en: values.uiTexts?.notice?.title || ''
          },
          notice: {
            ar: values.uiTexts?.notice?.content || '',
            en: values.uiTexts?.notice?.content || ''
          },
          // Keep arrays as they are
          detailsPoints: values.uiTexts?.detailsPoints || [],
          qualityPoints: values.uiTexts?.qualityPoints || [],
          noticePoints: values.uiTexts?.noticePoints || []
        }
      };

      
      const response = await apiFetch('/admin/services', {
        method: 'POST',
        body: JSON.stringify(transformedData),
        auth: true
      }) as { success: boolean; message?: string };
      
      if (response.success) {
        message.success('تم إضافة الخدمة بنجاح');
        setIsModalVisible(false);
        setEditingService(null);
        form.resetFields();
        fetchServices();
      } else {
        message.error(response.message || 'فشل في إضافة الخدمة');
      }
    } catch (error) {
      message.error('فشل في إضافة الخدمة');
    }
  };

  const getServiceTitle = (title: any) => {
    if (typeof title === 'object' && title.ar) {
      return title.ar;
    }
    return title || 'غير محدد';
  };

  const getServicePrice = (price: any) => {
    if (typeof price === 'object' && price.SAR) {
      return `${price.SAR} ر.س`;
    }
    return `${price} ر.س` || 'غير محدد';
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = getServiceTitle(service.title)
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      title: 'الخدمة',
      dataIndex: 'title',
      key: 'title',
      render: (title: any, record: Service) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {record.images && record.images[0] && (
            <img src={record.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
          )}
          <div>
            <div className="font-medium">{getServiceTitle(title)}</div>
            <div className="text-sm text-gray-500">#{record._id.slice(-6)}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'الفئة',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const categoryObj = categories.find(cat => cat.value === category);
        return <Tag color="blue">{categoryObj?.label || category}</Tag>;
      },
    },
    {
      title: 'السعر',
      dataIndex: 'price',
      key: 'price',
      render: (price: any) => (
        <span className="font-medium text-green-600">
          {getServicePrice(price)}
        </span>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'مميز',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      render: (isFeatured: boolean) => (
        <Tag color={isFeatured ? 'gold' : 'default'}>
          {isFeatured ? 'مميز' : 'عادي'}
        </Tag>
      ),
    },
    {
      title: 'تاريخ الإنشاء',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ar-SA'),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: Service) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => window.open(`/services/${record._id}`, '_blank')}
          >
            عرض
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            تعديل
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record._id)}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">إدارة الخدمات</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingService(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            إضافة خدمة جديدة
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Search
            placeholder="البحث في الخدمات..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="w-full sm:w-48"
          >
            {categories.map(cat => (
              <Option key={cat.value} value={cat.value}>{cat.label}</Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredServices.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} خدمة`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingService(null);
        }}
        footer={null}
        width={1400}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', padding: '16px' } }}
        className="service-edit-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingService ? handleUpdate : handleAdd}
          className="mt-4"
        >
          <Tabs 
            defaultActiveKey="1" 
            type="card"
            items={[
              {
                key: "1",
                label: <span><FileTextOutlined /> المعلومات الأساسية</span>,
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name={['title', 'ar']}
                          label="عنوان الخدمة (عربي)"
                          rules={[{ required: true, message: 'يرجى إدخال عنوان الخدمة' }]}
                        >
                          <Input placeholder="عنوان الخدمة" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name={['title', 'en']}
                          label="عنوان الخدمة (إنجليزي)"
                        >
                          <Input placeholder="Service Title" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name={['description', 'ar']}
                          label="وصف الخدمة (عربي)"
                          rules={[{ required: true, message: 'يرجى إدخال وصف الخدمة' }]}
                        >
                          <Input.TextArea rows={4} placeholder="وصف تفصيلي للخدمة" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name={['description', 'en']}
                          label="وصف الخدمة (إنجليزي)"
                        >
                          <Input.TextArea rows={4} placeholder="Service Description" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="category"
                          label="الفئة"
                          rules={[{ required: true, message: 'يرجى اختيار الفئة' }]}
                        >
                          <Select 
                            placeholder="اختر الفئة"
                            showSearch
                            allowClear
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={categories.slice(1).map(cat => ({
                              value: cat.value,
                              label: cat.label
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="order" label="ترتيب العرض">
                          <InputNumber min={1} placeholder="ترتيب الخدمة" className="w-full" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <div className="flex gap-4 pt-8">
                          <Form.Item name="isActive" valuePropName="checked">
                            <div className="flex items-center gap-2">
                              <Switch />
                              <span className="mr-2">نشطة</span>
                            </div>
                          </Form.Item>
                          <Form.Item name="isFeatured" valuePropName="checked">
                            <div className="flex items-center gap-2">
                              <Switch />
                              <span className="mr-2">مميزة</span>
                            </div>
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </>
                )
              },
              {
                key: "3",
                label: <span><StarOutlined /> الميزات وصيغ التسليم</span>,
                children: (
                  <>
                    <Form.Item label="ميزات الخدمة (عربي)">
                      <Form.List name={['features', 'ar']}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                <Form.Item
                                  {...restField}
                                  name={[name]}
                                  rules={[{ required: true, message: 'أدخل الميزة' }]}
                                >
                                  <Input placeholder="ميزة الخدمة" />
                                </Form.Item>
                                <Button type="text" danger onClick={() => remove(name)}>
                                  <DeleteOutlined />
                                </Button>
                              </Space>
                            ))}
                            <Form.Item>
                              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                إضافة ميزة
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>

                    <Form.Item label="صيغ التسليم">
                      <Form.List name="deliveryFormats">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                <Form.Item
                                  {...restField}
                                  name={[name]}
                                  rules={[{ required: true, message: 'أدخل صيغة التسليم' }]}
                                >
                                  <Input placeholder="مثل: PSD, AI, PNG" />
                                </Form.Item>
                                <Button type="text" danger onClick={() => remove(name)}>
                                  <DeleteOutlined />
                                </Button>
                              </Space>
                            ))}
                            <Form.Item>
                              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                إضافة صيغة تسليم
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>
                  </>
                )
              },

              {
                key: "4",
                label: <span><SettingOutlined /> النصوص المخصصة</span>,
                children: (
                  <div className="space-y-6">
                    {/* قسم تفاصيل الخدمة - الأهم */}
                    <Card size="small" className="border-l-4 border-l-green-500 bg-green-50/30">
                      <Title level={5} className="text-green-600 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        قسم تفاصيل الخدمة الرئيسي
                      </Title>
                  
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item 
                            name={['uiTexts', 'detailsTitle']} 
                            label={<span className="font-medium">عنوان القسم</span>}
                          >
                            <Input 
                              placeholder="تفاصيل الخدمة" 
                              className="h-10"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                  
                  <Form.Item 
                    label={<span className="font-medium">النقاط التوضيحية</span>}
                    className="mb-0"
                  >
                    <Form.List name={['uiTexts', 'detailsPoints']}>
                      {(fields, { add, remove }) => (
                        <div className="space-y-2">
                          {fields.map(({ key, name, ...restField }, index) => (
                            <div key={key} className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded">
                              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-xs mt-1">
                                {index + 1}
                              </div>
                              <Form.Item
                                {...restField}
                                name={[name]}
                                rules={[{ required: true, message: 'أدخل النقطة' }]}
                                className="flex-1 mb-0"
                              >
                                <Input.TextArea 
                                  rows={2} 
                                  placeholder={`النقطة ${index + 1}`}
                                  className="resize-none"
                                />
                              </Form.Item>
                              <Button 
                                type="text" 
                                danger 
                                onClick={() => remove(name)}
                                className="flex-shrink-0"
                                icon={<DeleteOutlined />}
                                size="small"
                              />
                            </div>
                          ))}
                          <Button 
                            type="dashed" 
                            onClick={() => add()} 
                            block 
                            icon={<PlusOutlined />}
                            className="h-10 border-green-300 text-green-600"
                          >
                            إضافة نقطة
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </Form.Item>
                </Card>

                {/* الأقسام الأخرى */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" className="border-l-4 border-l-purple-500 bg-purple-50/30 h-full">
                      <Title level={5} className="text-purple-600 mb-3">نصوص الجودة</Title>
                      <Form.Item 
                        name={['uiTexts', 'quality', 'title']} 
                        label="العنوان الرئيسي"
                        className="mb-3"
                      >
                        <Input placeholder="جودة احترافية" />
                      </Form.Item>
                      <Form.Item 
                        name={['uiTexts', 'quality', 'subtitle']} 
                        label="العنوان الفرعي"
                        className="mb-0"
                      >
                        <Input placeholder="بصمة إبداعية مميزة" />
                      </Form.Item>
                      <Form.Item 
                        label={<span className="font-medium">نقاط الجودة</span>}
                      >
                        <Form.List name={['uiTexts', 'qualityPoints']}>
                          {(fields, { add, remove }) => (
                            <div className="space-y-2">
                              {fields.map(({ key, name, ...restField }, index) => (
                                <div key={key} className="flex items-start gap-2">
                                  <Form.Item
                                    {...restField}
                                    name={[name]}
                                    className="flex-1 mb-0"
                                  >
                                    <Input placeholder={`نقطة جودة ${index + 1}`} />
                                  </Form.Item>
                                  <Button 
                                    type="text" 
                                    danger 
                                    onClick={() => remove(name)}
                                    icon={<DeleteOutlined />}
                                    size="small"
                                  />
                                </div>
                              ))}
                              <Button 
                                type="dashed" 
                                onClick={() => add()} 
                                block 
                                icon={<PlusOutlined />}
                                size="small"
                              >
                                إضافة نقطة جودة
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card size="small" className="border-l-4 border-l-orange-500 bg-orange-50/30 h-full">
                      <Title level={5} className="text-orange-600 mb-3">التنويه المهم</Title>
                      <Form.Item 
                        name={['uiTexts', 'notice', 'title']} 
                        label="عنوان التنويه"
                        className="mb-3"
                      >
                        <Input placeholder="تنويه هام" />
                      </Form.Item>
                      {/* <Form.Item 
                        name={['uiTexts', 'notice', 'content']} 
                        label="نص التنويه"
                        className="mb-3"
                      >
                        <Input.TextArea rows={2} placeholder="نص التنويه..." />
                      </Form.Item> */}
                      <Form.Item 
                        label={<span className="font-medium">نقاط التنويه</span>}
                        className="mb-0"
                      >
                        <Form.List name={['uiTexts', 'noticePoints']}>
                          {(fields, { add, remove }) => (
                            <div className="space-y-2">
                              {fields.map(({ key, name, ...restField }, index) => (
                                <div key={key} className="flex items-start gap-2">
                                  <Form.Item
                                    {...restField}
                                    name={[name]}
                                    className="flex-1 mb-0"
                                  >
                                    <Input placeholder={`نقطة تنويه ${index + 1}`} />
                                  </Form.Item>
                                  <Button 
                                    type="text" 
                                    danger 
                                    onClick={() => remove(name)}
                                    icon={<DeleteOutlined />}
                                    size="small"
                                  />
                                </div>
                              ))}
                              <Button 
                                type="dashed" 
                                onClick={() => add()} 
                                block 
                                icon={<PlusOutlined />}
                                size="small"
                              >
                                إضافة نقطة تنويه
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>
                  </div>
                )
              }
            ]}
          />

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={() => setIsModalVisible(false)} size="large">
              إلغاء
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              className="bg-gradient-to-r from-purple-600 to-blue-600 border-0"
            >
              {editingService ? 'تحديث الخدمة' : 'إضافة الخدمة'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default ServicesManagement;
