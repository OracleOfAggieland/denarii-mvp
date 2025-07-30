import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, collection, query, where, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
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
  const { user } = useAuth();
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
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      await savePurchaseHistory(user.uid, purchaseData);
    } catch (err) {
      setError('Failed to save purchase history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getPurchaseHistory = useCallback(async (): Promise<PurchaseHistoryItem[]> => {
    if (!user) return [];
    setIsLoading(true);
    setError(null);
    try {
      return await getUserPurchaseHistory(user.uid);
    } catch (err) {
      setError('Failed to load purchase history');
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
        date: doc.data().date.toDate()
      } as PurchaseHistoryItem));
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
    isAuthenticated: !!user,
    savePurchase,
    getPurchaseHistory,
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