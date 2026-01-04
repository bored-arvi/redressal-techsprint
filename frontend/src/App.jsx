// frontend/src/App.jsx - REFACTORED VERSION
import React, { useState } from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import TopicsListPage from './pages/TopicsListPage';
import TopicDetailPage from './pages/TopicDetailPage';
import ModerationPage from './pages/ModerationPage';
import { useAuth } from './context/AuthContext';

// Main app content that uses auth
const AppContent = () => {
  const [currentView, setCurrentView] = useState('topics');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const { token, loading } = useAuth();

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view === 'topics') {
      setSelectedTopicId(null);
    }
  };

  const handleTopicClick = (id) => {
    setSelectedTopicId(id);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('topics');
    setSelectedTopicId(null);
  };

  // While auth is resolving (checking token), show loading to avoid
  // briefly showing protected content with an invalid token.
  if (loading) {
    return <div className="loading">Checking authentication…</div>;
  }

  if (!token) {
    return <AuthPage />;
  }

  switch (currentView) {
    case 'topics':
      return <TopicsListPage onTopicClick={handleTopicClick} onNavigate={handleNavigate} />;
    case 'detail':
      return <TopicDetailPage topicId={selectedTopicId} onBack={handleBack} onNavigate={handleNavigate} />;
    case 'moderate':
      return <ModerationPage onNavigate={handleNavigate} />;
    default:
      return <TopicsListPage onTopicClick={handleTopicClick} onNavigate={handleNavigate} />;
  }
};

// Main App component that provides Auth context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;