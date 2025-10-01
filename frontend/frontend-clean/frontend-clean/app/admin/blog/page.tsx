'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Upload, 
  message, 
  Space, 
  Tag, 
  Popconfirm,
  App 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  UploadOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  CameraOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { apiFetch, uploadAdminBlogCover } from '@/lib/api';
import RichTextEditor from '@/components/ui/rich-text-editor';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface BlogPost {
  _id: string;
  title: any;
  content: any;
  excerpt: any;
  category: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  author: any;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

function BlogManagement() {
  const { message } = App.useApp();
  const { admin, loading: authLoading } = useAdminAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');

  const categories = [
    { value: 'all', label: 'جميع الفئات' },
    { value: 'design', label: 'التصميم' },
    { value: 'business', label: 'الأعمال' },
    { value: 'marketing', label: 'التسويق' },
    { value: 'technology', label: 'التقنية' },
    { value: 'tips', label: 'نصائح' },
  ];

  // Check authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!admin) {
    redirect('/admin/login');
  }

  useEffect(() => {
    if (admin) {
      fetchPosts();
    }
  }, [admin]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const response: any = await apiFetch('/admin/blogs', { 
        cache: 'no-store',
        auth: true 
      });
      
      
      if (response && response.success) {
        setPosts(response.data?.blogs || []);
      } else {
        message.error('استجابة غير صحيحة من الخادم');
      }
    } catch (error) {
      message.error(`فشل في تحميل المقالات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setCategoryInput('');
    form.setFieldsValue({
      title: typeof post.title === 'object' ? post.title.ar : post.title,
      content: typeof post.content === 'object' ? post.content.ar : post.content,
      excerpt: typeof post.excerpt === 'object' ? post.excerpt.ar : post.excerpt,
      category: post.category ? [post.category] : [],
      tags: post.tags,
      isPublished: (post as any).isPublished ?? ((post as any).status === 'published'),
    });
    setCoverImageUrl(post.coverImage || '');
    setIsModalVisible(true);
  };

  const handleDelete = (postId: string, postTitle?: string) => {
    Modal.confirm({
      title: 'تأكيد حذف المقال',
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div className="py-4">
          <p className="text-gray-700 mb-4 text-base">هل أنت متأكد من حذف هذا المقال؟</p>
          {postTitle && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm text-red-700 font-medium">المقال المراد حذفه:</p>
              </div>
              <p className="font-semibold text-gray-800 text-base pr-4">{postTitle}</p>
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
      okText: 'نعم، احذف المقال',
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
          const response: any = await apiFetch(`/admin/blogs/${postId}`, {
            method: 'DELETE',
            auth: true
          });
          if (response.success) {
            message.success({
              content: 'تم حذف المقال بنجاح! 🗑️',
              duration: 3,
              style: { marginTop: '20vh' }
            });
            fetchPosts();
          }
        } catch (error) {
          message.error({
            content: 'فشل في حذف المقال ❌',
            duration: 4,
            style: { marginTop: '20vh' }
          });
        }
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      let categoryRaw = Array.isArray(values.category) ? (values.category[0] || '') : (values.category || '');
      // If user typed but didn't press Enter to create a tag, fall back to search input value
      if (!categoryRaw && categoryInput) {
        categoryRaw = categoryInput;
      }
      const category = typeof categoryRaw === 'string' ? categoryRaw.trim().toLowerCase() : '';
      const postData: any = {
        title: { ar: values.title, en: values.title },
        content: { ar: values.content, en: values.content },
        excerpt: { ar: values.excerpt, en: values.excerpt },
        // category will be added only if non-empty
        tags: values.tags || [],
        isPublished: values.isPublished,
        isFeatured: values.isFeatured,
        coverImage: coverImageUrl,
      };

      if (category) {
        postData.category = category;
      }

      const url = editingPost 
        ? `/admin/blogs/${editingPost._id}`
        : '/admin/blogs';
      
      const method = editingPost ? 'PUT' : 'POST';
      

      const response: any = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
        auth: true
      });

      if (response.success) {
        message.success(editingPost ? 'تم تحديث المقال بنجاح' : 'تم إضافة المقال بنجاح');
        // Prefer server response if available
        const updatedFromServer = (response as any).data?.blog;
        if (editingPost && updatedFromServer) {
          setPosts(prev => prev.map(p => p._id === editingPost._id ? (updatedFromServer as any) : p));
        } else if (editingPost) {
          // Fallback optimistic update to avoid losing manually typed category before refetch
          setPosts(prev => prev.map(p => {
            if (p._id !== editingPost._id) return p;
            return {
              ...p,
              title: { ar: postData.title.ar, en: postData.title.en } as any,
              content: { ar: postData.content.ar, en: postData.content.en } as any,
              excerpt: { ar: postData.excerpt.ar, en: postData.excerpt.en } as any,
              category: postData.category,
              tags: postData.tags,
              coverImage: postData.coverImage || p.coverImage,
              status: postData.isPublished ? 'published' : 'draft',
              isPublished: !!postData.isPublished,
              isFeatured: !!postData.isFeatured,
              meta: { ...(p as any).meta, featured: !!postData.isFeatured },
            } as any;
          }));
        }
        setIsModalVisible(false);
        setEditingPost(null);
        form.resetFields();
        setCategoryInput('');
        // Resync after a short delay
        setTimeout(() => fetchPosts(), 300);
      }
    } catch (error) {
      message.error('فشل في حفظ المقال');
    }
  };

  const handleCoverUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);
      
      const { coverUrl, blog } = await uploadAdminBlogCover(file, editingPost?._id);
      
      // إكمال التقدم
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setCoverImageUrl(coverUrl);
        if (blog && editingPost) {
          setEditingPost({ ...editingPost, coverImage: coverUrl } as BlogPost);
        }
        message.success({
          content: 'تم رفع صورة الغلاف بنجاح! 🎉',
          duration: 3,
          style: { marginTop: '20vh' }
        });
      }, 500);
      
      return coverUrl;
    } catch (error) {
      message.error({
        content: error instanceof Error ? error.message : 'فشل في رفع صورة الغلاف ❌',
        duration: 4,
        style: { marginTop: '20vh' }
      });
      return null;
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const uploadProps = {
    name: 'coverImage',
    listType: 'picture-card' as const,
    className: 'cover-uploader',
    showUploadList: false,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('يمكن رفع الصور فقط!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('حجم الصورة يجب أن يكون أقل من 5MB!');
        return false;
      }
      handleCoverUpload(file);
      return false; // Prevent default upload
    },
  };

  const getPostTitle = (title: any) => {
    if (typeof title === 'object' && title.ar) {
      return title.ar;
    }
    return title || 'غير محدد';
  };

  const getPostExcerpt = (excerpt: any) => {
    if (typeof excerpt === 'object' && excerpt.ar) {
      return excerpt.ar;
    }
    return excerpt || '';
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = getPostTitle(post.title)
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      title: 'المقال',
      key: 'post',
      render: (_: any, record: BlogPost) => (
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          {record.coverImage && (
            <img 
              src={record.coverImage} 
              alt="" 
              className="w-16 h-12 rounded object-cover" 
            />
          )}
          <div className="flex-1">
            <div className="font-medium text-gray-800 line-clamp-2">
              {getPostTitle(record.title)}
            </div>
            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
              {getPostExcerpt(record.excerpt)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              بواسطة: {record.author?.name || 'غير محدد'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'الفئة',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => null
    },
    {
      title: 'العلامات',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div className="space-x-1 rtl:space-x-reverse">
          {tags && tags.length > 0 ? (
            tags.slice(0, 3).map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))
          ) : (
            <span className="text-gray-400 text-sm">لا توجد علامات</span>
          )}
          {tags && tags.length > 3 && (
            <Tag>+{tags.length - 3}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'الحالة',
      key: 'status',
      render: (_: any, record: BlogPost) => (
        <div className="space-y-1">
          <Tag color={(record as any).isPublished || (record as any).status === 'published' ? 'green' : 'orange'}>
            {(record as any).isPublished || (record as any).status === 'published' ? 'منشور' : 'مسودة'}
          </Tag>
          {record.isFeatured && (
            <Tag color="gold">مميز</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'تاريخ الإنشاء',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString('ar-SA')}</div>
          <div className="text-xs text-gray-500">
            {new Date(date).toLocaleTimeString('ar-SA')}
          </div>
        </div>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: BlogPost) => (
        <Space>
          {((record as any).status === 'published') ? (
            <Button
              type="link"
              size="small"
              onClick={async () => {
                try {
                  await apiFetch(`/admin/blogs/${record._id}/unpublish`, { method: 'POST', auth: true });
                  message.success('تم إلغاء نشر المقال');
                  setPosts(prev => prev.map(p => p._id === record._id ? ({ ...p, isPublished: false, status: 'draft' } as any) : p));
                } catch (e) {
                  message.error('فشل في إلغاء نشر المقال');
                }
              }}
            >
              إلغاء النشر
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              onClick={async () => {
                try {
                  await apiFetch(`/admin/blogs/${record._id}/publish`, { method: 'POST', auth: true });
                  message.success('تم نشر المقال');
                  setPosts(prev => prev.map(p => p._id === record._id ? ({ ...p, isPublished: true, status: 'published' } as any) : p));
                } catch (e) {
                  message.error('فشل في نشر المقال');
                }
              }}
            >
              نشر
            </Button>
          )}
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => window.open(`/blog/${(record as any).slug || record._id}`, '_blank')}
          >
            عرض
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
            onClick={() => handleEdit(record)}
          >
            تعديل
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
            onClick={() => handleDelete(record._id, typeof record.title === 'object' ? record.title.ar : record.title)}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">إدارة المدونة</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPost(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            إضافة مقال جديد
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Search
            placeholder="البحث في المقالات..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="w-full sm:w-48"
          >
            {categories.map(cat => (
              <Option key={cat.value} value={cat.value}>{cat.label}</Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPosts}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredPosts.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} مقال`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingPost ? 'تعديل المقال' : 'إضافة مقال جديد'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPost(null);
          setCoverImageUrl('');
          form.resetFields();
        }}
        footer={null}
        className="top-4"
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="عنوان المقال"
            rules={[{ required: true, message: 'يرجى إدخال عنوان المقال' }]}
          >
            <Input placeholder="أدخل عنوان المقال" />
          </Form.Item>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              صورة الغلاف
            </label>
            <Upload {...uploadProps}>
              {coverImageUrl ? (
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <img 
                    src={coverImageUrl} 
                    alt="صورة الغلاف" 
                    className="w-full h-40 object-cover"
                  />
                  {/* مؤشر التحميل */}
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                      <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-2xl min-w-[200px]">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                          <CameraOutlined className="absolute inset-0 m-auto text-blue-500 text-lg" />
                        </div>
                        <div className="text-center">
                          <div className="text-gray-800 font-semibold mb-1">جاري رفع الصورة</div>
                          <div className="text-sm text-gray-500 mb-3">{Math.round(uploadProgress)}% مكتمل</div>
                          <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                  <div className={`
                    relative overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer
                    ${uploading 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'
                    }
                  `}>
                    <div className="flex flex-col items-center justify-center py-8 px-6">
                      {uploading ? (
                        <>
                          <div className="relative mb-4">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                            <CameraOutlined className="absolute inset-0 m-auto text-blue-500 text-xl" />
                          </div>
                          <div className="text-center">
                            <div className="text-blue-600 font-semibold mb-2">جاري رفع الصورة...</div>
                            <div className="text-sm text-gray-500 mb-3">{Math.round(uploadProgress)}% مكتمل</div>
                            <div className="w-48 h-3 bg-blue-200 rounded-full mt-3 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <CameraOutlined className="text-white text-lg" />
                          </div>
                          <div className="text-center">
                            <div className="text-gray-700 font-medium text-base mb-1">رفع صورة الغلاف</div>
                            <div className="text-gray-500 text-sm mb-2">اضغط أو اسحب الصورة هنا</div>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                              <span>PNG, JPG, GIF</span>
                              <span>•</span>
                              <span>حتى 5MB</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {/* تأثير الـ hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
              </Upload>
            
            {/* أزرار التحكم في الصورة - تظهر فقط عند وجود صورة */}
            {coverImageUrl && (
              <div className="flex gap-2 justify-center mt-3">
                <Button 
                  type="primary"
                  icon={<CameraOutlined />}
                  size="small"
                  className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
                  disabled={uploading}
                  onClick={() => {
                    setCoverImageUrl('');
                    form.setFieldValue('coverImage', null);
                  }}
                >
                  تغيير الصورة
                </Button>
                <Button 
                  danger
                  icon={<CloseCircleOutlined />}
                  size="small"
                  className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
                  onClick={() => {
                    setCoverImageUrl('');
                    form.setFieldValue('coverImage', null);
                  }}
                  disabled={uploading}
                >
                  حذف الصورة
                </Button>
              </div>
            )}
          </div>

          <Form.Item
            name="excerpt"
            label="ملخص المقال"
          >
            <TextArea rows={3} placeholder="أدخل ملخص المقال" />
          </Form.Item>

          <Form.Item
            name="content"
            label="محتوى المقال"
            rules={[{ required: true, message: 'يرجى إدخال محتوى المقال' }]}
          >
            <Input.TextArea style={{ display: 'none' }} />
          </Form.Item>
          
          {/* Rich Text Editor (separate from form control for now) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 500,
              color: 'rgba(0, 0, 0, 0.85)'
            }}>
              محتوى المقال (محرر متقدم)
            </label>
            <RichTextEditor 
              placeholder="ابدأ في كتابة محتوى المقال..."
              style={{ minHeight: '300px' }}
              value={form.getFieldValue('content') || ''}
              onChange={(value) => {
                form.setFieldValue('content', value);
              }}
            />
          </div>

          <Form.Item
            name="category"
            label="الفئة"
            hidden
          >
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="العلامات (اختياري)"
          >
            <Select
              mode="tags"
              placeholder="أدخل العلامات"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <div className="flex gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="mr-2">نشر المقال</span>
                <Form.Item name="isPublished" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
              <div className="flex items-center gap-2">
                <span className="mr-2">مقال مميز</span>
                <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>
              إلغاء
            </Button>
            <Button type="primary" htmlType="submit" className="bg-purple-600">
              {editingPost ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default function AdminBlogPage() {
  return (
    <App>
      <BlogManagement />
    </App>
  );
}
