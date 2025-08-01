// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Enhanced sanitization function that handles all types of whitespace
const sanitizeEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  // Remove all types of whitespace, newlines, and control characters
  // This regex matches any whitespace character including \n, \r, \t, spaces, etc.
  let sanitized = value.trim();
  
  // Remove any escaped newlines that might be in the string
  sanitized = sanitized.replace(/\\n/g, '');
  sanitized = sanitized.replace(/\\r/g, '');
  sanitized = sanitized.replace(/\\t/g, '');
  
  // Remove actual newlines, carriage returns, tabs
  sanitized = sanitized.replace(/[\r\n\t]/g, '');
  
  // Remove any Unicode whitespace characters
  sanitized = sanitized.replace(/\s+/g, (match) => {
    // Keep spaces in authDomain and storageBucket as they might have spaces in URLs
    // But remove all other whitespace
    if (match === ' ' && (
      value.includes('.firebaseapp.com') || 
      value.includes('.appspot.com')
    )) {
      return match;
    }
    return '';
  });
  
  // Remove zero-width spaces and other invisible characters
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Log if we found and fixed issues
  if (sanitized !== value) {
    console.warn('Sanitized Firebase config value:', {
      original: JSON.stringify(value),
      sanitized: JSON.stringify(sanitized),
      hadNewlines: /[\r\n]/.test(value),
      hadTabs: /\t/.test(value),
      hadEscapedChars: /\\[nrt]/.test(value)
    });
  }

  return sanitized || undefined;
};

// Special sanitization for project ID
const sanitizeProjectId = (projectId: string | undefined): string | undefined => {
  if (!projectId) return undefined;
  
  // Project IDs can only contain lowercase letters, numbers, and hyphens
  let sanitized = sanitizeEnvVar(projectId);
  if (!sanitized) return undefined;
  
  // Remove any characters that aren't lowercase letters, numbers, or hyphens
  sanitized = sanitized.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  if (sanitized !== projectId) {
    console.warn('Project ID sanitized:', {
      original: JSON.stringify(projectId),
      sanitized: JSON.stringify(sanitized)
    });
  }
  
  return sanitized;
};

// Check if Firebase environment variables are configured
const isFirebaseConfigured = () => {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingVars = requiredVars.filter(varName => {
    const value = sanitizeEnvVar(process.env[varName]);
    return !value;
  });

  if (missingVars.length > 0) {
    console.error('Missing Firebase configuration:', missingVars);
    return false;
  }

  return true;
};

// Firebase configuration with enhanced sanitization
const firebaseConfig = {
  apiKey: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || 'demo-api-key',
  authDomain: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || 'demo-project.firebaseapp.com',
  projectId: sanitizeProjectId(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || 'demo-project',
  storageBucket: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || 'demo-project.appspot.com',
  messagingSenderId: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || '123456789',
  appId: sanitizeEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || '1:123456789:web:abcdef123456',
};

// Validate the configuration before using it
const validateConfig = (config: typeof firebaseConfig): boolean => {
  // Check project ID format
  if (config.projectId && !/^[a-z0-9-]+$/.test(config.projectId)) {
    console.error('Invalid project ID format:', config.projectId);
    console.error('Project ID can only contain lowercase letters, numbers, and hyphens');
    return false;
  }

  // Check for any remaining whitespace
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && /[\r\n\t]/.test(value)) {
      console.error(`Firebase config ${key} still contains whitespace:`, JSON.stringify(value));
      return false;
    }
  }

  return true;
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
      // Validate configuration before initializing
      if (!validateConfig(firebaseConfig)) {
        console.error('Firebase configuration validation failed');
        console.error('Please check your environment variables for hidden characters');
        throw new Error('Invalid Firebase configuration');
      }

      console.log('Initializing Firebase with config:', {
        ...firebaseConfig,
        apiKey: '[REDACTED]',
        projectId: firebaseConfig.projectId
      });

      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);

      // Enable offline persistence
      if (db) {
        // Check if we're in development and should use emulator
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
          try {
            connectFirestoreEmulator(db, 'localhost', 8080);
            console.log('Connected to Firestore emulator');
          } catch (error) {
            // Emulator might already be connected
            console.log('Firestore emulator connection skipped (may already be connected)');
          }
        }
      }

      console.log('Firebase initialized successfully');
      console.log('Auth instance:', !!auth);
      console.log('Firestore instance:', !!db);
      console.log('Project ID:', firebaseConfig.projectId);
      
      // Test Firestore connection
      if (db) {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          const testDoc = doc(db!, '_test_', '_connection_');
          getDoc(testDoc)
            .then(() => console.log('Firestore connection test successful'))
            .catch((error) => {
              if (error.code === 'permission-denied') {
                console.log('Firestore connection works but test document access denied (expected)');
              } else {
                console.error('Firestore connection test failed:', error);
              }
            });
        });
      }
    } else if (getApps().length > 0) {
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      console.log('Using existing Firebase app');
    } else {
      console.warn('Firebase not configured - authentication will be unavailable');
      console.log('Configuration status:', {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
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

export { auth, db, storage, isFirebaseConfigured, sanitizeProjectId };
export default app;