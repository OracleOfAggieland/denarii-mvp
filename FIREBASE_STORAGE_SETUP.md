# Firebase Storage Setup for Media Files

This document explains how to migrate media files from the public folder to Firebase Storage.

## Overview

We've migrated from hosting images in the `public/` folder to using Firebase Storage for better performance and CDN distribution. The media files are now served from:
`https://denarii-mvp-f5aea.firebasestorage.app`

## Files Migrated

- `public/icons8-money-96.png` → Firebase Storage `icons8-money-96.png`
- `public/og-image.png` → Firebase Storage `og-image.png`

## Setup Steps

### 1. Upload Media Files

Run the upload script to move your media files to Firebase Storage:

```bash
npm run upload-media
```

This script will:
- Read files from the `public/` folder
- Upload them to Firebase Storage
- Provide verification URLs

### 2. Deploy Storage Rules

Deploy the security rules to allow public access to media files:

```bash
firebase deploy --only storage
```

### 3. Verify Files Are Accessible

Check that your files are publicly accessible:

- Favicon: https://denarii-mvp-f5aea.firebasestorage.app/o/icons8-money-96.png?alt=media
- OG Image: https://denarii-mvp-f5aea.firebasestorage.app/o/og-image.png?alt=media

## Code Changes

### Firebase Configuration
- Added Firebase Storage to `src/lib/firebase.ts`
- Created `src/lib/storage.ts` for media URL utilities

### Layout Updates
- Updated `src/app/layout.tsx` to use Firebase Storage URLs
- All social media meta tags now point to Firebase Storage

### Security Rules
- Created `storage.rules` with public read access for media files
- Updated `firebase.json` to include storage rules

## Usage

Import media URLs in your components:

```typescript
import { MEDIA_URLS } from '../lib/storage';

// Use predefined URLs
const favicon = MEDIA_URLS.FAVICON;
const ogImage = MEDIA_URLS.OG_IMAGE;

// Or get custom media URLs
import { getMediaUrl } from '../lib/storage';
const customImage = getMediaUrl('my-image.png');
```

## Benefits

1. **CDN Distribution**: Firebase Storage provides global CDN
2. **Better Performance**: Optimized delivery worldwide
3. **Scalability**: No longer limited by hosting provider
4. **Security**: Granular access control with Firebase rules
5. **Reliability**: Google's infrastructure backing

## Troubleshooting

If images don't load:

1. Verify Firebase Storage is enabled in your project
2. Check that storage rules are deployed
3. Ensure files were uploaded successfully
4. Verify the storage bucket URL is correct

## Cleanup

After verifying everything works, you can remove the original files from the `public/` folder:

```bash
# Only do this after confirming Firebase Storage is working
rm public/icons8-money-96.png
rm public/og-image.png
```