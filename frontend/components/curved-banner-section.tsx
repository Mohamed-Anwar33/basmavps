'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface CurvedBannerSection {
  _id: string;
  content: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  image?: {
    url: string;
    alt?: string;
  };
  ctaButton?: {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline';
  };
  textColor?: string;
  gradientColors?: {
    start: string;
    middle: string;
    end: string;
  };
  curveDepth?: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CurvedBannerSectionProps {
  position: 'top' | 'middle' | 'bottom';
  pageSlug?: string;
  className?: string;
  curveDepth?: number;
  topSectionColor?: string;
  bottomSectionColor?: string;
}

export default function CurvedBannerSection({ 
  position, 
  pageSlug = 'home', 
  className = '',
  curveDepth = 80,
  topSectionColor = 'rgb(248, 250, 252)',
  bottomSectionColor = 'rgb(248, 250, 252)'
}: CurvedBannerSectionProps) {
  const [banner, setBanner] = useState<CurvedBannerSection | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to get static banner image based on position and page
  const getStaticBannerImage = (pos: string, slug: string): string => {
    const imageMap: { [key: string]: string } = {
      'home-top': '/ايقونات البنرات/growth.png',
      'home-middle': '/ايقونات البنرات/ui-ux-designer.png', 
      'home-bottom': '/ايقونات البنرات/illustration.png',
      'services-top': '/ايقونات البنرات/ui-ux-designer.png',
      'about-top': '/ايقونات البنرات/illustration (1).png',
      'blog-top': '/ايقونات البنرات/illustration.png',
      'contact-top': '/ايقونات البنرات/growth.png',
    }
    
    const key = `${slug}-${pos}`
    return imageMap[key] || '/ايقونات البنرات/growth.png'
  }

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api`;
        const response = await fetch(`${baseUrl}/banners?position=${position}&pageSlug=${pageSlug || 'home'}&isActive=true`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          const bannerData = data.data[0];
          const getStr = (v: any) => typeof v === 'string' ? v : (v?.ar || v?.en || '');
          
          const mapped: CurvedBannerSection = {
            _id: bannerData._id,
            content: getStr(bannerData.title) || getStr(bannerData.content) || '—',
            subtitle: getStr(bannerData.subtitle) || undefined,
            description: getStr(bannerData.description) || undefined,
            icon: bannerData.image?.url || undefined,
            image: bannerData.image || undefined,
            ctaButton: bannerData.ctaButton ? {
              text: getStr(bannerData.ctaButton.text) || bannerData.ctaButton.text,
              link: bannerData.ctaButton.link,
              style: bannerData.ctaButton.style
            } : undefined,
            textColor: bannerData.textColor || undefined,
            gradientColors: bannerData.gradientColors || undefined,
            curveDepth: bannerData.curveIntensity === 'light' ? 40 : bannerData.curveIntensity === 'strong' ? 120 : 80,
            isActive: bannerData.isActive ?? true,
            order: bannerData.order ?? 1,
            createdAt: bannerData.createdAt || new Date().toISOString(),
            updatedAt: bannerData.updatedAt || new Date().toISOString(),
          };
          
          setBanner(mapped);
        } else {
          // Default banner if none found
          setBanner({
            _id: 'default',
            content: 'مرحباً بكم في بصمة تصميم',
            subtitle: 'نحن نقدم أفضل الخدمات في التصميم والتطوير',
            description: 'اكتشف عالم التصميم الإبداعي معنا',
            icon: getStaticBannerImage(position, pageSlug),
            isActive: true,
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        // Default banner on error
        setBanner({
          _id: 'default',
          content: 'مرحباً بكم في بصمة تصميم',
          subtitle: 'نحن نقدم أفضل الخدمات في التصميم والتطوير',
          description: 'اكتشف عالم التصميم الإبداعي معنا',
          icon: getStaticBannerImage(position, pageSlug),
          isActive: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [position, pageSlug]);

  if (loading || !banner) {
    return null;
  }

  // Default gradient colors (dark to light purple)
  const defaultGradient = {
    start: '#2D1B69',    // Dark purple
    middle: '#5B21B6',   // Medium purple
    end: '#A855F7'       // Light purple
  };

  const gradientColors = banner.gradientColors || defaultGradient;
  const depth = banner.curveDepth || curveDepth;

  // Add visual offset for top banner to appear after other sections without changing its own size
  // Use viewport-based offset so it clearly isn't the first section
  const containerOffset = position === 'top' ? '5vh' : undefined;

  // Create oval elements that create inward curves
  const getCurveHeight = () => {
    return (depth || 80) * 1.5; // Increase curve height by 50%
  };

  const getCurveWidth = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768 ? '85%' : '95%'; // Wider curves for more pronounced effect
    }
    return '85%';
  };

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-700 to-purple-900 text-white hover:from-purple-600 hover:to-purple-800 shadow-xl hover:shadow-2xl font-extrabold border-2 border-purple-600/50 !text-white';
      case 'secondary':
        return 'bg-gradient-to-r from-purple-800/80 to-purple-900/80 text-white border-2 border-purple-600/60 hover:from-purple-700/90 hover:to-purple-800/90 backdrop-blur-sm font-bold !text-white';
      case 'outline':
        return 'border-2 border-purple-400 text-white hover:bg-gradient-to-r hover:from-purple-700 hover:to-purple-900 hover:text-white font-bold !text-white';
      default:
        return 'bg-gradient-to-r from-purple-700 to-purple-900 text-white hover:from-purple-600 hover:to-purple-800 shadow-xl hover:shadow-2xl font-extrabold border-2 border-purple-600/50 !text-white';
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ marginTop: containerOffset }}>
      {/* Top Oval Element - Creates inward curve from above */}
      <div 
        className="absolute"
        style={{
          top: `-${getCurveHeight() * 0.7}px`, // Hide most of the oval
          left: '0px', 
          right: '0px', 
          width: 'calc(100%)', 
          height: `${getCurveHeight() * 1.5}px`, // Make it taller for deeper curve
          background: topSectionColor,
          borderRadius: '50%',
          zIndex: 3
        }}
      />
      
      {/* Main Banner Container - Rectangle with Purple Gradient */}
      <div 
        className="relative w-full min-h-[120px] md:min-h-[150px] lg:min-h-[180px]"
        style={{
          background: `linear-gradient(180deg, ${gradientColors.start} 0%, ${gradientColors.middle} 50%, ${gradientColors.end} 100%)`,
          zIndex: 1
        }}
      >
        {/* Background Image Overlay */}
        {banner.image && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
            style={{ 
              backgroundImage: `url(${banner.image.url})`
            }}
          />
        )}
        
        {/* Decorative Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.6'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='10' cy='10' r='0.5'/%3E%3Ccircle cx='30' cy='10' r='0.5'/%3E%3Ccircle cx='10' cy='30' r='0.5'/%3E%3Ccircle cx='30' cy='30' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Advanced Floating Particles & Animated Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Orbs with Complex Animation */}
          <div className="absolute top-16 right-20 w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-2xl animate-float-slow shadow-2xl" />
          <div className="absolute bottom-16 left-20 w-20 h-20 bg-gradient-to-br from-white/15 to-white/3 rounded-full blur-xl animate-float-medium shadow-xl" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-white/10 to-white/2 rounded-full blur-lg animate-float-fast shadow-lg" />
          
          {/* Animated Particles */}
          <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-white/30 rounded-full animate-particle-1" />
          <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-white/25 rounded-full animate-particle-2" />
          <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-particle-3" />
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white/35 rounded-full animate-particle-4" />
          
          {/* Geometric Shapes */}
          <div className="absolute top-20 left-16 w-8 h-8 border-2 border-white/15 rotate-45 animate-spin-slow" />
          <div className="absolute bottom-20 right-16 w-6 h-6 border border-white/20 animate-pulse-glow" />
          <div className="absolute top-1/3 right-1/2 w-10 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide-horizontal" />
          
          {/* Animated Waves */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-wave-1" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-transparent via-white/3 to-transparent animate-wave-2" />
          </div>
          
          {/* Sparkle Effects */}
          <div className="absolute top-12 right-32 w-1 h-1 bg-white animate-sparkle-1" />
          <div className="absolute bottom-12 left-32 w-1 h-1 bg-white animate-sparkle-2" />
          <div className="absolute top-2/3 right-2/3 w-1 h-1 bg-white animate-sparkle-3" />
        </div>
        
        {/* Content Container - Centered and Safe from Curves */}
        <div 
          className="relative z-10 h-full flex items-center justify-center px-4 py-4 text-center"
          style={{
            color: banner.textColor || '#ffffff',
            paddingTop: `${getCurveHeight() + 2}px`, // Minimal 2px margin from top curve
            paddingBottom: `${getCurveHeight() + 2}px` // Minimal 2px margin from bottom curve
          }}
        >
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Banner Icon/Image - Static Image */}
            <div className="mb-2 flex justify-center">
              <img 
                src={getStaticBannerImage(position, pageSlug)}
                alt={banner?.content || 'Banner'}
                className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Banner Title */}
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight arabic-text">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent drop-shadow-2xl">
                {banner.content}
              </span>
            </h2>
            
            {/* Banner Subtitle */}
            {banner.subtitle && (
              <h3 className="text-lg md:text-xl lg:text-2xl opacity-95 arabic-text drop-shadow-lg font-medium">
                {banner.subtitle}
              </h3>
            )}
            
            {/* Description */}
            {banner.description && (
              <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-lg mx-auto leading-relaxed arabic-text drop-shadow-md">
                {banner.description}
              </p>
            )}
            
            {/* CTA Button */}
            {banner.ctaButton && (
              <div className="pt-6">
                <a
                  href={banner.ctaButton.link}
                  className={`inline-flex items-center gap-4 px-10 md:px-12 py-5 md:py-6 rounded-lg text-xl md:text-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${getButtonStyle(banner.ctaButton.style)} arabic-text`}
                >
                  <span className="text-white font-bold">{banner.ctaButton.text}</span>
                  <ArrowLeft className="w-8 h-8 rtl-flip" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Oval Element - Creates inward curve from below */}
      <div 
        className="absolute"
        style={{
          bottom: `-${getCurveHeight() * 0.7}px`, // Hide most of the oval
          left: '0px', 
          right: '0px', 
          width: 'calc(100%)', 
          height: `${getCurveHeight() * 1.5}px`, // Make it taller for deeper curve
          background: bottomSectionColor,
          borderRadius: '50%',
          zIndex: 3
        }}
      />
      
      {/* Subtle Glow Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, 
            rgba(255,255,255,0.1) 0%, 
            transparent 10%, 
            transparent 90%, 
            rgba(255,255,255,0.1) 100%
          )`,
          zIndex: 2
        }}
      />
    </div>
  );
}
