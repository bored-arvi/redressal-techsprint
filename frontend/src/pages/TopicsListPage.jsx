// frontend/src/pages/TopicsListPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import TopicItem from '../components/topics/TopicItem';
import CreateTopicModal from '../components/common/CreateTopicModal';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TopicsListPage = ({ onTopicClick, onNavigate }) => {
  const { token } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/topics`, { headers });
      const data = await res.json();
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTopics();
  }, [token]);

  return (
    <>
      <Header onNavigate={onNavigate} currentView="topics" />
      <div className="page-content">
        <div className="container">
          <div className="page-header">
            <div className="page-title-section">
              <h1>Community Topics</h1>
              <p className="page-subtitle">Join the discussion and share your thoughts</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <span>+</span> Create Post
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading topics...</div>
          ) : (
            <div className="topics-list">
              {topics.map(topic => (
                <TopicItem key={topic.id} topic={topic} onClick={onTopicClick} />
              ))}

              {topics.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No topics yet</h3>
                  <p>Be the first to start a discussion</p>
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Topic</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CreateTopicModal 
          onClose={() => setShowModal(false)}
          onCreated={loadTopics}
        />
      )}
    </>
  );
};

export default TopicsListPage;