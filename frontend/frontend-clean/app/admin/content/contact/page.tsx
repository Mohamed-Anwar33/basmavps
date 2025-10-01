'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, notification, Form, Space, Divider, Row, Col, Tabs, Typography } from 'antd';
import { SaveOutlined, EyeOutlined, ReloadOutlined, PhoneOutlined, SettingOutlined, GlobalOutlined, MessageOutlined, TeamOutlined } from '@ant-design/icons';
import { useAdminAuth } from '../../../../contexts/admin-auth-context';
import { apiFetch } from '../../../../lib/api';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function ContactManagementPage() {
  const { admin, token } = useAdminAuth();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contactData, setContactData] = useState<any>(null);
  const EN_DISABLED = true; // Hide/disable English-only fields per request

  useEffect(() => {
    if (admin && token) {
      loadData();
    }
  }, [admin, token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/admin/contact-page', {
        auth: true
      }) as any;
      
      if (response?.success && response.data) {
        setContactData(response.data);
        
        // Transform data for form
        // Normalize SEO keywords from possible shapes: string | string[] | { ar?: string[] | string; en?: string[] | string }
        const kw = response.data.seoSettings?.keywords as any;
        const kwAr = Array.isArray(kw?.ar)
          ? kw.ar.join(', ')
          : Array.isArray(kw)
            ? kw.join(', ')
            : typeof kw?.ar === 'string'
              ? kw.ar
              : typeof kw === 'string'
                ? kw
                : '';
        const kwEn = Array.isArray(kw?.en)
          ? kw.en.join(', ')
          : typeof kw?.en === 'string'
            ? kw.en
            : '';

        const formData = {
          // Hero Section
          heroTitleAr: response.data.heroTitle?.ar || '',
          heroTitleEn: response.data.heroTitle?.en || '',
          heroSubtitleAr: response.data.heroSubtitle?.ar || '',
          heroSubtitleEn: response.data.heroSubtitle?.en || '',
          
          // Contact Info
          whatsappLink: response.data.contactInfo?.whatsappLink || '',
          email: response.data.contactInfo?.email || '',
          workingHoursAr: response.data.contactInfo?.workingHours?.ar || '',
          workingHoursEn: response.data.contactInfo?.workingHours?.en || '',
          
          // Social Media
          instagram: response.data.socialMediaSection?.platforms?.instagram || '',
          twitter: response.data.socialMediaSection?.platforms?.twitter || '',
          linkedin: response.data.socialMediaSection?.platforms?.linkedin || '',
          tiktok: response.data.socialMediaSection?.platforms?.tiktok || '',
          
          // Important Notes
          note1Ar: response.data.importantNotesSection?.notes?.[0]?.ar || '',
          note1En: response.data.importantNotesSection?.notes?.[0]?.en || '',
          note2Ar: response.data.importantNotesSection?.notes?.[1]?.ar || '',
          note2En: response.data.importantNotesSection?.notes?.[1]?.en || '',
          note3Ar: response.data.importantNotesSection?.notes?.[2]?.ar || '',
          note3En: response.data.importantNotesSection?.notes?.[2]?.en || '',
          
          // SEO
          seoTitleAr: response.data.seoSettings?.pageTitle?.ar || '',
          seoTitleEn: response.data.seoSettings?.pageTitle?.en || '',
          seoDescriptionAr: response.data.seoSettings?.metaDescription?.ar || '',
          seoDescriptionEn: response.data.seoSettings?.metaDescription?.en || '',
          seoKeywordsAr: kwAr,
          seoKeywordsEn: kwEn,
          ogImage: response.data.seoSettings?.openGraph?.image || '',
          canonicalUrl: response.data.seoSettings?.canonicalUrl || ''
        };
        
        form.setFieldsValue(formData);
      }
    } catch (error) {
      notification.error({
        message: 'خطأ',
        description: 'فشل في تحميل البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      const formData = form.getFieldsValue();
      
      // Transform form data to backend structure
      const backendData = {
        heroTitle: { ar: formData.heroTitleAr, en: formData.heroTitleEn },
        heroSubtitle: { ar: formData.heroSubtitleAr, en: formData.heroSubtitleEn },
        contactInfo: {
          whatsappLink: formData.whatsappLink,
          email: formData.email,
          workingHours: { ar: formData.workingHoursAr, en: formData.workingHoursEn }
        },
        socialMediaSection: {
          platforms: {
            instagram: formData.instagram,
            twitter: formData.twitter,
            linkedin: formData.linkedin,
            tiktok: formData.tiktok
          }
        },
        importantNotesSection: {
          notes: [
            { ar: formData.note1Ar, en: formData.note1En },
            { ar: formData.note2Ar, en: formData.note2En },
            { ar: formData.note3Ar, en: formData.note3En }
          ]
        },
        seoSettings: {
          pageTitle: { ar: formData.seoTitleAr || '', en: formData.seoTitleEn || '' },
          metaDescription: { ar: formData.seoDescriptionAr || '', en: formData.seoDescriptionEn || '' },
          keywords: {
            ar: Array.isArray(formData.seoKeywordsAr)
              ? (formData.seoKeywordsAr as string[]).map((k) => String(k).trim()).filter(Boolean)
              : String(formData.seoKeywordsAr || '')
                  .split(',')
                  .map((k: string) => k.trim())
                  .filter(Boolean),
            en: Array.isArray(formData.seoKeywordsEn)
              ? (formData.seoKeywordsEn as string[]).map((k) => String(k).trim()).filter(Boolean)
              : String(formData.seoKeywordsEn || '')
                  .split(',')
                  .map((k: string) => k.trim())
                  .filter(Boolean),
          },
          openGraph: { image: formData.ogImage || '' },
          canonicalUrl: formData.canonicalUrl || ''
        }
      };
      
      const response = await apiFetch('/admin/contact-page', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(backendData)
      }) as any;

      if (response?.success) {
        notification.success({
          message: 'نجح الحفظ',
          description: 'تم حفظ البيانات بنجاح'
        });
        setContactData(response.data);
      } else {
        notification.error({
          message: 'فشل الحفظ',
          description: 'فشل في حفظ البيانات'
        });
      }
    } catch (error) {
      notification.error({
        message: 'خطأ في الحفظ',
        description: 'فشل في حفظ البيانات'
      });
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
          <PhoneOutlined />
          إدارة صفحة تواصل معنا
        </h1>
        <p className="text-gray-600">
          تحكم في معلومات التواصل وإعدادات صفحة التواصل
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
              href="/contact"
              target="_blank"
            >
              معاينة الصفحة
            </Button>
          </Space>
        </div>

        <Divider />

        <Tabs
          defaultActiveKey="hero"
          items={[
            {
              key: 'hero',
              label: (
                <span>
                  <MessageOutlined />
                  القسم الرئيسي
                </span>
              ),
              children: (
                <Form form={form} layout="vertical">
                  <Card className="bg-blue-50">
                    <Title level={4}>عنوان الصفحة ووصفها</Title>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="heroTitleAr" label="عنوان الصفحة">
                          <Input placeholder="معلومات التواصل – بصمة تصميم" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="heroSubtitleAr" label="النص التوضيحي">
                          <TextArea rows={3} placeholder="نحن نؤمن أن التواصل الواضح هو أساس الخدمة الاحترافية..." />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Form>
              )
            },
            {
              key: 'contact',
              label: (
                <span>
                  <PhoneOutlined />
                  معلومات التواصل
                </span>
              ),
              children: (
                <Form form={form} layout="vertical">
                  <Card className="bg-green-50">
                    <Title level={4}>بيانات التواصل</Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="whatsappLink" label="رابط الواتساب">
                          <Input placeholder="https://wa.me/your-number" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="email" label="البريد الإلكتروني">
                          <Input placeholder="contact@basmadesign.com" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="workingHoursAr" label="ساعات العمل">
                          <Input placeholder="يوميًا من الساعة 10 صباحًا حتى 10 مساءً – بتوقيت السعودية" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Form>
              )
            },
            {
              key: 'social',
              label: (
                <span>
                  <TeamOutlined />
                  وسائل التواصل
                </span>
              ),
              children: (
                <Form form={form} layout="vertical">
                  <Card className="bg-purple-50">
                    <Title level={4}>روابط وسائل التواصل الاجتماعي</Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="instagram" label="إنستغرام">
                          <Input placeholder="https://instagram.com/basmatdesign" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="twitter" label="تويتر (X)">
                          <Input placeholder="https://twitter.com/basmatdesign" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="linkedin" label="لينكدإن">
                          <Input placeholder="https://linkedin.com/company/basmatdesign" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="tiktok" label="تيك توك">
                          <Input placeholder="https://tiktok.com/@basmatdesign" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Form>
              )
            },
            {
              key: 'notes',
              label: (
                <span>
                  <MessageOutlined />
                  الملاحظات المهمة
                </span>
              ),
              children: (
                <Form form={form} layout="vertical">
                  <Card className="bg-yellow-50">
                    <Title level={4}>الملاحظات المهمة</Title>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="note1Ar" label="الملاحظة الأولى">
                          <TextArea rows={2} placeholder="لا يتم الرد على الطلبات غير المدفوعة أو غير المكتملة" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="note2Ar" label="الملاحظة الثانية">
                          <TextArea rows={2} placeholder="لا يُعتمد أي تواصل عبر منصات أخرى..." />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="note3Ar" label="الملاحظة الثالثة">
                          <TextArea rows={2} placeholder="جميع المحادثات تُدار باحترام متبادل..." />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Form>
              )
            },
            {
              key: 'seo',
              label: (
                <span style={{ display: 'none' }}>
                  <GlobalOutlined />
                  إعدادات SEO
                </span>
              ),
              children: (
                <div style={{ display: 'none' }}>
                  <Form form={form} layout="vertical">
                    <Card className="bg-gray-50">
                      <Title level={4}>إعدادات تحسين محركات البحث</Title>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item name="seoTitleAr" label="عنوان الصفحة">
                            <Input placeholder="تواصل معنا | بصمة تصميم - معلومات التواصل وطلب الخدمات" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item name="seoDescriptionAr" label="وصف الصفحة">
                            <TextArea rows={3} placeholder="تواصل مع فريق بصمة تصميم عبر جميع قنوات التواصل الرسمية..." />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item name="seoKeywordsAr" label="الكلمات المفتاحية">
                            <TextArea rows={2} placeholder="تواصل معنا، معلومات التواصل، واتساب بصمة تصميم..." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Form>
                </div>
              ),
              style: { display: 'none' }
            }
          ]}
        />
      </Card>
    </div>
  );
}
