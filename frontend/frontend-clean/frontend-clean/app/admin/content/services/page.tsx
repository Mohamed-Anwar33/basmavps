'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, message, Form, Space, Divider, Row, Col } from 'antd';
import { SaveOutlined, EyeOutlined, ReloadOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useAdminAuth } from '../../../../contexts/admin-auth-context';
import { apiFetch } from '../../../../lib/api';

const { TextArea } = Input;

interface ServicesPageData {
  heroTitle: string;
  heroDescription: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  canonicalUrl: string;
}

export default function ServicesManagementPage() {
  const { admin, token } = useAdminAuth();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [servicesData, setServicesData] = useState<ServicesPageData>({
    heroTitle: 'خدماتنا المتميزة',
    heroDescription: 'نقدم مجموعة شاملة من الخدمات المتخصصة في التصميم والتطوير لمساعدتك في تحقيق أهدافك الرقمية',
    seoTitle: 'خدماتنا | بصمة تصميم - تصميم الهوية البصرية والسوشيال ميديا والمحتوى الرقمي',
    seoDescription: 'اكتشف مجموعة خدماتنا الإبداعية في التصميم والمحتوى والهوية البصرية. خدمات تصميم الشعارات، إدارة السوشيال ميديا، تصميم البنرات الإعلانية، والمحتوى الرقمي الاحترافي في السعودية.',
    seoKeywords: 'خدمات التصميم، تصميم الهوية البصرية، تصميم الشعارات، إدارة السوشيال ميديا، تصميم البنرات، محتوى رقمي، خدمات إبداعية، تصميم احترافي',
    ogImage: '/services-og-image.jpg',
    canonicalUrl: 'https://basmatdesign.com/services'
  });

  useEffect(() => {
    if (admin && token) {
      loadData();
    }
  }, [admin, token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/settings?category=services', {
        headers: { 'Authorization': `Bearer ${token}` }
      }) as any;
      
      if (response && Array.isArray(response)) {
        const settings: Record<string, any> = {};
        response.forEach((item: any) => {
          settings[item.key] = item.value;
        });
        
        setServicesData(prev => ({ ...prev, ...settings }));
        form.setFieldsValue({ ...servicesData, ...settings });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      const formData = form.getFieldsValue();
      
      const response = await apiFetch('/admin/settings/services', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      }) as any;

      if (response.success) {
        message.success('تم حفظ البيانات بنجاح');
        setServicesData(prev => ({ ...prev, ...formData }));
      } else {
        message.error('فشل في حفظ البيانات');
      }
    } catch (error) {
      message.error('فشل في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  if (!admin) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login?message=redirect';
    }
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AppstoreOutlined />
          إدارة صفحة الخدمات
        </h1>
        <p className="text-gray-600">
          تحكم في محتوى صفحة الخدمات وإعدادات SEO
        </p>
      </div>

      <Card>
        <div className="mb-4">
          <Space>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={saveData}
              loading={saving}
            >
              حفظ التغييرات
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
            >
              إعادة تحميل
            </Button>
            <Button 
              icon={<EyeOutlined />}
              href="/services"
              target="_blank"
            >
              معاينة الصفحة
            </Button>
          </Space>
        </div>

        <Divider />

        <Form form={form} layout="vertical" initialValues={servicesData}>
          <div className="space-y-6">
            {/* Hero Section */}
            <Card size="small" title="القسم الرئيسي" className="bg-blue-50">
              <Form.Item name="heroTitle" label="عنوان الصفحة">
                <Input placeholder="خدماتنا المتميزة" />
              </Form.Item>

              <Form.Item name="heroDescription" label="وصف الصفحة">
                <TextArea rows={4} placeholder="نقدم مجموعة شاملة من الخدمات المتخصصة..." />
              </Form.Item>
            </Card>

            {/* SEO Settings - Hidden but preserved */}
            <div style={{ display: 'none' }}>
              <Card size="small" title="إعدادات SEO" className="bg-green-50">
                <Form.Item name="seoTitle" label="عنوان الصفحة (SEO)">
                  <Input placeholder="خدماتنا | بصمة تصميم - تصميم الهوية البصرية..." />
                </Form.Item>

                <Form.Item name="seoDescription" label="وصف الصفحة (SEO)">
                  <TextArea rows={3} placeholder="اكتشف مجموعة خدماتنا الإبداعية في التصميم..." />
                </Form.Item>

                <Form.Item name="seoKeywords" label="الكلمات المفتاحية">
                  <TextArea rows={2} placeholder="خدمات التصميم، تصميم الهوية البصرية، تصميم الشعارات..." />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="ogImage" label="صورة المشاركة">
                      <Input placeholder="/services-og-image.jpg" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="canonicalUrl" label="الرابط الأساسي">
                      <Input placeholder="https://basmatdesign.com/services" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </div>

            {/* Services Management Note */}
            <Card size="small" title="إدارة الخدمات الفردية" className="bg-yellow-50">
              <p className="text-gray-600 mb-4">
                لإدارة الخدمات الفردية (إضافة، تعديل، حذف الخدمات)، يرجى الانتقال إلى:
              </p>
              <Space>
                <Button type="link" href="/admin/services" target="_blank">
                  إدارة الخدمات الفردية
                </Button>
                <Button type="link" href="/admin/services/create" target="_blank">
                  إضافة خدمة جديدة
                </Button>
              </Space>
            </Card>
          </div>
        </Form>
      </Card>
    </div>
  );
}
