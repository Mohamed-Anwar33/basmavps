'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Switch,
  Select,
  InputNumber,
  message,
  Drawer,
  Divider,
  Badge,
  Tooltip,
  Row,
  Col,
  App,
  Typography,
  Tabs,
  Radio
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
  SettingOutlined,
  PictureOutlined,
  CalculatorOutlined,
  RobotOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import MainImageManager from '@/components/admin/MainImageManager';
import ServiceImageManager from '@/components/admin/ServiceImageManager';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { useCurrency } from '@/contexts/currency-context';

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
    type: 'links';
    links: {
      title: string;
      url: string;
      imageUrl?: string;
      locale: string;
      tags: string[];
    }[];
  };
  uiTexts?: {
    quality?: { title: string; subtitle: string };
    details?: { title: string; content: string };
    notice?: { title: string; content: string };
    detailsTitle?: string;
    detailsPoints?: string[];
  };
  images: string[];
  mainImages?: {
    _id: string;
    url: string;
    alt: string;
    order: number;
    uploadedAt: string;
    uploadedBy: string;
  }[];
  portfolioImages?: {
    _id: string;
    url: string;
    alt: string;
    order: number;
    uploadedAt: string;
    uploadedBy: string;
  }[];
  nonRefundable?: boolean;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

function ServicesManagement() {
  const { message, modal } = App.useApp();
  const { handleApiError, admin, token, loading: authLoading } = useAdminAuth();
  const { convert, rates, refreshRates, isLoading } = useCurrency();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([
    { value: 'all', label: 'جميع الفئات' }
  ]);
  
  // حالة تحديد السعر بالدولار
  const [usdPriceMode, setUsdPriceMode] = useState<'auto' | 'manual'>('auto');
  
  // مراقبة السعر بالريال لتحديث فوري
  const [sarPrice, setSarPrice] = useState<number | null>(null);
  
  // السعر بالدولار المحسوب تلقائياً
  const [calculatedUsdPrice, setCalculatedUsdPrice] = useState<number | null>(null);
  
  // السعر الأصلي بالدولار المحسوب تلقائياً
  const [calculatedOriginalUsdPrice, setCalculatedOriginalUsdPrice] = useState<number | null>(null);

  // دالة حساب السعر بالدولار تلقائياً
  const calculateUSDPrice = (sarPrice: number): number => {
    if (!sarPrice || sarPrice <= 0) return 0;
    
    const currentRate = rates.SAR || 3.75; // fallback rate
    const usdPrice = Number(convert(sarPrice, 'SAR', 'USD').toFixed(2));
    
    console.log('💱 Exchange Rate Details:', {
      sarAmount: sarPrice,
      currentSARRate: currentRate,
      calculatedUSD: usdPrice,
      formula: `${sarPrice} SAR ÷ ${currentRate} = ${usdPrice} USD`,
      source: 'ExchangeRate-API.com',
      timestamp: new Date().toISOString()
    });
    
    return usdPrice;
  };

  // دالة حساب نسبة الخصم
  const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
    if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };


  // مراقبة مباشرة للسعر بالريال وتحديث الدولار فوراً
  useEffect(() => {
    if (usdPriceMode === 'auto') {
      if (sarPrice && sarPrice > 0) {
        const usdPrice = calculateUSDPrice(sarPrice);
        setCalculatedUsdPrice(usdPrice);
        form.setFieldValue(['price', 'USD'], usdPrice);
      } else {
        setCalculatedUsdPrice(null);
        form.setFieldValue(['price', 'USD'], null);
      }
    }
  }, [sarPrice, usdPriceMode, form, convert]);

  // مراقبة السعر الأصلي بالريال وتحديث الدولار
  useEffect(() => {
    const originalSarPrice = form.getFieldValue(['originalPrice', 'SAR']);
    if (usdPriceMode === 'auto' && originalSarPrice && originalSarPrice > 0) {
      const originalUsdPrice = calculateUSDPrice(originalSarPrice);
      setCalculatedOriginalUsdPrice(originalUsdPrice);
      form.setFieldValue(['originalPrice', 'USD'], originalUsdPrice);
    } else if (usdPriceMode === 'auto') {
      setCalculatedOriginalUsdPrice(null);
      form.setFieldValue(['originalPrice', 'USD'], null);
    }
  }, [form.getFieldValue(['originalPrice', 'SAR']), usdPriceMode]);

  useEffect(() => {
    if (!authLoading && admin && token) {
      fetchCategories();
      fetchServices();
    }
  }, [authLoading, admin, token]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await apiFetch('/admin/services/categories', { auth: true }) as any;
      
      
      // تحويل مصفوفة النصوص إلى مصفوفة كائنات
      let categoriesData: string[] = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response?.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
      }
      
      const formattedCategories = [
        { value: 'all', label: 'جميع الفئات' },
        ...categoriesData.map((cat: string) => ({ value: cat, label: cat }))
      ];
      
      setCategories(formattedCategories);
    } catch (error) {
      handleApiError(error, 'فئات الخدمات');
      // Fallback to default categories if API fails
      const defaultCategories = [
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
        { value: 'management', label: 'الإدارة' }
      ];
      setCategories(defaultCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/admin/services?page=${currentPage}&limit=50&search=${searchText}&category=${selectedCategory === 'all' ? '' : selectedCategory}`, {
        auth: true
      }) as { data: { services: Service[]; pagination: { total: number } } };
      
      setServices(response.data?.services || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      handleApiError(error, 'الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    
    // إعادة تعيين طريقة السعر بالدولار إلى التلقائي
    setUsdPriceMode('auto');
    
    
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
      category: serviceData.category ? [serviceData.category] : [],
      features: {
        ar: getNestedValue(serviceData, 'features.ar', null) || (Array.isArray(serviceData.features) ? serviceData.features : []),
      },
      deliveryFormats: Array.isArray(serviceData.deliveryFormats) ? serviceData.deliveryFormats : [],
      digitalDelivery: serviceData.digitalDelivery?.links || [],
      uiTexts: {
        // الحقول الجديدة
        shortDescription: serviceData.uiTexts?.shortDescription || '',
        workSteps: serviceData.uiTexts?.workSteps || [],
        customFeatures: serviceData.uiTexts?.customFeatures || [],
        // الحقول الموجودة
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
      images: serviceData.images || [], // إضافة الصور لقيم النموذج
    });
    
    console.log('🔍 Form values set:', {
      qualityTitle: serviceData.uiTexts?.qualityTitle?.ar,
      qualitySubtitle: serviceData.uiTexts?.qualitySubtitle?.ar,
      detailsTitle: serviceData.uiTexts?.detailsTitle?.ar,
      details: serviceData.uiTexts?.details?.ar,
      noticeTitle: serviceData.uiTexts?.noticeTitle?.ar,
      notice: serviceData.uiTexts?.notice?.ar,
      images: serviceData.images?.length || 0
    });
    
    setIsModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    try {
      if (!editingService) return;
      
      
      // Transform form data to match backend schema (same as handleAdd)
      // Ensure multilingual fields are populated (backend requires both ar and en)
      const normalizedTitle = {
        ar: values?.title?.ar || '',
        en: values?.title?.en || values?.title?.ar || ''
      };
      const normalizedDescription = {
        ar: values?.description?.ar || '',
        en: values?.description?.en || values?.description?.ar || ''
      };

      const normalizedFeatures = (() => {
        const f = values?.features || {};
        const ar: string[] = Array.isArray(f?.ar) ? f.ar : (Array.isArray(values?.features) ? values.features : []);
        const en: string[] = Array.isArray((f as any)?.en) ? (f as any).en : ar;
        return { ar, en };
      })();

      const normalizedDeliveryFormats: string[] = Array.isArray(values?.deliveryFormats) ? values.deliveryFormats.filter((x: any) => typeof x === 'string') : [];

      const normalizedPrice = {
        SAR: typeof values?.price?.SAR === 'number' ? values.price.SAR : Number(values?.price) || 0,
        USD: typeof values?.price?.USD === 'number' ? values.price.USD : 0,
      };

      const transformedData = {
        ...values,
        title: normalizedTitle,
        description: normalizedDescription,
        // Ensure category is a string for backend
        category: Array.isArray(values.category) ? values.category[0] : values.category,
        // Ensure digitalDelivery is properly structured
        digitalDelivery: values.digitalDelivery && values.digitalDelivery.length > 0 ? {
          type: 'links',
          links: values.digitalDelivery.map((link: any) => ({
            title: link.title || '',
            url: link.url || '',
            imageUrl: link.imageUrl || '',
            locale: link.locale || 'ar',
            tags: Array.isArray(link.tags) ? link.tags : []
          }))
        } : undefined,
        uiTexts: {
          // إضافة الحقول الجديدة للتحديث
          shortDescription: values.uiTexts?.shortDescription || '',
          workSteps: values.uiTexts?.workSteps || [],
          customFeatures: values.uiTexts?.customFeatures || [],
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
        },
        // Ensure default values for required fields
        deliveryTime: values.deliveryTime || { min: 1, max: 7 },
        revisions: values.revisions || 2,
        price: normalizedPrice,
        features: normalizedFeatures,
        deliveryFormats: normalizedDeliveryFormats,
        isActive: values.isActive !== undefined ? values.isActive : true,
        isFeatured: values.isFeatured !== undefined ? values.isFeatured : false,
        order: values.order || 1,
        nonRefundable: values.nonRefundable !== undefined ? values.nonRefundable : true
        // Note: Removed images field to prevent overwriting existing images in backend
      };
      
      // تأكد من أن جميع الحقول المطلوبة موجودة
      if (!transformedData.title?.ar) {
        throw new Error('العنوان العربي مطلوب');
      }
      if (!transformedData.description?.ar) {
        throw new Error('الوصف العربي مطلوب');
      }
      if (typeof transformedData.price?.SAR !== 'number' || transformedData.price.SAR < 0) {
        throw new Error('السعر بالريال يجب أن يكون رقم صحيح');
      }
      if (typeof transformedData.price?.USD !== 'number' || transformedData.price.USD < 0) {
        throw new Error('السعر بالدولار يجب أن يكون رقم صحيح');
      }
      
      // إضافة slug إذا لم يكن موجود
      if (!transformedData.slug && transformedData.title?.ar) {
        transformedData.slug = transformedData.title.ar
          .toLowerCase()
          .replace(/[^\u0600-\u06FF\w\s-]/g, '') // إزالة الرموز الخاصة
          .replace(/\s+/g, '-') // استبدال المسافات بـ -
          .replace(/-+/g, '-') // إزالة - المتكررة
          .trim();
      }

      console.log('📤 Sending transformed data:', JSON.stringify(transformedData, null, 2));
      console.log('💰 Price details:', {
        SAR: transformedData.price?.SAR,
        USD: transformedData.price?.USD,
        SARType: typeof transformedData.price?.SAR,
        USDType: typeof transformedData.price?.USD
      });
      console.log('🔍 Title validation:', {
        titleAr: transformedData.title?.ar,
        titleEn: transformedData.title?.en,
        slug: transformedData.slug
      });
      
      const response = await apiFetch(`/admin/services/${editingService._id}`, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
        auth: true
      }) as { success: boolean; message?: string };
      
      
      if (response.success) {
        message.success('تم تحديث الخدمة بنجاح');
        
        // Refresh categories list in case category was changed
        await fetchCategories();
        
        // Refresh the services list
        await fetchServices();
        
        // Get the updated service data and refresh the form
        const updatedServices = await apiFetch(`/admin/services?page=1&limit=50`, { auth: true }) as { data: { services: Service[] } };
        const updatedService = updatedServices.data.services.find(s => s._id === editingService._id);
        
        if (updatedService) {
          // Update the editing service state
          setEditingService(updatedService);
          
          // Refresh the form with updated data using the same logic as openEditModal
          const serviceData = updatedService as any;
          
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

          const formData = {
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
            category: serviceData.category ? [serviceData.category] : [],
            features: {
              ar: getNestedValue(serviceData, 'features.ar', null) || (Array.isArray(serviceData.features) ? serviceData.features : []),
            },
            deliveryFormats: Array.isArray(serviceData.deliveryFormats) ? serviceData.deliveryFormats : [],
            digitalDelivery: serviceData.digitalDelivery?.links || [],
            uiTexts: {
              shortDescription: serviceData.uiTexts?.shortDescription || '',
              workSteps: serviceData.uiTexts?.workSteps || [],
              customFeatures: serviceData.uiTexts?.customFeatures || [],
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
              detailsPoints: serviceData.uiTexts?.detailsPoints || [],
              qualityPoints: serviceData.uiTexts?.qualityPoints || [],
              noticePoints: serviceData.uiTexts?.noticePoints || [],
            },
            nonRefundable: serviceData.nonRefundable ?? true,
            isActive: serviceData.isActive ?? true,
            isFeatured: serviceData.isFeatured ?? false,
            order: serviceData.order || 0,
            slug: serviceData.slug || '',
            images: serviceData.images || [],
            mainImages: serviceData.mainImages?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
            portfolioImages: serviceData.portfolioImages?.map((img: any) => typeof img === 'string' ? img : img.url) || []
          };
          
          form.setFieldsValue(formData);
        }
      } else {
        message.error(response.message || 'فشل في تحديث الخدمة');
      }
    } catch (error: any) {
      
      let errorMessage = 'حدث خطأ غير متوقع';
      if (error.message) {
        if (error.message.includes('title') && error.message.includes('required')) {
          errorMessage = 'العنوان العربي والإنجليزي مطلوبان';
        } else if (error.message.includes('description') && error.message.includes('required')) {
          errorMessage = 'الوصف العربي والإنجليزي مطلوبان';
        } else if (error.message.includes('price') && error.message.includes('required')) {
          errorMessage = 'السعر بالريال والدولار مطلوبان';
        } else if (error.message.includes('Validation failed')) {
          errorMessage = 'فشل في التحقق من البيانات - تأكد من إدخال جميع الحقول المطلوبة';
        } else {
          errorMessage = error.message;
        }
      }
      
      handleApiError(error, 'تحديث الخدمة');
    }
  };

  const handleDelete = (serviceId: string) => {
    modal.confirm({
      title: 'هل أنت متأكد من حذف هذه الخدمة؟',
      content: 'لا يمكن التراجع عن هذا الإجراء',
      okText: 'حذف',
      cancelText: 'إلغاء',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await apiFetch(`/admin/services/${serviceId}`, {
            method: 'DELETE',
            auth: true
          }) as { success: boolean; message?: string };
          
          
          if (response.success) {
            message.success('تم حذف الخدمة بنجاح');
            fetchServices();
          } else {
            message.error(response.message || 'فشل في حذف الخدمة');
          }
        } catch (error) {
          handleApiError(error, 'حذف الخدمة');
        }
      },
    });
  };

  // 📝 دالة التحقق من البيانات قبل الإرسال
  const validateFormData = (values: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // فحص العنوان
    if (!values?.title?.ar || values.title.ar.trim().length === 0) {
      errors.push('🏷️ العنوان بالعربية مطلوب');
    }
    if (values?.title?.ar && values.title.ar.length < 3) {
      errors.push('🏷️ العنوان يجب أن يكون 3 أحرف على الأقل');
    }
    
    // فحص الوصف
    if (!values?.description?.ar || values.description.ar.trim().length === 0) {
      errors.push('📝 الوصف بالعربية مطلوب');
    }
    if (values?.description?.ar && values.description.ar.length < 10) {
      errors.push('📝 الوصف يجب أن يكون 10 أحرف على الأقل');
    }
    
    // فحص التصنيف (من القائمة أو مخصص)
    const selectedCategory = values?.category;
    const customCategory = values?.customCategory;
    
    if (!selectedCategory && !customCategory) {
      errors.push('📋 يجب اختيار فئة موجودة أو إنشاء فئة جديدة');
    }
    
    // فحص الأسعار
    const sarPrice = values?.price?.SAR;
    const usdPrice = values?.price?.USD;
    
    if (!sarPrice || typeof sarPrice !== 'number' || sarPrice <= 0) {
      errors.push('💰 السعر بالريال مطلوب ويجب أن يكون أكبر من 0');
    }
    if (!usdPrice || typeof usdPrice !== 'number' || usdPrice <= 0) {
      errors.push('💵 السعر بالدولار مطلوب ويجب أن يكون أكبر من 0');
    }
    
    // فحص مدة التنفيذ
    if (!values?.deliveryTime?.min || values.deliveryTime.min < 1) {
      errors.push('📅 الحد الأدنى لمدة التنفيذ مطلوب (يوم واحد على الأقل)');
    }
    if (!values?.deliveryTime?.max || values.deliveryTime.max < values?.deliveryTime?.min) {
      errors.push('📅 الحد الأقصى لمدة التنفيذ يجب أن يكون أكبر من الحد الأدنى');
    }
    
    // فحص عدد المراجعات
    if (values?.revisions === undefined || values.revisions < 0) {
      errors.push('🔄 عدد المراجعات مطلوب (0 أو أكثر)');
    }
    
    // فحص الميزات
    if (!values?.features?.ar || !Array.isArray(values.features.ar) || values.features.ar.length === 0) {
      errors.push('✨ يجب إضافة ميزة واحدة على الأقل');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // 🗨️ دالة عرض رسالة خطأ مفصلة
  const showDetailedErrorMessage = (errors: string[]) => {
    const errorContent = (
      <div className="space-y-2">
        <div className="text-red-800 font-semibold mb-3">
          😱 يجب إصلاح الأخطاء التالية قبل إضافة الخدمة:
        </div>
        <ul className="list-none space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded border-l-4 border-red-300">
              {error}
            </li>
          ))}
        </ul>
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          💡 <strong>نصيحة:</strong> تأكد من ملء جميع الحقول المطلوبة بشكل صحيح
        </div>
      </div>
    );
    
    Modal.error({
      title: '❌ فشل في إضافة الخدمة',
      content: errorContent,
      width: 600,
      okText: 'فهمت، سأقوم بالإصلاح',
      centered: true
    });
  };

  const handleAdd = async (values: any) => {
    try {
      
      // 🔍 التحقق من البيانات قبل المعالجة
      const validation = validateFormData(values);
      if (!validation.isValid) {
        showDetailedErrorMessage(validation.errors);
        return; // إيقاف العملية هنا
      }
      
      message.loading('🔄 جاري إضافة الخدمة...', 0);
      
      // Transform form data to match backend schema (same as handleUpdate)
      // Ensure multilingual fields are populated (backend requires both ar and en)
      const normalizedTitle = {
        ar: values?.title?.ar || '',
        en: values?.title?.en || values?.title?.ar || ''
      };
      const normalizedDescription = {
        ar: values?.description?.ar || '',
        en: values?.description?.en || values?.description?.ar || ''
      };

      const normalizedFeatures = (() => {
        const f = values?.features || {};
        const ar: string[] = Array.isArray(f?.ar) ? f.ar : (Array.isArray(values?.features) ? values.features : []);
        const en: string[] = Array.isArray((f as any)?.en) ? (f as any).en : ar;
        return { ar, en };
      })();

      const normalizedDeliveryFormats: string[] = Array.isArray(values?.deliveryFormats) ? values.deliveryFormats.filter((x: any) => typeof x === 'string') : [];

      const normalizedPrice = {
        SAR: typeof values?.price?.SAR === 'number' ? values.price.SAR : Number(values?.price) || 0,
        USD: typeof values?.price?.USD === 'number' ? values.price.USD : 0,
      };

      const transformedData = {
        ...values,
        title: normalizedTitle,
        description: normalizedDescription,
        // Ensure category is a string for backend
        category: Array.isArray(values.category) ? values.category[0] : values.category,
        // Ensure digitalDelivery is properly structured
        digitalDelivery: values.digitalDelivery && values.digitalDelivery.length > 0 ? {
          type: 'links',
          links: values.digitalDelivery.map((link: any) => ({
            title: link.title || '',
            url: link.url || '',
            imageUrl: link.imageUrl || '',
            locale: link.locale || 'ar',
            tags: Array.isArray(link.tags) ? link.tags : []
          }))
        } : undefined,
        // Transform uiTexts to match backend schema
        uiTexts: {
          // إضافة الحقول الجديدة للإضافة
          shortDescription: values.uiTexts?.shortDescription || '',
          workSteps: values.uiTexts?.workSteps || [],
          customFeatures: values.uiTexts?.customFeatures || [],
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
        },
        // Ensure default values for required fields
        deliveryTime: values.deliveryTime || { min: 1, max: 7 },
        revisions: values.revisions || 2,
        price: normalizedPrice,
        features: normalizedFeatures,
        deliveryFormats: normalizedDeliveryFormats,
        isActive: values.isActive !== undefined ? values.isActive : true,
        isFeatured: values.isFeatured !== undefined ? values.isFeatured : false,
        order: values.order || 1,
        nonRefundable: values.nonRefundable !== undefined ? values.nonRefundable : true,
        // For new services, start with empty images array
        images: []
      };
      
      // تأكد من أن جميع الحقول المطلوبة موجودة للخدمة الجديدة
      if (!transformedData.title?.ar) {
        throw new Error('العنوان العربي مطلوب');
      }
      if (!transformedData.description?.ar) {
        throw new Error('الوصف العربي مطلوب');
      }
      if (typeof transformedData.price?.SAR !== 'number' || transformedData.price.SAR < 0) {
        throw new Error('السعر بالريال يجب أن يكون رقم صحيح');
      }
      if (typeof transformedData.price?.USD !== 'number' || transformedData.price.USD < 0) {
        throw new Error('السعر بالدولار يجب أن يكون رقم صحيح');
      }
      
      
      const response = await apiFetch('/admin/services', {
        method: 'POST',
        body: JSON.stringify(transformedData),
        auth: true
      }) as { success: boolean; message?: string; data?: any };
      
      
      message.destroy(); // إزالة رسالة أنتظر
      
      if (response.success) {
        // 🎉 رسالة نجاح مفصلة
        Modal.success({
          title: '🎉 تم إضافة الخدمة بنجاح!',
          content: (
            <div className="space-y-2">
              <div className="text-green-800">
                ✅ تمت إضافة الخدمة بنجاح إلى النظام
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                💡 يمكنك الآن مشاهدتها في قائمة الخدمات أو في الموقع
              </div>
            </div>
          ),
          okText: 'ممتاز!',
          centered: true
        });
        
        setIsModalVisible(false);
        setEditingService(null);
        form.resetFields();
        
        // Refresh categories list in case a new category was added
        await fetchCategories();
        
        // Refresh services list
        fetchServices();
      } else {
        message.destroy();
        
        // 😱 رسالة خطأ مفصلة من الخادم
        Modal.error({
          title: '❌ فشل في إضافة الخدمة',
          content: (
            <div className="space-y-2">
              <div className="text-red-800">
                😱 حدث خطأ في الخادم عند محاولة حفظ الخدمة:
              </div>
              <div className="text-sm text-red-700 bg-red-50 p-2 rounded border-l-4 border-red-300">
                {response.message || 'خطأ غير محدد من الخادم'}
              </div>
              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                💡 حاول مرة أخرى أو اتصل بالدعم التقني
              </div>
            </div>
          ),
          width: 500,
          okText: 'حاول مرة أخرى',
          centered: true
        });
      }
    } catch (error: any) {
      message.destroy(); // إزالة رسالة الانتظار
      
      // 🚨 رسالة خطأ شاملة للأخطاء التقنية
      let errorTitle = '😱 خطأ تقني في النظام';
      let errorMessage = 'حدث خطأ غير متوقع أثناء محاولة إضافة الخدمة';
      let helpText = '💡 حاول مرة أخرى أو اتصل بالدعم التقني';
      
      if (error.message) {
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          errorTitle = '🚫 مشكلة في الاتصال';
          errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت.';
          helpText = '🔄 تأكد من اتصالك بالإنترنت وحاول مرة أخرى';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorTitle = '🔒 مشكلة في الصلاحيات';
          errorMessage = 'انتهت صلاحية الوصول. يرجى تسجيل الدخول مرة أخرى.';
          helpText = '🔄 سجل خروج ثم سجل دخول مرة أخرى';
        } else if (error.message.includes('title') && error.message.includes('required')) {
          errorTitle = '🏷️ مشكلة في العنوان';
          errorMessage = 'العنوان بالعربية والإنجليزية مطلوبان';
        } else if (error.message.includes('description') && error.message.includes('required')) {
          errorTitle = '📝 مشكلة في الوصف';
          errorMessage = 'الوصف بالعربية والإنجليزية مطلوبان';
        } else if (error.message.includes('price') && error.message.includes('required')) {
          errorTitle = '💰 مشكلة في السعر';
          errorMessage = 'السعر بالريال والدولار مطلوبان';
        } else if (error.message.includes('Validation failed')) {
          errorTitle = '🔍 مشكلة في البيانات';
          errorMessage = 'فشل في التحقق من البيانات - تأكد من إدخال جميع الحقول المطلوبة';
        } else {
          errorMessage = error.message;
        }
      }
      
      Modal.error({
        title: errorTitle,
        content: (
          <div className="space-y-3">
            <div className="text-red-800">
              {errorMessage}
            </div>
            {error.message && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                <strong>تفاصيل تقنية:</strong> {error.message}
              </div>
            )}
            <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
              {helpText}
            </div>
          </div>
        ),
        width: 600,
        okText: 'فهمت',
        centered: true
      });
      
      handleApiError(error, 'إضافة الخدمة');
    }
  };

  const getServiceTitle = (title: any) => {
    if (typeof title === 'object' && title.ar) {
      return title.ar;
    }
    return title || 'بدون عنوان';
  };

  const getServicePrice = (price: any) => {
    
    if (typeof price === 'object' && price !== null) {
      if (typeof price.SAR === 'number') {
        return `${price.SAR} ر.س`;
      }
      if (price.SAR !== undefined) {
        return `${price.SAR} ر.س`;
      }
    }
    
    if (typeof price === 'number') {
      return `${price} ر.س`;
    }
    
    return 'غير محدد';
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
      render: (title: any, record: Service) => {
        // Get cover image - prioritize mainImages, fallback to regular images
        const getCoverImage = () => {
          // First try mainImages (cover images)
          if (record.mainImages && record.mainImages.length > 0) {
            const firstMainImage = record.mainImages[0];
            return typeof firstMainImage === 'string' ? firstMainImage : firstMainImage.url;
          }
          // Fallback to regular images
          if (record.images && record.images.length > 0) {
            return record.images[0];
          }
          return null;
        };

        const coverImage = getCoverImage();

        return (
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {coverImage && (
              <div className="relative">
                <img src={coverImage} alt="" className="w-10 h-10 rounded object-cover" />
                {record.mainImages && record.mainImages.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-white" 
                       title="صورة غلاف"></div>
                )}
              </div>
            )}
            <div>
              <div className="font-medium">{getServiceTitle(title)}</div>
              <div className="text-sm text-gray-500">#{record._id.slice(-6)}</div>
            </div>
          </div>
        );
      },
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
            onClick={() => openEditModal(record)}
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <style jsx global>{`
        .ant-input-affix-wrapper .ant-input {
          color: #1f2937 !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
          text-align: right !important;
          direction: rtl !important;
        }
        .ant-input-affix-wrapper {
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
          border-radius: 8px !important;
        }
        .ant-input::placeholder {
          color: #9ca3af !important;
          font-size: 14px !important;
        }
      `}</style>
      <Card className="shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">إدارة الخدمات</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingService(null);
              form.resetFields();
              // إعادة تعيين طريقة السعر بالدولار إلى التلقائي
              setUsdPriceMode('auto');
              setIsModalVisible(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            إضافة خدمة جديدة
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Search
              placeholder="البحث في الخدمات..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              style={{
                fontSize: '16px',
                fontFamily: 'inherit',
                direction: 'rtl'
              }}
              className="w-full [&_.ant-input]:text-right [&_.ant-input]:text-gray-900 [&_.ant-input]:text-base [&_.ant-input]:font-medium [&_.ant-input]:bg-white [&_.ant-input]:border-gray-300 [&_.ant-input]:rounded-lg [&_.ant-input]:px-4 [&_.ant-input]:py-2 [&_.ant-input-affix-wrapper]:border-gray-300 [&_.ant-input-affix-wrapper]:rounded-lg [&_.ant-input-affix-wrapper]:bg-white"
            />
          </div>
          <Select
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              // Trigger refresh when filter changes
              setTimeout(() => fetchServices(), 100);
            }}
            className="w-full sm:w-48"
            loading={categoriesLoading}
            placeholder="اختر الفئة للفلترة"
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
                          rules={[
                            { required: true, message: '🏷️ عنوان الخدمة بالعربية مطلوب' },
                            { min: 3, message: '🏷️ العنواة يجب أن يكون 3 أحرف على الأقل' },
                            { max: 100, message: '🏷️ العنوان يجب ألا يتجاوز 100 حرف' }
                          ]}
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
                          rules={[
                            { required: true, message: '📝 وصف الخدمة بالعربية مطلوب' },
                            { min: 10, message: '📝 الوصف يجب أن يكون 10 أحرف على الأقل' },
                            { max: 500, message: '📝 الوصف يجب ألا يتجاوز 500 حرف' }
                          ]}
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
                          rules={[{ required: true, message: '📋 اختيار فئة مطلوب' }]}
                        >
                          <div className="space-y-2">
                            {/* 📝 خيار اختيار فئة موجودة */}
                            <div className="mb-3">
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                💹 اختر فئة موجودة:
                              </label>
                              <Select
                                placeholder="اختر من الفئات الموجودة"
                                showSearch
                                allowClear
                                className="w-full"
                                value={form.getFieldValue('category')}
                                onChange={(value) => {
                                  form.setFieldValue('category', value);
                                  form.setFieldValue('customCategory', ''); // مسح الفئة المخصصة
                                }}
                                filterOption={(input, option) =>
                                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={categories.filter(cat => cat.value !== 'all').map(cat => ({
                                  value: cat.value,
                                  label: cat.label
                                }))}
                              />
                            </div>
                            
                            {/* ✨ أو انشاء فئة جديدة */}
                            <div className="relative">
                              <div className="flex items-center mb-2">
                                <span className="text-sm text-gray-500">———</span>
                                <span className="mx-2 text-sm text-gray-600 font-medium">أو</span>
                                <span className="text-sm text-gray-500">———</span>
                              </div>
                              <Form.Item
                                name="customCategory"
                                noStyle
                              >
                                <Input
                                  placeholder="✨ اكتب اسم فئة جديدة"
                                  prefix={<span className="text-orange-500">🆕</span>}
                                  className="border-2 border-dashed border-orange-300 hover:border-orange-400 focus:border-orange-500"
                                  onChange={(e) => {
                                    const customValue = e.target.value.trim();
                                    if (customValue) {
                                      form.setFieldValue('category', customValue);
                                    } else {
                                      form.setFieldValue('category', undefined);
                                    }
                                  }}
                                />
                              </Form.Item>
                              <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                <span>💡</span>
                                <span>اكتب اسم الفئة الجديدة وسيتم إضافتها تلقائياً</span>
                              </div>
                            </div>
                          </div>
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
                key: "2",
                label: <span><DollarOutlined /> الأسعار والتوقيت</span>,
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card size="small" className="border-l-4 border-l-green-500 bg-green-50/30">
                          <Title level={5} className="text-green-600 mb-3">السعر الحالي</Title>
                          
                          {/* اختيار طريقة تحديد السعر بالدولار */}
                          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200">
                            <div className="flex flex-col gap-2">
                              {/* العنوان الرئيسي */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ThunderboltOutlined className="text-blue-600 text-sm" />
                                  <span className="text-xs font-semibold text-blue-800">طريقة تحديد السعر بالدولار:</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-600">سعر الصرف الحالي:</span>
                                    <span className="text-sm font-semibold text-blue-700">💱 1 ر.س = {convert(1, 'SAR', 'USD').toFixed(4)} $</span>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      message.loading('جاري تحديث أسعار الصرف...', 1);
                                      await refreshRates();
                                      message.success('تم تحديث أسعار الصرف بنجاح! 🔄');
                                    }}
                                    className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors font-medium"
                                    disabled={isLoading}
                                  >
                                    {isLoading ? '⏳' : '🔄'}
                                  </button>
                                </div>
                              </div>
                              
                              {/* أزرار الاختيار */}
                              <div>
                                <Radio.Group
                                  value={usdPriceMode}
                                  onChange={(e: any) => {
                                    const value = e.target.value;
                                    const prevMode = usdPriceMode;
                                    setUsdPriceMode(value);
                                    
                                    // عرض رسالة توضيحية عند التغيير
                                    if (prevMode !== value) {
                                    if (value === 'auto') {
                                      message.success({
                                        content: (
                                          <div className="text-right">
                                            <div className="font-bold text-green-700 mb-1">🤖 تم التبديل للحساب التلقائي</div>
                                            <div className="text-sm text-green-600">سيتم حساب السعر بالدولار (الحالي والأصلي) تلقائياً بناءً على سعر الصرف الحالي عند كتابة السعر بالريال</div>
                                          </div>
                                        ),
                                        duration: 4,
                                        className: 'text-right'
                                      });
                                      
                                      // حساب السعر فوراً إذا كان هناك سعر بالريال - INSTANT UPDATE
                                      const currentSarPrice = form.getFieldValue(['price', 'SAR']) || sarPrice;
                                      const originalSarPrice = form.getFieldValue(['originalPrice', 'SAR']);
                                      
                                      // تحديث السعر الحالي
                                      if (currentSarPrice && currentSarPrice > 0) {
                                        const usdPrice = calculateUSDPrice(currentSarPrice);
                                        setCalculatedUsdPrice(usdPrice);
                                        form.setFieldValue(['price', 'USD'], usdPrice);
                                      } else {
                                        setCalculatedUsdPrice(null);
                                        form.setFieldValue(['price', 'USD'], null);
                                      }
                                      
                                      // تحديث السعر الأصلي
                                      if (originalSarPrice && originalSarPrice > 0) {
                                        const originalUsdPrice = calculateUSDPrice(originalSarPrice);
                                        setCalculatedOriginalUsdPrice(originalUsdPrice);
                                        form.setFieldValue(['originalPrice', 'USD'], originalUsdPrice);
                                      } else {
                                        setCalculatedOriginalUsdPrice(null);
                                        form.setFieldValue(['originalPrice', 'USD'], null);
                                      }
                                    } else {
                                      // إعادة تعيين الأسعار المحسوبة عند التبديل لليدوي
                                      setCalculatedUsdPrice(null);
                                      setCalculatedOriginalUsdPrice(null);
                                      
                                      message.info({
                                        content: (
                                          <div className="text-right">
                                            <div className="font-bold text-blue-700 mb-1">✏️ تم التبديل للكتابة اليدوية</div>
                                            <div className="text-sm text-blue-600">يمكنك الآن كتابة السعر بالدولار يدوياً حسب احتياجك</div>
                                          </div>
                                        ),
                                        duration: 3,
                                        className: 'text-right'
                                      });
                                    }
                                  }
                                }}
                                className="flex gap-2"
                              >
                                <Tooltip title="سيتم حساب السعر تلقائياً بناءً على سعر الصرف الحالي 🚀">
                                  <Radio.Button 
                                    value="auto" 
                                    className="flex items-center gap-2 px-4 py-2 font-medium hover:shadow-md transition-all duration-200"
                                    style={{
                                      background: usdPriceMode === 'auto' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined,
                                      color: usdPriceMode === 'auto' ? 'white' : undefined,
                                      border: usdPriceMode === 'auto' ? 'none' : undefined
                                    }}
                                  >
                                    <RobotOutlined className="text-sm" />
                                    <span>تلقائي ذكي</span>
                                  </Radio.Button>
                                </Tooltip>
                                <Tooltip title="كتابة السعر يدوياً حسب احتياجك ✍️">
                                  <Radio.Button 
                                    value="manual" 
                                    className="flex items-center gap-2 px-4 py-2 font-medium hover:shadow-md transition-all duration-200"
                                    style={{
                                      background: usdPriceMode === 'manual' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : undefined,
                                      color: usdPriceMode === 'manual' ? 'white' : undefined,
                                      border: usdPriceMode === 'manual' ? 'none' : undefined
                                    }}
                                  >
                                    <EditOutlined className="text-sm" />
                                    <span>كتابة يدوية</span>
                                  </Radio.Button>
                                </Tooltip>
                                </Radio.Group>
                              </div>
                            </div>
                          </div>
                          
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name={['price', 'SAR']}
                                label="السعر بالريال السعودي"
                                rules={[{ required: true, message: 'يرجى إدخال السعر بالريال' }]}
                              >
                                <InputNumber
                                  min={0}
                                  precision={2}
                                  placeholder="0.00"
                                  className="w-full"
                                  addonAfter="ر.س"
                                  onChange={(value) => {
                                    setSarPrice(value);
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name={['price', 'USD']}
                                label="السعر بالدولار الأمريكي"
                                rules={[{ required: true, message: 'يرجى إدخال السعر بالدولار' }]}
                              >
                                <div>
                                  <InputNumber
                                    min={0}
                                    precision={2}
                                    placeholder={usdPriceMode === 'auto' ? '⚡ تحديث مباشر أثناء الكتابة' : '0.00'}
                                    className="w-full"
                                    addonAfter="$"
                                    disabled={usdPriceMode === 'auto'}
                                    value={usdPriceMode === 'auto' ? calculatedUsdPrice : undefined}
                                    style={{
                                      backgroundColor: usdPriceMode === 'auto' ? '#f5f5f5' : undefined,
                                      color: usdPriceMode === 'auto' && calculatedUsdPrice ? '#059669' : undefined,
                                      fontWeight: usdPriceMode === 'auto' && calculatedUsdPrice ? 'bold' : undefined
                                    }}
                                  />
                                  {usdPriceMode === 'auto' && (
                                    <div className="text-xs mt-1 space-y-1">
                                      <div className="flex items-center gap-1 text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <RobotOutlined className="text-green-600 animate-pulse" />
                                          <span className="text-green-600 font-medium">🔥 تحديث مباشر وفوري</span>
                                        </div>
                                      </div>
                                      {calculatedUsdPrice && (
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded">
                                            <span className="font-bold">💰 السعر المحسوب:</span>
                                            <span className="font-bold text-lg">{calculatedUsdPrice} $</span>
                                          </div>
                                          <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <span>🌐 مصدر البيانات:</span>
                                            <span className="font-medium">ExchangeRate-API.com</span>
                                            <span>•</span>
                                            <span>آخر تحديث: {new Date().toLocaleString('ar-SA', { 
                                              hour: '2-digit', 
                                              minute: '2-digit',
                                              day: '2-digit',
                                              month: '2-digit'
                                            })}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small" className="border-l-4 border-l-orange-500 bg-orange-50/30">
                          <Title level={5} className="text-orange-600 mb-3">السعر الأصلي (اختياري)</Title>
                          
                          {/* رسالة توضيحية فخمة */}
                          <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">💡</span>
                              </div>
                              <div className="flex-1">
                                <h6 className="text-sm font-bold text-orange-800 mb-1">ما هو السعر الأصلي؟</h6>
                                <p className="text-xs text-orange-700 leading-relaxed mb-2">
                                  السعر الأصلي يُستخدم لإظهار <span className="font-semibold">خصم أو عرض خاص</span> للعملاء. 
                                  عندما تضع سعراً أصلياً أعلى من السعر الحالي، سيظهر للعميل كخط مشطوب مع نسبة الخصم.
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => {
                                      return prevValues?.price?.SAR !== currentValues?.price?.SAR ||
                                             prevValues?.originalPrice?.SAR !== currentValues?.originalPrice?.SAR;
                                    }}>
                                      {({ getFieldValue }) => {
                                        const currentSAR = getFieldValue(['price', 'SAR']) || 0;
                                        const originalSAR = getFieldValue(['originalPrice', 'SAR']) || 0;
                                        const discount = calculateDiscountPercentage(originalSAR, currentSAR);
                                        
                                        // إذا لم توجد أسعار، أعرض مثال افتراضي بخصم
                                        const displayCurrentSAR = currentSAR || 400;  // السعر الحالي
                                        const displayOriginalSAR = originalSAR || 500; // السعر الأصلي (أعلى)
                                        const displayDiscount = discount || calculateDiscountPercentage(displayOriginalSAR, displayCurrentSAR);
                                        
                                        return (
                                          <>
                                            {originalSAR && currentSAR ? 'القيم الحالية:' : 'مثال:'} 
                                            <span className="line-through">{displayOriginalSAR} ر.س</span> → 
                                            <span className="text-green-600 font-bold">{displayCurrentSAR} ر.س</span>
                                            {displayDiscount > 0 && <span className="text-red-600 font-bold"> (خصم {displayDiscount}%)</span>}
                                          </>
                                        );
                                      }}
                                    </Form.Item>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name={['originalPrice', 'SAR']}
                                label="السعر الأصلي بالريال"
                              >
                                <InputNumber
                                  min={0}
                                  precision={2}
                                  placeholder="0.00"
                                  className="w-full"
                                  addonAfter="ر.س"
                                  onChange={(value) => {
                                    if (usdPriceMode === 'auto') {
                                      if (value && value > 0) {
                                        const originalUsdPrice = calculateUSDPrice(value);
                                        setCalculatedOriginalUsdPrice(originalUsdPrice);
                                        form.setFieldValue(['originalPrice', 'USD'], originalUsdPrice);
                                      } else {
                                        setCalculatedOriginalUsdPrice(null);
                                        form.setFieldValue(['originalPrice', 'USD'], null);
                                      }
                                    }
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name={['originalPrice', 'USD']}
                                label="السعر الأصلي بالدولار"
                              >
                                <InputNumber
                                  min={0}
                                  precision={2}
                                  placeholder={usdPriceMode === 'auto' ? '⚡ يتحدث تلقائياً' : '0.00'}
                                  className="w-full"
                                  addonAfter="$"
                                  disabled={usdPriceMode === 'auto'}
                                  value={usdPriceMode === 'auto' ? calculatedOriginalUsdPrice : undefined}
                                  style={{
                                    backgroundColor: usdPriceMode === 'auto' ? '#f5f5f5' : undefined,
                                    color: usdPriceMode === 'auto' && calculatedOriginalUsdPrice ? '#059669' : undefined,
                                    fontWeight: usdPriceMode === 'auto' && calculatedOriginalUsdPrice ? 'bold' : undefined
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          
                          {/* مؤشر الخصم المحسوب - محدث ديناميكياً */}
                          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => {
                            return prevValues?.price?.SAR !== currentValues?.price?.SAR ||
                                   prevValues?.originalPrice?.SAR !== currentValues?.originalPrice?.SAR ||
                                   prevValues?.price?.USD !== currentValues?.price?.USD ||
                                   prevValues?.originalPrice?.USD !== currentValues?.originalPrice?.USD;
                          }}>
                            {({ getFieldValue }) => {
                              const currentSAR = getFieldValue(['price', 'SAR']);
                              const originalSAR = getFieldValue(['originalPrice', 'SAR']);
                              const currentUSD = getFieldValue(['price', 'USD']);
                              const originalUSD = getFieldValue(['originalPrice', 'USD']);
                              
                              const discountSAR = calculateDiscountPercentage(originalSAR, currentSAR);
                              const discountUSD = calculateDiscountPercentage(originalUSD, currentUSD);
                              
                              if ((discountSAR > 0 && originalSAR && currentSAR) || (discountUSD > 0 && originalUSD && currentUSD)) {
                              return (
                                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-green-600 text-lg">🎉</span>
                                    <span className="text-sm font-bold text-green-800">معاينة الخصم للعملاء:</span>
                                  </div>
                                  <div className="space-y-2">
                                    {discountSAR > 0 && originalSAR && currentSAR && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-600">بالريال:</span>
                                        <span className="line-through text-gray-500">{originalSAR} ر.س</span>
                                        <span className="text-green-600 font-bold">{currentSAR} ر.س</span>
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                                          خصم {discountSAR}%
                                        </span>
                                      </div>
                                    )}
                                    {discountUSD > 0 && originalUSD && currentUSD && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-600">بالدولار:</span>
                                        <span className="line-through text-gray-500">${originalUSD}</span>
                                        <span className="text-green-600 font-bold">${currentUSD}</span>
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                                          خصم {discountUSD}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                              }
                              return null;
                            }}
                          </Form.Item>
                        </Card>
                      </Col>
                    </Row>

                    <Row gutter={16} className="mt-4">
                      <Col span={8}>
                        <Card size="small" className="border-l-4 border-l-blue-500 bg-blue-50/30">
                          <Title level={5} className="text-blue-600 mb-3">مدة التنفيذ</Title>
                          <Row gutter={8}>
                            <Col span={12}>
                              <Form.Item
                                name={['deliveryTime', 'min']}
                                label="الحد الأدنى (أيام)"
                                rules={[{ required: true, message: 'يرجى إدخال الحد الأدنى' }]}
                              >
                                <InputNumber
                                  min={0}
                                  max={365}
                                  placeholder="1"
                                  className="w-full"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name={['deliveryTime', 'max']}
                                label="الحد الأقصى (أيام)"
                                rules={[{ required: true, message: 'يرجى إدخال الحد الأقصى' }]}
                              >
                                <InputNumber
                                  min={0}
                                  max={365}
                                  placeholder="7"
                                  className="w-full"
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small" className="border-l-4 border-l-purple-500 bg-purple-50/30">
                          <Title level={5} className="text-purple-600 mb-3">التعديلات</Title>
                          <Form.Item
                            name="revisions"
                            label="عدد التعديلات المجانية"
                            rules={[{ required: true, message: 'يرجى إدخال عدد التعديلات' }]}
                          >
                            <InputNumber
                              min={0}
                              max={10}
                              placeholder="2"
                              className="w-full"
                              addonAfter="تعديل"
                            />
                          </Form.Item>
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small" className="border-l-4 border-l-gray-500 bg-gray-50/30">
                          <Title level={5} className="text-gray-600 mb-3">إعدادات إضافية</Title>
                          <Form.Item name="nonRefundable" valuePropName="checked">
                            <div className="flex items-center gap-2">
                              <Switch defaultChecked />
                              <span>غير قابل للاسترداد</span>
                            </div>
                          </Form.Item>
                        </Card>
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

                    <Divider />

                    <Form.Item label="الروابط الرقمية للتسليم (اختياري)">
                      <Form.List name="digitalDelivery">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Card key={key} size="small" className="mb-3 border-l-4 border-l-cyan-500">
                                <Row gutter={16}>
                                  <Col span={12}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'title']}
                                      label="عنوان الرابط"
                                      rules={[{ required: true, message: 'أدخل عنوان الرابط' }]}
                                    >
                                      <Input placeholder="قالب السيرة الذاتية - التصميم الأول" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'url']}
                                      label="الرابط"
                                      rules={[
                                        { required: true, message: 'أدخل الرابط' },
                                        { type: 'url', message: 'أدخل رابط صحيح' }
                                      ]}
                                    >
                                      <Input placeholder="https://canva.com/design/..." />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Row gutter={16}>
                                  <Col span={8}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'imageUrl']}
                                      label="صورة المعاينة (اختياري)"
                                    >
                                      <Input placeholder="https://example.com/preview.jpg" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'locale']}
                                      label="اللغة"
                                      initialValue="ar"
                                    >
                                      <Select>
                                        <Option value="ar">عربي</Option>
                                        <Option value="en">إنجليزي</Option>
                                        <Option value="mixed">مختلط</Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col span={6}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'tags']}
                                      label="العلامات"
                                    >
                                      <Select mode="tags" placeholder="تصميم، احترافي">
                                        <Option value="تصميم">تصميم</Option>
                                        <Option value="احترافي">احترافي</Option>
                                        <Option value="قابل للتعديل">قابل للتعديل</Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    <div className="pt-8">
                                      <Button 
                                        type="text" 
                                        danger 
                                        onClick={() => remove(name)}
                                        icon={<DeleteOutlined />}
                                        className="flex items-center justify-center"
                                      />
                                    </div>
                                  </Col>
                                </Row>
                              </Card>
                            ))}
                            <Form.Item>
                              <Button 
                                type="dashed" 
                                onClick={() => add()} 
                                block 
                                icon={<LinkOutlined />}
                                className="h-10 border-cyan-300 text-cyan-600"
                              >
                                إضافة رابط رقمي
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
                    {/* قسم نبذة عن الخدمة */}
                    <Card size="small" className="border-l-4 border-l-blue-500 bg-blue-50/30">
                      <Title level={5} className="text-blue-600 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        قسم نبذة عن الخدمة
                      </Title>
                      <Form.Item 
                        name={['uiTexts', 'shortDescription']} 
                        label={<span className="font-medium">نبذة مختصرة (تظهر في بداية الصفحة)</span>}
                        tooltip="هذا النص يظهر أسفل العنوان مباشرة كنبذة سريعة عن الخدمة"
                      >
                        <Input.TextArea 
                          rows={3} 
                          placeholder="نبذة مختصرة وواضحة عن الخدمة وما تقدمه للعميل" 
                          className="resize-none"
                          showCount
                          maxLength={200}
                        />
                      </Form.Item>
                    </Card>

                    {/* قسم خطوات العمل */}
                    <Card size="small" className="border-l-4 border-l-indigo-500 bg-indigo-50/30">
                      <Title level={5} className="text-indigo-600 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        خطوات العمل
                      </Title>
                      <Form.Item 
                        label={<span className="font-medium">الخطوات التي نتبعها في تنفيذ الخدمة</span>}
                        className="mb-0"
                      >
                        <Form.List name={['uiTexts', 'workSteps']}>
                          {(fields, { add, remove }) => (
                            <div className="space-y-3">
                              {fields.map(({ key, name, ...restField }, index) => (
                                <Card key={key} size="small" className="border border-indigo-200 bg-white">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'title']}
                                        rules={[{ required: true, message: 'أدخل عنوان الخطوة' }]}
                                        className="mb-2"
                                      >
                                        <Input placeholder={`عنوان الخطوة ${index + 1}`} />
                                      </Form.Item>
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'desc']}
                                        rules={[{ required: true, message: 'أدخل وصف الخطوة' }]}
                                        className="mb-0"
                                      >
                                        <Input.TextArea 
                                          rows={2} 
                                          placeholder={`وصف تفصيلي للخطوة ${index + 1}`}
                                          className="resize-none"
                                        />
                                      </Form.Item>
                                    </div>
                                    <Button 
                                      type="text" 
                                      danger 
                                      onClick={() => remove(name)}
                                      className="flex-shrink-0"
                                      icon={<DeleteOutlined />}
                                      size="small"
                                    />
                                  </div>
                                </Card>
                              ))}
                              <Button 
                                type="dashed" 
                                onClick={() => add({ title: '', desc: '' })} 
                                block 
                                icon={<PlusOutlined />}
                                className="h-12 border-indigo-300 text-indigo-600"
                              >
                                إضافة خطوة جديدة
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>

                    {/* قسم المميزات المخصصة */}
                    <Card size="small" className="border-l-4 border-l-pink-500 bg-pink-50/30">
                      <Title level={5} className="text-pink-600 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                        المميزات المخصصة للخدمة
                      </Title>
                      <Form.Item 
                        label={<span className="font-medium">المميزات الخاصة بهذه الخدمة (تظهر في Timeline)</span>}
                        className="mb-0"
                      >
                        <Form.List name={['uiTexts', 'customFeatures']}>
                          {(fields, { add, remove }) => (
                            <div className="space-y-3">
                              {fields.map(({ key, name, ...restField }, index) => (
                                <Card key={key} size="small" className="border border-pink-200 bg-white">
                                  <Row gutter={16}>
                                    <Col span={4}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'icon']}
                                        label="الأيقونة"
                                        className="mb-2"
                                      >
                                        <Input placeholder="📱" maxLength={2} />
                                      </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'color']}
                                        label="اللون"
                                        className="mb-2"
                                      >
                                        <Select placeholder="اختر اللون">
                                          <Option value="pink">وردي</Option>
                                          <Option value="blue">أزرق</Option>
                                          <Option value="green">أخضر</Option>
                                          <Option value="purple">بنفسجي</Option>
                                          <Option value="orange">برتقالي</Option>
                                          <Option value="red">أحمر</Option>
                                          <Option value="teal">تركوازي</Option>
                                          <Option value="indigo">نيلي</Option>
                                        </Select>
                                      </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'title']}
                                        label="العنوان"
                                        rules={[{ required: true, message: 'أدخل العنوان' }]}
                                        className="mb-2"
                                      >
                                        <Input placeholder="عنوان الميزة" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'desc']}
                                        label="الوصف"
                                        rules={[{ required: true, message: 'أدخل الوصف' }]}
                                        className="mb-2"
                                      >
                                        <Input.TextArea 
                                          rows={1} 
                                          placeholder="وصف الميزة"
                                          className="resize-none"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                      <div className="pt-6">
                                        <Button 
                                          type="text" 
                                          danger 
                                          onClick={() => remove(name)}
                                          icon={<DeleteOutlined />}
                                          size="small"
                                        />
                                      </div>
                                    </Col>
                                  </Row>
                                </Card>
                              ))}
                              <Button 
                                type="dashed" 
                                onClick={() => add({ icon: '✨', color: 'blue', title: '', desc: '' })} 
                                block 
                                icon={<PlusOutlined />}
                                className="h-12 border-pink-300 text-pink-600"
                              >
                                إضافة ميزة مخصصة
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>

                {/* قسم التنويه المهم فقط */}
                <Card size="small" className="border-l-4 border-l-orange-500 bg-orange-50/30">
                  <Title level={5} className="text-orange-600 mb-3">التنويه المهم</Title>
                  
                  <div className="bg-orange-100/50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="text-sm text-orange-700 space-y-2">
                      <p className="font-medium">النصوص الثابتة التي ستظهر في التنويه:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>تشمل الخدمة [عدد التعديلات] تعديلين مجانيين فقط</li>
                        <li>أي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب</li>
                        <li>الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع</li>
                      </ul>
                    </div>
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name={['uiTexts', 'standardTexts', 'revisions']} 
                        label="نص التعديلات المجانية"
                        className="mb-3"
                      >
                        <Input.TextArea rows={2} placeholder="تشمل الخدمة تعديلين مجانيين فقط" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name={['uiTexts', 'standardTexts', 'additionalRevisions']} 
                        label="نص التعديلات الإضافية"
                        className="mb-3"
                      >
                        <Input.TextArea rows={2} placeholder="أي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item 
                    name={['uiTexts', 'standardTexts', 'nonRefundable']} 
                    label="نص عدم الاسترداد"
                    className="mb-0"
                  >
                    <Input.TextArea rows={2} placeholder="تنويه هام: الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع" />
                  </Form.Item>
                </Card>
                  </div>
                )
              },
              {
                key: "5",
                label: <span><PictureOutlined /> إدارة الصور</span>,
                children: (
                  <div className="space-y-6">
                    {editingService && (
                      <>
                        <Form.Item 
                          name="mainImages"
                          label="صور الغلاف الرئيسية"
                          extra="هذه الصور ستظهر كغلاف للخدمة في بطاقات الخدمات وصفحة التفاصيل. الصورة الأولى هي الغلاف الرئيسي"
                        >
                          <MainImageManager 
                            serviceId={editingService._id}
                            onImagesChange={(images: any) => {
                              // This will be handled by the onChange prop automatically
                            }}
                          />
                        </Form.Item>
                        
                        <Divider>
                          <Text type="secondary">صور إضافية</Text>
                        </Divider>
                        
                        <Form.Item 
                          name="images"
                          label="صور نماذج الأعمال"
                          extra="هذه الصور ستظهر في قسم 'نماذج من أعمالنا' في صفحة تفاصيل الخدمة"
                        >
                          <ServiceImageManager 
                            serviceId={editingService._id}
                            onImagesChange={(images: any) => {
                              // This will be handled by the onChange prop automatically
                            }}
                          />
                        </Form.Item>
                      </>
                    )}
                    {!editingService && (
                      <div className="text-center py-8 text-gray-500">
                        <PictureOutlined className="text-4xl mb-4" />
                        <p>يجب حفظ الخدمة أولاً قبل إدارة الصور</p>
                        <p className="text-sm">قم بملء المعلومات الأساسية واضغط حفظ</p>
                      </div>
                    )}
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

function AdminServicesPage() {
  return (
    <App>
      <div className="min-h-screen bg-gray-50">
        <ServicesManagement />
      </div>
    </App>
  );
}

export default AdminServicesPage;
