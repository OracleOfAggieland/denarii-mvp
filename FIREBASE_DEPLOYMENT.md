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
- **apphosting.yaml**: Firebase App Hosting environment configuration
- **next.config.js**: Next.js configuration
- **.env.local**: Local development environment variables (not committed)

## Environment Variables

### Local Development
1. Copy `.env.local.example` to `.env.local`
2. Fill in your actual API keys and Firebase configuration

### Production (Firebase App Hosting)
Environment variables are managed as Firebase secrets:
- Use `firebase apphosting:secrets:set VARIABLE_NAME` to set secrets
- Reference secrets in `apphosting.yaml` using `secret: SECRET_NAME`

## Security Notes

- All sensitive values are stored as Firebase secrets, not in the repository
- `.env.local` is gitignored and should never be committed
- Firebase client configuration is safe to expose but managed as secrets for consistency
- All App Hosting backends have been granted access to the required secrets