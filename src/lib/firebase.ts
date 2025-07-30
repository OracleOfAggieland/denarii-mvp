import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Sanitize environment variables to remove whitespace and newlines
const sanitizeEnvVar = (value: string | undefined): string | undefined => {
  return value?.trim().replace(/[\r\n]/g, '') || undefined;
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

if (typeof window !== 'undefined') {
  // Only initialize on client side
  try {
    if (!getApps().length && isFirebaseConfigured()) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      
      // Note: Firestore v9+ automatically handles offline persistence
      // No explicit enableIndexedDbPersistence() call needed
      
      console.log('Firebase initialized successfully');
    } else if (getApps().length > 0) {
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
      console.log('Using existing Firebase app');
    } else {
      console.warn('Firebase not configured - authentication will be unavailable');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Reset to undefined on error
    app = undefined;
    auth = undefined;
    db = undefined;
  }
}

export { auth, db, isFirebaseConfigured };
export default app;