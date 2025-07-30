import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '@/hooks/useFirestore';

export interface LocalStorageData {
  quickFinancialProfile?: any;
  purchaseHistory?: any[];
  chatHistory?: any[];
  proModeAnalyses?: any[];
}

export const migrateLocalStorageToFirestore = async (
  user: any,
  firestoreHooks: {
    saveProfile: (data: any) => Promise<void>;
    savePurchase: (data: any) => Promise<void>;
    saveChat: (data: any) => Promise<void>;
    saveProAnalysis: (data: any) => Promise<void>;
  }
): Promise<void> => {
  if (!user) {
    console.warn('Cannot migrate data: user not authenticated');
    return;
  }

  const { saveProfile, savePurchase, saveChat, saveProAnalysis } = firestoreHooks;

  try {
    // Migrate financial profile
    const quickProfile = localStorage.getItem('quickFinancialProfile');
    if (quickProfile) {
      const profileData = JSON.parse(quickProfile);
      
      // Convert quick profile to full profile format
      const fullProfile = {
        monthlyIncome: profileData.monthlyIncome || "",
        incomeFrequency: "monthly",
        otherIncomeSources: "",
        housingCost: "",
        utilitiesCost: "",
        foodCost: "",
        transportationCost: "",
        insuranceCost: "",
        subscriptionsCost: "",
        otherExpenses: profileData.monthlyExpenses || "",
        creditCardDebt: "",
        creditCardPayment: profileData.debtPayments || "",
        studentLoanDebt: "",
        studentLoanPayment: "",
        carLoanDebt: "",
        carLoanPayment: "",
        mortgageDebt: "",
        mortgagePayment: "",
        otherDebt: "",
        otherDebtPayment: "",
        creditScore: "",
        creditLimit: "",
        currentCreditBalance: "",
        checkingSavingsBalance: profileData.currentSavings || "",
        emergencyFund: profileData.hasEmergencyFund === 'yes' ? profileData.currentSavings || "0" : "0",
        retirementAccounts: "",
        stocksAndBonds: "",
        realEstateValue: "",
        otherInvestments: "",
        shortTermGoals: "",
        midTermGoals: "",
        longTermGoals: "",
        purchaseTimeframe: "",
        riskTolerance: profileData.riskTolerance || "moderate",
        financialPriorities: profileData.financialGoal || "",
        summary: profileData.summary || {}
      };

      await saveProfile(fullProfile);
      console.log('Financial profile migrated to Firestore');
    }

    // Migrate purchase history
    const purchaseHistory = localStorage.getItem('purchaseHistory');
    if (purchaseHistory) {
      const purchases = JSON.parse(purchaseHistory);
      for (const purchase of purchases) {
        await savePurchase({
          date: new Date(purchase.date || Date.now()),
          itemName: purchase.itemName || purchase.item || 'Unknown Item',
          itemCost: purchase.itemCost || purchase.cost || 0,
          decision: purchase.decision || 'unknown',
          savings: purchase.savings || 0,
          alternative: purchase.alternative || null,
          analysisDetails: purchase.analysisDetails || null
        });
      }
      console.log(`${purchases.length} purchase history items migrated to Firestore`);
    }

    // Migrate chat history
    const chatHistory = localStorage.getItem('chatHistory');
    if (chatHistory) {
      const messages = JSON.parse(chatHistory);
      const formattedMessages = messages.map((msg: any, index: number) => ({
        id: msg.id || `msg_${index}`,
        role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
        content: msg.content || msg.message || '',
        timestamp: new Date(msg.timestamp || Date.now()),
        isVoice: msg.isVoice || false
      }));

      await saveChat(formattedMessages);
      console.log('Chat history migrated to Firestore');
    }

    // Mark migration as complete
    localStorage.setItem('migrationCompleted', 'true');
    console.log('Data migration completed successfully');

  } catch (error) {
    console.error('Error during data migration:', error);
    throw error;
  }
};

export const shouldMigrate = (): boolean => {
  // Check if migration has already been completed
  if (localStorage.getItem('migrationCompleted') === 'true') {
    return false;
  }

  // Check if there's any data to migrate
  const hasQuickProfile = !!localStorage.getItem('quickFinancialProfile');
  const hasPurchaseHistory = !!localStorage.getItem('purchaseHistory');
  const hasChatHistory = !!localStorage.getItem('chatHistory');

  return hasQuickProfile || hasPurchaseHistory || hasChatHistory;
};

export const useMigration = () => {
  const { user } = useAuth();
  const { saveProfile, savePurchase, saveChat, saveProAnalysis } = useFirestore();

  const triggerMigration = async (): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to migrate data');
    }

    if (!shouldMigrate()) {
      console.log('No migration needed');
      return;
    }

    await migrateLocalStorageToFirestore(user, {
      saveProfile,
      savePurchase,
      saveChat,
      saveProAnalysis
    });
  };

  return {
    shouldMigrate: shouldMigrate(),
    triggerMigration,
    isAuthenticated: !!user
  };
};