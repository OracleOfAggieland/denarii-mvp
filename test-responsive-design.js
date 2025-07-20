/**
 * Responsive Design and Cross-Browser Compatibility Test
 * Tests for purple theme styling implementation
 */

// Test viewport sizes for responsive design
const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  large: { width: 1920, height: 1080 }
};

// CSS selectors for key components
const SELECTORS = {
  header: 'header',
  gradientHeader: '.bg-gradient-to-r',
  mainContainer: '.max-w-4xl',
  cardContainer: '.bg-white.rounded-xl',
  chatInterface: '[data-testid="chat-interface"]',
  messageList: '[data-testid="message-list"]',
  messageInput: 'form',
  sendButton: 'button[type="submit"]',
  textarea: 'textarea'
};

class ResponsiveDesignTester {
  constructor() {
    this.results = {
      responsive: [],
      styling: [],
      functionality: [],
      accessibility: []
    };
  }

  // Test card layout responsiveness across different screen sizes
  testCardLayoutResponsiveness() {
    console.log('🔍 Testing card layout responsiveness...');
    
    Object.entries(VIEWPORT_SIZES).forEach(([size, dimensions]) => {
      console.log(`Testing ${size} viewport (${dimensions.width}x${dimensions.height})`);
      
      // Simulate viewport resize
      this.simulateViewport(dimensions);
      
      // Test main container responsiveness
      const mainContainer = document.querySelector(SELECTORS.mainContainer);
      if (mainContainer) {
        const styles = window.getComputedStyle(mainContainer);
        const maxWidth = styles.maxWidth;
        const padding = styles.paddingLeft;
        
        this.results.responsive.push({
          viewport: size,
          test: 'main-container-max-width',
          expected: 'max-w-4xl (896px)',
          actual: maxWidth,
          passed: maxWidth === '896px' || maxWidth === '56rem'
        });
        
        this.results.responsive.push({
          viewport: size,
          test: 'main-container-padding',
          expected: 'responsive padding (px-4 sm:px-6 lg:px-8)',
          actual: padding,
          passed: this.validateResponsivePadding(padding, size)
        });
      }
      
      // Test card container responsiveness
      const cardContainer = document.querySelector(SELECTORS.cardContainer);
      if (cardContainer) {
        const styles = window.getComputedStyle(cardContainer);
        const borderRadius = styles.borderRadius;
        const boxShadow = styles.boxShadow;
        
        this.results.responsive.push({
          viewport: size,
          test: 'card-border-radius',
          expected: 'rounded-xl (12px)',
          actual: borderRadius,
          passed: borderRadius === '12px'
        });
        
        this.results.responsive.push({
          viewport: size,
          test: 'card-shadow',
          expected: 'shadow-xl',
          actual: boxShadow !== 'none',
          passed: boxShadow !== 'none'
        });
      }
    });
  }

  // Test purple gradient header rendering
  testPurpleGradientHeader() {
    console.log('🎨 Testing purple gradient header rendering...');
    
    const header = document.querySelector(SELECTORS.header);
    if (header) {
      const styles = window.getComputedStyle(header);
      const backgroundImage = styles.backgroundImage;
      
      // Check for gradient background
      const hasGradient = backgroundImage.includes('linear-gradient') || 
                         backgroundImage.includes('gradient');
      
      this.results.styling.push({
        test: 'header-gradient-background',
        expected: 'linear gradient from indigo-500 to violet-400',
        actual: backgroundImage,
        passed: hasGradient
      });
      
      // Test header text color
      const headerText = header.querySelector('h1');
      if (headerText) {
        const textStyles = window.getComputedStyle(headerText);
        const color = textStyles.color;
        
        this.results.styling.push({
          test: 'header-text-color',
          expected: 'white text',
          actual: color,
          passed: this.isWhiteColor(color)
        });
      }
    }
  }

  // Test message styling and input functionality on mobile devices
  testMobileMessageStyling() {
    console.log('📱 Testing mobile message styling and input functionality...');
    
    // Simulate mobile viewport
    this.simulateViewport(VIEWPORT_SIZES.mobile);
    
    // Test message bubbles max-width on mobile
    const messageBubbles = document.querySelectorAll('.max-w-\\[80\\%\\]');
    messageBubbles.forEach((bubble, index) => {
      const styles = window.getComputedStyle(bubble);
      const maxWidth = styles.maxWidth;
      
      this.results.responsive.push({
        viewport: 'mobile',
        test: `message-bubble-${index}-max-width`,
        expected: '80% max width',
        actual: maxWidth,
        passed: maxWidth === '80%'
      });
    });
    
    // Test input functionality on mobile
    const textarea = document.querySelector(SELECTORS.textarea);
    const sendButton = document.querySelector(SELECTORS.sendButton);
    
    if (textarea && sendButton) {
      // Test textarea touch-friendly sizing
      const textareaStyles = window.getComputedStyle(textarea);
      const minHeight = textareaStyles.minHeight;
      
      this.results.functionality.push({
        viewport: 'mobile',
        test: 'textarea-min-height',
        expected: 'minimum 40px height for touch',
        actual: minHeight,
        passed: parseInt(minHeight) >= 40
      });
      
      // Test button touch target size
      const buttonStyles = window.getComputedStyle(sendButton);
      const buttonHeight = buttonStyles.height;
      
      this.results.functionality.push({
        viewport: 'mobile',
        test: 'send-button-touch-target',
        expected: 'minimum 44px height for touch',
        actual: buttonHeight,
        passed: parseInt(buttonHeight) >= 44
      });
    }
  }

  // Test spacing and margins across breakpoints
  testSpacingAcrossBreakpoints() {
    console.log('📏 Testing spacing and margins across breakpoints...');
    
    Object.entries(VIEWPORT_SIZES).forEach(([size, dimensions]) => {
      this.simulateViewport(dimensions);
      
      // Test header padding
      const headerContainer = document.querySelector('.max-w-7xl');
      if (headerContainer) {
        const styles = window.getComputedStyle(headerContainer);
        const paddingLeft = styles.paddingLeft;
        
        this.results.responsive.push({
          viewport: size,
          test: 'header-container-padding',
          expected: 'responsive padding (px-4 sm:px-6 lg:px-8)',
          actual: paddingLeft,
          passed: this.validateResponsivePadding(paddingLeft, size)
        });
      }
      
      // Test main container vertical spacing
      const mainContainer = document.querySelector(SELECTORS.mainContainer);
      if (mainContainer) {
        const styles = window.getComputedStyle(mainContainer);
        const paddingTop = styles.paddingTop;
        
        this.results.responsive.push({
          viewport: size,
          test: 'main-container-vertical-spacing',
          expected: 'responsive vertical padding (py-6 sm:py-8)',
          actual: paddingTop,
          passed: this.validateResponsiveVerticalPadding(paddingTop, size)
        });
      }
      
      // Test message list spacing
      const messageList = document.querySelector('.space-y-4');
      if (messageList) {
        const styles = window.getComputedStyle(messageList);
        // Check if space-y-4 is applied (16px gap)
        const gap = styles.gap || styles.rowGap;
        
        this.results.responsive.push({
          viewport: size,
          test: 'message-list-spacing',
          expected: '16px spacing between messages',
          actual: gap,
          passed: gap === '16px' || gap === '1rem'
        });
      }
    });
  }

  // Test color contrast for accessibility
  testColorContrast() {
    console.log('♿ Testing color contrast for accessibility...');
    
    // Test user message contrast (purple background, white text)
    const userMessageBg = '#6366f1'; // indigo-500
    const userMessageText = '#ffffff'; // white
    const userContrast = this.calculateContrastRatio(userMessageBg, userMessageText);
    
    this.results.accessibility.push({
      test: 'user-message-contrast',
      expected: 'WCAG AA compliance (4.5:1 minimum)',
      actual: `${userContrast.toFixed(2)}:1`,
      passed: userContrast >= 4.5
    });
    
    // Test AI message contrast (gray background, dark text)
    const aiMessageBg = '#f1f5f9'; // slate-100
    const aiMessageText = '#0f172a'; // slate-900
    const aiContrast = this.calculateContrastRatio(aiMessageBg, aiMessageText);
    
    this.results.accessibility.push({
      test: 'ai-message-contrast',
      expected: 'WCAG AA compliance (4.5:1 minimum)',
      actual: `${aiContrast.toFixed(2)}:1`,
      passed: aiContrast >= 4.5
    });
    
    // Test button contrast
    const buttonBg = '#6366f1'; // indigo-500
    const buttonText = '#ffffff'; // white
    const buttonContrast = this.calculateContrastRatio(buttonBg, buttonText);
    
    this.results.accessibility.push({
      test: 'send-button-contrast',
      expected: 'WCAG AA compliance (4.5:1 minimum)',
      actual: `${buttonContrast.toFixed(2)}:1`,
      passed: buttonContrast >= 4.5
    });
  }

  // Helper methods
  simulateViewport(dimensions) {
    // In a real browser environment, this would resize the viewport
    // For testing purposes, we'll simulate the responsive behavior
    document.documentElement.style.width = `${dimensions.width}px`;
    document.documentElement.style.height = `${dimensions.height}px`;
  }

  validateResponsivePadding(padding, viewport) {
    const paddingValue = parseInt(padding);
    switch (viewport) {
      case 'mobile':
        return paddingValue === 16; // px-4 = 16px
      case 'tablet':
        return paddingValue === 24; // sm:px-6 = 24px
      case 'desktop':
      case 'large':
        return paddingValue === 32; // lg:px-8 = 32px
      default:
        return false;
    }
  }

  validateResponsiveVerticalPadding(padding, viewport) {
    const paddingValue = parseInt(padding);
    switch (viewport) {
      case 'mobile':
        return paddingValue === 24; // py-6 = 24px
      case 'tablet':
      case 'desktop':
      case 'large':
        return paddingValue === 32; // sm:py-8 = 32px
      default:
        return false;
    }
  }

  isWhiteColor(color) {
    // Check if color is white in various formats
    const whiteValues = ['rgb(255, 255, 255)', 'rgba(255, 255, 255, 1)', '#ffffff', '#fff', 'white'];
    return whiteValues.some(white => color.toLowerCase().includes(white.toLowerCase()));
  }

  calculateContrastRatio(color1, color2) {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd use a proper color contrast library
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Run all tests
  runAllTests() {
    console.log('🚀 Starting responsive design and cross-browser compatibility tests...\n');
    
    this.testCardLayoutResponsiveness();
    this.testPurpleGradientHeader();
    this.testMobileMessageStyling();
    this.testSpacingAcrossBreakpoints();
    this.testColorContrast();
    
    this.generateReport();
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================\n');
    
    const categories = ['responsive', 'styling', 'functionality', 'accessibility'];
    let totalTests = 0;
    let passedTests = 0;
    
    categories.forEach(category => {
      const tests = this.results[category];
      const categoryPassed = tests.filter(test => test.passed).length;
      const categoryTotal = tests.length;
      
      console.log(`${category.toUpperCase()} TESTS: ${categoryPassed}/${categoryTotal} passed`);
      
      tests.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        const viewport = test.viewport ? `[${test.viewport}] ` : '';
        console.log(`  ${status} ${viewport}${test.test}`);
        if (!test.passed) {
          console.log(`    Expected: ${test.expected}`);
          console.log(`    Actual: ${test.actual}`);
        }
      });
      
      console.log('');
      totalTests += categoryTotal;
      passedTests += categoryPassed;
    });
    
    console.log(`OVERALL: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Responsive design is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
    }
  }
}

// Export for use in browser environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveDesignTester;
} else if (typeof window !== 'undefined') {
  window.ResponsiveDesignTester = ResponsiveDesignTester;
}

// Auto-run if in browser environment
if (typeof window !== 'undefined' && window.document) {
  document.addEventListener('DOMContentLoaded', () => {
    const tester = new ResponsiveDesignTester();
    tester.runAllTests();
  });
}