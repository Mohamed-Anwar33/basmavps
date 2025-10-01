'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, message, Form, Space, Divider, Tabs, Row, Col, Switch, Typography, Select } from 'antd';
import { SaveOutlined, EyeOutlined, ReloadOutlined, UserOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useAdminAuth } from '../../../../contexts/admin-auth-context';
import { apiFetch } from '../../../../lib/api';

// Removed TabPane import as it's deprecated
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

// SEO Metadata Interface
interface SEOData {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImage: string;
}

// Hero Section Interface
interface HeroData {
  heroTitle: string;
  heroSubtitle: string;
}

// Mission Section Interface
interface MissionData {
  missionTitle: string;
  missionDesc: string;
  missionQuote: string;
  missionFeatures: { title: string; description: string }[];
}

interface MissionFeature {
  title: string;
  description: string;
}

// Team Interface
interface TeamMember {
  name: string;
  role: string;
  description: string;
}

// Process Interface
interface ProcessStep {
  title: string;
  description: string;
  icon: string;
}

// Page Banner Interface
interface PageBannerData {
  pageBannerTitle: string;
  pageBannerSubtitle: string;
  pageBannerCtaText: string;
  pageBannerCtaLink: string;
  pageBannerSecondaryCtaText: string;
  pageBannerSecondaryCtaLink: string;
  pageBannerFeatures: string[];
}

// Vision Section Interface
interface VisionData {
  visionTitle: string;
  visionBody: string;
}

// Values Interface
interface Value {
  title: string;
  description: string;
  icon: string;
}

// Why Us Interface
interface WhyUsData {
  whyUsTitle: string;
  whyUsBody: string;
}

// CTA Section Interface
interface CTAData {
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
}

export default function AboutManagementPage() {
  const { admin, token } = useAdminAuth();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  // State for all sections
  const [seoData, setSeoData] = useState<SEOData>({
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoOgImage: ''
  });

  const [heroData, setHeroData] = useState<HeroData>({
    heroTitle: '',
    heroSubtitle: ''
  });

  const [missionData, setMissionData] = useState<MissionData>({
    missionTitle: '',
    missionDesc: '',
    missionQuote: '',
    missionFeatures: []
  });

  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [processData, setProcessData] = useState<ProcessStep[]>([]);
  
  const [pageBannerData, setPageBannerData] = useState<PageBannerData>({
    pageBannerTitle: '',
    pageBannerSubtitle: '',
    pageBannerCtaText: '',
    pageBannerCtaLink: '',
    pageBannerSecondaryCtaText: '',
    pageBannerSecondaryCtaLink: '',
    pageBannerFeatures: []
  });

  const [visionData, setVisionData] = useState<VisionData>({
    visionTitle: '',
    visionBody: ''
  });

  const [valuesData, setValuesData] = useState<Value[]>([]);
  
  const [whyUsData, setWhyUsData] = useState<WhyUsData>({
    whyUsTitle: '',
    whyUsBody: ''
  });

  const [ctaData, setCTAData] = useState<CTAData>({
    ctaPrimaryText: '',
    ctaPrimaryLink: '',
    ctaSecondaryText: '',
    ctaSecondaryLink: ''
  });

  useEffect(() => {
    if (admin && token) {
      loadData();
    }
  }, [admin, token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/settings?category=about', {
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
      } else {
      }
      
      
      if (settingsArray && Array.isArray(settingsArray)) {
        const settings: Record<string, any> = {};
        settingsArray.forEach((item: any) => {
          settings[item.key] = item.value;
        });
        
        
        // Load SEO data
        const seoUpdate = {
          seoTitle: settings.seoTitle || '',
          seoDescription: settings.seoDescription || '',
          seoKeywords: settings.seoKeywords || '',
          seoOgImage: settings.seoOgImage || ''
        };
        setSeoData(seoUpdate);

        // Load Hero data
        const heroUpdate = {
          heroTitle: settings.heroTitle || '',
          heroSubtitle: settings.heroSubtitle || ''
        };
        setHeroData(heroUpdate);

        // Load Mission data
        const missionUpdate = {
          missionTitle: settings.missionTitle || '',
          missionDesc: settings.missionDesc || '',
          missionQuote: settings.missionQuote || '',
          missionFeatures: Array.isArray(settings.missionFeatures) ? settings.missionFeatures : []
        };
        setMissionData(missionUpdate);

        // Load Team data
        setTeamData(Array.isArray(settings.team) ? settings.team : []);

        // Load Process data
        setProcessData(Array.isArray(settings.process) ? settings.process : []);

        // Load Page Banner data
        const pageBannerUpdate = {
          pageBannerTitle: settings.pageBannerTitle || '',
          pageBannerSubtitle: settings.pageBannerSubtitle || '',
          pageBannerCtaText: settings.pageBannerCtaText || '',
          pageBannerCtaLink: settings.pageBannerCtaLink || '',
          pageBannerSecondaryCtaText: settings.pageBannerSecondaryCtaText || '',
          pageBannerSecondaryCtaLink: settings.pageBannerSecondaryCtaLink || '',
          pageBannerFeatures: Array.isArray(settings.pageBannerFeatures) ? settings.pageBannerFeatures : []
        };
        setPageBannerData(pageBannerUpdate);

        // Load Vision data
        const visionUpdate = {
          visionTitle: settings.visionTitle || '',
          visionBody: settings.visionBody || ''
        };
        setVisionData(visionUpdate);

        // Load Values data
        setValuesData(Array.isArray(settings.values) ? settings.values : []);

        // Load Why Us data
        const whyUsUpdate = {
          whyUsTitle: settings.whyUsTitle || '',
          whyUsBody: settings.whyUsBody || ''
        };
        setWhyUsData(whyUsUpdate);

        // Load CTA data
        const ctaUpdate = {
          ctaPrimaryText: settings.ctaPrimaryText || '',
          ctaPrimaryLink: settings.ctaPrimaryLink || '',
          ctaSecondaryText: settings.ctaSecondaryText || '',
          ctaSecondaryLink: settings.ctaSecondaryLink || ''
        };
        setCTAData(ctaUpdate);
        

      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      // Combine all data into one object
      const allData = {
        ...seoData,
        ...heroData,
        ...missionData,
        team: teamData,
        process: processData,
        ...pageBannerData,
        ...visionData,
        values: valuesData,
        ...whyUsData,
        ...ctaData
      };
      
      const response = await apiFetch('/admin/settings/about', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(allData)
      }) as any;

      if (response.success) {
        message.success('تم حفظ البيانات بنجاح');
      } else {
        message.error('فشل في حفظ البيانات');
      }
    } catch (error) {
      message.error('فشل في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  // SEO Section Render
  const renderSEOSection = () => (
    <div>
      <Title level={4}>إعدادات SEO</Title>
      <Row gutter={16}>
        <Col span={24}>
          <Text strong>عنوان الصفحة (Title)</Text>
          <Input 
            value={seoData.seoTitle}
            onChange={(e) => setSeoData({...seoData, seoTitle: e.target.value})}
            placeholder="من نحن - بصمة تصميم"
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={24}>
          <Text strong>وصف الصفحة (Meta Description)</Text>
          <TextArea 
            rows={3}
            value={seoData.seoDescription}
            onChange={(e) => setSeoData({...seoData, seoDescription: e.target.value})}
            placeholder="تعرف على فريق بصمة تصميم..."
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={24}>
          <Text strong>الكلمات المفتاحية (Keywords)</Text>
          <Input 
            value={seoData.seoKeywords}
            onChange={(e) => setSeoData({...seoData, seoKeywords: e.target.value})}
            placeholder="تصميم, هوية بصرية, جرافيك ديزاين"
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={24}>
          <Text strong>صورة OpenGraph</Text>
          <Input 
            value={seoData.seoOgImage}
            onChange={(e) => setSeoData({...seoData, seoOgImage: e.target.value})}
            placeholder="/images/about-og.jpg"
            className="mt-2"
          />
        </Col>
      </Row>
    </div>
  );

  // Hero Section Render
  const renderHeroSection = () => (
    <div>
      <Title level={4}>القسم الرئيسي</Title>
      <Row gutter={16}>
        <Col span={24}>
          <Text strong>العنوان الرئيسي</Text>
          <TextArea 
            rows={3}
            value={heroData.heroTitle}
            onChange={(e) => setHeroData({...heroData, heroTitle: e.target.value})}
            placeholder="نحن لا ننافس على الشكل, بل على الأثر"
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={24}>
          <Text strong>النص الفرعي</Text>
          <TextArea 
            rows={4}
            value={heroData.heroSubtitle}
            onChange={(e) => setHeroData({...heroData, heroSubtitle: e.target.value})}
            placeholder="في بصمة تصميم، نؤمن أن التصميم الحقيقي..."
            className="mt-2"
          />
        </Col>
      </Row>
    </div>
  );

  // Mission Section Render
  const renderMissionSection = () => (
    <div>
      <Title level={4}>قسم الرسالة</Title>
      <Row gutter={16}>
        <Col span={24}>
          <Text strong>عنوان الرسالة</Text>
          <Input 
            value={missionData.missionTitle}
            onChange={(e) => setMissionData({...missionData, missionTitle: e.target.value})}
            placeholder="رسالتنا"
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={24}>
          <Text strong>وصف الرسالة</Text>
          <TextArea 
            rows={4}
            value={missionData.missionDesc}
            onChange={(e) => setMissionData({...missionData, missionDesc: e.target.value})}
            placeholder="نسعى لأن نكون الشريك الإبداعي الموثوق..."
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={24}>
          <Text strong>النص الإضافي للرسالة</Text>
          <TextArea 
            rows={3}
            value={missionData.missionQuote}
            onChange={(e) => setMissionData({...missionData, missionQuote: e.target.value})}
            placeholder="كل مشروع نعمل عليه هو فرصة لإبداع قصة بصرية فريدة..."
            className="mt-2 mb-4"
          />
        </Col>
      </Row>
      
      <Divider>ميزات الرسالة</Divider>
      <Text className="block mb-4 text-gray-600">إدارة النقاط المميزة في قسم الرسالة</Text>
      
      {missionData.missionFeatures.map((feature, index) => (
        <Card key={index} className="mb-3" size="small">
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input 
                placeholder="عنوان الميزة"
                value={feature.title}
                onChange={(e) => {
                  const newFeatures = [...missionData.missionFeatures];
                  newFeatures[index].title = e.target.value;
                  setMissionData({...missionData, missionFeatures: newFeatures});
                }}
              />
            </Col>
            <Col span={16}>
              <TextArea 
                rows={2}
                placeholder="وصف الميزة"
                value={feature.description}
                onChange={(e) => {
                  const newFeatures = [...missionData.missionFeatures];
                  newFeatures[index].description = e.target.value;
                  setMissionData({...missionData, missionFeatures: newFeatures});
                }}
              />
            </Col>
            <Col span={2}>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newFeatures = missionData.missionFeatures.filter((_, i) => i !== index);
                  setMissionData({...missionData, missionFeatures: newFeatures});
                }}
              />
            </Col>
          </Row>
        </Card>
      ))}
      
      <Button 
        type="dashed" 
        icon={<PlusOutlined />}
        onClick={() => {
          const newFeatures = [...missionData.missionFeatures, { title: '', description: '' }];
          setMissionData({...missionData, missionFeatures: newFeatures});
        }}
        className="w-full"
      >
        إضافة ميزة جديدة
      </Button>
    </div>
  );

  // Team Section Render
  const renderTeamSection = () => (
    <div>
      <Title level={4}>إدارة الفريق</Title>
      <Text className="block mb-4 text-gray-600">إدارة أعضاء الفريق المعروضين في الصفحة</Text>
      
      {teamData.map((member, index) => (
        <Card key={index} className="mb-4" size="small">
          <Row gutter={16} align="middle">
            <Col span={7}>
              <Text strong>اسم العضو</Text>
              <Input 
                placeholder="أحمد محمد" 
                value={member.name}
                onChange={(e) => {
                  const newData = [...teamData];
                  newData[index].name = e.target.value;
                  setTeamData(newData);
                }}
                className="mt-2"
              />
            </Col>
            <Col span={7}>
              <Text strong>المنصب</Text>
              <Input 
                placeholder="مؤسس ومدير إبداعي" 
                value={member.role}
                onChange={(e) => {
                  const newData = [...teamData];
                  newData[index].role = e.target.value;
                  setTeamData(newData);
                }}
                className="mt-2"
              />
            </Col>
            <Col span={8}>
              <Text strong>الوصف</Text>
              <TextArea 
                rows={2}
                placeholder="خبرة أكثر من 8 سنوات في مجال التصميم..." 
                value={member.description}
                onChange={(e) => {
                  const newData = [...teamData];
                  newData[index].description = e.target.value;
                  setTeamData(newData);
                }}
                className="mt-2"
              />
            </Col>
            <Col span={2}>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newData = teamData.filter((_, i) => i !== index);
                  setTeamData(newData);
                }}
              />
            </Col>
          </Row>
        </Card>
      ))}
      <Button 
        type="dashed" 
        icon={<PlusOutlined />}
        onClick={() => setTeamData([...teamData, { name: '', role: '', description: '' }])}
        className="w-full"
      >
        إضافة عضو جديد
      </Button>
    </div>
  );

  // Process Section Render
  const renderProcessSection = () => (
    <div>
      <Title level={4}>خطوات العملية الإبداعية</Title>
      <Text className="block mb-4 text-gray-600">إدارة خطوات العمل في الشركة</Text>
      
      {processData.map((step, index) => (
        <Card key={index} className="mb-4" size="small">
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Text strong>عنوان الخطوة</Text>
              <Input 
                placeholder="الاستماع" 
                value={step.title}
                onChange={(e) => {
                  const newData = [...processData];
                  newData[index].title = e.target.value;
                  setProcessData(newData);
                }}
                className="mt-2"
              />
            </Col>
            <Col span={10}>
              <Text strong>وصف الخطوة</Text>
              <TextArea 
                rows={2}
                placeholder="نستمع لأحلامك وأهدافك لنفهم رؤيتك..." 
                value={step.description}
                onChange={(e) => {
                  const newData = [...processData];
                  newData[index].description = e.target.value;
                  setProcessData(newData);
                }}
                className="mt-2"
              />
            </Col>
            <Col span={6}>
              <Text strong>الأيقونة</Text>
              <div className="mt-2">
                <div className="grid grid-cols-4 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {[
                    { value: "CheckCircle", icon: "✓", label: "علامة صح" },
                    { value: "Eye", icon: "👁", label: "العين" },
                    { value: "Award", icon: "🏆", label: "الجائزة" },
                    { value: "Target", icon: "🎯", label: "الهدف" },
                    { value: "Heart", icon: "❤️", label: "القلب" },
                    { value: "Shield", icon: "🛡️", label: "الدرع" },
                    { value: "Star", icon: "⭐", label: "النجمة" },
                    { value: "Clock", icon: "⏰", label: "الساعة" },
                    { value: "Users", icon: "👥", label: "المستخدمين" },
                    { value: "Lightbulb", icon: "💡", label: "المصباح" },
                    { value: "Rocket", icon: "🚀", label: "الصاروخ" },
                    { value: "Zap", icon: "⚡", label: "البرق" }
                  ].map((iconOption) => (
                    <button
                      key={iconOption.value}
                      type="button"
                      onClick={() => {
                        const newData = [...processData];
                        newData[index].icon = iconOption.value;
                        setProcessData(newData);
                      }}
                      className={`
                        p-2 rounded-md border-2 transition-all duration-200 text-center
                        ${step.icon === iconOption.value 
                          ? 'border-blue-500 bg-blue-100 shadow-md' 
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }
                      `}
                      title={iconOption.label}
                    >
                      <div className="text-lg">{iconOption.icon}</div>
                    </button>
                  ))}
                </div>
                {step.icon && (
                  <div className="mt-2 text-sm text-gray-600 text-center">
                    المحدد: {[
                      { value: "CheckCircle", icon: "✓", label: "علامة صح" },
                      { value: "Eye", icon: "👁", label: "العين" },
                      { value: "Award", icon: "🏆", label: "الجائزة" },
                      { value: "Target", icon: "🎯", label: "الهدف" },
                      { value: "Heart", icon: "❤️", label: "القلب" },
                      { value: "Shield", icon: "🛡️", label: "الدرع" },
                      { value: "Star", icon: "⭐", label: "النجمة" },
                      { value: "Clock", icon: "⏰", label: "الساعة" },
                      { value: "Users", icon: "👥", label: "المستخدمين" },
                      { value: "Lightbulb", icon: "💡", label: "المصباح" },
                      { value: "Rocket", icon: "🚀", label: "الصاروخ" },
                      { value: "Zap", icon: "⚡", label: "البرق" }
                    ].find(opt => opt.value === step.icon)?.icon} {[
                      { value: "CheckCircle", icon: "✓", label: "علامة صح" },
                      { value: "Eye", icon: "👁", label: "العين" },
                      { value: "Award", icon: "🏆", label: "الجائزة" },
                      { value: "Target", icon: "🎯", label: "الهدف" },
                      { value: "Heart", icon: "❤️", label: "القلب" },
                      { value: "Shield", icon: "🛡️", label: "الدرع" },
                      { value: "Star", icon: "⭐", label: "النجمة" },
                      { value: "Clock", icon: "⏰", label: "الساعة" },
                      { value: "Users", icon: "👥", label: "المستخدمين" },
                      { value: "Lightbulb", icon: "💡", label: "المصباح" },
                      { value: "Rocket", icon: "🚀", label: "الصاروخ" },
                      { value: "Zap", icon: "⚡", label: "البرق" }
                    ].find(opt => opt.value === step.icon)?.label}
                  </div>
                )}
              </div>
            </Col>
            <Col span={2}>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newData = processData.filter((_, i) => i !== index);
                  setProcessData(newData);
                }}
              />
            </Col>
          </Row>
        </Card>
      ))}
      <Button 
        type="dashed" 
        icon={<PlusOutlined />}
        onClick={() => setProcessData([...processData, { title: '', description: '', icon: '' }])}
        className="w-full"
      >
        إضافة خطوة جديدة
      </Button>
    </div>
  );

  // Page Banner Section Render
  const renderPageBannerSection = () => (
    <div>
      <Title level={4}>بانر الصفحة الوسطي</Title>
      <Row gutter={16}>
        <Col span={24}>
          <Text strong>عنوان البانر</Text>
          <TextArea 
            rows={2}
            value={pageBannerData.pageBannerTitle}
            onChange={(e) => setPageBannerData({...pageBannerData, pageBannerTitle: e.target.value})}
            placeholder="تصاميم تُحاكي رؤيتك وتُترجمها بصريًا"
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={24}>
          <Text strong>النص الفرعي</Text>
          <TextArea 
            rows={2}
            value={pageBannerData.pageBannerSubtitle}
            onChange={(e) => setPageBannerData({...pageBannerData, pageBannerSubtitle: e.target.value})}
            placeholder="حضور بصري يُعبّر عنك ويُترجم هويتك بأسلوب مميز"
            className="mt-2 mb-4"
          />
        </Col>
      </Row>
      
      <Divider>أزرار البانر</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Text strong>نص الزر الأساسي</Text>
          <Input 
            value={pageBannerData.pageBannerCtaText}
            onChange={(e) => setPageBannerData({...pageBannerData, pageBannerCtaText: e.target.value})}
            placeholder="ابدأ مشروعك"
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={12}>
          <Text strong>نص الزر الثانوي</Text>
          <Input 
            value={pageBannerData.pageBannerSecondaryCtaText}
            onChange={(e) => setPageBannerData({...pageBannerData, pageBannerSecondaryCtaText: e.target.value})}
            placeholder="تواصل معنا"
            className="mt-2 mb-4"
          />
        </Col>
      </Row>

      <Divider>ميزات البانر</Divider>
      <Text className="block mb-4 text-gray-600">النقاط المعروضة أسفل البانر</Text>
      
      {pageBannerData.pageBannerFeatures.map((feature, index) => (
        <Card key={index} className="mb-3" size="small">
          <Row gutter={16} align="middle">
            <Col span={20}>
              <Input 
                placeholder="نص الميزة"
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...pageBannerData.pageBannerFeatures];
                  newFeatures[index] = e.target.value;
                  setPageBannerData({...pageBannerData, pageBannerFeatures: newFeatures});
                }}
              />
            </Col>
            <Col span={4}>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newFeatures = pageBannerData.pageBannerFeatures.filter((_, i) => i !== index);
                  setPageBannerData({...pageBannerData, pageBannerFeatures: newFeatures});
                }}
              />
            </Col>
          </Row>
        </Card>
      ))}
      
      <Button 
        type="dashed" 
        icon={<PlusOutlined />}
        onClick={() => {
          const newFeatures = [...pageBannerData.pageBannerFeatures, ''];
          setPageBannerData({...pageBannerData, pageBannerFeatures: newFeatures});
        }}
        className="w-full"
      >
        إضافة ميزة جديدة
      </Button>
    </div>
  );

  // Vision Section Render
  const renderVisionSection = () => (
    <div>
      <Title level={4}>قسم الرؤية</Title>
      <Row gutter={16}>
        <Col span={24}>
          <Text strong>عنوان الرؤية</Text>
          <Input 
            value={visionData.visionTitle}
            onChange={(e) => setVisionData({...visionData, visionTitle: e.target.value})}
            placeholder="رؤيتنا للمستقبل"
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={24}>
          <Text strong>محتوى الرؤية</Text>
          <TextArea 
            rows={4}
            value={visionData.visionBody}
            onChange={(e) => setVisionData({...visionData, visionBody: e.target.value})}
            placeholder="نطمح لأن نكون الاسم الأول..."
            className="mt-2"
          />
        </Col>
      </Row>
    </div>
  );

  // Values Section Render
  const renderValuesSection = () => (
    <div>
      <Title level={4}>القيم الأساسية</Title>
      <Text className="block mb-4 text-gray-600">إدارة القيم الأساسية للشركة</Text>
      
      {valuesData.map((value, index) => (
        <Card key={index} className="mb-4" size="small">
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Text strong>عنوان القيمة</Text>
              <Input 
                placeholder="الأصالة" 
                value={value.title}
                onChange={(e) => {
                  const newData = [...valuesData];
                  newData[index].title = e.target.value;
                  setValuesData(newData);
                }}
                className="mt-2"
              />
            </Col>
            <Col span={12}>
              <Text strong>وصف القيمة</Text>
              <TextArea 
                rows={2}
                placeholder="نؤمن بأن كل مشروع فريد..." 
                value={value.description}
                onChange={(e) => {
                  const newData = [...valuesData];
                  newData[index].description = e.target.value;
                  setValuesData(newData);
                }}
                className="mt-2"
              />
            </Col>
            <Col span={4}>
              <Text strong>الأيقونة</Text>
              <div className="mt-2">
                <div className="grid grid-cols-3 gap-1 p-2 border border-gray-200 rounded-lg bg-gray-50">
                  {[
                    { value: "CheckCircle", icon: "✓", label: "علامة صح" },
                    { value: "Eye", icon: "👁", label: "العين" },
                    { value: "Award", icon: "🏆", label: "الجائزة" },
                    { value: "Target", icon: "🎯", label: "الهدف" },
                    { value: "Heart", icon: "❤️", label: "القلب" },
                    { value: "Shield", icon: "🛡️", label: "الدرع" },
                    { value: "Star", icon: "⭐", label: "النجمة" },
                    { value: "Clock", icon: "⏰", label: "الساعة" },
                    { value: "Users", icon: "👥", label: "المستخدمين" },
                    { value: "Lightbulb", icon: "💡", label: "المصباح" },
                    { value: "Rocket", icon: "🚀", label: "الصاروخ" },
                    { value: "Zap", icon: "⚡", label: "البرق" }
                  ].map((iconOption) => (
                    <button
                      key={iconOption.value}
                      type="button"
                      onClick={() => {
                        const newData = [...valuesData];
                        newData[index].icon = iconOption.value;
                        setValuesData(newData);
                      }}
                      className={`
                        p-1 rounded border-2 transition-all duration-200 text-center text-sm
                        ${value.icon === iconOption.value 
                          ? 'border-blue-500 bg-blue-100 shadow-md' 
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }
                      `}
                      title={iconOption.label}
                    >
                      <div className="text-base">{iconOption.icon}</div>
                    </button>
                  ))}
                </div>
                {value.icon && (
                  <div className="mt-1 text-xs text-gray-600 text-center">
                    {[
                      { value: "CheckCircle", icon: "✓", label: "علامة صح" },
                      { value: "Eye", icon: "👁", label: "العين" },
                      { value: "Award", icon: "🏆", label: "الجائزة" },
                      { value: "Target", icon: "🎯", label: "الهدف" },
                      { value: "Heart", icon: "❤️", label: "القلب" },
                      { value: "Shield", icon: "🛡️", label: "الدرع" },
                      { value: "Star", icon: "⭐", label: "النجمة" },
                      { value: "Clock", icon: "⏰", label: "الساعة" },
                      { value: "Users", icon: "👥", label: "المستخدمين" },
                      { value: "Lightbulb", icon: "💡", label: "المصباح" },
                      { value: "Rocket", icon: "🚀", label: "الصاروخ" },
                      { value: "Zap", icon: "⚡", label: "البرق" }
                    ].find(opt => opt.value === value.icon)?.icon} {[
                      { value: "CheckCircle", icon: "✓", label: "علامة صح" },
                      { value: "Eye", icon: "👁", label: "العين" },
                      { value: "Award", icon: "🏆", label: "الجائزة" },
                      { value: "Target", icon: "🎯", label: "الهدف" },
                      { value: "Heart", icon: "❤️", label: "القلب" },
                      { value: "Shield", icon: "🛡️", label: "الدرع" },
                      { value: "Star", icon: "⭐", label: "النجمة" },
                      { value: "Clock", icon: "⏰", label: "الساعة" },
                      { value: "Users", icon: "👥", label: "المستخدمين" },
                      { value: "Lightbulb", icon: "💡", label: "المصباح" },
                      { value: "Rocket", icon: "🚀", label: "الصاروخ" },
                      { value: "Zap", icon: "⚡", label: "البرق" }
                    ].find(opt => opt.value === value.icon)?.label}
                  </div>
                )}
              </div>
            </Col>
            <Col span={2}>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newData = valuesData.filter((_, i) => i !== index);
                  setValuesData(newData);
                }}
              />
            </Col>
          </Row>
        </Card>
      ))}
      <Button 
        type="dashed" 
        icon={<PlusOutlined />}
        onClick={() => setValuesData([...valuesData, { title: '', description: '', icon: '' }])}
        className="w-full"
      >
        إضافة قيمة جديدة
      </Button>
    </div>
  );

  // Why Us Section Render
  const renderWhyUsSection = () => (
    <div>
      <Title level={4}>قسم لماذا نحن</Title>
      <Row gutter={16}>
        <Col span={24}>
          <Text strong>عنوان القسم</Text>
          <Input 
            value={whyUsData.whyUsTitle}
            onChange={(e) => setWhyUsData({...whyUsData, whyUsTitle: e.target.value})}
            placeholder="لماذا نحن"
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={24}>
          <Text strong>محتوى القسم</Text>
          <TextArea 
            rows={4}
            value={whyUsData.whyUsBody}
            onChange={(e) => setWhyUsData({...whyUsData, whyUsBody: e.target.value})}
            placeholder="نحن نقدم خدمات تصميم متميزة..."
            className="mt-2"
          />
        </Col>
      </Row>
    </div>
  );

  // CTA Section Render
  const renderCTASection = () => (
    <div>
      <Title level={4}>قسم الدعوة للعمل</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Text strong>نص الزر الأساسي</Text>
          <Input 
            value={ctaData.ctaPrimaryText}
            onChange={(e) => setCTAData({...ctaData, ctaPrimaryText: e.target.value})}
            placeholder="تواصل معنا"
            className="mt-2 mb-4"
          />
        </Col>
        <Col span={12}>
          <Text strong>نص الزر الثانوي</Text>
          <Input 
            value={ctaData.ctaSecondaryText}
            onChange={(e) => setCTAData({...ctaData, ctaSecondaryText: e.target.value})}
            placeholder="تعرف على خدماتنا"
            className="mt-2 mb-4"
          />
        </Col>
      </Row>
    </div>
  );

  if (!admin) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login?message=redirect';
    }
    return null;
  }

  return (
    <div className="p-6">
      <style jsx>{`
        .about-admin-tabs .ant-tabs-nav {
          margin-bottom: 16px !important;
          padding: 0 !important;
        }
        
        .about-admin-tabs .ant-tabs-nav-wrap {
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .about-admin-tabs .ant-tabs-nav-list {
          transform: none !important;
          display: flex !important;
          flex-wrap: nowrap !important;
          gap: 16px !important;
          justify-content: flex-start !important;
          align-items: center !important;
          width: 100% !important;
          overflow-x: auto;
          scrollbar-width: thin;
        }
        
        .about-admin-tabs .ant-tabs-tab {
          margin: 0 !important;
          padding: 10px 16px !important;
          font-size: 14px !important;
          border-radius: 8px !important;
          min-width: 96px !important;
          height: auto !important;
          flex: 0 0 auto !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #fff !important;
          border: 1px solid #e5e7eb !important;
        }
        
        /* ensure consistent spacing between adjacent tabs in RTL */
        .about-admin-tabs .ant-tabs-tab + .ant-tabs-tab {
          margin-right: 0 !important;
        }
        
        .about-admin-tabs .ant-tabs-tab-btn {
          padding: 0 4px !important;
        }
        
        .about-admin-tabs .ant-tabs-nav-more,
        .about-admin-tabs .ant-tabs-nav-operations {
          display: none !important;
        }
        
        .about-admin-tabs {
          overflow: visible !important;
        }
        
        .about-admin-tabs .ant-tabs-content-holder {
          padding-top: 24px;
        }

        @media (max-width: 768px) {
          .about-admin-tabs .ant-tabs-nav-list {
            gap: 12px !important;
          }
          .about-admin-tabs .ant-tabs-tab {
            min-width: 84px !important;
            padding: 8px 12px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <UserOutlined />
          إدارة صفحة من نحن - المحتوى الحقيقي المُحدث
        </h1>
        <p className="text-gray-600">
          تحكم في جميع عناصر ومحتوى صفحة من نحن بالتطابق التام مع الموقع المُباشر
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
              حفظ جميع التغييرات
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
            >
              إعادة تحميل البيانات
            </Button>
            <Button 
              icon={<EyeOutlined />}
              href="/about"
              target="_blank"
            >
              معاينة الصفحة المُباشرة
            </Button>
          </Space>
        </div>

        <Divider />

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          type="line"
          size="large"
          tabPosition="top"
          style={{ direction: 'rtl' }}
          className="about-admin-tabs"
          items={[
            {
              key: 'seo',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500', display: 'none' }}>
                  🔍 SEO
                </span>
              ),
              children: <div style={{ display: 'none' }}>{renderSEOSection()}</div>,
              style: { display: 'none' }
            },
            {
              key: 'hero',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  🎯 الرئيسي
                </span>
              ),
              children: renderHeroSection()
            },
            {
              key: 'mission',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  💫 الرسالة
                </span>
              ),
              children: renderMissionSection()
            },
            {
              key: 'team',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  👥 الفريق
                </span>
              ),
              children: renderTeamSection()
            },
            {
              key: 'process',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  ⚡ العمل
                </span>
              ),
              children: renderProcessSection()
            },
            {
              key: 'pageBanner',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  🎨 البانر
                </span>
              ),
              children: renderPageBannerSection()
            },
            {
              key: 'vision',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  🌟 الرؤية
                </span>
              ),
              children: renderVisionSection()
            },
            {
              key: 'values',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  💎 القيم
                </span>
              ),
              children: renderValuesSection()
            },
            {
              key: 'whyUs',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  🚀 لماذا نحن
                </span>
              ),
              children: renderWhyUsSection()
            },
            {
              key: 'cta',
              label: (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  📞 اتصال
                </span>
              ),
              children: renderCTASection()
            }
          ]}
        />
      </Card>
    </div>
  );
}
