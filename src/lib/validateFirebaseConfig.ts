// Validate Firebase configuration and detect common issues

export const validateFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  const issues: string[] = [];

  // Check for missing values
  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      issues.push(`Missing ${key}`);
    }
  });

  // Check for whitespace/newline issues
  Object.entries(config).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      if (value !== value.trim()) {
        issues.push(`${key} has leading/trailing whitespace`);
      }
      if (/[\r\n]/.test(value)) {
        issues.push(`${key} contains newline characters`);
      }
      if (/\s/.test(value) && key !== 'authDomain' && key !== 'storageBucket') {
        issues.push(`${key} contains unexpected spaces`);
      }
    }
  });

  // Check project ID format
  if (config.projectId) {
    if (!/^[a-z0-9-]+$/.test(config.projectId)) {
      issues.push('Project ID contains invalid characters (should only contain lowercase letters, numbers, and hyphens)');
    }
  }

  // Log results
  if (issues.length > 0) {
    console.error('Firebase configuration issues detected:', issues);
    console.log('Raw config values:', Object.entries(config).reduce((acc, [key, value]) => {
      acc[key] = JSON.stringify(value);
      return acc;
    }, {} as Record<string, string>));
  } else {
    console.log('Firebase configuration validation passed');
  }

  return {
    isValid: issues.length === 0,
    issues,
    config
  };
};

// Auto-validate on import
if (typeof window !== 'undefined') {
  validateFirebaseConfig();
}