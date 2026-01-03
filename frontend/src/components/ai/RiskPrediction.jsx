// frontend/src/components/ai/RiskPrediction.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const RiskPrediction = ({ topicId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    loadPrediction();
  }, [topicId]);

  const loadPrediction = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/predictions/${topicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPrediction(data.predictions);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ai-loading">Analyzing risk...</div>;
  if (!prediction) return null;

  return (
    <div className={`risk-prediction risk-${prediction.risk_level}`}>
      <h3>⚠️ Escalation Risk</h3>
      <div className="risk-score-display">{(prediction.risk_score * 100).toFixed(0)}%</div>
      <div className="risk-level">{prediction.risk_level.toUpperCase()}</div>
      <div className="risk-factors">
        <div className="factor">
          <span>Sentiment Impact:</span>
          <span>{(prediction.factors.sentiment * 100).toFixed(0)}%</span>
        </div>
        <div className="factor">
          <span>Activity Rate:</span>
          <span>{(prediction.factors.velocity * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default RiskPrediction;