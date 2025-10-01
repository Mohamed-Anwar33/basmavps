'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Banner {
  _id: string;
  content: string;
  subtitle?: string;
  description?: string;
  image?: {
    url: string;
    alt: string;
  };
  position: 'top' | 'middle' | 'bottom';
  isActive: boolean;
  ctaButton?: {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline';
  };
  backgroundColor?: string;
  textColor?: string;
}

interface BannerProps {
  position: 'top' | 'middle' | 'bottom';
  pageSlug?: string;
  className?: string;
}

export default function Banner({ position, pageSlug, className }: BannerProps) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to get static banner images
  const getBannerImage = (pos?: string, slug?: string): string => {
    const imageMap: { [key: string]: string } = {
      'home-top': '/ايقونات البنرات/growth.png',
      'home-middle': '/ايقونات البنرات/ui-ux-designer.png', 
      'home-bottom': '/ايقونات البنرات/illustration.png',
      'services-top': '/ايقونات البنرات/ui-ux-designer.png',
      'about-top': '/ايقونات البنرات/illustration (1).png',
      'blog-top': '/ايقونات البنرات/illustration.png',
      'contact-top': '/ايقونات البنرات/growth.png',
    }
    
    const key = `${slug || pageSlug || 'home'}-${pos || position || 'top'}`
    return imageMap[key] || '/ايقونات البنرات/growth.png'
  }

  const getString = (value: any): string => {
    if (typeof value === 'string') return value
    if (value?.ar) return value.ar
    if (value?.en) return value.en
    return ''
  }

  useEffect(() => {
    fetchBanner();
  }, [position, pageSlug]);

  const fetchBanner = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/banners?position=${position}&pageSlug=${pageSlug}&isActive=true`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          const bannerData = result.data[0];
          
          // Transform the data to match component expectations
          const transformedBanner = {
            _id: bannerData._id,
            content: getString(bannerData.title),
            subtitle: getString(bannerData.subtitle),
            description: getString(bannerData.description),
            image: typeof bannerData.image === 'object' ? bannerData.image?.url : bannerData.image,
            position: bannerData.position,
            isActive: bannerData.isActive,
            ctaButton: bannerData.ctaButton ? {
              text: getString(bannerData.ctaButton.text),
              link: bannerData.ctaButton.link || '',
              style: bannerData.ctaButton.style || 'primary'
            } : undefined,
            backgroundColor: bannerData.backgroundColor,
            textColor: bannerData.textColor
          };
          
          setBanner(transformedBanner);
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !banner) {
    return null;
  }

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white';
      case 'secondary':
        return 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50';
      case 'outline':
        return 'border-2 border-white text-white hover:bg-white hover:text-blue-600';
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white';
    }
  };

  return (
    <div className={`relative overflow-hidden banner-hover-effect ${className}`}>
      {/* Background with Advanced Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#4b2e83] via-[#7a4db3] to-[#4b2e83] animate-gradient-shift">
        {/* Advanced Background Pattern with Animation */}
        <div className="absolute inset-0 opacity-15 animate-morph">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Enhanced noise layer for texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay animate-wave-1"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E')",
            backgroundSize: '120px 120px',
          }}
        />

        {/* Advanced Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-6 right-12 w-20 h-20 bg-gradient-to-br from-white/10 to-white/3 rounded-full blur-2xl animate-float-slow shadow-xl" />
          <div className="absolute bottom-6 left-12 w-16 h-16 bg-gradient-to-br from-white/8 to-white/2 rounded-full blur-xl animate-float-medium shadow-lg" />
          <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-gradient-to-br from-white/6 to-white/1 rounded-full blur-lg animate-float-fast shadow-md" />
          
          
          {/* Animated Particles */}
          <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-particle-1" />
          <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-white/25 rounded-full animate-particle-2" />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-particle-3" />
        </div>

        {/* Enhanced Geometric Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 right-24 w-4 h-4 border border-white/12 rotate-45 animate-spin-slow animate-pulse-glow" />
          <div className="absolute bottom-8 left-24 w-3 h-3 border border-white/10 -rotate-12 animate-spin-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Sparkle Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-12 right-28 w-1 h-1 bg-white animate-sparkle-1 rounded-full" />
          <div className="absolute bottom-12 left-28 w-1 h-1 bg-white animate-sparkle-2 rounded-full" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 py-3 px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Banner Image - Static Images with Animated Logo */}
          <div className="mb-3 flex justify-center items-center gap-4">
            <img 
              src={getBannerImage(position, pageSlug)}
              alt={banner.content}
              className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            
          </div>

          {/* Banner Content */}
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 leading-tight">
            {banner.content}
          </h2>
          
          {/* Banner Subtitle */}
          {banner.subtitle && (
            <h3 className="text-base md:text-lg mb-2 opacity-90">
              {banner.subtitle}
            </h3>
          )}

          {/* Banner Description */}
          {banner.description && (
            <p className="text-sm md:text-base mb-3 opacity-80 max-w-xl mx-auto">
              {banner.description}
            </p>
          )}
          
          {/* CTA Button */}
          {banner.ctaButton && (
            <div className="mt-4">
              <a
                href={banner.ctaButton.link}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${getButtonStyle(banner.ctaButton.style)}`}
              >
                {banner.ctaButton.text}
                <ArrowLeft className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-500/20 to-pink-500/20 rounded-full translate-x-12 translate-y-12"></div>
    </div>
  );
}
