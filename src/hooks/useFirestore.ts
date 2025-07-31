import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  savePurchaseHistory,
  getUserPurchaseHistory,
  saveFinancialProfile,
  getFinancialProfile,
  saveChatHistory,
  getChatHistory,
  saveProModeAnalysis,
  getUserProModeAnalyses,
  createUserDocument
} from '@/lib/firestore/services';
import {
  COLLECTIONS,
  PurchaseHistoryItem,
  FinancialProfileData,
  ChatHistoryData,
  ProModeAnalysis
} from '@/lib/firestore/collections';

export const useFirestore = () => {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create user document on auth
  useEffect(() => {
    if (user) {
      createUserDocument(user).catch(console.error);
    }
  }, [user]);

  // Purchase History
  const savePurchase = useCallback(async (purchaseData: Omit<PurchaseHistoryItem, 'userId' | 'createdAt'>) => {
    if (!user) {
      console.error('Cannot save purchase: user not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('Saving purchase for user:', user.uid, 'Purchase data:', purchaseData);
    setIsLoading(true);
    setError(null);
    
    // Add retry logic for network issues
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to save purchase history`);
        await savePurchaseHistory(user.uid, purchaseData);
        console.log('Purchase saved successfully to Firestore');
        return; // Success, exit retry loop
      } catch (err: any) {
        lastError = err;
        console.error(`Attempt ${attempt} failed:`, err);
        
        // Check if it's a network/connection error that might be retryable
        const isRetryableError = err?.code === 'unavailable' || 
                                err?.code === 'deadline-exceeded' ||
                                err?.message?.includes('transport') ||
                                err?.message?.includes('network') ||
                                err?.message?.includes('connection');
        
        if (attempt < maxRetries && isRetryableError) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If not retryable or max retries reached, break
        break;
      }
    }
    
    // All retries failed
    const errorMessage = 'Failed to save purchase history after multiple attempts';
    setError(errorMessage);
    console.error('Error saving purchase to Firestore after retries:', lastError);
    throw lastError; // Re-throw to allow component to handle fallback
  }, [user]);

  // Get all purchase history (no limit)
  const getAllPurchaseHistory = useCallback(async (): Promise<PurchaseHistoryItem[]> => {
    if (!user || !db) return [];
    setIsLoading(true);
    setError(null);
    try {
      const purchaseHistoryRef = collection(db, COLLECTIONS.PURCHASE_HISTORY);
      const q = query(
        purchaseHistoryRef,
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate()
      } as unknown as PurchaseHistoryItem));
    } catch (err) {
      setError('Failed to load all purchase history');
      console.error(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Enhanced getPurchaseHistory with optional limit parameter
  const getPurchaseHistory = useCallback(async (limitCount?: number): Promise<PurchaseHistoryItem[]> => {
    if (!user || !db) return [];
    setIsLoading(true);
    setError(null);
    
    // Add retry logic for network issues
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to load purchase history`);
        const purchaseHistoryRef = collection(db, COLLECTIONS.PURCHASE_HISTORY);
        let q = query(
          purchaseHistoryRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );

        if (limitCount) {
          q = query(q, limit(limitCount));
        }

        const snapshot = await getDocs(q);
        const purchases = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          date: doc.data().date.toDate()
        } as unknown as PurchaseHistoryItem));
        
        console.log('Purchase history loaded successfully:', purchases.length, 'items');
        return purchases;
      } catch (err: any) {
        lastError = err;
        console.error(`Purchase history load attempt ${attempt} failed:`, err);
        
        // Check if it's a network/connection error that might be retryable
        const isRetryableError = err?.code === 'unavailable' || 
                                err?.code === 'deadline-exceeded' ||
                                err?.message?.includes('transport') ||
                                err?.message?.includes('network') ||
                                err?.message?.includes('connection');
        
        if (attempt < maxRetries && isRetryableError) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`Retrying purchase history load in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If not retryable or max retries reached, break
        break;
      }
    }
    
    // All retries failed
    const errorMessage = 'Failed to load purchase history after multiple attempts';
    setError(errorMessage);
    console.error('Error loading purchase history after retries:', lastError);
    return [];
  }, [user]);

  // Financial Profile
  const saveProfile = useCallback(async (profileData: Omit<FinancialProfileData, 'userId' | 'lastUpdated'>) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    
    // Add retry logic for network issues
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to save financial profile`);
        await saveFinancialProfile(user.uid, profileData);
        console.log('Financial profile saved successfully');
        return; // Success, exit retry loop
      } catch (err: any) {
        lastError = err;
        console.error(`Profile save attempt ${attempt} failed:`, err);
        
        // Check if it's a network/connection error that might be retryable
        const isRetryableError = err?.code === 'unavailable' || 
                                err?.code === 'deadline-exceeded' ||
                                err?.message?.includes('transport') ||
                                err?.message?.includes('network') ||
                                err?.message?.includes('connection');
        
        if (attempt < maxRetries && isRetryableError) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`Retrying profile save in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If not retryable or max retries reached, break
        break;
      }
    }
    
    // All retries failed
    const errorMessage = 'Failed to save financial profile after multiple attempts';
    setError(errorMessage);
    console.error('Error saving profile after retries:', lastError);
    throw lastError;
  }, [user]);

  const getProfile = useCallback(async (): Promise<FinancialProfileData | null> => {
    if (!user) return null;
    setIsLoading(true);
    setError(null);
    
    // Add retry logic for network issues
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to load financial profile`);
        const profile = await getFinancialProfile(user.uid);
        console.log('Financial profile loaded successfully:', !!profile);
        return profile;
      } catch (err: any) {
        lastError = err;
        console.error(`Profile load attempt ${attempt} failed:`, err);
        
        // Check if it's a network/connection error that might be retryable
        const isRetryableError = err?.code === 'unavailable' || 
                                err?.code === 'deadline-exceeded' ||
                                err?.message?.includes('transport') ||
                                err?.message?.includes('network') ||
                                err?.message?.includes('connection');
        
        if (attempt < maxRetries && isRetryableError) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`Retrying profile load in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If not retryable or max retries reached, break
        break;
      }
    }
    
    // All retries failed
    const errorMessage = 'Failed to load financial profile after multiple attempts';
    setError(errorMessage);
    console.error('Error loading profile after retries:', lastError);
    return null;
  }, [user]);

  // Chat History
  const saveChat = useCallback(async (messages: ChatHistoryData['messages']) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      await saveChatHistory(user.uid, messages);
    } catch (err) {
      setError('Failed to save chat history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getChat = useCallback(async (): Promise<ChatHistoryData | null> => {
    if (!user) return null;
    setIsLoading(true);
    setError(null);
    try {
      return await getChatHistory(user.uid);
    } catch (err) {
      setError('Failed to load chat history');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Pro Mode Analysis
  const saveProAnalysis = useCallback(async (analysisData: Omit<ProModeAnalysis, 'userId' | 'createdAt'>) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      await saveProModeAnalysis(user.uid, analysisData);
    } catch (err) {
      setError('Failed to save pro mode analysis');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getProAnalyses = useCallback(async (): Promise<ProModeAnalysis[]> => {
    if (!user) return [];
    setIsLoading(true);
    setError(null);
    try {
      return await getUserProModeAnalyses(user.uid);
    } catch (err) {
      setError('Failed to load pro mode analyses');
      console.error(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Real-time listeners
  const subscribeToProfile = useCallback((callback: (profile: FinancialProfileData | null) => void): Unsubscribe | null => {
    if (!user || !db) return null;

    const profileRef = doc(db, COLLECTIONS.FINANCIAL_PROFILES, user.uid);
    return onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          ...data,
          lastUpdated: data.lastUpdated?.toDate()
        } as FinancialProfileData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to profile changes:', error);
      setError('Failed to sync profile data');
    });
  }, [user]);

  const subscribeToPurchaseHistory = useCallback((callback: (purchases: PurchaseHistoryItem[]) => void, limitCount: number = 50): Unsubscribe | null => {
    if (!user || !db) return null;

    const purchaseHistoryRef = collection(db, COLLECTIONS.PURCHASE_HISTORY);
    const q = query(
      purchaseHistoryRef,
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const purchases = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate()
      } as unknown as PurchaseHistoryItem));
      callback(purchases);
    }, (error) => {
      console.error('Error listening to purchase history changes:', error);
      setError('Failed to sync purchase history');
    });
  }, [user]);

  const subscribeToChatHistory = useCallback((callback: (chat: ChatHistoryData | null) => void): Unsubscribe | null => {
    if (!user || !db) return null;

    const chatRef = doc(db, COLLECTIONS.CHAT_HISTORY, user.uid);
    return onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          ...data,
          messages: data.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp.toDate()
          })),
          lastUpdated: data.lastUpdated?.toDate()
        } as ChatHistoryData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to chat history changes:', error);
      setError('Failed to sync chat history');
    });
  }, [user]);

  return {
    isLoading,
    error,
    authLoading,
    isAuthenticated: !!user && !!user.uid && !authLoading,
    user,
    savePurchase,
    getPurchaseHistory,
    getAllPurchaseHistory, // New method
    saveProfile,
    getProfile,
    saveChat,
    getChat,
    saveProAnalysis,
    getProAnalyses,
    // Real-time listeners
    subscribeToProfile,
    subscribeToPurchaseHistory,
    subscribeToChatHistory
  };
};