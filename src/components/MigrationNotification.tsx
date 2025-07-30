import React, { useState, useEffect } from 'react';
import { useMigration } from '../lib/firestore/migration';

const MigrationNotification: React.FC = () => {
  const { shouldMigrate, triggerMigration, isAuthenticated } = useMigration();
  const [isMigrating, setIsMigrating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isAuthenticated && shouldMigrate) {
      setShowNotification(true);
    }
  }, [isAuthenticated, shouldMigrate]);

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      await triggerMigration();
      setShowNotification(false);
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="migration-notification">
      <div className="migration-banner">
        <div className="migration-content">
          <span className="migration-icon">🔄</span>
          <div className="migration-text">
            <strong>Sync your data</strong>
            <p>We found local data that can be synced to your account for access across devices.</p>
          </div>
        </div>
        <div className="migration-actions">
          <button 
            onClick={handleMigrate} 
            disabled={isMigrating}
            className="migration-button primary"
          >
            {isMigrating ? 'Syncing...' : 'Sync Now'}
          </button>
          <button 
            onClick={handleDismiss}
            className="migration-button secondary"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default MigrationNotification;