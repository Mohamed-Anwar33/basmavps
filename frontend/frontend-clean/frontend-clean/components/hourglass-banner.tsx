'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface HourglassBanner {
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
  curveDepth?: number;
}

interface HourglassBannerProps {
  position: 'top' | 'middle' | 'bottom';
  pageSlug?: string;
  className?: string;
  curveDepth?: number;
}

export default function HourglassBanner({ 
  position, 
  pageSlug = 'home', 
  className = '',
  curveDepth = 60
}: HourglassBannerProps) {
  const [banner, setBanner] = useState<HourglassBanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Default gradient colors (dark to light purple)
  const defaultGradient = {
    start: '#2D1B69',    // Dark purple
    middle: '#5B21B6',   // Medium purple
    end: '#A855F7'       // Light purple
  };

  const gradientColors = banner.gradientColors || defaultGradient;
  const depth = banner.curveDepth || curveDepth;

  // Create oval elements for curves - only affect center, not edges
  const getOvalHeight = () => {
    return depth * 2; // Moderate curve size
  };
  
  const getOvalWidth = () => {
    return '60%'; // Narrower curves to keep edges straight
  };

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'primary':
        return 'bg-white text-purple-700 hover:bg-gray-100 shadow-xl hover:shadow-2xl font-bold';
      case 'secondary':
        return 'bg-white/20 text-white border-2 border-white/40 hover:bg-white/30 backdrop-blur-sm font-semibold';
      case 'outline':
        return 'border-2 border-white text-white hover:bg-white hover:text-purple-700 font-semibold';
      default:
        return 'bg-white text-purple-700 hover:bg-gray-100 shadow-xl hover:shadow-2xl font-bold';
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Top Oval Element - Creates curve from above with section background color */}
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-100"
        style={{
          width: getOvalWidth(),
          height: `${getOvalHeight()}px`,
          background: 'rgb(248, 250, 252)', // Light gray background to match typical section backgrounds
          borderRadius: '50%',
          zIndex: 3
        }}
      />
      
      {/* Main Banner Container - With Serrated/Jagged Edges */}
      <div 
        className="relative w-full min-h-[120px] md:min-h-[150px] lg:min-h-[180px]"
        style={{
          background: `linear-gradient(180deg, ${gradientColors.start} 0%, ${gradientColors.middle} 50%, ${gradientColors.end} 100%)`,
          clipPath: `polygon(
            0% 0%, 
            5% 10%, 
            10% 0%, 
            15% 10%, 
            20% 0%, 
            25% 10%, 
            30% 0%, 
            35% 10%, 
            40% 0%, 
            45% 10%, 
            50% 0%, 
            55% 10%, 
            60% 0%, 
            65% 10%, 
            70% 0%, 
            75% 10%, 
            80% 0%, 
            85% 10%, 
            90% 0%, 
            95% 10%, 
            100% 0%, 
            100% 100%, 
            95% 90%, 
            90% 100%, 
            85% 90%, 
            80% 100%, 
            75% 90%, 
            70% 100%, 
            65% 90%, 
            60% 100%, 
            55% 90%, 
            50% 100%, 
            45% 90%, 
            40% 100%, 
            35% 90%, 
            30% 100%, 
            25% 90%, 
            20% 100%, 
            15% 90%, 
            10% 100%, 
            5% 90%, 
            0% 100%
          )`,
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
        
        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-12 right-16 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-12 left-16 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s', animationDuration: '6s' }} />
        </div>
        
        {/* Content Container - Centered */}
        <div 
          className="relative z-10 h-full flex items-center justify-center px-4 py-3 text-center"
          style={{
            color: banner.textColor || '#ffffff'
          }}
        >
          <div className="max-w-2xl mx-auto space-y-2">
            {/* Main Title */}
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight arabic-text">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent drop-shadow-2xl">
                {banner.content}
              </span>
            </h2>
            
            {/* Subtitle */}
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
              <div className="pt-4">
                <a
                  href={banner.ctaButton.link}
                  className={`inline-flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 rounded-2xl text-base md:text-lg transition-all duration-300 transform hover:scale-105 ${getButtonStyle(banner.ctaButton.style)} arabic-text`}
                >
                  <span>{banner.ctaButton.text}</span>
                  <ArrowLeft className="w-8 h-8 rtl-flip" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bottom Oval Element - Creates curve from below with section background color */}
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 opacity-100"
        style={{
          width: getOvalWidth(),
          height: `${getOvalHeight()}px`,
          background: 'rgb(248, 250, 252)', // Light gray background to match typical section backgrounds
          borderRadius: '50%',
          zIndex: 3
        }}
      />
    </div>
  );
}
