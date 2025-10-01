'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  Filter,
  BarChart3,
  Image as ImageIcon,
  Link as LinkIcon,
  Settings,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Banner {
  _id: string;
  title?: { ar: string; en: string };
  content?: string; // For backwards compatibility
  subtitle?: { ar: string; en: string };
  description?: { ar: string; en: string };
  type: string;
  position: string;
  pageSlug: string;
  image?: { url: string; alt?: string };
  backgroundColor?: string;
  textColor?: string;
  variant?: string;
  size?: string;
  ctaButton?: {
    text: { ar: string; en: string };
    link: string;
    style: string;
  };
  isActive: boolean;
  order: number;
  views?: number;
  clicks?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  description: { ar: string; en: string };
  type: string;
  position: string;
  pageSlug: string;
  backgroundColor: string;
  textColor: string;
  variant: string;
  size: string;
  ctaButton: {
    text: { ar: string; en: string };
    link: string;
    style: string;
  };
  isActive: boolean;
  order: number;
}

export default function BannersManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPage, setFilterPage] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: { ar: '', en: '' },
    subtitle: { ar: '', en: '' },
    description: { ar: '', en: '' },
    type: 'basic',
    position: 'top',
    pageSlug: 'home',
    backgroundColor: '#4b2e83',
    textColor: '#ffffff',
    variant: 'primary',
    size: 'md',
    ctaButton: {
      text: { ar: '', en: '' },
      link: '',
      style: 'primary'
    },
    isActive: true,
    order: 0
  });

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (filterType !== 'all') params.append('type', filterType);
      if (filterPage !== 'all') params.append('pageSlug', filterPage);
      if (filterPosition !== 'all') params.append('position', filterPosition);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${baseUrl}/banners?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      
      if (response.ok) {
        const data = await response.json();
        setBanners(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        const errorData = await response.text();
        toast.error(`خطأ في جلب البنرات: ${response.status}`);
      }
    } catch (error) {
      toast.error('خطأ في جلب البنرات');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, filterPage, filterPosition, searchTerm]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Separate useEffect for search term to avoid too frequent API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchBanners();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchBanners]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      
      // إذا كان تعديل، استخدم PUT مع الـ ID، وإلا استخدم POST
      const url = editingBanner 
        ? `${baseUrl}/banners/${editingBanner._id}`
        : `${baseUrl}/banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';
      
      // Clean the form data - remove empty ctaButton if not needed
      const cleanFormData = { ...formData };
      
      // Only include ctaButton if it has meaningful data
      if (!cleanFormData.ctaButton?.text?.ar && !cleanFormData.ctaButton?.text?.en && !cleanFormData.ctaButton?.link) {
        const { ctaButton, ...restData } = cleanFormData;
        Object.assign(cleanFormData, restData);
      }
      
      console.log('Sending data:', JSON.stringify(cleanFormData, null, 2));
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanFormData)
      });

      if (response.ok) {
        toast.success(editingBanner ? 'تم تحديث البنر بنجاح' : 'تم إنشاء البنر بنجاح');
        setShowModal(false);
        setEditingBanner(null);
        resetForm();
        fetchBanners();
      } else {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        
        // Show detailed validation errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = errorData.details.map((detail: any) => `${detail.field}: ${detail.message}`).join('\n');
          toast.error(`خطأ في البيانات:\n${errorMessages}`);
        } else {
          toast.error(errorData.message || 'حدث خطأ');
        }
      }
    } catch (error) {
      toast.error('خطأ في حفظ البنر');
    }
  };

  const handleDelete = async (id: string, bannerTitle?: string) => {
    Modal.confirm({
      title: 'تأكيد الحذف',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div className="py-4">
          <p className="text-gray-700 mb-4 text-base">هل أنت متأكد من حذف هذا البنر؟</p>
          {bannerTitle && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm text-red-700 font-medium">البنر المراد حذفه:</p>
              </div>
              <p className="font-semibold text-gray-800 text-base pr-4">{bannerTitle}</p>
            </div>
          )}
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-lg">⚠️</span>
              <p className="text-red-700 text-sm font-medium">هذا الإجراء نهائي ولا يمكن التراجع عنه</p>
            </div>
          </div>
        </div>
      ),
      okText: 'نعم، احذف البنر',
      cancelText: 'إلغاء',
      okType: 'danger',
      centered: true,
      width: 450,
      okButtonProps: {
        size: 'large',
        className: 'bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600'
      },
      cancelButtonProps: {
        size: 'large'
      },
      onOk: async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
          const response = await fetch(`${baseUrl}/banners/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            toast.success('تم حذف البنر بنجاح');
            fetchBanners();
          } else {
            toast.error('فشل في حذف البنر');
          }
        } catch (error) {
          toast.error('خطأ في حذف البنر');
        }
      }
    });
  };

  const toggleStatus = async (id: string, currentStatus: boolean, bannerTitle?: string) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    const statusText = newStatus ? 'مفعل' : 'معطل';
    
    Modal.confirm({
      title: `${actionText} البنر`,
      icon: <ExclamationCircleOutlined style={{ color: newStatus ? '#52c41a' : '#faad14' }} />,
      content: (
        <div className="py-4">
          <p className="text-gray-700 mb-4 text-base">
            هل تريد {actionText} هذا البنر؟
          </p>
          {bannerTitle && (
            <div className={`bg-gradient-to-r ${newStatus ? 'from-green-50 to-emerald-50 border-green-200' : 'from-yellow-50 to-orange-50 border-yellow-200'} p-4 rounded-lg border mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 ${newStatus ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
                <p className={`text-sm ${newStatus ? 'text-green-700' : 'text-yellow-700'} font-medium`}>البنر:</p>
              </div>
              <p className="font-semibold text-gray-800 text-base pr-4">{bannerTitle}</p>
            </div>
          )}
          <div className={`${newStatus ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} p-3 rounded-lg border`}>
            <div className="flex items-center gap-2">
              <span className={`${newStatus ? 'text-green-500' : 'text-yellow-500'} text-lg`}>
                {newStatus ? '✅' : '⚠️'}
              </span>
              <p className={`${newStatus ? 'text-green-700' : 'text-yellow-700'} text-sm font-medium`}>
                سيصبح البنر {statusText} {newStatus ? 'وسيظهر للزوار' : 'ولن يظهر للزوار'}
              </p>
            </div>
          </div>
        </div>
      ),
      okText: `نعم، ${actionText}`,
      cancelText: 'إلغاء',
      okType: newStatus ? 'primary' : 'default',
      centered: true,
      width: 450,
      okButtonProps: {
        size: 'large',
        className: newStatus 
          ? 'bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600'
          : 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500 hover:border-yellow-600 text-white'
      },
      cancelButtonProps: {
        size: 'large'
      },
      onOk: async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
          const response = await fetch(`${baseUrl}/banners/${id}/toggle`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            toast.success(`تم ${actionText} البنر بنجاح`);
            fetchBanners();
          } else {
            toast.error(`فشل في ${actionText} البنر`);
          }
        } catch (error) {
          toast.error(`خطأ في ${actionText} البنر`);
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      title: { ar: '', en: '' },
      subtitle: { ar: '', en: '' },
      description: { ar: '', en: '' },
      type: 'basic',
      position: 'top',
      pageSlug: 'home',
      backgroundColor: '#4b2e83',
      textColor: '#ffffff',
      variant: 'primary',
      size: 'md',
      ctaButton: {
        text: { ar: '', en: '' },
        link: '',
        style: 'primary'
      },
      isActive: true,
      order: 0
    });
  };

  const openEditModal = (banner: Banner) => {
    console.log('Opening edit modal for banner:', banner);
    setEditingBanner(banner);
    
    // Handle different data structures - some banners might have 'content' instead of 'title'
    const bannerTitle = banner.title || (banner.content ? { ar: banner.content, en: banner.content } : { ar: '', en: '' });
    
    const formDataToSet = {
      title: bannerTitle,
      subtitle: banner.subtitle || { ar: '', en: '' },
      description: banner.description || { ar: '', en: '' },
      type: banner.type || 'basic',
      position: banner.position || 'top',
      pageSlug: banner.pageSlug || 'home',
      backgroundColor: banner.backgroundColor || '#4b2e83',
      textColor: banner.textColor || '#ffffff',
      variant: banner.variant || 'primary',
      size: banner.size || 'md',
      ctaButton: banner.ctaButton || {
        text: { ar: '', en: '' },
        link: '',
        style: 'primary'
      },
      isActive: banner.isActive ?? true,
      order: banner.order || 0
    };
    
    console.log('Setting form data:', formDataToSet);
    setFormData(formDataToSet);
    setShowModal(true);
  };

  // Use banners directly since filtering is done server-side
  const filteredBanners = banners;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة البنرات</h1>
          <p className="text-gray-600 mt-2">إدارة جميع البنرات في الموقع</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة بنر جديد
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في البنرات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الأنواع</option>
              <option value="basic">أساسي</option>
              <option value="page">صفحة</option>
              <option value="luxury">فاخر</option>
              <option value="promo">ترويجي</option>
            </select>

            <select
              value={filterPage}
              onChange={(e) => setFilterPage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الصفحات</option>
              <option value="home">الرئيسية</option>
              <option value="about">من نحن</option>
              <option value="services">الخدمات</option>
              <option value="contact">اتصل بنا</option>
              <option value="blog">المدونة</option>
            </select>

            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع المواقع</option>
              <option value="top">أعلى</option>
              <option value="middle">وسط</option>
              <option value="bottom">أسفل</option>
              <option value="hero">البطل</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Banners Grid */}
      {loading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <Card key={banner._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{banner.title?.ar || banner.content || 'بنر بدون عنوان'}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {banner.pageSlug} - {banner.position}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={banner.isActive ? "default" : "secondary"}>
                      {banner.isActive ? 'مفعل' : 'معطل'}
                    </Badge>
                    <Badge variant="outline">{banner.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {banner.image?.url && (
                  <div className="mb-3">
                    <img 
                      src={banner.image.url} 
                      alt={banner.image.alt}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>المشاهدات: {banner.views || 0}</span>
                  <span>النقرات: {banner.clicks || 0}</span>
                  <span>الترتيب: {banner.order || 0}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(banner)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
                    title="تعديل البنر"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(banner._id, banner.isActive, banner.title?.ar || banner.content || 'بنر بدون عنوان')}
                    className={`transition-all duration-200 ${
                      banner.isActive 
                        ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200 hover:border-orange-300' 
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300'
                    }`}
                    title={banner.isActive ? 'إخفاء البنر' : 'إظهار البنر'}
                  >
                    {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(banner._id, banner.title?.ar || banner.content || 'بنر بدون عنوان')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                    title="حذف البنر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            صفحة {currentPage} من {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingBanner ? 'تعديل البنر' : 'إضافة بنر جديد'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">العنوان (عربي)</label>
                    <Input
                      value={formData.title?.ar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        title: { ...(formData.title || { ar: '', en: '' }), ar: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">العنوان (إنجليزي)</label>
                    <Input
                      value={formData.title?.en || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        title: { ...(formData.title || { ar: '', en: '' }), en: e.target.value }
                      })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">النوع</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="basic">أساسي</option>
                      <option value="page">صفحة</option>
                      <option value="luxury">فاخر</option>
                      <option value="promo">ترويجي</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">الموقع</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="top">أعلى</option>
                      <option value="middle">وسط</option>
                      <option value="bottom">أسفل</option>
                      <option value="hero">البطل</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">الصفحة</label>
                    <select
                      value={formData.pageSlug}
                      onChange={(e) => setFormData({ ...formData, pageSlug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="home">الرئيسية</option>
                      <option value="about">من نحن</option>
                      <option value="services">الخدمات</option>
                      <option value="contact">اتصل بنا</option>
                      <option value="blog">المدونة</option>
                    </select>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">زر الإجراء</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">نص الزر (عربي)</label>
                      <Input
                        value={formData.ctaButton?.text?.ar || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          ctaButton: {
                            ...(formData.ctaButton || { text: { ar: '', en: '' }, link: '', style: 'primary' }),
                            text: { ...(formData.ctaButton?.text || { ar: '', en: '' }), ar: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">نص الزر (إنجليزي)</label>
                      <Input
                        value={formData.ctaButton?.text?.en || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          ctaButton: {
                            ...(formData.ctaButton || { text: { ar: '', en: '' }, link: '', style: 'primary' }),
                            text: { ...(formData.ctaButton?.text || { ar: '', en: '' }), en: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">رابط الزر</label>
                    <Input
                      value={formData.ctaButton?.link || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        ctaButton: { ...(formData.ctaButton || { text: { ar: '', en: '' }, link: '', style: 'primary' }), link: e.target.value }
                      })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBanner(null);
                      resetForm();
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingBanner ? 'تحديث' : 'إنشاء'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
