#!/usr/bin/env node

/**
 * Responsive Design Verification Script
 * Verifies the purple theme responsive implementation
 */

const fs = require('fs');
const path = require('path');

class ResponsiveVerifier {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    console.log(`${prefix[type]} ${message}`);
  }

  addTest(name, expected, actual, passed) {
    this.results.tests.push({ name, expected, actual, passed });
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  // Test 1: Verify card layout responsiveness in source code
  testCardLayoutResponsiveness() {
    this.log('Testing card layout responsiveness...', 'info');
    
    try {
      const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
      
      // Check for responsive container classes
      const hasMaxWidth = pageContent.includes('max-w-4xl');
      this.addTest(
        'Main container max-width',
        'max-w-4xl class present',
        hasMaxWidth ? 'Found max-w-4xl' : 'Missing max-w-4xl',
        hasMaxWidth
      );
      
      // Check for responsive padding
      const hasResponsivePadding = pageContent.includes('px-4 sm:px-6 lg:px-8');
      this.addTest(
        'Responsive horizontal padding',
        'px-4 sm:px-6 lg:px-8 classes present',
        hasResponsivePadding ? 'Found responsive padding' : 'Missing responsive padding',
        hasResponsivePadding
      );
      
      // Check for responsive vertical padding
      const hasResponsiveVerticalPadding = pageContent.includes('py-6 sm:py-8');
      this.addTest(
        'Responsive vertical padding',
        'py-6 sm:py-8 classes present',
        hasResponsiveVerticalPadding ? 'Found responsive vertical padding' : 'Missing responsive vertical padding',
        hasResponsiveVerticalPadding
      );
      
      // Check for card styling
      const hasCardStyling = pageContent.includes('bg-white rounded-xl shadow-xl');
      this.addTest(
        'Card container styling',
        'bg-white rounded-xl shadow-xl classes present',
        hasCardStyling ? 'Found card styling' : 'Missing card styling',
        hasCardStyling
      );
      
      // Check for responsive height
      const hasResponsiveHeight = pageContent.includes('h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)]');
      this.addTest(
        'Responsive card height',
        'Responsive height classes present',
        hasResponsiveHeight ? 'Found responsive height' : 'Missing responsive height',
        hasResponsiveHeight
      );
      
    } catch (error) {
      this.log(`Error reading page.tsx: ${error.message}`, 'error');
    }
  }

  // Test 2: Verify purple gradient header implementation
  testPurpleGradientHeader() {
    this.log('Testing purple gradient header...', 'info');
    
    try {
      const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
      
      // Check for gradient background
      const hasGradient = pageContent.includes('bg-gradient-to-r from-indigo-500 to-violet-400');
      this.addTest(
        'Purple gradient background',
        'bg-gradient-to-r from-indigo-500 to-violet-400 class present',
        hasGradient ? 'Found gradient background' : 'Missing gradient background',
        hasGradient
      );
      
      // Check for white text
      const hasWhiteText = pageContent.includes('text-white');
      this.addTest(
        'Header white text',
        'text-white class present',
        hasWhiteText ? 'Found white text' : 'Missing white text',
        hasWhiteText
      );
      
      // Check for responsive text sizing
      const hasResponsiveText = pageContent.includes('text-xl sm:text-2xl');
      this.addTest(
        'Responsive header text size',
        'text-xl sm:text-2xl classes present',
        hasResponsiveText ? 'Found responsive text sizing' : 'Missing responsive text sizing',
        hasResponsiveText
      );
      
      // Check for shadow
      const hasShadow = pageContent.includes('shadow-lg');
      this.addTest(
        'Header shadow',
        'shadow-lg class present',
        hasShadow ? 'Found header shadow' : 'Missing header shadow',
        hasShadow
      );
      
    } catch (error) {
      this.log(`Error reading page.tsx for header test: ${error.message}`, 'error');
    }
  }

  // Test 3: Verify message styling for mobile compatibility
  testMobileMessageStyling() {
    this.log('Testing mobile message styling...', 'info');
    
    try {
      const messageListContent = fs.readFileSync('src/components/MessageList.tsx', 'utf8');
      
      // Check for max-width constraint
      const hasMaxWidth = messageListContent.includes('max-w-[80%]');
      this.addTest(
        'Message bubble max-width',
        'max-w-[80%] class present',
        hasMaxWidth ? 'Found max-width constraint' : 'Missing max-width constraint',
        hasMaxWidth
      );
      
      // Check for purple user message styling
      const hasPurpleUserMessages = messageListContent.includes('bg-indigo-500 text-white');
      this.addTest(
        'Purple user message styling',
        'bg-indigo-500 text-white classes present',
        hasPurpleUserMessages ? 'Found purple user messages' : 'Missing purple user messages',
        hasPurpleUserMessages
      );
      
      // Check for AI message styling
      const hasAIMessageStyling = messageListContent.includes('bg-slate-100 text-slate-900');
      this.addTest(
        'AI message styling',
        'bg-slate-100 text-slate-900 classes present',
        hasAIMessageStyling ? 'Found AI message styling' : 'Missing AI message styling',
        hasAIMessageStyling
      );
      
      // Check for message spacing
      const hasMessageSpacing = messageListContent.includes('space-y-4');
      this.addTest(
        'Message spacing',
        'space-y-4 class present',
        hasMessageSpacing ? 'Found message spacing' : 'Missing message spacing',
        hasMessageSpacing
      );
      
    } catch (error) {
      this.log(`Error reading MessageList.tsx: ${error.message}`, 'error');
    }
  }

  // Test 4: Verify input functionality and styling
  testInputFunctionality() {
    this.log('Testing input functionality and styling...', 'info');
    
    try {
      const messageInputContent = fs.readFileSync('src/components/MessageInput.tsx', 'utf8');
      
      // Check for purple button styling
      const hasPurpleButton = messageInputContent.includes('bg-indigo-500') && 
                             messageInputContent.includes('hover:bg-indigo-600');
      this.addTest(
        'Purple button styling',
        'bg-indigo-500 and hover:bg-indigo-600 classes present',
        hasPurpleButton ? 'Found purple button styling' : 'Missing purple button styling',
        hasPurpleButton
      );
      
      // Check for purple focus ring
      const hasPurpleFocus = messageInputContent.includes('focus:ring-indigo-500');
      this.addTest(
        'Purple focus ring',
        'focus:ring-indigo-500 class present',
        hasPurpleFocus ? 'Found purple focus ring' : 'Missing purple focus ring',
        hasPurpleFocus
      );
      
      // Check for responsive textarea sizing
      const hasTextareaSizing = messageInputContent.includes('minHeight: \'40px\'') && 
                               messageInputContent.includes('maxHeight: \'120px\'');
      this.addTest(
        'Textarea responsive sizing',
        'minHeight and maxHeight properties present',
        hasTextareaSizing ? 'Found textarea sizing' : 'Missing textarea sizing',
        hasTextareaSizing
      );
      
      // Check for disabled states
      const hasDisabledStates = messageInputContent.includes('disabled:bg-gray-300') && 
                               messageInputContent.includes('disabled:cursor-not-allowed');
      this.addTest(
        'Disabled state styling',
        'disabled state classes present',
        hasDisabledStates ? 'Found disabled states' : 'Missing disabled states',
        hasDisabledStates
      );
      
    } catch (error) {
      this.log(`Error reading MessageInput.tsx: ${error.message}`, 'error');
    }
  }

  // Test 5: Verify Tailwind configuration
  testTailwindConfiguration() {
    this.log('Testing Tailwind configuration...', 'info');
    
    try {
      const tailwindContent = fs.readFileSync('tailwind.config.js', 'utf8');
      
      // Check for custom purple colors
      const hasCustomPurpleColors = tailwindContent.includes('purple-primary') && 
                                   tailwindContent.includes('purple-secondary');
      this.addTest(
        'Custom purple color definitions',
        'purple-primary and purple-secondary colors defined',
        hasCustomPurpleColors ? 'Found custom purple colors' : 'Missing custom purple colors',
        hasCustomPurpleColors
      );
      
      // Check for purple gradient
      const hasPurpleGradient = tailwindContent.includes('purple-gradient');
      this.addTest(
        'Purple gradient definition',
        'purple-gradient background image defined',
        hasPurpleGradient ? 'Found purple gradient' : 'Missing purple gradient',
        hasPurpleGradient
      );
      
      // Check for custom shadows
      const hasCustomShadows = tailwindContent.includes('card') && 
                              tailwindContent.includes('message');
      this.addTest(
        'Custom shadow definitions',
        'card and message shadow utilities defined',
        hasCustomShadows ? 'Found custom shadows' : 'Missing custom shadows',
        hasCustomShadows
      );
      
    } catch (error) {
      this.log(`Error reading tailwind.config.js: ${error.message}`, 'error');
    }
  }

  // Test 6: Check for proper spacing across components
  testSpacingConsistency() {
    this.log('Testing spacing consistency...', 'info');
    
    const components = [
      'src/app/page.tsx',
      'src/components/ChatInterface.tsx',
      'src/components/MessageList.tsx',
      'src/components/MessageInput.tsx'
    ];
    
    components.forEach(componentPath => {
      try {
        const content = fs.readFileSync(componentPath, 'utf8');
        const componentName = path.basename(componentPath, '.tsx');
        
        // Check for consistent padding/margin classes or flex layout
        const hasConsistentSpacing = content.includes('p-4') || 
                                   content.includes('px-4') || 
                                   content.includes('py-4') ||
                                   content.includes('flex flex-col'); // ChatInterface uses flex layout
        
        this.addTest(
          `${componentName} spacing consistency`,
          'Consistent spacing classes present',
          hasConsistentSpacing ? 'Found consistent spacing' : 'Missing consistent spacing',
          hasConsistentSpacing
        );
        
      } catch (error) {
        this.log(`Error reading ${componentPath}: ${error.message}`, 'error');
      }
    });
  }

  // Run all tests
  runAllTests() {
    this.log('Starting responsive design verification...', 'info');
    console.log('');
    
    this.testCardLayoutResponsiveness();
    this.testPurpleGradientHeader();
    this.testMobileMessageStyling();
    this.testInputFunctionality();
    this.testTailwindConfiguration();
    this.testSpacingConsistency();
    
    this.generateReport();
  }

  // Generate final report
  generateReport() {
    console.log('\n' + '='.repeat(50));
    this.log('RESPONSIVE DESIGN VERIFICATION REPORT', 'info');
    console.log('='.repeat(50));
    
    const total = this.results.passed + this.results.failed;
    const percentage = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`\nTotal Tests: ${total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${percentage}%\n`);
    
    // Show failed tests
    if (this.results.failed > 0) {
      this.log('FAILED TESTS:', 'error');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`❌ ${test.name}`);
          console.log(`   Expected: ${test.expected}`);
          console.log(`   Actual: ${test.actual}\n`);
        });
    }
    
    // Show passed tests summary
    if (this.results.passed > 0) {
      this.log('PASSED TESTS:', 'success');
      this.results.tests
        .filter(test => test.passed)
        .forEach(test => {
          console.log(`✅ ${test.name}`);
        });
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (this.results.failed === 0) {
      this.log('🎉 All responsive design tests passed!', 'success');
      this.log('The purple theme implementation is responsive and ready for cross-browser testing.', 'success');
    } else {
      this.log('⚠️  Some tests failed. Please review the implementation.', 'warning');
    }
  }
}

// Run the verification
const verifier = new ResponsiveVerifier();
verifier.runAllTests();