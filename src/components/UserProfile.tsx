'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="user-profile">
      <button 
        className="user-profile-button"
        onClick={toggleDropdown}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            className="user-avatar"
          />
        ) : (
          <div className="user-avatar-placeholder">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="user-name">
          {user.displayName || user.email}
        </span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="user-info">
            <p className="user-display-name">
              {user.displayName || 'User'}
            </p>
            <p className="user-email">{user.email}</p>
          </div>
          <hr className="dropdown-divider" />
          <button 
            className="sign-out-button"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}

      {isDropdownOpen && (
        <div 
          className="dropdown-overlay"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;