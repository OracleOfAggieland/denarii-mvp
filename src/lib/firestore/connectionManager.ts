import { db } from '@/lib/firebase';
import { enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';

export class FirestoreConnectionManager {
  private static instance: FirestoreConnectionManager;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private listeners: Set<(connected: boolean) => void> = new Set();

  private constructor() {
    this.initializeConnection();
    this.setupNetworkListeners();
  }

  public static getInstance(): FirestoreConnectionManager {
    if (!FirestoreConnectionManager.instance) {
      FirestoreConnectionManager.instance = new FirestoreConnectionManager();
    }
    return FirestoreConnectionManager.instance;
  }

  private async initializeConnection(): Promise<void> {
    if (!db) {
      console.error('Firestore database not initialized');
      return;
    }

    try {
      // Test connection by enabling network
      await enableNetwork(db);
      this.isConnected = true;
      this.retryCount = 0;
      this.notifyListeners();
      console.log('Firestore connection established');
    } catch (error: any) {
      console.error('Failed to establish Firestore connection:', error);
      this.isConnected = false;
      this.notifyListeners();
      
      // Check if it's a retryable error
      const isRetryableError = error?.code === 'unavailable' || 
                              error?.code === 'deadline-exceeded' ||
                              error?.message?.includes('transport') ||
                              error?.message?.includes('network') ||
                              error?.message?.includes('connection');
      
      // Retry with exponential backoff only for retryable errors
      if (this.retryCount < this.maxRetries && isRetryableError) {
        const delay = Math.pow(2, this.retryCount) * 1000;
        this.retryCount++;
        console.log(`Retrying connection in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
        setTimeout(() => this.initializeConnection(), delay);
      } else if (!isRetryableError) {
        console.error('Non-retryable connection error, stopping retry attempts');
      } else {
        console.error('Max connection retries reached, giving up');
      }
    }
  }

  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private async handleOnline(): Promise<void> {
    console.log('Network came online, reconnecting Firestore...');
    if (db && !this.isConnected) {
      try {
        await enableNetwork(db);
        this.isConnected = true;
        this.retryCount = 0;
        this.notifyListeners();
        console.log('Firestore reconnected');
      } catch (error) {
        console.error('Failed to reconnect Firestore:', error);
      }
    }
  }

  private async handleOffline(): Promise<void> {
    console.log('Network went offline, disabling Firestore network...');
    if (db && this.isConnected) {
      try {
        await disableNetwork(db);
        this.isConnected = false;
        this.notifyListeners();
        console.log('Firestore network disabled');
      } catch (error) {
        console.error('Failed to disable Firestore network:', error);
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isConnected));
  }

  public addConnectionListener(callback: (connected: boolean) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current status
    callback(this.isConnected);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  public async ensureConnection(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    if (this.connectionPromise) {
      await this.connectionPromise;
      return this.isConnected;
    }

    this.connectionPromise = this.initializeConnection();
    await this.connectionPromise;
    this.connectionPromise = null;
    
    return this.isConnected;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public async forceReconnect(): Promise<void> {
    this.retryCount = 0;
    await this.initializeConnection();
  }
}

// Export singleton instance
export const connectionManager = FirestoreConnectionManager.getInstance();