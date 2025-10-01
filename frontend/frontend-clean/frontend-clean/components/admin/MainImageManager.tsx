'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Modal, 
  message, 
  Image, 
  Tooltip,
  Spin,
  Empty,
  Input,
  Popconfirm,
  Alert,
  Badge,
  Typography,
  App
} from 'antd';
import { 
  DeleteOutlined, 
  DragOutlined,
  PictureOutlined,
  InfoCircleOutlined,
  FullscreenOutlined,
  HeartOutlined,
  StarOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { apiFetch } from '@/lib/api';
import ImageUploadZone from './ImageUploadZone';

const { Text } = Typography;

interface MainImage {
  _id: string;
  url: string;
  alt: string;
  order: number;
  uploadedAt: string;
  uploadedBy: string;
}

interface MainImageManagerProps {
  serviceId: string;
  onImagesChange?: (images: MainImage[]) => void;
  value?: string[]; // For Form.Item integration
  onChange?: (value: string[]) => void; // For Form.Item integration
}

const MainImageManager: React.FC<MainImageManagerProps> = ({ 
  serviceId, 
  onImagesChange,
  value,
  onChange
}) => {
  const { modal } = App.useApp();
  const [images, setImages] = useState<MainImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load main images
  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/admin/services/${serviceId}/main-images`, {
        auth: true
      }) as { success: boolean; data: { mainImages: MainImage[] } };

      if (response.success) {
        setImages(response.data.mainImages);
        onImagesChange?.(response.data.mainImages);
        
        // Update form field value for proper integration
        const imageUrls = response.data.mainImages.map((img: MainImage) => img.url);
        onChange?.(imageUrls);
      }
    } catch (error) {
      // Don't show error message for loading images - it's not critical
      // The component will still work for new uploads
    } finally {
      setLoading(false);
    }
  };

  // Lazy loading with Intersection Observer
  const setupLazyLoading = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageId = entry.target.getAttribute('data-image-id');
            if (imageId) {
              setLoadedImages(prev => new Set([...prev, imageId]));
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
  }, []);

  useEffect(() => {
    if (serviceId) {
      loadImages();
    }
  }, [serviceId]);

  // Handle initial value from form
  useEffect(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      // If form has initial values but we haven't loaded images yet, 
      // we might need to wait for loadImages to complete
    }
  }, [value]);

  useEffect(() => {
    setupLazyLoading();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupLazyLoading]);

  // Setup lazy loading for new images
  useEffect(() => {
    if (images.length > 0) {
      const imageElements = document.querySelectorAll('[data-image-id]');
      imageElements.forEach(el => {
        if (observerRef.current) {
          observerRef.current.observe(el);
        }
      });
    }
  }, [images]);

  // Handle image upload
  const handleUpload = async (file: File, altText: string = '') => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('images', file);
      formData.append('alt', altText || '');

      // Use proper admin token handling
      const { getAdminToken } = await import('@/lib/api');
      const token = getAdminToken();
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      const uploadUrl = `${baseUrl}/admin/services/${serviceId}/main-images`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      const result = await response.json();

      if (result.success) {
        message.success('تم رفع صورة الغلاف بنجاح');
        // Reload images to get the updated list with proper order
        await loadImages();
      } else {
        message.error(result.error || 'فشل في رفع صورة الغلاف');
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      message.error('فشل في رفع صورة الغلاف');
      // Don't throw error to prevent form submission issues
      // The upload failure is already communicated to user via message
    } finally {
      setUploading(false);
    }
  };

  // Handle image deletion
  const handleDelete = async (imageId: string) => {
    try {
      
      // Add to deleting set
      setDeletingImages(prev => new Set([...prev, imageId]));
      
      const response = await apiFetch(`/admin/services/${serviceId}/main-images/${imageId}`, {
        method: 'DELETE',
        auth: true
      }) as { success: boolean; message?: string };


      if (response.success) {
        message.success('تم حذف صورة الغلاف بنجاح');
        // Reload images and update form field
        await loadImages();
      } else {
        message.error(response.message || 'فشل في حذف صورة الغلاف');
      }
    } catch (error) {
      message.error('فشل في حذف صورة الغلاف');
    } finally {
      // Remove from deleting set
      setDeletingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  // Handle drag and drop reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = Array.from(images);
    const [reorderedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, reorderedItem);

    // Update local state immediately for better UX
    setImages(newImages);
    setDraggedIndex(null);

    try {
      const imageIds = newImages.map(img => img._id);
      const response = await apiFetch(`/admin/services/${serviceId}/main-images/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ imageIds }),
        auth: true
      }) as { success: boolean; message?: string };

      if (response.success) {
        message.success('تم إعادة ترتيب صور الغلاف بنجاح');
        onImagesChange?.(newImages);
        // Update form field value for proper integration
        onChange?.(newImages.map((img: MainImage) => img.url));
      } else {
        // Revert on error
        await loadImages();
        message.error(response.message || 'فشل في إعادة ترتيب صور الغلاف');
      }
    } catch (error) {
      // Revert on error
      await loadImages();
      message.error('فشل في إعادة ترتيب صور الغلاف');
    }
  };

  // Preview image
  const handlePreview = (image: MainImage) => {
    setPreviewImage(image.url);
    setPreviewTitle(image.alt || 'صورة غلاف الخدمة');
    setPreviewVisible(true);
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert
        message="إدارة صور الغلاف الرئيسية"
        description="هذه الصور ستظهر كغلاف رئيسي للخدمة في بطاقات الخدمات وصفحة التفاصيل. يمكنك سحب الصور لإعادة ترتيبها. الحد الأقصى 5 صور."
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
      />

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Alert
          message="معلومات التطوير"
          description={`Service ID: ${serviceId} | Main Images count: ${images.length} | Form value: ${value?.length || 0}`}
          type="warning"
          showIcon
          closable
        />
      )}

      {/* Upload Zone */}
      <Card title="رفع صور غلاف جديدة">
        <ImageUploadZone
          onUpload={handleUpload}
          loading={uploading}
          multiple={true}
          maxSize={5}
        />
      </Card>

      {/* Images Gallery */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <CrownOutlined className="text-yellow-500" />
            <span>صور الغلاف الرئيسية</span>
            <span className="text-sm text-gray-500">({images.length}/5 صور)</span>
          </div>
        }
      >
      <Spin spinning={loading}>
        {images.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="لا توجد صور غلاف"
          >
            <p className="text-gray-500 mt-2">استخدم منطقة الرفع أعلاه لإضافة أول صورة غلاف</p>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => {
              const isLoaded = loadedImages.has(image._id);
              const isHovered = hoveredImage === image._id;
              const isPrimary = index === 0; // First image is primary
              
              return (
                <div
                  key={image._id}
                  data-image-id={image._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onMouseEnter={() => setHoveredImage(image._id)}
                  onMouseLeave={() => setHoveredImage(null)}
                  className={`
                    relative group rounded-xl overflow-hidden border-3 transition-all duration-300 cursor-move
                    transform hover:scale-105 hover:shadow-2xl
                    ${draggedIndex === index 
                      ? 'border-yellow-500 shadow-2xl opacity-50 scale-110 rotate-2' 
                      : isPrimary
                        ? 'border-yellow-400 hover:border-yellow-500 shadow-lg hover:shadow-yellow-200/50'
                        : 'border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-purple-200/50'
                    }
                    ${isHovered ? 'ring-4 ring-yellow-200/50' : ''}
                    ${isPrimary ? 'ring-2 ring-yellow-300/30' : ''}
                  `}
                  style={{
                    background: isHovered 
                      ? isPrimary 
                        ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                        : 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)'
                      : 'white'
                  }}
                >
                  {/* Primary Badge */}
                  {isPrimary && (
                    <div className={`
                      absolute top-2 left-2 z-30 bg-gradient-to-r from-yellow-400 to-yellow-500 
                      text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg
                      transition-all duration-300 transform
                      ${isHovered ? 'scale-110' : 'scale-100'}
                    `}>
                      <CrownOutlined className="mr-1" />
                      غلاف رئيسي
                    </div>
                  )}

                  {/* Drag Handle with enhanced styling */}
                  <div className={`
                    absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-2 
                    transition-all duration-300 shadow-lg
                    ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'}
                  `}>
                    <DragOutlined className={`text-sm ${isPrimary ? 'text-yellow-600' : 'text-purple-600'}`} />
                  </div>

                  {/* Enhanced Image Container */}
                  <div className="aspect-video relative overflow-hidden">
                    {/* Loading placeholder */}
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                        <PictureOutlined className="text-4xl text-gray-400" />
                      </div>
                    )}
                    
                    {/* Actual Image with lazy loading */}
                    <div className={`
                      w-full h-full transition-all duration-500
                      ${isLoaded ? 'opacity-100' : 'opacity-0'}
                    `}>
                      <Image
                        src={image.url}
                        alt={image.alt}
                        className={`
                          w-full h-full object-cover transition-all duration-300
                          ${isHovered ? 'scale-110' : 'scale-100'}
                        `}
                        preview={false}
                        onLoad={() => setLoadedImages(prev => new Set([...prev, image._id]))}
                      />
                    </div>
                    
                    {/* Gradient overlay */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                      transition-opacity duration-300
                      ${isHovered ? 'opacity-100' : 'opacity-0'}
                    `} />
                    
                    {/* Enhanced Action Buttons */}
                    <div className={`
                      absolute inset-0 flex items-center justify-center
                      transition-all duration-300 transform
                      ${isHovered ? 'opacity-100 scale-100' : 'opacity-80 scale-90'}
                    `}>
                      <Space size="large">
                        <Tooltip title="معاينة بحجم كامل">
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<FullscreenOutlined />}
                            size="large"
                            onClick={() => handlePreview(image)}
                            className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 shadow-xl"
                            style={{ 
                              color: 'white',
                              borderColor: 'rgba(255,255,255,0.3)'
                            }}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="هل أنت متأكد من حذف صورة الغلاف؟"
                          description="لا يمكن التراجع عن هذا الإجراء"
                          onConfirm={() => handleDelete(image._id)}
                          okText="حذف"
                          cancelText="إلغاء"
                          okButtonProps={{ danger: true }}
                        >
                          <Tooltip title="حذف صورة الغلاف">
                            <Button
                              danger
                              shape="circle"
                              icon={<DeleteOutlined />}
                              size="large"
                              className="bg-red-500/20 backdrop-blur-sm border-red-300/30 hover:bg-red-500/30 shadow-xl"
                              style={{ 
                                color: 'white',
                                borderColor: 'rgba(239, 68, 68, 0.3)'
                              }}
                            />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                    </div>

                    {/* Floating particles effect on hover */}
                    {isHovered && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`absolute w-1 h-1 rounded-full animate-ping ${
                              isPrimary ? 'bg-yellow-300/60' : 'bg-white/60'
                            }`}
                            style={{
                              left: `${20 + i * 15}%`,
                              top: `${10 + i * 10}%`,
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '2s'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Image Info */}
                  <div className={`
                    p-4 bg-white transition-all duration-300
                    ${isHovered ? 
                      isPrimary 
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50' 
                        : 'bg-gradient-to-r from-purple-50 to-blue-50' 
                      : ''
                    }
                  `}>
                    <div className="flex items-center justify-between mb-2">
                      <Text className="text-sm font-medium text-gray-700 truncate flex-1">
                        {image.alt || 'بدون وصف'}
                      </Text>
                      <Badge 
                        count={index + 1} 
                        style={{ 
                          backgroundColor: isHovered 
                            ? isPrimary ? '#f59e0b' : '#7c3aed'
                            : '#6b7280',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(image.uploadedAt).toLocaleDateString('ar-SA')}</span>
                      <div className="flex items-center gap-1">
                        {isPrimary && <CrownOutlined className="text-yellow-500" />}
                        <StarOutlined className="text-yellow-500" />
                        <HeartOutlined className="text-red-500" />
                      </div>
                    </div>
                  </div>

                  {/* Delete X Button - Top Left Corner */}
                  <button
                    className={`
                      absolute top-2 left-2 z-30 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 border-2 border-white
                      ${deletingImages.has(image._id) 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600 hover:scale-110 text-white'
                      }
                      ${isPrimary ? 'mt-8' : ''} // Move down if primary badge is present
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      
                      if (deletingImages.has(image._id)) return;
                      
                      
                      modal.confirm({
                        title: '🗑️ حذف صورة الغلاف',
                        content: (
                          <div className="py-4">
                            <p className="text-gray-700 mb-3">هل أنت متأكد من حذف صورة الغلاف؟</p>
                            {isPrimary && (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                                <p className="text-orange-800 text-sm">
                                  👑 <strong>تحذير:</strong> هذه هي صورة الغلاف الرئيسية
                                </p>
                              </div>
                            )}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-yellow-800 text-sm">
                                ⚠️ <strong>تحذير:</strong> لا يمكن التراجع عن هذا الإجراء
                              </p>
                            </div>
                          </div>
                        ),
                        okText: '🗑️ حذف نهائياً',
                        cancelText: '❌ إلغاء',
                        okButtonProps: { 
                          danger: true,
                          size: 'large'
                        },
                        cancelButtonProps: {
                          size: 'large'
                        },
                        width: 450,
                        centered: true,
                        onOk: () => {
                          handleDelete(image._id);
                        }
                      });
                    }}
                    disabled={deletingImages.has(image._id)}
                    title={deletingImages.has(image._id) ? 'جاري الحذف...' : 'حذف صورة الغلاف'}
                  >
                    {deletingImages.has(image._id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      '✕'
                    )}
                  </button>

                  {/* Enhanced Order indicator with animation */}
                  <div className={`
                    absolute bottom-3 right-3 bg-gradient-to-r text-white text-sm rounded-full w-8 h-8 flex items-center justify-center
                    font-bold shadow-lg transition-all duration-300 transform
                    ${isPrimary 
                      ? 'from-yellow-500 to-orange-500' 
                      : 'from-purple-500 to-blue-500'
                    }
                    ${isHovered ? 'scale-125 rotate-12' : 'scale-100'}
                  `}>
                    {index + 1}
                  </div>

                  {/* Shimmer effect on drag */}
                  {draggedIndex === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  )}

                  {/* Deleting overlay */}
                  {deletingImages.has(image._id) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
                      <div className="bg-white rounded-lg p-4 shadow-xl text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mx-auto mb-2"></div>
                        <p className="text-gray-700 font-medium">جاري حذف صورة الغلاف...</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Spin>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ maxWidth: '800px' }}
      >
        <Image
          alt={previewTitle}
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>
      </Card>
    </div>
  );
};

export default MainImageManager;
