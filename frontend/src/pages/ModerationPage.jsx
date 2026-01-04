// frontend/src/pages/ModerationPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ModerationPage = ({ onNavigate }) => {
  const { token } = useAuth();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [moderationData, setModerationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingModeration, setLoadingModeration] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/topics`, { headers });
      const data = await res.json();
      // Sort by sentiment score (most negative first) for moderation
      const sorted = data.sort((a, b) => a.sentiment_score - b.sentiment_score);
      setTopics(sorted);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTopics();
  }, [token]);

  const loadModeration = async (topicId) => {
    setLoadingModeration(true);
    setSelectedTopic(topicId);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/moderation/topic/${topicId}`, { headers });
      const data = await res.json();
      setModerationData(data);
    } catch (error) {
      console.error('Failed to load moderation data:', error);
      alert('Failed to load moderation data');
    }
    setLoadingModeration(false);
  };

  const handleModerationAction = async (action) => {
    if (!selectedTopic || actionLoading) return;
    if (!token) {
      alert('Please login to perform moderation actions');
      return;
    }
    
    setActionLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/moderation/topic/${selectedTopic}/${action}`, {
        method: 'POST',
        headers
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || `Topic ${action} successfully!`);
        // Reload topics and moderation data
        await loadTopics();
        await loadModeration(selectedTopic);
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${action} topic`);
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      alert(`Network error while trying to ${action} topic`);
    }
    setActionLoading(false);
  };

  const getSentimentColor = (score) => {
    if (score <= -5) return 'critical';
    if (score < 0) return 'negative';
    if (score > 0) return 'positive';
    return 'neutral';
  };

  const getCurrentTopicData = () => {
    return topics.find(t => t.id === selectedTopic);
  };

  const topicData = getCurrentTopicData();

  const formatAISuggestions = (text) => {
    if (!text) return <p>No AI suggestions available.</p>;
    
    const lines = text.split('\n');
    const formatted = [];
    let currentSection = [];
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed === '---' || trimmed.startsWith('*   *')) return;
      
      if (trimmed.startsWith('###')) {
        if (currentSection.length > 0) {
          formatted.push(<div key={`section-${idx}`} className="suggestion-section">{currentSection}</div>);
          currentSection = [];
        }
        const headerText = trimmed.replace(/^###\s*/, '').replace(/\*\*/g, '');
        currentSection.push(<h4 key={`h-${idx}`} className="suggestion-header">{headerText}</h4>);
      }
      else if (trimmed.startsWith('####')) {
        const headerText = trimmed.replace(/^####\s*/, '').replace(/\*\*/g, '');
        currentSection.push(<h5 key={`h5-${idx}`} className="suggestion-subheader">{headerText}</h5>);
      }
      else if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const text = trimmed.replace(/^[*-]\s*/, '').replace(/\*\*/g, '');
        if (text.length > 10) {
          currentSection.push(<li key={`li-${idx}`}>{text}</li>);
        }
      }
      else if (trimmed.length > 20) {
        const text = trimmed.replace(/\*\*/g, '');
        currentSection.push(<p key={`p-${idx}`}>{text}</p>);
      }
    });
    
    if (currentSection.length > 0) {
      formatted.push(<div key="final-section" className="suggestion-section">{currentSection}</div>);
    }
    
    return formatted.length > 0 ? formatted : <p>{text}</p>;
  };

  return (
    <>
      <Header onNavigate={onNavigate} currentView="moderate" />
      <div className="page-content">
        <div className="container">
          <div className="page-header">
            <div className="page-title-section">
              <h1>🛡️ Moderation Dashboard</h1>
              <p className="page-subtitle">AI-powered insights for community management</p>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading topics...</div>
          ) : (
            <div className="moderation-layout">
              <div className="moderation-sidebar">
                <h3>Topics requiring attention</h3>
                <div className="moderation-topics-list">
                  {topics.map(topic => {
                    const sentimentClass = getSentimentColor(topic.sentiment_score);
                    return (
                      <div 
                        key={topic.id} 
                        className={`moderation-topic-item ${selectedTopic === topic.id ? 'active' : ''}`}
                        onClick={() => loadModeration(topic.id)}
                      >
                        <div className="moderation-topic-header">
                          <h4>{topic.title}</h4>
                          <span className={`sentiment-indicator ${sentimentClass}`}>
                            {topic.sentiment_score}
                          </span>
                        </div>
                        <div className="moderation-topic-stats">
                          <span className="stat-item positive">👍 {topic.positive_count}</span>
                          <span className="stat-item negative">👎 {topic.negative_count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="moderation-main">
                {!selectedTopic && (
                  <div className="moderation-empty">
                    <div className="empty-icon">👈</div>
                    <h3>Select a topic to view AI insights</h3>
                    <p>Choose a topic from the list to see detailed moderation recommendations</p>
                  </div>
                )}

                {loadingModeration && (
                  <div className="loading">Loading AI insights...</div>
                )}

                {moderationData && !loadingModeration && (
                  <div className="moderation-details">
                    <div className="moderation-card">
                      <h2>{moderationData.topic}</h2>
                      
                      <div className="moderation-stats-grid">
                        <div className="stat-card">
                          <div className="stat-label">Sentiment Score</div>
                          <div className={`stat-value ${getSentimentColor(moderationData.sentiment_score)}`}>
                            {moderationData.sentiment_score}
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-label">Positive Posts</div>
                          <div className="stat-value positive">{moderationData.positive_posts}</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-label">Negative Posts</div>
                          <div className="stat-value negative">{moderationData.negative_posts}</div>
                        </div>
                      </div>

                      <div className="ai-suggestions">
                        <h3>AI Recommendations</h3>
                        <div className="suggestions-content">
                          {formatAISuggestions(moderationData.ai_suggestions)}
                        </div>
                      </div>

                      <div className="moderation-actions">
                        <h3>Moderation Actions</h3>
                        <div className="action-buttons">
                          <button 
                            className="action-btn priority-high"
                            onClick={() => handleModerationAction('priority')}
                            disabled={actionLoading || topicData?.priority === 'high'}
                          >
                             {topicData?.priority === 'high' ? 'Priority Set' : 'Mark as Priority'}
                          </button>
                          <button 
                            className="action-btn resolve"
                            onClick={() => handleModerationAction('resolve')}
                            disabled={actionLoading || topicData?.status === 'resolved'}
                          >
                            {topicData?.status === 'resolved' ? 'Already Resolved' : 'Mark as Resolved'}
                          </button>
                          <button 
                            className="action-btn escalate"
                            onClick={() => handleModerationAction('escalate')}
                            disabled={actionLoading}
                          >
                            Escalate to Admin
                          </button>
                          <button 
                            className="action-btn archive"
                            onClick={() => handleModerationAction('archive')}
                            disabled={actionLoading || topicData?.status === 'archived'}
                          >
                            {topicData?.status === 'archived' ? 'Already Archived' : 'Archive Topic'}
                          </button>
                        </div>
                        {topicData?.status && (
                          <div className="current-status">
                            <span className="status-label">Current Status:</span>
                            <span className={`status-badge ${topicData.status}`}>
                              {topicData.status.toUpperCase()}
                            </span>
                            {topicData.priority && topicData.priority !== 'normal' && (
                              <>
                                <span className="status-label">Priority:</span>
                                <span className={`status-badge priority-${topicData.priority}`}>
                                  {topicData.priority.toUpperCase()}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModerationPage;