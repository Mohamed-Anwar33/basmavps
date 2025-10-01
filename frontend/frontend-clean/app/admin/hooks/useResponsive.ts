'use client';

import { useState, useEffect } from 'react';

interface BreakpointValues {
  xs: boolean;  // < 576px
  sm: boolean;  // >= 576px
  md: boolean;  // >= 768px
  lg: boolean;  // >= 992px
  xl: boolean;  // >= 1200px
  xxl: boolean; // >= 1600px
}

interface ResponsiveInfo extends BreakpointValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export const useResponsive = (): ResponsiveInfo => {
  const [screenSize, setScreenSize] = useState<ResponsiveInfo>({
    xs: true,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    xxl: false,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    const calculateScreenSize = (): ResponsiveInfo => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const xs = width >= breakpoints.xs;
      const sm = width >= breakpoints.sm;
      const md = width >= breakpoints.md;
      const lg = width >= breakpoints.lg;
      const xl = width >= breakpoints.xl;
      const xxl = width >= breakpoints.xxl;

      const isMobile = width < breakpoints.md;
      const isTablet = width >= breakpoints.md && width < breakpoints.lg;
      const isDesktop = width >= breakpoints.lg;

      return {
        xs,
        sm,
        md,
        lg,
        xl,
        xxl,
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
      };
    };

    const handleResize = () => {
      setScreenSize(calculateScreenSize());
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Utility hook for getting responsive column spans
export const useResponsiveColumns = (
  desktop: number = 12,
  tablet: number = 12,
  mobile: number = 24
) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
};

// Utility hook for responsive grid configurations
export const useResponsiveGrid = () => {
  const { isMobile, isTablet } = useResponsive();

  return {
    gutter: isMobile ? [8, 8] : [16, 16],
    cols: {
      xs: 1,
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
      xxl: 4,
    },
    getColumns: (maxCols: number = 4) => {
      if (isMobile) return 1;
      if (isTablet) return Math.min(2, maxCols);
      return maxCols;
    },
  };
};

// Utility hook for responsive table configurations
export const useResponsiveTable = () => {
  const { isMobile, isTablet, screenWidth } = useResponsive();

  return {
    scroll: { x: isMobile ? 700 : isTablet ? 900 : 1200 },
    pagination: {
      showSizeChanger: !isMobile,
      showQuickJumper: !isMobile,
      showLessItems: isMobile,
      responsive: true,
      size: isMobile ? 'small' : 'default',
      pageSize: isMobile ? 5 : 10,
    },
    size: isMobile ? 'small' : 'middle',
    showMobileCards: isMobile,
  };
};

// Utility hook for responsive modal configurations
export const useResponsiveModal = () => {
  const { isMobile, screenWidth } = useResponsive();

  return {
    width: isMobile ? '95vw' : screenWidth > 1400 ? 1200 : '80vw',
    style: {
      top: isMobile ? 10 : 20,
      maxWidth: isMobile ? 'calc(100vw - 20px)' : '1200px',
      margin: '0 auto',
    },
    bodyStyle: {
      padding: isMobile ? '16px' : '24px',
      maxHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 200px)',
      overflowY: 'auto' as const,
    },
    destroyOnHidden: true,
    maskClosable: !isMobile, // Prevent accidental closes on mobile
  };
};

// Utility hook for responsive form configurations
export const useResponsiveForm = () => {
  const { isMobile } = useResponsive();

  return {
    layout: 'vertical' as const,
    size: isMobile ? 'large' : 'middle',
    colon: false,
    requiredMark: false,
    scrollToFirstError: true,
    validateTrigger: isMobile ? 'onBlur' : 'onChange',
  };
};

// Utility hook for responsive button configurations
export const useResponsiveButton = () => {
  const { isMobile } = useResponsive();

  return {
    size: isMobile ? 'large' : 'middle',
    block: isMobile, // Full width on mobile
    style: {
      height: isMobile ? '44px' : 'auto',
      fontSize: isMobile ? '16px' : '14px',
      borderRadius: isMobile ? '12px' : '6px',
    },
  };
};

// Utility function to get responsive class names
export const getResponsiveClassName = (
  baseClass: string,
  mobileClass?: string,
  tabletClass?: string,
  desktopClass?: string
) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  let className = baseClass;

  if (isMobile && mobileClass) {
    className += ` ${mobileClass}`;
  } else if (isTablet && tabletClass) {
    className += ` ${tabletClass}`;
  } else if (isDesktop && desktopClass) {
    className += ` ${desktopClass}`;
  }

  return className;
};

export default useResponsive;
