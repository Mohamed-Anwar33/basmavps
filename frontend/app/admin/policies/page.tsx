'use client';

import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  message, 
  Tabs,
  Divider,
  Alert,
  Tag,
  Popconfirm
} from 'antd';
import { 
  SaveOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import { LuxuryCard, LuxuryButton, LuxuryLoading } from '../components/ui/design-system';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface PolicyContent {
  key: string;
  value: string;
  updatedAt: string;
  createdAt: string;
}

interface PoliciesData {
  terms: PolicyContent;
  refund: PolicyContent;
  privacy: PolicyContent;
  delivery: PolicyContent;
}

export default function PoliciesManagement() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [policies, setPolicies] = useState<PoliciesData | null>(null);
  const [activeKey, setActiveKey] = useState('terms');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response: any = await apiFetch('/settings?category=policies');
      
      if (response && response.data && Array.isArray(response.data)) {
        // Convert array to object structure
        const formattedPolicies = response.data.reduce((acc: any, item: any) => {
          acc[item.key as keyof PoliciesData] = {
            key: item.key,
            value: item.value || '',
            updatedAt: item.updatedAt || new Date().toISOString(),
            createdAt: item.createdAt || new Date().toISOString()
          };
          return acc;
        }, {} as PoliciesData);
        
        setPolicies(formattedPolicies);
        
        // Set form values
        const formValues = Object.entries(formattedPolicies).reduce((acc: any, [key, policy]) => {
          acc[key] = (policy as any).value;
          return acc;
        }, {} as any);
        
        form.setFieldsValue(formValues);
        
      }
    } catch (error) {
      message.error('فشل في تحميل السياسات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      
      
      // Use the simple update-policies endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api`}/update-policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        message.success(`تم حفظ ${result.updatedCount || 'جميع'} السياسات بنجاح`);
        await fetchPolicies(); // Refresh data
      } else {
        throw new Error(result.error || 'فشل في الحفظ');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      message.error(`فشل في حفظ السياسات: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const getPolicyTitle = (key: string) => {
    const titles = {
      terms: 'الشروط والأحكام',
      refund: 'سياسة عدم الاسترداد',
      privacy: 'سياسة الخصوصية',
      delivery: 'سياسة التسليم'
    };
    return titles[key as keyof typeof titles] || key;
  };

  const getPolicyIcon = (key: string) => {
    const icons = {
      terms: '📋',
      refund: '💰',
      privacy: '🔒',
      delivery: '📦'
    };
    return icons[key as keyof typeof icons] || '📄';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LuxuryLoading size="large" text="جاري تحميل السياسات..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <LuxuryCard gradient className="border-0">
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
            <FileTextOutlined className="ml-3 text-purple-600" />
            إدارة السياسات والشروط
          </h2>
          <p className="text-gray-600 mt-3 text-lg">
            إدارة وتعديل سياسات الموقع والشروط والأحكام بطريقة احترافية وآمنة
          </p>
        </div>

        {/* Warning Alert */}
        <Alert
          message="تحذير قانوني مهم"
          description="تعديل السياسات والشروط يؤثر على العقود القانونية. يُنصح بمراجعة المستشار القانوني قبل النشر."
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
          className="rounded-xl border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50"
        />
      </LuxuryCard>

      {/* Main Form */}
      <LuxuryCard hover>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={saving}
        >
          <Tabs 
            activeKey={activeKey} 
            onChange={setActiveKey}
            type="card"
          >
            {policies && Object.entries(policies).map(([key, policy]) => (
              <TabPane 
                tab={
                  <span>
                    {getPolicyIcon(key)} {getPolicyTitle(key)}
                  </span>
                } 
                key={key}
              >
                <div className="space-y-4">
                  {/* Policy Info */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <span className="text-2xl ml-2">{getPolicyIcon(key)}</span>
                        {getPolicyTitle(key)}
                      </h3>
                      <div className="flex space-x-2">
                        <Tag 
                          color="purple" 
                          className="rounded-full px-3 py-1 font-medium"
                        >
                          آخر تحديث: {new Date(policy.updatedAt).toLocaleDateString('ar-EG')}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  {/* Policy Content Editor */}
                  <Form.Item
                    name={key}
                    label={`محتوى ${getPolicyTitle(key)}`}
                    rules={[
                      { required: true, message: `يرجى إدخال محتوى ${getPolicyTitle(key)}` },
                      { min: 50, message: 'يجب أن يكون المحتوى 50 حرف على الأقل' }
                    ]}
                  >
                    <TextArea
                      rows={15}
                      placeholder={`أدخل محتوى ${getPolicyTitle(key)} هنا...`}
                      showCount
                      maxLength={10000}
                      className="font-mono text-sm"
                    />
                  </Form.Item>

                  {/* Preview Section */}
                  <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-purple-200 rounded-xl p-6 shadow-inner">
                    <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                      <EyeOutlined className="ml-2 text-purple-600" />
                      معاينة النص
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed bg-white rounded-lg p-4 border border-gray-100 min-h-[200px]">
                      {form.getFieldValue(key) || (
                        <span className="text-gray-400 italic">لا يوجد محتوى للمعاينة...</span>
                      )}
                    </div>
                  </div>

                  {/* Character Count */}
                  <div className="text-right">
                    <Tag 
                      color={((form.getFieldValue(key) || '').length > 8000) ? 'red' : 'blue'}
                      className="rounded-full"
                    >
                      عدد الأحرف: {(form.getFieldValue(key) || '').length} / 10,000
                    </Tag>
                  </div>
                </div>
              </TabPane>
            ))}
          </Tabs>

          <Divider />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2 space-x-reverse">
              <LuxuryButton 
                type="secondary"
                icon={<HistoryOutlined />}
                onClick={fetchPolicies}
                disabled={saving}
              >
                إعادة تحميل
              </LuxuryButton>
            </div>

            <div className="flex space-x-2 space-x-reverse">
              <Popconfirm
                title="هل أنت متأكد من حفظ التغييرات؟"
                description="سيتم تحديث السياسات على الموقع فوراً"
                onConfirm={() => form.submit()}
                okText="نعم، احفظ"
                cancelText="إلغاء"
                disabled={saving}
              >
                <LuxuryButton
                  type="primary"
                  loading={saving}
                  icon={<SaveOutlined />}
                  size="large"
                  gradient
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ جميع السياسات'}
                </LuxuryButton>
              </Popconfirm>
            </div>
          </div>
        </Form>
      </LuxuryCard>

      {/* Help Section */}
      <LuxuryCard 
        title="💡 إرشادات الاستخدام"
        className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
      >
        <div className="text-gray-700 space-y-3">
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-blue-600 font-bold">•</span>
            <p>يمكنك تعديل النصوص مباشرة في المحرر</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-blue-600 font-bold">•</span>
            <p>استخدم المعاينة للتأكد من تنسيق النص</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-blue-600 font-bold">•</span>
            <p>احرص على مراجعة المحتوى قبل الحفظ</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-blue-600 font-bold">•</span>
            <p>التغييرات تظهر على الموقع فوراً بعد الحفظ</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-blue-600 font-bold">•</span>
            <p>يُنصح بالنسخ الاحتياطي قبل التعديلات الكبيرة</p>
          </div>
        </div>
      </LuxuryCard>
    </div>
  );
}
