'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Heart, Star } from 'lucide-react';

interface PortfolioImage {
  _id: string;
  url: string;
  alt: string;
  order: number;
}

interface PortfolioGalleryProps {
  images: PortfolioImage[];
  title: string;
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ images, title }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Sort images by order
  const sortedImages = images.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Lazy loading setup
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
      { threshold: 0.1, rootMargin: '100px' }
    );
  }, []);

  useEffect(() => {
    setupLazyLoading();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupLazyLoading]);

  useEffect(() => {
    if (sortedImages.length > 0) {
      const imageElements = document.querySelectorAll('[data-portfolio-image]');
      imageElements.forEach(el => {
        if (observerRef.current) {
          observerRef.current.observe(el);
        }
      });
    }
  }, [sortedImages]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = sortedImages.findIndex(img => img.url === selectedImage);

      switch (e.key) {
        case 'Escape':
          setSelectedImage(null);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex = currentIndex === 0 ? sortedImages.length - 1 : currentIndex - 1;
          setSelectedImage(sortedImages[prevIndex].url);
          break;
        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = currentIndex === sortedImages.length - 1 ? 0 : currentIndex + 1;
          setSelectedImage(sortedImages[nextIndex].url);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, sortedImages]);

  const goToPrevious = () => {
    const currentIndex = sortedImages.findIndex(img => img.url === selectedImage);
    const prevIndex = currentIndex === 0 ? sortedImages.length - 1 : currentIndex - 1;
    setSelectedImage(sortedImages[prevIndex].url);
  };

  const goToNext = () => {
    const currentIndex = sortedImages.findIndex(img => img.url === selectedImage);
    const nextIndex = currentIndex === sortedImages.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(sortedImages[nextIndex].url);
  };

  if (sortedImages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Portfolio Gallery */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white arabic-text mb-6 bg-[#4B2E83] px-6 py-3 rounded-lg inline-block">
          نماذج من أعمالنا
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedImages.map((imageObj, index) => {
            const isLoaded = loadedImages.has(imageObj._id);
            const isHovered = hoveredImage === imageObj._id;
            
            return (
              <div 
                key={imageObj._id}
                data-portfolio-image
                data-image-id={imageObj._id}
                className={`
                  group relative overflow-hidden rounded-xl bg-white border border-gray-200 
                  transition-all duration-500 cursor-pointer transform hover:scale-105
                  ${isHovered ? 'shadow-2xl border-purple-300 ring-4 ring-purple-200/50' : 'hover:shadow-lg hover:border-[#4b2e83]/30'}
                `}
                onClick={() => setSelectedImage(imageObj.url)}
                onMouseEnter={() => setHoveredImage(imageObj._id)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                <div className="aspect-square relative overflow-hidden">
                  {/* Loading placeholder with shimmer */}
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                    </div>
                  )}
                  
                  {/* Actual image */}
                  <img 
                    src={imageObj.url}
                    alt={imageObj.alt || `نموذج ${index + 1} من ${title}`}
                    className={`
                      w-full h-full object-contain transition-all duration-500 transform
                      ${isLoaded ? 'opacity-100' : 'opacity-0'}
                      ${isHovered ? 'scale-110' : 'scale-100'}
                    `}
                    onLoad={() => setLoadedImages(prev => new Set([...prev, imageObj._id]))}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  
                  {/* Gradient overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent
                    transition-all duration-300
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                  `} />
                  
                  {/* Hover effects */}
                  <div className={`
                    absolute inset-0 flex items-center justify-center
                    transition-all duration-300 transform
                    ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                  `}>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Floating particles on hover */}
                  {isHovered && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white/80 rounded-full animate-ping"
                          style={{
                            left: `${10 + i * 12}%`,
                            top: `${15 + (i % 3) * 25}%`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: '2s'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Image info overlay */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 p-4 text-white
                    transition-all duration-300 transform
                    ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
                  `}>
                    <p className="font-medium arabic-text text-center mb-2">
                      {imageObj.alt || `نموذج ${index + 1}`}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="arabic-text">اضغط للتكبير</span>
                      <div className="flex gap-1">
                        <Heart className="w-4 h-4 text-red-400" />
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order indicator */}
                <div className={`
                  absolute top-3 right-3 bg-gradient-to-r from-[#4b2e83] to-purple-600
                  text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg
                  transition-all duration-300 transform
                  ${isHovered ? 'scale-110 rotate-3' : 'scale-100'}
                `}>
                  {index + 1}
                </div>

                {/* Shimmer effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                  transition-all duration-300 transform -translate-x-full
                  ${isHovered ? 'translate-x-full' : '-translate-x-full'}
                `} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 z-60 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation buttons */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-60 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
                aria-label="الصورة السابقة"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-60 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
                aria-label="الصورة التالية"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image container */}
          <div className="relative max-w-7xl max-h-[90vh] mx-auto p-6">
            <img
              src={selectedImage}
              alt="معاينة الصورة"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{ maxHeight: 'calc(90vh - 3rem)' }}
            />
            
            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <div className="text-center text-white">
                <p className="text-lg font-medium arabic-text mb-2">
                  {sortedImages.find(img => img.url === selectedImage)?.alt || 'نموذج من أعمالنا'}
                </p>
                <p className="text-sm text-gray-300 arabic-text">
                  الصورة {sortedImages.findIndex(img => img.url === selectedImage) + 1} من {sortedImages.length}
                </p>
              </div>
            </div>
          </div>

          {/* Image indicators */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {sortedImages.map((img, index) => (
                <button
                  key={img._id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-200
                    ${img.url === selectedImage 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                    }
                  `}
                  aria-label={`الصورة ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
};

export default PortfolioGallery;