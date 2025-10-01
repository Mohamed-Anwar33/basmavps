"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AnimatedLogoProps {
  variant?: 'float' | 'pulse' | 'rotate' | 'scale' | 'bounce' | 'fade' | 'slide'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  duration?: number
  delay?: number
  className?: string
  triggerOnScroll?: boolean
}

export function AnimatedLogo({ 
  variant = 'float',
  size = 'md',
  duration = 3,
  delay = 0,
  className,
  triggerOnScroll = true
}: AnimatedLogoProps) {
  const [isVisible, setIsVisible] = useState(!triggerOnScroll)
  const [isAnimating, setIsAnimating] = useState(false)

  // Size configurations
  const sizeConfig = {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 160, height: 160 },
    xl: { width: 200, height: 200 }
  }

  // Animation styles
  const getAnimationClass = () => {
    switch (variant) {
      case 'float':
        return 'animate-float'
      case 'pulse':
        return 'animate-pulse-custom'
      case 'rotate':
        return 'animate-rotate-custom'
      case 'scale':
        return 'animate-scale-custom'
      case 'bounce':
        return 'animate-bounce-custom'
      case 'fade':
        return 'animate-fade-custom'
      case 'slide':
        return 'animate-slide-custom'
      default:
        return 'animate-float'
    }
  }

  useEffect(() => {
    if (!triggerOnScroll) {
      setTimeout(() => setIsAnimating(true), delay * 1000)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setTimeout(() => setIsAnimating(true), delay * 1000)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(`animated-logo-${variant}`)
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [triggerOnScroll, delay, variant])

  return (
    <div
      id={`animated-logo-${variant}`}
      className={cn(
        "relative transition-all duration-1000",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`
      }}
    >
      <div className={cn(
        "relative transition-all duration-1000",
        isAnimating && getAnimationClass()
      )}>
        <Image
          src="/LOGO.png"
          alt="بصمة تصميم"
          width={sizeConfig[size].width}
          height={sizeConfig[size].height}
          className="object-contain drop-shadow-lg"
          priority
        />
        
        {/* Glow effect for luxury touch */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse opacity-60" />
      </div>
    </div>
  )
}

// Floating background logo for sections
export function FloatingBackgroundLogo({ 
  className,
  opacity = 0.05,
  size = 300 
}: { 
  className?: string
  opacity?: number
  size?: number 
}) {
  return (
    <div className={cn(
      "absolute pointer-events-none select-none",
      className
    )}>
      <div 
        className="animate-spin-slow"
        style={{ 
          opacity,
          width: size,
          height: size
        }}
      >
        <Image
          src="/LOGO.png"
          alt=""
          width={size}
          height={size}
          className="object-contain"
        />
      </div>
    </div>
  )
}
