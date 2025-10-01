'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  message, 
  Tabs,
  Switch,
  Select,
  Space,
  Divider
} from 'antd';
import { 
  SaveOutlined,
  UploadOutlined,
  SettingOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { apiFetch } from '@/lib/api';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    workingHours: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage?: string;
  };
  businessInfo: {
    companyName: string;
    taxNumber?: string;
    commercialRegister?: string;
    aboutUs: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

export default function SettingsManagement() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      workingHours: '',
    },
    socialMedia: {},
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
    businessInfo: {
      companyName: '',
      aboutUs: '',
    },
    maintenance: {
      enabled: false,
      message: '',
    },
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/admin/settings') as { success: boolean; data: SiteSettings };
      if (response.success && response.data) {
        setSettings(response.data);
        form.setFieldsValue(response.data);
      }
    } catch (error) {
      message.error('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      const response = await apiFetch('/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if ((response as { success: boolean }).success) {
        message.success('تم حفظ الإعدادات بنجاح');
        setSettings(values);
      }
    } catch (error) {
      message.error('فشل في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <SettingOutlined className="ml-2" />
            إعدادات الموقع
          </h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={settings}
        >
          <Tabs defaultActiveKey="general">
            <TabPane tab="الإعدادات العامة" key="general">
              <div className="space-y-4">
                <Form.Item
                  name="siteName"
                  label="اسم الموقع"
                  rules={[{ required: true, message: 'يرجى إدخال اسم الموقع' }]}
                >
                  <Input placeholder="بصمة تصميم" />
                </Form.Item>

                <Form.Item
                  name="siteDescription"
                  label="وصف الموقع"
                >
                  <TextArea rows={3} placeholder="وصف مختصر عن الموقع" />
                </Form.Item>

                <Form.Item
                  name="siteUrl"
                  label="رابط الموقع"
                >
                  <Input placeholder="https://basmadesign.com" />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="logo"
                    label="شعار الموقع"
                  >
                    <Upload>
                      <Button icon={<UploadOutlined />}>تحميل الشعار</Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    name="favicon"
                    label="أيقونة الموقع"
                  >
                    <Upload>
                      <Button icon={<UploadOutlined />}>تحميل الأيقونة</Button>
                    </Upload>
                  </Form.Item>
                </div>
              </div>
            </TabPane>

            <TabPane tab="معلومات الاتصال" key="contact">
              <div className="space-y-4">
                <Form.Item
                  name={['contactInfo', 'email']}
                  label="البريد الإلكتروني"
                  rules={[
                    { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
                    { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="info@basmadesign.com" />
                </Form.Item>

                <Form.Item
                  name={['contactInfo', 'phone']}
                  label="رقم الهاتف"
                  rules={[{ required: true, message: 'يرجى إدخال رقم الهاتف' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="+966XXXXXXXXX" />
                </Form.Item>

                <Form.Item
                  name={['contactInfo', 'address']}
                  label="العنوان"
                >
                  <TextArea rows={3} placeholder="العنوان الكامل للشركة" />
                </Form.Item>

                <Form.Item
                  name={['contactInfo', 'workingHours']}
                  label="ساعات العمل"
                >
                  <Input placeholder="الأحد - الخميس: 9 صباحاً - 6 مساءً" />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="وسائل التواصل الاجتماعي" key="social">
              <div className="space-y-4">
                <Form.Item
                  name={['socialMedia', 'facebook']}
                  label="فيسبوك"
                >
                  <Input prefix={<LinkOutlined />} placeholder="https://facebook.com/basmadesign" />
                </Form.Item>

                <Form.Item
                  name={['socialMedia', 'twitter']}
                  label="تويتر"
                >
                  <Input prefix={<LinkOutlined />} placeholder="https://twitter.com/basmadesign" />
                </Form.Item>

                <Form.Item
                  name={['socialMedia', 'instagram']}
                  label="إنستجرام"
                >
                  <Input prefix={<LinkOutlined />} placeholder="https://instagram.com/basmadesign" />
                </Form.Item>

                <Form.Item
                  name={['socialMedia', 'linkedin']}
                  label="لينكد إن"
                >
                  <Input prefix={<LinkOutlined />} placeholder="https://linkedin.com/company/basmadesign" />
                </Form.Item>

                <Form.Item
                  name={['socialMedia', 'youtube']}
                  label="يوتيوب"
                >
                  <Input prefix={<LinkOutlined />} placeholder="https://youtube.com/basmadesign" />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="تحسين محركات البحث" key="seo">
              <div className="space-y-4">
                <Form.Item
                  name={['seo', 'metaTitle']}
                  label="عنوان الصفحة (Meta Title)"
                  rules={[{ required: true, message: 'يرجى إدخال عنوان الصفحة' }]}
                >
                  <Input placeholder="بصمة تصميم - خدمات التصميم والتسويق الرقمي" />
                </Form.Item>

                <Form.Item
                  name={['seo', 'metaDescription']}
                  label="وصف الصفحة (Meta Description)"
                  rules={[{ required: true, message: 'يرجى إدخال وصف الصفحة' }]}
                >
                  <TextArea rows={3} placeholder="نحن شركة متخصصة في خدمات التصميم والتسويق الرقمي..." />
                </Form.Item>

                <Form.Item
                  name={['seo', 'metaKeywords']}
                  label="الكلمات المفتاحية (Meta Keywords)"
                >
                  <Input placeholder="تصميم، تسويق، هوية بصرية، مواقع، تطبيقات" />
                </Form.Item>

                <Form.Item
                  name={['seo', 'ogImage']}
                  label="صورة المشاركة (OG Image)"
                >
                  <Upload>
                    <Button icon={<UploadOutlined />}>تحميل صورة المشاركة</Button>
                  </Upload>
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="معلومات الشركة" key="business">
              <div className="space-y-4">
                <Form.Item
                  name={['businessInfo', 'companyName']}
                  label="اسم الشركة"
                  rules={[{ required: true, message: 'يرجى إدخال اسم الشركة' }]}
                >
                  <Input placeholder="بصمة تصميم للخدمات الرقمية" />
                </Form.Item>

                <Form.Item
                  name={['businessInfo', 'taxNumber']}
                  label="الرقم الضريبي"
                >
                  <Input placeholder="1234567890" />
                </Form.Item>

                <Form.Item
                  name={['businessInfo', 'commercialRegister']}
                  label="رقم السجل التجاري"
                >
                  <Input placeholder="1010123456" />
                </Form.Item>

                <Form.Item
                  name={['businessInfo', 'aboutUs']}
                  label="نبذة عن الشركة"
                >
                  <TextArea rows={6} placeholder="نبذة مفصلة عن الشركة وخدماتها..." />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="وضع الصيانة" key="maintenance">
              <div className="space-y-4">
                <Form.Item
                  name={['maintenance', 'enabled']}
                  valuePropName="checked"
                >
                  <Switch /> <span className="mr-2">تفعيل وضع الصيانة</span>
                </Form.Item>

                <Form.Item
                  name={['maintenance', 'message']}
                  label="رسالة الصيانة"
                >
                  <TextArea 
                    rows={4} 
                    placeholder="الموقع تحت الصيانة حالياً. سنعود قريباً!" 
                  />
                </Form.Item>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>تحذير:</strong> عند تفعيل وضع الصيانة، سيظهر للمستخدمين صفحة الصيانة فقط. 
                    المديرون يمكنهم الوصول للموقع بشكل طبيعي.
                  </p>
                </div>
              </div>
            </TabPane>
          </Tabs>

          <Divider />

          <div className="flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              className="bg-purple-600 hover:bg-purple-700"
            >
              حفظ الإعدادات
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
