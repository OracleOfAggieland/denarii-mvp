import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

const FirestoreConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const runConnectionTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      addResult('Starting Firestore connection test...');

      // Test 1: Check if db is initialized
      if (!db) {
        addResult('❌ Firestore database not initialized');
        return;
      }
      addResult('✅ Firestore database initialized');

      // Test 2: Check authentication
      if (!user) {
        addResult('❌ User not authenticated');
        return;
      }
      addResult(`✅ User authenticated: ${user.uid}`);

      // Test 3: Try to write a test document
      const testDocRef = doc(db, 'connectionTest', user.uid);
      const testData = {
        timestamp: new Date(),
        testMessage: 'Connection test',
        userId: user.uid
      };

      addResult('Attempting to write test document...');
      await setDoc(testDocRef, testData);
      addResult('✅ Test document written successfully');

      // Test 4: Try to read the document back
      addResult('Attempting to read test document...');
      const docSnap = await getDoc(testDocRef);
      if (docSnap.exists()) {
        addResult('✅ Test document read successfully');
        addResult(`Document data: ${JSON.stringify(docSnap.data())}`);
      } else {
        addResult('❌ Test document not found');
      }

      // Test 5: Clean up - delete the test document
      addResult('Cleaning up test document...');
      await deleteDoc(testDocRef);
      addResult('✅ Test document deleted successfully');

      addResult('🎉 All tests passed! Firestore connection is working.');

    } catch (error: any) {
      addResult(`❌ Test failed: ${error.message}`);
      addResult(`Error code: ${error.code || 'unknown'}`);
      addResult(`Error details: ${JSON.stringify(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h4>Firestore Connection Test</h4>
      <button
        onClick={runConnectionTest}
        disabled={isRunning}
        style={{ marginBottom: '10px' }}
      >
        {isRunning ? 'Running...' : 'Run Test'}
      </button>

      <div style={{
        background: '#f5f5f5',
        padding: '5px',
        borderRadius: '3px',
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        {testResults.map((result, index) => (
          <div key={index} style={{ marginBottom: '2px' }}>
            {result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirestoreConnectionTest;