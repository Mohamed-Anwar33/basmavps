/**
 * Responsive Design Validation Script
 * 
 * This script helps validate that all responsive design elements
 * are working correctly across different screen sizes.
 * 
 * Run this in the browser console on any admin page to test responsiveness.
 */

(function() {
  'use strict';

  const BREAKPOINTS = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
  };

  const COLORS = {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };

  class ResponsiveValidator {
    constructor() {
      this.results = [];
      this.currentBreakpoint = this.getCurrentBreakpoint();
      this.isMobile = window.innerWidth < BREAKPOINTS.md;
      this.isTablet = window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
      this.isDesktop = window.innerWidth >= BREAKPOINTS.lg;
    }

    getCurrentBreakpoint() {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS.xxl) return 'xxl';
      if (width >= BREAKPOINTS.xl) return 'xl';
      if (width >= BREAKPOINTS.lg) return 'lg';
      if (width >= BREAKPOINTS.md) return 'md';
      if (width >= BREAKPOINTS.sm) return 'sm';
      return 'xs';
    }

    log(message, type = 'info') {
      const color = COLORS[type] || COLORS.info;
      this.results.push({ message, type, timestamp: new Date() });
    }

    // Test 1: Check if responsive CSS is loaded
    testResponsiveCSSLoaded() {
      this.log('🧪 Testing: Responsive CSS Loading', 'info');
      
      const hasResponsiveCSS = Array.from(document.styleSheets).some(sheet => {
        try {
          return sheet.href && sheet.href.includes('responsive.css');
        } catch (e) {
          return false;
        }
      });

      if (hasResponsiveCSS) {
        this.log('✅ Responsive CSS is loaded', 'success');
      } else {
        this.log('❌ Responsive CSS not found', 'error');
      }
    }

    // Test 2: Check mobile navigation
    testMobileNavigation() {
      this.log('🧪 Testing: Mobile Navigation', 'info');
      
      const sidebar = document.querySelector('.ant-layout-sider');
      const mobileDrawer = document.querySelector('.mobile-admin-drawer');
      const mobileMenuButton = document.querySelector('[data-testid="mobile-menu-button"]');

      if (this.isMobile) {
        if (sidebar && getComputedStyle(sidebar).display === 'none') {
          this.log('✅ Sidebar hidden on mobile', 'success');
        } else {
          this.log('❌ Sidebar should be hidden on mobile', 'error');
        }

        // Check if mobile menu button exists in header
        const headerMenuButton = document.querySelector('.ant-layout-header button');
        if (headerMenuButton) {
          this.log('✅ Mobile menu button found', 'success');
        } else {
          this.log('⚠️ Mobile menu button not found', 'warning');
        }
      } else {
        if (sidebar && getComputedStyle(sidebar).display !== 'none') {
          this.log('✅ Sidebar visible on desktop', 'success');
        } else {
          this.log('❌ Sidebar should be visible on desktop', 'error');
        }
      }
    }

    // Test 3: Check button sizes and touch targets
    testTouchTargets() {
      this.log('🧪 Testing: Touch Targets', 'info');
      
      const buttons = document.querySelectorAll('.ant-btn');
      let touchFriendlyCount = 0;
      let totalButtons = buttons.length;

      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const minSize = this.isMobile ? 44 : 32; // 44px minimum for mobile
        
        if (rect.height >= minSize && rect.width >= minSize) {
          touchFriendlyCount++;
        }
      });

      const percentage = totalButtons > 0 ? (touchFriendlyCount / totalButtons) * 100 : 0;
      
      if (percentage >= 90) {
        this.log(`✅ ${percentage.toFixed(1)}% of buttons are touch-friendly (${touchFriendlyCount}/${totalButtons})`, 'success');
      } else if (percentage >= 70) {
        this.log(`⚠️ ${percentage.toFixed(1)}% of buttons are touch-friendly (${touchFriendlyCount}/${totalButtons})`, 'warning');
      } else {
        this.log(`❌ Only ${percentage.toFixed(1)}% of buttons are touch-friendly (${touchFriendlyCount}/${totalButtons})`, 'error');
      }
    }

    // Test 4: Check form responsiveness
    testFormResponsiveness() {
      this.log('🧪 Testing: Form Responsiveness', 'info');
      
      const forms = document.querySelectorAll('.ant-form');
      const inputs = document.querySelectorAll('.ant-input, .ant-select-selector');
      
      if (forms.length === 0) {
        this.log('ℹ️ No forms found on this page', 'info');
        return;
      }

      // Check input sizes on mobile
      if (this.isMobile) {
        let mobileOptimizedInputs = 0;
        inputs.forEach(input => {
          const rect = input.getBoundingClientRect();
          if (rect.height >= 44) {
            mobileOptimizedInputs++;
          }
        });

        const percentage = inputs.length > 0 ? (mobileOptimizedInputs / inputs.length) * 100 : 0;
        
        if (percentage >= 90) {
          this.log(`✅ ${percentage.toFixed(1)}% of inputs are mobile-optimized`, 'success');
        } else {
          this.log(`⚠️ ${percentage.toFixed(1)}% of inputs are mobile-optimized`, 'warning');
        }
      }

      // Check for responsive grid layouts
      const rows = document.querySelectorAll('.ant-row');
      const responsiveRows = Array.from(rows).filter(row => {
        const cols = row.querySelectorAll('.ant-col');
        return Array.from(cols).some(col => 
          col.classList.toString().includes('xs-') || 
          col.classList.toString().includes('lg-')
        );
      });

      if (responsiveRows.length > 0) {
        this.log(`✅ Found ${responsiveRows.length} responsive grid layouts`, 'success');
      } else if (rows.length > 0) {
        this.log(`⚠️ Grid layouts found but may not be responsive`, 'warning');
      }
    }

    // Test 5: Check table responsiveness
    testTableResponsiveness() {
      this.log('🧪 Testing: Table Responsiveness', 'info');
      
      const tables = document.querySelectorAll('.ant-table-wrapper');
      
      if (tables.length === 0) {
        this.log('ℹ️ No tables found on this page', 'info');
        return;
      }

      tables.forEach((tableWrapper, index) => {
        const table = tableWrapper.querySelector('.ant-table');
        if (!table) return;

        // Check for horizontal scroll on mobile
        if (this.isMobile) {
          const hasHorizontalScroll = tableWrapper.scrollWidth > tableWrapper.clientWidth;
          if (hasHorizontalScroll) {
            this.log(`✅ Table ${index + 1} has horizontal scroll on mobile`, 'success');
          } else {
            this.log(`⚠️ Table ${index + 1} might be too narrow`, 'warning');
          }
        }

        // Check for responsive table container
        const hasResponsiveContainer = tableWrapper.classList.contains('admin-table-container') ||
                                     tableWrapper.closest('.admin-table-container');
        
        if (hasResponsiveContainer) {
          this.log(`✅ Table ${index + 1} has responsive container`, 'success');
        } else {
          this.log(`⚠️ Table ${index + 1} missing responsive container`, 'warning');
        }
      });
    }

    // Test 6: Check modal responsiveness
    testModalResponsiveness() {
      this.log('🧪 Testing: Modal Responsiveness', 'info');
      
      const modals = document.querySelectorAll('.ant-modal');
      
      if (modals.length === 0) {
        this.log('ℹ️ No modals currently open', 'info');
        return;
      }

      modals.forEach((modal, index) => {
        const rect = modal.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        if (this.isMobile) {
          const widthPercentage = (rect.width / viewportWidth) * 100;
          if (widthPercentage >= 90) {
            this.log(`✅ Modal ${index + 1} uses full width on mobile (${widthPercentage.toFixed(1)}%)`, 'success');
          } else {
            this.log(`⚠️ Modal ${index + 1} might be too narrow on mobile (${widthPercentage.toFixed(1)}%)`, 'warning');
          }
        }
      });
    }

    // Test 7: Check responsive classes
    testResponsiveClasses() {
      this.log('🧪 Testing: Responsive Classes', 'info');
      
      const responsiveElements = document.querySelectorAll('[class*="admin-"], [class*="lg:"], [class*="md:"], [class*="sm:"]');
      
      if (responsiveElements.length > 0) {
        this.log(`✅ Found ${responsiveElements.length} elements with responsive classes`, 'success');
      } else {
        this.log('⚠️ No responsive classes found', 'warning');
      }

      // Check for mobile-specific classes
      const mobileHidden = document.querySelectorAll('.admin-mobile-hidden');
      const mobileOnly = document.querySelectorAll('.admin-mobile-only');
      
      if (mobileHidden.length > 0 || mobileOnly.length > 0) {
        this.log(`✅ Found mobile visibility classes (${mobileHidden.length} hidden, ${mobileOnly.length} only)`, 'success');
      }
    }

    // Test 8: Performance check
    testPerformance() {
      this.log('🧪 Testing: Performance Metrics', 'info');
      
      if (window.performance && window.performance.getEntriesByType) {
        const navigationTiming = window.performance.getEntriesByType('navigation')[0];
        if (navigationTiming) {
          const loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
          const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart;
          
          this.log(`📊 Page load time: ${loadTime.toFixed(2)}ms`, 'info');
          this.log(`📊 DOM content loaded: ${domContentLoaded.toFixed(2)}ms`, 'info');
          
          if (loadTime < 1000) {
            this.log('✅ Fast page load time', 'success');
          } else if (loadTime < 3000) {
            this.log('⚠️ Moderate page load time', 'warning');
          } else {
            this.log('❌ Slow page load time', 'error');
          }
        }
      }
    }

    // Run all tests
    runAllTests() {
      this.log('🚀 Starting Responsive Design Validation', 'info');
      this.log(`📱 Current viewport: ${window.innerWidth}x${window.innerHeight} (${this.currentBreakpoint})`, 'info');
      this.log(`📱 Device type: ${this.isMobile ? 'Mobile' : this.isTablet ? 'Tablet' : 'Desktop'}`, 'info');

      this.testResponsiveCSSLoaded();
      this.testMobileNavigation();
      this.testTouchTargets();
      this.testFormResponsiveness();
      this.testTableResponsiveness();
      this.testModalResponsiveness();
      this.testResponsiveClasses();
      this.testPerformance();

      this.generateReport();
    }

    // Generate final report
    generateReport() {
      const successCount = this.results.filter(r => r.type === 'success').length;
      const warningCount = this.results.filter(r => r.type === 'warning').length;
      const errorCount = this.results.filter(r => r.type === 'error').length;
      const totalTests = successCount + warningCount + errorCount;

      this.log('📋 VALIDATION REPORT', 'info');
      this.log(`✅ Passed: ${successCount}`, 'success');
      this.log(`⚠️ Warnings: ${warningCount}`, 'warning');
      this.log(`❌ Failed: ${errorCount}`, 'error');
      
      const score = totalTests > 0 ? (successCount / totalTests) * 100 : 0;
      
      if (score >= 90) {
        this.log(`🎉 Overall Score: ${score.toFixed(1)}% - Excellent!`, 'success');
      } else if (score >= 70) {
        this.log(`👍 Overall Score: ${score.toFixed(1)}% - Good`, 'warning');
      } else {
        this.log(`👎 Overall Score: ${score.toFixed(1)}% - Needs Improvement`, 'error');
      }

      // Recommendations
      if (errorCount > 0 || warningCount > 0) {
        this.log('💡 RECOMMENDATIONS:', 'info');
        if (errorCount > 0) {
          this.log('• Fix critical responsive issues (red items)', 'error');
        }
        if (warningCount > 0) {
          this.log('• Address responsive warnings (yellow items)', 'warning');
        }
        this.log('• Test on actual mobile devices', 'info');
        this.log('• Use browser dev tools to simulate different screen sizes', 'info');
      }
    }
  }

  // Auto-run validation
  const validator = new ResponsiveValidator();
  validator.runAllTests();

  // Make validator available globally for manual testing
  window.ResponsiveValidator = ResponsiveValidator;
  
  console.log('%c💡 TIP: Run new ResponsiveValidator().runAllTests() to test again', 'color: #3b82f6; font-style: italic;');

})();
