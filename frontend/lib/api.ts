// Backend API connector - connects to the backend API server

export type ApiOptions = (RequestInit & { auth?: boolean }) | undefined;

export type StoredUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Debug logging disabled for security

// Upload admin blog cover image
export async function uploadAdminBlogCover(file: File, blogId?: string): Promise<{ coverUrl: string; blog?: any }>{
  const formData = new FormData();
  formData.append('coverImage', file);
  if (blogId) formData.append('blogId', blogId);

  const headers: Record<string, string> = {};
  const token = getAdminToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_BASE_URL}/admin/blogs/upload-cover`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.error || data?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  const json: any = await res.json();
  const coverUrl = json?.data?.cover?.url || json?.data?.url;
  const blog = json?.data?.blog;
  if (!coverUrl) throw new Error('لم يتم استرجاع رابط الصورة بعد الرفع');
  return { coverUrl, blog };
}

// Local storage helpers
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}
export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("adminToken", token);
}
export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("adminToken");
}
export function getAdminRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminRefreshToken");
}
export function setAdminRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("adminRefreshToken", token);
}
export function clearAdminRefreshToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("adminRefreshToken");
}
export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}
export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}
// Refresh token helpers
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}
export function setRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("refreshToken", token);
}
export function clearRefreshToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("refreshToken");
}
export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
export function setUser(user: StoredUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
}
export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
}
export function logout() {
  clearToken();
  clearRefreshToken();
  clearUser();
}

// Backend API functions

// Main API fetch function
export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { auth = false, ...fetchOptions } = options || {};
  
  // For auth endpoints, don't fall back to static data - always use backend
  const isAuthEndpoint = endpoint.startsWith('/auth/');
  const method = ((fetchOptions.method as string) || 'GET').toUpperCase();
  
  // Try backend API first if base URL is configured
  if (API_BASE_URL) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((fetchOptions.headers as Record<string, string>) || {}),
      };

      if (auth) {
        // Check if this is an admin endpoint
        const isAdminEndpoint = endpoint.startsWith('/admin/');
        const token = isAdminEndpoint ? getAdminToken() : getToken();
        // Auth check passed
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else if (isAdminEndpoint) {
          throw new Error('لا يوجد رمز مصادقة إدارية، الوصول مرفوض');
        } else {
          throw new Error('لا يوجد رمز مصادقة، الوصول مرفوض');
        }
      }

      const performFetch = async (): Promise<Response> => fetch(url, {
        ...fetchOptions,
        headers,
      });

      let response = await performFetch();

      // If unauthorized/forbidden and auth is required, try to refresh token once
      if (auth && (response.status === 401 || response.status === 403)) {
        const isAdminEndpoint = endpoint.startsWith('/admin/');
        if (isAdminEndpoint) {
          const adminRT = getAdminRefreshToken();
          if (adminRT) {
            try {
              const refreshRes = await fetch(`${API_BASE_URL}/admin/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: adminRT })
              });
              if (refreshRes.ok) {
                const refreshJson: any = await refreshRes.json();
                const newAccess = refreshJson?.data?.tokens?.accessToken || refreshJson?.accessToken;
                const newRefresh = refreshJson?.data?.tokens?.refreshToken || refreshJson?.refreshToken;
                if (newAccess) setAdminToken(newAccess);
                if (newRefresh) setAdminRefreshToken(newRefresh);
                // retry original request with new token
                const retryHeaders = { ...headers };
                retryHeaders['Authorization'] = `Bearer ${newAccess}`;
                response = await fetch(url, { ...fetchOptions, headers: retryHeaders });
              } else {
                // Refresh failed; clear admin tokens
                clearAdminToken();
                clearAdminRefreshToken();
              }
            } catch {
              clearAdminToken();
              clearAdminRefreshToken();
            }
          }
        } else {
          const rToken = getRefreshToken();
          if (rToken) {
            try {
              const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: rToken })
              });
              if (refreshRes.ok) {
                const refreshJson: any = await refreshRes.json();
                const newAccess = refreshJson?.data?.tokens?.accessToken || refreshJson?.accessToken;
                const newRefresh = refreshJson?.data?.tokens?.refreshToken || refreshJson?.refreshToken;
                if (newAccess) setToken(newAccess);
                if (newRefresh) setRefreshToken(newRefresh);
                // retry original request with new token
                const retryHeaders = { ...headers };
                retryHeaders['Authorization'] = `Bearer ${newAccess}`;
                response = await fetch(url, { ...fetchOptions, headers: retryHeaders });
              } else {
                // Refresh failed; clear tokens
                logout();
              }
            } catch {
              logout();
            }
          }
        }
      }

      if (response.ok) {
        return await response.json();
      } else {
        // Handle non-ok responses by reading body ONCE then parsing
        let errorMessage = `HTTP ${response.status}`;
        let raw: string | null = null;
        try {
          raw = await response.text();
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              errorMessage = parsed?.error || parsed?.message || errorMessage;
            } catch {
              // Not JSON; use raw text
              errorMessage = raw || errorMessage;
            }
          }
        } catch (e) {
          // If body can't be read (e.g., content-length mismatch), keep default message
        }
        if (auth && (response.status === 401 || response.status === 403)) {
          // Ensure logout on repeated unauthorized
          logout();
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      // For auth endpoints or any non-GET methods, always throw the error - never fall back
      if (isAuthEndpoint || method !== 'GET') {
        throw error;
      }

      // For GET endpoints, re-throw likely HTTP errors; otherwise allow static fallback
      if (error instanceof Error && (
        error.message.startsWith('HTTP ') ||
        error.message.includes('Validation failed') ||
        error.message.includes('Not Found') ||
        error.message.includes('Failed')
      )) {
        throw error;
      }
    }
  }

  // Don't fall back to static data for auth endpoints
  if (isAuthEndpoint) {
    throw new Error('Backend API unavailable for authentication');
  }

  // Fallback to static data
  return apiFetchStatic<T>(endpoint, options);
}

// Service types
export interface Service {
  _id?: string;
  title: { ar: string; en: string };
  slug: string;
  description: { ar: string; en: string };
  price: { SAR: number; USD: number };
  originalPrice?: { SAR: number; USD: number };
  deliveryTime: { min: number; max: number };
  revisions: number;
  category: string;
  features: { ar: string[]; en: string[] };
  deliveryLinks: string[];
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

// API Functions

// Fetch all services
export async function fetchServices(limit = 100, page = 1): Promise<{ services: Service[]; total: number; page: number; totalPages: number }> {
  try {
    const response = await apiFetch<{ data: { services: Service[]; total: number; page: number; totalPages: number } }>(`/services?limit=${limit}&page=${page}`);
    return response.data;
  } catch (error) {
    // Return empty result on API failure
    return { services: [], total: 0, page: 1, totalPages: 0 };
  }
}

// Fetch single service by slug
export async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const response = await apiFetch<{ data: { service: Service } }>(`/services/${slug}`);
    return response.data.service;
  } catch (error) {
    return null;
  }
}

// Fetch services by category
export async function fetchServicesByCategory(category: string, limit = 100): Promise<Service[]> {
  try {
    const response = await apiFetch<{ data: { services: Service[] } }>(`/services?category=${category}&limit=${limit}`);
    return response.data.services;
  } catch (error) {
    return [];
  }
}

// Fetch featured services
export async function fetchFeaturedServices(limit = 10): Promise<Service[]> {
  try {
    const response = await apiFetch<{ data: { services: Service[] } }>(`/services?featured=true&limit=${limit}`);
    return response.data.services;
  } catch (error) {
    return [];
  }
}

// FAQ types and functions
export interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

export async function fetchFAQs(): Promise<FAQ[]> {
  try {
    const response = await apiFetch<{ data: { faqs: FAQ[] } }>('/faqs');
    return response.data.faqs;
  } catch (error) {
    return [];
  }
}

// Blog types and functions
export interface BlogPost {
  _id: string;
  title: { ar: string; en: string };
  slug: string;
  content: { ar: string; en: string };
  excerpt: { ar: string; en: string };
  image?: string;
  author: string;
  publishedAt: string;
  tags: string[];
  isPublished: boolean;
}

export async function fetchBlogPosts(limit = 10): Promise<BlogPost[]> {
  try {
    const response = await apiFetch<{ data: { posts: BlogPost[] } }>(`/blog?limit=${limit}`);
    return response.data.posts;
  } catch (error) {
    return [];
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await apiFetch<{ data: { post: BlogPost } }>(`/blog/${slug}`);
    return response.data.post;
  } catch (error) {
    return null;
  }
}

// Contact and order functions
export async function submitContactForm(data: any) {
  return apiFetch('/contact', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createOrder(orderData: any) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
    auth: false
  });
}

// Upload order attachments using FormData
export async function uploadOrderFiles(files: File[] | FileList, auth = false): Promise<Array<{
  filename: string;
  originalName: string;
  url: string;
  cloudinaryId: string;
  fileType: 'image' | 'document' | 'pdf';
  size: number;
  uploadedAt?: string;
}>> {
  const form = new FormData();
  const list = Array.isArray(files as any) ? (files as any as File[]) : Array.from(files as FileList);
  list.forEach((f) => form.append('files', f));

  const headers: Record<string, string> = {};
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/order-upload/files`;
  
  const res = await fetch(url, { method: 'POST', body: form, headers });
  
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.error || data?.message || msg;
    } catch (parseErr) {
      // Failed to parse error response
    }
    throw new Error(msg);
  }
  const json = await res.json();
  const uploaded = json?.data?.files || json?.files || [];
  return uploaded as any;
}

// Auth functions
export async function login(email: string, password: string) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function register(userData: any) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

// Content Management API Functions

// Page Content types
export interface PageContent {
  _id: string;
  pageType: 'homepage' | 'about' | 'howToOrder' | 'policies' | 'hero' | 'foundational' | 'services' | 'contact';
  content: any;
  isActive: boolean;
  lastModified: string;
  createdAt: string;
  updatedAt: string;
}

// Homepage Section types
export interface HomepageSection {
  _id: string;
  sectionType: 'whatMakesUsDifferent' | 'counters' | 'closingCTA' | 'customSection';
  isActive: boolean;
  order: number;
  whatMakesUsDifferent?: any;
  counters?: any;
  closingCTA?: any;
  customSection?: any;
  meta?: any;
  createdAt: string;
  updatedAt: string;
}

// Media types
export interface Media {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  uploaderId: string;
  alt?: { ar?: string; en?: string };
  tags: string[];
  isPublic: boolean;
  meta?: {
    dimensions?: { width: number; height: number };
    usage?: Array<{ collectionName: string; documentId: string; field: string }>;
    folder?: string;
  };
  fileType: 'image' | 'video' | 'audio' | 'pdf' | 'document';
  createdAt: string;
  updatedAt: string;
}

// Content Hub Summary
export interface ContentHubSummary {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  totalMedia: number;
  recentPages: PageContent[];
  recentSections: HomepageSection[];
}

// Public: fetch page content by type (no auth)
export async function fetchPublicPageContent(pageType: string): Promise<any | null> {
  try {
    console.log(`🌐 Public API: Fetching content for ${pageType}`);
    const response = await apiFetch<{ success: boolean; data: any }>(`/content/page-content/${pageType}`);
    console.log('🌐 Public API response:', response);
    const data = response?.data ?? null;
    console.log('🌐 Public API data:', data);
    if (data?.sections) {
      console.log('🌐 Sections count:', data.sections.length);
      data.sections.forEach((section: any, index: number) => {
        console.log(`🌐 Section ${index}:`, section.id, section.data);
      });
    }
    return data;
  } catch (error) {
    console.error('🌐 Public API error:', error);
    return null;
  }
}

// Fetch all page content
export async function fetchPageContent(): Promise<PageContent[]> {
  try {
    const response = await apiFetch<{ data: PageContent[] }>('/admin/content/pages', { auth: true });
    return response.data || [];
  } catch (error) {
    return [];
  }
}

// Fetch single page content by type (admin)
export async function fetchPageContentByType(pageType: string): Promise<any | null> {
  try {
    // Backend route: GET /api/admin/content/pages/:pageType -> { success, data }
    // data might be either flat key-value pairs from Content model or structured data from PageContent model
    const response = await apiFetch<{ success: boolean; data: any }>(`/admin/content/pages/${pageType}`, { auth: true });
    const data = response?.data;

    console.log('🔍 fetchPageContentByType - Raw response data:', data);
    console.log('🔍 fetchPageContentByType - Data type:', typeof data);
    console.log('🔍 fetchPageContentByType - Data keys:', data ? Object.keys(data) : 'null');

    // If the API returns an array, take the first document
    const doc = Array.isArray(data) ? (data[0] || null) : data;
    if (!doc) return null;

    // If it's a full document with a content field (PageContent model), return content
    if (doc && typeof doc === 'object' && 'content' in doc) {
      console.log('✅ fetchPageContentByType - Found structured data with content field');
      return (doc as any).content || null;
    }

    // Check if it's flat key-value data (Content model)
    if (doc && typeof doc === 'object' && !('sections' in doc) && !('metadata' in doc)) {
      console.log('✅ fetchPageContentByType - Found flat key-value data from Content model');
      return doc; // Return flat data as-is for parsing
    }

    // Otherwise, assume the data itself is the content object (already structured)
    console.log('✅ fetchPageContentByType - Using data as-is');
    return doc ?? null;
  } catch (error) {
    console.error('❌ fetchPageContentByType error:', error);
    return null;
  }
}

// Update page content (admin)
export async function updatePageContent(pageType: string, content: any): Promise<any | null> {
  try {
    console.log(`🔄 updatePageContent called for pageType: ${pageType}`);
    console.log('📤 Sending content:', content);
    
    // Backend route: PUT /api/admin/content/pages/:pageType -> { success, data }
    // data might be full document or content object; normalize to content
    const response = await apiFetch<{ success: boolean; data: any }>(`/admin/content/pages/${pageType}`, {
      method: 'PUT',
      body: JSON.stringify(content),
      auth: true
    });
    
    console.log('📥 Backend response:', response);
    const data = response?.data;
    console.log('📊 Extracted data:', data);
    
    if (!data) {
      console.log('⚠️ No data returned from backend');
      return null;
    }
    
    if (data && typeof data === 'object' && 'content' in data) {
      console.log('✅ Returning nested content:', (data as any).content);
      return (data as any).content || null;
    }
    
    console.log('✅ Returning data directly:', data);
    return data ?? null;
  } catch (error) {
    console.error('💥 updatePageContent error:', error);
    throw error;
  }
}

// Fetch all homepage sections
export async function fetchHomepageSections(): Promise<HomepageSection[]> {
  try {
    const response = await apiFetch<{ data: HomepageSection[] }>('/admin/content/homepage-sections', { auth: true });
    return response.data || [];
  } catch (error) {
    return [];
  }
}

// Fetch single homepage section by type
export async function fetchHomepageSectionByType(sectionType: string): Promise<HomepageSection | null> {
  try {
    const response = await apiFetch<{ data: HomepageSection }>(`/admin/content/homepage-sections/${sectionType}`, { auth: true });
    return response.data || null;
  } catch (error) {
    return null;
  }
}

// Update homepage section
export async function updateHomepageSection(sectionType: string, sectionData: Partial<HomepageSection>): Promise<HomepageSection | null> {
  try {
    const response = await apiFetch<{ data: HomepageSection }>(`/admin/content/homepage-sections/${sectionType}`, {
      method: 'PUT',
      body: JSON.stringify(sectionData),
      auth: true
    });
    return response.data || null;
  } catch (error) {
    throw error;
  }
}

// Fetch media files
export async function fetchMedia(options: { page?: number; limit?: number; type?: string; folder?: string; search?: string } = {}): Promise<{ media: Media[]; total: number; page: number; totalPages: number }> {
  try {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.type) params.append('type', options.type);
    if (options.folder) params.append('folder', options.folder);
    if (options.search) params.append('search', options.search);

    const response = await apiFetch<{ data: { media: Media[]; total: number; page: number; totalPages: number } }>(`/admin/media?${params.toString()}`, { auth: true });
    return response.data || { media: [], total: 0, page: 1, totalPages: 0 };
  } catch (error) {
    return { media: [], total: 0, page: 1, totalPages: 0 };
  }
}

// Upload media files
export async function uploadMedia(files: File[] | FileList): Promise<Media[]> {
  try {
    const formData = new FormData();
    const fileList = Array.isArray(files) ? files : Array.from(files);
    fileList.forEach(file => formData.append('files', file));

    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API_BASE_URL}/admin/media/upload`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    throw error;
  }
}

// Delete media file
export async function deleteMedia(mediaId: string): Promise<boolean> {
  try {
    await apiFetch(`/admin/media/${mediaId}`, {
      method: 'DELETE',
      auth: true
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Fetch content hub summary
export async function fetchContentHubSummary(): Promise<ContentHubSummary> {
  try {
    const response = await apiFetch<{ data: ContentHubSummary }>('/admin/content/summary', { auth: true });
    return response.data || {
      totalPages: 0,
      publishedPages: 0,
      draftPages: 0,
      totalMedia: 0,
      recentPages: [],
      recentSections: []
    };
  } catch (error) {
    // Return static fallback data
    return {
      totalPages: 12,
      publishedPages: 8,
      draftPages: 3,
      totalMedia: 45,
      recentPages: [],
      recentSections: []
    };
  }
}

// Legacy/fallback functions for backward compatibility
export async function getAllServices(): Promise<Service[]> {
  const result = await fetchServices(100);
  return result.services;
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return fetchServiceBySlug(slug);
}

// Static data for fallback when backend is unavailable
const staticServices: Service[] = [
  {
    title: { ar: "كتابة مقال للمدونات", en: "Blog Article Writing" },
    slug: "blog-article-writing",
    description: { ar: "• مقال احترافي مخصص حسب المجال\n• مدة التنفيذ:2-5 أيام عمل\n• التسليم: حسب الطريقة الانسب لك Word,Pdf\nكل خدمة نقدمها تحمل بصمتنا الإبداعية، وتُصمم خصيصًا لتناسبك\n\nتشمل الخدمة تعديلين مجانيين فقط\nأي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب\n\nتنويه هام: الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل", en: "Professional article customized according to the field" },
    price: { SAR: 93.75, USD: 25 },
    deliveryTime: { min: 2, max: 5 },
    revisions: 2,
    category: "content",
    features: { ar: ["مقال احترافي مخصص", "حسب المجال المطلوب", "تعديلين مجانيين", "تسليم Word وPDF"], en: ["Professional customized article", "According to required field", "Two free revisions", "Word and PDF delivery"] },
    deliveryLinks: [],
    isActive: true,
    isFeatured: false,
    order: 16
  },
  // Logos
  {
    title: { ar: "تصميم شعار كتابي", en: "Text Logo Design" },
    slug: "text-logo-design",
    description: { ar: "• تصميم اسم تجاري بأسلوب فني\n• مدة التنفيذ:3-8 أيام عمل\n• التسليم: حسب الطريقة الانسب لك\nكل خدمة نقدمها تحمل بصمتنا الإبداعية، وتُصمم خصيصًا لتناسبك\n\nتشمل الخدمة تعديلين مجانيين فقط\nأي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب\n\nتنويه هام: الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل", en: "Commercial name design in artistic style" },
    price: { SAR: 131.25, USD: 35 },
    originalPrice: { SAR: 150, USD: 40 },
    deliveryTime: { min: 3, max: 5 },
    revisions: 2,
    category: "logos",
    features: { ar: ["تصميم اسم تجاري", "أسلوب فني مميز", "تعديلين مجانيين", "ملفات عالية الجودة"], en: ["Commercial name design", "Distinctive artistic style", "Two free revisions", "High quality files"] },
    deliveryLinks: [],
    isActive: true,
    isFeatured: false,
    order: 17
  },
  {
    title: { ar: "شعار مطور (أشكال)", en: "Advanced Logo (Shapes)" },
    slug: "advanced-logo-shapes",
    description: { ar: "• تصميم شعار بأيقونات وتكوينات متعددة\n• مدة التنفيذ:3-8 أيام عمل\n• التسليم: حسب الطريقة الانسب لك\nكل خدمة نقدمها تحمل بصمتنا الإبداعية، وتُصمم خصيصًا لتناسبك\n\nتشمل الخدمة تعديلين مجانيين فقط\nأي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب\n\nتنويه هام: الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل", en: "Logo design with multiple icons and configurations" },
    price: { SAR: 225, USD: 60 },
    deliveryTime: { min: 3, max: 5 },
    revisions: 2,
    category: "logos",
    features: { ar: ["أيقونات وتكوينات متعددة", "تصميم متطور", "تعديلين مجانيين", "ملفات عالية الجودة"], en: ["Multiple icons and configurations", "Advanced design", "Two free revisions", "High quality files"] },
    deliveryLinks: [],
    isActive: true,
    isFeatured: true,
    order: 18
  },
  {
    title: { ar: "تصميم شعار للشركات والمتاجر", en: "Corporate and Store Logo Design" },
    slug: "corporate-store-logo-design",
    description: { ar: "• تصميم احترافي يعكس هوية تجارية كاملة\n• مدة التنفيذ:3-8 أيام عمل\n• التسليم: حسب الطريقة الانسب لك\nكل خدمة نقدمها تحمل بصمتنا الإبداعية، وتُصمم خصيصًا لتناسبك\n\nتشمل الخدمة تعديلين مجانيين فقط\nأي تعديل إضافي يُحسب كخدمة مستقلة ويتم تسعيره حسب نوع التعديل المطلوب\n\nتنويه هام: الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل", en: "Professional design that reflects complete commercial identity" },
    price: { SAR: 318.75, USD: 85 },
    deliveryTime: { min: 3, max: 5 },
    revisions: 2,
    category: "logos",
    features: { ar: ["هوية تجارية كاملة", "تصميم احترافي متقدم", "تعديلين مجانيين", "ملفات عالية الجودة"], en: ["Complete commercial identity", "Advanced professional design", "Two free revisions", "High quality files"] },
    deliveryLinks: [],
    isActive: true,
    isFeatured: true,
    order: 19
  },
  // Consultation
  {
    title: { ar: "استشارة تطوير الحسابات على السوشيال ميديا", en: "Social Media Account Development Consultation" },
    slug: "social-media-account-development-consultation",
    description: { ar: "تحليل احترافي لحسابك — لأن التطوير يبدأ من فهم التفاصيل\nنقوم بمراجعة شاملة لـ 1–3 حسابات على منصات التواصل، ونقدم لك تقريرًا عمليًا يوضح:\n• نقاط القوة والضعف في التصميم والمحتوى\n• اقتراحات لتحسين الهوية البصرية والتفاعل\n• أفكار لتطوير الشكل العام وجذب الجمهور المناسب\n• خطوات قابلة للتنفيذ لرفع جودة الحسابات وتحقيق أهدافك\nمدة التنفيذ: 2–4 أيام عمل\nالتسليم: تقرير بصيغة Word أو PDF\n\nكل خدمة نقدمها تحمل بصمتنا الإبداعية، وتُصمم خصيصًا لتناسبك\n\nتنويه هام: الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل", en: "Professional analysis of your account — because development starts with understanding the details" },
    price: { SAR: 37.5, USD: 10 },
    deliveryTime: { min: 2, max: 4 },
    revisions: 2,
    category: "consultation",
    features: { ar: ["مراجعة شاملة لـ 1-3 حسابات", "تقرير عملي مفصل", "اقتراحات تحسين", "خطوات قابلة للتنفيذ"], en: ["Comprehensive review of 1-3 accounts", "Detailed practical report", "Improvement suggestions", "Actionable steps"] },
    deliveryLinks: [],
    isActive: true,
    isFeatured: false,
    order: 20
  },
  {
    title: { ar: "استشارة تطوير الأعمال", en: "Business Development Consultation" },
    slug: "business-development-consultation",
    description: { ar: "خطوة أولى نحو تطوير مشروعك — بدون أي التزام مالي.\nاحصل على جلسة استشارية مجانية تناقش فيها مشروعك، أفكارك، أو التحديات اللي تواجهك.\nنساعدك في:\n• توجيه عام حول بناء الهوية التجارية\n• اقتراحات لتحسين تجربة العميل أو المحتوى التسويقي\n• أفكار أولية لتطوير الخدمات أو المنتجات\nالاستشارة مجانية تمامًا، وتُقدم عبر واتساب أو مكالمة قصيرة\nمدة الجلسة: 15–20 دقيقة\nكل تواصل معنا هو فرصة لإضافة بصمة جديدة لمشروعك\nيمكنك التواصل معنا الان عبر الواتس اب للحصول على الاستشارة", en: "First step towards developing your project — without any financial commitment." },
    price: { SAR: 0, USD: 0 },
    deliveryTime: { min: 0, max: 0 },
    revisions: 0,
    category: "consultation",
    features: { ar: ["استشارة مجانية", "جلسة 15-20 دقيقة", "عبر واتساب أو مكالمة", "بدون التزام مالي"], en: ["Free consultation", "15-20 minute session", "Via WhatsApp or call", "No financial commitment"] },
    deliveryLinks: [],
    isActive: true,
    isFeatured: true,
    order: 21
  },
  // Management
  {
    title: { ar: "ادارة حسابات السوشيال ميديا", en: "Social Media Account Management" },
    slug: "social-media-account-management",
    description: { ar: "حضور رقمي متكامل — لأن النجاح يبدأ من استراتيجية واضحة وتنفيذ احترافي.\nنقدم لك خدمة شاملة لإدارة محتوى حساباتك على السوشيال ميديا، تشمل:\n• إعداد خطة محتوى شهرية مدروسة حسب أهدافك\n• كتابة وتصميم 15 بوست احترافي يعكس هوية مشروعك\n• نشر يومي للستوريز بأسلوب جذاب ومتجدد\n• تنسيق الحساب بصريًا عند الطلب (الألوان، الأغلفة، الترتيب العام)\n• إدارة الحسابات والتفاعل مع الجمهور حسب الاتفاق\n• جدولة النشر باحترافية لضمان استمرارية الحضور\n• تقارير أداء دورية توضح النتائج وتوصيات التحسين\nتشمل الخدمة إدارة 1–2 حسابات على منصات التواصل\nمدة التنفيذ: 30 يوم\nكل خدمة نقدمها تحمل بصمتنا الإبداعية، وتُصمم خصيصًا لتناسبك\n\nتنويه هام: الخدمة غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع\nبعد الدفع، يتم تحويلك مباشرة إلى واتساب لإرسال التفاصيل", en: "Integrated digital presence — because success starts with a clear strategy and professional implementation." },
    price: { SAR: 825, USD: 220 },
    originalPrice: { SAR: 937.5, USD: 250 },
    deliveryTime: { min: 30, max: 30 },
    revisions: 2,
    category: "management",
    features: { ar: ["خطة محتوى شهرية", "15 بوست احترافي", "نشر يومي للستوريز", "تقارير أداء دورية"], en: ["Monthly content plan", "15 professional posts", "Daily stories posting", "Regular performance reports"] },
    deliveryLinks: [],
    isActive: true,
    isFeatured: true,
    order: 22
  },
];

const faqs = [
  {
    _id: "faq-order",
    question: "كيف أطلب خدمة؟",
    answer:
      "اختر الخدمة التي تناسبك من قسم \"خدماتنا\"، ثم أتم عملية الدفع عبر PayPal. بعد الدفع، يظهر لك خيار التواصل معنا عبر واتساب لتوضيح تفاصيل طلبك وبدء التنفيذ. للمزيد من التفاصيل حول آلية الطلب، يمكنك زيارة صفحة طلب خدمة.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "faq-duration",
    question: "كم يستغرق تنفيذ الخدمة؟",
    answer:
      "مدة التنفيذ تختلف حسب نوع الخدمة. ستجد المدة المحددة مكتوبة أسفل كل خدمة داخل صفحة \"خدماتنا\".",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "faq-delivery",
    question: "كيف أستلم الملفات؟",
    answer:
      "يتم تسليم الملفات بصيغ متعددة حسب نوع الخدمة، مثل: PNG، PDF، DOCX (للمحتوى النصي)، وأخرى. يتم تحديد صيغة التسليم أثناء التواصل بعد الدفع.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "faq-revisions",
    question: "هل يمكنني طلب تعديل بعد التسليم؟",
    answer:
      "نعم، إذا كان التعديل ضمن نطاق الخدمة وتم طلبه خلال 24 ساعة من وقت التسليم. أي تعديل خارج هذا الإطار يُحسب كخدمة إضافية مستقلة.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "faq-refund",
    question: "هل يمكن إلغاء الخدمة أو استرداد المبلغ؟",
    answer:
      "لا. جميع الخدمات غير قابلة للإلغاء أو الاسترداد بعد إتمام الدفع، كما هو موضح في صفحة السياسات.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "faq-custom",
    question: "هل يمكنني طلب خدمة اضافية غير موجودة في القائمة؟",
    answer:
      "نعم، يمكنك التواصل معنا عبر واتساب وشرح احتياجك، وسنرد عليك بإمكانية التنفيذ أو التخصيص.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "faq-commercial",
    question: "هل يمكنني استخدام التصاميم لأغراض تجارية؟",
    answer:
      "نعم، جميع التصاميم تُسلّم بحق الاستخدام التجاري، ما لم يُذكر خلاف ذلك.",
    createdAt: new Date().toISOString(),
  },
];

const blogs = [
  {
    _id: "blog-1",
    title: "أهمية الهوية البصرية",
    excerpt: "لماذا تحتاج مشروعك لهوية قوية؟",
    content: `<h2>مقدمة عن الهوية البصرية</h2>
<p>الهوية البصرية هي أساس نجاح أي مشروع تجاري في العصر الحديث. إنها الوجه الذي يراه العملاء أولاً، والانطباع الذي يبقى في أذهانهم.</p>
<h3>لماذا الهوية البصرية مهمة؟</h3>
<ul>
  <li>بناء الثقة مع العملاء</li>
  <li>التميز عن المنافسين</li>
  <li>إنشاء ذاكرة بصرية قوية</li>
  <li>زيادة قيمة العلامة التجارية</li>
  </ul>
<h3>عناصر الهوية البصرية</h3>
<p>تتكون الهوية البصرية من عدة عناصر أساسية مثل الشعار، الألوان، الخطوط، والأسلوب البصري العام.</p>`,
    coverImage: "/placeholder.jpg",
    slug: "visual-identity",
    tags: ["هوية بصرية", "تصميم", "علامة تجارية"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "blog-2",
    title: "تصاميم السوشيال الفعالة",
    excerpt: "نصائح لصناعة محتوى بصري مؤثر",
    content: `<h2>كيفية إنشاء تصاميم سوشيال ميديا فعالة</h2>
<p>في عالم وسائل التواصل الاجتماعي، المحتوى البصري هو الملك. إليك أهم النصائح لإنشاء تصاميم تجذب الانتباه وتحقق التفاعل.</p>
<h3>القواعد الذهبية للتصميم</h3>
<ul>
  <li>استخدم ألوان متناسقة مع هوية العلامة التجارية</li>
  <li>اختر خطوط واضحة وسهلة القراءة</li>
  <li>حافظ على البساطة والوضوح</li>
  <li>استخدم صور عالية الجودة</li>
</ul>
<h3>أحجام المنصات المختلفة</h3>
<p>كل منصة لها متطلباتها الخاصة من حيث أحجام الصور والتصاميم. تأكد من تحسين تصاميمك لكل منصة.</p>`,
    coverImage: "/placeholder.jpg",
    slug: "effective-social",
    tags: ["سوشيال ميديا", "تصميم", "محتوى رقمي"],
    createdAt: new Date().toISOString(),
  },
];

const settings: Record<string, Array<{ key: string; value: any }>> = {
  about: [
    { key: "heroTitle", value: "نحن لا ننافس على الشكل، بل على الأثر" },
    { key: "heroSubtitle", value: "فريق إبداعي سعودي يصنع هوية بصمتك" },
    { key: "missionTitle", value: "رسالتنا" },
    { key: "missionDesc", value: "نصمم ونكتب ونبني لك حضورًا لا يُنسى" },
  ],
  footer: [
    { key: "brandText", value: "نصمم، نكتب، ونبني لك هوية تترك أثرًا" },
    { key: "email", value: "contact@basmadesign.com" },
    { key: "instagram", value: "#" },
    { key: "linkedin", value: "#" },
    { key: "quickLinks", value: [
      { label: 'من نحن', href: '/about' },
      { label: 'خدماتنا', href: '/services' },
      { label: 'طلب خدمة', href: '/order' },
      { label: 'تواصل معنا', href: '/contact' },
      { label: 'الأسئلة الشائعة', href: '/faq' },
      { label: 'السياسات والشروط', href: '/policies' },
    ] },
    { key: "servicesLinks", value: [
      { label: 'تصاميم السوشيال ميديا', href: '/services/social-media' },
      { label: 'تصاميم البنرات', href: '/services/banners' },
      { label: 'كتابة المحتوى', href: '/services/content-writing' },
      { label: 'السير الذاتية', href: '/services/resumes' },
      { label: 'الشعارات', href: '/services/logos' },
    ] },
    { key: "paypalBadgeText", value: "PayPal" },
    { key: "contactCtaText", value: "تواصل معنا" },
    { key: "contactCtaLink", value: "/contact" },
    { key: "copyright", value: "© بصمة تصميم 2025 - جميع الحقوق محفوظة" },
    { key: "refundNote", value: "جميع المدفوعات غير قابلة للاسترداد" },
  ],
  whatDifferent: [
    { key: "title", value: "ما يميزنا" },
    { key: "subtitle", value: "نقدم خدمات تصميم استثنائية تجمع بين الإبداع والاحترافية" },
    { key: "items", value: [
      { title: 'تصميم يحمل بصمتك', description: 'كل تصميم يُصنع ليعكس هويتك الفريدة ويميزك عن المنافسين', iconName: 'palette', iconColor: 'text-pink-600', bgGradient: 'from-pink-100 to-rose-100' },
      { title: 'شفافية و إحترافية', description: 'سياساتنا واضحة وتعاملنا مبني على الثقة والاحترافية المطلقة', iconName: 'shield', iconColor: 'text-emerald-600', bgGradient: 'from-emerald-100 to-teal-100' },
      { title: 'تسليم مدروس', description: 'نلتزم بالوقت المحدد ونضمن جودة عالية في كل مشروع', iconName: 'clock', iconColor: 'text-amber-600', bgGradient: 'from-amber-100 to-yellow-100' },
      { title: 'خدمة تُصمم لتُحدث فرقًا', description: 'تجربة إبداعية متكاملة تحول رؤيتك إلى واقع ملموس', iconName: 'sparkles', iconColor: 'text-indigo-600', bgGradient: 'from-indigo-100 to-violet-100' },
    ] },
  ],
  policies: [
    { key: "terms", value: "نص الشروط والأحكام الثابت." },
    { key: "refund", value: "سياسة عدم الاسترداد: جميع المدفوعات غير قابلة للاسترداد." },
    { key: "privacy", value: "سياسة الخصوصية: نحترم خصوصيتك ولا نشارك بياناتك." },
    { key: "delivery", value: "سياسة التسليم: حسب نوع الخدمة خلال 2-7 أيام." },
  ],
  foundational: [
    { key: "title", value: "في بصمة تصميم، نمنح مشروعك حضورًا لا يُنسى" },
    { key: "subtitle", value: "نصمم، نكتب، ونبني لك هوية تترك أثرًا في قلوب عملائك" },
    { key: "ctaPrimaryText", value: "تواصل معنا" },
    { key: "ctaPrimaryLink", value: "/contact" },
    { key: "ctaSecondaryText", value: "تعرف علينا أكثر" },
    { key: "ctaSecondaryLink", value: "/about" },
  ],
};

const heroSection = {
  title: { ar: "صمّم بصمتك الخاصة." },
  subtitle: { ar: "ابدأ رحلتك نحو هوية رقمية لا تُنسى." },
  description: { ar: "في بصمة تصميم، نحول أفكارك إلى تصاميم استثنائية" },
  ctaButton: { text: { ar: "تواصل معنا" }, link: "/contact", style: "primary" },
  backgroundImage: undefined,
  isActive: true,
};

// ----------------------
// Static API emulation - extend the main apiFetch function
// ----------------------

async function apiFetchStatic<T = any>(path: string, _options?: ApiOptions): Promise<T> {
  // Normalize path (strip query for routing decisions)
  const [cleanPath, queryString] = path.split("?");
  const params = new URLSearchParams(queryString || "");

  // Always try backend first - prioritize real API over static data
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    if (base) {
      const url = `${base}${path}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(typeof _options?.headers === 'object' ? (_options!.headers as Record<string, string>) : {}),
      };
      if ((_options as any)?.auth) {
        const token = getAdminToken() || getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(url, {
        ..._options,
        headers,
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const json = await res.json();
          
          // Handle different response formats from backend
          if (cleanPath === '/services') {
            // Backend returns {success: true, data: {services: [...], total: N}}
            if (json && json.data && Array.isArray(json.data.services)) {
              return json as T; // Return the full response structure
            }
          } else if (cleanPath === '/blogs') {
            // Backend returns {success: true, data: [...]}
            if (json && Array.isArray(json.data)) {
              return json.data as T;
            }
          } else if (cleanPath === '/faqs') {
            // Backend returns {success: true, data: [...]}
            if (json && Array.isArray(json.data)) {
              return json.data as T;
            }
          } else if (cleanPath?.startsWith('/services/')) {
            // Single service - backend returns {success: true, data: { service: {...} }}
            if (json && json.data) {
              const svc = (json as any)?.data?.service ?? (json as any)?.data;
              if (svc) return svc as T;
            }
          }
          
          return json as T;  
          // allow static fallback below
        } else {
          return (await res.text()) as any as T;
        }
      }
    }
  } catch (e) {
    if (typeof window !== 'undefined') {
    }
  }


  // Settings by category
  if (cleanPath === "/settings") {
    const category = params.get("category") || "";
    const arr = settings[category] || [];
    return arr as any as T;
  }

  // Services list (wrapped + mapped to expected shape)
  if (cleanPath === "/services") {
    const mapped = staticServices.map((s) => {
      const sar = (s as any).price?.SAR ?? (s as any).price?.amount ?? 0
      const usd = (s as any).price?.USD ?? Math.round((sar || 0) / 3.75)
      const originalSar = (s as any).originalPrice?.SAR ?? (s as any).price?.originalAmount
      const feat = (s as any).features
      const featAr = Array.isArray(feat)
        ? (feat as any[]).map((x) => String(x))
        : Array.isArray(feat?.ar)
          ? (feat.ar as any[]).map((x) => String(x))
          : []
      const featEn = Array.isArray(feat?.en) ? (feat.en as any[]).map((x) => String(x)) : []
      return {
        _id: (s as any)._id || (s as any).slug || String((s as any).order || ''),
        title: (s as any).title,
        description: (s as any).description,
        price: { SAR: sar, USD: usd },
        ...(originalSar ? { originalPrice: { SAR: originalSar, USD: Math.round(originalSar / 3.75) } } : {}),
        durationDays: (s as any).durationDays ?? (s as any).deliveryTime?.max ?? 0,
        category: (s as any).category || 'general',
        features: { ar: featAr, en: featEn },
        deliveryLinks: [],
        isActive: (s as any).isActive !== false,
        isFeatured: false,
        order: 0,
        createdAt: (s as any).createdAt || new Date().toISOString(),
      }
    })
    return { success: true, data: { services: mapped } } as any as T;
  }

  // Single service by id: /services/:id
  if (cleanPath?.startsWith("/services/")) {
    const id = cleanPath.split("/").pop() as string;
    const svc = staticServices.find(s => (s as any)._id === id || (s as any).slug === id) || null;
    if (!svc) throw new Error("الخدمة غير موجودة");
    return svc as any as T;
  }

  // FAQs (wrapped to expected shape)
  if (cleanPath === "/faqs") {
    const mapped = faqs.map((f: any) => ({
      _id: f._id,
      question: { ar: f.question, en: f.question },
      answer: { ar: f.answer, en: f.answer },
      createdAt: f.createdAt || new Date().toISOString(),
    }))
    return { success: true, data: { faqs: mapped } } as any as T;
  }

  // Blogs list
  if (cleanPath === "/blogs") {
    return blogs as any as T;
  }

  // Single blog by slug: /blogs/:slug
  if (cleanPath?.startsWith("/blogs/")) {
    const slug = cleanPath.split("/").pop() as string;
    const blog = blogs.find((b) => b.slug === slug) || null;
    if (!blog) throw new Error("المقال غير موجود");
    return blog as any as T;
  }

  // Homepage aggregated content
  if (cleanPath === "/homepage/content") {
    const data = {
      banners: [ { _id: "bn-1", content: "عروض خاصة هذا الأسبوع", image: null, position: "top" } ],
      services: (staticServices as any[]).slice(0, 3).map((s: any) => ({
        _id: s?._id || s?.slug || String(s?.order || ''),
        title: typeof s?.title === 'string' ? s?.title : s?.title?.ar || '',
        description: typeof s?.description === 'string' ? s?.description : s?.description?.ar || '',
        price: s?.price,
        category: s?.category,
        deliveryTime: s?.deliveryTime || (s?.durationDays ? { min: s.durationDays, max: s.durationDays } : undefined),
      })),
      portfolio: [],
      faqs: faqs,
      blogs: blogs,
    };
    return data as any as T;
  }

  // Hero section - removed static fallback to force API usage
  // if (cleanPath === "/hero-section") {
  //   return heroSection as any as T;
  // }

  // Contact, blog, etc. can be extended similarly if needed

  // Default: return empty/null to avoid crashes
  return null as any as T;
}

async function apiFetchFormStatic<T = any>(path: string, _options?: ApiOptions): Promise<T> {
  const [cleanPath] = path.split("?");
  // Network-first submit
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const url = `${base}${path}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(typeof _options?.headers === 'object' ? (_options!.headers as Record<string, string>) : {}),
      };
      if ((_options as any)?.auth) {
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(url, {
        method: (typeof _options?.method === 'string' ? _options!.method : 'POST'),
        body: (typeof (_options as any)?.body === 'string' ? (_options as any).body : JSON.stringify(((_options as any)?.body) || {})),
        headers,
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return (await res.json()) as T;
        }
        return (await res.text()) as any as T;
      }
    }
  } catch (e) {
    if (typeof window !== 'undefined') {
    }
  }
  // Local fallbacks for verification flow when no backend base URL is set
  if (typeof window !== 'undefined') {
    if (cleanPath === '/verify/send') {
      try {
        const body = typeof (_options as any)?.body === 'string' ? JSON.parse(((_options as any)?.body) || '{}') : (((_options as any)?.body) || {})
        const target = body?.target as string
        if (!target) return { success: false, message: 'بريد غير صالح' } as any as T
        const code = String(Math.floor(100000 + Math.random() * 900000))
        const expiresAt = Date.now() + 10 * 60 * 1000
        const payload = { target, code, expiresAt }
        localStorage.setItem('verification:last', JSON.stringify(payload))
        return { success: true, message: 'تم إرسال رمز التحقق (وضع محاكاة)', code } as any as T
      } catch {
        return { success: false, message: 'تعذر إرسال الرمز' } as any as T
      }
    }
    if (cleanPath === '/verify/check') {
      try {
        const body = typeof (_options as any)?.body === 'string' ? JSON.parse(((_options as any)?.body) || '{}') : (((_options as any)?.body) || {})
        const target = body?.target as string
        const code = String(body?.code || '')
        const raw = localStorage.getItem('verification:last')
        if (!raw) return { success: false, message: 'لا يوجد رمز تحقق' } as any as T
        const saved = JSON.parse(raw || '{}')
        if (!saved?.target || saved?.target !== target) return { success: false, message: 'هدف غير مطابق' } as any as T
        if (!saved?.code || String(saved.code) !== code) return { success: false, message: 'رمز غير صحيح' } as any as T
        if (!saved?.expiresAt || Date.now() > Number(saved.expiresAt)) return { success: false, message: 'انتهت صلاحية الرمز' } as any as T
        return { success: true, message: 'تم التحقق بنجاح' } as any as T
      } catch {
        return { success: false, message: 'تعذر التحقق' } as any as T
      }
    }
  }
  if (cleanPath === "/orders") {
    return { _id: "static-order-id", orderNumber: "ORD-0001" } as any as T;
  }
  return null as any as T;
}
// Update media metadata
export async function updateMedia(mediaId: string, updates: Partial<Media>): Promise<Media | null> {
  try {
    const response = await apiFetch<{ data: Media }>(`/admin/media/${mediaId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      auth: true
    });
    return response.data || null;
  } catch (error) {
    throw error;
  }
}

// Bulk delete media files
export async function bulkDeleteMedia(mediaIds: string[]): Promise<boolean> {
  try {
    await apiFetch('/admin/media/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ mediaIds }),
      auth: true
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Bulk update media (move to folder, add tags, etc.)
export async function bulkUpdateMedia(mediaIds: string[], updates: { folder?: string; tags?: string[] }): Promise<boolean> {
  try {
    await apiFetch('/admin/media/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ mediaIds, updates }),
      auth: true
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Get media usage across pages
export async function getMediaUsage(mediaId: string): Promise<{ usage: Array<{ collectionName: string; documentId: string; field: string }>; usageCount: number }> {
  try {
    const response = await apiFetch<{ data: { usage: Array<{ collectionName: string; documentId: string; field: string }>; usageCount: number } }>(`/admin/media/${mediaId}/usage`, { auth: true });
    return response.data || { usage: [], usageCount: 0 };
  } catch (error) {
    return { usage: [], usageCount: 0 };
  }
}

// Analyze media for optimization suggestions
export async function analyzeMediaOptimization(mediaId: string): Promise<{
  media: { id: string; filename: string; size: number; dimensions?: { width: number; height: number } };
  analysis: any;
  suggestions: Array<{ type: string; message: string; severity: string }>;
  recommendedPreset: string;
}> {
  try {
    const response = await apiFetch<{ data: any }>(`/admin/media/${mediaId}/analyze`, { auth: true });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Optimize existing media file
export async function optimizeMedia(mediaId: string, preset: string = 'medium'): Promise<{ media: Media; variants: any }> {
  try {
    const response = await apiFetch<{ data: { media: Media; variants: any } }>(`/admin/media/${mediaId}/optimize`, {
      method: 'POST',
      body: JSON.stringify({ preset }),
      auth: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}