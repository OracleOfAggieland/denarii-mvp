import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import './validateFirebaseConfig';

// Sanitize environment variables to remove whitespace and newlines
const sanitizeEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  // Remove all types of whitespace and newlines
  const sanitized = value.trim().replace(/[\r\n\t\s]/g, '');

  // Log if we found problematic characters
  if (sanitized !== value.trim()) {
    console.warn('Found and removed whitespace/newlines from environment variable:', {
      original: JSON.stringify(value),
      sanitized: JSON.stringify(sanitized)
    });
  }

  return sanitized || undefined;
};

// Check if Firebase environment variables are configured
const isFirebaseConfigured = () => {
  return !!(
    sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
    sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) &&
    sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
    sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) &&
    sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) &&
    sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
  );
};

// Firebase configuration
const firebaseConfig = {
  apiKey: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || 'demo-api-key',
  authDomain: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || 'demo-project.firebaseapp.com',
  projectId: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || 'demo-project',
  storageBucket: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || 'demo-project.appspot.com',
  messagingSenderId: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || '123456789',
  appId: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || '1:123456789:web:abcdef123456',
};

// Initialize Firebase only if not already initialized
let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;
let storage: FirebaseStorage | undefined = undefined;

if (typeof window !== 'undefined') {
  // Only initialize on client side
  try {
    if (!getApps().length && isFirebaseConfigured()) {
      console.log('Initializing Firebase with config:', {
        ...firebaseConfig,
        apiKey: firebaseConfig.apiKey ? '[REDACTED]' : 'MISSING',
        projectId: firebaseConfig.projectId
      });

      // Validate project ID doesn't contain invalid characters
      if (firebaseConfig.projectId && /[\r\n\t]/.test(firebaseConfig.projectId)) {
        console.error('Project ID contains invalid characters:', JSON.stringify(firebaseConfig.projectId));
        throw new Error('Invalid project ID format');
      }

      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);

      // Test Firestore connection
      console.log('Testing Firestore connection...');

      // Note: Firestore v9+ automatically handles offline persistence
      // No explicit enableIndexedDbPersistence() call needed

      console.log('Firebase initialized successfully');
      console.log('Auth instance:', !!auth);
      console.log('Firestore instance:', !!db);
      console.log('Project ID being used:', firebaseConfig.projectId);
    } else if (getApps().length > 0) {
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      console.log('Using existing Firebase app');
      console.log('Auth instance:', !!auth);
      console.log('Firestore instance:', !!db);
    } else {
      console.warn('Firebase not configured - authentication will be unavailable');
      console.log('Firebase configuration check:', {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      });
      console.log('Raw environment variables:', {
        projectId: JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
        authDomain: JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
      });
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      config: {
        ...firebaseConfig,
        apiKey: '[REDACTED]'
      }
    });
    // Reset to undefined on error
    app = undefined;
    auth = undefined;
    db = undefined;
    storage = undefined;
  }
}

export { auth, db, storage, isFirebaseConfigured };
export default app;