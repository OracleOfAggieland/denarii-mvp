import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp
  } from 'firebase/firestore';
  import { db } from '@/lib/firebase';
  import { User } from 'firebase/auth';
  import { connectionManager } from './connectionManager';
  import {
    COLLECTIONS,
    UserData,
    PurchaseHistoryItem,
    FinancialProfileData,
    ChatHistoryData,
    ProModeAnalysis
  } from './collections';
  
  // User Services
  export const createUserDocument = async (user: User): Promise<void> => {
    if (!db || !user) return;
  
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await getDoc(userRef);
  
    if (!userDoc.exists()) {
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        lastUpdated: new Date()
      };
  
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    }
  };
  
  // Purchase History Services
  export const savePurchaseHistory = async (
    userId: string,
    purchaseData: Omit<PurchaseHistoryItem, 'userId' | 'createdAt'>
  ): Promise<void> => {
    if (!db) {
      console.error('Cannot save purchase history: Firestore database not initialized');
      throw new Error('Firestore database not initialized');
    }
    
    if (!userId) {
      console.error('Cannot save purchase history: userId is required');
      throw new Error('userId is required');
    }

    // Ensure connection before attempting to save
    console.log('Checking Firestore connection...');
    const isConnected = await connectionManager.ensureConnection();
    if (!isConnected) {
      throw new Error('Unable to establish Firestore connection');
    }
    console.log('Firestore connection confirmed');
  
    // Validate and sanitize the date
    let dateToSave: Date;
    try {
      dateToSave = purchaseData.date instanceof Date ? purchaseData.date : new Date(purchaseData.date);
      if (isNaN(dateToSave.getTime())) {
        dateToSave = new Date(); // Fallback to current date
      }
    } catch {
      dateToSave = new Date(); // Fallback to current date
    }
  
    const documentData = {
      ...purchaseData,
      userId: userId.trim(), // Ensure no whitespace
      date: Timestamp.fromDate(dateToSave),
      createdAt: serverTimestamp()
    };
    
    console.log('Saving purchase history document with userId:', userId);
    console.log('Document data:', documentData);
    
    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Save attempt ${attempt}/${maxRetries}`);
        const purchaseHistoryRef = collection(db, COLLECTIONS.PURCHASE_HISTORY);
        
        // Add timeout to the operation
        const savePromise = addDoc(purchaseHistoryRef, documentData);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Save operation timed out after 15 seconds')), 15000);
        });
        
        const docRef = await Promise.race([savePromise, timeoutPromise]) as any;
        console.log('Purchase history document saved successfully with ID:', docRef.id);
        return; // Success, exit retry loop
        
      } catch (error: any) {
        lastError = error;
        console.error(`Save attempt ${attempt} failed:`, error);
        
        // Add more specific error information
        if (error?.code) {
          console.error('Firestore error code:', error.code);
        }
        if (error?.message) {
          console.error('Firestore error message:', error.message);
        }
        
        // Check if it's a retryable error
        const isRetryableError = error?.code === 'unavailable' || 
                                error?.code === 'deadline-exceeded' ||
                                error?.message?.includes('transport') ||
                                error?.message?.includes('network') ||
                                error?.message?.includes('connection') ||
                                error?.message?.includes('timeout');
        
        if (attempt < maxRetries && isRetryableError) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`Retrying save in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Try to re-establish connection
          await connectionManager.forceReconnect();
          continue;
        }
        
        // If not retryable or max retries reached, break
        break;
      }
    }
    
    // All retries failed
    console.error('All save attempts failed');
    throw lastError;
  };
  
  export const getUserPurchaseHistory = async (
    userId: string,
    limitCount: number = 50
  ): Promise<PurchaseHistoryItem[]> => {
    if (!db || !userId) return [];
  
    const purchaseHistoryRef = collection(db, COLLECTIONS.PURCHASE_HISTORY);
    const q = query(
      purchaseHistoryRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
  
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      date: doc.data().date.toDate()
    } as PurchaseHistoryItem));
  };
  
  // Financial Profile Services
  export const saveFinancialProfile = async (
    userId: string,
    profileData: Omit<FinancialProfileData, 'userId' | 'lastUpdated'>
  ): Promise<void> => {
    if (!db || !userId) return;

    // Ensure connection before attempting to save
    console.log('Checking Firestore connection for profile save...');
    const isConnected = await connectionManager.ensureConnection();
    if (!isConnected) {
      throw new Error('Unable to establish Firestore connection for profile save');
    }
    console.log('Firestore connection confirmed for profile save');
  
    const profileRef = doc(db, COLLECTIONS.FINANCIAL_PROFILES, userId);
    
    const documentData = {
      ...profileData,
      userId,
      lastUpdated: serverTimestamp()
    };
    
    // Add timeout to the operation
    const savePromise = setDoc(profileRef, documentData);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile save operation timed out after 15 seconds')), 15000);
    });
    
    await Promise.race([savePromise, timeoutPromise]);
    console.log('Financial profile saved successfully for user:', userId);
  };
  
  export const getFinancialProfile = async (
    userId: string
  ): Promise<FinancialProfileData | null> => {
    if (!db || !userId) return null;

    // Ensure connection before attempting to read
    console.log('Checking Firestore connection for profile read...');
    const isConnected = await connectionManager.ensureConnection();
    if (!isConnected) {
      throw new Error('Unable to establish Firestore connection for profile read');
    }
    console.log('Firestore connection confirmed for profile read');
  
    const profileRef = doc(db, COLLECTIONS.FINANCIAL_PROFILES, userId);
    
    // Add timeout to the operation
    const readPromise = getDoc(profileRef);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile read operation timed out after 10 seconds')), 10000);
    });
    
    const profileDoc = await Promise.race([readPromise, timeoutPromise]) as any;
  
    if (!profileDoc.exists()) {
      console.log('No financial profile found for user:', userId);
      return null;
    }
  
    console.log('Financial profile loaded successfully for user:', userId);
    return {
      ...profileDoc.data(),
      lastUpdated: profileDoc.data().lastUpdated?.toDate()
    } as FinancialProfileData;
  };
  
  // Chat History Services
  export const saveChatHistory = async (
    userId: string,
    messages: ChatHistoryData['messages']
  ): Promise<void> => {
    if (!db || !userId) return;
  
    const chatRef = doc(db, COLLECTIONS.CHAT_HISTORY, userId);
    await setDoc(chatRef, {
      userId,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp)
      })),
      lastUpdated: serverTimestamp()
    });
  };
  
  export const getChatHistory = async (
    userId: string
  ): Promise<ChatHistoryData | null> => {
    if (!db || !userId) return null;
  
    const chatRef = doc(db, COLLECTIONS.CHAT_HISTORY, userId);
    const chatDoc = await getDoc(chatRef);
  
    if (!chatDoc.exists()) return null;
  
    const data = chatDoc.data();
    return {
      ...data,
      messages: data.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp.toDate()
      })),
      lastUpdated: data.lastUpdated?.toDate()
    } as ChatHistoryData;
  };
  
  // Pro Mode Analysis Services
  export const saveProModeAnalysis = async (
    userId: string,
    analysisData: Omit<ProModeAnalysis, 'userId' | 'createdAt'>
  ): Promise<void> => {
    if (!db || !userId) return;
  
    const proModeRef = collection(db, COLLECTIONS.PRO_MODE_ANALYSES);
    await addDoc(proModeRef, {
      ...analysisData,
      userId,
      createdAt: serverTimestamp()
    });
  };
  
  export const getUserProModeAnalyses = async (
    userId: string,
    limitCount: number = 10
  ): Promise<ProModeAnalysis[]> => {
    if (!db || !userId) return [];
  
    const proModeRef = collection(db, COLLECTIONS.PRO_MODE_ANALYSES);
    const q = query(
      proModeRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as ProModeAnalysis));
  };