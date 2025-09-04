# AI Codebase Reference: Denarii MVP

## 1. Project Overview
- **Application Name:** Denarii
- **Primary Goal:** A smart purchase decision assistant that provides AI-powered analysis and personalized financial recommendations.
- **Core Technologies:** Next.js 14 (App Router), React 18, Firebase (Auth, Firestore, Storage), Tailwind CSS, OpenAI API (GPT-4.1/GPT-4o).
- **Key Features:**
    - Purchase Analyzer with image recognition (GPT-4 Vision)
    - AI-driven financial advisor (Denarii Advisor) with personality-driven responses
    - User financial profiles for personalization
    - Real-time voice interaction with OpenAI Realtime API
    - Pro Mode for detailed purchase analysis with custom questions
    - Dashboard with financial health metrics and widgets

## 2. File and Directory Architecture

### `/src` - Main Source Directory
The primary source code directory containing all application logic, organized by feature and responsibility.

### `/src/app` - Next.js App Router Structure
- **Purpose:** Contains page components and API routes using Next.js 14 App Router pattern
- **Key Files:**
  - `layout.tsx` - Root layout wrapper with AuthProvider and VoiceProvider
  - `page.tsx` - Main application entry point rendering the App component
  - `[...slug]/page.tsx` - Dynamic route handler for all app pages

### `/src/app/api` - Backend API Routes
- **Purpose:** Serverless API endpoints for external service integration
- **Key Directories:**
  - `chat/route.ts` - Main OpenAI integration endpoint for chat and purchase analysis
  - `realtime/token/route.ts` - Generates ephemeral tokens for OpenAI Realtime API

### `/src/components` - React Components
- **Purpose:** Reusable UI components organized by feature
- **Key Subdirectories:**
  - `Dashboard/` - Financial dashboard widgets (HealthScore, ExpenseBreakdown, RecentActivity)
  - Component files use mix of `.js` and `.tsx` extensions

### `/src/contexts` - React Context Providers
- **Purpose:** Global state management using React Context API
- **Key Files:**
  - `AuthContext.tsx` - Firebase authentication state management
  - `VoiceContext.tsx` - Real-time voice session management

### `/src/hooks` - Custom React Hooks
- **Purpose:** Encapsulated business logic and data fetching
- **Key Files:**
  - `useFirestore.ts` - Primary data operations hook
  - `useRealtimeSession.ts` - WebRTC voice session management
  - `useChatApi.ts` - Chat API interaction wrapper

### `/src/lib` - Utility Libraries
- **Purpose:** Core utilities, configurations, and services
- **Key Subdirectories:**
  - `firestore/` - Database operations, connection management, collections
  - Files include Firebase config, OpenAI utilities, location services

### `/src/styles` - Stylesheets
- **Purpose:** CSS modules and global styles
- Mix of CSS modules for component-specific styles and global CSS files

### `/src/types` - TypeScript Definitions
- **Purpose:** Type definitions for type safety
- Includes chat interfaces, error types, and data models

### `/scripts` - Build and Utility Scripts
- **Purpose:** Development and deployment utilities
- **Key File:**
  - `check-env.js` - Environment variable validation with auto-fix capability

### `/public` - Static Assets
- **Purpose:** Public static files served directly
- Contains images, icons, and other static resources

## 3. Core Logic and State Management (`/src/hooks` & `/src/contexts`)

### `useFirestore.ts` (Primary Data Hook)
- **Role:** Central hub for all Firestore database operations
- **Key Functions:**
  - `savePurchase()` - Persists purchase analysis results
  - `saveProfile()` - Stores user financial profile data
  - `saveChat()` - Maintains conversation history
  - `saveProAnalysis()` - Stores Pro Mode detailed analyses
  - `subscribeToProfile()` - Real-time profile updates
  - `subscribeToPurchaseHistory()` - Live purchase history sync
  - `clearAllData()` - Data cleanup functionality
- **Features:**
  - Automatic user document creation on authentication
  - Operation caching via `operationManager` for performance
  - Fallback to localStorage when Firestore unavailable
  - Real-time listeners with automatic cache invalidation

### `useAuth.ts` (via AuthContext)
- **Role:** Authentication state management with Firebase Auth
- **Key Features:**
  - User session persistence across page refreshes
  - Automatic user document creation in Firestore on login
  - Firebase initialization error handling with retry logic
  - Sign-out functionality with cleanup
- **State Variables:**
  - `user` - Current authenticated user object
  - `loading` - Authentication state loading indicator
  - `isFirebaseReady` - Firebase service availability

### `useRealtimeSession.ts`
- **Role:** WebRTC-based voice conversation management
- **Key Functions:**
  - `startSession()` - Initiates voice connection with OpenAI
  - `stopSession()` - Cleanly terminates voice session
  - `sendClientEvent()` - Sends messages through data channel
  - `handleFunctionCall()` - Processes AI function invocations
- **Features:**
  - Automatic microphone permission handling
  - Real-time transcription display
  - Function calling support (navigation hints, financial tips)
  - Cleanup on component unmount and page navigation

### State Management Strategy
- **React Context Pattern:** Global state via AuthContext and VoiceContext
- **Local State:** Component-level state for UI interactions
- **Data Persistence:** Firestore for authenticated users, localStorage fallback
- **Real-time Sync:** Firestore listeners for live data updates
- **Cache Management:** `operationManager` for request deduplication

## 4. Key Components (`/src/components`)

### `PurchaseAdvisor.js` - Main Purchase Analysis Component
- **Function:** Core purchase decision analysis interface
- **Primary State:**
  - `formState` - Item details (name, cost, purpose, frequency)
  - `uiState` - Loading states and modal visibility
  - `financialProfile` - User's financial information
  - `messages` - Analysis results and recommendations
- **Key Interactions:**
  - Image upload and OCR via GPT-4 Vision
  - Alternative product search integration
  - Financial profile creation/update flow
  - Purchase history persistence
  - Location-aware recommendations

### `ChatInterface.tsx` - AI Chat Component
- **Function:** Conversational interface with Denarii Advisor
- **Primary State:**
  - `messages` - Conversation history
  - `isLoading` - Message sending state
  - `financialProfile` - User context for personalization
  - Voice session state from VoiceContext
- **Key Interactions:**
  - Real-time voice conversation support
  - Message persistence to Firestore/localStorage
  - Auto-start voice for new users
  - Navigation prompts for purchase analysis
  - Financial profile integration

### `FinancialProfile.js` - User Financial Data Form
- **Function:** Comprehensive financial information capture
- **Primary State:**
  - Income and expense categories
  - Debt obligations
  - Savings and investment details
  - Risk tolerance and financial goals
- **Key Interactions:**
  - Progressive disclosure for easy onboarding
  - Quick profile option for faster setup
  - Real-time financial health score calculation
  - Firestore persistence with localStorage fallback

### `ProMode.js` - Advanced Analysis Feature
- **Function:** Deep-dive purchase analysis with AI-generated questions
- **Primary State:**
  - `customQuestions` - Dynamically generated probing questions
  - `answers` - User responses to questions
  - `analysis` - Detailed purchase recommendation
- **Key Interactions:**
  - Context-aware question generation
  - Multi-dimensional purchase evaluation
  - Web search integration for market research
  - Comprehensive analysis report generation

### `Dashboard.js` - Financial Health Dashboard
- **Function:** Visual overview of user's financial status
- **Primary State:**
  - Purchase history data
  - Financial profile metrics
  - Savings tracking
- **Key Interactions:**
  - Real-time data synchronization
  - Interactive widgets (HealthScore, ExpenseBreakdown)
  - Navigation to detailed views
  - Responsive grid layout

## 5. Backend and API Integration (`/src/app/api` & `/src/lib`)

### `api/chat/route.ts` - Primary OpenAI Endpoint
- **Role:** Central API route for all AI interactions
- **Request Structure:**
  ```typescript
  {
    message: string,
    image?: string,  // Base64 encoded
    conversationHistory?: Message[],
    useWebSearch?: boolean
  }
  ```
- **Response Types:**
  - Chat responses with Denarii Advisor personality
  - Purchase recommendations with decision matrices
  - Pro Mode custom questions
  - Web-enhanced research results
- **Features:**
  - Environment validation and logging
  - Multiple model support (GPT-4.1, GPT-4o)
  - Image analysis capability
  - Truncated JSON recovery
  - Web search integration

### `lib/openaiAPI.js` - OpenAI Integration Utilities
- **Functions:**
  - `analyzeImageWithOpenAI()` - Product identification from images
  - `findCheaperAlternative()` - Alternative product search
  - `getEnhancedPurchaseRecommendation()` - Comprehensive analysis
- **Features:**
  - Location-aware recommendations
  - Financial profile integration
  - Structured response formatting
  - Error handling and retries

### `lib/firestore/services.ts` - Database Operations
- **Key Functions:**
  - `createUserDocument()` - User initialization
  - `savePurchaseHistory()` - Purchase record persistence
  - `saveFinancialProfile()` - Profile updates
  - `saveChatHistory()` - Conversation storage
  - `saveProModeAnalysis()` - Detailed analysis storage
- **Features:**
  - Serverless timestamp handling
  - Operation queuing via operationManager
  - Type-safe data models
  - Automatic retry logic

### `lib/firestore/connectionManager.ts`
- **Role:** Firestore connectivity and offline handling
- **Features:**
  - Connection state monitoring
  - Offline persistence configuration
  - Reconnection strategies
  - Error recovery

## 6. Dependencies and Configuration

### `package.json` - Key Dependencies
**Core Framework:**
- `next: ^14.2.30` - React framework with App Router
- `react: ^18.3.1` - UI library
- `typescript: ^5.8.3` - Type safety

**Firebase Services:**
- `firebase: ^10.0.0` - Backend services (Auth, Firestore, Storage)
- `firebaseui: ^6.1.0` - Pre-built auth UI components

**AI Integration:**
- `openai: ^5.10.1` - OpenAI API client for GPT models

**UI/Styling:**
- `tailwindcss: ^4.1.11` - Utility-first CSS framework
- `recharts: ^3.1.0` - Data visualization for dashboard

**Routing:**
- `react-router-dom: ^7.7.0` - Client-side routing

### `next.config.js` - Next.js Configuration
- **Output:** Standalone build for Firebase App Hosting
- **Webpack Alias:** `@/` maps to `src/` directory
- **Environment Variables:** Firebase config exposed to client
- **Build Optimization:** Production-ready configuration

### `.env.example` - Required Environment Variables
**OpenAI Configuration:**
- `OPENAI_API_KEY` - GPT model access
- `GOOGLE_API_KEY` - Optional Gemini integration

**Firebase Configuration:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Optional Settings:**
- `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` - Local development
- `NODE_ENV` - Environment specification

## 7. Action and Command Reference

### Development Commands
- `npm run dev` - Start development server with environment validation
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint for code quality
- `npm run check-env` - Validate Firebase configuration
- `npm run check-env:fix` - Auto-fix environment issues

### Deployment Commands
- `npm run deploy` - Full Firebase deployment (build + deploy)
- `npm run deploy:hosting` - Deploy only hosting files
- `npm run deploy:apphosting` - Create Firebase App Hosting backend

### Data Models Reference
**PurchaseHistoryItem:**
- Purchase decision records with savings tracking
- Includes alternative products found
- Analysis details and recommendations

**FinancialProfileData:**
- Comprehensive financial situation
- Income, expenses, debts, savings
- Risk tolerance and goals

**ChatHistoryData:**
- Conversation messages with timestamps
- Voice vs text message differentiation
- User and assistant roles

**ProModeAnalysis:**
- Custom questions and answers
- Detailed multi-dimensional analysis
- Market research integration