# Denarii - Smart Purchase Decision Assistant

Denarii is an intelligent financial advisor application that helps you make informed purchasing decisions through AI-powered analysis and personalized recommendations.

## 🚀 Features

### 📊 Purchase Analyzer
Comprehensive analysis tool for evaluating potential purchases with:
- **Image Recognition**: Upload photos of products for instant identification (GPT-4 Vision)
- **Cost-Benefit Analysis**: Detailed breakdown of value vs. financial impact
- **Alternative Product Search**: Find cheaper alternatives automatically
- **Decision Matrix**: Multi-factor evaluation including necessity, timing, and affordability
- **Location-Aware Recommendations**: Get local shopping suggestions

### 🤖 Denarii Advisor
Your personal AI financial advisor powered by GPT-4 that provides:
- **Smart Purchase Analysis**: Get detailed insights on any item you're considering buying
- **Voice Conversations**: Real-time voice sessions using OpenAI Realtime API for hands-free financial advice
- **Personalized Recommendations**: Tailored advice based on your complete financial profile
- **Conversation Memory**: Maintains context across all interactions
- **Web-Enhanced Research**: Integrates web search for current pricing and reviews

### 💡 Pro Mode
Advanced analysis feature for complex purchase decisions:
- **Custom Questions**: AI generates specific probing questions based on your purchase
- **Deep Analysis**: Multi-dimensional evaluation beyond basic cost analysis
- **Market Research**: Automated web search for competitive analysis
- **Comprehensive Reports**: Detailed purchase recommendation reports

### 📈 Financial Dashboard
Visual overview of your financial health with:
- **Health Score Widget**: Real-time calculation of financial wellness (0-100 score)
- **Savings Tracker**: Monitor total savings from avoided purchases
- **Purchase Decision Breakdown**: Visual charts of buy vs. don't buy recommendations
- **Expense Analysis**: Monthly expense breakdown by category
- **Recent Activity Feed**: Track your latest purchase decisions

### 👤 Financial Profile
Comprehensive financial assessment including:
- **Income & Expenses**: Detailed monthly budget tracking
- **Debt Management**: Track credit cards, loans, and payment obligations
- **Savings & Investments**: Monitor emergency funds and investment accounts
- **Risk Tolerance**: Personalized risk assessment for recommendations
- **Financial Goals**: Set and track short and long-term objectives
- **Quick Profile Option**: Fast setup with essential information only

## 🎯 How to Use Denarii

### Getting Started
1. **Sign In**: Use Google authentication or create an account
2. **Set Up Profile**: Complete your financial profile (quick or detailed)
3. **Start Analyzing**: Use any of the three main features:
   - Purchase Analyzer for specific items
   - Chat with Denarii Advisor for general advice
   - Pro Mode for complex decisions

### Example Use Cases
- "Should I buy this $200 coffee machine?"
- "Is now a good time to upgrade my phone?"
- "Help me analyze this car purchase"
- "What should I consider before buying a house?"
- "Find me a cheaper alternative to this product"

## 🛠 Technical Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts for data visualization
- **Routing**: React Router DOM v7

### Backend & Services
- **API Routes**: Next.js serverless functions
- **Database**: Firebase Firestore with real-time sync
- **Authentication**: Firebase Auth with Google OAuth
- **Storage**: Firebase Storage for media files
- **AI Integration**: 
  - OpenAI GPT-4.1/GPT-4o for chat and analysis
  - GPT-4 Vision for image recognition
  - OpenAI Realtime API for voice conversations

### Key Features
- **Offline Support**: Local storage fallback when Firebase is unavailable
- **Real-time Updates**: Live data synchronization across devices
- **Operation Caching**: Intelligent request deduplication
- **Error Recovery**: Automatic retry logic with exponential backoff
- **Progressive Enhancement**: Works without JavaScript for core features

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Firebase account
- OpenAI API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/denarii.git
cd denarii
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. Validate configuration:
```bash
npm run check-env
# Auto-fix common issues:
npm run check-env:fix
```

5. Run development server:
```bash
npm run dev
```

## 🧪 Testing

Denarii includes comprehensive test coverage using Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
```

## 🚢 Deployment

### Firebase Deployment

1. Build the application:
```bash
npm run build:firebase
```

2. Deploy to Firebase:
```bash
npm run deploy
```

### Deployment Commands
- `npm run deploy` - Full deployment (build + deploy)
- `npm run deploy:hosting` - Deploy hosting only
- `npm run deploy:apphosting` - Create Firebase App Hosting backend

## 📊 Data Models

### PurchaseHistoryItem
- Purchase decision records with savings tracking
- Alternative products found
- Analysis details and recommendations
- Location and timing information

### FinancialProfileData
- Comprehensive financial situation
- Income, expenses, debts, savings
- Risk tolerance and goals
- Profile completeness tracking

### ChatHistoryData
- Conversation messages with timestamps
- Voice vs text differentiation
- User and assistant roles
- Session metadata

### ProModeAnalysis
- Custom questions and answers
- Multi-dimensional analysis results
- Market research data
- Decision confidence scores

## ♿ Accessibility

Denarii is built with accessibility in mind:
- **WCAG 2.1 AA Compliant**: Meets web accessibility standards
- **Keyboard Navigation**: Full keyboard support for all features
- **Screen Reader Support**: Optimized for NVDA, JAWS, and VoiceOver
- **High Contrast Mode**: Automatic detection and support
- **Voice Interface**: Alternative input method for all users
- **Focus Management**: Proper focus indicators and management
- **ARIA Labels**: Comprehensive labeling for assistive technologies

For detailed accessibility testing procedures, see [manual-accessibility-testing-guide.md](manual-accessibility-testing-guide.md).

## 🔒 Security & Privacy

- **Secure Authentication**: Firebase Auth with industry-standard OAuth
- **Data Encryption**: All data encrypted in transit and at rest
- **No Data Selling**: Your financial information is never sold or shared
- **Local Processing**: Sensitive calculations done client-side when possible
- **Session Management**: Automatic timeout and secure session handling
- **API Key Protection**: Server-side API key management

## 📝 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build production bundle
npm run lint         # Run ESLint

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# Deployment
npm run deploy       # Full Firebase deployment
npm run deploy:hosting # Deploy hosting only

# Utilities
npm run check-env    # Validate environment
npm run check-env:fix # Auto-fix environment issues
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check the [FAQ](docs/FAQ.md)
2. Review [Common Issues](docs/TROUBLESHOOTING.md)
3. Search [existing issues](https://github.com/yourusername/denarii/issues)
4. Create a new issue with detailed information

## 🙏 Acknowledgments

- AWS for cloud infrastructure and services
- The Kiro team for their support and collaboration

---

**Denarii** - Your trusted companion for smart financial decisions. Make every purchase count! 💰