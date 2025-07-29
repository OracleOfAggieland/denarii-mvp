# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication with Google Sign-In and Email/Password authentication for your Denarii app.

## Prerequisites

1. A Firebase project
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Node.js and npm installed

## Step 1: Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication in the Firebase console:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Enable "Google" provider
   - Configure OAuth consent screen if prompted

## Step 2: Get Firebase Configuration

1. In the Firebase console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) 
4. Register your app with a nickname (e.g., "Denarii Web")
5. Copy the Firebase configuration object

## Step 3: Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Step 4: Configure Authorized Domains

1. In Firebase Console, go to Authentication > Settings
2. Add your domains to "Authorized domains":
   - `localhost` (for development)
   - Your production domain (e.g., `your-app.web.app`)

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your app - you should see the login screen
3. Try signing in with Google and email/password

## Features Included

### Authentication Components
- **AuthComponent**: FirebaseUI-based authentication with Google and Email/Password
- **LoginPage**: Beautiful login interface
- **ProtectedRoute**: Wrapper to protect authenticated routes
- **UserProfile**: User dropdown with sign-out functionality

### Authentication Context
- **AuthProvider**: React context for managing authentication state
- **useAuth**: Hook to access authentication state throughout the app

### Security Features
- Automatic token refresh
- Protected routes
- Secure sign-out
- Error handling

## Customization

### Styling
Authentication styles are in `src/styles/auth.css`. You can customize:
- Login page appearance
- FirebaseUI button styles
- User profile dropdown
- Loading states

### Configuration
Modify `src/components/AuthComponent.tsx` to:
- Add more authentication providers
- Change sign-in flow (popup vs redirect)
- Customize callbacks
- Add terms of service and privacy policy links

### Additional Providers
To add more providers (Facebook, Twitter, etc.):

1. Enable them in Firebase Console
2. Add to `signInOptions` in `AuthComponent.tsx`:
   ```typescript
   signInOptions: [
     GoogleAuthProvider.PROVIDER_ID,
     EmailAuthProvider.PROVIDER_ID,
     FacebookAuthProvider.PROVIDER_ID, // Add this
     // ... other providers
   ],
   ```

## Troubleshooting

### Common Issues

1. **"Firebase not configured" error**
   - Check that all environment variables are set correctly
   - Ensure `.env.local` is in the project root
   - Restart your development server

2. **Google Sign-In not working**
   - Verify Google provider is enabled in Firebase Console
   - Check authorized domains include your current domain
   - Ensure OAuth consent screen is configured

3. **Email/Password sign-up not working**
   - Verify Email/Password provider is enabled
   - Check if email verification is required in Firebase settings

4. **Styling issues**
   - FirebaseUI CSS is imported automatically
   - Custom styles are in `src/styles/auth.css`
   - Check for CSS conflicts with existing styles

### Development vs Production

- Development: Uses `localhost` domain
- Production: Update authorized domains in Firebase Console
- Environment variables: Use different Firebase projects for dev/prod if needed

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Firebase Rules**: Set up proper Firestore security rules
3. **HTTPS**: Always use HTTPS in production
4. **Token Validation**: Validate Firebase tokens on your backend if needed

## Next Steps

1. Set up Firestore security rules
2. Add user profile management
3. Implement role-based access control
4. Add email verification flow
5. Set up password reset functionality

For more advanced features, refer to the [Firebase Auth documentation](https://firebase.google.com/docs/auth/web/start).