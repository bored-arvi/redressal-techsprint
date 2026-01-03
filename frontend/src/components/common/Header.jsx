// frontend/src/components/common/Header.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onNavigate, currentView }) => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={() => onNavigate('topics')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span>Redressal</span>
          </div>
          <nav className="nav-items">
            {user && (
              <>
                <button 
                  className={`nav-btn ${currentView === 'topics' ? 'active' : ''}`}
                  onClick={() => onNavigate('topics')}
                >
                  Topics
                </button>
                {(user.role === 'moderator' || user.role === 'admin') && (
                  <button 
                    className={`nav-btn ${currentView === 'moderate' ? 'active' : ''}`}
                    onClick={() => onNavigate('moderate')}
                  >
                    🛡️ Moderate
                  </button>
                )}
                <button className="btn btn-secondary" onClick={logout}>
                  Sign out
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;