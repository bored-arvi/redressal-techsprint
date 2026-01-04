// frontend/src/components/ai/SimilarTopics.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SimilarTopics = ({ topicId }) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  //const { token } = useAuth();

  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!token) return;
    loadSimilar();
  }, [topicId, token, authLoading]);

  const loadSimilar = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/ai/similar/${topicId}`, { headers });
      const data = await res.json();
      setSimilar(data.similar_topics || []);
    } catch (error) {
      console.error('Failed to load similar topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ai-loading">Finding similar topics...</div>;
  if (similar.length === 0) return null;

  return (
    <div className="similar-topics">
      <h3>🔗 Related Discussions</h3>
      <div className="similar-list">
        {similar.map(topic => (
          <div key={topic.topic_id} className="similar-item">
            <span className="similar-title">{topic.title}</span>
            <span className="similarity-score">{(topic.similarity * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarTopics;