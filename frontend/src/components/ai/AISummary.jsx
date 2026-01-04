// frontend/src/components/ai/AISummary.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AISummary = ({ topicId, postCount = 0 }) => {
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const { token, loading: authLoading } = useAuth();
  const MIN_POSTS_FOR_SUMMARY = 3;

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setSummary('');
      setSummaryLoading(false);
      return;
    }

    if (postCount < MIN_POSTS_FOR_SUMMARY) {
      setSummaryLoading(false);
      setSummary('');
      return;
    }

    loadSummary();
  }, [topicId, token, postCount, authLoading]);


  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/ai/summary/${topicId}`, { headers });
      if (!res.ok) {
        const err = await res.json();
        console.warn('AI summary request failed:', err);
        setSummary('');
      } else {
        const data = await res.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to load summary:', error);
      setSummary('');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (summaryLoading) return <div className="ai-loading">Generating AI summary...</div>;
  if (!summary) return null;

  return (
    <div className="ai-summary">
      <h3>🤖 AI Summary</h3>
      <p>{summary}</p>
    </div>
  );
};

export default AISummary;