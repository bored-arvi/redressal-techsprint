// frontend/src/components/ai/AISummary.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AISummary = ({ topicId }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    loadSummary();
  }, [topicId]);

  const loadSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/summary/${topicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ai-loading">Generating AI summary...</div>;
  if (!summary) return null;

  return (
    <div className="ai-summary">
      <h3>🤖 AI Summary</h3>
      <p>{summary}</p>
    </div>
  );
};

export default AISummary;