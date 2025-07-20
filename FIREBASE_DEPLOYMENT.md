# Firebase Deployment Guide

## Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase project (if not already done):
   ```bash
   firebase init hosting
   ```

## Deployment Commands

### Build and Deploy
```bash
npm run deploy
```

### Deploy Hosting Only
```bash
npm run deploy:hosting
```

### Manual Build and Deploy
```bash
npm run build:firebase
firebase deploy --only hosting
```

## Configuration

- **firebase.json**: Firebase hosting configuration
- **next.config.js**: Next.js static export configuration
- **out/**: Static export output directory (created during build)

## Notes

- The application is configured for static export compatibility with Firebase Hosting
- API routes will not work with static export - consider Firebase Functions for server-side functionality
- Environment variables for production should be configured in Firebase hosting settings