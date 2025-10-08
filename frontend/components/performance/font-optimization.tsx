'use client'

import { useEffect } from 'react'

// Font optimization component for better performance
export function FontOptimization() {
  useEffect(() => {
    // Preload critical fonts
    const preloadFont = (fontUrl: string, fontFamily: string) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      link.href = fontUrl
      document.head.appendChild(link)
      
      // Add font-display: swap for better performance
      const style = document.createElement('style')
      style.innerHTML = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('woff2');
          font-display: swap;
          font-weight: 100 900;
          font-style: normal;
        }
      `
      document.head.appendChild(style)
    }

    // Load Google Fonts with optimal performance
    const loadGoogleFonts = () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap'
      link.media = 'print'
      link.onload = function() {
        link.media = 'all'
      }
      document.head.appendChild(link)
    }

    // Optimize font loading
    if (document.fonts) {
      document.fonts.ready.then(() => {
        // Font loading completed
        document.documentElement.classList.add('fonts-loaded')
      })
    }

    loadGoogleFonts()

  }, [])

  return null
}

// CSS for font optimization
export const fontOptimizationStyles = `
  /* Font loading optimization */
  .fonts-loading {
    visibility: hidden;
  }
  
  .fonts-loaded {
    visibility: visible;
  }
  
  /* Arabic font stack with fallbacks */
  body {
    font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans Arabic', sans-serif;
    font-display: swap;
  }
  
  /* Optimize text rendering */
  * {
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Reduce layout shift for Arabic text */
  [lang="ar"], [dir="rtl"] {
    font-kerning: normal;
    font-variant-ligatures: common-ligatures contextual;
  }
`
