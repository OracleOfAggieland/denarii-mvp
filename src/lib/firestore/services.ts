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
    if (!db || !userId) return;
  
    const purchaseHistoryRef = collection(db, COLLECTIONS.PURCHASE_HISTORY);
    await addDoc(purchaseHistoryRef, {
      ...purchaseData,
      userId,
      date: Timestamp.fromDate(new Date(purchaseData.date)),
      createdAt: serverTimestamp()
    });
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
  
    const profileRef = doc(db, COLLECTIONS.FINANCIAL_PROFILES, userId);
    await setDoc(profileRef, {
      ...profileData,
      userId,
      lastUpdated: serverTimestamp()
    });
  };
  
  export const getFinancialProfile = async (
    userId: string
  ): Promise<FinancialProfileData | null> => {
    if (!db || !userId) return null;
  
    const profileRef = doc(db, COLLECTIONS.FINANCIAL_PROFILES, userId);
    const profileDoc = await getDoc(profileRef);
  
    if (!profileDoc.exists()) return null;
  
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