'use client';

import React, { useState, useCallback } from 'react';
import { Upload, message, Progress, Image, Button, Space, Card } from 'antd';
import { DeleteOutlined, EyeOutlined, CloudUploadOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

interface PreviewImage {
  file: File;
  url: string;
  id: string;
}

interface UploadProgress {
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

interface ImageUploadZoneProps {
  onUpload: (file: File, altText?: string) => Promise<void>;
  loading?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  showPreview?: boolean;
}

const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  onUpload,
  loading = false,
  accept = 'image/*',
  maxSize = 5,
  multiple = true,
  showPreview = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Generate unique ID for tracking
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Create preview URL for file
  const createPreview = useCallback((file: File): PreviewImage => {
    return {
      file,
      url: URL.createObjectURL(file),
      id: generateId()
    };
  }, []);

  // Clean up preview URLs
  const cleanupPreview = useCallback((preview: PreviewImage) => {
    URL.revokeObjectURL(preview.url);
  }, []);

  // Handle file selection with preview
  const handleFileSelect = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    const newPreviews: PreviewImage[] = [];

    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        message.error(`${file.name}: يمكنك رفع الصور فقط!`);
        return;
      }

      // Validate file size
      if (file.size / 1024 / 1024 > maxSize) {
        message.error(`${file.name}: حجم الصورة يجب أن يكون أقل من ${maxSize} ميجابايت!`);
        return;
      }

      validFiles.push(file);
      if (showPreview) {
        newPreviews.push(createPreview(file));
      }
    });

    if (showPreview) {
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }

    // Start uploading valid files
    validFiles.forEach(file => handleUpload(file));
  }, [maxSize, showPreview, createPreview]);

  const handleUpload = async (file: File) => {
    const uploadId = generateId();
    let progressInterval: NodeJS.Timeout | null = null;
    
    // Initialize progress tracking
    setUploadProgress(prev => [...prev, {
      id: uploadId,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      setUploading(true);

      // Simulate progress updates (in real implementation, this would come from upload progress)
      progressInterval = setInterval(() => {
        setUploadProgress(prev => prev.map(p => 
          p.id === uploadId && p.progress < 90
            ? { ...p, progress: p.progress + Math.random() * 20 }
            : p
        ));
      }, 200);

      await onUpload(file);

      // Complete progress
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setUploadProgress(prev => prev.map(p => 
        p.id === uploadId 
          ? { ...p, progress: 100, status: 'success' }
          : p
      ));

      // Remove progress after delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(p => p.id !== uploadId));
      }, 2000);

      return true;
    } catch (error) {
      message.error(`فشل في رفع ${file.name}`);
      
      // Clear progress interval on error
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setUploadProgress(prev => prev.map(p => 
        p.id === uploadId 
          ? { ...p, status: 'error' }
          : p
      ));

      // Remove error progress after delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(p => p.id !== uploadId));
      }, 3000);

      return false;
    } finally {
      setUploading(false);
    }
  };

  // Remove preview image
  const removePreview = useCallback((id: string) => {
    setPreviewImages(prev => {
      const updated = prev.filter(p => p.id !== id);
      const removed = prev.find(p => p.id === id);
      if (removed) {
        cleanupPreview(removed);
      }
      return updated;
    });
  }, [cleanupPreview]);

  // Clear all previews
  const clearAllPreviews = useCallback(() => {
    previewImages.forEach(cleanupPreview);
    setPreviewImages([]);
  }, [previewImages, cleanupPreview]);

  // Upload all preview images
  const uploadAllPreviews = useCallback(() => {
    previewImages.forEach(preview => {
      handleUpload(preview.file);
    });
    clearAllPreviews();
  }, [previewImages]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      previewImages.forEach(cleanupPreview);
    };
  }, [previewImages, cleanupPreview]);

  const uploadProps = {
    name: 'file',
    multiple,
    accept,
    showUploadList: false,
    beforeUpload: (file: File, fileList: File[]) => {
      if (showPreview) {
        handleFileSelect(fileList);
      } else {
        handleUpload(file);
      }
      return false; // Prevent default upload
    },
    disabled: loading || uploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDrop: () => setDragActive(false)
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Upload Zone */}
      <Dragger 
        {...uploadProps} 
        className={`
          border-dashed border-2 transition-all duration-300 relative overflow-hidden
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
          }
          ${(loading || uploading) ? 'pointer-events-none' : ''}
        `}
      >
        <div className="relative z-10">
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined 
              className={`text-5xl transition-all duration-300 ${
                dragActive ? 'text-blue-500 animate-bounce' : 'text-gray-400'
              }`} 
            />
          </p>
          <p className="ant-upload-text text-xl font-bold mb-2">
            {dragActive ? 'اتركها هنا!' : 'اسحب الصور هنا أو انقر للاختيار'}
          </p>
          <p className="ant-upload-hint text-gray-600 leading-relaxed">
            يمكنك رفع صور متعددة. الأنواع المدعومة: JPG, PNG, WebP
            <br />
            <span className="font-medium">الحد الأقصى لحجم الصورة: {maxSize} ميجابايت</span>
          </p>
        </div>

        {/* Animated background effect */}
        {dragActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 animate-pulse" />
        )}

        {/* Loading overlay */}
        {(loading || uploading) && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <div className="text-blue-600 font-medium">جاري المعالجة...</div>
            </div>
          </div>
        )}
      </Dragger>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Card title="تقدم الرفع" size="small">
          <div className="space-y-3">
            {uploadProgress.map(progress => (
              <div key={progress.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>جاري الرفع...</span>
                  <span>{Math.round(progress.progress)}%</span>
                </div>
                <Progress 
                  percent={progress.progress} 
                  status={progress.status === 'error' ? 'exception' : 'active'}
                  strokeColor={{
                    '0%': '#4b2e83',
                    '100%': '#7a4db3',
                  }}
                  trailColor="#f0f0f0"
                  size={8}
                  showInfo={false}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Image Previews */}
      {showPreview && previewImages.length > 0 && (
        <Card 
          title={
            <div className="flex justify-between items-center">
              <span>معاينة الصور ({previewImages.length})</span>
              <Space>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={uploadAllPreviews}
                  disabled={uploading}
                  icon={<CloudUploadOutlined />}
                >
                  رفع الكل
                </Button>
                <Button 
                  size="small"
                  onClick={clearAllPreviews}
                  disabled={uploading}
                >
                  مسح الكل
                </Button>
              </Space>
            </div>
          }
          size="small"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewImages.map(preview => (
              <div 
                key={preview.id} 
                className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-square">
                  <Image
                    src={preview.url}
                    alt="معاينة"
                    className="w-full h-full object-cover"
                    preview={{
                      mask: <EyeOutlined className="text-white" />
                    }}
                  />
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Space>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CloudUploadOutlined />}
                      size="small"
                      onClick={() => {
                        handleUpload(preview.file);
                        removePreview(preview.id);
                      }}
                      disabled={uploading}
                      title="رفع هذه الصورة"
                    />
                    <Button
                      danger
                      shape="circle"
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => removePreview(preview.id)}
                      title="حذف من المعاينة"
                    />
                  </Space>
                </div>

                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                  <div className="truncate">{preview.file.name}</div>
                  <div className="text-gray-300">
                    {(preview.file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageUploadZone;