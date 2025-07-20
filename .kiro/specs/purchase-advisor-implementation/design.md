# Design Document

## Overview

The Purchase Advisor Implementation is a comprehensive React-based web application that provides intelligent purchase decision-making capabilities. The system combines financial profiling, image recognition, alternative product searching, and personalized recommendations to help users make rational purchasing decisions based on Charlie Munger's investment principles.

The application follows a modern, responsive design pattern with a clean user interface, smooth animations, and accessibility-first approach. It leverages external APIs for image recognition and product searching while maintaining user privacy by storing sensitive financial data locally.

## Architecture

### Frontend Architecture
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router for navigation between pages
- **State Management**: React useState and useEffect hooks for local state
- **Storage**: Browser localStorage for financial profile persistence
- **Styling**: CSS3 with CSS custom properties (variables) for theming

### Component Structure
```
App (Router)
├── PurchaseAdvisor (Main analysis page)
│   ├── Header
│   ├── Hero Section
│   ├── Financial Profile Mini-Summary
│   ├── Purchase Analysis Form
│   │   ├── Item Input Fields
│   │   ├── Image Capture/Upload
│   │   └── Analysis Controls
│   ├── Results Display
│   └── Footer
├── FinancialProfile (Profile management page)
│   ├── Header
│   ├── Hero Section
│   ├── Financial Summary Card
│   ├── Collapsible Form Sections
│   │   ├── Income Section
│   │   ├── Expenses Section
│   │   ├── Debt Section
│   │   ├── Credit Section
│   │   ├── Savings Section
│   │   ├── Investments Section
│   │   ├── Goals Section
│   │   ├── Timing Section
│   │   └── Risk Tolerance Section
│   └── Footer
└── Navigation (Floating navigation button)
```

### API Integration Points
- **Image Recognition**: Gemini Vision API for item identification
- **Purchase Analysis**: Gemini API for recommendation generation
- **Alternative Search**: Gemini API for finding cheaper alternatives
- **Search Links**: Google Search integration for product discovery

## Components and Interfaces

### Core Components

#### PurchaseAdvisor Component
**Purpose**: Main application interface for purchase analysis
**Props**: None (uses React Router)
**State**:
- `messages`: Array of conversation messages
- `itemName`, `itemCost`, `purpose`, `frequency`: Form inputs
- `loading`, `findingAlternatives`: Loading states
- `imageFile`, `imagePreview`: Image handling
- `imageCapturing`: Camera state
- `financialProfile`: User's financial data
- `searchForAlternative`: User preference

**Key Methods**:
- `analyzePurchase()`: Main analysis workflow
- `startCamera()`, `captureImage()`: Camera functionality
- `handleFileChange()`: Image upload handling

#### FinancialProfile Component
**Purpose**: Comprehensive financial data collection and analysis
**Props**: None (uses React Router)
**State**:
- `formData`: Complete financial information object
- `expandedSections`: UI state for collapsible sections
- `summary`: Calculated financial metrics

**Key Methods**:
- `calculateSummary()`: Financial metrics calculation
- `handleSubmit()`: Form processing and storage
- `toggleSection()`: UI interaction handling

#### Navigation Component
**Purpose**: Floating navigation between pages
**Implementation**: Integrated within App component using React Router

### Data Models

#### Financial Profile Data Structure
```javascript
{
  // Income
  monthlyIncome: number,
  incomeFrequency: "monthly" | "annual",
  otherIncomeSources: number,
  
  // Expenses
  housingCost: number,
  utilitiesCost: number,
  foodCost: number,
  transportationCost: number,
  insuranceCost: number,
  subscriptionsCost: number,
  otherExpenses: number,
  
  // Debt
  creditCardDebt: number,
  creditCardPayment: number,
  studentLoanDebt: number,
  studentLoanPayment: number,
  carLoanDebt: number,
  carLoanPayment: number,
  mortgageDebt: number,
  mortgagePayment: number,
  otherDebt: number,
  otherDebtPayment: number,
  
  // Credit
  creditScore: number,
  creditLimit: number,
  currentCreditBalance: number,
  
  // Savings & Investments
  checkingSavingsBalance: number,
  emergencyFund: number,
  retirementAccounts: number,
  stocksAndBonds: number,
  realEstateValue: number,
  otherInvestments: number,
  
  // Goals & Preferences
  shortTermGoals: string,
  midTermGoals: string,
  longTermGoals: string,
  purchaseTimeframe: string,
  riskTolerance: string,
  financialPriorities: string,
  
  // Calculated Summary
  summary: {
    monthlyNetIncome: number,
    debtToIncomeRatio: number,
    creditUtilization: number,
    netWorth: number,
    emergencyFundMonths: number,
    hasSummary: boolean
  }
}
```

#### Message Data Structure
```javascript
{
  sender: "System" | "You" | "Munger",
  text: string,
  formatted?: {
    decision: "Buy" | "Don't Buy" | "Error",
    reasoning: string
  },
  alternative?: {
    name: string,
    price: number,
    retailer: string,
    searchUrl: string
  }
}
```

### External API Interfaces

#### Gemini Vision API
**Purpose**: Image recognition and item identification
**Input**: Base64 encoded image
**Output**: Item details including name, estimated cost, and facts

#### Gemini Recommendation API
**Purpose**: Purchase decision analysis
**Input**: Item details, financial profile, alternatives
**Output**: Structured recommendation with decision and reasoning

#### Alternative Search API
**Purpose**: Finding cheaper alternatives
**Input**: Item name and current price
**Output**: Alternative product information

## Data Models

### Local Storage Schema
```javascript
// Key: 'financialProfile'
{
  ...formData,
  summary: calculatedMetrics
}
```

### Component State Models
- Form validation states
- Loading and error states
- UI interaction states (expanded sections, camera active)
- Temporary data (image previews, form inputs)

## Error Handling

### API Error Handling
- **Network Failures**: Display user-friendly messages and suggest retry
- **Authentication Errors**: Handle API key issues gracefully
- **Rate Limiting**: Implement appropriate delays and user feedback
- **Invalid Responses**: Fallback to manual input methods

### User Input Validation
- **Required Fields**: Clear indication of missing required information
- **Numeric Validation**: Ensure financial inputs are valid numbers
- **File Upload**: Validate image file types and sizes
- **Form State**: Prevent submission with invalid data

### Camera and Media Handling
- **Permission Denied**: Graceful fallback to file upload
- **Device Compatibility**: Feature detection and alternative methods
- **Stream Management**: Proper cleanup of media streams

### Data Persistence
- **localStorage Availability**: Fallback for browsers without support
- **Data Corruption**: Validation and recovery mechanisms
- **Storage Limits**: Efficient data management

## Testing Strategy

### Unit Testing
- **Component Rendering**: Verify all components render correctly
- **State Management**: Test state updates and side effects
- **Utility Functions**: Test financial calculations and data processing
- **Form Validation**: Verify input validation logic

### Integration Testing
- **API Integration**: Mock external API calls and test responses
- **Navigation Flow**: Test routing between pages
- **Data Persistence**: Test localStorage integration
- **Image Processing**: Test camera and file upload workflows

### User Experience Testing
- **Responsive Design**: Test across different screen sizes
- **Accessibility**: Verify keyboard navigation and screen reader compatibility
- **Performance**: Test loading times and smooth animations
- **Error Scenarios**: Test error handling and recovery

### Cross-Browser Testing
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Feature Support**: Camera API, localStorage, CSS features

### Security Testing
- **Data Privacy**: Verify financial data stays local
- **Input Sanitization**: Test against malicious inputs
- **API Security**: Ensure secure API communication
- **Storage Security**: Test localStorage data protection

## Performance Considerations

### Image Processing
- **File Size Limits**: Reasonable limits for uploaded images
- **Compression**: Optimize images before API calls
- **Caching**: Cache processed results when appropriate

### API Optimization
- **Request Batching**: Combine related API calls when possible
- **Response Caching**: Cache static or semi-static responses
- **Error Recovery**: Implement retry logic with exponential backoff

### UI Performance
- **Lazy Loading**: Load components and resources as needed
- **Animation Performance**: Use CSS transforms for smooth animations
- **Memory Management**: Proper cleanup of resources and event listeners

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Focus Management**: Clear focus indicators and proper focus handling
- **Keyboard Shortcuts**: Essential functionality accessible via keyboard

### Screen Reader Support
- **Semantic HTML**: Proper use of headings, labels, and ARIA attributes
- **Alt Text**: Descriptive alt text for images and icons
- **Status Updates**: Announce loading states and results to screen readers

### Visual Accessibility
- **Color Contrast**: WCAG AA compliant color combinations
- **Font Sizes**: Scalable text that works with browser zoom
- **Visual Indicators**: Don't rely solely on color for important information

### Motor Accessibility
- **Click Targets**: Minimum 44px touch targets for mobile
- **Hover States**: Clear hover and active states for interactive elements
- **Error Prevention**: Clear validation and confirmation dialogs