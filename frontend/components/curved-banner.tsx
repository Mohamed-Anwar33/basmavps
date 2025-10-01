'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface CurvedBanner {
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
  gradientColors?: {
    start: string;
    middle: string;
    end: string;
  };
  textColor?: string;
  curveIntensity?: 'light' | 'medium' | 'strong';
}

interface CurvedBannerProps {
  position: 'top' | 'middle' | 'bottom';
  pageSlug?: string;
  className?: string;
  curveIntensity?: 'light' | 'medium' | 'strong';
}

export default function CurvedBanner({ 
  position, 
  pageSlug = 'home', 
  className = '',
  curveIntensity = 'medium'
}: CurvedBannerProps) {
  const [banner, setBanner] = useState<CurvedBanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBanner();
  }, [position, pageSlug]);

  const fetchBanner = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api`}/banners?position=${position}&pageSlug=${pageSlug}&isActive=true`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          setBanner(result.data[0]);
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

  // Default gradient colors (purple theme)
  const defaultGradient = {
    start: '#8453F7',
    middle: '#4b2e83',
    end: '#7a4db3'
  };

  const gradientColors = banner.gradientColors || defaultGradient;
  
  // Curve intensity settings
  const curveSettings = {
    light: { top: '20px', bottom: '20px' },
    medium: { top: '40px', bottom: '40px' },
    strong: { top: '60px', bottom: '60px' }
  };

  const curves = curveSettings[banner.curveIntensity || curveIntensity];

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'primary':
        return 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg';
      case 'secondary':
        return 'bg-purple-600/20 text-white border-2 border-white/30 hover:bg-purple-600/30 backdrop-blur-sm';
      case 'outline':
        return 'border-2 border-white text-white hover:bg-white hover:text-purple-600';
      default:
        return 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg';
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Curved Background with Gradient */}
      <div 
        className="relative"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.middle} 50%, ${gradientColors.end} 100%)`,
          clipPath: `polygon(
            0 ${curves.top}, 
            100% 0, 
            100% calc(100% - ${curves.bottom}), 
            0 100%
          )`
        }}
      >
        {/* Background Image Overlay */}
        {banner.image && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${banner.image.url})` }}
          />
        )}
        
        {/* Decorative Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='10' r='1'/%3E%3Ccircle cx='10' cy='50' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-16 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-10 left-16 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s', animationDuration: '6s' }} />
        </div>
        
        {/* Content */}
        <div 
          className="relative z-10 py-3 px-4 text-center text-white"
          style={{
            color: banner.textColor || '#ffffff'
          }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Banner Content */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight arabic-text">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                {banner.content}
              </span>
            </h2>
            
            {/* Banner Subtitle */}
            {banner.subtitle && (
              <h3 className="text-lg md:text-xl mb-2 opacity-90 arabic-text">
                {banner.subtitle}
              </h3>
            )}
            
            {/* Banner Description */}
            {banner.description && (
              <p className="text-base md:text-lg mb-3 opacity-80 max-w-lg mx-auto leading-relaxed arabic-text">
                {banner.description}
              </p>
            )}
            
            {/* CTA Button */}
            {banner.ctaButton && (
              <div className="mt-3">
                <a
                  href={banner.ctaButton.link}
                  className={`inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${getButtonStyle(banner.ctaButton.style)} arabic-text`}
                >
                  {banner.ctaButton.text}
                  <ArrowLeft className="w-7 h-7 rtl-flip" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Additional Curved Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top curve highlight */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            clipPath: `polygon(0 0, 100% ${curves.top}, 100% calc(${curves.top} + 2px), 0 2px)`
          }}
        />
        
        {/* Bottom curve highlight */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            clipPath: `polygon(0 calc(100% - 2px), 100% calc(100% - ${curves.bottom} - 2px), 100% calc(100% - ${curves.bottom}), 0 100%)`
          }}
        />
      </div>
    </div>
  );
}
