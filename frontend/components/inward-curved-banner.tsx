'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface InwardCurvedBanner {
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

interface InwardCurvedBannerProps {
  position: 'top' | 'middle' | 'bottom';
  pageSlug?: string;
  className?: string;
  curveIntensity?: 'light' | 'medium' | 'strong';
}

export default function InwardCurvedBanner({ 
  position, 
  pageSlug = 'home', 
  className = '',
  curveIntensity = 'medium'
}: InwardCurvedBannerProps) {
  const [banner, setBanner] = useState<InwardCurvedBanner | null>(null);
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
    start: '#2D1B69',
    middle: '#8453F7',
    end: '#C4A4FF'
  };

  const gradientColors = banner.gradientColors || defaultGradient;
  
  // Curve intensity settings for inward curves
  const curveSettings = {
    light: { depth: 30, width: 80 },
    medium: { depth: 50, width: 70 },
    strong: { depth: 70, width: 60 }
  };

  const curves = curveSettings[banner.curveIntensity || curveIntensity];

  // Create SVG path for inward curves (butterfly/hourglass shape)
  const createInwardCurvePath = () => {
    const { depth, width } = curves;
    const centerX = 50; // Center of the banner (50%)
    const curveWidth = width / 2; // Half width for each side
    
    // Create path with inward curves on top and bottom
    return `
      M 0,${depth} 
      Q ${centerX - curveWidth},0 ${centerX},${depth}
      Q ${centerX + curveWidth},0 100,${depth}
      L 100,${100 - depth}
      Q ${centerX + curveWidth},100 ${centerX},${100 - depth}
      Q ${centerX - curveWidth},100 0,${100 - depth}
      Z
    `;
  };

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'primary':
        return 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-purple-600/20 text-white border-2 border-white/30 hover:bg-purple-600/30 backdrop-blur-sm';
      case 'outline':
        return 'border-2 border-white text-white hover:bg-white hover:text-purple-600';
      default:
        return 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl';
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ minHeight: '300px' }}>
      {/* SVG Clip Path Definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id={`inward-curve-${position}`} clipPathUnits="objectBoundingBox">
            <path d={createInwardCurvePath()} transform="scale(0.01, 0.01)" />
          </clipPath>
        </defs>
      </svg>

      {/* Main Banner Container with Inward Curves */}
      <div 
        className="relative w-full h-full min-h-[200px]"
        style={{
          background: `linear-gradient(180deg, ${gradientColors.start} 0%, ${gradientColors.middle} 50%, ${gradientColors.end} 100%)`,
          clipPath: `url(#inward-curve-${position})`
        }}
      >
        {/* Background Image Overlay */}
        {banner.image && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ 
              backgroundImage: `url(${banner.image.url})`,
              clipPath: `url(#inward-curve-${position})`
            }}
          />
        )}
        
        {/* Decorative Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3Ccircle cx='45' cy='15' r='1'/%3E%3Ccircle cx='15' cy='45' r='1'/%3E%3Ccircle cx='45' cy='45' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
            clipPath: `url(#inward-curve-${position})`
          }}
        />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-16 right-20 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-16 left-20 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s', animationDuration: '6s' }} />
        </div>
        
        {/* Content */}
        <div 
          className="relative z-10 py-8 px-4 text-center text-white h-full flex items-center justify-center"
          style={{
            color: banner.textColor || '#ffffff'
          }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Banner Content */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight arabic-text">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent drop-shadow-lg">
                {banner.content}
              </span>
            </h2>
            
            {/* Banner Subtitle */}
            {banner.subtitle && (
              <h3 className="text-lg md:text-xl mb-4 opacity-90 arabic-text drop-shadow-md">
                {banner.subtitle}
              </h3>
            )}
            
            {/* Banner Description */}
            {banner.description && (
              <p className="text-base md:text-lg mb-6 opacity-80 max-w-2xl mx-auto leading-relaxed arabic-text drop-shadow-sm">
                {banner.description}
              </p>
            )}
            
            {/* CTA Button */}
            {banner.ctaButton && (
              <div className="mt-6">
                <a
                  href={banner.ctaButton.link}
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${getButtonStyle(banner.ctaButton.style)} arabic-text`}
                >
                  {banner.ctaButton.text}
                  <ArrowLeft className="w-5 h-5 rtl-flip" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Subtle Border Highlights for Curves */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 2%, transparent 4%, transparent 96%, rgba(255,255,255,0.1) 98%, transparent 100%)`,
          clipPath: `url(#inward-curve-${position})`
        }}
      />
    </div>
  );
}
