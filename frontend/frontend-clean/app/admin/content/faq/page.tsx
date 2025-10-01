'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, message, Form, Space, Divider, Table, Modal, Row, Col, Radio, Tabs } from 'antd';
import { SaveOutlined, EyeOutlined, ReloadOutlined, QuestionCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAdminAuth } from '../../../../contexts/admin-auth-context';
import { apiFetch } from '../../../../lib/api';

const { TextArea } = Input;

interface FAQ {
  _id: string;
  question: {
    ar: string;
    en: string;
  };
  answer: {
    ar: string;
    en: string;
  };
  category: string;
  status: 'active' | 'inactive';
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQPageSettings {
  pageTitle: string;
  pageDescription: string;
  introText: string;
  contactText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  canonicalUrl: string;
}

export default function FAQManagementPage() {
  const { admin, token } = useAdminAuth();
  const [settingsForm] = Form.useForm();
  const [faqForm] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [pageSettings, setPageSettings] = useState<FAQPageSettings>({
    pageTitle: 'الأسئلة الشائعة',
    pageDescription: 'إجابات شاملة على أكثر الأسئلة التي يطرحها عملاؤنا',
    introText: 'نجمع هنا أكثر الأسئلة شيوعاً من عملائنا مع إجابات مفصلة لمساعدتك',
    contactText: 'لم تجد إجابة؟ تواصل معنا مباشرة وسنجيب على استفسارك',
    seoTitle: 'الأسئلة الشائعة | بصمة تصميم - إجابات شاملة حول خدمات التصميم',
    seoDescription: 'إجابات شاملة على أكثر الأسئلة شيوعاً حول خدماتنا في التصميم والمحتوى الرقمي. استفسارات العملاء والحلول السريعة.',
    seoKeywords: 'أسئلة شائعة، استفسارات، خدمات التصميم، دعم العملاء، بصمة تصميم، إجابات سريعة',
    ogImage: '/faq-og-image.jpg',
    canonicalUrl: 'https://basmatdesign.com/faq'
  });

  const categories = [
    { value: 'general', label: 'أسئلة عامة' },
    { value: 'pricing', label: 'الأسعار والدفع' },
    { value: 'design', label: 'التصميم والجودة' },
    { value: 'delivery', label: 'التسليم والتعديلات' },
    { value: 'files', label: 'الملفات والصيغ' }
  ];

  useEffect(() => {
    if (admin && token) {
      loadData();
    }
  }, [admin, token]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPageSettings(),
        loadFAQs()
      ]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadPageSettings = async () => {
    try {
      const response = await apiFetch('/settings?category=faq', {
        auth: true
      }) as any;
      
      // Handle different response structures
      let settingsArray = [];
      if (response?.success && response?.data) {
        settingsArray = response.data;
      } else if (Array.isArray(response)) {
        settingsArray = response;
      } else if (response?.data && Array.isArray(response.data)) {
        settingsArray = response.data;
      }
      
      if (settingsArray && Array.isArray(settingsArray)) {
        const settings: Record<string, any> = {};
        settingsArray.forEach((item: any) => {
          settings[item.key] = item.value;
        });
        
        setPageSettings(prev => ({ ...prev, ...settings }));
        settingsForm.setFieldsValue(settings);
      }
    } catch (error) {
    }
  };

  const loadFAQs = async () => {
    try {
      const response = await apiFetch('/admin/faqs', {
        headers: { 'Authorization': `Bearer ${token}` }
      }) as any;
      
      if (response?.success && response?.data?.faqs) {
        setFaqs(response.data.faqs);
      }
    } catch (error) {
    }
  };

  const savePageSettings = async () => {
    setSaving(true);
    try {
      const formData = settingsForm.getFieldsValue();
      
      const response = await apiFetch('/admin/settings/faq', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(formData)
      }) as any;

      if (response?.success) {
        message.success('تم حفظ إعدادات الصفحة بنجاح');
        setPageSettings(prev => ({ ...prev, ...formData }));
        // إعادة تحميل البيانات للتأكد من الحفظ
        await loadPageSettings();
      } else {
        message.error('فشل في حفظ إعدادات الصفحة');
      }
    } catch (error) {
      message.error('فشل في حفظ إعدادات الصفحة');
    } finally {
      setSaving(false);
    }
  };

  const saveFAQ = async () => {
    try {
      const values = await faqForm.validateFields();
      // Normalize multilingual structure so backend doesn't 500 when EN fields are hidden
      const normalized = { ...values } as any;
      // Question
      if (typeof normalized.question === 'string') {
        normalized.question = { ar: normalized.question, en: normalized.question };
      } else if (normalized.question && typeof normalized.question === 'object') {
        const ar = normalized.question.ar || '';
        const en = normalized.question.en || ar;
        normalized.question = { ar, en };
      }
      // Answer
      if (typeof normalized.answer === 'string') {
        normalized.answer = { ar: normalized.answer, en: normalized.answer };
      } else if (normalized.answer && typeof normalized.answer === 'object') {
        const ar = normalized.answer.ar || '';
        const en = normalized.answer.en || ar;
        normalized.answer = { ar, en };
      }
      const method = editingFaq ? 'PUT' : 'POST';
      const endpoint = editingFaq ? `/admin/faqs/${editingFaq._id}` : '/admin/faqs';

      const response = await apiFetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(normalized)
      }) as any;

      if (response.success) {
        message.success(editingFaq ? 'تم تحديث السؤال بنجاح' : 'تم إضافة السؤال بنجاح');
        setIsModalVisible(false);
        setEditingFaq(null);
        faqForm.resetFields();
        await loadFAQs();
      } else {
        message.error('فشل في حفظ السؤال');
      }
    } catch (error) {
      message.error('فشل في حفظ السؤال');
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      const response = await apiFetch(`/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }) as any;

      if (response.success) {
        message.success('تم حذف السؤال بنجاح');
        await loadFAQs();
      } else {
        message.error('فشل في حذف السؤال');
      }
    } catch (error) {
      message.error('فشل في حذف السؤال');
    }
  };

  const openEditModal = (faq?: FAQ) => {
    setEditingFaq(faq || null);
    if (faq) {
      faqForm.setFieldsValue(faq);
    } else {
      faqForm.resetFields();
      faqForm.setFieldsValue({
        order: faqs.length + 1,
        status: 'active'
      });
    }
    setIsModalVisible(true);
  };

  const openAddModal = () => {
    openEditModal();
  };

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-blue-500">❓</span>
          السؤال
        </div>
      ),
      dataIndex: ['question', 'ar'],
      key: 'question',
      ellipsis: true,
      render: (text: string) => (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">Q</span>
          </div>
          <div className="font-medium text-gray-800 line-clamp-2 leading-relaxed">
            {text}
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-green-500">🏷️</span>
          التصنيف
        </div>
      ),
      dataIndex: 'category',
      key: 'category',
      width: 180,
      render: (category: string) => {
        const cat = categories.find(c => c.value === category);
        const colors = {
          'general': 'bg-blue-100 text-blue-800 border-blue-200',
          'pricing': 'bg-green-100 text-green-800 border-green-200',
          'design': 'bg-purple-100 text-purple-800 border-purple-200',
          'delivery': 'bg-orange-100 text-orange-800 border-orange-200',
          'files': 'bg-pink-100 text-pink-800 border-pink-200'
        };
        const colorClass = colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
        
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${colorClass}`}>
            <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
            {cat ? cat.label : category}
          </div>
        );
      },
    },
    {
      title: (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <span className="text-amber-500">📊</span>
          الترتيب
        </div>
      ),
      dataIndex: 'order',
      key: 'order',
      width: 100,
      align: 'center' as const,
      render: (order: number) => (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{order}</span>
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
      width: 180,
      align: 'center' as const,
      render: (_: any, record: FAQ) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 hover:from-blue-600 hover:to-blue-700 shadow-md"
            onClick={() => openEditModal(record)}
          >
            تعديل
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            className="bg-gradient-to-r from-red-500 to-red-600 border-0 hover:from-red-600 hover:to-red-700 shadow-md"
            onClick={() => {
              Modal.confirm({
                title: 'حذف السؤال',
                content: 'هل أنت متأكد من حذف هذا السؤال؟',
                onOk: () => deleteFAQ(record._id),
              });
            }}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  if (!admin) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login?message=redirect';
    }
    return null;
  }

  return (
    <div className={isMobile ? "p-4" : "p-6"}>
      <div className="mb-6">
        <h1 className={`font-bold text-gray-900 mb-2 flex items-center gap-2 ${
          isMobile ? 'text-xl' : 'text-2xl'
        }`}>
          <QuestionCircleOutlined />
          إدارة الأسئلة الشائعة
        </h1>
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
          تحكم في إعدادات صفحة الأسئلة الشائعة وإدارة الأسئلة والإجابات
        </p>
      </div>

      {isMobile ? (
        // Mobile Layout with Tabs
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'settings',
              label: 'إعدادات الصفحة',
              children: (
                <Card className="bg-blue-50">
                  <Form form={settingsForm} layout="vertical" initialValues={pageSettings} key={JSON.stringify(pageSettings)}>
                    <Form.Item name="pageTitle" label="عنوان الصفحة">
                      <Input placeholder="الأسئلة الشائعة" />
                    </Form.Item>
                    <Form.Item name="pageDescription" label="وصف الصفحة">
                      <Input placeholder="إجابات شاملة على أكثر الأسئلة..." />
                    </Form.Item>
                    <Form.Item name="introText" label="النص التمهيدي">
                      <TextArea rows={3} placeholder="نجمع هنا أكثر الأسئلة شيوعاً..." />
                    </Form.Item>
                    <Form.Item name="contactText" label="نص التواصل">
                      <TextArea rows={2} placeholder="لم تجد إجابة؟ تواصل معنا..." />
                    </Form.Item>
                    <Form.Item name="seoTitle" label="عنوان SEO">
                      <Input placeholder="الأسئلة الشائعة | بصمة تصميم..." />
                    </Form.Item>
                    <Form.Item name="seoDescription" label="وصف SEO">
                      <TextArea rows={2} placeholder="إجابات شاملة على أكثر الأسئلة..." />
                    </Form.Item>
                    <Form.Item name="seoKeywords" label="كلمات مفتاحية">
                      <Input placeholder="أسئلة شائعة، استفسارات..." />
                    </Form.Item>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saving}
                        onClick={savePageSettings}
                        className="flex-1"
                      >
                        حفظ الإعدادات
                      </Button>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={loadData}
                        loading={loading}
                      >
                        تحديث
                      </Button>
                    </div>
                  </Form>
                </Card>
              )
            },
            {
              key: 'faqs',
              label: 'الأسئلة والإجابات',
              children: (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">قائمة الأسئلة</h3>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => openAddModal()}
                      size="small"
                    >
                      إضافة سؤال
                    </Button>
                  </div>
                  
                  {/* Mobile FAQ Cards */}
                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <Card key={faq._id} size="small" className="border-l-4 border-l-purple-500">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900 text-sm leading-tight">
                              {faq.question.ar}
                            </h4>
                            <div className="flex gap-1 ml-2">
                              <Button
                                type="primary"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => openEditModal(faq)}
                              />
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                onClick={() => {
                                  Modal.confirm({
                                    title: 'حذف السؤال',
                                    content: 'هل أنت متأكد من حذف هذا السؤال؟',
                                    onOk: () => deleteFAQ(faq._id),
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs line-clamp-2">
                            {faq.answer.ar}
                          </p>
                          <div className="flex justify-between items-center text-xs">
                            <span className={`px-2 py-1 rounded-full text-white ${
                              faq.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                            }`}>
                              {faq.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                            <span className="text-gray-500">ترتيب: {faq.order}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            }
          ]}
        />
      ) : (
        // Desktop Layout
        <div className="space-y-6">
          {/* Settings Card */}
          <Card title="إعدادات الصفحة" className="bg-blue-50">
            <Form form={settingsForm} layout="vertical" initialValues={pageSettings} key={JSON.stringify(pageSettings)}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="pageTitle" label="عنوان الصفحة">
                    <Input placeholder="الأسئلة الشائعة" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="pageDescription" label="وصف الصفحة">
                    <Input placeholder="إجابات شاملة على أكثر الأسئلة..." />
                  </Form.Item>
                </Col>
              </Row>

            <Form.Item name="introText" label="النص التمهيدي">
              <TextArea rows={2} placeholder="نجمع هنا أكثر الأسئلة شيوعاً..." />
            </Form.Item>

            <Form.Item name="contactText" label="نص التواصل">
              <TextArea rows={2} placeholder="لم تجد إجابة؟ تواصل معنا..." />
            </Form.Item>

            {/* SEO Settings - Hidden but preserved */}
            <div style={{ display: 'none' }}>
              <Divider>إعدادات SEO</Divider>

              <Form.Item name="seoTitle" label="عنوان الصفحة (SEO)">
                <Input placeholder="الأسئلة الشائعة | بصمة تصميم..." />
              </Form.Item>

              <Form.Item name="seoDescription" label="وصف الصفحة (SEO)">
                <TextArea rows={3} placeholder="إجابات شاملة على أكثر الأسئلة شيوعاً..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="seoKeywords" label="الكلمات المفتاحية">
                    <Input placeholder="أسئلة شائعة، استفسارات..." />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="ogImage" label="صورة المشاركة">
                    <Input placeholder="/faq-og-image.jpg" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="canonicalUrl" label="الرابط الأساسي">
                    <Input placeholder="https://basmatdesign.com/faq" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                onClick={savePageSettings}
                loading={saving}
              >
                حفظ الإعدادات
              </Button>
            </div>
          </Form>
        </Card>

        {/* FAQs Management Card */}
        <Card 
          title="إدارة الأسئلة والإجابات" 
          className="bg-green-50"
          extra={
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => openEditModal()}
              >
                إضافة سؤال جديد
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadFAQs}
                loading={loading}
              >
                تحديث
              </Button>
              <Button 
                icon={<EyeOutlined />}
                href="/faq"
                target="_blank"
              >
                معاينة الصفحة
              </Button>
            </Space>
          }
        >
          <div className="faq-table-wrapper">
            <style jsx>{`
              .faq-table-wrapper .ant-table {
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                border: 1px solid #e5e7eb;
              }
              
              .faq-table-wrapper .ant-table-thead > tr > th {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border-bottom: 2px solid #e2e8f0;
                font-weight: 600;
                color: #374151;
                padding: 16px;
                position: relative;
              }
              
              .faq-table-wrapper .ant-table-thead > tr > th::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
              }
              
              .faq-table-wrapper .ant-table-tbody > tr > td {
                padding: 20px 16px;
                border-bottom: 1px solid #f1f5f9;
                vertical-align: top;
              }
              
              .faq-table-wrapper .ant-table-tbody > tr:hover > td {
                background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
                transform: scale(1.001);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              
              .faq-table-wrapper .ant-table-tbody > tr {
                transition: all 0.3s ease;
              }
              
              .faq-table-wrapper .ant-table-tbody > tr:nth-child(even) {
                background-color: rgba(248, 250, 252, 0.5);
              }
              
              .faq-table-wrapper .ant-table-tbody > tr:nth-child(odd) {
                background-color: rgba(255, 255, 255, 1);
              }
              
              .faq-table-wrapper .ant-table-pagination {
                margin-top: 20px;
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
            `}</style>
            
            <Table
              columns={columns}
              dataSource={faqs}
              rowKey="_id"
              loading={loading}
              size="middle"
              pagination={{
                total: faqs.length,
                pageSize: 8,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      📋 المجموع: {total} سؤال
                    </span>
                    <span className="text-sm">
                      ({range[0]}-{range[1]} من {total})
                    </span>
                  </div>
                ),
                pageSizeOptions: ['5', '8', '10', '20'],
                className: "custom-pagination"
              }}
            />
          </div>
        </Card>
      </div>
      )}

      {/* FAQ Modal */}
      <Modal
        title={editingFaq ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
        open={isModalVisible}
        onOk={saveFAQ}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingFaq(null);
          faqForm.resetFields();
        }}
        okText="حفظ"
        cancelText="إلغاء"
        width={isMobile ? '95%' : 800}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form form={faqForm} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name={['question', 'ar']} 
                label="السؤال (عربي)" 
                rules={[{ required: true, message: 'يرجى إدخال السؤال باللغة العربية' }]}
              >
                <TextArea rows={3} placeholder="ما هي مدة تنفيذ المشروع؟" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name={['answer', 'ar']} 
                label="الإجابة (عربي)" 
                rules={[{ required: true, message: 'يرجى إدخال الإجابة باللغة العربية' }]}
              >
                <TextArea rows={5} placeholder="مدة تنفيذ المشروع تتراوح بين..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={isMobile ? 24 : 16}>
              <Form.Item 
                name="category" 
                label="التصنيف"
                rules={[{ required: true, message: 'يرجى اختيار التصنيف' }]}
              >
                <Radio.Group className="w-full">
                  <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {categories.map(cat => (
                      <Radio key={cat.value} value={cat.value} className="p-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50">
                        <span className="font-medium">{cat.label}</span>
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 8}>
              <Form.Item name="order" label="ترتيب العرض" initialValue={faqs.length + 1}>
                <Input type="number" min={1} />
              </Form.Item>
              <Form.Item name="status" initialValue="active" hidden>
                <Input type="hidden" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
