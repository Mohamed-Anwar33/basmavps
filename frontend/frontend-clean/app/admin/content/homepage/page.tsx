'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Form, Space, Divider, Row, Col, Tabs, Switch, Select, Tag, Modal, App } from 'antd';
import { SaveOutlined, EyeOutlined, ReloadOutlined, HomeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  Paintbrush, Award, CheckCircle, Lightbulb, Star, Shield, 
  Clock, Sparkles, Heart, Target, Zap, Gem, Palette, Users,
  Trophy, Rocket, Globe, Settings, Camera, MessageCircle
} from 'lucide-react';
import { useAdminAuth } from '../../../../contexts/admin-auth-context';
import { apiFetch } from '../../../../lib/api';

const { TextArea } = Input;

// Available icons for selection
const AVAILABLE_ICONS = [
  { key: 'paintbrush', label: 'فرشاة الرسم', component: Paintbrush, color: 'text-pink-600', bgGradient: 'from-pink-100 to-rose-100' },
  { key: 'award', label: 'جائزة', component: Award, color: 'text-emerald-600', bgGradient: 'from-emerald-100 to-teal-100' },
  { key: 'check-circle', label: 'دائرة صح', component: CheckCircle, color: 'text-green-600', bgGradient: 'from-green-100 to-emerald-100' },
  { key: 'lightbulb', label: 'لمبة', component: Lightbulb, color: 'text-amber-600', bgGradient: 'from-amber-100 to-yellow-100' },
  { key: 'star', label: 'نجمة', component: Star, color: 'text-indigo-600', bgGradient: 'from-indigo-100 to-violet-100' },
  { key: 'shield', label: 'درع', component: Shield, color: 'text-blue-600', bgGradient: 'from-blue-100 to-indigo-100' },
  { key: 'clock', label: 'ساعة', component: Clock, color: 'text-purple-600', bgGradient: 'from-purple-100 to-pink-100' },
  { key: 'sparkles', label: 'بريق', component: Sparkles, color: 'text-violet-600', bgGradient: 'from-violet-100 to-purple-100' },
  { key: 'heart', label: 'قلب', component: Heart, color: 'text-rose-600', bgGradient: 'from-rose-100 to-pink-100' },
  { key: 'target', label: 'هدف', component: Target, color: 'text-red-600', bgGradient: 'from-red-100 to-rose-100' },
  { key: 'zap', label: 'برق', component: Zap, color: 'text-yellow-600', bgGradient: 'from-yellow-100 to-amber-100' },
  { key: 'gem', label: 'جوهرة', component: Gem, color: 'text-cyan-600', bgGradient: 'from-cyan-100 to-blue-100' },
  { key: 'palette', label: 'لوحة ألوان', component: Palette, color: 'text-teal-600', bgGradient: 'from-teal-100 to-cyan-100' },
  { key: 'users', label: 'مستخدمين', component: Users, color: 'text-slate-600', bgGradient: 'from-slate-100 to-gray-100' },
  { key: 'trophy', label: 'كأس', component: Trophy, color: 'text-orange-600', bgGradient: 'from-orange-100 to-amber-100' },
  { key: 'rocket', label: 'صاروخ', component: Rocket, color: 'text-lime-600', bgGradient: 'from-lime-100 to-green-100' },
  { key: 'globe', label: 'كرة أرضية', component: Globe, color: 'text-sky-600', bgGradient: 'from-sky-100 to-blue-100' },
  { key: 'settings', label: 'إعدادات', component: Settings, color: 'text-gray-600', bgGradient: 'from-gray-100 to-slate-100' },
  { key: 'camera', label: 'كاميرا', component: Camera, color: 'text-stone-600', bgGradient: 'from-stone-100 to-gray-100' },
  { key: 'message-circle', label: 'رسالة', component: MessageCircle, color: 'text-neutral-600', bgGradient: 'from-neutral-100 to-stone-100' }
];

// Helper function to get icon component by key
const getIconComponent = (iconKey: string) => {
  const iconConfig = AVAILABLE_ICONS.find(icon => icon.key === iconKey);
  return iconConfig || AVAILABLE_ICONS[0]; // Default to first icon if not found
};

// Map legacy icon names used previously to the new keys
const mapLegacyIconName = (name: string | undefined): string => {
  if (!name) return 'paintbrush';
  switch (name) {
    case 'palette':
      return 'paintbrush';
    case 'shield':
      return 'award';
    case 'clock':
      return 'check-circle';
    case 'sparkles':
      return 'lightbulb';
    default:
      return name;
  }
};

interface HeroSectionData {
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  description: { ar: string; en: string };
  ctaButton: {
    text: { ar: string; en: string };
    link: string;
    style: string;
  };
  backgroundImage: string;
  backgroundVideo: string;
  backgroundColor: string;
  textColor: string;
  overlayOpacity: number;
  animation: string;
  isActive: boolean;
}

interface FoundationalData {
  title: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
}

interface CountersData {
  title: string;
  subtitle: string;
  counters: Array<{
    label: string;
    value: number;
    suffix: string;
    icon: string;
    iconColor: string;
    chipBg: string;
  }>;
}

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
}

interface WhatMakesUsDifferentData {
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  items: Array<{
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    iconName: string;
    iconColor: string;
    bgGradient: string;
  }>;
}

export default function HomepageManagementPage() {
  const { admin, token, loading: authLoading } = useAdminAuth();
  const { message } = App.useApp(); // استخدام App hook بدلاً من static message
  const [heroForm] = Form.useForm();
  const [foundationalForm] = Form.useForm();
  const [countersForm] = Form.useForm();
  const [seoForm] = Form.useForm();
  const [whatMakesUsForm] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);

  const [heroData, setHeroData] = useState<HeroSectionData>({
    title: { ar: 'صمّم بصمتك الخاصة.', en: 'Design Your Own Mark.' },
    subtitle: { ar: 'ابدأ رحلتك نحو هوية رقمية لا تُنسى.', en: 'Start your journey to an unforgettable digital identity.' },
    description: { ar: 'في بصمة تصميم، نحول أفكارك إلى تصاميم استثنائية تعكس شخصيتك وتحقق أهدافك', en: 'At Basmat Design, we turn your ideas into exceptional designs that reflect your personality and achieve your goals' },
    ctaButton: {
      text: { ar: 'تواصل معنا', en: 'Contact Us' },
      link: '/contact',
      style: 'primary'
    },
    backgroundImage: '',
    backgroundVideo: '',
    backgroundColor: '#1e293b',
    textColor: '#ffffff',
    overlayOpacity: 0.5,
    animation: 'fade-in',
    isActive: true
  });

  const [foundationalData, setFoundationalData] = useState<FoundationalData>({
    title: 'في بصمة تصميم، نمنح مشروعك حضورًا لا يُنسى',
    subtitle: 'نصمم، نكتب، ونبني لك هوية تترك أثرًا في قلوب عملائك',
    ctaPrimaryText: 'اطلب خدمتك الآن',
    ctaPrimaryLink: '/order',
    ctaSecondaryText: 'تعرف علينا أكثر',
    ctaSecondaryLink: '/about'
  });

  const [countersData, setCountersData] = useState<CountersData>({
    title: 'الإحصائيات',
    subtitle: 'أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل',
    counters: [
      { label: 'المشاريع المنجزة', value: 468, suffix: '+', icon: 'Briefcase', iconColor: 'text-emerald-600', chipBg: 'from-emerald-100 to-teal-100' },
      { label: 'العملاء', value: 258, suffix: '+', icon: 'Users', iconColor: 'text-indigo-600', chipBg: 'from-indigo-100 to-blue-100' },
      { label: 'سنوات الخبرة', value: 6, suffix: '+', icon: 'Timer', iconColor: 'text-amber-600', chipBg: 'from-amber-100 to-yellow-100' },
      { label: 'التقييمات', value: 4.9, suffix: ' من 5', icon: 'Star', iconColor: 'text-rose-600', chipBg: 'from-rose-100 to-pink-100' }
    ]
  });

  const [seoData, setSeoData] = useState<SEOData>({
    title: 'بصمة تصميم - تصميم جرافيك وهوية بصرية احترافية',
    description: 'شركة بصمة تصميم متخصصة في تصميم الهويات البصرية والجرافيك الاحترافي. نقدم خدمات تصميم الشعارات، المواقع، والمطبوعات بجودة عالية.',
    keywords: ['تصميم جرافيك', 'هوية بصرية', 'تصميم شعار', 'تصميم موقع'],
    ogImage: '/images/og-image.jpg',
    canonicalUrl: 'https://basmadesign.com'
  });

  const [whatMakesUsData, setWhatMakesUsData] = useState<WhatMakesUsDifferentData>({
    title: { ar: 'لماذا بصمة تصميم؟', en: 'Why Basmat Design?' },
    subtitle: { ar: 'لأننا نصمم ليبقى الأثر، ونكتب لنحرك الشعور، ونبني حضورًا رقمياً يعبر عنك.', en: 'Because we design to leave an impact, write to move emotions, and build a digital presence that expresses you.' },
    items: [
      {
        title: { ar: 'تصميم يحمل بصمتك', en: 'Design that carries your signature' },
        description: { ar: 'كل تصميم يُصنع ليعكس هويتك الفريدة ويميزك عن المنافسين', en: 'Every design is crafted to reflect your unique identity and distinguish you from competitors' },
        iconName: 'palette',
        iconColor: 'text-pink-600',
        bgGradient: 'from-pink-100 to-rose-100'
      },
      {
        title: { ar: 'شفافية و إحترافية', en: 'Transparency & Professionalism' },
        description: { ar: 'سياساتنا واضحة وتعاملنا مبني على الثقة والاحترافية المطلقة', en: 'Our policies are clear and our dealings are built on trust and absolute professionalism' },
        iconName: 'shield',
        iconColor: 'text-emerald-600',
        bgGradient: 'from-emerald-100 to-teal-100'
      },
      {
        title: { ar: 'تسليم مدروس', en: 'Thoughtful Delivery' },
        description: { ar: 'نلتزم بالوقت المحدد ونضمن جودة عالية في كل مشروع', en: 'We commit to deadlines and guarantee high quality in every project' },
        iconName: 'clock',
        iconColor: 'text-amber-600',
        bgGradient: 'from-amber-100 to-yellow-100'
      },
      {
        title: { ar: 'خدمة تُصمم لتُحدث فرقًا', en: 'Service designed to make a difference' },
        description: { ar: 'تجربة إبداعية متكاملة تحول رؤيتك إلى واقع ملموس', en: 'A comprehensive creative experience that transforms your vision into tangible reality' },
        iconName: 'sparkles',
        iconColor: 'text-indigo-600',
        bgGradient: 'from-indigo-100 to-violet-100'
      }
    ]
  });

  useEffect(() => {
    if (!authLoading && admin && token) {
      loadData();
    }
  }, [authLoading, admin, token, activeTab]);

  // Helper to extract Arabic text from localized or string
  const pickText = (v: any, fallback = ''): string => {
    if (!v) return fallback;
    if (typeof v === 'string') return v;
    if (typeof v === 'object') return v.ar || v.en || fallback;
    return fallback;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'hero':
          await loadHeroData();
          break;
        case 'foundational':
          await loadFoundationalData();
          break;
        case 'counters':
          await loadCountersData();
          break;
        case 'seo':
          await loadSEOData();
          break;
        case 'what-makes-us-different':
          await loadWhatMakesUsData();
          break;
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadHeroData = async () => {
    try {
      const response = await apiFetch('/admin/hero-section', {
        headers: { 'Authorization': `Bearer ${token}` }
      }) as any;
      
      if (response) {
        // Normalize possible legacy string fields to localized objects for the form
        const normalized = {
          ...response,
          title: typeof response.title === 'string' ? { ar: response.title, en: response.title } : (response.title || { ar: '', en: '' }),
          subtitle: typeof response.subtitle === 'string' ? { ar: response.subtitle, en: response.subtitle } : (response.subtitle || { ar: '', en: '' }),
          description: typeof response.description === 'string' ? { ar: response.description, en: response.description } : (response.description || { ar: '', en: '' }),
          ctaButton: {
            ...(response.ctaButton || {}),
            text: typeof response?.ctaButton?.text === 'string' ? { ar: response.ctaButton.text, en: response.ctaButton.text } : (response?.ctaButton?.text || { ar: '', en: '' })
          }
        };
        setHeroData(normalized);
        heroForm.setFieldsValue(normalized);
      }
    } catch (error) {
    }
  };

  const loadFoundationalData = async () => {
    try {
      const response = await apiFetch('/admin/foundational', {
        headers: { 'Authorization': `Bearer ${token}` }
      }) as any;
      
      const data = response?.data || response;
      if (data) {
        const mapped = {
          title: pickText(data.title, ''),
          subtitle: pickText(data.subtitle, ''),
          ctaPrimaryText: pickText(data.ctaPrimaryText, ''),
          ctaPrimaryLink: data.ctaPrimaryLink || '/order',
          ctaSecondaryText: pickText(data.ctaSecondaryText, ''),
          ctaSecondaryLink: data.ctaSecondaryLink || '/about',
        };
        setFoundationalData(mapped);
        foundationalForm.setFieldsValue(mapped);
      }
    } catch (error) {
    }
  };

  const loadCountersData = async () => {
    try {
      // Use admin content endpoint with auth and section type
      const response = await apiFetch('/admin/content/homepage-sections/counters', { auth: true }) as any;

      const section = response?.data || response; // { sectionType, counters: { title, subtitle, items: [...] } }
      const c = section?.counters || {};
      const mapped = {
        title: pickText(c.title, 'الإحصائيات'),
        subtitle: pickText(c.subtitle, ''),
        counters: Array.isArray(c.items)
          ? c.items.map((item: any) => ({
              label: pickText(item.label, ''),
              value: item.value || 0,
              suffix: pickText(item.suffix, '+'),
              icon: item.iconName || 'Briefcase',
              iconColor: item.iconColor || 'text-emerald-600',
              chipBg: item.chipBg || 'from-emerald-100 to-teal-100'
            }))
          : (countersData.counters || [])
      };
      setCountersData(mapped);
      countersForm.setFieldsValue(mapped);
    } catch (error) {
    }
  };

  const loadSEOData = async () => {
    try {
      // Admin settings returns { success, data: { settings: [...] } }
      const response = await apiFetch('/admin/settings?category=seo', { auth: true }) as any;

      const list = response?.data?.settings || response?.data || [];
      const seoSettings = Array.isArray(list)
        ? list.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
          }, {})
        : (list || {});

      setSeoData(seoSettings);
      seoForm.setFieldsValue(seoSettings);
    } catch (error) {
    }
  };

  const loadWhatMakesUsData = async () => {
    try {
      const response = await apiFetch('/admin/content/homepage-sections/what-makes-us-different', {
        headers: { 'Authorization': `Bearer ${token}` }
      }) as any;
      
      if (response?.success && response.data) {
        // Normalize legacy icon names so the Select value matches our options
        const normalized = {
          ...response.data,
          items: Array.isArray(response.data.items)
            ? response.data.items.map((it: any) => ({
                ...it,
                iconName: mapLegacyIconName(it.iconName || 'paintbrush')
              }))
            : []
        };
        setWhatMakesUsData(normalized);
        whatMakesUsForm.setFieldsValue(normalized);
      }
    } catch (error) {
    }
  };

  const saveData = async () => {
    console.log('🔄 Save button clicked! Active tab:', activeTab);
    setSaving(true);
    try {
      let endpoint = '';
      let formData = {};
      
      switch (activeTab) {
        case 'hero':
          endpoint = '/admin/hero-section';
          formData = heroForm.getFieldsValue();
          break;
        case 'foundational':
          endpoint = '/admin/foundational';
          formData = foundationalForm.getFieldsValue();
          break;
        case 'counters':
          endpoint = '/admin/content/homepage-sections/counters';
          {
            const vals = countersForm.getFieldsValue();
            formData = {
              title: vals.title || '',
              subtitle: vals.subtitle || '',
              items: (vals.counters || []).map((it: any) => ({
                label: it.label || '',
                value: Number(it.value) || 0,
                suffix: it.suffix || '+',
                iconName: it.icon || 'Briefcase',
                iconColor: it.iconColor || 'text-emerald-600',
                chipBg: it.chipBg || 'from-emerald-100 to-teal-100',
              }))
            };
          }
          break;
        case 'seo':
          endpoint = '/admin/settings/seo';
          formData = seoForm.getFieldsValue();
          break;
        case 'what-makes-us-different':
          endpoint = '/admin/content/homepage-sections/what-makes-us-different';
          {
            const vals = whatMakesUsForm.getFieldsValue();
            formData = {
              title: {
                ar: vals.title?.ar || '',
                en: vals.title?.ar || '' // Use Arabic for English as well since we only have Arabic
              },
              subtitle: {
                ar: vals.subtitle?.ar || '',
                en: vals.subtitle?.ar || '' // Use Arabic for English as well
              },
              items: (vals.items || []).map((item: any) => {
                const selectedIcon = getIconComponent(item.iconName || 'paintbrush');
                return {
                  title: {
                    ar: item.title?.ar || '',
                    en: item.title?.ar || '' // Use Arabic for English
                  },
                  description: {
                    ar: item.description?.ar || '',
                    en: item.description?.ar || '' // Use Arabic for English
                  },
                  iconName: item.iconName || 'paintbrush',
                  iconColor: selectedIcon.color,
                  bgGradient: selectedIcon.bgGradient
                };
              })
            };
          }
          break;
      }

      console.log('📤 Sending to:', endpoint, 'Data:', formData);
      
      const response = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(formData),
        auth: true,
      }) as any;

      console.log('📥 Response:', response);

      if (response?.success) {
        message.success('تم حفظ البيانات بنجاح');
        // Reload current tab data to ensure persistence after refresh
        await loadData();
      } else {
        const errorMsg = response?.message || response?.error || 'حدث خطأ غير معروف';
        console.error('❌ Save failed:', response);
        message.error(`فشل في حفظ البيانات: ${errorMsg}`);
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || 'حدث خطأ في الاتصال';
      console.error('❌ Save error:', errorMsg);
      console.error('❌ Full error details:', error?.message, error?.stack);
      message.error(`فشل في حفظ البيانات: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const renderHeroSection = () => (
    <Form form={heroForm} layout="vertical" initialValues={heroData}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name={['title', 'ar']} label="العنوان الرئيسي (عربي)">
            <Input placeholder="العنوان الرئيسي باللغة العربية" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name={['subtitle', 'ar']} label="العنوان الفرعي (عربي)">
            <Input placeholder="العنوان الفرعي باللغة العربية" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name={['description', 'ar']} label="الوصف (عربي)">
            <TextArea rows={4} placeholder="الوصف باللغة العربية" />
          </Form.Item>
        </Col>
      </Row>

      <Divider>إعدادات الزر</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name={['ctaButton', 'text', 'ar']} label="نص الزر (عربي)">
            <Input placeholder="نص الزر باللغة العربية" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={['ctaButton', 'link']} label="رابط الزر">
            <Input placeholder="/contact" />
          </Form.Item>
        </Col>
      </Row>

      <Divider>إعدادات التصميم</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="isActive" label="نشط" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const renderFoundationalSection = () => (
    <Form form={foundationalForm} layout="vertical" initialValues={foundationalData}>
      <Form.Item name="title" label="العنوان الرئيسي">
        <TextArea rows={3} placeholder="العنوان الرئيسي للقسم التأسيسي" />
      </Form.Item>

      <Form.Item name="subtitle" label="النص الفرعي">
        <TextArea rows={3} placeholder="النص التوضيحي للقسم التأسيسي" />
      </Form.Item>

      <Divider>أزرار الدعوة للعمل</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="ctaPrimaryText" label="نص الزر الأساسي">
            <Input placeholder="اطلب خدمتك الآن" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="ctaPrimaryLink" label="رابط الزر الأساسي">
            <Input placeholder="/order" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="ctaSecondaryText" label="نص الزر الثانوي">
            <Input placeholder="تعرف علينا أكثر" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="ctaSecondaryLink" label="رابط الزر الثانوي">
            <Input placeholder="/about" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const renderCountersSection = () => (
    <Form form={countersForm} layout="vertical" initialValues={countersData}>
      <Form.Item name="title" label="عنوان القسم">
        <Input placeholder="الإحصائيات" />
      </Form.Item>

      <Form.Item name="subtitle" label="وصف القسم">
        <TextArea rows={2} placeholder="أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل" />
      </Form.Item>

      <Divider>الإحصائيات</Divider>

      {(countersData.counters || []).map((counter, index) => (
        <Card key={index} size="small" title={`إحصائية ${index + 1}`} className="mb-4">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name={['counters', index, 'label']} label="التسمية">
                <Input placeholder="مشاريع مكتملة" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name={['counters', index, 'value']} label="القيمة">
                <Input type="number" placeholder="468" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name={['counters', index, 'suffix']} label="اللاحقة">
                <Input placeholder="+" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['counters', index, 'icon']} label="الأيقونة">
                <Input placeholder="Briefcase" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ))}
    </Form>
  );

  const renderWhatMakesUsSection = () => (
    <Form form={whatMakesUsForm} layout="vertical" initialValues={whatMakesUsData}>
      <Form.Item name={['title', 'ar']} label="العنوان">
        <Input placeholder="لماذا بصمة تصميم؟" />
      </Form.Item>

      <Form.Item name={['subtitle', 'ar']} label="النص الفرعي">
        <TextArea rows={3} placeholder="لأننا نصمم ليبقى الأثر، ونكتب لنحرك الشعور..." />
      </Form.Item>

      <Divider>العناصر المميزة</Divider>

      {(whatMakesUsData.items || []).map((item, index) => {
        const currentIconKey = whatMakesUsForm.getFieldValue(['items', index, 'iconName']) || item.iconName || 'paintbrush';
        const currentIcon = getIconComponent(currentIconKey);
        const IconComponent = currentIcon.component;

        return (
          <Card key={index} size="small" className="mb-4"
                title={
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${currentIcon.bgGradient}`}>
                      <IconComponent className={`w-5 h-5 ${currentIcon.color}`} />
                    </div>
                    <span>عنصر {index + 1}</span>
                  </div>
                }
                extra={
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const newItems = [...(whatMakesUsData.items || [])];
                      newItems.splice(index, 1);
                      setWhatMakesUsData({ ...whatMakesUsData, items: newItems });
                      whatMakesUsForm.setFieldsValue({ items: newItems });
                    }}
                  >
                    حذف
                  </Button>
                }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={['items', index, 'title', 'ar']} label="العنوان">
                  <Input placeholder="تصميم يحمل بصمتك" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['items', index, 'iconName']} label="الأيقونة">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setIconPickerIndex(index)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded bg-gradient-to-br ${currentIcon.bgGradient}`}>
                          <IconComponent className={`w-4 h-4 ${currentIcon.color}`} />
                        </div>
                        <span>
                          {AVAILABLE_ICONS.find(i => i.key === currentIconKey)?.label || 'اختر الأيقونة'}
                        </span>
                      </div>
                    </Button>
                  </div>
                </Form.Item>

                {/* Icon Picker Modal */}
                <Modal
                  title="اختر الأيقونة"
                  open={iconPickerIndex === index}
                  onCancel={() => setIconPickerIndex(null)}
                  footer={null}
                  destroyOnHidden
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {AVAILABLE_ICONS.map((icon) => {
                      const IconComp = icon.component;
                      const selected = currentIconKey === icon.key;
                      return (
                        <button
                          key={icon.key}
                          type="button"
                          onClick={() => {
                            const updatedItems = [...(whatMakesUsData.items || [])];
                            updatedItems[index] = { ...updatedItems[index], iconName: icon.key };
                            setWhatMakesUsData({ ...whatMakesUsData, items: updatedItems });
                            whatMakesUsForm.setFieldValue(['items', index, 'iconName'], icon.key);
                            setIconPickerIndex(null);
                          }}
                          className={`text-right border rounded-lg p-3 hover:border-primary transition flex items-center gap-2 ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}
                        >
                          <div className={`p-1.5 rounded bg-gradient-to-br ${icon.bgGradient}`}>
                            <IconComp className={`w-5 h-5 ${icon.color}`} />
                          </div>
                          <span className="text-sm">{icon.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Modal>
              </Col>
            </Row>

            <Form.Item name={['items', index, 'description', 'ar']} label="الوصف">
              <TextArea rows={2} placeholder="كل تصميم يُصنع ليعكس هويتك الفريدة..." />
            </Form.Item>

            {/* Preview of how the item will look */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">معاينة:</p>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${currentIcon.bgGradient}`}>
                  <IconComponent className={`w-6 h-6 ${currentIcon.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {whatMakesUsForm.getFieldValue(['items', index, 'title', 'ar']) || 'العنوان'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {whatMakesUsForm.getFieldValue(['items', index, 'description', 'ar']) || 'الوصف'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      <Button 
        type="dashed" 
        icon={<PlusOutlined />}
        onClick={() => {
          const newItem = {
            title: { ar: '', en: '' },
            description: { ar: '', en: '' },
            iconName: 'paintbrush',
            iconColor: 'text-pink-600',
            bgGradient: 'from-pink-100 to-rose-100'
          };
          const newItems = [...(whatMakesUsData.items || []), newItem];
          setWhatMakesUsData({ ...whatMakesUsData, items: newItems });
          whatMakesUsForm.setFieldsValue({ items: newItems });
        }}
        block
      >
        إضافة عنصر جديد
      </Button>
    </Form>
  );

  const renderSEOSection = () => (
    <Form form={seoForm} layout="vertical" initialValues={seoData}>
      <Form.Item name="title" label="عنوان الصفحة (SEO)">
        <Input placeholder="بصمة تصميم | خدمات التصميم والمحتوى الرقمي في السعودية" />
      </Form.Item>

      <Form.Item name="description" label="وصف الصفحة (SEO)">
        <TextArea rows={3} placeholder="شركة بصمة تصميم - متخصصون في تصميم الهوية البصرية..." />
      </Form.Item>

      <Form.Item name="keywords" label="الكلمات المفتاحية">
        <TextArea rows={2} placeholder="تصميم جرافيك، هوية بصرية، سوشيال ميديا" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="ogImage" label="صورة المشاركة">
            <Input placeholder="/og-image.jpg" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="canonicalUrl" label="الرابط الأساسي">
            <Input placeholder="https://basmatdesign.com" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

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
    <div className="p-6 max-w-full mx-auto bg-gray-50 min-h-screen" dir="rtl">
      <Card 
        title={
          <div className="flex items-center gap-3">
            <HomeOutlined className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800 m-0">إدارة محتوى الصفحة الرئيسية</h1>
          </div>
        }
        className="shadow-lg"
      >
        <div className="mb-6">
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
              href="/"
              target="_blank"
            >
              معاينة الصفحة
            </Button>
          </Space>
        </div>

        <Divider />

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          type="card"
          items={[
            {
              key: 'hero',
              label: 'القسم الرئيسي',
              children: renderHeroSection()
            },
            {
              key: 'foundational',
              label: 'القسم التأسيسي',
              children: renderFoundationalSection()
            },
            {
              key: 'counters',
              label: 'قسم الإحصائيات',
              children: renderCountersSection()
            },
            {
              key: 'what-makes-us-different',
              label: 'ما يميزنا',
              children: renderWhatMakesUsSection()
            },
            {
              key: 'seo',
              label: 'إعدادات SEO',
              children: <div style={{ display: 'none' }}>{renderSEOSection()}</div>,
              style: { display: 'none' }
            }
          ]}
        />
      </Card>
    </div>
  );
}
