// src/hooks/useFirestore.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
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
import { operationManager } from '@/lib/firestore/operationManager';

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

  // Clear user-specific cache on logout
  useEffect(() => {
    if (!user) {
      operationManager.clearCache();
    }
  }, [user]);

  // Purchase History
  const savePurchase = useCallback(async (purchaseData: Omit<PurchaseHistoryItem, 'userId' | 'createdAt'>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      await savePurchaseHistory(user.uid, purchaseData);
      operationManager.clearCache(`purchase-history-${user.uid}`);
    } catch (err: any) {
      setError('Failed to save purchase history');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Enhanced getPurchaseHistory with optional limit parameter
  const getPurchaseHistory = useCallback(async (limitCount?: number): Promise<PurchaseHistoryItem[]> => {
    if (!user) return [];

    setIsLoading(true);
    setError(null);

    try {
      return await getUserPurchaseHistory(user.uid, limitCount);
    } catch (err) {
      setError('Failed to load purchase history');
      return [];
    } finally {
      setIsLoading(false);
    }
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

      const operation = async () => {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          date: doc.data().date.toDate()
        } as unknown as PurchaseHistoryItem));
      };

      return await operationManager.executeOperation(
        `all-purchase-history-${user.uid}`,
        operation,
        {},
        300000 // Cache for 5 minutes
      );
    } catch (err) {
      setError('Failed to load all purchase history');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Financial Profile
  const saveProfile = useCallback(async (profileData: Omit<FinancialProfileData, 'userId' | 'lastUpdated'>) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      await saveFinancialProfile(user.uid, profileData);
    } catch (err) {
      setError('Failed to save financial profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getProfile = useCallback(async (): Promise<FinancialProfileData | null> => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      return await getFinancialProfile(user.uid);
    } catch (err) {
      setError('Failed to load financial profile');
      return null;
    } finally {
      setIsLoading(false);
    }
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

      // Update cache with real-time data
      operationManager.clearCache(`purchase-history-${user.uid}`);
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

        // Update cache with real-time data
        operationManager.clearCache(`chat-${user.uid}`);
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
    getAllPurchaseHistory,
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